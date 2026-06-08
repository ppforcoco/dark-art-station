'use client';

import { useEffect, useState } from "react";

const STREAK_KEY = "hw-visit-streak";
const STREAK_VERSION = 4;

interface StreakData {
  count: number;
  lastVisit: string; // YYYY-MM-DD in LOCAL time
  v: number;
}

// Use local date, NOT UTC — avoids timezone day-boundary bugs
function todayLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function diffDays(a: string, b: string): number {
  return Math.round(
    (new Date(b).getTime() - new Date(a).getTime()) / 86_400_000
  );
}

function getStreak(): StreakData {
  const fresh = { count: 1, lastVisit: todayLocal(), v: STREAK_VERSION };
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return fresh;

    const data: StreakData = JSON.parse(raw);

    // Wipe any data from older versions
    if (!data.v || data.v < STREAK_VERSION) return fresh;

    const today = todayLocal();

    // Already visited today — no change
    if (data.lastVisit === today) {
      const daysSinceEpoch = diffDays("2026-06-03", today);
      if (data.count > daysSinceEpoch + 1) return fresh;
      return data;
    }

    const diff = diffDays(data.lastVisit, today);

    // Streak broken — reset
    if (diff !== 1) return fresh;

    // Consecutive day — increment, but cap at days since we launched this fix
    const maxPossible = diffDays("2026-06-03", today) + 1;
    const newCount = Math.min(data.count + 1, maxPossible);
    return { count: newCount, lastVisit: today, v: STREAK_VERSION };

  } catch {
    return fresh;
  }
}

export default function StreakBar() {
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    const data = getStreak();
    localStorage.setItem(STREAK_KEY, JSON.stringify(data));
    setStreak(data.count);
  }, []);

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
      {/* FIXED: removed the duplicate <span className="hp-streak-days">{streak}</span>
          The number is already embedded in `label` for streak >= 3,
          so rendering it separately caused "6 6 day streak". */}
      <span className="hp-streak-text">{label}</span>
      {sub && (
        <span className="hp-streak-sub">{sub}</span>
      )}
    </div>
  );
}