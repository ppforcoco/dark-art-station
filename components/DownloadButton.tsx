"use client";
import { useState, useEffect, ReactNode } from "react";
import Link from "next/link";

interface Props {
  href: string;
  slug?: string;          // used to seed the fake download count
  viewCount?: number;
  downloadCount?: number;
  label?: string;
  children?: ReactNode;
}



// ── Sticky "Keep Exploring" bar shown after download ─────────────────────────
function KeepExploringBar({ visible }: { visible: boolean }) {
  const [dismissed, setDismissed] = useState(false);
  if (!visible || dismissed) return null;
  return (
    <div className="keep-exploring-bar" role="complementary" aria-label="Keep exploring">
      <div className="keep-exploring-inner">
        <span className="keep-exploring-text">🔥 Like this? Explore more dark wallpapers</span>
        <div className="keep-exploring-links">
          <Link prefetch={false} href="/iphone"  className="keep-exploring-link">iPhone</Link>
          <Link prefetch={false} href="/android" className="keep-exploring-link">Android</Link>
          <Link prefetch={false} href="/pc"      className="keep-exploring-link">PC</Link>
          <Link prefetch={false} href="/shop"    className="keep-exploring-link keep-exploring-link--accent">Browse All →</Link>
        </div>
        <button
          type="button"
          className="keep-exploring-dismiss"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ── Main DownloadButton ───────────────────────────────────────────────────────
export default function DownloadButton({ href, slug, viewCount, downloadCount, label, children }: Props) {
  const [state,    setState]    = useState<"idle" | "loading" | "done">("idle");
  const [isMobile, setIsMobile] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [showBar,  setShowBar]  = useState(false);

  useEffect(() => {
    const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobile(mobile);
    setCanShare(mobile && typeof navigator.share === "function");
  }, []);

  // Show the keep-exploring bar 2 seconds after download starts
  useEffect(() => {
    if (state === "done") {
      const t = setTimeout(() => setShowBar(true), 2000);
      return () => clearTimeout(t);
    }
  }, [state]);

  function handleDownloadClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (state === "loading" || state === "done") { e.preventDefault(); return; }
    setState("loading");
    setTimeout(() => setState("done"), 1400);

    if (typeof window !== "undefined" && typeof (window as any).umami === "object") {
      (window as any).umami.track("download", {
        file: href.split("/").pop() ?? href,
      });
    }
  }

  function triggerDownloadState() {
    if (state === "loading" || state === "done") return;
    setState("loading");
    setTimeout(() => setState("done"), 1400);
  }

  async function handleShare() {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "Haunted Wallpaper",
          text: "Free dark wallpaper from hauntedwallpapers.com",
          url: window.location.href,
        });
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }
    triggerDownloadState();
  }

  const resolvedLabel = children
    ? (state === "loading" ? "Preparing…" : state === "done" ? "✓ Download Started" : children)
    : (state === "loading" ? "Preparing…"
      : state === "done"   ? "✓ Download Started"
      : label              ?? "↓ Download 4K · Free");

  const bgColor =
    state === "done"     ? "#1a5c35"
    : state === "loading" ? "#6b0000"
    : "#8b0000";

  return (
    <>
      <div className="download-btn-wrap">

        <div style={{ display: "flex", gap: "10px" }}>
          <a
            href={href}
            onClick={handleDownloadClick}
            className="download-btn"
            style={{ backgroundColor: bgColor, borderColor: bgColor, flex: 1 }}
            aria-label={typeof resolvedLabel === "string" ? resolvedLabel : "Download"}
            download
          >
            {resolvedLabel}
          </a>

          {isMobile && (
            <button
              type="button"
              onClick={handleShare}
              className="download-share-btn"
              aria-label="Set as wallpaper"
              title="Set as wallpaper"
            >
              {canShare ? (
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
      </div>

      {/* ── Sticky Keep Exploring bar ── */}
      <KeepExploringBar visible={showBar} />
    </>
  );
}