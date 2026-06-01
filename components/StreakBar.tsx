'use client';

import { useEffect, useState } from "react";

const STREAK_KEY = "hw-visit-streak";
// ── FIX: Bump this version whenever you need to reset all users' streaks ──
// Changing STREAK_VERSION wipes any stale/incorrect stored data on next visit.
const STREAK_VERSION = 2;

interface StreakData {
  count: number;
  lastVisit: string; // ISO date string YYYY-MM-DD
  v: number;        // version — stale data missing this is discarded
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function getStreak(): StreakData {
  try {
    const raw = localStorage.getItem(STREAK_KEY);

    // ── FIX: Discard data from older versions (e.g. the runaway 22-day streak) ──
    if (raw) {
      const data: StreakData = JSON.parse(raw);
      if (!data.v || data.v < STREAK_VERSION) {
        // Stale version — treat as brand new visitor
        return { count: 1, lastVisit: todayStr(), v: STREAK_VERSION };
      }

      const today = todayStr();
      if (data.lastVisit === today) return data; // already counted today

      // Check if yesterday
      const last = new Date(data.lastVisit);
      const now = new Date(today);
      const diffDays = Math.round((now.getTime() - last.getTime()) / 86400000);
      if (diffDays === 1) {
        return { count: data.count + 1, lastVisit: today, v: STREAK_VERSION };
      }
      // streak broken — reset to 1
      return { count: 1, lastVisit: today, v: STREAK_VERSION };
    }

    return { count: 1, lastVisit: todayStr(), v: STREAK_VERSION };
  } catch {
    return { count: 1, lastVisit: todayStr(), v: STREAK_VERSION };
  }
}

export default function StreakBar() {
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    const data = getStreak();
    localStorage.setItem(STREAK_KEY, JSON.stringify(data));
    setStreak(data.count);
  }, []);

  // Don't render until client hydrates (avoids SSR mismatch)
  if (streak === null) return null;

  const emoji =
    streak >= 30 ? "💀" :
    streak >= 14 ? "🔥" :
    streak >= 7  ? "🔥" :
    streak >= 3  ? "👁️" : "👻";

  const label =
    streak === 1 ? "First haunt today — come back tomorrow to start your streak" :
    streak === 2 ? "2nd day in Haunted Town — streak started!" :
    `${streak} day streak in Haunted Town`;

  const sub =
    streak === 1 ? null :
    streak >= 30 ? "· you are one of us now" :
    streak >= 14 ? "· the haunting is working" :
    streak >= 7  ? "· keep it going" :
    streak >= 3  ? "· keep it going" : null;

  return (
    <div className="hp-streak">
      <span className="hp-streak-fire">{emoji}</span>
      {/* Only show the number badge from day 2 onwards */}
      {streak > 1 && (
        <span className="hp-streak-days">{streak}</span>
      )}
      <span className="hp-streak-text">{label}</span>
      {sub && (
        <span className="hp-streak-sub">{sub}</span>
      )}
    </div>
  );
}