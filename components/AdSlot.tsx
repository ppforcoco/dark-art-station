"use client";

import { useEffect, useRef } from "react";

interface AdSlotProps {
  slotId?: string;           // data-ad-slot value — pass explicitly or falls back to env
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
  // Resolve slot: explicit prop → env fallback
  const resolvedSlot = slotId ?? process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN;

  const isLive = Boolean(pid && resolvedSlot);

  useEffect(() => {
    if (!isLive || initialized.current) return;
    initialized.current = true;

    try {
      // Push the ad unit after mount
      ((window as unknown as { adsbygoogle: unknown[] }).adsbygoogle =
        (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || []).push({});
    } catch (e) {
      // AdSense not loaded yet — safe to ignore in dev
      console.warn("[AdSlot] adsbygoogle push failed:", e);
    }
  }, [isLive]);

  return (
    <div
      className={`bg-[#0a0a0a] border-y border-[rgba(139,0,0,0.4)] px-6 md:px-[60px] py-4 flex items-center justify-between gap-5 ${className}`}
    >
      <span className="font-mono text-[0.55rem] tracking-[0.15em] uppercase text-[#4a445a] shrink-0">
        Sponsored
      </span>

      {/* Ad content area */}
      <div className="flex-1 flex items-center justify-center border-x border-[#2a2535] px-10 py-2">
        {isLive ? (
          // Live AdSense unit
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: "block", width, height }}
            data-ad-client={pid}
            data-ad-slot={resolvedSlot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : (
          // Placeholder shown in dev / when env vars are missing
          <div
            className="flex items-center justify-center"
            style={{ minWidth: Math.min(width, 728), height }}
          >
            <span className="font-body italic text-[1.1rem] text-[#c9a84c] opacity-40 text-center hidden md:block">
              [ Google Ad Unit — {width}×{height} leaderboard slot ]
            </span>
            <span className="font-body italic text-[1rem] text-[#c9a84c] opacity-40 text-center block md:hidden">
              [ Google Ad Unit — 320×50 ]
            </span>
          </div>
        )}
      </div>

      <span className="font-mono text-[0.55rem] tracking-[0.15em] uppercase text-[#4a445a] shrink-0">
        Advertisement
      </span>
    </div>
  );
}