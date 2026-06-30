"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getFavorites, toggleFavorite, type FavoriteItem } from "@/components/FavoriteButton";
import Breadcrumbs from "@/components/Breadcrumbs";

export const dynamic = "force-dynamic";

export default function FavoritesPage() {
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);

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
    toggleFavorite(item);
  }

  function handleClearAll() {
    try { localStorage.removeItem("hw-favorites"); } catch {}
    window.dispatchEvent(new CustomEvent("hw-favorites-change", { detail: [] }));
    setShowClearDialog(false);
  }

  const portrait  = items.filter(i => i.device !== "pc");
  const landscape = items.filter(i => i.device === "pc");

  return (
    <main className="fav-page">

      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Saved Wallpapers" },
      ]} />

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
            <Link href="/collections" className="fav-empty-btn">Browse Collections</Link>
          </div>
        </div>

      ) : (
        <>
          {/* Actions bar */}
          <div className="fav-actions-bar">
            <p className="fav-actions-note">
              Saves are stored on this device only. Clearing your browser data will remove them.
            </p>
            <button className="fav-clear-btn" onClick={() => setShowClearDialog(true)}>Clear All</button>
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
                        unoptimized
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
                        unoptimized
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

      {/* ── Custom Clear-All Confirmation Dialog ── */}
      {showClearDialog && (
        <div className="fav-dialog-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setShowClearDialog(false); }}>
          <div className="fav-dialog" role="dialog" aria-modal="true" aria-labelledby="fav-dialog-title">
            <span className="fav-dialog-icon">🖤</span>
            <h2 className="fav-dialog-title" id="fav-dialog-title">Clear All Saved Wallpapers?</h2>
            <p className="fav-dialog-body">
              This will remove all {items.length} saved wallpaper{items.length !== 1 ? "s" : ""} from your collection. This action cannot be undone.
            </p>
            <div className="fav-dialog-actions">
              <button className="fav-dialog-cancel" onClick={() => setShowClearDialog(false)}>
                Keep Collection
              </button>
              <button className="fav-dialog-confirm" onClick={handleClearAll}>
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}