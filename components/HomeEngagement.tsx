"use client";
// components/HomeEngagement.tsx
// Drop this once anywhere on the homepage (app/page.tsx).
// Fires GA4 events for homepage visitors so Google counts them as engaged.
// No visible UI — pure tracking.

import { useEffect } from "react";

function fireGtag(eventName: string, params: Record<string, unknown>) {
  if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
    (window as any).gtag("event", eventName, params);
  }
}

export default function HomeEngagement() {
  // ── Scroll depth ─────────────────────────────────────────────────────────
  useEffect(() => {
    const milestones = [25, 50, 75, 90];
    const fired = new Set<number>();

    function onScroll() {
      const doc = document.documentElement;
      const pct = Math.round(((doc.scrollTop + window.innerHeight) / doc.scrollHeight) * 100);
      for (const m of milestones) {
        if (pct >= m && !fired.has(m)) {
          fired.add(m);
          fireGtag("scroll_depth", {
            percent_scrolled: m,
            page: "homepage",
            event_category: "engagement",
          });
        }
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Time on page ─────────────────────────────────────────────────────────
  useEffect(() => {
    const timers = [15, 30, 60].map((s) =>
      setTimeout(() =>
        fireGtag("time_on_page", {
          seconds_on_page: s,
          page: "homepage",
          event_category: "engagement",
        }), s * 1000)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  // ── Wallpaper card click (fires before navigation) ───────────────────────
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const a = (e.target as HTMLElement).closest("a[href]");
      if (!a) return;
      const href = (a as HTMLAnchorElement).getAttribute("href") ?? "";
      if (/^\/(iphone|android|pc)\//.test(href)) {
        fireGtag("homepage_wallpaper_click", {
          destination: href,
          event_category: "engagement",
        });
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}