import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { ParticleBackground } from "../ParticleBackground";

const CLAMP = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

export const AnimatedTextScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Star — fully visible from frame 0, subtle scale spring
  const starSpring = spring({
    fps,
    frame,
    config: { damping: 80, stiffness: 200 },
  });
  const starScale = interpolate(starSpring, [0, 1], [0.9, 1.0], CLAMP);
  const starOpacity = 1;

  // Text — visible from frame 0, subtle rise-in
  const textOpacity = interpolate(frame, [0, 12], [0, 1], CLAMP);
  const textTranslateY = interpolate(frame, [0, 15], [12, 0], CLAMP);

  // Decorative line at frame 10
  const lineOpacity = interpolate(frame, [10, 25], [0, 1], CLAMP);

  // Pulsing glow on star
  const glowPulse = Math.sin((frame / 30) * Math.PI) * 0.5 + 0.5;
  const glowOpacity = interpolate(glowPulse, [0, 1], [0.15, 0.35], CLAMP);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "#0d2e2c",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <ParticleBackground />

      {/* Radial glow behind star */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)",
          opacity: glowOpacity,
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 32,
        }}
      >
        {/* Cireta Star SVG */}
        <div
          style={{
            opacity: starOpacity,
            transform: `scale(${starScale})`,
          }}
        >
          <svg viewBox="0 0 100 100" width={90} height={90}>
            <circle cx="50" cy="50" r="48" fill="white" />
            <path
              d="M50 10 L55 45 L90 50 L55 55 L50 90 L45 55 L10 50 L45 45 Z"
              fill="#0d2e2c"
            />
          </svg>
        </div>

        {/* Main text */}
        <div
          style={{
            opacity: textOpacity,
            transform: `translateY(${textTranslateY}px)`,
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontFamily: "Gilroy",
              fontWeight: 600,
              fontSize: 52,
              color: "#ffffff",
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            Tokens represent
            <br />
            fractional ownership
          </p>
        </div>

        {/* Decorative 3-arc line */}
        <div style={{ opacity: lineOpacity }}>
          <svg viewBox="0 0 200 20" width={220} height={22}>
            <path d="M10 10 Q50 2 90 10" fill="none" stroke="#1a6b73" strokeWidth={2} strokeLinecap="round" />
            <path d="M70 10 Q100 18 130 10" fill="none" stroke="#1a6b73" strokeWidth={2} strokeLinecap="round" />
            <path d="M110 10 Q150 2 190 10" fill="none" stroke="#1a6b73" strokeWidth={2} strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
};
