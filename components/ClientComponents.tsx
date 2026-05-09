"use client";

import dynamic from "next/dynamic";

const HalloweenCountdown = dynamic(() => import("@/components/HalloweenCountdown"), { ssr: false });
const Cursor             = dynamic(() => import("@/components/Cursor"),             { ssr: false });
const ScrollToTopButton  = dynamic(() => import("@/components/ScrollToTopButton"),  { ssr: false });
const CookieBanner       = dynamic(() => import("@/components/CookieBanner"),       { ssr: false });
const ScrollReset        = dynamic(() => import("@/components/ScrollReset"),        { ssr: false });
const FeedbackWidget     = dynamic(() => import("@/components/FeedbackWidget"),     { ssr: false });

export default function ClientComponents() {
  return (
    <>
      <Cursor />
      <ScrollReset />
      <HalloweenCountdown />
      <ScrollToTopButton />
      <CookieBanner />
      <FeedbackWidget />
    </>
  );
}