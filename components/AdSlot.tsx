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

    let pushTimer: ReturnType<typeof setTimeout> | null = null;
    let cleanupTimer: ReturnType<typeof setTimeout> | null = null;
    let mutationObserver: MutationObserver | null = null;

    const tryPushAd = () => {
      if (initialized.current) return;

      const containerWidth = container.getBoundingClientRect().width;

      // AdSense needs at least 200px to serve any valid ad unit.
      // Returning silently here prevents the "No slot size for availableWidth=N" console errors.
      if (containerWidth < 200) {
        setAdError("Container too small");
        return;
      }

      initialized.current = true;

      // Monitor for successful ad fill
      mutationObserver = new MutationObserver(() => {
        if (adEl && adEl.innerHTML.trim() !== "") {
          setAdLoaded(true);
          setAdError(null);
          mutationObserver?.disconnect();
        }
      });
      mutationObserver.observe(adEl, { childList: true, subtree: true });

      // Small delay to let the AdSense script finish initialising
      pushTimer = setTimeout(() => {
        try {
          if (!window.adsbygoogle) window.adsbygoogle = [];
          (window.adsbygoogle as unknown[]).push({});
        } catch {
          // Suppress — AdSense errors are not actionable from our side
          setAdError("AdSense initialization failed");
        }
      }, 300);

      // Give AdSense 6 s to fill the slot before we give up
      cleanupTimer = setTimeout(() => {
        mutationObserver?.disconnect();
        if (!adLoaded) setAdError("Ad load timeout");
      }, 6000);
    };

    // Use ResizeObserver so we only push once the container has real layout width.
    // This is the main fix for availableWidth=0 / availableWidth=101 errors —
    // those happen when AdSense is pushed before the browser has painted the layout.
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width >= 200) {
          ro.disconnect();
          tryPushAd();
          break;
        }
      }
    });
    ro.observe(container);

    // Also attempt immediately — covers cases where the container already has width
    tryPushAd();

    return () => {
      ro.disconnect();
      mutationObserver?.disconnect();
      if (pushTimer) clearTimeout(pushTimer);
      if (cleanupTimer) clearTimeout(cleanupTimer);
    };
  }, [isLive]); // eslint-disable-line react-hooks/exhaustive-deps

  // Dev/fallback placeholder — no live PID set
  if (!isLive) {
    return (
      <div className={`ad-banner ad-banner--dev ${className}`} data-section={section}>
        <span className="ad-label ad-label--side">Sponsored</span>
        <div className="ad-content">
          <span className="ad-slot-text">
            [{section.charAt(0).toUpperCase() + section.slice(1)} Ad Unit — {width}×{height}]
          </span>
        </div>
        <span className="ad-label ad-label--side">Advertisement</span>
        <span className="ad-label ad-label--mobile">Advertisement</span>
      </div>
    );
  }

  // Error state — render a minimal invisible placeholder so layout isn't broken
  if (adError) {
    return (
      <div
        className={`ad-banner ad-banner--error ${className}`}
        data-section={section}
        title={`Ad loading failed: ${adError}`}
      >
        <span className="ad-label ad-label--mobile">Advertisement</span>
      </div>
    );
  }

  // Calculate style based on format
  const insStyle =
    format !== "auto" && format !== "responsive"
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
      <span className="ad-label ad-label--side">Sponsored</span>
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
      <span className="ad-label ad-label--side">Advertisement</span>
      <span className="ad-label ad-label--mobile">Advertisement</span>
    </div>
  );
}