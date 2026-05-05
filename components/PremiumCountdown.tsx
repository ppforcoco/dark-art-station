"use client";

import { useEffect, useState } from "react";

interface Props {
  updatedAt: string;
}

const VISIBLE_H = 24;
const CYCLE_H   = 48;

interface Remaining {
  hours: number;
  minutes: number;
  seconds: number;
}

function calcRemaining(updatedAt: string): { isLocked: boolean; remaining: Remaining } {
  const updated = new Date(updatedAt).getTime();
  const hoursOld = (Date.now() - updated) / (1000 * 60 * 60);
  const cycle = hoursOld % CYCLE_H;
  const isLocked = cycle > VISIBLE_H;

  const targetHours = isLocked ? CYCLE_H : VISIBLE_H;
  const diffSecs = Math.max(0, Math.round((targetHours - cycle) * 3600));

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

export default function PremiumCountdown({ updatedAt }: Props) {
  const [state, setState] = useState<{ isLocked: boolean; remaining: Remaining } | null>(null);

  useEffect(() => {
    setState(calcRemaining(updatedAt));
    const id = setInterval(() => setState(calcRemaining(updatedAt)), 1000);
    return () => clearInterval(id);
  }, [updatedAt]);

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
        {isLocked ? "Returns in" : "Gone in"}
      </span>

      {/* HRS segment */}
      <span style={{ fontWeight: 700 }}>{pad(remaining.hours)}</span>
      <span style={{ opacity: 0.6, fontSize: "0.6rem" }}>hrs</span>

      <span style={{ opacity: 0.4 }}>·</span>

      {/* MIN segment */}
      <span style={{ fontWeight: 700 }}>{pad(remaining.minutes)}</span>
      <span style={{ opacity: 0.6, fontSize: "0.6rem" }}>min</span>

      <span style={{ opacity: 0.4 }}>·</span>

      {/* SEC segment */}
      <span style={{ fontWeight: 700 }}>{pad(remaining.seconds)}</span>
      <span style={{ opacity: 0.6, fontSize: "0.6rem" }}>sec</span>
    </div>
  );
}