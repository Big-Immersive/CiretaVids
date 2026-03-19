import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";

const CLAMP = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

// Fixed particle positions (deterministic)
const PARTICLES = [
  { x: 0.08, y: 0.15 },
  { x: 0.25, y: 0.08 },
  { x: 0.45, y: 0.12 },
  { x: 0.65, y: 0.07 },
  { x: 0.82, y: 0.18 },
  { x: 0.92, y: 0.35 },
  { x: 0.88, y: 0.55 },
  { x: 0.78, y: 0.72 },
  { x: 0.6, y: 0.85 },
  { x: 0.42, y: 0.9 },
  { x: 0.22, y: 0.82 },
  { x: 0.05, y: 0.65 },
  { x: 0.1, y: 0.45 },
  { x: 0.35, y: 0.5 },
  { x: 0.55, y: 0.45 },
  { x: 0.72, y: 0.4 },
  { x: 0.5, y: 0.25 },
  { x: 0.3, y: 0.3 },
];

// Drift offsets per particle (slow drift)
const DRIFTS = [
  { dx: 0.02, dy: 0.015 },
  { dx: -0.015, dy: 0.02 },
  { dx: 0.01, dy: -0.02 },
  { dx: 0.025, dy: 0.01 },
  { dx: -0.02, dy: -0.015 },
  { dx: 0.015, dy: 0.025 },
  { dx: -0.025, dy: 0.01 },
  { dx: 0.01, dy: -0.025 },
  { dx: 0.02, dy: 0.02 },
  { dx: -0.01, dy: 0.015 },
  { dx: 0.015, dy: -0.01 },
  { dx: -0.02, dy: 0.02 },
  { dx: 0.025, dy: 0.015 },
  { dx: -0.015, dy: -0.02 },
  { dx: 0.01, dy: 0.025 },
  { dx: -0.025, dy: -0.01 },
  { dx: 0.02, dy: -0.015 },
  { dx: -0.01, dy: 0.02 },
];

// Which particles to connect with lines
const CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5],
  [5, 6], [6, 7], [7, 8], [8, 9], [9, 10],
  [10, 11], [11, 12], [12, 0], [12, 13],
  [13, 14], [14, 15], [15, 16], [16, 17],
  [17, 13], [2, 16], [3, 15], [6, 14],
];

export const ParticleBackground: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Slow oscillation — completes about every 10 seconds (300 frames)
  const t = (frame % 300) / 300;
  const tSin = Math.sin(t * Math.PI * 2);
  const tCos = Math.cos(t * Math.PI * 2);

  const positions = PARTICLES.map((p, i) => {
    const drift = DRIFTS[i];
    return {
      x: (p.x + drift.dx * tSin) * width,
      y: (p.y + drift.dy * tCos) * height,
    };
  });

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        opacity,
      }}
      viewBox={`0 0 ${width} ${height}`}
    >
      {/* Lines */}
      {CONNECTIONS.map(([a, b], i) => (
        <line
          key={i}
          x1={positions[a].x}
          y1={positions[a].y}
          x2={positions[b].x}
          y2={positions[b].y}
          stroke="#1a6b73"
          strokeWidth={1}
          strokeOpacity={0.2}
        />
      ))}
      {/* Dots */}
      {positions.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={3}
          fill="#1a6b73"
          fillOpacity={0.4}
        />
      ))}
    </svg>
  );
};
