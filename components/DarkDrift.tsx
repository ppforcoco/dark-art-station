'use client';

import { useEffect, useRef } from "react";

// Drift stages: every 10 min the background subtly shifts color
// Stage 0 (0-10min):   transparent — site looks normal
// Stage 1 (10-20min):  faint deep crimson veil
// Stage 2 (20-30min):  richer blood tint
// Stage 3 (30min+):    deep blood red — site feels "alive"
const DRIFT_STAGES = [
  "transparent",
  "rgba(80,0,10,0.06)",
  "rgba(120,0,15,0.11)",
  "rgba(160,0,20,0.16)",
];

const EMBER_STAGES = [
  "transparent",
  "rgba(80,30,0,0.06)",
  "rgba(120,50,0,0.11)",
  "rgba(160,60,0,0.16)",
];

const GHOST_STAGES = [
  "transparent",
  "rgba(0,0,20,0.05)",
  "rgba(0,0,30,0.09)",
  "rgba(0,0,40,0.13)",
];

function getStages(): string[] {
  const theme = document.documentElement.getAttribute("data-theme") ?? "dark";
  if (theme === "ember") return EMBER_STAGES;
  if (theme === "ghost") return GHOST_STAGES;
  // light/blood/dark all use crimson
  return DRIFT_STAGES;
}

export default function DarkDrift() {
  const stageRef = useRef(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    // Don't run on touch/low-end — keep it a desktop treat
    // But still run on mobile, just subtler (already handled by the low opacity values)
    const TEN_MINUTES = 10 * 60 * 1000;

    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const stage = Math.min(
        Math.floor(elapsed / TEN_MINUTES),
        DRIFT_STAGES.length - 1
      );

      if (stage !== stageRef.current) {
        stageRef.current = stage;
        const stages = getStages();
        document.documentElement.style.setProperty("--drift-tint", stages[stage]);
      }
    };

    // Check every 30 seconds (fine-grained enough, cheap)
    const id = setInterval(tick, 30_000);
    tick(); // Run immediately on mount

    // Reset drift when theme changes
    const observer = new MutationObserver(() => {
      const stages = getStages();
      document.documentElement.style.setProperty(
        "--drift-tint",
        stages[stageRef.current]
      );
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      clearInterval(id);
      observer.disconnect();
      document.documentElement.style.setProperty("--drift-tint", "transparent");
    };
  }, []);

  // Purely visual — renders nothing in the DOM
  // The effect is entirely via the CSS --drift-tint variable on body::after
  return null;
}