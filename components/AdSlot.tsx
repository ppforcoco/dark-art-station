"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "hw-cookie-consent";

function getConsent(): "accepted" | "declined" | null {
  try {
    return (localStorage.getItem(STORAGE_KEY) as "accepted" | "declined") ?? null;
  } catch {
    return null;
  }
}

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
  const [consent, setConsent] = useState<"accepted" | "declined" | null>(null);

  const pid = process.env.NEXT_PUBLIC_ADSENSE_PID;
  const resolvedSlot = slotId ?? process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN;
  const isLive = Boolean(pid && resolvedSlot);

  // Read consent on mount, then listen for changes
  useEffect(() => {
    setConsent(getConsent());

    function onConsentChange(e: Event) {
      const detail = (e as CustomEvent).detail as "accepted" | "declined";
      setConsent(detail);
    }

    window.addEventListener("hw-consent-change", onConsentChange);
    return () => window.removeEventListener("hw-consent-change", onConsentChange);
  }, []);

  // Push ad unit once consent state is known (null = not yet decided, skip for now)
  // With Consent Mode v2 set in layout.tsx, Google shows non-personalized ads
  // to declined users automatically — we just need to push the slot.
  useEffect(() => {
    if (!isLive || consent === null || initialized.current) return;
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

    // Small delay to ensure AdSense script has loaded after consent injection
    const timer = setTimeout(() => {
      try {
        (
          (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle =
            (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || []
        ).push({});
      } catch (e) {
        console.warn("[AdSlot] push failed:", e);
      }
    }, 300);

    const cleanupTimer = setTimeout(() => observer.disconnect(), 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(cleanupTimer);
      observer.disconnect();
    };
  }, [isLive, consent]);

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

  // consent === null means banner not yet dismissed — don't show ad yet
  // consent === "accepted" or "declined" — render (Google handles personalization)
  if (consent === null) {
    return null;
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