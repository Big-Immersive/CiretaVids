# Footage Pipeline — Pexels API

## Setup (one-time)
1. Create free account at https://www.pexels.com/api/
2. Get your API key from the dashboard
3. Add to OpenClaw config:
   ```bash
   openclaw config set env.vars.PEXELS_API_KEY "your_key_here"
   ```
   Or store in shell: `export PEXELS_API_KEY="your_key"`

## Searching & Downloading Clips

```bash
# Search for videos
curl -H "Authorization: $PEXELS_API_KEY" \
  "https://api.pexels.com/videos/search?query=gold+mine+aerial&per_page=5&orientation=landscape" \
  | python3 -c "
import sys, json
d = json.load(sys.stdin)
for v in d['videos']:
    # Get best HD file
    files = sorted(v['video_files'], key=lambda f: f.get('width', 0), reverse=True)
    hd = next((f for f in files if f.get('width', 0) >= 1920), files[0])
    print(v['id'], hd['width'], 'x', hd['height'], hd['link'][:80])
"

# Download a specific video
curl -L "VIDEO_URL" -o public/video_clips/gold_mine_raw.mp4

# Trim to exact scene duration (e.g. 2.5s)
ffmpeg -y -i public/video_clips/gold_mine_raw.mp4 \
  -t 2.5 -c:v libx264 -c:a aac \
  public/video_clips/gold_mine_trim.mp4
```

## Karim Brief — Required Footage

| Scene | Duration | Query | File |
|-------|----------|-------|------|
| B-Roll 1 (Scene 2) | 2.5s | `gold mine aerial sunrise` | `gold_mine_trim.mp4` |
| B-Roll 2 (Scene 3) | 2.5s | `copper cathodes warehouse industrial` | `copper_trim.mp4` |
| B-Roll 3 (Scene 4 — optional) | — | `gold bars vault secure` | `vault_trim.mp4` |

Update `KarimVideo.tsx` `videoFile` props once clips are downloaded.

## General Cireta Template — Required Footage

| Caption | Duration | Query | File |
|---------|----------|-------|------|
| REAL ASSETS | 3s | `gold smelting furnace industrial` | `furnace_trim.mp4` |
| VERIFIED & STORED | 4s | `shipping containers aerial port` | `containers_trim.mp4` |
| LEGALLY CERTIFIED | 3s | `legal document signing contract` | `contract_trim.mp4` |
| THEN TOKENIZED | 2s | `gold bars close up` | `gold_trim.mp4` |

## Attribution
Pexels videos are free for commercial use — no attribution required, but good practice to credit.
License: https://www.pexels.com/license/

## Automated Script (once PEXELS_API_KEY is set)

```python
# scripts/fetch_footage.py
import os, sys, subprocess, json, urllib.request

KEY = os.environ.get("PEXELS_API_KEY")
if not KEY:
    print("Set PEXELS_API_KEY first")
    sys.exit(1)

clips = [
    ("gold mine aerial sunrise", "gold_mine_raw.mp4", 2.5, "gold_mine_trim.mp4"),
    ("copper cathodes warehouse", "copper_raw.mp4",   2.5, "copper_trim.mp4"),
]

for query, raw, duration, trimmed in clips:
    url = f"https://api.pexels.com/videos/search?query={query.replace(' ', '+')}&per_page=3&orientation=landscape"
    req = urllib.request.Request(url, headers={"Authorization": KEY})
    data = json.loads(urllib.request.urlopen(req).read())
    video = data["videos"][0]
    files = sorted(video["video_files"], key=lambda f: f.get("width", 0), reverse=True)
    hd = next((f for f in files if f.get("width", 0) >= 1920), files[0])
    print(f"Downloading {query} → {raw}")
    urllib.request.urlretrieve(hd["link"], f"public/video_clips/{raw}")
    subprocess.run(["ffmpeg", "-y", "-i", f"public/video_clips/{raw}",
                    "-t", str(duration), "-c:v", "libx264", "-c:a", "aac",
                    f"public/video_clips/{trimmed}"])
    print(f"Trimmed → {trimmed}")
```

Run: `python3 scripts/fetch_footage.py`
