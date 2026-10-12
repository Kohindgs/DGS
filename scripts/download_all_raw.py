import os
import sys
import urllib.request
import urllib.parse
import http.cookiejar
import re
from concurrent.futures import ThreadPoolExecutor

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

TEMP_DIR = "C:/temp/dgs-ai-videos"
RAW_DIR = os.path.join(TEMP_DIR, "raw")
os.makedirs(RAW_DIR, exist_ok=True)

ITEMS = [
    {"id": "sundaram-elearning-evs2-ch7", "driveId": "1CoGUOXXj_m5YO3h1vvc9sv6YmzURjULT", "baseName": "sundaram_evs2_ch7"},
    {"id": "sundaram-elearning-marathi-13", "driveId": "1ZOfS6EvwgpYDwMF_M_iLFTLn5KLcAScZ", "baseName": "sundaram_marathi_13"},
    {"id": "sundaram-elearning-maths-ch9", "driveId": "1Xm6jP5N6Xtk8Kd4MQ5KXP-YRaFKJ9Ezv", "baseName": "sundaram_maths_ch9"},
    {"id": "sundaram-elearning-marathi-eng-3-8", "driveId": "18jp6T5hxwi_guYxXOZyq5nuBg01Pta3k", "baseName": "sundaram_marathi_eng_3_8"},
    {"id": "sundaram-elearning-marathi-eng-3-5", "driveId": "18BQogzXaLUfeaiJC0EDYn5mD8ONWb4qc", "baseName": "sundaram_marathi_eng_3_5"},
    {"id": "sundaram-elearning-marathi-bhaag-3", "driveId": "1cZT8bq9RxI_YNdunYcJlKe2Ihgkizmdz", "baseName": "sundaram_marathi_bhaag_3"},
    {"id": "clarion-jasmine-atta-hindi", "driveId": "1-EX9xe3mtf0p83jLWZN6LpZyMzsdAD2C", "baseName": "clarion_jasmine_atta_hindi"},
    {"id": "clarion-jasmine-atta-telugu", "driveId": "1L-6pRt9EV2j_iPSU-wPGXqpRs6aW-_2w", "baseName": "clarion_jasmine_atta_telugu"},
    {"id": "better-ceasons-tenant", "driveId": "1-lqCmXEOOEFptp3qNKXA6xLuIVYkTfZc", "baseName": "better_ceasons_tenant"},
    {"id": "better-ceasons-visarjan", "driveId": "1ngxDMf9294SMr1TYoJrXxflM8gD1PPaF", "baseName": "better_ceasons_visarjan"},
    {"id": "better-ceasons-chaturthi", "driveId": "1iGkU1OYjCytd2aCU0CXwk1GAYY_tA92n", "baseName": "better_ceasons_chaturthi"},
    {"id": "better-ceasons-kachra", "driveId": "1Qa3w8u9uHeew-hPplMfmI5rfBc7NfK0N", "baseName": "better_ceasons_kachra"},
]

def download_file(item):
    drive_id = item["driveId"]
    base = item["baseName"]
    dest_path = os.path.join(RAW_DIR, f"{base}_raw.mp4")

    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 1024 * 1024:
        print(f"[EXISTS] {base}_raw.mp4 ({os.path.getsize(dest_path) / 1024 / 1024:.1f} MB)")
        return True

    print(f"[START DOWNLOAD] {base}...")
    initial_url = f"https://drive.google.com/uc?export=download&id={drive_id}"
    cj = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
    req = urllib.request.Request(initial_url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})

    try:
        resp = opener.open(req)
        content_type = resp.headers.get("Content-Type", "")

        temp_part = dest_path + ".part"
        if "text/html" not in content_type:
            with open(temp_part, "wb") as out_f:
                while True:
                    chunk = resp.read(4 * 1024 * 1024)
                    if not chunk:
                        break
                    out_f.write(chunk)
            os.replace(temp_part, dest_path)
            print(f"[DONE] {base}_raw.mp4 ({os.path.getsize(dest_path) / 1024 / 1024:.1f} MB)")
            return True

        # Large file HTML confirm
        body = resp.read().decode("utf-8", errors="ignore")
        action_m = re.search(r'action="([^"]+)"', body)
        action = action_m.group(1) if action_m else "https://drive.usercontent.google.com/download"

        params = {}
        for m in re.finditer(r'<input type="hidden" name="([^"]+)" value="([^"]*)">', body):
            params[m.group(1)] = m.group(2)

        target_url = action + "?" + urllib.parse.urlencode(params)
        req2 = urllib.request.Request(target_url, headers={"User-Agent": "Mozilla/5.0"})
        with opener.open(req2) as resp2, open(temp_part, "wb") as out_f:
            while True:
                chunk = resp2.read(4 * 1024 * 1024)
                if not chunk:
                    break
                out_f.write(chunk)
        os.replace(temp_part, dest_path)
        print(f"[DONE] {base}_raw.mp4 ({os.path.getsize(dest_path) / 1024 / 1024:.1f} MB)")
        return True
    except Exception as e:
        print(f"[ERROR] {base}: {e}")
        return False

def main():
    print(f"Starting parallel download for {len(ITEMS)} items with 4 workers...")
    with ThreadPoolExecutor(max_workers=4) as executor:
        results = list(executor.map(download_file, ITEMS))
    print(f"All downloads finished: {results.count(True)}/{len(ITEMS)} succeeded.")

if __name__ == "__main__":
    main()
