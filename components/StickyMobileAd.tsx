"use client";

import { useEffect, useState } from "react";

export default function StickyMobileAd() {
  const [dismissed, setDismissed] = useState(false);
  const [isMobile,  setIsMobile]  = useState(false);
  const [pushed,    setPushed]    = useState(false);

  const pid  = process.env.NEXT_PUBLIC_ADSENSE_PID;
  const slot = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ANCHOR ?? process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER;

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  // Push the ad unit once it's visible
  useEffect(() => {
    if (!isMobile || dismissed || pushed || !pid || !slot) return;
    setPushed(true);
    const timer = setTimeout(() => {
      try {
        (
          (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle =
            (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || []
        ).push({});
      } catch (e) {
        console.warn("[StickyMobileAd] push failed:", e);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [isMobile, dismissed, pushed, pid, slot]);

  // ✅ FIX: Removed the "return null" line that was hiding this ad on mobile.
  // Now it shows a small banner at the bottom of the screen on phones only.

  // Don't show on desktop, or if user dismissed it, or if no AdSense credentials
  if (!isMobile || dismissed || !pid || !slot) return null;

  return (
    <div
      style={{
        position:       "fixed",
        bottom:         0,
        left:           0,
        right:          0,
        zIndex:         8000,
        background:     "#0c0b14",
        borderTop:      "1px solid rgba(192,0,26,0.3)",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        padding:        "4px 32px 4px 4px",
        paddingBottom:  "calc(4px + env(safe-area-inset-bottom))",
        minHeight:      "58px",
      }}
    >
      {/* Close button */}
      <button
        onClick={() => setDismissed(true)}
        aria-label="Close ad"
        style={{
          position:    "absolute",
          top:         "50%",
          right:       "6px",
          transform:   "translateY(-50%)",
          background:  "transparent",
          border:      "none",
          color:       "#4a445a",
          fontSize:    "1rem",
          lineHeight:  1,
          cursor:      "pointer",
          padding:     "8px",
          touchAction: "manipulation",
        }}
      >
        ✕
      </button>

      <ins
        className="adsbygoogle"
        style={{ display: "inline-block", width: "320px", height: "50px" }}
        data-ad-client={pid}
        data-ad-slot={slot}
      />
    </div>
  );
}