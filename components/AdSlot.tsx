"use client";

import { useEffect, useRef, useState } from "react";

interface AdSlotProps {
  slotId?: string;
  width?: number;
  height?: number;
  className?: string;
  format?: "banner" | "rectangle" | "auto";
}

export default function AdSlot({
  slotId,
  width = 728,
  height = 90,
  className = "",
  format = "auto",
}: AdSlotProps) {
  const adRef = useRef<HTMLModElement>(null);
  const initialized = useRef(false);
  const [adLoaded, setAdLoaded] = useState(false);

  const pid          = process.env.NEXT_PUBLIC_ADSENSE_PID;
  const resolvedSlot = slotId ?? process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN;
  const isLive       = Boolean(pid && resolvedSlot);

  // Push the ad unit on mount — no consent gate needed.
  // The AdSense script is loaded unconditionally in layout.tsx,
  // and Google Consent Mode v2 (also in layout.tsx) automatically
  // serves non-personalized ads when consent is denied/unknown.
  useEffect(() => {
    if (!isLive || initialized.current) return;
    initialized.current = true;

    const observer = new MutationObserver(() => {
      if (adRef.current && adRef.current.innerHTML.trim() !== "") {
        setAdLoaded(true);
        observer.disconnect();
      }
    });
    if (adRef.current) {
      observer.observe(adRef.current, { childList: true, subtree: true });
    }

    // Small delay to let the AdSense script initialise
    const timer = setTimeout(() => {
      try {
        (
          (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle =
            (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || []
        ).push({});
      } catch (e) {
        console.warn("[AdSlot] push failed:", e);
      }
    }, 200);

    const cleanupTimer = setTimeout(() => observer.disconnect(), 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(cleanupTimer);
      observer.disconnect();
    };
  }, [isLive]);

  // Dev placeholder — no live PID set
  if (!isLive) {
    return (
      <div className={`ad-banner ad-banner--dev ${className}`}>
        <span className="ad-label">Sponsored</span>
        <div className="ad-content">
          <span className="ad-slot-text">
            [ Ad Unit — {width}&times;{height} ]
          </span>
        </div>
        <span className="ad-label">Advertisement</span>
      </div>
    );
  }

  const insStyle = format !== "auto"
    ? { display: "inline-block" as const, width: `${width}px`, height: `${height}px` }
    : { display: "block" as const, width: "100%", height: "auto" };

  return (
    <div
      className={`ad-banner ${adLoaded ? "ad-banner--loaded" : "ad-banner--empty"} ${className}`}
      style={{ overflow: "hidden", width: "100%", maxWidth: "100%" }}
    >
      <span className="ad-label">Sponsored</span>
      <div className="ad-content" style={{ overflow: "hidden", maxWidth: "100%" }}>
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={insStyle}
          data-ad-client={pid}
          data-ad-slot={resolvedSlot}
          data-ad-format={format === "auto" ? "auto" : undefined}
          data-full-width-responsive={format === "auto" ? "true" : undefined}
        />
      </div>
      <span className="ad-label">Advertisement</span>
    </div>
  );
}