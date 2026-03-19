# CiretaVids — AI Video Production Manual
> **Read this entire file before writing any code or running commands.**
> This is the complete operating manual for the Cireta video production system, updated with all learnings from v1–v13.

---

## Tech Stack

| Layer | Tool | Notes |
|-------|------|-------|
| Video framework | Remotion v4 | React-based, renders headlessly |
| Backgrounds | `TealBackground` + `ParticleBackground` | Copy from reference — NEVER improvise grids |
| B-roll | AI image gen → Ken Burns ffmpeg → MP4 | When stock fails (see below) |
| Stock footage | Pexels API + vision QA gate | Vision score ≥ 3/5 required before download |
| VO generation | ElevenLabs via `ELEVENLABS_API_KEY` | One `curl` call for full script |
| Audio mix | ffmpeg | Fade in/out with `-af afade` |
| Image generation | Gemini 3 Pro Image via `nano-banana-pro` skill | Best photorealism for B-roll |
| Soundtrack | Free from Filmmusic.io / Kevin MacLeod | Trim to exact video duration |
| Fonts | Gilroy (Bold 700, SemiBold 600, Medium 500) | WOFF2 in `public/fonts/` |
| Logo | `cireta_colored_trimmed.png` 1134×300px | Icon = first 300px |

---

## Brand Spec (DO NOT DEVIATE)

| Property | Value |
|----------|-------|
| Primary BG | `#0d2e2c` (dark teal) |
| Accent | `#1ef0e0` (bright teal/cyan) |
| Secondary accent | `#1a9090` |
| Text primary | `#ffffff` |
| Text accent | `#1ef0e0` |
| Final frame BG | `#000000` (black — logo on black) |
| Font | Gilroy 700 for all headlines |
| Letter spacing | `-0.025em` to `-0.03em` on large text |

### Background — LOCKED (copy from reference, never invent)

Every text scene MUST use:
```tsx
import { TealBackground } from "../TealBackground";
import { ParticleBackground } from "../ParticleBackground";

// Inside the scene JSX:
<TealBackground />
<ParticleBackground />  // default opacity={1} — never pass opacity < 1
```

**What TealBackground is:** `#0d2e2c` base + SVG `feTurbulence` fractalNoise texture (opacity 0.07) — subtle grain.

**What ParticleBackground is:** 18 drifting nodes connected by lines (`strokeOpacity={0.2}`, `fillOpacity={0.4}`), slow oscillation ~10s period.

**Never use:** CSS grid overlays (`backgroundImage: linear-gradient...`), custom particle divs, box patterns. These were the source of every "subtle lines" complaint.

### Logo Rules
- On **dark teal** bg: use logo as-is (coloured version)
- On **black** bg (FinalLogoScene): `filter: "brightness(0) invert(1)"` on BOTH icon AND wordmark — otherwise invisible

---

## Project Structure

```
CiretaVids/
├── CLAUDE.md                    ← YOU ARE HERE
├── src/
│   ├── Root.tsx                 ← Remotion composition root + font declarations
│   ├── KarimVideo.tsx           ← Karim brief composition
│   ├── TealBackground.tsx       ← LOCKED brand background (copy from VIDEOFACTORY)
│   ├── ParticleBackground.tsx   ← LOCKED brand particles (copy from VIDEOFACTORY)
│   ├── BRollScene.tsx           ← B-roll video + caption overlay
│   └── scenes/
│       ├── OpeningScene.tsx     ← Opening statement
│       ├── VerifiedScene.tsx    ← 3-beat: Verified / Insured / Tokenized
│       ├── DashboardScene.tsx   ← Stats dashboard mockup
│       └── FinalLogoScene.tsx   ← Logo animation (matches signed-off reference)
├── public/
│   ├── fonts/                   ← Gilroy WOFF2 files
│   ├── imgs/                    ← cireta_colored_trimmed.png
│   ├── audio/                   ← karim_soundtrack.mp3 + karim_vo.mp3
│   └── video_clips/             ← B-roll MP4s + source PNGs
├── scripts/
│   ├── fetch_footage.py         ← Pexels + vision QA gate
│   └── gen_broll.py             ← AI image gen → Ken Burns pipeline (TODO)
└── docs/
    ├── FOOTAGE.md               ← Footage sourcing guide
    ├── SCENES.md                ← Scene-by-scene breakdown
    └── VOICE.md                 ← VO script + pronunciation guide
```

