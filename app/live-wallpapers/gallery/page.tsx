"use client";
// app/live-wallpapers/gallery/page.tsx
import React, { useEffect, useState } from "react";

interface WallpaperItem {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  hasSound: boolean;
  tags: string[];
  viewCount: number;
  createdAt: string;
}

const faqs = [
  {
    q: "What are live wallpapers?",
    a: "Live wallpapers are animated wallpapers that use motion instead of a static image.",
  },
  {
    q: "Are these live wallpapers free?",
    a: "Many live wallpapers are available as free downloads.",
  },
  {
    q: "Do live wallpapers work on iPhone?",
    a: "Yes. Some iPhone devices require converting the MP4 into a Live Photo before applying it.",
  },
  {
    q: "Do live wallpapers work on Android?",
    a: "Yes. Most Android devices support video-based live wallpapers.",
  },
  {
    q: "How often are new live wallpapers added?",
    a: "New residents arrive in Haunted Town regularly.",
  },
];

const iphoneSteps = [
  "Download the MP4.",
  "Save it to Photos.",
  "Convert it into a Live Photo using a Live Photo app.",
  "Open Photos.",
  "Tap Share.",
  "Choose Use as Wallpaper.",
  "Enable Live Photo.",
  "Set it on your Lock Screen.",
];

const androidSteps = [
  "Download the MP4.",
  "Open Wallpaper Settings or a Live Wallpaper app.",
  "Select the downloaded video.",
  "Preview the animation.",
  "Tap Set Wallpaper.",
  "Apply it to your Home Screen or Lock Screen.",
];

