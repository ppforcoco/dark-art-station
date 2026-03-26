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
  const adRef       = useRef<HTMLModElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const [adLoaded, setAdLoaded] = useState(false);

  const pid          = process.env.NEXT_PUBLIC_ADSENSE_PID;
  const resolvedSlot = slotId ?? process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN;
  const isLive       = Boolean(pid && resolvedSlot);

  useEffect(() => {
    if (!isLive || initialized.current) return;

    const container = containerRef.current;
    const adEl      = adRef.current;
    if (!container || !adEl) return;

    // Guard: if the container has zero width, AdSense will throw
    // "No slot size for availableWidth=0". Skip push entirely in that case.
    const containerWidth = container.getBoundingClientRect().width;
    if (containerWidth < 1) return;

    initialized.current = true;

    const observer = new MutationObserver(() => {
      if (adEl && adEl.innerHTML.trim() !== "") {
        setAdLoaded(true);
        observer.disconnect();
      }
    });
    observer.observe(adEl, { childList: true, subtree: true });

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
      ref={containerRef}
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
