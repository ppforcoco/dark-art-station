"use client";
// components/PageTracker.tsx
// Records wallpaper visits to localStorage for the RecentlyViewed strip,
// AND reports real engagement to Umami:
//  - a "wallpaper_view" event immediately (so it shows up as a distinct
//    event, not just a generic pageview)
//  - "engaged_15s" / "engaged_60s" heartbeats while the tab stays open and
//    visible. These exist purely so Umami has a second timestamp to measure
//    session duration against — without them, a single-page visit always
//    reports as "0s", even if the person stayed for minutes.

import { useEffect } from "react";
import { recordView, type RecentItem } from "@/components/RecentlyViewed";
import { track } from "@/lib/track";

export default function PageTracker({ item }: { item: RecentItem }) {
  useEffect(() => {
    recordView(item);
    track("wallpaper_view", { title: item.title, slug: item.slug });

    const timers = [15, 60].map((seconds) =>
      window.setTimeout(() => {
        // Only counts if the tab is actually visible — a backgrounded/
        // closed tab shouldn't get credit for "staying".
        if (document.visibilityState === "visible") {
          track(`engaged_${seconds}s`, { slug: item.slug });
        }
      }, seconds * 1000)
    );

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [item]);

  return null;
}