import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { ParticleBackground } from "../ParticleBackground";
import { TealBackground } from "../TealBackground";

const CLAMP = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [0, 20], [0, 1], CLAMP);
  const sp = spring({ fps, frame, config: { damping: 80, stiffness: 200 } });
  const translateY = interpolate(sp, [0, 1], [30, 0], CLAMP);

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
      }}
    >
      <TealBackground />
      <ParticleBackground />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          opacity,
          transform: `translateY(${translateY}px)`,
          textAlign: "center",
          padding: "0 80px",
        }}
      >
        <p
          style={{
            fontFamily: "Gilroy",
            fontWeight: 700,
            fontSize: 72,
            color: "#ffffff",
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          What does asset-backed
          <br />
          actually mean?
        </p>
      </div>
    </div>
  );
};
