#!/usr/bin/env python3
"""
fetch_footage.py — Download B-roll clips from Pexels API with mandatory vision QA gate.

Pipeline:
  1. Search Pexels → get N candidates
  2. Download thumbnails only
  3. Score each thumbnail against brief criteria using vision (gemini-flash via OpenRouter)
  4. Only download video files for clips scoring >= MIN_SCORE
  5. If nothing passes → STOP and report. Never use low-quality fallback.

Usage:
  export PEXELS_API_KEY="your_key"
  export OPENROUTER_API_KEY="your_key"   # for vision scoring
  python3 scripts/fetch_footage.py

Edit CLIPS below for your video brief.
"""

import os, sys, json, subprocess, base64, time
import urllib.request
import urllib.parse

PEXELS_KEY    = os.environ.get("PEXELS_API_KEY")
OPENROUTER_KEY = os.environ.get("OPENROUTER_API_KEY")
MIN_SCORE     = 3   # Minimum acceptable quality score (1-5)

if not PEXELS_KEY:
    print("ERROR: Set PEXELS_API_KEY. Free key at https://www.pexels.com/api/")
    sys.exit(1)

if not OPENROUTER_KEY:
    print("WARNING: No OPENROUTER_API_KEY — skipping vision scoring. HUMAN REVIEW REQUIRED.")
    AUTO_SCORE = False
else:
    AUTO_SCORE = True

# ── Edit for each brief ───────────────────────────────────────────────────────
# (search_query, brief_criteria, trim_duration_seconds, output_filename)
CLIPS = [
    (
        "aerial gold mine excavation sunrise",
        "Must be: aerial/drone shot, open-pit mine or quarry, warm golden-hour/sunrise lighting, cinematic feel. NOT: flat overcast lighting, processing plants, generic industrial.",
        2.5,
        "gold_mine_trim.mp4"
    ),
    (
        "copper cathodes metal stacked warehouse industrial",
        "Must be: copper cathodes (flat rectangular metal plates), stacked in rows, industrial warehouse setting. NOT: copper pipes, copper wiring, generic metal.",
        2.5,
        "copper_trim.mp4"
    ),
    (
        "gold bars bullion vault secure close up",
        "Must be: gold bars/bullion, close-up or medium shot, secure/vault setting, premium feel. NOT: gold coins, gold jewelry, generic yellow metal.",
        3.0,
        "gold_vault_trim.mp4"
    ),
]
OUTPUT_DIR = "public/video_clips"
SEARCH_PER_PAGE = 8
# ─────────────────────────────────────────────────────────────────────────────

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs("/tmp/footage_thumbs", exist_ok=True)


def search_pexels(query: str) -> list:
    q = urllib.parse.quote(query)
    url = f"https://api.pexels.com/videos/search?query={q}&per_page={SEARCH_PER_PAGE}&orientation=landscape"
    req = urllib.request.Request(url, headers={"Authorization": PEXELS_KEY})
    data = json.loads(urllib.request.urlopen(req).read())
    return data.get("videos", [])


def best_hd_url(video: dict) -> str:
    files = sorted(video["video_files"], key=lambda f: f.get("width", 0), reverse=True)
    hd = next((f for f in files if f.get("width", 0) >= 1920), files[0])
    return hd["link"]


def download_thumbnail(video: dict, out_path: str) -> bool:
    img_url = video.get("image", "")
    if not img_url:
        return False
    try:
        urllib.request.urlretrieve(img_url, out_path)
        size = os.path.getsize(out_path)
        return size > 10000  # Must be a real image, not a 4KB placeholder
    except Exception:
        return False


