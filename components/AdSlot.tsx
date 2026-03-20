"use client";

import { useEffect, useRef, useState } from "react";

interface AdSlotProps {
  slotId?: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function AdSlot({
  slotId,
  width = 728,
  height = 90,
  className = "",
}: AdSlotProps) {
  const adRef = useRef<HTMLModElement>(null);
  const initialized = useRef(false);
  // Track whether the live ad slot has received content
  const [adLoaded, setAdLoaded] = useState(false);

  const pid = process.env.NEXT_PUBLIC_ADSENSE_PID;
  const resolvedSlot = slotId ?? process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN;
  const isLive = Boolean(pid && resolvedSlot);

  useEffect(() => {
    if (!isLive || initialized.current) return;
    initialized.current = true;

    // Watch for AdSense filling the <ins> element
    const observer = new MutationObserver(() => {
      if (adRef.current && adRef.current.innerHTML.trim() !== "") {
        setAdLoaded(true);
        observer.disconnect();
      }
    });

    if (adRef.current) {
      observer.observe(adRef.current, { childList: true, subtree: true });
    }

    try {
      ((window as unknown as { adsbygoogle: unknown[] }).adsbygoogle =
        (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || []).push({});
    } catch (e) {
      console.warn("[AdSlot] adsbygoogle push failed:", e);
    }

    const timer = setTimeout(() => observer.disconnect(), 2000);
    return () => { clearTimeout(timer); observer.disconnect(); };
  }, [isLive]);

  // Dev / preview mode — dark themed placeholder, not a white box
  if (!isLive) {
    return (
      <div className={`ad-banner ad-banner--dev ${className}`}>
        <span className="ad-label">Sponsored</span>
        <div className="ad-content">
          <span className="ad-slot-text">[ Ad Unit — {width}&times;{height} ]</span>
        </div>
        <span className="ad-label">Advertisement</span>
      </div>
    );
  }

  // Live mode — hidden (display:none) until AdSense fills the slot
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
          style={{ display: "block", width: "100%", height: "auto" }}
          data-ad-client={pid}
          data-ad-slot={resolvedSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
      <span className="ad-label">Advertisement</span>
    </div>
  );
}