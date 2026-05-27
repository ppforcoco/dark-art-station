"use client";
// components/HomeEngagement.tsx
import { useEffect } from "react";

export default function HomeEngagement() {
  // Track scroll depth milestones via Umami
  useEffect(() => {
    const milestones = [25, 50, 75, 90];
    const fired = new Set<number>();

    function onScroll() {
      const doc = document.documentElement;
      const pct = Math.round(
        ((doc.scrollTop + window.innerHeight) / doc.scrollHeight) * 100
      );
      for (const m of milestones) {
        if (pct >= m && !fired.has(m)) {
          fired.add(m);
          if (typeof window !== "undefined" && typeof (window as any).umami === "object") {
            (window as any).umami.track("scroll_depth", { percent: m, page: "homepage" });
          }
        }
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Track time on page via Umami
  useEffect(() => {
    const timers = [15, 30, 60].map((s) =>
      setTimeout(() => {
        if (typeof window !== "undefined" && typeof (window as any).umami === "object") {
          (window as any).umami.track("time_on_page", { seconds: s, page: "homepage" });
        }
      }, s * 1000)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return null;
}