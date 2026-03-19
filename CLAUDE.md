# CiretaVids — AI Video Pipeline Guide
> **For Claude CLI / Claude Code:** Read this entire file before writing any code or running any commands. This is the complete operating manual for the Cireta video production system.

---

## What This Is

A **Remotion-based video template system** for Cireta brand videos. Given a script/brief, you can produce a fully rendered MP4 with:
- Animated scenes (teal brand aesthetic)
- ElevenLabs voiceover (sequential, no rate limit hits)
- Kevin MacLeod piano+strings soundtrack
- 3D wireframe animation sequences (CSS 3D — no WebGL required)
- Animated logo reveal (matching Cireta's own brand motion)

**Output:** 1920×1080 MP4, 30fps, ~26 seconds, ~18-20MB

---

## Tech Stack

| Layer | Tool | Notes |
|-------|------|-------|
| Video framework | `remotion` v4 | React-based video rendering |
| 3D | CSS `perspective` + SVG | No WebGL — renders headlessly |
| VO generation | ElevenLabs (via OpenClaw `tts` tool) | Sequential calls, convert opus→mp3 |
| Audio mix | `ffmpeg` | Precise millisecond timing |
| Soundtrack | Kevin MacLeod — "Impact Prelude" (CC BY) | In `assets/audio/` |
| Fonts | Gilroy (Bold, SemiBold, Medium) | In `public/fonts/` — WOFF2 |
| Logo | `cireta_colored_trimmed.png` | 1134×300px RGBA — icon is first 300px |

---

## Project Structure

```
CiretaVids/
├── CLAUDE.md                    ← YOU ARE HERE
├── src/
│   ├── Root.tsx                 ← Remotion composition root
│   ├── CiretaVideo.tsx          ← Main composition (Series of scenes)
│   ├── ParticleBackground.tsx   ← Reusable teal particle bg
│   ├── TealBackground.tsx       ← Radial gradient teal bg
│   ├── BRollScene.tsx           ← B-roll video + caption overlay
│   └── scenes/
│       ├── HookScene.tsx        ← Opening question (white text on teal)
│       ├── AnimatedTextScene.tsx← Star + text reveal
│       ├── TokenScene.tsx       ← Wireframe 3D rings + fractional split
│       ├── ClosingScene.tsx     ← Two-line closing statement
│       └── LogoEndCard.tsx      ← Animated logo reveal (star→icon→wordmark)
├── public/
│   ├── fonts/                   ← Gilroy WOFF2 files
│   ├── imgs/                    ← Logo PNGs
│   ├── audio/                   ← soundtrack.mp3 + vo_master.mp3
│   └── video_clips/             ← B-roll MP4s
├── assets/                      ← Source copies of all assets
└── docs/
    ├── SCENES.md                ← Scene-by-scene breakdown
    └── VOICE.md                 ← VO script template
```

---

## Brand Spec

| Property | Value |
|----------|-------|
| Primary BG | `#0d2e2c` (dark teal) |
| Accent | `#1ef0e0` (bright teal/cyan) |
| Secondary accent | `#1a9090` |
| Text primary | `#ffffff` |
| Text secondary | `#2a9b8a` |
| End card BG | `#ffffff` |
| Font | Gilroy (Bold 700, SemiBold 600, Medium 500) |
| Logo icon ratio | First 300px of 1134px-wide PNG |

---

## Composition Structure (Default 26s @ 30fps = 780 frames)

| Scene | Frames | Duration | Component |
|-------|--------|----------|-----------|
| 1 Hook | 0–89 | 3s | `HookScene` |
| 2 B-Roll 1 | 90–179 | 3s | `BRollScene` |
| 3 B-Roll 2 | 180–299 | 4s | `BRollScene` |
| 4 B-Roll 3 | 300–389 | 3s | `BRollScene` |
| 5 B-Roll 4 | 390–449 | 2s | `BRollScene` |
| 6 Token/3D | 450–629 | 6s | `TokenScene` |
| 7 Closing | 630–719 | 3s | `ClosingScene` |
| 8 Logo | 720–779 | 2s | `LogoEndCard` |

---

## Making a New Video — Step by Step

### 1. Write the VO Script

Map each line to a scene. The VO runs as a single pre-mixed audio track (`vo_master.mp3`). Lines are placed at exact frame start times.

```
Line 1 → frame 0    (HookScene, 3s max)
Line 2 → frame 90   (B-Roll 1, 3s max)
Line 3 → frame 180  (B-Roll 2, 4s max)
Line 4 → frame 300  (B-Roll 3, 3s max)
Line 5 → frame 390  (B-Roll 4, 2s max)
Line 6 → frame 450  (TokenScene, 6s max)
Line 7 → frame 630  (ClosingScene, 3s max)
```

Keep lines SHORT — each must fit in the scene window. Punchy, confident, no filler.

### 2. Generate VO with ElevenLabs (Sequential)

**CRITICAL: Call tts tool ONE AT A TIME. Never parallel — hits rate limits.**

```bash
# After each tts call, convert opus → mp3:
ffmpeg -y -i /tmp/openclaw/tts-XXXXX/voice-XXXXX.opus \
  -ar 44100 -ac 2 \
  public/audio/vo_01.mp3

# Check duration:
ffprobe -v quiet -show_entries format=duration -of csv=p=0 public/audio/vo_01.mp3
```

Repeat for each line (vo_01.mp3 through vo_07.mp3).

### 3. Mix VO into Master Track

Use the Python ffmpeg script to place each line at its exact timestamp:

```python
import subprocess

audio_dir = "public/audio"
# (filename, start_time_seconds) — match to frame/30
segments = [
    ("vo_01.mp3", 0.0),   # frame 0
    ("vo_02.mp3", 3.0),   # frame 90
    ("vo_03.mp3", 6.0),   # frame 180
    ("vo_04.mp3", 10.0),  # frame 300
    ("vo_05.mp3", 13.0),  # frame 390
    ("vo_06.mp3", 15.0),  # frame 450
    ("vo_07.mp3", 21.0),  # frame 630
]
total_duration = 26.0

inputs = []
filter_parts = []
for i, (fname, start) in enumerate(segments):
    inputs += ["-i", f"{audio_dir}/{fname}"]
    filter_parts.append(f"[{i}]adelay={int(start*1000)}|{int(start*1000)}[a{i}]")

mix_inputs = "".join(f"[a{i}]" for i in range(len(segments)))
filter_parts.append(f"{mix_inputs}amix=inputs={len(segments)}:normalize=0[out]")

cmd = ["ffmpeg", "-y", *inputs,
       "-filter_complex", ";".join(filter_parts),
       "-map", "[out]", "-t", str(total_duration),
       "-ar", "44100", "-ac", "2",
       f"{audio_dir}/vo_master.mp3"]
subprocess.run(cmd)
```

### 4. Prepare Soundtrack

The default soundtrack is "Impact Prelude" by Kevin MacLeod (CC BY).
**Attribution required:** "Impact Prelude" Kevin MacLeod (incompetech.com) Licensed under Creative Commons: By Attribution 4.0

```bash
ffmpeg -y -i assets/audio/soundtrack_impact_prelude.mp3 \
  -t 26 \
  -af "afade=t=out:st=23:d=3,volume=0.38,loudnorm=I=-18:LRA=7:TP=-2" \
  -ar 44100 -ac 2 \
  public/audio/soundtrack.mp3
```

Adjust `volume=0.38` to taste (0.22 = quieter, 0.5 = louder).

### 5. Update Scene Content

Edit the relevant scene files in `src/scenes/`:

**HookScene.tsx** — change the opening question text
**BRollScene** props in `CiretaVideo.tsx` — change captions + video files
**TokenScene.tsx** — the 3D wireframe scene (usually keep as-is)
**ClosingScene.tsx** — change the two closing lines
**LogoEndCard.tsx** — do NOT change (locked brand animation)

### 6. Render

```bash
npm install
npx remotion render src/Root.tsx CiretaVideo output/cireta-final.mp4 --concurrency=4
```

**Note:** `--concurrency=4` is optimal for M-series Mac. Increase to 8 for more cores.
**Note:** Do NOT use `--gl=swiftshader` — not needed (no WebGL used).

---

## The LogoEndCard Animation (LOCKED — Do Not Change)

This exactly replicates Cireta's own brand motion from their official video (21-26s).

**Sequence:**
1. Teal → white flash (4 frames)
2. Tiny dot appears at center
3. Scales up into 4-pointed star with 45° rotation
4. Rotates to 0° as it morphs into the icon mark
5. Icon slides left (frames 18-34)
6. Wordmark wipes in left→right (frames 26-42)
7. Final lockup holds

**Logo geometry:**
- PNG is 1134×300px
- Icon = first 300px width (ICON_RATIO = 300/1134)
- Display height = 100px → display width = 378px total
- Icon display = 100px, Wordmark display = 278px

---

## TokenScene (Wireframe 3D) — Customisation

The 3D scene uses pure SVG + CSS perspective (no WebGL). Key parameters:

```tsx
// In TokenScene.tsx
const R1x = 700;  // primary ring horizontal radius
const R1y = 260;  // primary ring vertical radius (squished = perspective)
const SLICES = 8; // number of fractional arc segments

// Timing:
// frames 0-30:  rings materialise
// frames 45-95: explode into fragments  
// frames 100-130: text fades in
```

To change the concept (e.g. show a property being split vs a coin):
- Update the `FragmentArc` labels (currently shows "1/8")
- Update `TextOverlay` copy
- Adjust ring radii for different visual weight

---

## B-Roll Requirements

Each B-roll clip should be:
- MP4, H.264
- Minimum 1080p
- 3-4 seconds (trim with ffmpeg before adding)
- Visually matches the caption (real assets, industrial, financial)

```bash
# Trim a clip to exact duration:
ffmpeg -y -i input.mp4 -t 3.5 -c:v libx264 -c:a aac public/video_clips/clip_trim.mp4
```

---

## Audio Notes

- ElevenLabs voice used: **Charlotte** (voice ID: `XB0fDUnXU5powFXDhCwa`) — British, young, warm
- For a more authoritative/male tone, use **Adam** or **Antoni**
- Always call `tts` tool sequentially — parallel calls hit rate limits
- Always convert from `.opus` → `.mp3` via ffmpeg before use in Remotion

---

## Common Errors

| Error | Fix |
|-------|-----|
| WebGL context failed | Don't use `@remotion/three` ThreeCanvas — use CSS 3D/SVG instead |
| Audio out of sync | Check ffprobe duration of each VO clip, adjust segment start times |
| Font not loading | Ensure WOFF2 files are in `public/fonts/` and `@font-face` is declared in `CiretaVideo.tsx` |
| Logo misaligned | `ICON_RATIO = 300/1134` — recalculate if using a different logo crop |
| `No entry point specified` | Always use `npx remotion render src/Root.tsx CiretaVideo output/file.mp4` |

---

## File Checklist Before Render

- [ ] `public/audio/vo_master.mp3` — mixed VO track
- [ ] `public/audio/soundtrack.mp3` — trimmed soundtrack
- [ ] `public/video_clips/*.mp4` — all B-roll clips present
- [ ] `public/fonts/Gilroy-*.woff2` — all 3 weights
- [ ] `public/imgs/cireta_colored_trimmed.png` — logo PNG

---

## Attribution

Music: "Impact Prelude" by Kevin MacLeod (incompetech.com)  
Licensed under Creative Commons: By Attribution 4.0 License  
http://creativecommons.org/licenses/by/4.0/
