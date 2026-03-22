"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "hw-cookie-consent";

export default function StickyMobileAd() {
  const [consent, setConsent] = useState<"accepted" | "declined" | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Only show on mobile
    setIsMobile(window.innerWidth < 768);

    // Read consent
    try {
      setConsent((localStorage.getItem(STORAGE_KEY) as "accepted" | "declined") ?? null);
    } catch { setConsent(null); }

    // Listen for consent changes
    function onConsent(e: Event) {
      setConsent((e as CustomEvent).detail as "accepted" | "declined");
    }
    window.addEventListener("hw-consent-change", onConsent);
    return () => window.removeEventListener("hw-consent-change", onConsent);
  }, []);

  const pid  = process.env.NEXT_PUBLIC_ADSENSE_PID;
  const slot = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ANCHOR ?? process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER;

  // null = cookie banner not yet dismissed, don't show ad yet
  // "accepted" or "declined" = show ad (Consent Mode v2 handles personalization)
  if (!isMobile || dismissed || consent === null || !pid || !slot) return null;

  return (
    <div
      style={{
        position:        "fixed",
        bottom:          0,
        left:            0,
        right:           0,
        zIndex:          8000,
        background:      "#0c0b14",
        borderTop:       "1px solid rgba(192,0,26,0.3)",
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        padding:         "4px 32px 4px 4px",
        paddingBottom:   "calc(4px + env(safe-area-inset-bottom))",
        minHeight:       "58px",
      }}
    >
      {/* Close button */}
      <button
        onClick={() => setDismissed(true)}
        aria-label="Close ad"
        style={{
          position:        "absolute",
          top:             "50%",
          right:           "6px",
          transform:       "translateY(-50%)",
          background:      "transparent",
          border:          "none",
          color:           "#4a445a",
          fontSize:        "1rem",
          lineHeight:      1,
          cursor:          "pointer",
          padding:         "8px",
          touchAction:     "manipulation",
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

      <script
        dangerouslySetInnerHTML={{
          __html: `(adsbygoogle=window.adsbygoogle||[]).push({});`,
        }}
      />
    </div>
  );
}