"use client";

import { useEffect, useRef, useState } from "react";

interface AdSlotProps {
  slotId?: string;
  width?: number;
  height?: number;
  className?: string;
  format?: "banner" | "rectangle" | "auto" | "responsive";
  section?: "hero" | "sidebar" | "content" | "footer";
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function AdSlot({
  slotId,
  width = 728,
  height = 90,
  className = "",
  format = "auto",
  section = "content",
}: AdSlotProps) {
  const adRef = useRef<HTMLModElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);

  const pid = process.env.NEXT_PUBLIC_ADSENSE_PID;
  const resolvedSlot = slotId ?? process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN;
  const isLive = Boolean(pid && resolvedSlot);

  useEffect(() => {
    if (!isLive || initialized.current) return;

    const container = containerRef.current;
    const adEl = adRef.current;
    if (!container || !adEl) return;

    // Guard: if the container has zero width, AdSense will throw
    // "No slot size for availableWidth=0". Skip push entirely in that case.
    const containerWidth = container.getBoundingClientRect().width;
    if (containerWidth < 1) {
      setAdError("Container too small");
      return;
    }

    initialized.current = true;

    // Monitor for successful ad load
    const observer = new MutationObserver(() => {
      if (adEl && adEl.innerHTML.trim() !== "") {
        setAdLoaded(true);
        setAdError(null);
        observer.disconnect();
      }
    });
    observer.observe(adEl, { childList: true, subtree: true });

    // Small delay to let the AdSense script initialize
    const timer = setTimeout(() => {
      try {
        // Ensure adsbygoogle array exists
        if (!window.adsbygoogle) {
          window.adsbygoogle = [];
        }
        // Push empty config to trigger ad display
        (window.adsbygoogle as unknown[]).push({});
      } catch (e) {
        console.warn("[AdSlot] AdSense push failed:", e);
        setAdError("AdSense initialization failed");
      }
    }, 200);

    // Cleanup observer after timeout (ad should load within 5s)
    const cleanupTimer = setTimeout(() => {
      observer.disconnect();
      // If ad still not loaded after 5 seconds, it might be blocked
      if (!adLoaded) {
        setAdError("Ad load timeout");
      }
    }, 5000);

    // Cleanup on unmount
    return () => {
      clearTimeout(timer);
      clearTimeout(cleanupTimer);
      observer.disconnect();
    };
  }, [isLive, adLoaded]);

  // Dev/fallback placeholder — no live PID set
  if (!isLive) {
    return (
      <div className={`ad-banner ad-banner--dev ${className}`} data-section={section}>
        <span className="ad-label">Sponsored</span>
        <div className="ad-content">
          <span className="ad-slot-text">
            [{section.charAt(0).toUpperCase() + section.slice(1)} Ad Unit — {width}×{height}]
          </span>
        </div>
        <span className="ad-label">Advertisement</span>
      </div>
    );
  }

  // Show error state if ad failed to load
  if (adError) {
    return (
      <div 
        className={`ad-banner ad-banner--error ${className}`} 
        data-section={section}
        title={`Ad loading failed: ${adError}`}
      >
        <span className="ad-label">Advertisement</span>
      </div>
    );
  }

  // Calculate style based on format
  const insStyle = format !== "auto" && format !== "responsive"
    ? { 
        display: "inline-block" as const, 
        width: `${width}px`, 
        height: `${height}px`,
        textAlign: "center" as const,
      }
    : { 
        display: "block" as const, 
        width: "100%", 
        height: "auto",
        textAlign: "center" as const,
      };

  return (
    <div
      ref={containerRef}
      className={`ad-banner ${adLoaded ? "ad-banner--loaded" : "ad-banner--loading"} ${className}`}
      data-section={section}
      style={{ 
        overflow: "hidden", 
        width: "100%", 
        maxWidth: "100%",
        minHeight: format === "auto" ? "auto" : `${height}px`,
      }}
    >
      <span className="ad-label">Sponsored</span>
      <div className="ad-content" style={{ overflow: "hidden", maxWidth: "100%" }}>
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={insStyle}
          data-ad-client={pid}
          data-ad-slot={resolvedSlot}
          data-ad-format={format === "auto" || format === "responsive" ? "auto" : undefined}
          data-full-width-responsive={format === "responsive" ? "true" : undefined}
          data-ad-layout={section === "sidebar" ? "in-article" : undefined}
        />
      </div>
      <span className="ad-label">Advertisement</span>
    </div>
  );
}