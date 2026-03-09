'use client';

// LightboxGallery.tsx
// Full-screen image lightbox for collection gallery pages.
// Renders a 4-column grid (2 on mobile). Clicking any image opens the lightbox.
// Keyboard: Escape = close, ArrowLeft/Right = prev/next.
// No external dependencies — pure React + CSS (classes in globals.css).

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

export interface LightboxImage {
  id:    string;
  src:   string;
  alt:   string;
  title: string;
  href:  string;   // deep-link to individual image page
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

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape")      close();
      if (e.key === "ArrowLeft")   prev();
      if (e.key === "ArrowRight")  next();
    };
    window.addEventListener("keydown", onKey);
    // Prevent body scroll while open
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close, prev, next]);

  const current = activeIndex !== null ? images[activeIndex] : null;

  return (
    <>
      {/* ── Gallery Grid ── */}
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

      {/* ── Lightbox Overlay ── */}
      {isOpen && current && (
        <div
          className="lb-overlay"
          onClick={close}           // click backdrop to close
          role="dialog"
          aria-modal="true"
          aria-label={current.title}
        >
          {/* Close */}
          <button
            className="lb-close"
            onClick={close}
            aria-label="Close lightbox"
            type="button"
          >
            ✕
          </button>

          {/* Prev arrow */}
          {images.length > 1 && (
            <button
              className="lb-arrow lb-arrow-prev"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Previous image"
              type="button"
            >
              ‹
            </button>
          )}

          {/* Main image — stopPropagation prevents backdrop-close when clicking image */}
          <div className="lb-img-wrap" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.src}
              alt={current.alt}
              key={current.id}   // forces re-mount + re-animation on image change
            />
          </div>

          {/* Next arrow */}
          {images.length > 1 && (
            <button
              className="lb-arrow lb-arrow-next"
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Next image"
              type="button"
            >
              ›
            </button>
          )}

          {/* Thumbnail strip */}
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

          {/* Caption bar */}
          <div className="lb-caption" onClick={(e) => e.stopPropagation()}>
            <span className="lb-caption-title">{current.title}</span>
            <Link
              href={current.href}
              className="lb-caption-link"
              onClick={close}
            >
              View & Download →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}