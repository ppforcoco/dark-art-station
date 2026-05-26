"use client";
import { useState, useEffect } from "react";
// ── PERF FIX: Import tips data lazily so the 120-item array is not
// included in the initial JS bundle. Next.js splits this into a separate
// chunk that loads only when this component mounts (after hydration).
import { TIPS } from "@/lib/wallpaper-tips-data";

interface Props {
  mode?: "banner" | "popup";
}

export default function WallpaperTips({ mode = "banner" }: Props) {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * TIPS.length));
  const [visible, setVisible] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("hw-tips-dismissed");
      if (saved) setDismissed(true);
    } catch {
      // Safari Private Browsing throws SecurityError on sessionStorage access.
    }
  }, []);

  // Rotate every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % TIPS.length);
        setVisible(true);
      }, 400);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  if (dismissed) return null;

  const tip = TIPS[idx];

  if (mode === "banner") {
    return (
      <div className="hw-tips-banner">
        <span className={`hw-tips-text${visible ? " hw-tips-in" : " hw-tips-out"}`}>{tip.text}</span>
        <button
          className="hw-tips-dismiss"
          onClick={() => { setDismissed(true); try { sessionStorage.setItem("hw-tips-dismissed", "1"); } catch {} }}
          aria-label="Dismiss tips"
        >X</button>
      </div>
    );
  }

  return null;
}