export default function LiveWallpapersGalleryPage() {
  const [items, setItems] = useState<WallpaperItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [flicker, setFlicker] = useState(false);

  useEffect(() => {
    loadMore(null);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setFlicker(true);
      setTimeout(() => setFlicker(false), 180);
    }, 4200);
    return () => clearInterval(id);
  }, []);

  async function loadMore(cur: string | null) {
    if (loading) return;
    setLoading(true);
    try {
      const url = cur
        ? `/api/live-wallpapers?cursor=${encodeURIComponent(cur)}`
        : "/api/live-wallpapers";
      const res = await fetch(url);
      const json = await res.json();
      setItems((prev) => [...prev, ...json.data]);
      setCursor(json.nextCursor);
    } catch {}
    setLoading(false);
  }

  return (
    <div className="lw-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Special+Elite&family=JetBrains+Mono:wght@400;500;700&display=swap');

        :root {
          --bg: #0d0b14;
          --panel: #16121f;
          --accent: #c0001a;
          --text: #e8e4f8;
          --text-dim: #8a809a;
          --line: #2c2536;
        }

        * { box-sizing: border-box; }

        .lw-page {
          background: var(--bg);
          color: var(--text);
          font-family: 'JetBrains Mono', monospace;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .lw-page a { color: inherit; }

        /* ---------- HERO ---------- */
        .lw-hero {
          position: relative;
          padding: 96px 20px 64px;
          text-align: center;
          background:
            radial-gradient(ellipse at 50% 0%, rgba(192,0,26,0.10), transparent 60%),
            repeating-linear-gradient(
              180deg,
              rgba(255,255,255,0.012) 0px,
              rgba(255,255,255,0.012) 1px,
              transparent 1px,
              transparent 3px
            );
          border-bottom: 1px solid var(--line);
          overflow: hidden;
        }

        .lw-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 0.7rem;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--text-dim);
          margin-bottom: 28px;
        }

        .lw-eyebrow::before,
        .lw-eyebrow::after {
          content: "";
          display: block;
          width: 28px;
          height: 1px;
          background: var(--line);
        }

        .lw-title {
          font-family: 'Special Elite', monospace;
          font-size: clamp(2.4rem, 8vw, 4.6rem);
          line-height: 1.08;
          margin: 0 0 10px;
          letter-spacing: 0.01em;
          text-shadow: 0 0 18px rgba(192,0,26,0.25);
        }

        .lw-sign {
          display: inline-block;
          margin-top: 6px;
          padding: 6px 18px;
          border: 2px solid var(--accent);
          border-radius: 4px;
          font-family: 'Special Elite', monospace;
          font-size: 0.85rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--accent);
          text-shadow: 0 0 8px rgba(192,0,26,0.7);
          box-shadow: 0 0 14px rgba(192,0,26,0.25), inset 0 0 10px rgba(192,0,26,0.15);
          transition: opacity 0.05s linear;
        }

        .lw-sign.flicker {
          opacity: 0.25;
        }

        .lw-desc {
          max-width: 620px;
          margin: 28px auto 0;
          font-size: 0.85rem;
          line-height: 1.85;
          color: var(--text-dim);
        }

        /* ---------- GRID ---------- */
        .lw-grid-section {
          padding: 64px 20px 80px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .lw-section-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 28px;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--line);
        }

        .lw-section-title {
          font-family: 'Special Elite', monospace;
          font-size: 1.4rem;
          margin: 0;
        }

        .lw-section-note {
          font-size: 0.65rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-dim);
          white-space: nowrap;
        }

        .lw-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }

        @media (min-width: 640px) {
          .lw-grid { grid-template-columns: repeat(3, 1fr); gap: 18px; }
        }
        @media (min-width: 980px) {
          .lw-grid { grid-template-columns: repeat(4, 1fr); gap: 20px; }
        }
        @media (min-width: 1280px) {
          .lw-grid { grid-template-columns: repeat(5, 1fr); }
        }

        .lw-card {
          display: block;
          position: relative;
          border-radius: 6px;
          overflow: hidden;
          border: 1px solid var(--line);
          background: var(--panel);
          aspect-ratio: 9 / 16;
          text-decoration: none;
          transform: rotate(0deg);
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }

        .lw-card:nth-child(odd):hover { transform: rotate(-1.4deg) translateY(-3px); }
        .lw-card:nth-child(even):hover { transform: rotate(1.2deg) translateY(-3px); }

        .lw-card:hover {
          border-color: var(--accent);
          box-shadow: 0 8px 24px rgba(192,0,26,0.18);
        }

        .lw-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          filter: saturate(0.85) contrast(1.05);
        }

        .lw-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(13,11,20,0.95) 0%, rgba(13,11,20,0.1) 55%, transparent 100%);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 10px;
        }

        .lw-card-title {
          font-size: 0.66rem;
          font-weight: 700;
          line-height: 1.3;
          margin: 0;
          color: var(--text);
        }

        .lw-card-tag {
          font-size: 0.52rem;
          letter-spacing: 0.1em;
          color: var(--text-dim);
          margin-top: 4px;
        }

        .lw-card-sound {
          position: absolute;
          top: 8px;
          right: 8px;
          font-size: 0.6rem;
          background: rgba(13,11,20,0.7);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 50%;
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lw-empty, .lw-loading {
          text-align: center;
          padding: 60px 20px;
          color: var(--text-dim);
          font-size: 0.8rem;
          letter-spacing: 0.08em;
        }

        .lw-load-more-wrap {
          display: flex;
          justify-content: center;
          margin-top: 36px;
        }

        .lw-load-more {
          background: transparent;
          border: 1px solid var(--line);
          color: var(--text);
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 12px 28px;
          border-radius: 4px;
          cursor: pointer;
          transition: border-color 0.2s ease, color 0.2s ease;
        }

        .lw-load-more:hover {
          border-color: var(--accent);
          color: var(--accent);
        }

        .lw-load-more:disabled {
          opacity: 0.5;
          cursor: default;
        }

        /* ---------- HOW TO ---------- */
        .lw-howto {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 20px 80px;
        }

        .lw-howto-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }

        @media (min-width: 760px) {
          .lw-howto-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
        }

        .lw-howto-card {
          border: 1px solid var(--line);
          border-radius: 6px;
          padding: 26px 24px;
          background: var(--panel);
        }

        .lw-howto-title {
          font-family: 'Special Elite', monospace;
          font-size: 1.1rem;
          margin: 0 0 18px;
          color: var(--accent);
        }

        .lw-howto-list {
          margin: 0;
          padding: 0;
          list-style: none;
          counter-reset: step;
        }

        .lw-howto-list li {
          counter-increment: step;
          display: grid;
          grid-template-columns: 24px 1fr;
          gap: 12px;
          font-size: 0.78rem;
          line-height: 1.6;
          color: var(--text-dim);
          padding: 7px 0;
          border-bottom: 1px solid var(--line);
        }

        .lw-howto-list li:last-child { border-bottom: none; }

        .lw-howto-list li::before {
          content: counter(step);
          color: var(--accent);
          font-family: 'Special Elite', monospace;
          font-size: 0.8rem;
        }

        /* ---------- FAQ ---------- */
        .lw-faq {
          max-width: 760px;
          margin: 0 auto;
          padding: 0 20px 80px;
        }

        .lw-faq-item {
          border-bottom: 1px solid var(--line);
          padding: 22px 0;
        }

        .lw-faq-q {
          font-family: 'Special Elite', monospace;
          font-size: 0.95rem;
          margin: 0 0 8px;
          color: var(--text);
        }

        .lw-faq-a {
          font-size: 0.8rem;
          line-height: 1.7;
          color: var(--text-dim);
          margin: 0;
        }

        /* ---------- FOOTER ---------- */
        .lw-footer {
          text-align: center;
          padding: 56px 20px 80px;
          border-top: 1px solid var(--line);
          position: relative;
        }

        .lw-footer::before {
          content: "";
          position: absolute;
          top: -1px;
          left: 50%;
          transform: translateX(-50%);
          width: 160px;
          height: 1px;
          background: radial-gradient(ellipse, var(--accent), transparent 70%);
          filter: blur(1px);
        }

        .lw-footer-text {
          font-family: 'Special Elite', monospace;
          font-size: 1rem;
          color: var(--text-dim);
          letter-spacing: 0.04em;
          margin: 0;
        }

        .lw-footer-text span {
          color: var(--accent);
          text-shadow: 0 0 10px rgba(192,0,26,0.5);
        }

        @media (prefers-reduced-motion: reduce) {
          .lw-sign.flicker { opacity: 1; }
          .lw-card { transition: none; }
        }
      `}</style>

      {/* ---------- HERO ---------- */}
      <section className="lw-hero">
        <div className="lw-eyebrow">Made for horror fans by horror fans</div>
        <h1 className="lw-title">Live Wallpapers From Haunted Town</h1>
        <span className={`lw-sign ${flicker ? "flicker" : ""}`}>
          {flicker ? "open... ish" : "town is open"}
        </span>
        <p className="lw-desc">
          Not every resident of Haunted Town stands still. Some wander. Some
          perform. Some refuse to leave. Welcome to a growing collection of
          animated live wallpapers inspired by the strange streets, forgotten
          corners, and unusual residents of Haunted Town. Here you&apos;ll
          find moving skeletons, gothic characters, rebellious mascots,
          mysterious creatures, dark legends, and countless personalities
          waiting to find a place on your screen. Choose a live wallpaper
          below and start exploring the town one resident at a time.
        </p>
      </section>

      {/* ---------- GRID ---------- */}
      <section className="lw-grid-section">
        <div className="lw-section-head">
          <h2 className="lw-section-title">Residents of Haunted Town</h2>
          <span className="lw-section-note">
            {items.length > 0 ? `${items.length} found so far` : "Looking around\u2026"}
          </span>
        </div>

        {items.length === 0 && loading && (
          <div className="lw-loading">Walking the streets…</div>
        )}

        {items.length === 0 && !loading && (
          <div className="lw-empty">
            No live wallpapers yet. Check back soon — new residents arrive
            regularly.
          </div>
        )}

        {items.length > 0 && (
          <div className="lw-grid">
            {items.map((item) => (
              <a
                key={item.id}
                href={`/live-wallpapers/${item.slug}`}
                className="lw-card"
              >
                {item.thumbnailUrl && (
                  <img src={item.thumbnailUrl} alt={item.title} loading="lazy" />
                )}
                {item.hasSound && <span className="lw-card-sound">🔊</span>}
                <div className="lw-card-overlay">
                  <p className="lw-card-title">{item.title}</p>
                  {item.tags.length > 0 && (
                    <span className="lw-card-tag">#{item.tags[0]}</span>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}

        {cursor && (
          <div className="lw-load-more-wrap">
            <button
              className="lw-load-more"
              onClick={() => loadMore(cursor)}
              disabled={loading}
            >
              {loading ? "Loading…" : "Show more residents"}
            </button>
          </div>
        )}
      </section>

      {/* ---------- HOW TO ---------- */}
      <section className="lw-howto">
        <div className="lw-section-head">
          <h2 className="lw-section-title">Setting up a live wallpaper</h2>
          <span className="lw-section-note">Posted at the town notice board</span>
        </div>
        <div className="lw-howto-grid">
          <div className="lw-howto-card">
            <h3 className="lw-howto-title">On iPhone</h3>
            <ol className="lw-howto-list">
              {iphoneSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
          <div className="lw-howto-card">
            <h3 className="lw-howto-title">On Android</h3>
            <ol className="lw-howto-list">
              {androidSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="lw-faq">
        <div className="lw-section-head">
          <h2 className="lw-section-title">Questions from new arrivals</h2>
        </div>
        {faqs.map((item) => (
          <div className="lw-faq-item" key={item.q}>
            <h3 className="lw-faq-q">{item.q}</h3>
            <p className="lw-faq-a">{item.a}</p>
          </div>
        ))}
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer className="lw-footer">
        <p className="lw-footer-text">
          Haunted Town <span>never stops growing</span>.
        </p>
      </footer>
    </div>
  );
}