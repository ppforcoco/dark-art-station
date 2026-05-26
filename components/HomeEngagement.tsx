"use client";
// components/HomeEngagement.tsx
// Drop this once anywhere on the homepage (app/page.tsx).
// Fires GA4 engagement events for homepage visitors.
//
// WHY ENGAGEMENT TIME WAS 0s — see PageTracker.tsx for the full explanation.
//
// SHORT VERSION:
// GA4's "Average engagement time" is measured by the GA4 library via the
// Page Visibility API. Our custom events (scroll_depth, time_on_page) appear
// in the Events report but do NOT feed that metric.
//
// For the homepage specifically, the GA4 library fires page_view once on load
// via gtag('config'). Since the homepage is a full page load (not SPA
// navigation from another route), we do NOT need to re-fire page_view here.
//
// What DOES help engagement time on the homepage:
//   - Keeping the user on the page for >10 seconds (GA4's own timer handles this)
//   - The user clicking through to a wallpaper page (2+ page_views in session)
//
// The scroll_depth + time_on_page events are kept because they are useful
// custom events for understanding user behaviour on the homepage.

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
      const pct = Math.round(
        ((doc.scrollTop + window.innerHeight) / doc.scrollHeight) * 100
      );
      for (const m of milestones) {
        if (pct >= m && !fired.has(m)) {
          fired.add(m);
          fireGtag("scroll_depth", {
            percent_scrolled: m,
            page:             "homepage",
            event_category:   "engagement",
          });
        }
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Time on page ─────────────────────────────────────────────────────────
  // 15s checkpoint added — catches users who bounce quickly.
  // These are custom events and show in the Events report.
  useEffect(() => {
    const timers = [15, 30, 60].map((s) =>
      setTimeout(
        () =>
          fireGtag("time_on_page", {
            seconds_on_page: s,
            page:            "homepage",
            event_category:  "engagement",
          }),
        s * 1000
      )
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  // ── Wallpaper card click ──────────────────────────────────────────────────
  // Fires before navigation so the event is captured even on slow connections.
  // This is ALSO what drives engaged sessions: clicking through to a wallpaper
  // creates a 2nd page_view, which GA4 counts as an engaged session.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const a = (e.target as HTMLElement).closest("a[href]");
      if (!a) return;
      const href = (a as HTMLAnchorElement).getAttribute("href") ?? "";
      if (/^\/(iphone|android|pc)\//.test(href)) {
        fireGtag("homepage_wallpaper_click", {
          destination:    href,
          event_category: "engagement",
        });
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}