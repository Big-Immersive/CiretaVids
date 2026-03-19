import React from "react";
import { useCurrentFrame, interpolate, useVideoConfig } from "remotion";

const CLAMP = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

// ── Wireframe ellipse (a 3D circle seen in perspective) ───────────────────────
const WireRing: React.FC<{
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  opacity: number;
  strokeWidth?: number;
  dashed?: boolean;
  color?: string;
}> = ({
  cx,
  cy,
  rx,
  ry,
  opacity,
  strokeWidth = 1.5,
  dashed = false,
  color = "#1ef0e0",
}) => (
  <ellipse
    cx={cx}
    cy={cy}
    rx={rx}
    ry={ry}
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeDasharray={dashed ? "8 12" : undefined}
    opacity={opacity}
  />
);

// ── Arc segment (fraction of an ellipse) ─────────────────────────────────────
const WireArc: React.FC<{
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  startAngle: number; // degrees
  endAngle: number;
  opacity: number;
  strokeWidth?: number;
  color?: string;
  glowing?: boolean;
}> = ({
  cx,
  cy,
  rx,
  ry,
  startAngle,
  endAngle,
  opacity,
  strokeWidth = 2,
  color = "#1ef0e0",
  glowing = false,
}) => {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const x1 = cx + rx * Math.cos(toRad(startAngle));
  const y1 = cy + ry * Math.sin(toRad(startAngle));
  const x2 = cx + rx * Math.cos(toRad(endAngle));
  const y2 = cy + ry * Math.sin(toRad(endAngle));
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  const d = `M ${x1} ${y1} A ${rx} ${ry} 0 ${largeArc} 1 ${x2} ${y2}`;

  return (
    <g>
      {glowing && (
        <path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth + 6}
          opacity={opacity * 0.15}
          filter="url(#blur)"
        />
      )}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        opacity={opacity}
        strokeLinecap="round"
      />
    </g>
  );
};

// ── Wireframe faceted gem (dodecahedron projection) ───────────────────────────
const WireGem: React.FC<{
  cx: number;
  cy: number;
  r: number;
  rotate: number;
  opacity: number;
}> = ({ cx, cy, r, rotate, opacity }) => {
  // Project a simple icosahedron-like shape as 2D wireframe
  const faces = 6;
  const points = Array.from({ length: faces }, (_, i) => {
    const a = (i / faces) * Math.PI * 2 + rotate;
    return { x: cx + r * Math.cos(a), y: cy + r * 0.6 * Math.sin(a) };
  });
  const top = { x: cx, y: cy - r * 0.9 };
  const bot = { x: cx, y: cy + r * 0.9 };

  const lines: [{ x: number; y: number }, { x: number; y: number }][] = [];
  // Outer ring
  for (let i = 0; i < faces; i++) {
    lines.push([points[i], points[(i + 1) % faces]]);
  }
  // Spokes to top/bottom
  for (let i = 0; i < faces; i++) {
    lines.push([points[i], top]);
    lines.push([points[i], bot]);
  }

  return (
    <g opacity={opacity}>
      {lines.map(([a, b], i) => (
        <line
          key={i}
          x1={a.x}
          y1={a.y}
          x2={b.x}
          y2={b.y}
          stroke="#1ef0e0"
          strokeWidth={i < faces ? 1.8 : 0.9}
          opacity={i < faces ? 0.9 : 0.4}
        />
      ))}
      {/* Outer ring points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="#1ef0e0" opacity={0.8} />
      ))}
      <circle cx={top.x} cy={top.y} r={4} fill="#1ef0e0" opacity={1} />
      <circle cx={bot.x} cy={bot.y} r={4} fill="#1ef0e0" opacity={1} />
    </g>
  );
};

// ── Fragmented arc with offset ────────────────────────────────────────────────
const FragmentArc: React.FC<{
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  startAngle: number;
  endAngle: number;
  offsetX: number;
  offsetY: number;
  opacity: number;
  index: number;
  total: number;
}> = ({
  cx,
  cy,
  rx,
  ry,
  startAngle,
  endAngle,
  offsetX,
  offsetY,
  opacity,
  index,
  total,
}) => {
  const midAngle = ((startAngle + endAngle) / 2 * Math.PI) / 180;
  const labelX = cx + offsetX + rx * 0.55 * Math.cos(midAngle);
  const labelY = cy + offsetY + ry * 0.55 * Math.sin(midAngle);

  return (
    <g transform={`translate(${offsetX}, ${offsetY})`}>
      <WireArc
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        startAngle={startAngle}
        endAngle={endAngle}
        opacity={opacity}
        strokeWidth={2.2}
        glowing={true}
      />
      {/* Spoke lines from arc ends to center */}
      {[startAngle, endAngle].map((a, i) => {
        const rad = (a * Math.PI) / 180;
        return (
          <line
            key={i}
            x1={cx + rx * Math.cos(rad)}
            y1={cy + ry * Math.sin(rad)}
            x2={cx}
            y2={cy}
            stroke="#1ef0e0"
            strokeWidth={0.8}
            opacity={opacity * 0.5}
            strokeDasharray="4 8"
          />
        );
      })}
      {/* Fraction label */}
      <text
        x={labelX}
        y={labelY}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#1ef0e0"
        fontSize={22}
        fontFamily="Gilroy, sans-serif"
        fontWeight={600}
        opacity={opacity * 0.9}
      >
        1/{total}
      </text>
    </g>
  );
};

