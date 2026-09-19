import os, re, sys, json, time, tempfile, subprocess, threading, queue
from pathlib import Path
import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import av, ctranslate2, imageio_ffmpeg
from faster_whisper import WhisperModel

APP_NAME = "Genius SRT Creator"
WINDOW = 30.0
OVERLAP = 6.0
STRIDE = WINDOW - OVERLAP
DETECT_LEN = 6.0
EXTS = {".mp4",".mov",".mkv",".avi",".m4v",".mp3",".wav",".m4a"}

LANGS = {
    "Auto": None, "English":"en", "Hindi":"hi", "Marathi":"mr",
    "Gujarati":"gu", "Bengali":"bn", "Punjabi":"pa", "Tamil":"ta",
    "Telugu":"te", "Kannada":"kn", "Malayalam":"ml", "Urdu":"ur",
    "Odia":"or", "Assamese":"as"
}

def stamp(sec):
    ms = int(round(sec * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"

def media_duration(path):
    with av.open(str(path)) as container:
        if container.duration:
            return float(container.duration * av.time_base)
    return 0.0

def ffmpeg_extract(src, start, length, out):
    exe = imageio_ffmpeg.get_ffmpeg_exe()
    cmd = [exe, "-y", "-hide_banner", "-loglevel", "error",
           "-ss", str(start), "-i", str(src), "-t", str(length),
           "-vn", "-ac", "1", "-ar", "16000", "-af", "loudnorm", str(out)]
    kwargs = {"check": True}
    if os.name == "nt":
        kwargs["creationflags"] = 0x08000000
    subprocess.run(cmd, **kwargs)

class SRTApp:
    def __init__(self, root):
        self.root = root
        self.root.title(APP_NAME)
        self.root.geometry("860x720")
        self.root.minsize(780, 640)
        self.files = []
        self.q = queue.Queue()
        self.running = False

        main = ttk.Frame(root, padding=16)
        main.pack(fill="both", expand=True)

        title = ttk.Label(main, text=APP_NAME, font=("Segoe UI", 20, "bold"))
        title.pack(anchor="w")
        ttk.Label(main, text="Local multilingual video-to-SRT creator").pack(anchor="w", pady=(0,12))

        filebar = ttk.Frame(main)
        filebar.pack(fill="x")
        ttk.Button(filebar, text="Add Video(s)", command=self.add_files).pack(side="left")
        ttk.Button(filebar, text="Remove Selected", command=self.remove_selected).pack(side="left", padx=6)
        ttk.Button(filebar, text="Clear", command=self.clear_files).pack(side="left")

        self.listbox = tk.Listbox(main, height=7)
        self.listbox.pack(fill="x", pady=8)

        opts = ttk.LabelFrame(main, text="Transcription settings", padding=12)
        opts.pack(fill="x", pady=8)

        ttk.Label(opts, text="Accuracy").grid(row=0, column=0, sticky="w")
        self.accuracy = tk.StringVar(value="Maximum Accuracy - large-v3")
        ttk.Combobox(opts, textvariable=self.accuracy, state="readonly",
                     values=["Maximum Accuracy - large-v3","Balanced - medium","Fast - small"],
                     width=30).grid(row=0, column=1, sticky="ew", padx=8)

        ttk.Label(opts, text="Language").grid(row=1, column=0, sticky="w", pady=8)
        self.language = tk.StringVar(value="Auto")
        ttk.Combobox(opts, textvariable=self.language, state="readonly",
                     values=list(LANGS.keys()), width=30).grid(row=1, column=1, sticky="ew", padx=8)

        self.include_title = tk.BooleanVar(value=True)
        ttk.Checkbutton(opts, text="Add main title from video filename",
                        variable=self.include_title).grid(row=2, column=1, sticky="w", padx=8)

        ttk.Label(opts, text="Output folder").grid(row=3, column=0, sticky="w", pady=8)
        self.output_var = tk.StringVar()
        ttk.Entry(opts, textvariable=self.output_var).grid(row=3, column=1, sticky="ew", padx=8)
        ttk.Button(opts, text="Browse", command=self.choose_output).grid(row=3, column=2)

        opts.columnconfigure(1, weight=1)

        glossary_box = ttk.LabelFrame(main, text="Spelling glossary / proper words", padding=10)
        glossary_box.pack(fill="x", pady=8)
        ttk.Label(glossary_box, text="Add names, brands, chapter terms or regional words exactly as they should be spelled.").pack(anchor="w")
        self.glossary = tk.Text(glossary_box, height=4, wrap="word")
        self.glossary.pack(fill="x", pady=(6,0))

        controls = ttk.Frame(main)
        controls.pack(fill="x", pady=(10,6))
        self.start_btn = ttk.Button(controls, text="Create SRT", command=self.start)
        self.start_btn.pack(side="left")
        self.progress = ttk.Progressbar(controls, mode="determinate", maximum=100)
        self.progress.pack(side="left", fill="x", expand=True, padx=10)
        self.status = ttk.Label(controls, text="Ready")
        self.status.pack(side="right")

        logbox = ttk.LabelFrame(main, text="Progress", padding=8)
        logbox.pack(fill="both", expand=True)
        self.log = tk.Text(logbox, height=12, wrap="word", state="disabled")
        self.log.pack(fill="both", expand=True)

        self.root.after(150, self.pump_queue)

    def add_files(self):
        paths = filedialog.askopenfilenames(
            title="Select video/audio files",
            filetypes=[("Media files","*.mp4 *.mov *.mkv *.avi *.m4v *.mp3 *.wav *.m4a"),("All files","*.*")]
        )
        for p in paths:
            if p not in self.files:
                self.files.append(p)
                self.listbox.insert("end", p)

    def remove_selected(self):
        indices = list(self.listbox.curselection())
        for i in reversed(indices):
            self.files.pop(i)
            self.listbox.delete(i)

    def clear_files(self):
        self.files.clear()
        self.listbox.delete(0, "end")

    def choose_output(self):
        folder = filedialog.askdirectory(title="Choose output folder")
        if folder:
            self.output_var.set(folder)

    def emit(self, kind, value):
        self.q.put((kind, value))

    def pump_queue(self):
        try:
            while True:
                kind, value = self.q.get_nowait()
                if kind == "log":
                    self.log.configure(state="normal")
                    self.log.insert("end", value + "\n")
                    self.log.see("end")
                    self.log.configure(state="disabled")
                elif kind == "status":
                    self.status.configure(text=value)
                elif kind == "progress":
                    self.progress["value"] = value
                elif kind == "done":
                    self.running = False
                    self.start_btn.configure(state="normal")
                    messagebox.showinfo(APP_NAME, value)
                elif kind == "error":
                    self.running = False
                    self.start_btn.configure(state="normal")
                    messagebox.showerror(APP_NAME, value)
        except queue.Empty:
            pass
        self.root.after(150, self.pump_queue)

    def start(self):
        if self.running:
            return
        if not self.files:
            messagebox.showwarning(APP_NAME, "Add at least one video or audio file.")
            return
        self.running = True
        self.start_btn.configure(state="disabled")
        self.progress["value"] = 0
        threading.Thread(target=self.worker, daemon=True).start()

    def detect_language(self, src, dur, detector, td):
        starts = sorted(set(max(0.0, min(max(0.0, dur-DETECT_LEN), dur*p)) for p in (0.20,0.50,0.80)))
        votes = {}
        details = []
        for n, start in enumerate(starts):
            wav = Path(td) / f"detect_{n}.wav"
            ffmpeg_extract(src, start, DETECT_LEN, wav)
            segs, info = detector.transcribe(str(wav), beam_size=1, vad_filter=False, condition_on_previous_text=False)
            text = " ".join(s.text.strip() for s in segs if s.text.strip())
            prob = float(info.language_probability or 0.0)
            if text:
                weight = max(0.05, prob) * min(2.0, max(0.5, len(text)/30))
                votes[info.language] = votes.get(info.language, 0.0) + weight
            details.append((start, info.language, prob, text[:80]))
        lang = max(votes, key=votes.get) if votes else "en"
        return lang, details

    def transcribe_file(self, src, outdir, model, detector, lang_override, glossary):
        src = Path(src)
        dur = media_duration(src)
        rows = []
        self.emit("log", f"Processing: {src.name}")
        with tempfile.TemporaryDirectory() as td:
            if lang_override:
                lang = lang_override
                self.emit("log", f"Language locked: {lang}")
            else:
                lang, details = self.detect_language(src, dur, detector, td)
                self.emit("log", f"Detected language: {lang}")
                for st, lc, pr, txt in details:
                    self.emit("log", f"  sample {st:.0f}s -> {lc} ({pr:.2f}) {txt}")

            start = 0.0
            while start < dur:
                wav = Path(td) / f"chunk_{int(start):05}.wav"
                ffmpeg_extract(src, start, WINDOW, wav)
                kwargs = dict(
                    language=lang, beam_size=8, best_of=8, patience=1.2,
                    vad_filter=False, condition_on_previous_text=False,
                    word_timestamps=True
                )
                if glossary:
                    kwargs["hotwords"] = glossary
                    kwargs["initial_prompt"] = glossary
                segs, _ = model.transcribe(str(wav), **kwargs)

                chunk_end = min(start + WINDOW, dur)
                keep_start = 0.0 if start == 0 else start + OVERLAP/2
                keep_end = dur if chunk_end >= dur else chunk_end - OVERLAP/2

                for seg in segs:
                    words = getattr(seg, "words", None) or []
                    if words:
                        group = []
                        for w in words:
                            a = start + w.start
                            b = start + w.end
                            mid = (a+b)/2
                            if keep_start <= mid <= keep_end:
                                group.append((a,b,w.word))
                                joined = "".join(x[2] for x in group).strip()
                                if len(joined) >= 42 or (group[-1][1]-group[0][0]) >= 3.8 or re.search(r"[.!?।]$", joined):
                                    rows.append((group[0][0], group[-1][1], joined))
                                    group = []
                        if group:
                            rows.append((group[0][0], group[-1][1], "".join(x[2] for x in group).strip()))
                    else:
                        t = seg.text.strip()
                        a, b = start + seg.start, start + seg.end
                        if t and keep_start <= (a+b)/2 <= keep_end:
                            rows.append((a,b,t))
                start += STRIDE
                self.emit("progress", min(99, int((start/max(dur,0.1))*100)))

        rows.sort(key=lambda x: x[0])
        cues = []
        if self.include_title.get():
            first_voice = rows[0][0] if rows else 3.0
            title_end = max(1.5, min(3.5, first_voice - 0.15)) if first_voice > 0.4 else 1.5
            cues.append((0.0, title_end, src.stem.strip()))
        cues.extend(rows)

        out = Path(outdir) / f"{src.stem}.srt"
        with out.open("w", encoding="utf-8-sig") as f:
            for i, (a,b,t) in enumerate(cues, 1):
                if b <= a:
                    b = a + 0.8
                f.write(f"{i}\n{stamp(a)} --> {stamp(b)}\n{t}\n\n")
        self.emit("log", f"Saved: {out}")
        return out

    def worker(self):
        try:
            accuracy = self.accuracy.get()
            model_name = "large-v3" if accuracy.startswith("Maximum") else ("medium" if accuracy.startswith("Balanced") else "small")
            lang_override = LANGS.get(self.language.get())
            glossary = self.glossary.get("1.0", "end").strip()
            outdir = self.output_var.get().strip()
            if not outdir:
                outdir = str(Path(self.files[0]).parent)
            Path(outdir).mkdir(parents=True, exist_ok=True)

            use_cuda = ctranslate2.get_cuda_device_count() > 0
            device = "cuda" if use_cuda else "cpu"
            compute = "float16" if use_cuda else "int8"
            self.emit("log", f"Device: {device} / {compute}")
            self.emit("status", "Loading detector")
            detector = WhisperModel("small", device=device, compute_type=compute)
            self.emit("status", f"Loading {model_name}")
            model = WhisperModel(model_name, device=device, compute_type=compute)

            total = len(self.files)
            for idx, src in enumerate(self.files, 1):
                self.emit("status", f"{idx}/{total}: {Path(src).name}")
                self.transcribe_file(src, outdir, model, detector, lang_override, glossary)
            self.emit("progress", 100)
            self.emit("status", "Done")
            self.emit("done", f"Finished {total} file(s).\nSRT files saved to:\n{outdir}")
        except Exception as e:
            self.emit("error", f"{type(e).__name__}: {e}")

if __name__ == "__main__":
    os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")
    root = tk.Tk()
    try:
        ttk.Style().theme_use("vista")
    except Exception:
        pass
    SRTApp(root)
    root.mainloop()