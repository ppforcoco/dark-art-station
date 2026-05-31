'use client';

import { useEffect, useState } from "react";

const STREAK_KEY = "hw-visit-streak";

interface StreakData {
  count: number;
  lastVisit: string; // ISO date string YYYY-MM-DD
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function getStreak(): StreakData {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return { count: 1, lastVisit: todayStr() };
    const data: StreakData = JSON.parse(raw);
    const today = todayStr();
    if (data.lastVisit === today) return data; // already counted today

    // Check if yesterday
    const last = new Date(data.lastVisit);
    const now = new Date(today);
    const diffDays = Math.round((now.getTime() - last.getTime()) / 86400000);
    if (diffDays === 1) {
      return { count: data.count + 1, lastVisit: today };
    }
    // streak broken
    return { count: 1, lastVisit: today };
  } catch {
    return { count: 1, lastVisit: todayStr() };
  }
}

export default function StreakBar() {
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    const data = getStreak();
    localStorage.setItem(STREAK_KEY, JSON.stringify(data));
    setStreak(data.count);
  }, []);

  if (!streak) return null;

  const emoji = streak >= 30 ? "💀" : streak >= 14 ? "🔥" : streak >= 7 ? "🔥" : "👁️";
  const label = streak === 1
    ? "First haunt today"
    : `${streak} day streak in Haunted Town`;

  return (
    <div className="hp-streak">
      <span className="hp-streak-fire">{emoji}</span>
      <span className="hp-streak-days">{streak}</span>
      <span className="hp-streak-text">{label}</span>
      {streak >= 3 && (
        <span className="hp-streak-sub">· keep it going</span>
      )}
    </div>
  );
}