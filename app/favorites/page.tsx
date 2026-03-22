"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getFavorites, toggleFavorite, type FavoriteItem } from "@/components/FavoriteButton";

export default function FavoritesPage() {
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setItems(getFavorites());
    setLoaded(true);

    function onChange(e: Event) {
      setItems((e as CustomEvent<FavoriteItem[]>).detail);
    }
    window.addEventListener("hw-favorites-change", onChange);
    return () => window.removeEventListener("hw-favorites-change", onChange);
  }, []);

  function handleRemove(item: FavoriteItem) {
    toggleFavorite(item); // dispatches change event, updates items via listener
  }

  function handleClearAll() {
    if (!confirm("Remove all saved wallpapers?")) return;
    try { localStorage.removeItem("hw-favorites"); } catch {}
    window.dispatchEvent(new CustomEvent("hw-favorites-change", { detail: [] }));
  }

  // Group by device type for nicer display
  const portrait  = items.filter(i => i.device !== "pc");
  const landscape = items.filter(i => i.device === "pc");

  return (
    <main className="fav-page">

      {/* Header */}
      <div className="fav-header">
        <span className="fav-eyebrow">Your Collection</span>
        <h1 className="fav-title">Saved<br /><em>Wallpapers</em></h1>
        {loaded && items.length > 0 && (
          <p className="fav-count">{items.length} wallpaper{items.length !== 1 ? "s" : ""} saved</p>
        )}
      </div>

      {!loaded ? null : items.length === 0 ? (

        /* Empty state */
        <div className="fav-empty">
          <span className="fav-empty-icon">🖤</span>
          <h2 className="fav-empty-title">No saved wallpapers yet</h2>
          <p className="fav-empty-sub">
            Tap the ♡ heart on any wallpaper to save it here. No account needed — your saves stay private on this device.
          </p>
          <div className="fav-empty-links">
            <Link href="/iphone" className="fav-empty-btn">Browse iPhone</Link>
            <Link href="/android" className="fav-empty-btn">Browse Android</Link>
            <Link href="/shop" className="fav-empty-btn">Browse Collections</Link>
          </div>
        </div>

      ) : (
        <>
          {/* Actions bar */}
          <div className="fav-actions-bar">
            <p className="fav-actions-note">
              Saves are stored on this device only. Clearing your browser data will remove them.
            </p>
            <button className="fav-clear-btn" onClick={handleClearAll}>Clear All</button>
          </div>

          {/* Portrait wallpapers (iPhone / Android / collections) */}
          {portrait.length > 0 && (
            <section className="fav-section">
              {landscape.length > 0 && (
                <h2 className="fav-section-heading">📱 Phone Wallpapers</h2>
              )}
              <div className="fav-grid fav-grid--portrait">
                {portrait.map(item => (
                  <div key={item.slug} className="fav-card">
                    <Link href={item.href} className="fav-card-img-wrap">
                      <Image
                        src={item.thumb}
                        alt={item.title}
                        fill
                        className="object-cover fav-card-img"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                      />
                      <div className="fav-card-overlay">
                        <span className="fav-card-view">View &amp; Download →</span>
                      </div>
                    </Link>
                    <div className="fav-card-info">
                      <span className="fav-card-title">{item.title}</span>
                      <div className="fav-card-row">
                        <Link href={item.href} className="fav-card-cta">↓ Download</Link>
                        <button
                          className="fav-remove-btn"
                          onClick={() => handleRemove(item)}
                          aria-label="Remove from favorites"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Landscape wallpapers (PC) */}
          {landscape.length > 0 && (
            <section className="fav-section">
              <h2 className="fav-section-heading">🖥 Desktop Wallpapers</h2>
              <div className="fav-grid fav-grid--landscape">
                {landscape.map(item => (
                  <div key={item.slug} className="fav-card">
                    <Link href={item.href} className="fav-card-img-wrap">
                      <Image
                        src={item.thumb}
                        alt={item.title}
                        fill
                        className="object-cover fav-card-img"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="fav-card-overlay">
                        <span className="fav-card-view">View &amp; Download →</span>
                      </div>
                    </Link>
                    <div className="fav-card-info">
                      <span className="fav-card-title">{item.title}</span>
                      <div className="fav-card-row">
                        <Link href={item.href} className="fav-card-cta">↓ Download</Link>
                        <button
                          className="fav-remove-btn"
                          onClick={() => handleRemove(item)}
                          aria-label="Remove from favorites"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <style>{`
        .fav-page {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px 80px;
          min-height: 70vh;
        }

        /* ── Header ── */
        .fav-header {
          padding: 60px 0 40px;
          border-bottom: 1px solid rgba(192,0,26,0.2);
          margin-bottom: 32px;
        }
        .fav-eyebrow {
          font-family: var(--font-space), monospace;
          font-size: 0.6rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #c0001a;
          display: block;
          margin-bottom: 12px;
        }
        .fav-title {
          font-family: var(--font-cinzel), cursive;
          font-size: clamp(2rem, 5vw, 3.2rem);
          font-weight: 900;
          color: #f0ecff;
          line-height: 1.1;
          margin-bottom: 12px;
        }
        .fav-title em { color: #c9a84c; font-style: italic; }
        [data-theme="light"] .fav-title { color: #1a1814; }
        .fav-count {
          font-family: var(--font-space), monospace;
          font-size: 0.62rem;
          letter-spacing: 0.12em;
          color: #4a445a;
          text-transform: uppercase;
          margin: 0;
        }

        /* ── Empty ── */
        .fav-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 80px 24px;
          text-align: center;
        }
        .fav-empty-icon { font-size: 3rem; }
        .fav-empty-title {
          font-family: var(--font-cinzel), cursive;
          font-size: 1.3rem;
          font-weight: 700;
          color: #f0ecff;
          margin: 0;
        }
        [data-theme="light"] .fav-empty-title { color: #1a1814; }
        .fav-empty-sub {
          font-family: var(--font-cormorant), serif;
          font-size: 1.05rem;
          color: #6a6080;
          max-width: 480px;
          line-height: 1.65;
          margin: 0;
        }
        .fav-empty-links { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; margin-top: 8px; }
        .fav-empty-btn {
          font-family: var(--font-space), monospace;
          font-size: 0.62rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #c9a84c;
          border: 1px solid rgba(201,168,76,0.4);
          padding: 12px 20px;
          text-decoration: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .fav-empty-btn:hover { border-color: #c9a84c; background: rgba(201,168,76,0.06); }

        /* ── Actions bar ── */
        .fav-actions-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }
        .fav-actions-note {
          font-family: var(--font-space), monospace;
          font-size: 0.55rem;
          letter-spacing: 0.1em;
          color: #3a3545;
          margin: 0;
        }
        .fav-clear-btn {
          font-family: var(--font-space), monospace;
          font-size: 0.58rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #4a445a;
          border: 1px solid rgba(255,255,255,0.08);
          background: transparent;
          padding: 8px 14px;
          cursor: pointer;
          transition: color 0.15s, border-color 0.15s;
        }
        .fav-clear-btn:hover { color: #c0001a; border-color: rgba(192,0,26,0.4); }

        /* ── Section ── */
        .fav-section { margin-bottom: 56px; }
        .fav-section-heading {
          font-family: var(--font-space), monospace;
          font-size: 0.62rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #4a445a;
          margin-bottom: 20px;
        }

        /* ── Grids ── */
        .fav-grid--portrait {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
        }
        .fav-grid--landscape {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        @media (max-width: 1023px) {
          .fav-grid--portrait  { grid-template-columns: repeat(3, 1fr); }
          .fav-grid--landscape { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 639px) {
          .fav-grid--portrait  { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .fav-grid--landscape { grid-template-columns: 1fr; }
        }

        /* ── Cards ── */
        .fav-card {
          display: flex;
          flex-direction: column;
          background: #1a1825;
          border: 1px solid rgba(255,255,255,0.06);
          overflow: hidden;
          transition: border-color 0.2s, transform 0.2s;
        }
        .fav-card:hover {
          border-color: rgba(192,0,26,0.45);
          transform: translateY(-3px);
        }
        [data-theme="light"] .fav-card { background: #f0ebe0; border-color: rgba(0,0,0,0.08); }

        .fav-card-img-wrap {
          position: relative;
          display: block;
          overflow: hidden;
        }
        .fav-grid--portrait  .fav-card-img-wrap { aspect-ratio: 9/16; }
        .fav-grid--landscape .fav-card-img-wrap { aspect-ratio: 16/9; }

        .fav-card-img { transition: transform 0.4s; }
        .fav-card:hover .fav-card-img { transform: scale(1.04); }

        .fav-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(5,5,14,0.9) 0%, transparent 60%);
          display: flex;
          align-items: flex-end;
          padding: 12px;
          opacity: 0;
          transition: opacity 0.25s;
        }
        .fav-card:hover .fav-card-overlay { opacity: 1; }
        .fav-card-view {
          font-family: var(--font-space), monospace;
          font-size: 0.5rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #c9a84c;
        }

        .fav-card-info {
          padding: 10px 12px 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .fav-card-title {
          font-family: var(--font-cormorant), serif;
          font-style: italic;
          font-size: 0.9rem;
          color: #c4bdd8;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        [data-theme="light"] .fav-card-title { color: #3a3450; }

        .fav-card-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .fav-card-cta {
          flex: 1;
          font-family: var(--font-space), monospace;
          font-size: 0.55rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          text-decoration: none;
          color: #c0001a;
          border: 1px solid rgba(192,0,26,0.45);
          text-align: center;
          padding: 7px 10px;
          transition: background 0.15s, color 0.15s;
        }
        .fav-card-cta:hover { background: #c0001a; color: #fff; }

        .fav-remove-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.08);
          color: #3a3545;
          font-size: 0.65rem;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: color 0.15s, border-color 0.15s;
        }
        .fav-remove-btn:hover { color: #c0001a; border-color: rgba(192,0,26,0.4); }
        [data-theme="light"] .fav-remove-btn { border-color: rgba(0,0,0,0.1); color: #8a8090; }
      `}</style>
    </main>
  );
}