---

## Karim Brief — Scene Breakdown (23s @ 30fps = 690 frames)

| Scene | Frames | Duration | Component | Status |
|-------|--------|----------|-----------|--------|
| 1 Opening | 0–90 | 3s | `OpeningScene` | ✅ |
| 2 B-Roll: Gold Mine | 90–165 | 2.5s | `BRollScene` — gold_mine_trim.mp4 | ✅ AI gen |
| 3 B-Roll: Copper | 165–240 | 2.5s | `BRollScene` — copper_trim.mp4 | ✅ AI gen |
| 4 Verified/Insured/Tokenized | 240–420 | 6s | `VerifiedScene` (3 beats × 2s) | ✅ |
| 5 Dashboard | 420–540 | 4s | `DashboardScene` | ✅ |
| 6 Final Logo | 540–690 | 5s | `FinalLogoScene` | ✅ |

---

## Making a New Video — Complete Workflow

### Step 0: Read the Brief Properly

Extract exact visual requirements per scene BEFORE writing any code:
- What does each B-roll shot need to SHOW?
- What must it NOT be? (e.g. "aerial gold mine" ≠ limestone quarry)
- What's the client's brand colour, font, logo animation?

### Step 1: Create Composition

Copy `KarimVideo.tsx` as a starting point. Update:
- Scene durations in `Series.Sequence durationInFrames`
- Total frames in `Root.tsx` `durationInFrames`
- VO and soundtrack audio paths

### Step 2: Source B-Roll (CRITICAL PATH)

**Option A — Pexels (try first):**
```bash
export PEXELS_API_KEY="..."
export OPENROUTER_API_KEY="..."
python3 scripts/fetch_footage.py
```
The QA gate will reject anything scoring < 3/5. If it fails → Option B.

**Option B — AI Image Generation (preferred fallback):**
```bash
SKILL_DIR="/opt/homebrew/lib/node_modules/openclaw/skills/nano-banana-pro"

uv run $SKILL_DIR/scripts/generate_image.py \
  --prompt "YOUR PROMPT HERE" \
  --filename "output.png" \
  --resolution 2K \
  --aspect-ratio 16:9
```

Then run vision QA on the generated image before converting to video:
```python
# Vision check (informal — use image tool):
# "Rate 1-5 for use as [brief description] B-roll in a premium brand video"
# Minimum 3/5 to proceed
```

Then Ken Burns → MP4:
```bash
# Zoom in (epic reveal):
ffmpeg -y -loop 1 -i image.png \
  -vf "scale=8000:-1,zoompan=z='zoom+0.0012':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=75:s=1920x1080:fps=30" \
  -t 2.5 -c:v libx264 -pix_fmt yuv420p \
  public/video_clips/clip_trim.mp4

# Pan left→right:
ffmpeg -y -loop 1 -i image.png \
  -vf "scale=8000:-1,zoompan=z='1.08':x='if(lte(on,1),iw/2-iw/zoom/2,x+0.8)':y='ih/2-(ih/zoom/2)':d=75:s=1920x1080:fps=30" \
  -t 2.5 -c:v libx264 -pix_fmt yuv420p \
  public/video_clips/clip_trim.mp4

# Slow push in:
ffmpeg -y -loop 1 -i image.png \
  -vf "scale=8000:-1,zoompan=z='min(zoom+0.001,1.15)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=75:s=1920x1080:fps=30" \
  -t 2.5 -c:v libx264 -pix_fmt yuv420p \
  public/video_clips/clip_trim.mp4
```

**Note:** `d=75` = 2.5s @ 30fps. Adjust for your scene duration.

### Step 3: AI Image Generation — Prompting Guide

Model: **Gemini 3 Pro Image** via `nano-banana-pro` skill.

**Prompt formula:**
```
[Shot type + subject] + [Lighting/time of day] + [Specific details that make it authentic] + [Mood/feel] + [Technical spec if needed]
```

**Examples that scored 4-5/5:**

