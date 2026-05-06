"use client";

import { useEffect, useState } from "react";

// ── Premium week runs Monday 00:00 UTC → Wednesday 00:00 UTC (48 hrs visible)
// After that it's locked until next Monday.
// This is FIXED — independent of any image's updatedAt. Never resets randomly.

const VISIBLE_H = 48; // hours the premium section is open
const CYCLE_H   = 168; // full weekly cycle (7 days)

interface Remaining {
  hours: number;
  minutes: number;
  seconds: number;
}

function getMondayStartMs(): number {
  const now = new Date();
  // Find the most recent Monday 00:00 UTC
  const day = now.getUTCDay(); // 0=Sun, 1=Mon ... 6=Sat
  const daysSinceMonday = (day + 6) % 7; // Mon=0, Tue=1 ... Sun=6
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - daysSinceMonday);
  monday.setUTCHours(0, 0, 0, 0);
  return monday.getTime();
}

function calcRemaining(): { isLocked: boolean; remaining: Remaining } {
  const now = Date.now();
  const weekStart = getMondayStartMs();
  const hoursIntoWeek = (now - weekStart) / (1000 * 60 * 60);

  const isLocked = hoursIntoWeek >= VISIBLE_H;

  // Time until next transition
  const targetHours = isLocked ? CYCLE_H : VISIBLE_H;
  const diffSecs = Math.max(0, Math.round((targetHours - hoursIntoWeek) * 3600));

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

// Props kept for backwards compatibility but no longer used
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Props { updatedAt?: string; }

export default function PremiumCountdown(_props: Props) {
  const [state, setState] = useState<{ isLocked: boolean; remaining: Remaining } | null>(null);

  useEffect(() => {
    setState(calcRemaining());
    const id = setInterval(() => setState(calcRemaining()), 1000);
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
        {isLocked ? "Returns Monday" : "Gone in"}
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