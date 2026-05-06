"use client";

import { useEffect, useState } from "react";

// ── Alternating 24-hour cycle ──────────────────────────────────────────────
// Epoch (Jan 1 2025 00:00 UTC) is used as a fixed reference point.
// Every 48 hours: first 24hrs = OPEN, next 24hrs = LOCKED, repeat forever.
// This is completely independent of any image's updatedAt — never resets randomly.

const CYCLE_H   = 48; // full cycle: 24 open + 24 locked
const VISIBLE_H = 24; // hours open per cycle

function getCycleState(): { isLocked: boolean; remaining: { hours: number; minutes: number; seconds: number } } {
  // Fixed epoch: Jan 1 2025 00:00:00 UTC
  const EPOCH_MS = Date.UTC(2025, 0, 1, 0, 0, 0);
  const now = Date.now();

  const msSinceEpoch = now - EPOCH_MS;
  const cycleMs = CYCLE_H * 60 * 60 * 1000;
  const posInCycle = msSinceEpoch % cycleMs; // ms into current 48h cycle
  const hoursInCycle = posInCycle / (1000 * 60 * 60);

  const isLocked = hoursInCycle >= VISIBLE_H;

  // How many ms until next transition
  const targetHours = isLocked ? CYCLE_H : VISIBLE_H;
  const diffSecs = Math.max(0, Math.round((targetHours - hoursInCycle) * 3600));

  return {
    isLocked,
    remaining: {
      hours:   Math.floor(diffSecs / 3600),
      minutes: Math.floor((diffSecs % 3600) / 60),
      seconds: diffSecs % 60,
    },
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// Props kept for backwards compatibility
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Props { updatedAt?: string; }

export default function PremiumCountdown(_props: Props) {
  const [state, setState] = useState<ReturnType<typeof getCycleState> | null>(null);

  useEffect(() => {
    setState(getCycleState());
    const id = setInterval(() => setState(getCycleState()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!state) return null;

  const { isLocked, remaining } = state;
  const isUrgent = !isLocked && remaining.hours < 3;
  const color = isLocked ? "rgba(160,140,100,0.6)" : isUrgent ? "#ff4444" : "#c9a84c";

  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "0.35rem",
      fontSize: "0.72rem",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      fontFamily: "var(--font-space, monospace)",
      color,
      background: isLocked ? "rgba(255,255,255,0.03)" : isUrgent ? "rgba(255,68,68,0.08)" : "rgba(201,168,76,0.08)",
      border: `1px solid ${isLocked ? "rgba(255,255,255,0.07)" : isUrgent ? "rgba(255,68,68,0.25)" : "rgba(201,168,76,0.2)"}`,
      borderRadius: "2px",
      padding: "4px 12px",
    }}>
      {/* Pulsing dot */}
      <span style={{
        width: "6px", height: "6px", borderRadius: "50%",
        background: color, flexShrink: 0,
        animation: isLocked ? "none" : "hwPremiumPulse 1.4s ease-in-out infinite",
      }} />
      <style>{`
        @keyframes hwPremiumPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.7); }
        }
      `}</style>

      <span style={{ marginRight: "4px" }}>
        {isLocked ? "Unlocks in" : "Gone in"}
      </span>

      {/* HRS */}
      <span style={{ fontWeight: 700 }}>{pad(remaining.hours)}</span>
      <span style={{ opacity: 0.6, fontSize: "0.6rem" }}>hrs</span>

      <span style={{ opacity: 0.4 }}>·</span>

      {/* MIN */}
      <span style={{ fontWeight: 700 }}>{pad(remaining.minutes)}</span>
      <span style={{ opacity: 0.6, fontSize: "0.6rem" }}>min</span>

      <span style={{ opacity: 0.4 }}>·</span>

      {/* SEC */}
      <span style={{ fontWeight: 700 }}>{pad(remaining.seconds)}</span>
      <span style={{ opacity: 0.6, fontSize: "0.6rem" }}>sec</span>
    </div>
  );
}