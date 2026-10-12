import os
import sys
import subprocess
import urllib.request
import urllib.parse
import http.cookiejar
import re
import json
import time

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

TEMP_DIR = "C:/temp/dgs-ai-videos"
RAW_DIR = os.path.join(TEMP_DIR, "raw")
OPT_DIR = os.path.join(TEMP_DIR, "optimized")
VIDEOS_DIR = os.path.join(OPT_DIR, "videos")
POSTERS_DIR = os.path.join(OPT_DIR, "posters")

os.makedirs(RAW_DIR, exist_ok=True)
os.makedirs(VIDEOS_DIR, exist_ok=True)
os.makedirs(POSTERS_DIR, exist_ok=True)

# 17 Videos across 4 Client Groups
VIDEOS = [
    # 1. Hyundai (3)
    {
        "id": "hyundai-creta-1",
        "client": "Hyundai Motors",
        "category": "Automotive & Product Explainer",
        "title": "Hyundai Creta — Feature & Technology Explainer (Part 1)",
        "alt": "Hyundai Creta AI Feature & Technology Explainer Video 1",
        "driveId": "1iXFs4uQhppCr9oxnKZYmvidGy07pMC2o",
        "baseName": "hyundai_creta_1"
    },
    {
        "id": "hyundai-creta-2",
        "client": "Hyundai Motors",
        "category": "Automotive & Product Explainer",
        "title": "Hyundai Creta — Feature & Technology Explainer (Part 2)",
        "alt": "Hyundai Creta AI Feature & Technology Explainer Video 2",
        "driveId": "1M-U3TvXz3UX6V6WTy2vqQseryUPeVxvU",
        "baseName": "hyundai_creta_2"
    },
    {
        "id": "hyundai-creta-3",
        "client": "Hyundai Motors",
        "category": "Automotive & Product Explainer",
        "title": "Hyundai Creta — Feature & Technology Explainer (Part 3)",
        "alt": "Hyundai Creta AI Feature & Technology Explainer Video 3",
        "driveId": "1pvqj3JCLGsDrPp5SeOU_h_C3fVyunuzl",
        "baseName": "hyundai_creta_3"
    },

    # 2. Sundaram E-Learning (8)
    {
        "id": "sundaram-elearning-bal-3-1",
        "client": "Sundaram E-Learning",
        "category": "EdTech & Interactive Animation",
        "title": "Sundaram E-Learning — Grade 3 Balbharati Interactive Lesson",
        "alt": "Sundaram E-Learning Grade 3 Balbharati Chapter 3.1 Animation",
        "driveId": "1_Oiis4_iYctrl9tfcblZPmw5UewvwRUs",
        "baseName": "sundaram_bal_3_1"
    },
    {
        "id": "sundaram-elearning-evs1-ch7",
        "client": "Sundaram E-Learning",
        "category": "EdTech & Interactive Animation",
        "title": "Sundaram E-Learning — Grade 3 Environmental Studies Chapter 7",
        "alt": "Sundaram E-Learning Grade 3 EVS Chapter 7 Video Lesson",
        "driveId": "1lZgTLaZv5-uXwzXsOL7PXCLFUEGPETwl",
        "baseName": "sundaram_evs1_ch7"
    },
    {
        "id": "sundaram-elearning-evs2-ch7",
        "client": "Sundaram E-Learning",
        "category": "EdTech & Interactive Animation",
        "title": "Sundaram E-Learning — Grade 4 Environmental Studies Chapter 7",
        "alt": "Sundaram E-Learning Grade 4 EVS2 Chapter 7 Video Lesson",
        "driveId": "1CoGUOXXj_m5YO3h1vvc9sv6YmzURjULT",
        "baseName": "sundaram_evs2_ch7"
    },
    {
        "id": "sundaram-elearning-marathi-13",
        "client": "Sundaram E-Learning",
        "category": "EdTech & Interactive Animation",
        "title": "Sundaram E-Learning — English Medium Marathi Lesson 13",
        "alt": "Sundaram E-Learning English Medium Marathi Lesson 13",
        "driveId": "1ZOfS6EvwgpYDwMF_M_iLFTLn5KLcAScZ",
        "baseName": "sundaram_marathi_13"
    },
    {
        "id": "sundaram-elearning-maths-ch9",
        "client": "Sundaram E-Learning",
        "category": "EdTech & Interactive Animation",
        "title": "Sundaram E-Learning — Grade 4 Mathematics Chapter 9",
        "alt": "Sundaram E-Learning Grade 4 Maths Chapter 9 Animation",
        "driveId": "1Xm6jP5N6Xtk8Kd4MQ5KXP-YRaFKJ9Ezv",
        "baseName": "sundaram_maths_ch9"
    },
    {
        "id": "sundaram-elearning-marathi-eng-3-8",
        "client": "Sundaram E-Learning",
        "category": "EdTech & Interactive Animation",
        "title": "Sundaram E-Learning — Grade 3 English Subject Chapter 3.8",
        "alt": "Sundaram E-Learning Grade 3 Marathi Medium English 3.8",
        "driveId": "18jp6T5hxwi_guYxXOZyq5nuBg01Pta3k",
        "baseName": "sundaram_marathi_eng_3_8"
    },
    {
        "id": "sundaram-elearning-marathi-eng-3-5",
        "client": "Sundaram E-Learning",
        "category": "EdTech & Interactive Animation",
        "title": "Sundaram E-Learning — Grade 3 English Subject Chapter 3.5",
        "alt": "Sundaram E-Learning Grade 3 Marathi Medium English 3.5",
        "driveId": "18BQogzXaLUfeaiJC0EDYn5mD8ONWb4qc",
        "baseName": "sundaram_marathi_eng_3_5"
    },
    {
        "id": "sundaram-elearning-marathi-bhaag-3",
        "client": "Sundaram E-Learning",
        "category": "EdTech & Interactive Animation",
        "title": "Sundaram E-Learning — Grade 4 Marathi Bhaag 3",
        "alt": "Sundaram E-Learning Grade 4 English Marathi Bhaag 3",
        "driveId": "1cZT8bq9RxI_YNdunYcJlKe2Ihgkizmdz",
        "baseName": "sundaram_marathi_bhaag_3"
    },

    # 3. Clarion Agro (2)
    {
        "id": "clarion-jasmine-atta-hindi",
        "client": "Clarion Agro",
        "category": "FMCG Commercial & AI Brand Video",
        "title": "Clarion Agro — Jasmine Atta Campaign (Hindi)",
        "alt": "Clarion Agro Jasmine Atta Commercial Hindi Version",
        "driveId": "1-EX9xe3mtf0p83jLWZN6LpZyMzsdAD2C",
        "baseName": "clarion_jasmine_atta_hindi"
    },
    {
        "id": "clarion-jasmine-atta-telugu",
        "client": "Clarion Agro",
        "category": "FMCG Commercial & AI Brand Video",
        "title": "Clarion Agro — Jasmine Atta Campaign (Telugu)",
        "alt": "Clarion Agro Jasmine Atta Commercial Telugu Version",
        "driveId": "1L-6pRt9EV2j_iPSU-wPGXqpRs6aW-_2w",
        "baseName": "clarion_jasmine_atta_telugu"
    },

    # 4. Better Ceasons (4)
    {
        "id": "better-ceasons-tenant",
        "client": "Better Ceasons",
        "category": "D2C & Creative Narrative Campaign",
        "title": "Better Ceasons — 1000 Saal Ka Tenant Ad Campaign",
        "alt": "Better Ceasons 1000 Saal Ka Tenant Commercial",
        "driveId": "1-lqCmXEOOEFptp3qNKXA6xLuIVYkTfZc",
        "baseName": "better_ceasons_tenant"
    },
    {
        "id": "better-ceasons-visarjan",
        "client": "Better Ceasons",
        "category": "D2C & Creative Narrative Campaign",
        "title": "Better Ceasons — Ganesh Visarjan Special Campaign",
        "alt": "Better Ceasons Ganesh Visarjan Brand Film",
        "driveId": "1ngxDMf9294SMr1TYoJrXxflM8gD1PPaF",
        "baseName": "better_ceasons_visarjan"
    },
    {
        "id": "better-ceasons-chaturthi",
        "client": "Better Ceasons",
        "category": "D2C & Creative Narrative Campaign",
        "title": "Better Ceasons — Ganesh Chaturthi Festive Commercial",
        "alt": "Better Ceasons Ganesh Chaturthi Festive Ad",
        "driveId": "1iGkU1OYjCytd2aCU0CXwk1GAYY_tA92n",
        "baseName": "better_ceasons_chaturthi"
    },
    {
        "id": "better-ceasons-kachra",
        "client": "Better Ceasons",
        "category": "D2C & Creative Narrative Campaign",
        "title": "Better Ceasons — Kachra Samjha Kya Brand Film",
        "alt": "Better Ceasons Kachra Samjha Kya Narrative Film",
        "driveId": "1Qa3w8u9uHeew-hPplMfmI5rfBc7NfK0N",
        "baseName": "better_ceasons_kachra"
    }
]

