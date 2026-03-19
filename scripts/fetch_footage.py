#!/usr/bin/env python3
"""
fetch_footage.py — Download B-roll clips from Pexels API

Usage:
  export PEXELS_API_KEY="your_key"
  python3 scripts/fetch_footage.py

Edit the CLIPS list below for your video brief.
"""

import os, sys, json, subprocess
import urllib.request
import urllib.parse

KEY = os.environ.get("PEXELS_API_KEY")
if not KEY:
    print("ERROR: Set PEXELS_API_KEY environment variable first.")
    print("Get a free key at https://www.pexels.com/api/")
    sys.exit(1)

# ── Edit this for each brief ──────────────────────────────────────────────────
# (search_query, raw_output_name, trim_duration_seconds, trimmed_output_name)
CLIPS = [
    ("gold mine aerial sunrise",        "gold_mine_raw.mp4",  2.5, "gold_mine_trim.mp4"),
    ("copper cathodes warehouse stack",  "copper_raw.mp4",     2.5, "copper_trim.mp4"),
    ("gold bars vault secure",           "vault_raw.mp4",      3.0, "vault_trim.mp4"),
]
OUTPUT_DIR = "public/video_clips"
# ─────────────────────────────────────────────────────────────────────────────

os.makedirs(OUTPUT_DIR, exist_ok=True)


def search_pexels(query: str, per_page: int = 5) -> list:
    q = urllib.parse.quote(query)
    url = f"https://api.pexels.com/videos/search?query={q}&per_page={per_page}&orientation=landscape"
    req = urllib.request.Request(url, headers={"Authorization": KEY})
    data = json.loads(urllib.request.urlopen(req).read())
    return data.get("videos", [])


def best_hd_link(video: dict) -> str:
    files = sorted(video["video_files"], key=lambda f: f.get("width", 0), reverse=True)
    hd = next((f for f in files if f.get("width", 0) >= 1920), files[0])
    return hd["link"]


def download(url: str, out_path: str):
    print(f"  ↓ Downloading → {out_path}")
    urllib.request.urlretrieve(url, out_path)


def trim(raw: str, trimmed: str, duration: float):
    print(f"  ✂  Trimming {duration}s → {trimmed}")
    subprocess.run([
        "ffmpeg", "-y", "-i", raw,
        "-t", str(duration),
        "-c:v", "libx264", "-c:a", "aac",
        "-loglevel", "error",
        trimmed,
    ], check=True)


for query, raw_name, duration, trim_name in CLIPS:
    print(f"\n🔍 Searching: '{query}'")
    videos = search_pexels(query)
    if not videos:
        print(f"  ⚠ No results for '{query}' — skipping")
        continue

    video = videos[0]
    print(f"  ✓ Found: ID {video['id']} — {video.get('url', '')}")
    link = best_hd_link(video)

    raw_path    = os.path.join(OUTPUT_DIR, raw_name)
    trim_path   = os.path.join(OUTPUT_DIR, trim_name)

    download(link, raw_path)
    trim(raw_path, trim_path, duration)
    # Clean up raw
    os.remove(raw_path)
    print(f"  ✅ Ready: {trim_path}")

print("\n✅ All clips downloaded. Update videoFile props in your composition file.")
