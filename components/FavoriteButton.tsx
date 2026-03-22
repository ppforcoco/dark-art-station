"use client";

import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "hw-favorites";

export type FavoriteItem = {
  slug:      string;
  title:     string;
  thumb:     string;
  href:      string;
  device?:   string; // "iphone" | "android" | "pc" | "collection"
};

// ─── Shared helpers (imported by favorites page too) ─────────────────────────
export function getFavorites(): FavoriteItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function isFavorited(slug: string): boolean {
  return getFavorites().some(f => f.slug === slug);
}

export function toggleFavorite(item: FavoriteItem): boolean {
  const existing = getFavorites();
  const idx = existing.findIndex(f => f.slug === item.slug);
  let updated: FavoriteItem[];
  if (idx !== -1) {
    updated = existing.filter(f => f.slug !== item.slug);
  } else {
    updated = [item, ...existing].slice(0, 200); // max 200 favorites
  }
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
  window.dispatchEvent(new CustomEvent("hw-favorites-change", { detail: updated }));
  return idx === -1; // true = now favorited
}

// ─── Component ────────────────────────────────────────────────────────────────
interface Props {
  item: FavoriteItem;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function FavoriteButton({ item, size = "md", className = "" }: Props) {
  const [saved, setSaved] = useState(false);
  const [pop,   setPop]   = useState(false);

  useEffect(() => {
    setSaved(isFavorited(item.slug));

    function onExternalChange(e: Event) {
      const favorites = (e as CustomEvent<FavoriteItem[]>).detail;
      setSaved(favorites.some(f => f.slug === item.slug));
    }
    window.addEventListener("hw-favorites-change", onExternalChange);
    return () => window.removeEventListener("hw-favorites-change", onExternalChange);
  }, [item.slug]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nowSaved = toggleFavorite(item);
    setSaved(nowSaved);
    if (nowSaved) { setPop(true); setTimeout(() => setPop(false), 600); }
  }, [item]);

  const sizeClass = size === "sm" ? "fav-btn--sm" : size === "lg" ? "fav-btn--lg" : "fav-btn--md";

  return (
    <button
      type="button"
      className={`fav-btn ${sizeClass} ${saved ? "fav-btn--saved" : ""} ${pop ? "fav-btn--pop" : ""} ${className}`}
      onClick={handleClick}
      aria-label={saved ? "Remove from favorites" : "Save to favorites"}
      title={saved ? "Remove from favorites" : "Save to favorites"}
    >
      <svg
        viewBox="0 0 24 24"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={saved ? 0 : 1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}