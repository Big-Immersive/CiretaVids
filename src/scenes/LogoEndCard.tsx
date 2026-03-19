import React from "react";
import { useCurrentFrame, interpolate, staticFile, Img } from "remotion";

const CLAMP = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

// Logo image is 1134×300px
// Icon occupies first ~300px (square), wordmark the remaining 834px
const LOGO_NATURAL_W = 1134;
const LOGO_NATURAL_H = 300;
const ICON_RATIO = 300 / LOGO_NATURAL_W; // ~0.265 — fraction of total width that is icon

export const LogoEndCard: React.FC = () => {
  const frame = useCurrentFrame();

  // ─── PHASE 1 (frames 0–4): Teal → White flash ─────────────────────────────
  const bgOpacity = interpolate(frame, [0, 4], [0, 1], CLAMP);

  // ─── PHASE 2 (frames 4–16): Tiny dot scales into full icon ────────────────
  // Star scale: 0 → 1, with a slight overshoot (spring feel)
  const starRawScale = interpolate(frame, [4, 16], [0, 1.08], CLAMP);
  const starSettle = interpolate(frame, [16, 22], [1.08, 1.0], CLAMP);
  const starScale = frame < 16 ? starRawScale : starSettle;

  // ─── PHASE 3 (frames 8–22): Icon rotates from star → final form ──────────
  // In the video the star shape spins/morphs. We approximate this with a
  // rotation from 45° (star orientation) down to 0° (final icon orientation)
  const iconRotation = interpolate(frame, [4, 22], [45, 0], CLAMP);

  // ─── PHASE 4 (frames 18–34): Icon slides left from center ─────────────────
  // Final target: icon is left-of-center to make room for wordmark
  // Logo lockup is centered as a unit. At 1920×1080, center = 960.
  // Logo display height ≈ 100px → display width ≈ 378px (1134/300 * 100)
  // Icon display width ≈ 100px, wordmark ≈ 278px, gap ≈ 0
  // Lockup total: 378px centered → starts at x = 960 - 189 = 771
  const LOGO_DISPLAY_H = 100;
  const LOGO_DISPLAY_W = (LOGO_NATURAL_W / LOGO_NATURAL_H) * LOGO_DISPLAY_H; // 378px
  const ICON_DISPLAY_W = ICON_RATIO * LOGO_DISPLAY_W; // ~100px

  // Icon center X: starts at 960 (screen center), slides to lockup icon center
  // Lockup starts at 960 - LOGO_DISPLAY_W/2 = 960 - 189 = 771
  // Icon center in lockup = 771 + 50 = 821
  const iconCenterX = interpolate(frame, [18, 34], [960, 821], CLAMP);

  // ─── PHASE 5 (frames 26–42): Wordmark wipes in left→right ────────────────
  const wordmarkClip = interpolate(frame, [26, 42], [0, 100], CLAMP);

  // ─── Overall icon opacity (in from the start) ─────────────────────────────
  const iconOpacity = interpolate(frame, [4, 8], [0, 1], CLAMP);

  // ─── Wordmark: sits right of icon in the lockup ───────────────────────────
  // Wordmark display width = total - icon
  const WORDMARK_DISPLAY_W = LOGO_DISPLAY_W - ICON_DISPLAY_W; // ~278px
  // Wordmark left edge in screen coords:
  const wordmarkLeft = 960 - LOGO_DISPLAY_W / 2 + ICON_DISPLAY_W;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "#0d2e2c", // teal base — shows through during flash
      }}
    >
      {/* White flash overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#ffffff",
          opacity: bgOpacity,
        }}
      />

      {/* ── ICON MARK ─────────────────────────────────────────────────────── */}
      {/* Clips to icon portion of the logo PNG, rotates + scales from center */}
      <div
        style={{
          position: "absolute",
          // Position so the icon center is at iconCenterX, vertically centered
          left: iconCenterX - ICON_DISPLAY_W / 2,
          top: "50%",
          marginTop: -LOGO_DISPLAY_H / 2,
          width: ICON_DISPLAY_W,
          height: LOGO_DISPLAY_H,
          overflow: "hidden",
          opacity: iconOpacity,
          transform: `scale(${starScale}) rotate(${iconRotation}deg)`,
          transformOrigin: "center center",
        }}
      >
        {/* Full logo image, shifted left so only the icon portion is visible */}
        <Img
          src={staticFile("imgs/cireta_colored_trimmed.png")}
          style={{
            width: LOGO_DISPLAY_W,
            height: LOGO_DISPLAY_H,
            objectFit: "contain",
            flexShrink: 0,
          }}
        />
      </div>

      {/* ── WORDMARK ──────────────────────────────────────────────────────── */}
      {/* Clips to wordmark portion of logo, reveals left→right */}
      <div
        style={{
          position: "absolute",
          left: wordmarkLeft,
          top: "50%",
          marginTop: -LOGO_DISPLAY_H / 2,
          width: WORDMARK_DISPLAY_W,
          height: LOGO_DISPLAY_H,
          overflow: "hidden",
          // Clip reveal: expand from 0% to 100% width
          clipPath: `inset(0 ${100 - wordmarkClip}% 0 0)`,
        }}
      >
        {/* Full logo image, shifted left so only the wordmark portion is visible */}
        <Img
          src={staticFile("imgs/cireta_colored_trimmed.png")}
          style={{
            width: LOGO_DISPLAY_W,
            height: LOGO_DISPLAY_H,
            objectFit: "contain",
            flexShrink: 0,
            marginLeft: -ICON_DISPLAY_W,
          }}
        />
      </div>
    </div>
  );
};
