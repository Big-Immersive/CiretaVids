# VO Script Template

## Voice Spec
- **Provider:** ElevenLabs
- **Voice:** Charlotte — `XB0fDUnXU5powFXDhCwa` (British, warm, confident)
- **Alternative:** Adam (deeper/authoritative), Antoni (American neutral)
- **CRITICAL:** Generate lines ONE AT A TIME — parallel calls hit rate limits

## Script Template (26s video)

```
[Hook — 0-3s]
"[Opening question or bold statement that frames the problem]"

[B-Roll 1 — 3-6s]  
"[Real assets. Short. Punchy. Subject of the video.]"

[B-Roll 2 — 6-10s]
"[Verified, stored, secured. Process step 1.]"

[B-Roll 3 — 10-13s]
"[Certified. Recorded. Process step 2.]"

[B-Roll 4 — 13-15s]
"[Then [key verb]. The transformation moment.]"

[Token/3D Scene — 15-21s]
"[Each [unit], a fractional share of something real. The concept explained.]"

[Closing — 21-24s]
"[Brand promise line 1. Brand promise line 2.]"

[Logo reveal — 24-26s]
[SILENCE — let the logo breathe]
```

## Timing Rules
- Each line must be SHORTER than its scene window
- Check duration: `ffprobe -v quiet -show_entries format=duration -of csv=p=0 vo_01.mp3`
- If a line is too long, split it or rewrite it shorter
- Leave 0.3-0.5s gap at end of each scene for breath

## Cadence Notes
- Short declarative sentences work best: "Real assets. Gold, metals, commodities."
- Avoid conjunctions — period separations create natural pauses
- End each line on a strong noun or verb, not a preposition
- The closing scene line should feel like a brand manifesto

## Generation Script (run sequentially)

```python
# Generate each line, convert, check duration
lines = [
    ("vo_01", "What if your investment had a physical address?"),
    ("vo_02", "Real assets. Gold, metals, commodities."),
    ("vo_03", "Verified, stored, and secured."),
    ("vo_04", "Legally certified, and recorded on-chain."),
    ("vo_05", "Then tokenized."),
    ("vo_06", "Each token, a fractional share of something real."),
    ("vo_07", "Real assets. Digital ownership."),
]
# → Use OpenClaw tts tool for each, convert opus→mp3, then mix
```
