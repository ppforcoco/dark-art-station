'use client';

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

export interface LightboxImage {
  id:        string;
  src:       string;
  alt:       string;
  title:     string;
  href:      string;
  downloadId?: string; // image DB id for direct download
}

interface Props {
  images: LightboxImage[];
}

export default function LightboxGallery({ images }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isOpen = activeIndex !== null;

  const open  = (i: number) => { setActiveIndex(i); };
  const close = useCallback(() => setActiveIndex(null), []);

  // Navigate to individual image page: restore body scroll first, then hard-navigate
  // Using window.location.href instead of router.push to avoid Next.js scroll
  // restoration fighting with the fixed-body scroll-lock we apply in the lightbox.
  const navigateTo = useCallback((href: string) => {
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.top      = "";
    document.body.style.width    = "";
    document.body.style.left     = "";
    setActiveIndex(null);
    // Small tick lets React flush the state before we navigate
    setTimeout(() => { window.location.href = href; }, 10);
  }, []);
  const prev  = useCallback(() => {
    setActiveIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  }, [images.length]);
  const next  = useCallback(() => {
    setActiveIndex((i) => (i === null ? null : (i + 1) % images.length));
  }, [images.length]);

  // Preload current image + adjacent ones so navigation feels instant.
  // Uses <link rel="preload"> injected into <head> — browser fetches in
  // background at high priority, so by the time user swipes it's cached.
  useEffect(() => {
    if (activeIndex === null) return;
    const toPreload = [
      activeIndex,
      (activeIndex + 1) % images.length,
      (activeIndex - 1 + images.length) % images.length,
    ].filter((i, pos, arr) => arr.indexOf(i) === pos); // dedupe

    const links: HTMLLinkElement[] = [];
    toPreload.forEach((i) => {
      const src = images[i]?.src;
      if (!src) return;
      // Skip if already preloaded
      if (document.querySelector(`link[rel="preload"][href="${src}"]`)) return;
      const link = document.createElement("link");
      link.rel  = "preload";
      link.as   = "image";
      link.href = src;
      link.setAttribute("fetchpriority", "high");
      document.head.appendChild(link);
      links.push(link);
    });
    // Clean up preload links when lightbox closes to avoid memory bloat
    return () => {
      links.forEach((l) => { try { document.head.removeChild(l); } catch {} });
    };
  }, [activeIndex, images]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape")     close();
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    const scrollY = window.scrollY;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top      = `-${scrollY}px`;
    document.body.style.width    = "100%";
    document.body.style.left     = "0";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top      = "";
      document.body.style.width    = "";
      document.body.style.left     = "";
      window.scrollTo(0, scrollY);
    };
  }, [isOpen, close, prev, next]);

  const current = activeIndex !== null ? images[activeIndex] : null;

  // Preload on hover/touch — start fetching before user taps
  function preloadImage(src: string) {
    if (document.querySelector(`link[rel="preload"][href="${src}"]`)) return;
    const link = document.createElement("link");
    link.rel  = "preload";
    link.as   = "image";
    link.href = src;
    document.head.appendChild(link);
  }

  return (
    <>
      {/* Grid */}
      <div className="lb-grid">
        {images.map((img, i) => (
          <button
            key={img.id}
            className="lb-grid-item"
            onClick={() => open(i)}
            onMouseEnter={() => preloadImage(img.src)}
            onTouchStart={() => preloadImage(img.src)}
            aria-label={`View ${img.title} in lightbox`}
            type="button"
          >
            <div className="lb-grid-item-inner">
              <Image
                src={img.src}
                alt={img.alt}
                fill
                loading={i < 8 ? "eager" : "lazy"}
                priority={i < 8}
                unoptimized
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </div>
            <div className="lb-grid-hover">
              <div className="lb-grid-hover-text">
                <p>{img.title}</p>
                <span>Tap to expand ↗</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox overlay */}
      {isOpen && current && (
        <div
          className="lb-overlay"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={current.title}
          style={{ touchAction: "none", overscrollBehavior: "contain" }}
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX;
            touchStartY.current = e.touches[0].clientY;
          }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null || touchStartY.current === null) return;
            const dx = e.changedTouches[0].clientX - touchStartX.current;
            const dy = e.changedTouches[0].clientY - touchStartY.current;
            touchStartX.current = null;
            touchStartY.current = null;
            // Only trigger if horizontal swipe is dominant and long enough
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
              if (dx < 0) next();
              else prev();
            }
          }}
        >
          {/* Close */}
          <button className="lb-close" onClick={close} aria-label="Close lightbox" type="button">✕</button>

          {/* Counter */}
          {images.length > 1 && (
            <div className="lb-counter">
              {(activeIndex ?? 0) + 1} / {images.length}
            </div>
          )}

          {/* Prev */}
          {images.length > 1 && (
            <button
              className="lb-arrow lb-arrow-prev"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Previous image"
              type="button"
            >‹</button>
          )}

          {/* Image */}
          <div className="lb-img-wrap" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.src}
              alt={current.alt}
              key={current.id}
              loading="eager"
              decoding="async"
              // @ts-ignore — fetchpriority is valid HTML but TS types lag
              fetchpriority="high"
            />
          </div>

          {/* Next */}
          {images.length > 1 && (
            <button
              className="lb-arrow lb-arrow-next"
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Next image"
              type="button"
            >›</button>
          )}

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="lb-thumbs" onClick={(e) => e.stopPropagation()}>
              {images.map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={img.id}
                  src={img.src}
                  alt={img.alt}
                  className="lb-thumb"
                  loading="lazy"
                  decoding="async"
                  width={60}
                  height={107}
                  data-active={i === activeIndex ? "true" : "false"}
                  onMouseEnter={() => preloadImage(img.src)}
                  onTouchStart={() => preloadImage(img.src)}
                  onClick={() => { setActiveIndex(i); }}
                />
              ))}
            </div>
          )}

          {/* Caption + Download */}
          <div
            className="lb-caption"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="lb-caption-title">{current.title}</span>

            <div className="lb-caption-actions">
              {/* View the individual image page */}
              <button
                className="lb-caption-link"
                onClick={() => navigateTo(current.href)}
                aria-label={`View ${current.title} page`}
                type="button"
              >
                View Page ↗
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .lb-counter {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          font-family: var(--font-space), monospace;
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(240,236,255,0.5);
          z-index: 10;
          pointer-events: none;
        }
        .lb-caption {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 1210;
          background: linear-gradient(to top, rgba(5,5,10,0.98) 0%, rgba(5,5,10,0.85) 65%, transparent 100%);
          padding: 16px 20px calc(16px + env(safe-area-inset-bottom));
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        @media (max-width: 767px) {
          .lb-caption {
            padding: 14px 16px calc(14px + env(safe-area-inset-bottom));
          }
        }
        .lb-caption-title {
          font-family: var(--font-cormorant), serif;
          font-size: 1rem;
          font-style: italic;
          color: #f0ecff;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .lb-caption-actions {
          display: flex;
          gap: 10px;
          align-items: stretch;
        }
        /* THE DOWNLOAD BUTTON inside lightbox */
        .lb-download-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          padding: 0 16px;
          background: #8b0000;
          border: 1px solid #8b0000;
          color: #ffffff !important;
          font-family: var(--font-space), monospace;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          text-decoration: none !important;
          cursor: pointer;
          transition: background-color 0.2s ease;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          white-space: nowrap;
        }
        .lb-download-btn:hover { background: #a80000; }
        .lb-download-btn:active { background: #6b0000; }
        /* View page link */
        .lb-caption-link {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          padding: 0 16px;
          border: 1px solid rgba(240,236,255,0.2);
          color: #f0ecff !important;
          font-family: var(--font-space), monospace;
          font-size: 0.6rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          text-decoration: none !important;
          transition: border-color 0.2s ease;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .lb-caption-link:hover { border-color: rgba(240,236,255,0.5); }
        @media (max-width: 479px) {
          .lb-caption-actions { flex-direction: column; }
          .lb-caption-link { flex-shrink: unset; }
        }
      `}</style>
    </>
  );
}