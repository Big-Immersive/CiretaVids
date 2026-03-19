/**
 * OpeningScene — 0-3s (90 frames)
 * Black bg, particles, centred bold text reveal
 * "Most investments hide the asset."
 */
import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

const CLAMP = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export const OpeningScene: React.FC = () => {
  const frame = useCurrentFrame();

  const textOpacity = interpolate(frame, [8, 28], [0, 1], CLAMP);
  const textY = interpolate(frame, [8, 28], [28, 0], CLAMP);

  // Subtle chaos flash at end (frames 60-85): red/green tint
  const flashOpacity = interpolate(frame, [58, 68, 76, 86], [0, 0.55, 0.55, 0], CLAMP);

  // Particles — stable seed values
  const particles = [
    { x: 8,  y: 15, size: 2.2, speed: 0.07 },
    { x: 22, y: 70, size: 1.5, speed: 0.05 },
    { x: 38, y: 30, size: 1.8, speed: 0.09 },
    { x: 55, y: 85, size: 2.5, speed: 0.06 },
    { x: 68, y: 20, size: 1.4, speed: 0.11 },
    { x: 80, y: 55, size: 2,   speed: 0.08 },
    { x: 92, y: 40, size: 1.6, speed: 0.1  },
    { x: 15, y: 92, size: 1.2, speed: 0.12 },
    { x: 47, y: 10, size: 2.3, speed: 0.07 },
    { x: 73, y: 78, size: 1.5, speed: 0.09 },
    { x: 32, y: 50, size: 1,   speed: 0.13 },
    { x: 88, y: 88, size: 1.8, speed: 0.06 },
  ];

  return (
    <div style={{
      position: "absolute", inset: 0,
      backgroundColor: "#000000",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {/* Particles */}
      {particles.map((p, i) => {
        const drift = (frame * p.speed) % 100;
        return (
          <div key={i} style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${(p.y + drift) % 105}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            backgroundColor: "#1ef0e0",
            opacity: 0.45,
            boxShadow: `0 0 ${p.size * 4}px #1ef0e0`,
          }} />
        );
      })}

      {/* Radial vignette */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.75) 100%)",
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
