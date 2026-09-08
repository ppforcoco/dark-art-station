"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { useDeferredMount } from "@/components/useDeferredMount";

const ScrollReset       = dynamic(() => import("@/components/ScrollReset"),        { ssr: false });
const ScrollToTopButton = dynamic(() => import("@/components/ScrollToTopButton"),  { ssr: false });
const CookieBanner      = dynamic(() => import("@/components/CookieBanner"),       { ssr: false });
const FeedbackWidget    = dynamic(() => import("@/components/FeedbackWidget"),     { ssr: false });
const LoadingSpinner    = dynamic(() => import("@/components/LoadingSpinner"),     { ssr: false });
const SiteAnalytics     = dynamic(() => import("@/components/SiteAnalytics"),      { ssr: false });
const PWARegister       = dynamic(() => import("@/components/PWARegister"),        { ssr: false });

export default function ClientComponents() {
  // Non-critical widgets are deferred until the main thread is idle (or a
  // ~2.5s fallback), so they don't compete with a real user's first taps
  // for main-thread time. This is what INP (Interaction to Next Paint)
  // measures, and it's the main thing a single-run Lighthouse test can't
  // catch but real visitors feel.
  const deferredReady = useDeferredMount(2500);

  return (
    <>
      <ScrollReset />
      <ScrollToTopButton />
      {/* First-party pageview/duration tracking — first-party analytics is
          cheap and useful right away, so it stays immediate. */}
      <Suspense fallback={null}>
        <SiteAnalytics />
      </Suspense>
      {/* LoadingSpinner needs Suspense because it uses useSearchParams */}
      <Suspense fallback={null}>
        <LoadingSpinner />
      </Suspense>

      {/* ── Deferred: not needed for first paint or first interaction ── */}
      {deferredReady && (
        <>
          <CookieBanner />
          <FeedbackWidget />
          {/* Background ambient sound player — user has to opt in to play it anyway. */}
          {/* Service Worker registration — safe to defer, doesn't affect visible UI. */}
          <PWARegister />
        </>
      )}
    </>
  );
}