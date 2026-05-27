"use client";

import dynamic from "next/dynamic";

// ── PERF FIX: All non-critical client components are loaded lazily.
// Cursor and ScrollReset are loaded first (small, needed early).
// Heavy components (HalloweenCountdown, FeedbackWidget) are deferred
// via ssr:false + no loading state so they don't block the main thread.
// This reduces Total Blocking Time (TBT) by spreading JS parse/exec
// across idle periods instead of all at once after hydration.

const Cursor            = dynamic(() => import("@/components/Cursor"),             { ssr: false });
const ScrollReset       = dynamic(() => import("@/components/ScrollReset"),        { ssr: false });
const ScrollToTopButton = dynamic(() => import("@/components/ScrollToTopButton"),  { ssr: false });
const CookieBanner      = dynamic(() => import("@/components/CookieBanner"),       { ssr: false });
// Deferred — lowest priority, load after everything else is interactive
const FeedbackWidget = dynamic(() => import("@/components/FeedbackWidget"), { ssr: false });

export default function ClientComponents() {
  return (
    <>
      {/* Critical UX — load immediately */}
      <Cursor />
      <ScrollReset />
      <CookieBanner />
      <ScrollToTopButton />
      {/* Non-critical — deferred, won't block interactivity */}
      <FeedbackWidget />
    </>
  );
}