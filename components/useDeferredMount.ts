"use client";

import { useEffect, useState } from "react";

/**
 * Defers rendering of non-critical UI until the main thread is idle
 * (or after `timeoutMs`, whichever comes first). This keeps things like
 * the cookie banner, feedback widget, and ambient player from competing
 * with real user taps/clicks for main-thread time right after page load,
 * which is what INP (Interaction to Next Paint) measures.
 *
 * Falls back to setTimeout on browsers without requestIdleCallback (Safari).
 */
export function useDeferredMount(timeoutMs = 2500): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let idleId: number | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const markReady = () => setReady(true);

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(markReady, { timeout: timeoutMs });
    } else {
      timeoutId = setTimeout(markReady, timeoutMs);
    }

    return () => {
      if (idleId !== null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== null) clearTimeout(timeoutId);
    };
  }, [timeoutMs]);

  return ready;
}