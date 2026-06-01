"use client";

import dynamic from "next/dynamic";

// Cursor intentionally disabled — using native browser cursor.
// The custom dagger cursor (Cursor.tsx) can be re-enabled by uncommenting
// the lines below if needed in future.
// const Cursor = dynamic(() => import("@/components/Cursor"), { ssr: false });

const ScrollReset       = dynamic(() => import("@/components/ScrollReset"),        { ssr: false });
const ScrollToTopButton = dynamic(() => import("@/components/ScrollToTopButton"),  { ssr: false });
const CookieBanner      = dynamic(() => import("@/components/CookieBanner"),       { ssr: false });
const FeedbackWidget    = dynamic(() => import("@/components/FeedbackWidget"),     { ssr: false });

export default function ClientComponents() {
  return (
    <>
      <ScrollReset />
      <CookieBanner />
      <ScrollToTopButton />
      <FeedbackWidget />
    </>
  );
}