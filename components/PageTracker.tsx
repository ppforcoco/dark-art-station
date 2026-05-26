"use client";
// components/PageTracker.tsx
// Records wallpaper visit to localStorage (RecentlyViewed) AND fires GA4
// engagement events that make Google count the session as "engaged".
//
// WHY ENGAGEMENT TIME WAS 0s:
//
// GA4 engagement time is measured by the GA4 library itself using the
// Page Visibility API (visibilitychange + document.hidden). It accumulates
// time while the tab is visible and sends it via navigator.sendBeacon() when
// the page is hidden or unloaded.
//
// Our custom scroll_depth / time_on_page events do NOT feed this metric —
// they appear in the Events report but don't affect "Average engagement time"
// or "Engaged sessions" in Acquisition reports.
//
// GA4 marks a session as "engaged" when ANY of these are true:
//   a) Session lasted > 10 seconds (measured by GA4's own visibility timer)
//   b) User had 2+ page views
//   c) A "key event" (conversion) was recorded
//
// THE FIX — two parts:
//
// 1. Fire gtag('event', 'page_view') explicitly on route changes.
//    Next.js App Router does client-side navigation — the GA4 library loaded
//    once on first paint does NOT know about subsequent route changes unless
//    we tell it. Without this, SPA navigation = 1 page_view total = condition
//    (b) never met.
//
// 2. Keep firing scroll_depth + time_on_page. These are valuable custom events
//    even though they don't affect the built-in engagement time metric. GA4
//    will show them in the Events report and you can use them as key events.
//
// SERVICE WORKER NOTE:
// If /sw.js intercepts navigator.sendBeacon() calls to google-analytics.com,
// engagement time = 0s regardless of what we do here. Ensure sw.js has:
//   if (PASSTHROUGH_ORIGINS.includes(url.hostname)) return; // no respondWith

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { recordView, type RecentItem } from "@/components/RecentlyViewed";

function fireGtag(eventName: string, params: Record<string, unknown>) {
  if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
    (window as any).gtag("event", eventName, params);
  }
}

export default function PageTracker({ item }: { item: RecentItem }) {
  const pathname = usePathname();
  const firstRender = useRef(true);

  // ── Recently Viewed ───────────────────────────────────────────────────────
  useEffect(() => {
    recordView(item);
  }, [item]);

  // ── Explicit page_view on SPA navigation ─────────────────────────────────
  // On first render the GA4 library fires page_view automatically via
  // gtag('config'). On subsequent client-side navigations it does not, because
  // the page never reloads. We fire it manually here so GA4 counts each
  // wallpaper visit as a separate page_view — enabling condition (b) above
  // (2+ page_views = engaged session).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return; // skip first render — gtag('config') already fired page_view
    }
    fireGtag("page_view", {
      page_title:    document.title,
      page_location: window.location.href,
      page_path:     pathname,
    });
  }, [pathname]);

  // ── Scroll depth ─────────────────────────────────────────────────────────
  // Fires once each at 25 / 50 / 75 / 90% scroll depth.
  // These are custom events — they appear in the Events report.
  // Note: GA4's built-in "scroll" enhanced measurement fires at 90% —
  // make sure you haven't ALSO enabled that in GA4 to avoid duplicates.
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
            percent_scrolled:  m,
            page_slug:         item.slug,
            event_category:    "engagement",
          });
        }
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [item.slug]);

  // ── Time on page ─────────────────────────────────────────────────────────
  // Fires at 30s and 60s. These are custom events — they do NOT affect the
  // "Average engagement time" column in Acquisition reports (that comes from
  // GA4's own visibility timer). But they are useful in the Events report.
  useEffect(() => {
    const timers = [30, 60].map((seconds) =>
      setTimeout(() => {
        fireGtag("time_on_page", {
          seconds_on_page: seconds,
          page_slug:       item.slug,
          event_category:  "engagement",
        });
      }, seconds * 1000)
    );

    return () => timers.forEach(clearTimeout);
  }, [item.slug]);

  return null;
}