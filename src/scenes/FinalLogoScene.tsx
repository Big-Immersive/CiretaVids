/**
 * FinalLogoScene — 18-20s (540-600 frames, 2s)
 * EXACT same animation as the original LogoEndCard, but on black background.
 *
 * Phase 1 (0–4):   Black bg appears
 * Phase 2 (4–22):  Icon scales in from tiny dot with spring overshoot + 45° rotation
 * Phase 3 (18–34): Icon slides left from screen centre to lockup position
 * Phase 4 (26–42): Wordmark wipes in left→right (clip-path reveal)
 * Phase 5 (48–60): Fade out
 */
import React from "react";
import { useCurrentFrame, interpolate, staticFile, Img } from "remotion";

const CLAMP = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// Logo geometry (1134×300px image)
const LOGO_NATURAL_W = 1134;
const LOGO_NATURAL_H = 300;
const ICON_RATIO = 300 / LOGO_NATURAL_W; // ~0.265
const LOGO_DISPLAY_H = 100;
const LOGO_DISPLAY_W  = (LOGO_NATURAL_W / LOGO_NATURAL_H) * LOGO_DISPLAY_H; // 378px
const ICON_DISPLAY_W  = ICON_RATIO * LOGO_DISPLAY_W;                          // ~100px
const WORDMARK_DISPLAY_W = LOGO_DISPLAY_W - ICON_DISPLAY_W;                   // ~278px

export const FinalLogoScene: React.FC = () => {
  const frame = useCurrentFrame();

  // ── Phase 2: Icon scales in with spring overshoot ─────────────────────────
  const starRawScale = interpolate(frame, [4, 16], [0, 1.08], CLAMP);
  const starSettle   = interpolate(frame, [16, 22], [1.08, 1.0], CLAMP);
  const starScale    = frame < 16 ? starRawScale : starSettle;

  // ── Phase 3: Icon rotates 45° → 0° ────────────────────────────────────────
  const iconRotation = interpolate(frame, [4, 22], [45, 0], CLAMP);

  // ── Phase 4: Icon slides left from 960 (screen centre) to lockup ──────────
  // Lockup centred at 960: starts at 960 - LOGO_DISPLAY_W/2 = 771
  // Icon centre in lockup = 771 + ICON_DISPLAY_W/2 = ~821
  const iconCenterX = interpolate(frame, [18, 34], [960, 821], CLAMP);

  // ── Phase 5: Wordmark wipes in ────────────────────────────────────────────
  const wordmarkClip = interpolate(frame, [26, 42], [0, 100], CLAMP);

  // ── Icon opacity ─────────────────────────────────────────────────────────
  const iconOpacity = interpolate(frame, [4, 8], [0, 1], CLAMP);

  // Wordmark left edge (stays fixed once icon reaches lockup position)
  const wordmarkLeft = 960 - LOGO_DISPLAY_W / 2 + ICON_DISPLAY_W;

  // ── Tagline fades in after logo settles ──────────────────────────────────
  const taglineOpacity = interpolate(frame, [38, 52], [0, 1], CLAMP);
  const taglineY       = interpolate(frame, [38, 52], [10, 0], CLAMP);

  // ── Bottom accent line ────────────────────────────────────────────────────
  const lineWidth = interpolate(frame, [32, 50], [0, 120], CLAMP);

  // ── Glow pulse behind logo ────────────────────────────────────────────────
  const glow = Math.sin((frame / 20) * Math.PI) * 0.5 + 0.5;
  const glowOp = interpolate(frame, [4, 18], [0, 0.5], CLAMP) * (0.3 + glow * 0.2);

  // ── Fade out — at end of 150 frames ──────────────────────────────────────
  const fadeOut = interpolate(frame, [135, 150], [1, 0], CLAMP);

  return (
    <div style={{
      position: "absolute", inset: 0,
      backgroundColor: "#000000",
      opacity: fadeOut,
    }}>
      {/* Glow */}
      <div style={{
        position: "absolute",
        left: "50%", top: "50%",
        transform: "translate(-50%, -60%)",
        width: 320, height: 200,
        borderRadius: "50%",
        background: `radial-gradient(ellipse, rgba(30,240,224,0.35) 0%, transparent 70%)`,
        filter: "blur(40px)",
        opacity: glowOp,
        pointerEvents: "none",
      }} />

      {/* ── ICON ─────────────────────────────────────────────────────────── */}
      <div style={{
        position: "absolute",
        left: iconCenterX - ICON_DISPLAY_W / 2,
        top: "50%",
        marginTop: -LOGO_DISPLAY_H / 2,
        width: ICON_DISPLAY_W,
        height: LOGO_DISPLAY_H,
        overflow: "hidden",
        opacity: iconOpacity,
        transform: `scale(${starScale}) rotate(${iconRotation}deg)`,
        transformOrigin: "center center",
      }}>
        <Img
          src={staticFile("imgs/cireta_colored_trimmed.png")}
          style={{
            width: LOGO_DISPLAY_W,
            height: LOGO_DISPLAY_H,
            objectFit: "contain",
            flexShrink: 0,
            filter: "brightness(0) invert(1)",
          }}
        />
      </div>

      {/* ── WORDMARK ─────────────────────────────────────────────────────── */}
      <div style={{
        position: "absolute",
        left: wordmarkLeft,
        top: "50%",
        marginTop: -LOGO_DISPLAY_H / 2,
        width: WORDMARK_DISPLAY_W,
        height: LOGO_DISPLAY_H,
        overflow: "hidden",
        clipPath: `inset(0 ${100 - wordmarkClip}% 0 0)`,
      }}>
        <Img
          src={staticFile("imgs/cireta_colored_trimmed.png")}
          style={{
            width: LOGO_DISPLAY_W,
            height: LOGO_DISPLAY_H,
            objectFit: "contain",
            flexShrink: 0,
            marginLeft: -ICON_DISPLAY_W,
            filter: "brightness(0) invert(1)",
          }}
        />
      </div>

      {/* ── TAGLINE ──────────────────────────────────────────────────────── */}
      <div style={{
        position: "absolute",
        left: "50%", top: "50%",
        transform: `translate(-50%, calc(${LOGO_DISPLAY_H / 2 + 28}px + ${taglineY}px))`,
        opacity: taglineOpacity,
        whiteSpace: "nowrap",
      }}>
        <p style={{
          fontFamily: "Gilroy",
          fontWeight: 500,
          fontSize: 18,
          color: "rgba(255,255,255,0.5)",
          margin: 0,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
        }}>
          Own What's Real.
        </p>
      </div>

      {/* ── BOTTOM ACCENT LINE ───────────────────────────────────────────── */}
      <div style={{
        position: "absolute",
        bottom: 60,
        left: "50%",
        transform: "translateX(-50%)",
        width: lineWidth,
        height: 1,
        backgroundColor: "#1ef0e0",
        opacity: 0.5,
      }} />
    </div>
  );
};
