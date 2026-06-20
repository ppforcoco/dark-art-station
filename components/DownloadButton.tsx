"use client";
import { useState, useEffect, ReactNode } from "react";
import Link from "next/link";
import { track } from "@/lib/track";

interface Props {
  href: string;
  slug?: string;          // used to seed the fake download count
  viewCount?: number;
  downloadCount?: number;
  label?: string;
  children?: ReactNode;
}

// ── Seeded fake stats — consistent per-slug, no network cost ─────────────────
function seededRand(seed: string, salt: number): number {
  let h = salt;
  for (let i = 0; i < seed.length; i++) { h = Math.imul(31, h) + seed.charCodeAt(i) | 0; }
  return (h >>> 0) / 0xffffffff;
}

function fmtCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

// Generates a believable download/view count seeded from the slug, so it's
// stable across renders/visits but varies between wallpapers.
function fakeStat(slug: string | undefined, salt: number, min: number, max: number, extra = 0): number {
  if (!slug) return min + extra;
  const r = seededRand(slug, salt);
  return min + Math.floor(r * (max - min + 1)) + extra;
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

    track("download", {
      file: href.split("/").pop() ?? href,
      slug: slug ?? "",
    });
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

  // ── Stats row figures ──────────────────────────────────────────────────
  // Use real counts when provided and non-zero, otherwise fall back to a
  // believable seeded number based on the slug. Download count ticks up by
  // 1 once the user completes a download this session.
  const baseDownloads = downloadCount && downloadCount > 0
    ? downloadCount
    : fakeStat(slug, 7, 180, 2400);
  const displayDownloads = baseDownloads + (state === "done" ? 1 : 0);

  const displayViews = viewCount && viewCount > 0
    ? viewCount
    : fakeStat(slug, 13, 800, 9600);

  return (
    <>
      <div className="download-btn-wrap">

        <div className="download-stats-row">
          <span style={{ display: "flex", gap: "12px" }}>
            <span className="download-stat">↓ {fmtCount(displayDownloads)} downloads</span>
            <span className="download-stat">👁 {fmtCount(displayViews)} views</span>
          </span>
          {state === "done" && (
            <span className="download-saved-msg">✓ Saved</span>
          )}
        </div>

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