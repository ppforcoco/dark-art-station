'use client';

import { useEffect, useState, useCallback } from "react";

const BAR_HEIGHT = 36;
const HALLOWEEN_MONTH = 9;
const HALLOWEEN_DAY   = 31;

function nextHalloween(): Date {
  const now = new Date();
  const year = now.getFullYear();
  const thisYear = new Date(Date.UTC(year, HALLOWEEN_MONTH, HALLOWEEN_DAY, 0, 0, 0));
  return now < thisYear
    ? thisYear
    : new Date(Date.UTC(year + 1, HALLOWEEN_MONTH, HALLOWEEN_DAY, 0, 0, 0));
}

function isHalloween(): boolean {
  const now = new Date();
  return now.getMonth() === HALLOWEEN_MONTH && now.getDate() === HALLOWEEN_DAY;
}

interface Remaining {
  days: number; hours: number; minutes: number; seconds: number;
}

function calcRemaining(): Remaining {
  const diff = Math.max(0, nextHalloween().getTime() - Date.now());
  const totalSecs = Math.floor(diff / 1000);
  return {
    days:    Math.floor(totalSecs / 86400),
    hours:   Math.floor((totalSecs % 86400) / 3600),
    minutes: Math.floor((totalSecs % 3600) / 60),
    seconds: totalSecs % 60,
  };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// Returns a flavour label based on how many days remain
function getPrefix(days: number): string {
  if (days > 100) return "🕯 Halloween — countdown";
  if (days > 30)  return "🕯 Halloween — countdown";
  if (days > 14)  return "🦇 Halloween — coming";
  if (days > 7)   return "🎃 Halloween — coming";
  if (days > 1)   return "🩸 Almost Halloween";
  if (days === 1) return "☠️ Tomorrow — Halloween";
  return "🩸 Tonight — Halloween";
}

export default function HalloweenCountdown() {
  const [remaining, setRemaining] = useState<Remaining | null>(null);
  const [halloween, setHalloween] = useState(false);

  const setTopbarVar = useCallback((px: number) => {
    document.documentElement.style.setProperty("--topbar-h", `${px}px`);
    document.documentElement.style.setProperty("--topbar-total", `${px}px`);
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
      setTopbarVar(0);
    };
  }, [setTopbarVar]);

  if (remaining === null) return null;

  return (
    <div className="halloween-bar" aria-label="Halloween countdown">
      {halloween ? (
        <a href="/collections" className="hc-active">
          🎃 It's Halloween! Browse the Collection →
        </a>
      ) : (
        <>
          <span className="hc-prefix">{getPrefix(remaining.days)}</span>

          <div className="hc-segment">
            <span className="hc-num">{remaining.days}</span>
            <span className="hc-label">days</span>
          </div>

          <span className="hc-sep">·</span>
          <div className="hc-segment">
            <span className="hc-num">{pad(remaining.hours)}</span>
            <span className="hc-label">hrs</span>
          </div>

          <span className="hc-sep">·</span>
          <div className="hc-segment">
            <span className="hc-num">{pad(remaining.minutes)}</span>
            <span className="hc-label">min</span>
          </div>

          <span className="hc-sep">·</span>
          <div className="hc-segment">
            <span className="hc-num">{pad(remaining.seconds)}</span>
            <span className="hc-label">sec</span>
          </div>
        </>
      )}
    </div>
  );
}