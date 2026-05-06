"use client";
// components/PremiumCountdown.tsx
//
// Shows a live countdown for premium wallpapers.
//
// LOCK STATE comes from the SERVER via `isLocked` prop — the client never
// recalculates whether it's locked or unlocked. This prevents the server/client
// mismatch that caused "GONE IN 05h" showing while the section said "Premium — Locked".
//
// The client only calculates the REMAINING TIME (ms countdown), not the lock state.
//
//   isLocked = false  → UNLOCKED → show "GONE IN  [time until lock at Mon+48h]"
//   isLocked = true   → LOCKED   → show "BACK IN  [time until next Monday unlock]"

import { useEffect, useState } from "react";

interface PremiumCountdownProps {
  /** Passed from the server — authoritative lock state. Client never overrides this. */
  isLocked: boolean;
}

/** Returns ms remaining until the next state transition using Monday 00:00 UTC weekly clock. */
function getMsRemaining(isLocked: boolean): number {
  const now = Date.now();

  // Find the most recent Monday 00:00 UTC
  const d = new Date();
  const dayOfWeek = d.getUTCDay(); // 0=Sun, 1=Mon …
  const daysSinceMon = (dayOfWeek + 6) % 7;
  const mon = new Date(d);
  mon.setUTCDate(d.getUTCDate() - daysSinceMon);
  mon.setUTCHours(0, 0, 0, 0);

  const msIntoWeek    = now - mon.getTime();
  const UNLOCK_WINDOW = 48 * 60 * 60 * 1000; // 48 h
  const WEEK_MS       = 7  * 24 * 60 * 60 * 1000;

  if (!isLocked) {
    // Unlocked: count down to end of 48 h window
    return Math.max(0, UNLOCK_WINDOW - msIntoWeek);
  } else {
    // Locked: count down to next Monday (start of next unlock window)
    return Math.max(0, WEEK_MS - msIntoWeek);
  }
}

function fmt(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h   = Math.floor(totalSec / 3600);
  const m   = Math.floor((totalSec % 3600) / 60);
  const s   = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return { h: pad(h), m: pad(m), s: pad(s) };
}

export default function PremiumCountdown({ isLocked }: PremiumCountdownProps) {
  const [msRemaining, setMsRemaining] = useState<number | null>(null);

  useEffect(() => {
    setMsRemaining(getMsRemaining(isLocked));
    const id = setInterval(() => setMsRemaining(getMsRemaining(isLocked)), 1000);
    return () => clearInterval(id);
  }, [isLocked]);

  // Avoid hydration mismatch — render nothing until client-side
  if (msRemaining === null) return null;

  const { h, m, s } = fmt(msRemaining);

  // Urgency: less than 2 hours left while unlocked
  const urgent = !isLocked && msRemaining < 2 * 60 * 60 * 1000;

  const label   = isLocked ? "BACK IN"  : "GONE IN";
  const accent  = isLocked ? "#6b6b7a"  : (urgent ? "#c0001a" : "#c9a84c");
  const bgColor = isLocked ? "rgba(30,28,40,0.85)"   : "rgba(20,14,8,0.85)";
  const borderC = isLocked ? "rgba(107,107,122,0.3)" : (urgent ? "rgba(192,0,26,0.45)" : "rgba(201,168,76,0.35)");
  const glowC   = isLocked ? "transparent"           : (urgent ? "rgba(192,0,26,0.2)"  : "rgba(201,168,76,0.12)");

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.6rem",
        padding: "0.45rem 1rem",
        background: bgColor,
        border: `1px solid ${borderC}`,
        borderRadius: "3px",
        boxShadow: `0 0 16px ${glowC}`,
        fontFamily: "var(--font-space, monospace)",
        fontSize: "0.72rem",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color: accent,
        transition: "color 0.4s, border-color 0.4s, box-shadow 0.4s",
        userSelect: "none",
      }}
    >
      {/* Pulsing dot */}
      <span
        style={{
          display: "inline-block",
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: accent,
          flexShrink: 0,
          animation: "premCountPulse 2s ease-in-out infinite",
        }}
      />

      {/* Label */}
      <span style={{ color: "rgba(200,180,140,0.65)", letterSpacing: "0.2em" }}>
        {label}
      </span>

      {/* Digits */}
      <span style={{ color: accent, fontWeight: 600 }}>
        {h} HRS · {m} MIN · {s} SEC
      </span>

      <style>{`
        @keyframes premCountPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}