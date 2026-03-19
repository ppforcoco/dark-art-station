"use client";

import { useEffect, useRef } from "react";

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

  const pid = process.env.NEXT_PUBLIC_ADSENSE_PID;
  const resolvedSlot = slotId ?? process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN;
  const isLive = Boolean(pid && resolvedSlot);

  useEffect(() => {
    if (!isLive || initialized.current) return;
    initialized.current = true;
    try {
      ((window as unknown as { adsbygoogle: unknown[] }).adsbygoogle =
        (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || []).push({});
    } catch (e) {
      console.warn("[AdSlot] adsbygoogle push failed:", e);
    }
  }, [isLive]);

  return (
    <div
      className={`ad-banner ${className}`}
      style={{ overflow: "hidden", width: "100%", maxWidth: "100%" }}
    >
      <span className="ad-label hidden sm:block">Sponsored</span>

      <div className="ad-content" style={{ overflow: "hidden", maxWidth: "100%" }}>
        {isLive ? (
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: "block", width: "100%", height: "auto" }}
            data-ad-client={pid}
            data-ad-slot={resolvedSlot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : (
          // THE FIX: the old placeholder used style={{ height }} where height=728
          // which put a 728px tall (and implicitly wide) element on mobile,
          // making the page layout wider than the viewport and causing zoom-out.
          // Now we use a percentage-based min-height that never exceeds the screen.
          <span className="ad-slot-text">
            <span className="hidden md:inline">[ Google Ad Unit — {width}×{height} ]</span>
            <span className="md:hidden">[ Ad ]</span>
          </span>
        )}
      </div>

      <span className="ad-label hidden sm:block">Advertisement</span>
    </div>
  );
}