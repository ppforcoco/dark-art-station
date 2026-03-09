'use client';

import { useEffect, useState, useCallback } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const BAR_HEIGHT = 36; // px — must match --topbar-h in globals.css
const HALLOWEEN_MONTH = 9; // October = index 9 (0-based)
const HALLOWEEN_DAY   = 31;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns the next Halloween as a Date at UTC midnight */
function nextHalloween(): Date {
  const now = new Date();
  const year = now.getFullYear();
  const thisYear = new Date(Date.UTC(year, HALLOWEEN_MONTH, HALLOWEEN_DAY, 0, 0, 0));
  // If Halloween this year is still in the future (or today), use it.
  // Otherwise count down to next year.
  return now < thisYear
    ? thisYear
    : new Date(Date.UTC(year + 1, HALLOWEEN_MONTH, HALLOWEEN_DAY, 0, 0, 0));
}

/** Returns true if today IS Halloween */
function isHalloween(): boolean {
  const now = new Date();
  return now.getMonth() === HALLOWEEN_MONTH && now.getDate() === HALLOWEEN_DAY;
}

interface Remaining {
  days:    number;
  hours:   number;
  minutes: number;
  seconds: number;
}

function calcRemaining(): Remaining {
  const diff = Math.max(0, nextHalloween().getTime() - Date.now());
  const totalSecs = Math.floor(diff / 1000);
  return {
    days:    Math.floor(totalSecs / 86400),
    hours:   Math.floor((totalSecs % 86400) / 3600),
    minutes: Math.floor((totalSecs % 3600)  / 60),
    seconds: totalSecs % 60,
  };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HalloweenCountdown() {
  const [remaining, setRemaining] = useState<Remaining | null>(null);
  const [halloween, setHalloween] = useState(false);

  // Set CSS variable on :root so site-nav and page content push down correctly
  const setTopbarVar = useCallback((px: number) => {
    document.documentElement.style.setProperty("--topbar-h", `${px}px`);
  }, []);

  useEffect(() => {
    setHalloween(isHalloween());
    setRemaining(calcRemaining());
    setTopbarVar(BAR_HEIGHT);

    const id = setInterval(() => {
      setHalloween(isHalloween());
      setRemaining(calcRemaining());
    }, 1000);

    return () => {
      clearInterval(id);
      // Clean up: reset topbar height when component unmounts
      setTopbarVar(0);
    };
  }, [setTopbarVar]);

  // Don't render until client-side (avoids hydration mismatch with time values)
  if (remaining === null) return null;

  return (
    <div className="halloween-bar" aria-label="Halloween countdown">

      {halloween ? (
        /* ── Zero State: it's Halloween! ── */
        <a href="/collections" className="hc-active">
          🕯 The Veil Is Thin — Ritual Active · Enter the Sanctum →
        </a>
      ) : (
        /* ── Countdown State ── */
        <>
          <span className="hc-prefix">Until the Veil Thins</span>

          {/* Days — always visible */}
          <div className="hc-segment">
            <span className="hc-num">{remaining.days}</span>
            <span className="hc-label">days</span>
          </div>

          {/* Hours — hidden on very small mobile */}
          <span className="hc-sep hc-hide-mobile">·</span>
          <div className="hc-segment hc-hide-mobile">
            <span className="hc-num">{pad(remaining.hours)}</span>
            <span className="hc-label">hrs</span>
          </div>

          {/* Minutes */}
          <span className="hc-sep hc-hide-mobile">·</span>
          <div className="hc-segment hc-hide-mobile">
            <span className="hc-num">{pad(remaining.minutes)}</span>
            <span className="hc-label">min</span>
          </div>

          {/* Seconds */}
          <span className="hc-sep hc-hide-mobile">·</span>
          <div className="hc-segment hc-hide-mobile">
            <span className="hc-num">{pad(remaining.seconds)}</span>
            <span className="hc-label">sec</span>
          </div>
        </>
      )}
    </div>
  );
}