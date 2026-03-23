"use client";
import { useState, useEffect } from "react";

interface Props {
  href: string;
  viewCount: number;
  label?: string;
}

export default function DownloadButton({ href, viewCount, label }: Props) {
  const [state,     setState]     = useState<"idle" | "loading" | "done">("idle");
  const [isMobile,  setIsMobile]  = useState(false);
  const [canShare,  setCanShare]  = useState(false);

  useEffect(() => {
    const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobile(mobile);
    setCanShare(mobile && typeof navigator.share === "function");
  }, []);

  function handleDownloadClick() {
    if (state === "done") return;
    setState("loading");
    setTimeout(() => setState("done"), 1400);
  }

  async function handleShare() {
    if (typeof navigator.share === "function") {
      try {
        // Share the page URL directly — instant, no blob download needed.
        // User can save from the share sheet; we don't need to pre-fetch the file.
        await navigator.share({
          title: "Haunted Wallpaper",
          text:  "Free dark wallpaper from hauntedwallpapers.com",
          url:   window.location.href,
        });
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }
    // Fallback: trigger direct download
    handleDownloadClick();
  }

  const buttonLabel =
    state === "loading" ? "Preparing…"
    : state === "done"  ? "✓ Download Started"
    : label             ?? "↓ Download 4K · Free";

  const bgColor =
    state === "done"    ? "#1a5c35"
    : state === "loading" ? "#6b0000"
    : "#8b0000";

  return (
    <div className="download-btn-wrap">
      {/* Stats row */}
      <div className="download-stats-row">
        <span className="download-stat">
          👁 {viewCount.toLocaleString()} views
        </span>
        <span
          className="download-saved-msg"
          style={{ opacity: state === "done" ? 1 : 0 }}
          aria-live="polite"
        >
          ✓ Check your downloads folder
        </span>
      </div>

      {/* Buttons row */}
      <div style={{ display: "flex", gap: "10px" }}>
        {/* Main download button */}
        <a
          href={state === "loading" ? "#" : href}
          onClick={handleDownloadClick}
          className="download-btn"
          style={{ backgroundColor: bgColor, borderColor: bgColor, flex: 1 }}
          aria-label={buttonLabel}
          download
        >
          {buttonLabel}
        </a>

        {/* Mobile: "Set as Wallpaper" button via Web Share API */}
        {isMobile && (
          <button
            type="button"
            onClick={handleShare}
            className="download-share-btn"
            aria-label="Set as wallpaper"
            title="Set as wallpaper"
          >
            {canShare ? (
              /* Share icon */
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M3 9h18"/>
                <path d="M9 21V9"/>
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Mobile hint */}
      {isMobile && canShare && (
        <p className="download-share-hint">
          Tap ↑ to set directly as wallpaper
        </p>
      )}

      <p className="download-sublabel">
        JPEG · 4K resolution · No account · No watermark
      </p>
    </div>
  );
}