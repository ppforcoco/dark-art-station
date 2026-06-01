"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

// ── PERF FIX: All non-critical client components are loaded lazily.
// Cursor is ONLY loaded on pointer:fine (desktop/mouse) devices.
// On mobile (pointer:coarse) we skip it entirely — saves:
//   • The Cursor.tsx bundle (~8KB parsed + executed)
//   • The external hand image fetch from R2 (~30KB)
//   • The module-eval-time style injection that hid cursor on mobile
//   • The requestAnimationFrame loop that ran even when invisible
// This was the #1 cause of the "site loads → freezes → reloads" bug on iOS:
// the cursor module ran cursor:none on ALL elements including iOS tap targets,
// which confused Safari's hit-testing and triggered a navigation abort.

// ✅ CURSOR RE-ENABLED — loaded only on pointer:fine devices (mouse/trackpad)
// The Cursor component itself also listens for pointer media changes at runtime,
// so plugging in a mouse after page load activates it without a reload.
const Cursor            = dynamic(() => import("@/components/Cursor"),             { ssr: false });
const ScrollReset       = dynamic(() => import("@/components/ScrollReset"),        { ssr: false });
const ScrollToTopButton = dynamic(() => import("@/components/ScrollToTopButton"),  { ssr: false });
const CookieBanner      = dynamic(() => import("@/components/CookieBanner"),       { ssr: false });
// Deferred — lowest priority, load after everything else is interactive
const FeedbackWidget    = dynamic(() => import("@/components/FeedbackWidget"),     { ssr: false });

export default function ClientComponents() {
  // ── Detect pointer type on the client ──────────────────────────────────────
  // We can't do this at SSR time — the server has no concept of pointer device.
  // null = "unknown until client hydrates"
  // We only render <Cursor> after we confirm pointer:fine (mouse/trackpad).
  // pointer:coarse = touchscreen (mobile/tablet) → skip cursor entirely.
  const [isFinePonter, setIsFinePointer] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    setIsFinePointer(mq.matches);
    // Also update if pointer type changes (e.g. mouse plugged in while on page)
    const handler = (e: MediaQueryListEvent) => setIsFinePointer(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <>
      {/* Custom cursor — desktop/mouse only, never on mobile */}
      {isFinePonter === true && <Cursor />}

      {/* These run on all devices */}
      <ScrollReset />
      <CookieBanner />
      <ScrollToTopButton />

      {/* Non-critical — deferred */}
      <FeedbackWidget />
    </>
  );
}