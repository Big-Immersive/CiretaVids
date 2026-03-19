/**
 * FinalLogoScene — 18-20s (540-600 frames, 2s)
 * Black bg, centred logo, "Own What's Real." tagline, subtle glow pulse, fade out
 */
import React from "react";
import { useCurrentFrame, interpolate, staticFile, Img } from "remotion";

const CLAMP = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// Logo geometry (1134×300px image)
const LOGO_NATURAL_W = 1134;
const LOGO_NATURAL_H = 300;
const ICON_RATIO = 300 / LOGO_NATURAL_W;
const LOGO_DISPLAY_H = 90;
const LOGO_DISPLAY_W = (LOGO_NATURAL_W / LOGO_NATURAL_H) * LOGO_DISPLAY_H;
const ICON_DISPLAY_W = ICON_RATIO * LOGO_DISPLAY_W;
const WORDMARK_DISPLAY_W = LOGO_DISPLAY_W - ICON_DISPLAY_W;

export const FinalLogoScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Fade everything in fast
  const logoOpacity = interpolate(frame, [0, 18], [0, 1], CLAMP);
  const taglineOpacity = interpolate(frame, [12, 30], [0, 1], CLAMP);
  const taglineY = interpolate(frame, [12, 30], [12, 0], CLAMP);

  // Fade out at end
  const fadeOut = interpolate(frame, [48, 60], [1, 0], CLAMP);

  // Glow pulse
  const glow = Math.sin((frame / 20) * Math.PI) * 0.5 + 0.5;
  const glowSize = 30 + glow * 20;
  const glowOpacity = 0.3 + glow * 0.2;

  // Icon slide animation (mini version of LogoEndCard)
  const iconScale = interpolate(frame, [0, 14], [0.7, 1], CLAMP);
  const wordmarkReveal = interpolate(frame, [8, 22], [0, 100], CLAMP);

  const iconCenterX = 0; // relative, we centre the whole lockup

  return (
    <div style={{
      position: "absolute", inset: 0,
      backgroundColor: "#000000",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      opacity: fadeOut,
    }}>
      {/* Glow behind logo */}
      <div style={{
        position: "absolute",
        width: 300,
        height: 200,
        borderRadius: "50%",
        background: `radial-gradient(ellipse, rgba(30,240,224,${glowOpacity * 0.4}) 0%, transparent 70%)`,
        filter: `blur(${glowSize}px)`,
        opacity: logoOpacity,
      }} />

      {/* Logo lockup — white version on black */}
      <div style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        opacity: logoOpacity,
        marginBottom: 28,
      }}>
        {/* Icon */}
        <div style={{
          width: ICON_DISPLAY_W,
          height: LOGO_DISPLAY_H,
          overflow: "hidden",
          transform: `scale(${iconScale})`,
          transformOrigin: "center center",
          flexShrink: 0,
        }}>
          <Img
            src={staticFile("imgs/cireta_colored_trimmed.png")}
            style={{
              width: LOGO_DISPLAY_W,
              height: LOGO_DISPLAY_H,
              objectFit: "contain",
              // Invert to white for black background
              filter: "brightness(0) invert(1)",
            }}
          />
        </div>

        {/* Wordmark */}
        <div style={{
          width: WORDMARK_DISPLAY_W,
          height: LOGO_DISPLAY_H,
          overflow: "hidden",
          clipPath: `inset(0 ${100 - wordmarkReveal}% 0 0)`,
        }}>
          <Img
            src={staticFile("imgs/cireta_colored_trimmed.png")}
            style={{
              width: LOGO_DISPLAY_W,
              height: LOGO_DISPLAY_H,
              objectFit: "contain",
              marginLeft: -ICON_DISPLAY_W,
              filter: "brightness(0) invert(1)",
            }}
          />
        </div>
      </div>

      {/* Tagline */}
      <div style={{
        opacity: taglineOpacity,
        transform: `translateY(${taglineY}px)`,
      }}>
        <p style={{
          fontFamily: "Gilroy",
          fontWeight: 500,
          fontSize: 20,
          color: "rgba(255,255,255,0.55)",
          margin: 0,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
        }}>
          Own What's Real.
        </p>
      </div>

      {/* Bottom line accent */}
      <div style={{
        position: "absolute",
        bottom: 60,
        left: "50%",
        transform: "translateX(-50%)",
        width: interpolate(frame, [20, 45], [0, 120], CLAMP),
        height: 1,
        backgroundColor: "#1ef0e0",
        opacity: logoOpacity * 0.5,
      }} />
    </div>
  );
};
