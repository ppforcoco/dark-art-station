"use client";
// PageTracker — records a wallpaper visit to localStorage (RecentlyViewed)
// AND fires GA4 engagement events: scroll depth + time on page.
import { useEffect } from "react";
import { recordView, type RecentItem } from "@/components/RecentlyViewed";

function fireGtag(eventName: string, params: Record<string, unknown>) {
  if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
    (window as any).gtag("event", eventName, params);
  }
}

export default function PageTracker({ item }: { item: RecentItem }) {
  // ── Recently Viewed (existing behaviour) ──────────────────────────────────
  useEffect(() => {
    recordView(item);
  }, [item]);

  // ── Scroll depth → GA4 ───────────────────────────────────────────────────
  // Fires once each at 25 / 50 / 75 / 90 % scroll depth.
  // GA4 counts a session as "engaged" if the user scrolls 50%+ on any page.
  useEffect(() => {
    const milestones = [25, 50, 75, 90];
    const fired = new Set<number>();

    function onScroll() {
      const doc = document.documentElement;
      const scrolled = doc.scrollTop + window.innerHeight;
      const total = doc.scrollHeight;
      const pct = Math.round((scrolled / total) * 100);

      for (const m of milestones) {
        if (pct >= m && !fired.has(m)) {
          fired.add(m);
          fireGtag("scroll_depth", {
            percent_scrolled: m,
            page_slug: item.slug,
            event_category: "engagement",
          });
        }
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [item.slug]);

  // ── Time on page → GA4 ───────────────────────────────────────────────────
  // Fires at 30s and 60s. Lets you see in GA4 exactly how many users
  // hit the 60-second mark without ever clicking anything.
  useEffect(() => {
    const checkpoints = [
      { seconds: 30, fired: false },
      { seconds: 60, fired: false },
    ];

    const timers = checkpoints.map(({ seconds }) =>
      setTimeout(() => {
        fireGtag("time_on_page", {
          seconds_on_page: seconds,
          page_slug: item.slug,
          event_category: "engagement",
        });
      }, seconds * 1000)
    );

    return () => timers.forEach(clearTimeout);
  }, [item.slug]);

  return null;
}