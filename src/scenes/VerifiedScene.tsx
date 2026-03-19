/**
 * VerifiedScene — 8-14s (180 frames, 6s)
 * Dark bg + teal network animation (background)
 * Centred staggered text: "Verified." "Insured." "Tokenized."
 */
import React from "react";
import { useCurrentFrame, interpolate, useVideoConfig } from "remotion";

const CLAMP = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export const VerifiedScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const CX = W / 2;
  const CY = H / 2;

  // Network builds in
  const netOpacity = interpolate(frame, [0, 25], [0, 1], CLAMP);
  const lineProgress = interpolate(frame, [5, 50], [0, 1], CLAMP);

  // Token mint ring: centre of screen, expands out
  const mintScale   = interpolate(frame, [55, 115], [0.15, 2.8], CLAMP);
  const mintOpacity = interpolate(frame, [55, 85, 115, 145], [0, 0.7, 0.45, 0], CLAMP);

  // Text stagger — all centred
  const t1Op = interpolate(frame, [10, 30], [0, 1], CLAMP);
  const t1Y  = interpolate(frame, [10, 30], [22, 0], CLAMP);
  const t2Op = interpolate(frame, [42, 60], [0, 1], CLAMP);
  const t2Y  = interpolate(frame, [42, 60], [22, 0], CLAMP);
  const t3Op = interpolate(frame, [72, 90], [0, 1], CLAMP);
  const t3Y  = interpolate(frame, [72, 90], [22, 0], CLAMP);

  // Node layout spread across full canvas
  const nodes = [
    { x: CX - 550, y: CY - 200, r: 6,  delay: 0  },
    { x: CX - 320, y: CY + 180, r: 8,  delay: 8  },
    { x: CX + 500, y: CY - 250, r: 7,  delay: 5  },
    { x: CX + 620, y: CY + 150, r: 5,  delay: 15 },
    { x: CX - 180, y: CY - 350, r: 9,  delay: 12 },
    { x: CX + 280, y: CY + 320, r: 6,  delay: 20 },
    { x: CX - 680, y: CY + 80,  r: 5,  delay: 18 },
    { x: CX + 700, y: CY - 60,  r: 8,  delay: 3  },
    { x: CX + 150, y: CY - 400, r: 5,  delay: 25 },
    { x: CX - 400, y: CY + 350, r: 7,  delay: 10 },
    { x: CX + 420, y: CY + 400, r: 6,  delay: 22 },
    { x: CX - 50,  y: CY + 420, r: 4,  delay: 16 },
  ];

  const lineIdxs = [[0,1],[1,5],[2,3],[2,4],[3,7],[4,8],[5,9],[6,1],[7,3],[8,2],[9,10],[10,11],[0,6],[11,5]];

  const toRad = (d: number) => d * Math.PI / 180;

  return (
    <div style={{
      position: "absolute", inset: 0,
      backgroundColor: "#060f0e",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {/* Full-canvas SVG network */}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="vGlow" cx="50%" cy="50%" r="45%">
            <stop offset="0%" stopColor="#1a8080" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#060f0e" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background glow */}
        <ellipse cx={CX} cy={CY} rx={700} ry={500} fill="url(#vGlow)" />

        {/* Lines */}
        {lineIdxs.map(([a, b], i) => {
          const n1 = nodes[a], n2 = nodes[b];
          const len = Math.sqrt((n2.x-n1.x)**2 + (n2.y-n1.y)**2);
          const dash = len * (1 - lineProgress);
          return (
            <line key={i}
              x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y}
              stroke="#1ef0e0" strokeWidth={1} opacity={netOpacity * 0.35}
              strokeDasharray={len} strokeDashoffset={dash}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((n, i) => {
          const pulse = Math.sin(((frame - n.delay) / 28) * Math.PI);
          const glow = Math.max(0, pulse) * 0.5;
          return (
            <g key={i} opacity={netOpacity}>
              <circle cx={n.x} cy={n.y} r={n.r * 3} fill="#1ef0e0" opacity={glow * 0.12} />
              <circle cx={n.x} cy={n.y} r={n.r} fill="none" stroke="#1ef0e0" strokeWidth={1.5} opacity={0.75} />
              <circle cx={n.x} cy={n.y} r={n.r * 0.3} fill="#1ef0e0" opacity={0.9} />
            </g>
          );
        })}

        {/* Token mint ring — centre screen */}
        <circle cx={CX} cy={CY} r={60}
          fill="none" stroke="#1ef0e0" strokeWidth={1.5}
          opacity={mintOpacity}
          transform={`scale(${mintScale})`}
          style={{ transformOrigin: `${CX}px ${CY}px` }}
        />
        <circle cx={CX} cy={CY} r={60}
          fill="none" stroke="#1ef0e0" strokeWidth={0.5}
          opacity={mintOpacity * 0.35}
          transform={`scale(${mintScale * 1.6})`}
          style={{ transformOrigin: `${CX}px ${CY}px` }}
        />
      </svg>

      {/* Centred stacked text */}
      <div style={{
        position: "relative", zIndex: 10,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}>
        {[
          { text: "Verified.",   op: t1Op, y: t1Y, accent: false },
          { text: "Insured.",    op: t2Op, y: t2Y, accent: false },
          { text: "Tokenized.",  op: t3Op, y: t3Y, accent: true  },
        ].map(({ text, op, y, accent }) => (
          <div key={text} style={{
            opacity: op,
            transform: `translateY(${y}px)`,
          }}>
            <p style={{
              fontFamily: "Gilroy",
              fontWeight: 700,
              fontSize: 84,
              color: accent ? "#1ef0e0" : "#ffffff",
              margin: 0,
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
            }}>
              {text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
