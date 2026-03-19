/**
 * VerifiedScene — 8-14s (180 frames, 6s)
 * 3 beats × 60 frames (2s each):
 *   Beat 1: Verified  — animated checkmark traces + word
 *   Beat 2: Insured   — shield draws itself + word
 *   Beat 3: Tokenized — hexagon assembles + word glows teal
 */
import React from "react";
import { useCurrentFrame, interpolate, useVideoConfig } from "remotion";
import { TealBackground } from "../TealBackground";
import { ParticleBackground } from "../ParticleBackground";

const CLAMP = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// Subtle radial glow behind each beat
const BeatGlow: React.FC<{ opacity: number }> = ({ opacity }) => (
  <div style={{
    position: "absolute", inset: 0, pointerEvents: "none",
    background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(30,240,224,0.08) 0%, transparent 70%)",
    opacity,
  }} />
);

// ── Beat 1: Verified ──────────────────────────────────────────────────────────
const VerifiedBeat: React.FC<{ frame: number }> = ({ frame }) => {
  const checkProgress = interpolate(frame, [0, 28], [0, 1], CLAMP);
  const wordOp = interpolate(frame, [22, 40], [0, 1], CLAMP);
  const wordY  = interpolate(frame, [22, 40], [18, 0], CLAMP);
  const circleOp = interpolate(frame, [0, 15], [0, 1], CLAMP);
  const beatOp = interpolate(frame, [52, 60], [1, 0], CLAMP);

  // SVG checkmark path: two line segments forming ✓
  // Draws via strokeDashoffset animation
  const checkLen = 140; // approx path length
  const dashOffset = checkLen * (1 - checkProgress);

  return (
    <div style={{ position: "absolute", inset: 0, opacity: beatOp,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 32 }}>
      <BeatGlow opacity={wordOp} />

      {/* Icon: circle + checkmark */}
      <svg width={130} height={130} viewBox="0 0 130 130" style={{ opacity: circleOp }}>
        {/* Outer circle */}
        <circle cx={65} cy={65} r={58}
          fill="none" stroke="#1ef0e0" strokeWidth={2.5}
          opacity={0.3}
        />
        {/* Inner circle fill */}
        <circle cx={65} cy={65} r={54}
          fill="rgba(30,240,224,0.07)"
        />
        {/* Animated checkmark */}
        <polyline
          points="32,65 55,88 98,42"
          fill="none"
          stroke="#1ef0e0"
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={checkLen}
          strokeDashoffset={dashOffset}
        />
      </svg>

      {/* Word */}
      <div style={{ opacity: wordOp, transform: `translateY(${wordY}px)`, textAlign: "center" }}>
        <p style={{
          fontFamily: "Gilroy", fontWeight: 700, fontSize: 96,
          color: "#ffffff", margin: 0, lineHeight: 1,
          letterSpacing: "-0.03em",
        }}>Verified.</p>
        <p style={{
          fontFamily: "Gilroy", fontWeight: 400, fontSize: 22,
          color: "rgba(30,240,224,0.7)", margin: "10px 0 0",
          letterSpacing: "0.15em", textTransform: "uppercase",
        }}>Third-party audited</p>
      </div>
    </div>
  );
};

// ── Beat 2: Insured ───────────────────────────────────────────────────────────
const InsuredBeat: React.FC<{ frame: number }> = ({ frame }) => {
  // frame is 0-based within beat
  const shieldProgress = interpolate(frame, [0, 30], [0, 1], CLAMP);
  const wordOp = interpolate(frame, [25, 42], [0, 1], CLAMP);
  const wordY  = interpolate(frame, [25, 42], [18, 0], CLAMP);
  const beatOp = interpolate(frame, [52, 60], [1, 0], CLAMP);

  // Shield SVG path (pentagon-like shield shape)
  // Path length approx 300
  const shieldLen = 300;
  const dashOffset = shieldLen * (1 - shieldProgress);

  return (
    <div style={{ position: "absolute", inset: 0, opacity: beatOp,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 32 }}>
      <BeatGlow opacity={wordOp} />

      {/* Icon: shield */}
      <svg width={110} height={128} viewBox="0 0 110 128" style={{ opacity: interpolate(frame, [0, 12], [0, 1], CLAMP) }}>
        {/* Shield fill */}
        <path d="M55,8 L100,26 L100,60 C100,90 55,120 55,120 C55,120 10,90 10,60 L10,26 Z"
          fill="rgba(30,240,224,0.07)"
        />
        {/* Animated shield outline */}
        <path d="M55,8 L100,26 L100,60 C100,90 55,120 55,120 C55,120 10,90 10,60 L10,26 Z"
          fill="none"
          stroke="#1ef0e0"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={shieldLen}
          strokeDashoffset={dashOffset}
        />
        {/* Inner checkmark on shield */}
        <polyline
          points="36,64 50,78 74,52"
          fill="none" stroke="#1ef0e0" strokeWidth={4.5}
          strokeLinecap="round" strokeLinejoin="round"
          opacity={interpolate(frame, [28, 42], [0, 0.9], CLAMP)}
        />
      </svg>

      {/* Word */}
      <div style={{ opacity: wordOp, transform: `translateY(${wordY}px)`, textAlign: "center" }}>
        <p style={{
          fontFamily: "Gilroy", fontWeight: 700, fontSize: 96,
          color: "#ffffff", margin: 0, lineHeight: 1,
          letterSpacing: "-0.03em",
        }}>Insured.</p>
        <p style={{
          fontFamily: "Gilroy", fontWeight: 400, fontSize: 22,
          color: "rgba(30,240,224,0.7)", margin: "10px 0 0",
          letterSpacing: "0.15em", textTransform: "uppercase",
        }}>Fully covered assets</p>
      </div>
    </div>
  );
};

