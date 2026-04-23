"use client";
import { useState, useEffect, ReactNode } from "react";
import Link from "next/link";

interface Props {
  href: string;
  viewCount?: number;
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
          <Link href="/iphone"  className="keep-exploring-link">iPhone</Link>
          <Link href="/android" className="keep-exploring-link">Android</Link>
          <Link href="/pc"      className="keep-exploring-link">PC</Link>
          <Link href="/shop"    className="keep-exploring-link keep-exploring-link--accent">Browse All →</Link>
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
      <style>{`
        .keep-exploring-bar {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          z-index: 8888;
          background: rgba(10, 6, 20, 0.97);
          border-top: 1px solid rgba(192, 0, 26, 0.4);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          padding: 12px 20px;
          animation: slideUpBar 0.35s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        @keyframes slideUpBar {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        [data-theme="light"] .keep-exploring-bar {
          background: rgba(242, 237, 225, 0.98);
          border-color: rgba(192,0,26,0.2);
        }
        .keep-exploring-inner {
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .keep-exploring-text {
          font-size: 0.78rem;
          color: #c4bdd8;
          font-family: monospace;
          letter-spacing: 0.04em;
          flex: 1;
          min-width: 160px;
        }
        [data-theme="light"] .keep-exploring-text { color: #4a4060; }
        .keep-exploring-links {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .keep-exploring-link {
          font-size: 0.7rem;
          font-family: monospace;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #8a8099;
          text-decoration: none;
          padding: 5px 12px;
          border: 1px solid rgba(255,255,255,0.1);
          transition: color 0.2s, border-color 0.2s, background 0.2s;
          white-space: nowrap;
        }
        .keep-exploring-link:hover {
          color: #f0ecff;
          border-color: rgba(192,0,26,0.4);
          background: rgba(192,0,26,0.08);
        }
        .keep-exploring-link--accent {
          color: #f0ecff;
          border-color: rgba(192,0,26,0.5);
          background: rgba(192,0,26,0.12);
        }
        .keep-exploring-link--accent:hover {
          background: rgba(192,0,26,0.22);
          border-color: rgba(192,0,26,0.7);
        }
        [data-theme="light"] .keep-exploring-link { color: #6a6080; border-color: rgba(0,0,0,0.12); }
        [data-theme="light"] .keep-exploring-link:hover { color: #1a1625; border-color: rgba(192,0,26,0.3); background: rgba(192,0,26,0.06); }
        [data-theme="light"] .keep-exploring-link--accent { color: #900015; border-color: rgba(192,0,26,0.4); background: rgba(192,0,26,0.07); }
        .keep-exploring-dismiss {
          background: none;
          border: none;
          color: #5a5470;
          cursor: pointer;
          font-size: 0.75rem;
          padding: 4px 6px;
          transition: color 0.2s;
          flex-shrink: 0;
          line-height: 1;
        }
        .keep-exploring-dismiss:hover { color: #c4bdd8; }
        @media (max-width: 480px) {
          .keep-exploring-inner { gap: 10px; }
          .keep-exploring-text { font-size: 0.7rem; }
        }
      `}</style>
    </div>
  );
}

// ── Main DownloadButton ───────────────────────────────────────────────────────
export default function DownloadButton({ href, viewCount, label, children }: Props) {
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
        {viewCount !== undefined && (
          <div className="download-stats-row">
            <span className="download-stat">👁 {viewCount.toLocaleString()} views</span>
            <span
              className="download-saved-msg"
              style={{ opacity: state === "done" ? 1 : 0 }}
              aria-live="polite"
            >
              ✓ Check your downloads folder
            </span>
          </div>
        )}

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

        {isMobile && canShare && (
          <p className="download-share-hint">Tap ↑ to set directly as wallpaper</p>
        )}

        <p className="download-sublabel">JPEG · 4K resolution · No account · No watermark</p>
      </div>

      {/* ── Sticky Keep Exploring bar ── */}
      <KeepExploringBar visible={showBar} />
    </>
  );
}