"use client";
// components/PremiumCountdown.tsx
//
// Shows a live countdown for premium wallpapers.
//
// CYCLE: 24h available → 24h locked → 24h available → …
// Anchored to a fixed epoch (Jan 1 2025 00:00 UTC) so all pages stay in sync.
//
// Accepts TWO calling conventions — both work identically:
//   1. <PremiumCountdown isLocked={true} />          ← from iphone/android pages
//   2. <PremiumCountdown updatedAt={someISOString} />  ← from homepage (old call)
//
//   isLocked = false  → UNLOCKED → show "GONE IN  [time until next lock]"
//   isLocked = true   → LOCKED   → show "BACK IN  [time until next unlock]"

import { useEffect, useState } from "react";

// ─── Cycle constants — must match getServerLockState() in all page.tsx files ──
const EPOCH_MS  = Date.UTC(2025, 0, 1, 0, 0, 0); // Jan 1 2025 00:00 UTC
const CYCLE_MS  = 48 * 60 * 60 * 1000;            // 48 h full cycle
const UNLOCK_MS = 24 * 60 * 60 * 1000;            // first 24 h = unlocked

/** Derive lock state purely from current time (client side) */
function getClientLockState(): boolean {
  const pos = (Date.now() - EPOCH_MS) % CYCLE_MS;
  return pos >= UNLOCK_MS;
}

/** Ms until next state flip */
function getMsRemaining(isLocked: boolean): number {
  const pos = (Date.now() - EPOCH_MS) % CYCLE_MS;
  if (!isLocked) {
    // Unlocked: time until lock at UNLOCK_MS
    return Math.max(0, UNLOCK_MS - pos);
  } else {
    // Locked: time until unlock at CYCLE_MS
    return Math.max(0, CYCLE_MS - pos);
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

// ─── Props — accept either isLocked (new) or updatedAt (old homepage call) ──
interface PremiumCountdownProps {
  /** Authoritative lock state from server. Takes priority over updatedAt. */
  isLocked?: boolean;
  /**
   * Legacy prop from homepage — ignored for lock-state calculation.
   * Presence signals that we should derive lock state from client clock.
   * Kept so the homepage <PremiumCountdown updatedAt={x} /> call compiles.
   */
  updatedAt?: string | Date | null;
}

export default function PremiumCountdown({ isLocked, updatedAt }: PremiumCountdownProps) {
  // If isLocked was explicitly passed, use it; otherwise derive from client clock.
  // (updatedAt is accepted to prevent the build error but doesn't affect logic)
  const resolvedLocked = isLocked !== undefined ? isLocked : getClientLockState();

  const [msRemaining, setMsRemaining] = useState<number | null>(null);
  const [locked, setLocked] = useState(resolvedLocked);

  useEffect(() => {
    const update = () => {
      const clientLocked = getClientLockState();
      setLocked(isLocked !== undefined ? isLocked : clientLocked);
      setMsRemaining(getMsRemaining(isLocked !== undefined ? isLocked : clientLocked));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [isLocked]);

  // Avoid hydration mismatch — render nothing until client-side
  if (msRemaining === null) return null;

  const { h, m, s } = fmt(msRemaining);

  // Urgency: less than 2 hours left while unlocked
  const urgent = !locked && msRemaining < 2 * 60 * 60 * 1000;

  const label   = locked ? "BACK IN"  : "GONE IN";
  const accent  = locked ? "#6b6b7a"  : (urgent ? "#c0001a" : "#c9a84c");
  const bgColor = locked ? "rgba(30,28,40,0.85)"   : "rgba(20,14,8,0.85)";
  const borderC = locked ? "rgba(107,107,122,0.3)" : (urgent ? "rgba(192,0,26,0.45)" : "rgba(201,168,76,0.35)");
  const glowC   = locked ? "transparent"           : (urgent ? "rgba(192,0,26,0.2)"  : "rgba(201,168,76,0.12)");

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