// ── Beat 3: Tokenized ─────────────────────────────────────────────────────────
const TokenizedBeat: React.FC<{ frame: number }> = ({ frame }) => {
  const wordOp = interpolate(frame, [25, 42], [0, 1], CLAMP);
  const wordY  = interpolate(frame, [25, 42], [18, 0], CLAMP);
  const beatOp = interpolate(frame, [0, 8], [0, 1], CLAMP);

  // 6 hexagon vertices — assemble from centre
  const hexVertices = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * 60 - 90) * (Math.PI / 180);
    return { x: 65 + 50 * Math.cos(angle), y: 65 + 50 * Math.sin(angle) };
  });
  const hexPath = hexVertices.map((v, i) => `${i === 0 ? "M" : "L"}${v.x},${v.y}`).join(" ") + " Z";
  const hexLen = 310;

  // Inner token T
  const tokenProgress = interpolate(frame, [0, 35], [0, 1], CLAMP);
  const hexDash = hexLen * (1 - tokenProgress);

  // Pulsing glow ring
  const pulse = Math.sin((frame / 20) * Math.PI);
  const ringScale = 1 + Math.max(0, pulse) * 0.08;

  // Outer ring opacity
  const ringOp = interpolate(frame, [15, 35], [0, 0.4], CLAMP);

  return (
    <div style={{ position: "absolute", inset: 0, opacity: beatOp,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 32 }}>
      <BeatGlow opacity={wordOp} />

      {/* Icon: hexagon + T token symbol */}
      <svg width={130} height={130} viewBox="0 0 130 130"
        style={{ opacity: interpolate(frame, [0, 12], [0, 1], CLAMP) }}>

        {/* Outer pulsing ring */}
        <circle cx={65} cy={65} r={62 * ringScale}
          fill="none" stroke="#1ef0e0" strokeWidth={1}
          opacity={ringOp}
        />

        {/* Hex fill */}
        <path d={hexPath} fill="rgba(30,240,224,0.09)" />

        {/* Animated hex outline */}
        <path d={hexPath}
          fill="none" stroke="#1ef0e0" strokeWidth={3}
          strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={hexLen}
          strokeDashoffset={hexDash}
        />

        {/* Token T symbol inside hex */}
        <text x={65} y={77} textAnchor="middle"
          fontSize={38} fontWeight={700}
          fill="#1ef0e0"
          opacity={interpolate(frame, [30, 50], [0, 1], CLAMP)}
          fontFamily="sans-serif"
        >T</text>
      </svg>

      {/* Word */}
      <div style={{ opacity: wordOp, transform: `translateY(${wordY}px)`, textAlign: "center" }}>
        <p style={{
          fontFamily: "Gilroy", fontWeight: 700, fontSize: 96,
          color: "#1ef0e0", margin: 0, lineHeight: 1,
          letterSpacing: "-0.03em",
        }}>Tokenized.</p>
        <p style={{
          fontFamily: "Gilroy", fontWeight: 400, fontSize: 22,
          color: "rgba(30,240,224,0.7)", margin: "10px 0 0",
          letterSpacing: "0.15em", textTransform: "uppercase",
        }}>On-chain. Always.</p>
      </div>
    </div>
  );
};

// ── Main scene ────────────────────────────────────────────────────────────────
export const VerifiedScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();

  // Which beat are we in?
  const beat = frame < 60 ? 0 : frame < 120 ? 1 : 2;
  const beatFrame = frame % 60;

  // Subtle horizontal divider line that persists across all beats
  const lineOp = interpolate(frame, [0, 20], [0, 0.15], CLAMP);

  return (
    <div style={{
      position: "absolute", inset: 0,
      overflow: "hidden",
    }}>
      <TealBackground />
      <ParticleBackground />

      {/* Beat content */}
      {beat === 0 && <VerifiedBeat frame={beatFrame} />}
      {beat === 1 && <InsuredBeat frame={beatFrame} />}
      {beat === 2 && <TokenizedBeat frame={beatFrame} />}
    </div>
  );
};
