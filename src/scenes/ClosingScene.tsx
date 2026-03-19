import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ParticleBackground } from "../ParticleBackground";

const CLAMP = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

export const ClosingScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Line 1 fades in immediately
  const line1Opacity = interpolate(frame, [0, 20], [0, 1], CLAMP);
  const line1Y = interpolate(frame, [0, 20], [25, 0], CLAMP);

  // Line 2 fades in 20 frames later
  const line2Opacity = interpolate(frame, [20, 40], [0, 1], CLAMP);
  const line2Y = interpolate(frame, [20, 40], [25, 0], CLAMP);

  // Background glow pulses slightly
  const glowPulse = Math.sin((frame / 20) * Math.PI) * 0.5 + 0.5;
  const glowOpacity = interpolate(glowPulse, [0, 1], [0.08, 0.18], CLAMP);

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

      {/* Soft radial gradient glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          height: 400,
          background:
            "radial-gradient(ellipse, rgba(26,107,115,0.4) 0%, transparent 70%)",
          opacity: glowOpacity,
          zIndex: 1,
        }}
      />

      {/* Text content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          textAlign: "center",
        }}
      >
        {/* Line 1: "Real assets." */}
        <div
          style={{
            opacity: line1Opacity,
            transform: `translateY(${line1Y}px)`,
          }}
        >
          <p
            style={{
              fontFamily: "Gilroy",
              fontWeight: 700,
              fontSize: 68,
              color: "#ffffff",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Real assets.
          </p>
        </div>

        {/* Line 2: "Digital ownership." */}
        <div
          style={{
            opacity: line2Opacity,
            transform: `translateY(${line2Y}px)`,
          }}
        >
          <p
            style={{
              fontFamily: "Gilroy",
              fontWeight: 700,
              fontSize: 68,
              color: "#2a9b8a",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Digital ownership.
          </p>
        </div>
      </div>
    </div>
  );
};
