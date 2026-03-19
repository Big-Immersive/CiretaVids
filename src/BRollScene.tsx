import React from "react";
import { useCurrentFrame, interpolate, staticFile, OffthreadVideo } from "remotion";

const CLAMP = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

interface BRollSceneProps {
  videoFile: string;
  caption: string;
  durationInFrames: number;
}

export const BRollScene: React.FC<BRollSceneProps> = ({
  videoFile,
  caption,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();

  const captionOpacity = interpolate(frame, [5, 25], [0, 1], CLAMP);

  // Card dimensions — video sits in a framed card, not full bleed
  const CARD_W = 1520;
  const CARD_H = 854;
  const CARD_LEFT = (1920 - CARD_W) / 2;
  const CARD_TOP = (1080 - CARD_H) / 2;
  const RADIUS = 20;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
      }}
    >
      {/* ── Textured teal background ── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "#0d2e2c",
        }}
      />
      {/* SVG noise texture overlay */}
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: 0.06,
          pointerEvents: "none",
        }}
      >
        <filter id="noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>

      {/* ── Framed video card ── */}
      <div
        style={{
          position: "absolute",
          top: CARD_TOP,
          left: CARD_LEFT,
          width: CARD_W,
          height: CARD_H,
          borderRadius: RADIUS,
          overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        }}
      >
        {/* Video — OffthreadVideo extracts exact frames via FFmpeg, fixing stutter */}
        <OffthreadVideo
          src={staticFile(`video_clips/${videoFile}`)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        {/* Dark scrim */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "black",
            opacity: 0.25,
          }}
        />
      </div>

      {/* ── Caption — bottom-left of card ── */}
      <div
        style={{
          position: "absolute",
          bottom: CARD_TOP + 28,
          left: CARD_LEFT + 36,
          opacity: captionOpacity,
        }}
      >
        <p
          style={{
            fontFamily: "Gilroy",
            fontWeight: 700,
            fontSize: 20,
            color: "rgba(255,255,255,0.85)",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          {caption}
        </p>
      </div>
    </div>
  );
};
