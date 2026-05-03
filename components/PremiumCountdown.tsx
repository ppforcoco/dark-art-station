"use client";

import { useEffect, useState } from "react";

interface Props {
  /** ISO string of the item's updatedAt timestamp */
  updatedAt: string;
}

function getStatus(updatedAt: string): {
  isLocked: boolean;
  label: string;
  secondsRemaining: number;
} {
  const updated = new Date(updatedAt).getTime();
  const hoursOld = (Date.now() - updated) / (1000 * 60 * 60);
  const cycle = hoursOld % 72;
  const isLocked = cycle > 48;

  let secondsRemaining: number;
  let label: string;

  if (isLocked) {
    // Time until it comes back (end of the 72h cycle)
    secondsRemaining = Math.round((72 - cycle) * 3600);
    label = "Returns in";
  } else {
    // Time until it goes away (48h mark)
    secondsRemaining = Math.round((48 - cycle) * 3600);
    label = "Gone in";
  }

  return { isLocked, label, secondsRemaining };
}

function formatTime(seconds: number): string {
  const s = Math.max(0, seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  return `${String(m).padStart(2, "0")}m ${String(sec).padStart(2, "0")}s`;
}

export default function PremiumCountdown({ updatedAt }: Props) {
  const [status, setStatus] = useState(() => getStatus(updatedAt));

  useEffect(() => {
    const tick = () => setStatus(getStatus(updatedAt));
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [updatedAt]);

  const { isLocked, label, secondsRemaining } = status;
  const isUrgent = !isLocked && secondsRemaining < 3 * 3600; // under 3 hours → red pulse

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.45rem",
        fontSize: "0.72rem",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        fontFamily: "var(--font-space, monospace)",
        color: isLocked ? "rgba(160,140,100,0.6)" : isUrgent ? "#ff4444" : "#c9a84c",
        background: isLocked
          ? "rgba(255,255,255,0.03)"
          : isUrgent
          ? "rgba(255,68,68,0.08)"
          : "rgba(201,168,76,0.08)",
        border: `1px solid ${
          isLocked
            ? "rgba(255,255,255,0.07)"
            : isUrgent
            ? "rgba(255,68,68,0.25)"
            : "rgba(201,168,76,0.2)"
        }`,
        borderRadius: "2px",
        padding: "4px 10px",
      }}
    >
      {/* Pulsing dot */}
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: isLocked ? "rgba(160,140,100,0.4)" : isUrgent ? "#ff4444" : "#c9a84c",
          flexShrink: 0,
          animation: isLocked ? "none" : "hwPremiumPulse 1.4s ease-in-out infinite",
        }}
      />
      <style>{`
        @keyframes hwPremiumPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.7); }
        }
      `}</style>
      <span>{label}</span>
      <span style={{ fontWeight: 600 }}>{formatTime(secondsRemaining)}</span>
    </div>
  );
}