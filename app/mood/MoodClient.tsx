"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import type { MoodId, MoodImage } from "./page";
import { MOODS } from "./page";

interface Props {
  moods:        typeof MOODS;
  imagesByMood: Record<MoodId, MoodImage[]>;
}

export default function MoodClient({ moods, imagesByMood }: Props) {
  const [active, setActive]     = useState<MoodId>("paranoid");
  const [visible, setVisible]   = useState(12);
  const [animKey, setAnimKey]   = useState(0);
  const gridRef                 = useRef<HTMLDivElement>(null);

  const activeMood   = moods.find((m) => m.id === active)!;
  const allImages    = imagesByMood[active] ?? [];
  const shownImages  = allImages.slice(0, visible);
  const hasMore      = allImages.length > visible;

  const switchMood = (id: MoodId) => {
    if (id === active) return;
    setActive(id);
    setVisible(12);
    setAnimKey((k) => k + 1);
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Animate cards in when mood changes
  useEffect(() => {
    const cards = gridRef.current?.querySelectorAll<HTMLElement>(".mood-card");
    if (!cards) return;
    cards.forEach((card, i) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(20px)";
      setTimeout(() => {
        card.style.transition = "opacity 0.4s ease, transform 0.4s ease";
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      }, i * 40);
    });
  }, [animKey]);

  const devicePath = (img: MoodImage) => {
    const d = img.deviceType?.toLowerCase();
    if (d === "iphone") return `/iphone/${img.slug}`;
    if (d === "android") return `/android/${img.slug}`;
    if (d === "pc") return `/pc/${img.slug}`;
    return `/iphone/${img.slug}`;
  };

  return (
    <>
      <style>{`
        .mood-page {
          min-height: 100vh;
          background: var(--bg-primary, #07050e);
          color: var(--text-primary, #e8e4f5);
        }

        /* ── Hero ── */
        .mood-hero {
          text-align: center;
          padding: clamp(48px, 8vw, 96px) 24px clamp(32px, 5vw, 56px);
          background: var(--mood-gradient);
          transition: background 0.6s ease;
          position: relative;
          overflow: hidden;
        }
        .mood-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(255,255,255,0.012) 2px,
            rgba(255,255,255,0.012) 4px
          );
          pointer-events: none;
        }
        .mood-hero-eyebrow {
          font-family: var(--font-space), monospace;
          font-size: 0.6rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--mood-color);
          margin-bottom: 14px;
          opacity: 0.8;
        }
        .mood-hero-glyph {
          font-size: clamp(2.5rem, 6vw, 4rem);
          display: block;
          margin-bottom: 12px;
          filter: drop-shadow(0 0 20px var(--mood-color));
          transition: filter 0.5s ease;
        }
        .mood-hero-title {
          font-family: var(--font-cinzel), serif;
          font-size: clamp(2.2rem, 7vw, 5rem);
          font-weight: 900;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #f0ecff;
          margin-bottom: 14px;
          line-height: 1;
          text-shadow: 0 0 40px var(--mood-color);
          transition: text-shadow 0.5s ease;
        }
        .mood-hero-title em {
          color: var(--mood-color);
          font-style: normal;
          transition: color 0.4s ease;
        }
        .mood-hero-desc {
          font-family: var(--font-cormorant), serif;
          font-size: clamp(1.1rem, 2.5vw, 1.5rem);
          color: #9b95b0;
          max-width: 480px;
          margin: 0 auto;
          font-style: italic;
          line-height: 1.6;
        }
        .mood-count {
          margin-top: 16px;
          font-family: var(--font-space), monospace;
          font-size: 0.58rem;
          letter-spacing: 0.2em;
          color: var(--mood-color);
          opacity: 0.7;
        }

        /* ── Selector strip ── */
        .mood-selector {
          display: flex;
          justify-content: center;
          gap: 8px;
          flex-wrap: wrap;
          padding: 28px 24px 0;
          position: sticky;
          top: 60px;
          z-index: 40;
          background: var(--bg-primary, #07050e);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding-bottom: 20px;
        }
        .mood-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.02);
          color: #7a748a;
          font-family: var(--font-space), monospace;
          font-size: 0.65rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.25s ease;
          border-radius: 3px;
          position: relative;
          overflow: hidden;
        }
        .mood-btn::before {
          content: "";
          position: absolute;
          inset: 0;
          background: var(--btn-color);
          opacity: 0;
          transition: opacity 0.25s;
        }
        .mood-btn:hover::before { opacity: 0.08; }
        .mood-btn:hover {
          color: #d0cce0;
          border-color: var(--btn-color);
        }
        .mood-btn--active {
          border-color: var(--btn-color) !important;
          color: #f0ecff !important;
          background: rgba(255,255,255,0.04) !important;
          box-shadow: 0 0 16px rgba(0,0,0,0.4), inset 0 0 0 1px var(--btn-color);
        }
        .mood-btn--active::before { opacity: 0.12 !important; }
        .mood-btn-glyph { font-size: 1rem; line-height: 1; }
        .mood-btn-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: var(--btn-color);
          flex-shrink: 0;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .mood-btn--active .mood-btn-dot { opacity: 1; }

        /* ── Grid ── */
        .mood-grid-section {
          max-width: 1400px;
          margin: 0 auto;
          padding: 36px 24px 60px;
        }
        .mood-grid-header {
          display: flex;
          align-items: baseline;
          gap: 12px;
          margin-bottom: 24px;
        }
        .mood-grid-heading {
          font-family: var(--font-space), monospace;
          font-size: 0.6rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--mood-color);
        }
        .mood-grid-count {
          font-size: 0.55rem;
          font-family: var(--font-space), monospace;
          color: #4a445a;
          letter-spacing: 0.15em;
        }

        .mood-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 10px;
        }
        @media (min-width: 640px)  { .mood-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); } }
        @media (min-width: 1024px) { .mood-grid { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; } }

        .mood-card {
          position: relative;
          aspect-ratio: 9/16;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.06);
          cursor: pointer;
          display: block;
          text-decoration: none;
          background: #0e0b18;
          border-radius: 4px;
        }
        .mood-card:hover { border-color: var(--mood-color); }
        .mood-card:hover .mood-card-overlay { opacity: 1; }
        .mood-card:hover .mood-card-title { transform: translateY(0); opacity: 1; }
        .mood-card:hover img { transform: scale(1.05); }

        .mood-card img {
          transition: transform 0.4s ease;
          object-fit: cover;
        }
        .mood-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 55%);
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 2;
        }
        .mood-card-title {
          position: absolute;
          bottom: 10px;
          left: 10px;
          right: 10px;
          z-index: 3;
          font-family: var(--font-cormorant), serif;
          font-size: 0.82rem;
          color: #e8e4f5;
          line-height: 1.3;
          transform: translateY(6px);
          opacity: 0;
          transition: transform 0.3s ease, opacity 0.3s ease;
          text-shadow: 0 1px 6px rgba(0,0,0,0.9);
        }
        .mood-card-device {
          position: absolute;
          top: 8px;
          right: 8px;
          z-index: 3;
          font-family: var(--font-space), monospace;
          font-size: 0.48rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--mood-color);
          background: rgba(0,0,0,0.7);
          padding: 2px 6px;
          border-radius: 2px;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .mood-card:hover .mood-card-device { opacity: 1; }

        /* ── Empty state ── */
        .mood-empty {
          text-align: center;
          padding: 80px 24px;
          grid-column: 1/-1;
        }
        .mood-empty-glyph { font-size: 3rem; margin-bottom: 16px; opacity: 0.4; }
        .mood-empty-title {
          font-family: var(--font-cinzel), serif;
          font-size: 1.2rem;
          color: #4a445a;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .mood-empty-desc {
          font-family: var(--font-space), monospace;
          font-size: 0.62rem;
          color: #3a3450;
          letter-spacing: 0.12em;
        }
        .mood-empty-tags {
          margin-top: 20px;
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          justify-content: center;
        }
        .mood-empty-tag {
          font-family: var(--font-space), monospace;
          font-size: 0.55rem;
          padding: 3px 10px;
          border: 1px solid #2a2535;
          color: #4a445a;
          letter-spacing: 0.1em;
          border-radius: 2px;
        }

        /* ── Load more ── */
        .mood-load-more {
          display: block;
          margin: 36px auto 0;
          padding: 14px 40px;
          border: 1px solid rgba(255,255,255,0.12);
          background: transparent;
          color: #8a8099;
          font-family: var(--font-space), monospace;
          font-size: 0.62rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 3px;
        }
        .mood-load-more:hover {
          border-color: var(--mood-color);
          color: #d0cce0;
          background: rgba(255,255,255,0.03);
        }

        /* ── Tags hint ── */
        .mood-tags-hint {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px 48px;
        }
        .mood-tags-hint-title {
          font-family: var(--font-space), monospace;
          font-size: 0.55rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #3a3450;
          margin-bottom: 10px;
        }
        .mood-tag-pill {
          display: inline-block;
          font-family: var(--font-space), monospace;
          font-size: 0.55rem;
          padding: 3px 10px;
          border: 1px solid #2a2535;
          color: #4a445a;
          letter-spacing: 0.1em;
          margin: 3px;
          border-radius: 2px;
        }
      `}</style>

      <div
        className="mood-page"
        style={{
          ["--mood-color" as string]: activeMood.color,
          ["--mood-gradient" as string]: activeMood.gradient,
        }}
      >
        {/* ── Hero ── */}
        <div className="mood-hero">
          <p className="mood-hero-eyebrow">Find Your Vibe</p>
          <span className="mood-hero-glyph">{activeMood.glyph}</span>
          <h1 className="mood-hero-title">
            I Feel <em>{activeMood.label}</em>
          </h1>
          <p className="mood-hero-desc">{activeMood.desc}</p>
          <p className="mood-count">
            {allImages.length > 0
              ? `${allImages.length} wallpaper${allImages.length !== 1 ? "s" : ""} match this mood`
              : "No wallpapers yet — add tags in the admin panel"}
          </p>
        </div>

        {/* ── Mood selector ── */}
        <div className="mood-selector">
          {moods.map((mood) => (
            <button
              key={mood.id}
              className={`mood-btn${active === mood.id ? " mood-btn--active" : ""}`}
              style={{ ["--btn-color" as string]: mood.color }}
              onClick={() => switchMood(mood.id)}
            >
              <span className="mood-btn-glyph">{mood.glyph}</span>
              {mood.label}
              <span className="mood-btn-dot" />
            </button>
          ))}
        </div>

        {/* ── Grid ── */}
        <section className="mood-grid-section" ref={gridRef}>
          <div className="mood-grid-header">
            <span className="mood-grid-heading">
              {activeMood.glyph} {activeMood.label} Wallpapers
            </span>
            {allImages.length > 0 && (
              <span className="mood-grid-count">
                — {allImages.length} found
              </span>
            )}
          </div>

          <div className="mood-grid" key={animKey}>
            {shownImages.length > 0 ? (
              shownImages.map((img) => (
                <Link
                  key={img.id}
                  href={devicePath(img)}
                  className="mood-card"
                >
                  <Image
                    src={img.url}
                    alt={img.title}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
                    style={{ objectFit: "cover" }}
                  />
                  <div className="mood-card-overlay" />
                  <span className="mood-card-device">
                    {img.deviceType ?? ""}
                  </span>
                  <span className="mood-card-title">{img.title}</span>
                </Link>
              ))
            ) : (
              <div className="mood-empty">
                <div className="mood-empty-glyph">{activeMood.glyph}</div>
                <p className="mood-empty-title">No wallpapers tagged yet</p>
                <p className="mood-empty-desc">
                  Add these tags to your images in the admin panel
                </p>
                <div className="mood-empty-tags">
                  {activeMood.tags.map((t) => (
                    <span key={t} className="mood-empty-tag">{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {hasMore && (
            <button
              className="mood-load-more"
              onClick={() => setVisible((v) => v + 12)}
            >
              Show more {activeMood.label.toLowerCase()} wallpapers
            </button>
          )}
        </section>

        {/* ── Tag hint for admin ── */}
        <div className="mood-tags-hint">
          <p className="mood-tags-hint-title">
            Tags that trigger &quot;{activeMood.label}&quot; mood:
          </p>
          {activeMood.tags.map((t) => (
            <span key={t} className="mood-tag-pill">{t}</span>
          ))}
        </div>
      </div>
    </>
  );
}