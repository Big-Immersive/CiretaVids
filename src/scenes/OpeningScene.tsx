/**
 * OpeningScene — 0-3s (90 frames)
 * Brand TealBackground + ParticleBackground (matches signed-off reference video)
 * "Most investments hide the asset."
 */
import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { TealBackground } from "../TealBackground";
import { ParticleBackground } from "../ParticleBackground";

const CLAMP = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export const OpeningScene: React.FC = () => {
  const frame = useCurrentFrame();

  const textOpacity = interpolate(frame, [8, 28], [0, 1], CLAMP);
  const textY = interpolate(frame, [8, 28], [28, 0], CLAMP);

  // Subtle chaos flash at end (frames 60-85)
  const flashOpacity = interpolate(frame, [58, 68, 76, 86], [0, 0.55, 0.55, 0], CLAMP);

  return (
    <div style={{
      position: "absolute", inset: 0,
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <TealBackground />
      <ParticleBackground />

      {/* Radial vignette */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at center, transparent 35%, rgba(5,15,14,0.6) 100%)",
        pointerEvents: "none",
      }} />

      {/* Centred text */}
      <div style={{
        position: "relative", zIndex: 2,
        textAlign: "center",
        opacity: textOpacity,
        transform: `translateY(${textY}px)`,
        padding: "0 160px",
      }}>
        <p style={{
          fontFamily: "Gilroy",
          fontWeight: 700,
          fontSize: 76,
          color: "#ffffff",
          margin: 0,
          lineHeight: 1.15,
          letterSpacing: "-0.025em",
        }}>
          Most investments
        </p>
        <p style={{
          fontFamily: "Gilroy",
          fontWeight: 700,
          fontSize: 76,
          color: "rgba(255,255,255,0.45)",
          margin: 0,
          lineHeight: 1.15,
          letterSpacing: "-0.025em",
        }}>
          hide the asset.
        </p>
      </div>

      {/* Chaotic trading overlay flash */}
      <div style={{
        position: "absolute", inset: 0,
        opacity: flashOpacity,
        zIndex: 3,
        background: "radial-gradient(ellipse at center, rgba(239,68,68,0.08) 0%, transparent 70%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        pointerEvents: "none",
      }}>
        <p style={{
          fontFamily: "monospace",
          fontSize: 11,
          color: "rgba(156,163,175,0.4)",
          letterSpacing: "0.35em",
          textTransform: "uppercase",
        }}>
          ETF · FUND · INDEX · DERIVATIVE · PAPER
        </p>
      </div>
    </div>
  );
};
