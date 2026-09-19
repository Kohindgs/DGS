import os, re, sys, json, time, tempfile, subprocess, threading, queue, base64, html, webbrowser, difflib
from pathlib import Path
import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import av, ctranslate2
from faster_whisper import WhisperModel
from faster_whisper.audio import decode_audio

APP_NAME = "Genius SRT Creator"
WINDOW = 20.0
OVERLAP = 3.0
STRIDE = WINDOW - OVERLAP
DETECT_LEN = 10.0
EXTS = {".mp4",".mov",".mkv",".avi",".m4v",".mp3",".wav",".m4a"}

LANGS = {
    "Auto": None, "English":"en", "Hindi":"hi", "Marathi":"mr",
    "Gujarati":"gu", "Bengali":"bn", "Punjabi":"pa", "Tamil":"ta",
    "Telugu":"te", "Kannada":"kn", "Malayalam":"ml", "Urdu":"ur",
    "Odia":"or", "Assamese":"as", "Sanskrit":"sa"
}

LANG_HINTS = {
    "english":"en", "eng":"en",
    "hindi":"hi", "हिंदी":"hi",
    "marathi":"mr", "मराठी":"mr",
    "gujarati":"gu", "ગુજરાતી":"gu",
    "bengali":"bn", "bangla":"bn", "বাংলা":"bn",
    "punjabi":"pa", "ਪੰਜਾਬੀ":"pa",
    "tamil":"ta", "தமிழ்":"ta",
    "telugu":"te", "తెలుగు":"te",
    "kannada":"kn", "ಕನ್ನಡ":"kn",
    "malayalam":"ml", "മലയാളം":"ml",
    "urdu":"ur", "اردو":"ur",
    "odia":"or", "oriya":"or", "ଓଡ଼ିଆ":"or",
    "assamese":"as", "অসমীয়া":"as",
    "sanskrit":"sa", "संस्कृत":"sa"
}

def filename_language_hint(path):
    name = Path(path).stem.lower()
    matches = []
    for key, code in LANG_HINTS.items():
        pos = name.rfind(key)
        if pos >= 0:
            matches.append((pos, len(key), code, key))
    if not matches:
        return None
    matches.sort(key=lambda x: (x[0], x[1]))
    return matches[-1][2]

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