| Subject | Prompt that worked |
|---------|-------------------|
| Aerial gold mine | `"Photorealistic aerial drone photograph of a vast open-pit gold mine at sunrise. Golden hour light raking across terraced rock faces, warm orange and amber tones, long dramatic shadows. Haul trucks tiny against epic scale. Dust catching first light. Cinematic, dramatic, shot from 400m altitude at 45 degree angle. Western Australia red laterite geology."` |
| Copper cathodes | `"Photorealistic close-up photograph of stacked copper cathode plates in an industrial warehouse. Rows of flat rectangular copper sheets with characteristic pinkish-orange metallic surface and rough crystalline texture. Dramatic side lighting creating shadows between plates. Premium industrial quality, high contrast, sharp detail."` |
| Gold bars | `"Photorealistic close-up photograph of gold bullion bars. Focus on surface texture, warm metallic glow, genuine reflections and micro-scratches on the surface. Abstract framing — no serial numbers or branding visible, just the rich golden surface and weight of the metal. Dramatic directional lighting, shallow depth of field, cinematic quality. Several bars stacked, warm amber light."` |

**What NOT to do:**
- Don't ask for serial numbers/branding → will be fake and visible → credibility risk
- Don't ask for specific refinery names ("Swiss Bank", "LBMA") → AI invents them wrong
- Do ask for "no text", "no branding", "abstract framing" for close-up product shots
- Always use `--resolution 2K --aspect-ratio 16:9` for B-roll

**Always vision-check before converting to video:**
Use the `image` tool with: `"Rate 1-5 for [brief criteria]. Does it look photorealistic? Any credibility issues?"`

### Step 4: Generate VO

Single curl call for the full script. Use ElevenLabs Charlotte voice:
```bash
curl -s -X POST "https://api.elevenlabs.io/v1/text-to-speech/XB0fDUnXU5powFXDhCwa" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "YOUR FULL SCRIPT HERE",
    "model_id": "eleven_multilingual_v2",
    "voice_settings": {
      "stability": 0.45,
      "similarity_boost": 0.82,
      "style": 0.3,
      "use_speaker_boost": true
    }
  }' \
  -o /tmp/vo_raw.mp3

ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1 /tmp/vo_raw.mp3
```

Then add fade in/out:
```bash
ffmpeg -y -i /tmp/vo_raw.mp3 \
  -af "afade=t=in:st=0:d=0.3,afade=t=out:st=XX:d=0.7" \
  -c:a libmp3lame -b:a 128k \
  public/audio/vo.mp3
```
(Replace XX with `duration - 0.8`)

**Pronunciation — Cireta brand name:** `"Sireta"` in the text → ElevenLabs says it correctly as "Si-REE-tah". Do NOT use "Si-ret-ah" or "Seeretah" spellings — they produce wrong results. Just write `Sireta` naturally.

**If pronunciation is off on a single line:** Splice instead of re-doing the full VO:
```bash
# 1. Generate just the problem line with corrected phonetic spelling
# 2. Trim original up to the cut point: ffmpeg -y -i full_vo.mp3 -t CUT_SECONDS body.mp3
# 3. Concat: ffmpeg -y -i body.mp3 -i new_line.mp3 -filter_complex "[0:a][1:a]concat=n=2:v=0:a=1" output.mp3
```

### Step 5: Soundtrack

Trim soundtrack to exact video duration, duck under VO:
```bash
ffmpeg -y -i source_track.mp3 \
  -t VIDEO_DURATION_SECONDS \
  -af "afade=t=out:st=FADE_START:d=3,volume=0.22" \
  -c:a libmp3lame -b:a 128k \
  public/audio/soundtrack.mp3
```
- `volume=0.22` when VO present (VO takes priority)
- `volume=0.45` when no VO

Wire into composition:
```tsx
<Audio src={staticFile("audio/soundtrack.mp3")} volume={0.22} />
<Audio src={staticFile("audio/vo.mp3")} volume={1} />
```

### Step 6: TypeScript Check

```bash
./node_modules/.bin/tsc --noEmit
```
Must be clean before render.

### Step 7: Render

```bash
# 16:9 (1920×1080)
npx remotion render src/Root.tsx CompositionId output/video-16x9.mp4 --concurrency=4

# 1:1 (1080×1080) — update Root.tsx width/height before render
npx remotion render src/Root.tsx CompositionId-1x1 output/video-1x1.mp4 --concurrency=4

# 9:16 (1080×1920)
npx remotion render src/Root.tsx CompositionId-9x16 output/video-9x16.mp4 --concurrency=4
```

---

## The FinalLogoScene Animation (LOCKED)

