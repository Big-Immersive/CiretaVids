import React from "react";

/**
 * Shared dark teal background with subtle noise texture —
 * matches Cireta's brand aesthetic from the Jan 26 video.
 */
export const TealBackground: React.FC = () => (
  <>
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
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        opacity: 0.07,
        pointerEvents: "none",
      }}
    >
      <filter id="teal-noise">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.65"
          numOctaves="3"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#teal-noise)" />
    </svg>
  </>
);