// ── Full scene ────────────────────────────────────────────────────────────────
export const TokenScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const W = width;   // 1920
  const H = height;  // 1080
  const CX = W / 2;
  const CY = H / 2;

  // Primary ring — large, horizontal-ish
  const R1x = 700;
  const R1y = 260;
  // Secondary ring — tilted vertical-ish
  const R2x = 300;
  const R2y = 480;
  // Third ring — diagonal
  const R3x = 580;
  const R3y = 200;

  // ── Phase timing ──────────────────────────────────────────────────────────
  // Phase 1 (0-35f): rings materialise
  const ringsOpacity = interpolate(frame, [0, 30], [0, 1], CLAMP);
  const gemOpacity   = interpolate(frame, [10, 40], [0, 1], CLAMP);

  // Ring rotation — slow continuous drift
  const rot1 = (frame / 30) * 18;  // 18°/s
  const rot2 = (frame / 30) * -12;
  const rot3 = (frame / 30) * 22;

  // Phase 2 (45-90f): rings explode into fragments
  const explode = interpolate(frame, [45, 95], [0, 1], CLAMP);
  const wholeRingOpacity = interpolate(frame, [42, 65], [1, 0], CLAMP);
  const fragOpacity      = interpolate(frame, [48, 80], [0, 1], CLAMP);
  const gemFade          = interpolate(frame, [42, 68], [gemOpacity, 0], CLAMP);

  // Fragment drift amounts
  const driftScale = interpolate(explode, [0, 1], [0, 1], CLAMP);

  // Phase 3 (95-140f): text + stabilise
  const textOpacity = interpolate(frame, [100, 130], [0, 1], CLAMP);
  const textY       = interpolate(frame, [100, 130], [28, 0], CLAMP);

  // ── Fragment definitions (8 slices of the main ring) ─────────────────────
  const SLICES = 8;
  const sliceAngle = 360 / SLICES;
  const fragments = Array.from({ length: SLICES }, (_, i) => {
    const startAngle = i * sliceAngle + rot1;
    const endAngle   = startAngle + sliceAngle - 2;
    const midRad     = ((startAngle + sliceAngle / 2) * Math.PI) / 180;
    const driftX     = Math.cos(midRad) * 180 * driftScale;
    const driftY     = Math.sin(midRad) * 80 * driftScale;
    return { startAngle, endAngle, driftX, driftY };
  });

  // ── Gem rotation ──────────────────────────────────────────────────────────
  const gemRot = (frame / 30) * 1.2; // radians/s

  // ── Background grid dots ──────────────────────────────────────────────────
  const gridOpacity = interpolate(frame, [0, 40], [0, 0.18], CLAMP);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "#091f1e",
        overflow: "hidden",
      }}
    >
      <svg
        width={W}
        height={H}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <defs>
          <filter id="blur">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1a8080" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#091f1e" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background radial glow */}
        <ellipse cx={CX} cy={CY} rx={600} ry={500} fill="url(#bgGlow)" opacity={0.5} />

        {/* Perspective grid dots */}
        {Array.from({ length: 12 }, (_, row) =>
          Array.from({ length: 20 }, (_, col) => (
            <circle
              key={`${row}-${col}`}
              cx={(col / 19) * W}
              cy={(row / 11) * H}
              r={1.5}
              fill="#1ef0e0"
              opacity={gridOpacity * 0.5}
            />
          ))
        )}

        {/* ── WHOLE RINGS (before explosion) ──────────────────────────────── */}

        {/* Ring 1 — large primary horizontal ring */}
        <g opacity={wholeRingOpacity * ringsOpacity * 0.35} filter="url(#glow)">
          <WireRing cx={CX} cy={CY} rx={R1x} ry={R1y} opacity={0.9} strokeWidth={2} />
          <WireRing cx={CX} cy={CY} rx={R1x} ry={R1y} opacity={0.12} strokeWidth={10} />
          {/* tick marks at cardinal points */}
          {[0, 90, 180, 270].map((a) => {
            const rad = ((a + rot1) * Math.PI) / 180;
            const ox  = CX + R1x * Math.cos(rad);
            const oy  = CY + R1y * Math.sin(rad);
            return (
              <g key={a}>
                <circle cx={ox} cy={oy} r={6} fill="none" stroke="#1ef0e0" strokeWidth={2} opacity={0.9} />
                <circle cx={ox} cy={oy} r={2} fill="#1ef0e0" opacity={0.9} />
              </g>
            );
          })}
        </g>

        {/* Ring 2 — tall tilted ring */}
        <g opacity={wholeRingOpacity * ringsOpacity * 0.2} filter="url(#glow)">
          <WireRing
            cx={CX} cy={CY}
            rx={R2x} ry={R2y}
            opacity={0.75}
            strokeWidth={1.5}
            dashed={true}
            color="#0ab8b0"
          />
        </g>

        {/* Ring 3 — mid diagonal ring */}
        <g opacity={wholeRingOpacity * ringsOpacity * 0.18} filter="url(#glow)">
          <WireRing
            cx={CX + 80} cy={CY - 60}
            rx={R3x} ry={R3y}
            opacity={0.6}
            strokeWidth={1.2}
            dashed={true}
            color="#0ab8b0"
          />
        </g>

        {/* ── CENTRE GEM ─────────────────────────────────────────────────── */}
        <WireGem
          cx={CX} cy={CY}
          r={120}
          rotate={gemRot}
          opacity={gemFade * 0.9}
        />

        {/* ── FRAGMENT ARCS (after explosion) ─────────────────────────────── */}
        <g opacity={0.35}>
        {fragments.map((f, i) => (
          <FragmentArc
            key={i}
            cx={CX}
            cy={CY}
            rx={R1x}
            ry={R1y}
            startAngle={f.startAngle}
            endAngle={f.endAngle}
            offsetX={f.driftX}
            offsetY={f.driftY}
            opacity={fragOpacity}
            index={i}
            total={SLICES}
          />
        ))}
        </g>

        {/* Crosshair at center */}
        <g opacity={ringsOpacity * 0.2}>
          <line x1={CX - 30} y1={CY} x2={CX + 30} y2={CY} stroke="#1ef0e0" strokeWidth={1} />
          <line x1={CX} y1={CY - 30} x2={CX} y2={CY + 30} stroke="#1ef0e0" strokeWidth={1} />
          <circle cx={CX} cy={CY} r={8} fill="none" stroke="#1ef0e0" strokeWidth={1} opacity={0.6} />
        </g>

        {/* Corner brackets — premium HUD feel */}
        {[
          [80, 60],
          [W - 80, 60],
          [80, H - 60],
          [W - 80, H - 60],
        ].map(([x, y], i) => {
          const sx = i % 2 === 0 ? 1 : -1;
          const sy = i < 2 ? 1 : -1;
          return (
            <g key={i} opacity={ringsOpacity * 0.35} stroke="#1ef0e0" strokeWidth={1.5} fill="none">
              <polyline points={`${x},${y + 20 * sy} ${x},${y} ${x + 20 * sx},${y}`} />
            </g>
          );
        })}

        {/* Data labels — HUD readout */}
        {[
          { x: 140, y: 100, label: "ASSET.CLASS // COMMODITY" },
          { x: W - 140, y: H - 100, label: "CHAIN.STATUS // ON-CHAIN" },
        ].map(({ x, y, label }, i) => (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor={i === 0 ? "start" : "end"}
            fill="#1ef0e0"
            fontSize={13}
            fontFamily="monospace"
            opacity={ringsOpacity * 0.4}
            letterSpacing={2}
          >
            {label}
          </text>
        ))}
      </svg>

      {/* ── TEXT OVERLAY — dead centre ───────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          opacity: textOpacity,
          transform: `translateY(${textY}px)`,
          zIndex: 10,
        }}
      >
        <p
          style={{
            fontFamily: "Gilroy",
            fontWeight: 600,
            fontSize: 64,
            color: "#ffffff",
            margin: 0,
            lineHeight: 1.25,
            letterSpacing: "-0.02em",
          }}
        >
          Tokens represent
        </p>
        <p
          style={{
            fontFamily: "Gilroy",
            fontWeight: 600,
            fontSize: 64,
            color: "#1ef0e0",
            margin: 0,
            lineHeight: 1.25,
            letterSpacing: "-0.02em",
          }}
        >
          fractional ownership
        </p>
      </div>
    </div>
  );
};