def download_file(drive_id, dest_path):
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 1024 * 1024:
        print(f"  [Exists] {dest_path} ({os.path.getsize(dest_path) / 1024 / 1024:.1f} MB)")
        return True

    initial_url = f"https://drive.google.com/uc?export=download&id={drive_id}"
    cj = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
    req = urllib.request.Request(initial_url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})

    resp = opener.open(req)
    content_type = resp.headers.get("Content-Type", "")

    if "text/html" not in content_type:
        # Direct stream for files < 100MB
        total_len = int(resp.headers.get("Content-Length", 0))
        with open(dest_path, "wb") as out_f:
            downloaded = 0
            while True:
                chunk = resp.read(4 * 1024 * 1024)
                if not chunk:
                    break
                out_f.write(chunk)
                downloaded += len(chunk)
                if total_len:
                    print(f"\r  Downloading: {downloaded / 1024 / 1024:.1f} / {total_len / 1024 / 1024:.1f} MB ({downloaded / total_len * 100:.1f}%)", end="", flush=True)
                else:
                    print(f"\r  Downloading: {downloaded / 1024 / 1024:.1f} MB", end="", flush=True)
        print()
        return True

    # HTML virus scan confirmation page for files > 100MB
    body = resp.read().decode("utf-8", errors="ignore")
    action_m = re.search(r'action="([^"]+)"', body)
    action = action_m.group(1) if action_m else "https://drive.usercontent.google.com/download"

    params = {}
    for m in re.finditer(r'<input type="hidden" name="([^"]+)" value="([^"]*)">', body):
        params[m.group(1)] = m.group(2)

    target_url = action + "?" + urllib.parse.urlencode(params)

    req2 = urllib.request.Request(target_url, headers={"User-Agent": "Mozilla/5.0"})
    with opener.open(req2) as resp2, open(dest_path, "wb") as out_f:
        downloaded = 0
        total_len = int(resp2.headers.get("Content-Length", 0))
        while True:
            chunk = resp2.read(4 * 1024 * 1024)
            if not chunk:
                break
            out_f.write(chunk)
            downloaded += len(chunk)
            if total_len:
                print(f"\r  Downloading: {downloaded / 1024 / 1024:.1f} / {total_len / 1024 / 1024:.1f} MB ({downloaded / total_len * 100:.1f}%)", end="", flush=True)
            else:
                print(f"\r  Downloading: {downloaded / 1024 / 1024:.1f} MB", end="", flush=True)
    print()
    return True