Exact replication of Cireta's signed-off brand motion. DO NOT change the timing.

| Phase | Frames | What happens |
|-------|--------|-------------|
| 1 | 0–4 | Black bg appears |
| 2 | 4–22 | Icon scales from dot: 0→1.08 (spring overshoot), settles at 1.0 |
| 3 | 4–22 | Icon rotates 45°→0° simultaneously |
| 4 | 18–34 | Icon slides left from screen centre (960px) to lockup position (821px) |
| 5 | 26–42 | Wordmark `clipPath` wipes in left→right |
| 6 | 38–52 | Tagline "Own What's Real." fades in below |
| 7 | 135–150 | Full fade out |

**Logo geometry (1134×300px PNG):**
```
LOGO_DISPLAY_H = 100px
LOGO_DISPLAY_W = 378px  (1134/300 × 100)
ICON_DISPLAY_W = 100px  (300/1134 × 378)
WORDMARK_LEFT  = 960 - 189 + 100 = 871px
```

**On black background:** BOTH icon and wordmark need `filter: "brightness(0) invert(1)"`. Missing this = invisible logo.

---

## The VerifiedScene — 3-Beat Structure

Each beat is 60 frames (2s). Icon draws itself, then word fades in with subtitle.

| Beat | Word | Icon | Subtitle |
|------|------|------|---------|
| 0–60 | Verified. | Animated checkmark in circle | "Third-party audited" |
| 60–120 | Insured. | Shield outline draws itself | "Fully covered assets" |
| 120–180 | Tokenized. | Hexagon assembles + T symbol | "On-chain. Always." |

"Tokenized." is the only word in teal (`#1ef0e0`). The others are white.

---

## Common Mistakes & Fixes

| Mistake | Fix |
|---------|-----|
| Grid lines visible | Remove all `backgroundImage: linear-gradient` — use `TealBackground` + `ParticleBackground` only |
| Logo invisible on black bg | Add `filter: "brightness(0) invert(1)"` to BOTH icon and wordmark `<Img>` |
| Wrong B-roll footage | Never download first Pexels result — run vision QA gate first. For niche industrial (gold mines, copper cathodes) — Pexels is almost always wrong. Go straight to AI gen. |
| AI gen gold bars have fake serial numbers | Add "no serial numbers, no branding visible, abstract framing" to prompt |
| ffmpeg concat runs forever | Never use `anullsrc` without explicit `-t` duration limit |
| Brand name mispronounced | Write "Sireta" (not "Si-ret-ah" or "Seeretah") in ElevenLabs text |
| ParticleBackground too faint | Never pass `opacity < 1` — default is correct; the lines are intentionally subtle at full opacity |
| TypeScript errors on render | Always run `./node_modules/.bin/tsc --noEmit` first |
| Composition ID has underscore | Remotion doesn't allow underscores in IDs — use hyphens (`KarimVideo-16x9`) |

---

## Stock Footage Reality Check

| Platform | Good for | Terrible for |
|----------|----------|-------------|
| Pexels (free) | Lifestyle, nature, urban, generic business | Niche industrial (mines, refineries, specific metals) |
| Coverr (free) | Same limitations as Pexels | Same |
| Artgrid (~$200/yr) | Cinematic everything | Cost |
| Pond5 (per clip ~$50) | Specific industrial, niche subjects | Cost per clip |
| **AI gen (free)** | **When brief requires niche industrial — use this first** | Scenes requiring real people, logos, text |

**Rule of thumb:** If the brief says "aerial [specific location/industry]" or "[specific product close-up]" — skip Pexels entirely and go straight to AI image gen.

---

## Audio Checklist Before Render

- [ ] `public/audio/karim_soundtrack.mp3` — trimmed to video duration, fades out
- [ ] `public/audio/karim_vo.mp3` — VO with fade in/out, correct brand name pronunciation
- [ ] Verify with `ffprobe -v error -show_entries format=duration ...` — check for corrupted files (>50MB MP3 = corrupt)
- [ ] Both wired into composition with correct volumes (VO=1, music=0.22)

---

## Attribution

Soundtrack: "Covert Affair" sourced from Filmmusic.io
ElevenLabs voice: Charlotte (`XB0fDUnXU5powFXDhCwa`) — British, confident, warm
B-roll: AI-generated via Gemini 3 Pro Image (Google)
