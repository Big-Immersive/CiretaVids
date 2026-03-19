# Scene Reference

## Scene 1 — HookScene (3s)
**Purpose:** Open with a provocative question that frames the problem.  
**Style:** Large white bold text, teal bg, particles, spring animation from bottom.  
**Edit:** `src/scenes/HookScene.tsx` → change the `<p>` text content.  
**Example:** "What does asset-backed actually mean?"

## Scene 2-5 — BRollScene (2-4s each)
**Purpose:** Visual proof points with caption overlays.  
**Style:** Video fill, white caption top-right, teal accent line, fade in.  
**Edit:** `CiretaVideo.tsx` → `videoFile` prop + `caption` prop per sequence.  
**Captions should be:** ALL CAPS, 2-3 words max. e.g. "REAL ASSETS", "VERIFIED & STORED"

## Scene 6 — TokenScene (6s)
**Purpose:** Abstract concept visualisation — fractional ownership / tokenization.  
**Style:** Dark teal bg, SVG wireframe rings (armillary sphere), fade-to-fragments, centred text.  
**Edit:** `src/scenes/TokenScene.tsx`:
- Text in `TextOverlay` component (bottom of file)
- Ring sizes: `R1x`, `R1y`, `R2x`, `R2y`
- Number of slices: `SLICES`

## Scene 7 — ClosingScene (3s)
**Purpose:** Brand statement — two lines, staggered entry.  
**Style:** Teal bg + particles, Line 1 white, Line 2 in accent teal.  
**Edit:** `src/scenes/ClosingScene.tsx` → two `<p>` elements.  
**Example:** Line 1: "Real assets." / Line 2: "Digital ownership."

## Scene 8 — LogoEndCard (2s) — DO NOT EDIT
**Purpose:** Brand lockup reveal, exactly matching Cireta official motion.  
**Style:** White bg, star→icon morph, wordmark wipe.  
**Logic:** Hardcoded to match Cireta's brand video — treat as locked.
