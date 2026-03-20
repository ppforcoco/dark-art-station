'use client';

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

export interface LightboxImage {
  id:    string;
  src:   string;
  alt:   string;
  title: string;
  href:  string;
}

interface Props {
  images: LightboxImage[];
}

export default function LightboxGallery({ images }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const isOpen = activeIndex !== null;

  const open  = (i: number) => setActiveIndex(i);
  const close = useCallback(() => setActiveIndex(null), []);
  const prev  = useCallback(() =>
    setActiveIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length)),
  [images.length]);
  const next  = useCallback(() =>
    setActiveIndex((i) => (i === null ? null : (i + 1) % images.length)),
  [images.length]);

  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape")     close();
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);

    /*
      iOS SAFARI SCROLL LOCK FIX:
      Safari ignores document.body.style.overflow = "hidden" — the page
      still scrolls behind the lightbox overlay.

      The correct fix:
        1. Record the current scroll position.
        2. Fix the body at that position using position:fixed + top offset.
           This prevents iOS from scrolling the body at all.
        3. On close, restore position:static and scroll back to the saved Y.

      This is the industry-standard pattern for iOS modal scroll locking.
    */
    const scrollY = window.scrollY;
    document.body.style.overflow   = "hidden";
    document.body.style.position   = "fixed";
    document.body.style.top        = `-${scrollY}px`;
    document.body.style.width      = "100%";
    document.body.style.left       = "0";

    return () => {
      window.removeEventListener("keydown", onKey);
      // Restore body and scroll back to where the user was
      document.body.style.overflow  = "";
      document.body.style.position  = "";
      document.body.style.top       = "";
      document.body.style.width     = "";
      document.body.style.left      = "";
      window.scrollTo(0, scrollY);
    };
  }, [isOpen, close, prev, next]);

  const current = activeIndex !== null ? images[activeIndex] : null;

  return (
    <>
      <div className="lb-grid">
        {images.map((img, i) => (
          <button
            key={img.id}
            className="lb-grid-item"
            onClick={() => open(i)}
            aria-label={`View ${img.title} in lightbox`}
            type="button"
          >
            <div className="lb-grid-item-inner">
              <Image
                src={img.src}
                alt={img.alt}
                fill
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

      {isOpen && current && (
        <div
          className="lb-overlay"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={current.title}
          style={{
            // iOS Safari: touch-action:none stops the overlay from
            // passing touch events through to the page behind it.
            // overscroll-behavior:contain stops scroll chaining.
            touchAction: "none",
            overscrollBehavior: "contain",
          }}
        >
          <button className="lb-close" onClick={close} aria-label="Close lightbox" type="button">
            ✕
          </button>

          {images.length > 1 && (
            <button
              className="lb-arrow lb-arrow-prev"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Previous image"
              type="button"
            >‹</button>
          )}

          <div className="lb-img-wrap" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={current.src} alt={current.alt} key={current.id} />
          </div>

          {images.length > 1 && (
            <button
              className="lb-arrow lb-arrow-next"
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Next image"
              type="button"
            >›</button>
          )}

          {images.length > 1 && (
            <div className="lb-thumbs" onClick={(e) => e.stopPropagation()}>
              {images.map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={img.id}
                  src={img.src}
                  alt={img.alt}
                  className="lb-thumb"
                  data-active={i === activeIndex ? "true" : "false"}
                  onClick={() => setActiveIndex(i)}
                />
              ))}
            </div>
          )}

          {/* FIX: caption now stacks on mobile so button is never pushed off screen */}
          <div
            className="lb-caption"
            onClick={(e) => e.stopPropagation()}
            style={{
              flexDirection: "column",
              alignItems: "stretch",
              gap: "8px",
              padding: "12px 16px calc(12px + env(safe-area-inset-bottom))",
            }}
          >
            <span
              className="lb-caption-title"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {current.title}
            </span>
            <Link
              href={current.href}
              className="lb-caption-link"
              onClick={close}
              style={{
                display: "block",
                textAlign: "center",
                width: "100%",
                padding: "10px 16px",
              }}
            >
              View &amp; Download →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}