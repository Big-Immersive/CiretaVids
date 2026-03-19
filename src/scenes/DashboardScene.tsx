/**
 * DashboardScene — 14-18s (120 frames, 4s)
 * Cireta Launchpad dashboard mockup centred
 * + "See it. Verify it. Own it." staggered text centred below
 */
import React from "react";
import { useCurrentFrame, interpolate, useVideoConfig } from "remotion";
import { TealBackground } from "../TealBackground";
import { ParticleBackground } from "../ParticleBackground";

const CLAMP = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const Bar: React.FC<{ label: string; pct: number; color: string; delay: number; frame: number }> = ({
  label, pct, color, delay, frame
}) => {
  const w  = interpolate(frame, [delay, delay + 30], [0, pct], CLAMP);
  const op = interpolate(frame, [delay, delay + 18], [0, 1], CLAMP);
  return (
    <div style={{ opacity: op, marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontFamily: "Gilroy", fontWeight: 600, fontSize: 12, color: "#9ca3af", letterSpacing: "0.08em" }}>{label}</span>
        <span style={{ fontFamily: "Gilroy", fontWeight: 700, fontSize: 12, color: "#e5e7eb" }}>{pct}%</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.08)", width: "100%" }}>
        <div style={{
          height: "100%", borderRadius: 2, width: `${w}%`,
          backgroundColor: color,
          boxShadow: `0 0 10px ${color}60`,
        }} />
      </div>
    </div>
  );
};

export const DashboardScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();

  const panelOp = interpolate(frame, [0, 18], [0, 1], CLAMP);

  // Text: centred below dashboard
  const t1Op = interpolate(frame, [45, 62], [0, 1], CLAMP);
  const t1Y  = interpolate(frame, [45, 62], [18, 0], CLAMP);
  const t2Op = interpolate(frame, [65, 80], [0, 1], CLAMP);
  const t2Y  = interpolate(frame, [65, 80], [18, 0], CLAMP);
  const t3Op = interpolate(frame, [84, 99], [0, 1], CLAMP);
  const t3Y  = interpolate(frame, [84, 99], [18, 0], CLAMP);

  // Subtle grid
  return (
    <div style={{
      position: "absolute", inset: 0,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 40,
    }}>
      <TealBackground />
      <ParticleBackground />

      {/* Dashboard panel */}
      <div style={{
        opacity: panelOp,
        position: "relative", zIndex: 2,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(30,240,224,0.2)",
        borderRadius: 16,
        padding: "32px 40px",
        width: Math.min(560, W * 0.55),
        backdropFilter: "blur(4px)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <p style={{ fontFamily: "Gilroy", fontWeight: 700, fontSize: 16, color: "#ffffff", margin: "0 0 4px", letterSpacing: "0.02em" }}>
              Cireta Launchpad
            </p>
            <p style={{ fontFamily: "Gilroy", fontWeight: 500, fontSize: 10, color: "#6b7280", margin: 0, letterSpacing: "0.15em", textTransform: "uppercase" }}>
              Portfolio Allocation
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#1ef0e0", boxShadow: "0 0 8px #1ef0e0" }} />
            <span style={{ fontFamily: "Gilroy", fontWeight: 500, fontSize: 10, color: "#1ef0e0", letterSpacing: "0.1em" }}>LIVE</span>
          </div>
        </div>

        {/* Allocation bars */}
        <Bar label="XAU — Tokenized Gold"    pct={62} color="#d4a030" delay={10} frame={frame} />
        <Bar label="XCU — Tokenized Copper"  pct={28} color="#b07030" delay={22} frame={frame} />
        <Bar label="Cash Reserve"            pct={10} color="#1ef0e0" delay={34} frame={frame} />

        {/* Divider */}
        <div style={{ height: 1, backgroundColor: "rgba(30,240,224,0.12)", margin: "20px 0" }} />

        {/* Stats row */}
        <div style={{ display: "flex", gap: 24 }}>
          {[
            { label: "Total Value", value: "$2.4M",  sub: "↑ 3.2% 30d" },
            { label: "Gold Backed", value: "18.3 kg", sub: "Physical Reserve" },
            { label: "Tokens",      value: "12,400",  sub: "Issued On-Chain" },
          ].map(({ label, value, sub }, i) => {
            const op = interpolate(frame, [36 + i * 10, 52 + i * 10], [0, 1], CLAMP);
            return (
              <div key={i} style={{ opacity: op, flex: 1 }}>
                <p style={{ fontFamily: "Gilroy", fontWeight: 500, fontSize: 9, color: "#6b7280", margin: "0 0 4px", letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</p>
                <p style={{ fontFamily: "Gilroy", fontWeight: 700, fontSize: 22, color: "#ffffff", margin: "0 0 2px", lineHeight: 1 }}>{value}</p>
                <p style={{ fontFamily: "Gilroy", fontWeight: 500, fontSize: 9, color: "#1ef0e0", margin: 0, letterSpacing: "0.04em" }}>{sub}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Centred stacked text below dashboard */}
      <div style={{
        position: "relative", zIndex: 2,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
      }}>
        {[
          { text: "See it.",    op: t1Op, y: t1Y, accent: false },
          { text: "Verify it.", op: t2Op, y: t2Y, accent: false },
          { text: "Own it.",    op: t3Op, y: t3Y, accent: true  },
        ].map(({ text, op, y, accent }) => (
          <div key={text} style={{ opacity: op, transform: `translateY(${y}px)` }}>
            <p style={{
              fontFamily: "Gilroy",
              fontWeight: 700,
              fontSize: 58,
              color: accent ? "#1ef0e0" : "#ffffff",
              margin: 0,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}>
              {text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
