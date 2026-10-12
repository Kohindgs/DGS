import os
import sys
import json
import shutil

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

ROOT_DIR = "C:/Projects/DGS-Phase2-CMS"
TEMP_DIR = "C:/temp/dgs-ai-videos"
PROCESSED_MANIFEST = os.path.join(TEMP_DIR, "processed_manifest.json")
OPT_VIDEOS_MANIFEST = os.path.join(ROOT_DIR, "data/portfolio/optimized-videos-manifest.json")
PORTFOLIO_MEDIA = os.path.join(ROOT_DIR, "data/design-preview/portfolio-media.json")
POSTERS_SRC = os.path.join(TEMP_DIR, "optimized/posters")
POSTERS_DST = os.path.join(ROOT_DIR, "public/media/portfolio/posters")

def sync():
    if not os.path.exists(PROCESSED_MANIFEST):
        print(f"Error: {PROCESSED_MANIFEST} not found yet!")
        return False

    with open(PROCESSED_MANIFEST, "r", encoding="utf-8") as f:
        new_items = json.load(f)

    print(f"Loaded {len(new_items)} processed video items.")

    # 1. Sync Posters
    os.makedirs(POSTERS_DST, exist_ok=True)
    poster_count = 0
    for fname in os.listdir(POSTERS_SRC):
        src_file = os.path.join(POSTERS_SRC, fname)
        dst_file = os.path.join(POSTERS_DST, fname)
        shutil.copy2(src_file, dst_file)
        poster_count += 1
    print(f"✓ Copied {poster_count} poster files to {POSTERS_DST}")

    # 2. Update data/portfolio/optimized-videos-manifest.json
    with open(OPT_VIDEOS_MANIFEST, "r", encoding="utf-8") as f:
        opt_manifest = json.load(f)

    # Filter out existing new_items to ensure idempotency
    new_ids = {item["id"] for item in new_items}
    existing_items = [it for it in opt_manifest.get("items", []) if it["id"] not in new_ids]

    combined_items = new_items + existing_items

    total_orig = sum(it.get("bytes", {}).get("original", 0) for it in combined_items)
    total_mp4 = sum(it.get("bytes", {}).get("mp4", 0) for it in combined_items)
    total_webm = sum(it.get("bytes", {}).get("webm", 0) for it in combined_items)
    total_posters = sum(
        it.get("bytes", {}).get("posterWebp", 0) + it.get("bytes", {}).get("posterAvif", 0)
        for it in combined_items
    )

    largest = max(combined_items, key=lambda x: x.get("bytes", {}).get("mp4", 0), default={})

    updated_opt_manifest = {
        "videoCount": len(combined_items),
        "originalTotalBytes": total_orig,
        "optimizedMp4TotalBytes": total_mp4,
        "optimizedWebmTotalBytes": total_webm,
        "posterTotalBytes": total_posters,
        "largestOptimizedVideo": {
            "filename": largest.get("filename", ""),
            "bytes": largest.get("bytes", {}).get("mp4", 0),
        },
        "items": combined_items,
    }

    with open(OPT_VIDEOS_MANIFEST, "w", encoding="utf-8") as f:
        json.dump(updated_opt_manifest, f, indent=2)
    print(f"✓ Updated {OPT_VIDEOS_MANIFEST} with {len(combined_items)} items.")

    # 3. Update data/design-preview/portfolio-media.json
    with open(PORTFOLIO_MEDIA, "r", encoding="utf-8") as f:
        port_media = json.load(f)

    port_items = port_media.get("items", [])
    filtered_port_items = [it for it in port_items if it.get("id") not in new_ids]

    converted_new_items = []
    for it in new_items:
        converted_new_items.append({
            "id": it["id"],
            "type": "video",
            "title": it["title"],
            "alt": it["alt"],
            "sourceWidth": it["sourceWidth"],
            "sourceHeight": it["sourceHeight"],
            "width": it["width"],
            "height": it["height"],
            "ratio": it["ratio"],
            "orientation": it["orientation"],
            "duration": it["duration"],
            "poster": {
                "width": it["width"],
                "height": it["height"],
                "avif": it["poster"]["avif"],
                "webp": it["poster"]["webp"],
                "fallback": it["poster"]["fallback"],
            },
            "sources": {
                "webm": it["sources"]["webm"],
                "mp4": it["sources"]["mp4"],
            }
        })

    # Prepend new video items
    updated_port_media = {
        "items": converted_new_items + filtered_port_items
    }

    with open(PORTFOLIO_MEDIA, "w", encoding="utf-8") as f:
        json.dump(updated_port_media, f, indent=2)
    print(f"✓ Updated {PORTFOLIO_MEDIA} with {len(converted_new_items)} new video items prepended.")

    print("\n>>> ALL PORTFOLIO MANIFESTS & ASSETS SYNCHRONIZED SUCCESSFULLY! <<<")
    return True

if __name__ == "__main__":
    sync()
