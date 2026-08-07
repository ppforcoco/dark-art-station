"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const ScrollReset       = dynamic(() => import("@/components/ScrollReset"),        { ssr: false });
const ScrollToTopButton = dynamic(() => import("@/components/ScrollToTopButton"),  { ssr: false });
const CookieBanner      = dynamic(() => import("@/components/CookieBanner"),       { ssr: false });
const FeedbackWidget    = dynamic(() => import("@/components/FeedbackWidget"),     { ssr: false });
const LoadingSpinner    = dynamic(() => import("@/components/LoadingSpinner"),     { ssr: false });
const SiteAnalytics     = dynamic(() => import("@/components/SiteAnalytics"),      { ssr: false });

export default function ClientComponents() {
  return (
    <>
      <ScrollReset />
      <CookieBanner />
      <ScrollToTopButton />
      <FeedbackWidget />
      {/* First-party pageview/duration tracking — site-wide, every route. */}
      <Suspense fallback={null}>
        <SiteAnalytics />
      </Suspense>
      {/* LoadingSpinner needs Suspense because it uses useSearchParams */}
      <Suspense fallback={null}>
        <LoadingSpinner />
      </Suspense>
    </>
  );
}