"use client";
// components/SiteAnalytics.tsx
//
// Mounted once, site-wide, in ClientComponents.tsx — so unlike PageTracker
// (which only lives on wallpaper detail pages), this fires on EVERY page:
// home, blog, collections, search, all of it.
//
// On every route change it:
//   1. Sends a "pageview" beacon immediately.
//   2. Starts a timer; when the tab is hidden/closed, or the user navigates
//      to a new route, it sends a "duration" beacon with how long they were
//      actually on that page — this is the number Umami could never give you
//      reliably for single-page visits.

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackPageview, trackDuration } from "@/lib/track";

export default function SiteAnalytics() {
  const pathname = usePathname();
  const startRef = useRef<number>(Date.now());
  const pathRef   = useRef<string>(pathname);

  useEffect(() => {
    startRef.current = Date.now();
    pathRef.current  = pathname;
    trackPageview(pathname);

    const sendDuration = () => {
      const seconds = Math.round((Date.now() - startRef.current) / 1000);
      trackDuration(pathRef.current, seconds);
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") sendDuration();
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", sendDuration);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", sendDuration);
      // Route changed within the SPA (no pagehide fired) — still record
      // how long they spent on the page they're leaving.
      sendDuration();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
}