class SRTApp:
    def __init__(self, root):
        self.root = root
        self.root.title(APP_NAME)
        self.root.geometry("860x720")
        self.root.minsize(780, 640)
        self.files = []
        self.q = queue.Queue()
        self.running = False
        self.generated_pairs = []

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
        self.accuracy = tk.StringVar(value="Auto Recommended")
        ttk.Combobox(opts, textvariable=self.accuracy, state="readonly",
                     values=["Auto Recommended","Maximum Accuracy - large-v3","Balanced - medium","Fast - small"],
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
        self.preview_btn = ttk.Button(controls, text="Preview Video + SRT", command=self.preview_selected, state="disabled")
        self.preview_btn.pack(side="left", padx=(8,0))
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

    def srt_to_vtt(self, srt_path):
        text = Path(srt_path).read_text(encoding="utf-8-sig")
        text = re.sub(r"(\d{2}:\d{2}:\d{2}),(\d{3})", r"\1.\2", text)
        return "WEBVTT\n\n" + text

    def preview_selected(self):
        if not self.generated_pairs:
            messagebox.showwarning(APP_NAME, "Create an SRT first.")
            return
        video_path, srt_path = self.generated_pairs[-1]
        try:
            vtt = self.srt_to_vtt(srt_path)
            video_uri = Path(video_path).resolve().as_uri()
            vtt_b64 = base64.b64encode(vtt.encode("utf-8")).decode("ascii")
            title = html.escape(Path(video_path).stem)
            page = f"""<!doctype html><html><head><meta charset=\"utf-8\"><title>{title} - Subtitle Preview</title>
<style>body{{margin:0;background:#111;color:#fff;font-family:Arial,sans-serif}}.wrap{{max-width:1200px;margin:20px auto;padding:0 16px}}video{{width:100%;max-height:78vh;background:#000}}h2{{font-size:18px;font-weight:600}}p{{color:#bbb}}button{{padding:10px 14px;margin-right:8px}}</style></head><body><div class=\"wrap\"><h2>{title}</h2><p>Preview only — subtitles are not burned into the video. Use the controls to pause and scrub for sync checking.</p><video id=\"player\" controls autoplay><source src=\"{video_uri}\"></video><p><button id=\"toggle\">Subtitles On/Off</button><button id=\"back\">-5 sec</button><button id=\"forward\">+5 sec</button></p></div><script>
const v=document.getElementById('player');
const txt=atob('{vtt_b64}');
const bytes=Uint8Array.from(txt,c=>c.charCodeAt(0));
const blob=new Blob([bytes],{{type:'text/vtt'}});
const track=document.createElement('track');
track.kind='subtitles'; track.label='Generated SRT'; track.srclang='auto'; track.default=true; track.src=URL.createObjectURL(blob);
v.appendChild(track);
v.addEventListener('loadedmetadata',()=>{{if(v.textTracks[0])v.textTracks[0].mode='showing';}});
document.getElementById('toggle').onclick=()=>{{if(!v.textTracks[0])return;v.textTracks[0].mode=v.textTracks[0].mode==='showing'?'hidden':'showing';}};
document.getElementById('back').onclick=()=>{{v.currentTime=Math.max(0,v.currentTime-5);}};
document.getElementById('forward').onclick=()=>{{v.currentTime=Math.min(v.duration||v.currentTime+5,v.currentTime+5);}};
</script></body></html>"""
            preview_dir = Path(tempfile.gettempdir()) / "GeniusSRTPreview"
            preview_dir.mkdir(parents=True, exist_ok=True)
            html_path = preview_dir / "preview.html"
            html_path.write_text(page, encoding="utf-8")
            webbrowser.open(html_path.as_uri())
        except Exception as e:
            messagebox.showerror(APP_NAME, f"Preview failed: {e}")

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
                elif kind == "preview_ready":
                    self.preview_btn.configure(state="normal")
                elif kind == "auto_preview":
                    self.preview_selected()
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

    def detect_language(self, src, audio, detector):
        hint = filename_language_hint(src)
        if hint:
            return hint, 1.0, f"filename hint: {hint}", [hint]

        sr = 16000
        sample_len = int(DETECT_LEN * sr)
        if len(audio) <= sample_len:
            starts = [0]
        else:
            starts = sorted(set(
                int(max(0, min(len(audio) - sample_len, len(audio) * p)))
                for p in (0.15, 0.35, 0.55, 0.75, 0.90)
            ))

        scores = {}
        details = []
        for start in starts:
            sample = audio[start:start + sample_len]
            lang, prob, probs = detector.detect_language(
                audio=sample, vad_filter=False, language_detection_segments=1
            )
            details.append(f"{start/sr:.0f}s:{lang} {prob:.2f}")
            for code, value in probs:
                scores[code] = scores.get(code, 0.0) + float(value)

        if not scores:
            return "en", 0.0, "no language score", ["en"]

        ordered = [k for k, _ in sorted(scores.items(), key=lambda kv: kv[1], reverse=True)]
        top = ordered[0]

        if top == "sa":
            modern = max(("mr", "hi"), key=lambda k: scores.get(k, 0.0))
            if scores.get(modern, 0.0) >= scores.get("sa", 0.0) * 0.35:
                top = modern

        total = max(sum(scores.values()), 1e-9)
        confidence = scores.get(top, 0.0) / total
        candidates = [x for x in ordered if x != top][:4]
        return top, confidence, ", ".join(details), [top] + candidates

    def transcribe_file(self, src, outdir, model, detector, lang_override, glossary, beam_size=3):
        src = Path(src)
        self.emit("log", f"Processing: {src.name}")
        self.emit("status", f"Decoding audio - {src.name}")
        audio = decode_audio(str(src))
        dur = len(audio) / 16000.0
        rows = []

        if lang_override:
            lang = lang_override
            candidates = [lang]
            self.emit("log", f"Language locked: {lang}")
        else:
            lang, prob, detail, candidates = self.detect_language(src, audio, detector)
            self.emit("log", f"Detected language: {lang} ({prob:.2f})")
            if detail:
                self.emit("log", f"Detection: {detail}")

        def collect_rows(language):
            result = []
            kwargs = dict(
                language=language, beam_size=beam_size, best_of=beam_size, patience=1.0,
                vad_filter=False, condition_on_previous_text=False,
                word_timestamps=True, chunk_length=30
            )
            if glossary:
                kwargs["hotwords"] = glossary
                kwargs["initial_prompt"] = glossary

            self.emit("status", f"Transcribing 0% - {src.name}")
            sr = 16000
            start = 0.0
            first_chunk = True
            while start < dur:
                chunk_window = 30.0 if first_chunk else WINDOW
                end = min(dur, start + chunk_window)
                chunk = audio[int(start * sr):int(end * sr)]
                if len(chunk) == 0:
                    break

                local_kwargs = dict(kwargs)
                if first_chunk:
                    opening_prompts = {
                        "mr": "मराठी कविता किंवा गाणे. प्रत्येक ओळ अचूक लिहा. सुरुवातीची कोणतीही ओळ सोडू नका.",
                        "hi": "हिंदी कविता या गीत। हर पंक्ति ठीक से लिखें। शुरुआती कोई पंक्ति न छोड़ें।",
                        "en": "Transcribe every spoken or sung word from the very beginning. Do not skip any opening line."
                    }
                    local_kwargs["beam_size"] = max(3, int(local_kwargs.get("beam_size", 1)))
                    local_kwargs["best_of"] = max(3, int(local_kwargs.get("best_of", 1)))
                    local_kwargs["no_speech_threshold"] = 1.0
                    local_kwargs["log_prob_threshold"] = None
                    local_kwargs["compression_ratio_threshold"] = None
                    if not glossary and language in opening_prompts:
                        local_kwargs["initial_prompt"] = opening_prompts[language]

                segs, _ = model.transcribe(chunk, **local_kwargs)
                keep_start = 0.0 if first_chunk else start + OVERLAP / 2
                keep_end = dur if end >= dur else end - OVERLAP / 2
                for seg in segs:
                    words = getattr(seg, "words", None) or []
                    if words:
                        group = []
                        for w in words:
                            a = start + w.start
                            b = start + w.end
                            mid = (a + b) / 2
                            if keep_start <= mid <= keep_end:
                                group.append((a, b, w.word))
                                joined = "".join(x[2] for x in group).strip()
                                if len(joined) >= 42 or (group[-1][1] - group[0][0]) >= 3.8 or re.search(r"[.!?।]$", joined):
                                    if re.search(r"[\w\u0900-\u0D7F]", joined):
                                        result.append((group[0][0], group[-1][1], joined))
                                    group = []
                        if group:
                            joined = "".join(x[2] for x in group).strip()
                            if re.search(r"[\w\u0900-\u0D7F]", joined):
                                result.append((group[0][0], group[-1][1], joined))
                    else:
                        t = seg.text.strip()
                        a = start + seg.start
                        b = start + seg.end
                        mid = (a + b) / 2
                        if t and keep_start <= mid <= keep_end and re.search(r"[\w\u0900-\u0D7F]", t):
                            result.append((a, b, t))
                pct = min(99, int((end / max(dur, 0.1)) * 100))
                self.emit("progress", pct)
                self.emit("status", f"Transcribing {pct}% - {src.name}")
                if first_chunk:
                    start = max(0.0, end - OVERLAP)
                    first_chunk = False
                else:
                    start += STRIDE
            return result

        rows = collect_rows(lang)
        if not rows and not lang_override:
            self.emit("log", "No subtitle lines on first pass. Retrying language candidates...")
            for retry_lang in candidates[1:]:
                self.emit("log", f"Retrying as {retry_lang}...")
                rows = collect_rows(retry_lang)
                if rows:
                    lang = retry_lang
                    self.emit("log", f"Recovered subtitles using {retry_lang}.")
                    break

        rows.sort(key=lambda x: x[0])
        deduped = []
        for row in rows:
            a, b, t = row
            t = re.sub(r"\s+", " ", t).strip()
            if not t:
                continue
            if deduped:
                pa, pb, pt = deduped[-1]
                n1 = re.sub(r"[^\w\u0900-\u0D7F]+", "", pt.lower())
                n2 = re.sub(r"[^\w\u0900-\u0D7F]+", "", t.lower())
                overlap = max(0.0, min(pb, b) - max(pa, a))
                similarity = difflib.SequenceMatcher(None, n1, n2).ratio() if n1 and n2 else 0.0
                contained = bool(n1 and n2 and (n1 in n2 or n2 in n1))
                if overlap > 0.25 and (similarity >= 0.62 or contained):
                    if len(n2) > len(n1):
                        deduped[-1] = (min(pa, a), max(pb, b), t)
                    continue
            deduped.append((a, b, t))
        rows = deduped

        # Enforce strictly forward, non-overlapping subtitle timing.
        # This prevents captions from visually jumping backward at chunk joins.
        clean_rows = []
        prev_end = 0.0
        for a, b, t in rows:
            a = max(float(a), prev_end)
            b = max(float(b), a + 0.08)
            clean_rows.append((a, b, t))
            prev_end = b
        rows = clean_rows

        cues = []
        if self.include_title.get():
            first_voice = rows[0][0] if rows else 3.0
            title_end = max(1.0, min(3.5, first_voice - 0.10)) if first_voice > 0.2 else min(1.0, first_voice)
            if title_end > 0.05:
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
            lang_override = LANGS.get(self.language.get())
            glossary = self.glossary.get("1.0", "end").strip()
            outdir = self.output_var.get().strip()
            if not outdir:
                outdir = str(Path(self.files[0]).parent)
            Path(outdir).mkdir(parents=True, exist_ok=True)

            use_cuda = ctranslate2.get_cuda_device_count() > 0
            device = "cuda" if use_cuda else "cpu"
            if accuracy == "Auto Recommended":
                model_name = "turbo" if use_cuda else "medium"
                beam_size = 3 if use_cuda else 2
                compute = "int8_float16" if use_cuda else "int8"
            elif accuracy.startswith("Maximum"):
                model_name = "large-v3"
                beam_size = 4 if use_cuda else 2
                compute = "float16" if use_cuda else "int8"
            elif accuracy.startswith("Balanced"):
                model_name = "medium"
                beam_size = 3 if use_cuda else 2
                compute = "int8_float16" if use_cuda else "int8"
            else:
                model_name = "small"
                beam_size = 2
                compute = "int8_float16" if use_cuda else "int8"
            self.emit("log", f"Device: {device} / {compute}")
            self.emit("log", f"Profile: {accuracy} -> {model_name}, beam {beam_size}")
            self.emit("status", "Loading detector")
            self.emit("log", "Loading language detector...")
            try:
                detector = WhisperModel("small", device=device, compute_type=compute)
            except Exception as detector_error:
                self.emit("log", f"GPU detector unavailable: {detector_error}")
                device = "cpu"
                compute = "int8"
                self.emit("log", "Switching to CPU mode...")
                detector = WhisperModel("small", device=device, compute_type=compute)

            self.emit("status", f"Loading {model_name}")
            self.emit("log", f"Preparing model: {model_name}. First use may download several GB.")
            try:
                model = WhisperModel(model_name, device=device, compute_type=compute)
                self.emit("log", f"Model ready: {model_name}")
            except Exception as model_error:
                if model_name != "medium":
                    self.emit("log", f"{model_name} failed: {model_error}")
                    self.emit("status", "Falling back to medium")
                    self.emit("log", "Falling back to medium for reliable processing...")
                    model_name = "medium"
                    model = WhisperModel(model_name, device=device, compute_type=compute)
                    self.emit("log", "Model ready: medium")
                else:
                    raise

            total = len(self.files)
            self.generated_pairs = []
            for idx, src in enumerate(self.files, 1):
                self.emit("status", f"{idx}/{total}: {Path(src).name}")
                srt_path = self.transcribe_file(src, outdir, model, detector, lang_override, glossary, beam_size=beam_size)
                self.generated_pairs.append((src, str(srt_path)))
                self.emit("preview_ready", True)
            self.emit("progress", 100)
            self.emit("status", "Done")
            if self.generated_pairs:
                self.emit("auto_preview", True)
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