def score_thumbnail(thumb_path: str, criteria: str, video_id: int) -> int:
    """Score thumbnail against brief criteria using Gemini Flash vision. Returns 1-5."""
    if not AUTO_SCORE:
        return -1

    with open(thumb_path, "rb") as f:
        img_b64 = base64.b64encode(f.read()).decode()

    prompt = f"""You are a video producer selecting stock footage for a premium institutional brand video.

BRIEF CRITERIA:
{criteria}

Rate this video thumbnail from 1 to 5 where:
5 = Perfect match, exactly what the brief calls for, cinematic quality
4 = Good match, meets most criteria, usable
3 = Acceptable, meets core criteria but not ideal
2 = Weak match, partially relevant but significant issues
1 = Wrong subject, wrong lighting, or clearly unsuitable

Reply with ONLY a single integer: 1, 2, 3, 4, or 5. No explanation."""

    payload = json.dumps({
        "model": "google/gemini-2.0-flash-001",
        "messages": [{
            "role": "user",
            "content": [
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img_b64}"}},
                {"type": "text", "text": prompt}
            ]
        }],
        "max_tokens": 5
    }).encode()

    req = urllib.request.Request(
        "https://openrouter.ai/api/v1/chat/completions",
        data=payload,
        headers={
            "Authorization": f"Bearer {OPENROUTER_KEY}",
            "Content-Type": "application/json",
        }
    )
    try:
        resp = json.loads(urllib.request.urlopen(req).read())
        score_str = resp["choices"][0]["message"]["content"].strip()
        score = int(score_str[0])  # First character is the digit
        return max(1, min(5, score))
    except Exception as e:
        print(f"  ⚠ Vision scoring failed for {video_id}: {e}")
        return -1


def download_video(url: str, out_path: str):
    print(f"  ↓ Downloading video → {out_path}")
    urllib.request.urlretrieve(url, out_path)


def trim_video(raw: str, trimmed: str, duration: float):
    print(f"  ✂  Trimming to {duration}s → {trimmed}")
    subprocess.run([
        "ffmpeg", "-y", "-i", raw,
        "-t", str(duration),
        "-c:v", "libx264", "-c:a", "aac",
        "-loglevel", "error",
        trimmed,
    ], check=True)


# ── Main ──────────────────────────────────────────────────────────────────────
all_passed = True

for query, criteria, duration, output_name in CLIPS:
    print(f"\n{'='*60}")
    print(f"🔍 Query: '{query}'")
    print(f"📋 Criteria: {criteria[:80]}...")

    videos = search_pexels(query)
    if not videos:
        print(f"  ✗ No results. Skipping.")
        all_passed = False
        continue

    # Score all candidates
    candidates = []
    for v in videos:
        vid_id = v["id"]
        thumb_path = f"/tmp/footage_thumbs/{vid_id}.jpg"

        ok = download_thumbnail(v, thumb_path)
        if not ok:
            print(f"  ⚠ ID {vid_id}: thumbnail download failed or too small")
            continue

        if AUTO_SCORE:
            score = score_thumbnail(thumb_path, criteria, vid_id)
            print(f"  ID {vid_id}: score={score}/5")
        else:
            score = -1
            print(f"  ID {vid_id}: [no auto-score — manual review needed]")

        candidates.append((score, vid_id, v, thumb_path))
        time.sleep(0.3)  # rate limit

    # Filter by minimum score
    if AUTO_SCORE:
        passing = [(s, vid_id, v, tp) for s, vid_id, v, tp in candidates if s >= MIN_SCORE]
        passing.sort(reverse=True)  # Best first
    else:
        passing = candidates  # Human must decide

    if not passing:
        print(f"\n  ✗ FOOTAGE GATE FAILED: No clips scored >= {MIN_SCORE}/5 for '{query}'")
        print(f"  ACTION REQUIRED: Provide footage manually or revise search query.")
        print(f"  Thumbnails saved to /tmp/footage_thumbs/ for manual review.")
        all_passed = False
        continue

    # Download best passing clip
    best_score, best_id, best_video, best_thumb = passing[0]
    raw_path = f"{OUTPUT_DIR}/{best_id}_raw.mp4"
    trim_path = f"{OUTPUT_DIR}/{output_name}"
    video_url = best_hd_url(best_video)

    print(f"\n  ✅ Best clip: ID {best_id} (score {best_score}/5)")
    download_video(video_url, raw_path)
    trim_video(raw_path, trim_path, duration)
    os.remove(raw_path)
    print(f"  ✅ Ready: {trim_path}")

print(f"\n{'='*60}")
if all_passed:
    print("✅ All clips passed QA gate. Update videoFile props in your composition.")
else:
    print("⚠ Some clips FAILED the QA gate. Do NOT render with placeholder footage.")
    print("  Review /tmp/footage_thumbs/ and source manually if needed.")
    sys.exit(1)
