"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const ScrollReset       = dynamic(() => import("@/components/ScrollReset"),        { ssr: false });
const ScrollToTopButton = dynamic(() => import("@/components/ScrollToTopButton"),  { ssr: false });
const CookieBanner      = dynamic(() => import("@/components/CookieBanner"),       { ssr: false });
const FeedbackWidget    = dynamic(() => import("@/components/FeedbackWidget"),     { ssr: false });
const LoadingSpinner    = dynamic(() => import("@/components/LoadingSpinner"),     { ssr: false });

export default function ClientComponents() {
  return (
    <>
      <ScrollReset />
      <CookieBanner />
      <ScrollToTopButton />
      <FeedbackWidget />
      {/* LoadingSpinner needs Suspense because it uses useSearchParams */}
      <Suspense fallback={null}>
        <LoadingSpinner />
      </Suspense>
    </>
  );
}