def probe_video(video_path):
    cmd = [
        "ffprobe", "-v", "error",
        "-select_streams", "v:0",
        "-show_entries", "stream=width,height,duration",
        "-show_entries", "format=duration",
        "-of", "json",
        video_path
    ]
    p = subprocess.run(cmd, capture_output=True, text=True, check=True)
    info = json.loads(p.stdout)
    stream = info.get("streams", [{}])[0]
    fmt = info.get("format", {})
    
    width = int(stream.get("width", 1920))
    height = int(stream.get("height", 1080))
    duration_str = stream.get("duration") or fmt.get("duration") or "30"
    duration = float(duration_str)
    
    # Calculate ratio
    ratio = round(width / height, 4) if height else 1.7778
    orientation = "landscape" if width >= height else "portrait"
    
    return {
        "width": width,
        "height": height,
        "duration": duration,
        "ratio": ratio,
        "orientation": orientation
    }

def process_video(item):
    base = item["baseName"]
    raw_path = os.path.join(RAW_DIR, f"{base}_raw.mp4")
    
    # Special case: check if raw_creta1 exists from test
    if base == "hyundai_creta_1" and os.path.exists(os.path.join(TEMP_DIR, "raw_creta1.mp4")):
        if not os.path.exists(raw_path):
            import shutil
            shutil.copyfile(os.path.join(TEMP_DIR, "raw_creta1.mp4"), raw_path)

    print(f"\n[{item['id']}] Processing {item['title']}...")
    download_file(item["driveId"], raw_path)
    
    meta = probe_video(raw_path)
    print(f"  Source: {meta['width']}x{meta['height']} ({meta['orientation']}), {meta['duration']:.1f}s")
    
    # Target scale
    scale_filter = "scale='min(1920,iw)':-2"
    
    mp4_path = os.path.join(VIDEOS_DIR, f"{base}.mp4")
    webm_path = os.path.join(VIDEOS_DIR, f"{base}.webm")
    temp_poster = os.path.join(TEMP_DIR, f"{base}_poster.png")
    webp_poster = os.path.join(POSTERS_DIR, f"{base}_poster.webp")
    avif_poster = os.path.join(POSTERS_DIR, f"{base}_poster.avif")
    
    # 1. Poster extraction (at 1.5s or mid)
    seek_time = min(1.5, max(0.5, meta["duration"] / 4))
    if not os.path.exists(webp_poster) or not os.path.exists(avif_poster):
        print(f"  Extracting poster at {seek_time:.1f}s...")
        subprocess.run([
            "ffmpeg", "-y", "-ss", f"{seek_time}", "-i", raw_path,
            "-vframes", "1", "-vf", scale_filter, "-q:v", "2", temp_poster
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        subprocess.run(["ffmpeg", "-y", "-i", temp_poster, "-c:v", "libwebp", "-quality", "85", webp_poster], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        subprocess.run(["ffmpeg", "-y", "-i", temp_poster, "-c:v", "libsvtav1", "-crf", "28", avif_poster], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if os.path.exists(temp_poster):
            os.remove(temp_poster)

    # 2. Transcode MP4
    if not os.path.exists(mp4_path) or os.path.getsize(mp4_path) < 1000:
        print("  Transcoding MP4...")
        subprocess.run([
            "ffmpeg", "-y", "-i", raw_path,
            "-vf", scale_filter,
            "-c:v", "libx264", "-crf", "23", "-preset", "faster",
            "-pix_fmt", "yuv420p", "-movflags", "+faststart",
            "-c:a", "aac", "-b:a", "128k",
            mp4_path
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print(f"  [OK] MP4: {os.path.getsize(mp4_path) / 1024 / 1024:.2f} MB")
    else:
        print(f"  [Exists] MP4: {os.path.getsize(mp4_path) / 1024 / 1024:.2f} MB")

    # 3. Transcode WebM
    if not os.path.exists(webm_path) or os.path.getsize(webm_path) < 1000:
        print("  Transcoding WebM (VP9)...")
        subprocess.run([
            "ffmpeg", "-y", "-i", raw_path,
            "-vf", scale_filter,
            "-c:v", "libvpx-vp9", "-crf", "33", "-b:v", "0",
            "-deadline", "realtime", "-cpu-used", "8", "-row-mt", "1",
            "-c:a", "libopus", "-b:a", "96k",
            webm_path
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print(f"  [OK] WebM: {os.path.getsize(webm_path) / 1024 / 1024:.2f} MB")
    else:
        print(f"  [Exists] WebM: {os.path.getsize(webm_path) / 1024 / 1024:.2f} MB")

    # Target dimensions after scaling
    scaled_w = min(1920, meta["width"])
    scaled_h = int(scaled_w / meta["ratio"])
    # ensure even dimensions
    if scaled_h % 2 != 0:
        scaled_h += 1

    return {
        "id": item["id"],
        "filename": f"{base}.mp4",
        "title": item["title"],
        "client": item["client"],
        "category": item["category"],
        "alt": item["alt"],
        "width": scaled_w,
        "height": scaled_h,
        "sourceWidth": meta["width"],
        "sourceHeight": meta["height"],
        "ratio": meta["ratio"],
        "orientation": meta["orientation"],
        "duration": meta["duration"],
        "poster": {
            "width": scaled_w,
            "height": scaled_h,
            "avif": f"/media/portfolio/posters/{base}_poster.avif",
            "webp": f"/media/portfolio/posters/{base}_poster.webp",
            "fallback": f"/media/portfolio/posters/{base}_poster.webp"
        },
        "sources": {
            "webm": f"/media/portfolio/videos/{base}.webm",
            "mp4": f"/media/portfolio/videos/{base}.mp4"
        },
        "bytes": {
            "original": os.path.getsize(raw_path),
            "mp4": os.path.getsize(mp4_path),
            "webm": os.path.getsize(webm_path),
            "posterWebp": os.path.getsize(webp_poster),
            "posterAvif": os.path.getsize(avif_poster)
        }
    }

def main():
    print("=== DGS AI Video Portfolio Processing Pipeline ===")
    print(f"Processing {len(VIDEOS)} videos across 4 client groups...\n")
    processed_items = []
    
    t_start = time.time()
    for idx, item in enumerate(VIDEOS, 1):
        print(f"[{idx}/{len(VIDEOS)}] Starting {item['id']}...")
        processed = process_video(item)
        processed_items.append(processed)

    manifest_output = os.path.join(TEMP_DIR, "processed_manifest.json")
    with open(manifest_output, "w", encoding="utf-8") as f:
        json.dump(processed_items, f, indent=2)

    total_time = time.time() - t_start
    print(f"\n==========================================")
    print(f"[OK] All {len(processed_items)} videos processed successfully in {total_time / 60:.1f} minutes!")
    print(f"Manifest written to: {manifest_output}")

if __name__ == "__main__":
    main()
