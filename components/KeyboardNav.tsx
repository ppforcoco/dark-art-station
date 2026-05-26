"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface NavImage {
  href:  string;
  title: string;
  thumb: string;
}

interface Props {
  prevHref: string | null;
  nextHref: string | null;
  /** If true, renders the visible ← PREVIOUS / NEXT → nav bar */
  showHint?: boolean;
  /** Pass the previous image's data to show a thumbnail + title */
  prevImage?: NavImage | null;
  /** Pass the next image's data to show a thumbnail + title */
  nextImage?: NavImage | null;
}

export default function KeyboardNav({ prevHref, nextHref, showHint, prevImage, nextImage }: Props) {
  const router = useRouter();

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((e.key === "ArrowLeft" || e.key === "ArrowUp") && prevHref) router.push(prevHref);
      if ((e.key === "ArrowRight" || e.key === "ArrowDown") && nextHref) router.push(nextHref);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [prevHref, nextHref, router]);

  if (!showHint) return null;

  const hasPrev = !!prevHref;
  const hasNext = !!nextHref;

  return (
    <>
      <nav className="hw-prevnext-nav" aria-label="Wallpaper navigation">
        {/* ── PREVIOUS ── */}
        {hasPrev ? (
          <Link href={prevHref!} className="hw-prevnext-link hw-prevnext-link--prev" prefetch>
            {prevImage?.thumb && (
              <div className="hw-prevnext-thumb">
                <Image src={prevImage.thumb} alt={prevImage.title} fill className="object-cover" unoptimized sizes="48px" />
              </div>
            )}
            <div className="hw-prevnext-text">
              <span className="hw-prevnext-label">← Previous</span>
              {prevImage?.title && (
                <span className="hw-prevnext-title">{prevImage.title}</span>
              )}
            </div>
          </Link>
        ) : (
          <div className="hw-prevnext-link hw-prevnext-link--disabled" aria-disabled="true">
            <div className="hw-prevnext-text">
              <span className="hw-prevnext-label">← Previous</span>
            </div>
          </div>
        )}

        {/* ── NEXT ── */}
        {hasNext ? (
          <Link href={nextHref!} className="hw-prevnext-link hw-prevnext-link--next" prefetch>
            <div className="hw-prevnext-text hw-prevnext-text--right">
              <span className="hw-prevnext-label">Next →</span>
              {nextImage?.title && (
                <span className="hw-prevnext-title">{nextImage.title}</span>
              )}
            </div>
            {nextImage?.thumb && (
              <div className="hw-prevnext-thumb">
                <Image src={nextImage.thumb} alt={nextImage.title} fill className="object-cover" unoptimized sizes="48px" />
              </div>
            )}
          </Link>
        ) : (
          <div className="hw-prevnext-link hw-prevnext-link--disabled hw-prevnext-link--next" aria-disabled="true">
            <div className="hw-prevnext-text hw-prevnext-text--right">
              <span className="hw-prevnext-label">Next →</span>
            </div>
          </div>
        )}
      </nav>

      <style>{`
        .hw-prevnext-nav {
          max-width: 1280px;
          margin: 0 auto;
          padding: 12px 24px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          border-top: 1px solid rgba(42,37,53,0.6);
          border-bottom: 1px solid rgba(42,37,53,0.4);
          background: var(--bg-primary, #0c0b14);
          position: relative;
          z-index: 10;
        }
        [data-theme="fog"] .hw-prevnext-nav {
          border-color: #ddd8ce;
          background: #ece9e2;
        }

        .hw-prevnext-link {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border: 1px solid rgba(60,50,80,0.8);
          background: rgba(7,7,16,0.5);
          text-decoration: none;
          transition: border-color 0.2s, background 0.2s;
          min-height: 72px;
          overflow: hidden;
          border-radius: 3px;
        }
        .hw-prevnext-link--next {
          flex-direction: row-reverse;
        }
        .hw-prevnext-link:not(.hw-prevnext-link--disabled):hover {
          border-color: rgba(139,0,0,0.55);
          background: rgba(20,12,28,0.85);
        }
        .hw-prevnext-link--disabled {
          opacity: 0.28;
          cursor: default;
          pointer-events: none;
        }
        [data-theme="fog"] .hw-prevnext-link {
          background: #f0ebe0;
          border-color: #cdc8bc;
        }
        [data-theme="fog"] .hw-prevnext-link:not(.hw-prevnext-link--disabled):hover {
          border-color: rgba(139,0,0,0.4);
          background: #e8e3d8;
        }
        [data-theme="ghost"] .hw-prevnext-link {
          background: rgba(26,26,30,0.7);
          border-color: rgba(255,255,255,0.08);
        }

        .hw-prevnext-thumb {
          position: relative;
          flex-shrink: 0;
          width: 40px;
          height: 71px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 3px;
        }
        [data-theme="fog"] .hw-prevnext-thumb { border-color: rgba(0,0,0,0.1); }

        .hw-prevnext-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
          flex: 1;
        }
        .hw-prevnext-text--right {
          align-items: flex-end;
          text-align: right;
        }
        .hw-prevnext-label {
          font-family: var(--font-space, monospace);
          font-size: 0.62rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(160,140,180,0.7);
          flex-shrink: 0;
          font-weight: 600;
        }
        [data-theme="fog"] .hw-prevnext-label { color: #8a8468; }
        .hw-prevnext-title {
          font-family: var(--font-cormorant, serif);
          font-style: italic;
          font-size: 0.88rem;
          color: var(--text-primary, #e8e4dc);
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @media (max-width: 479px) {
          .hw-prevnext-nav { gap: 8px; padding: 10px 14px; }
          .hw-prevnext-link { padding: 10px 10px; gap: 8px; min-height: 60px; }
          .hw-prevnext-thumb { width: 32px; height: 57px; }
          .hw-prevnext-title { font-size: 0.78rem; }
          .hw-prevnext-label { font-size: 0.55rem; }
        }
      `}</style>
    </>
  );
}