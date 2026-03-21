'use client';

import { useEffect, useState } from "react";
import Link from "next/link";

export interface RecentItem {
  slug:  string;
  title: string;
  thumb: string;
  href:  string;
}

const KEY = "hw-recently-viewed";
const MAX = 8;

export function recordView(item: RecentItem) {
  try {
    const raw = localStorage.getItem(KEY);
    const existing: RecentItem[] = raw ? JSON.parse(raw) : [];
    const filtered = existing.filter(i => i.slug !== item.slug);
    const updated = [item, ...filtered].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch {}
}

export default function RecentlyViewed() {
  const [items, setItems] = useState<RecentItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  if (items.length < 2) return null;

  const isPC = (item: RecentItem) => item.href.startsWith("/pc/");

  const portraitItems  = items.filter(i => !isPC(i));
  const landscapeItems = items.filter(i =>  isPC(i));

  return (
    <section className="recently-viewed">
      <div className="rv-header">
        <span className="section-eyebrow">Your Trail</span>
        <h2 className="rv-title">Recently Viewed</h2>
      </div>

      {/* Portrait grid — iPhone / Android (9:16) */}
      {portraitItems.length > 0 && (
        <div className="rv-grid rv-grid--portrait">
          {portraitItems.map(item => (
            <Link key={item.slug} href={item.href} className="rv-card rv-card--portrait">
              <img src={item.thumb} alt={item.title} loading="lazy" />
              <span className="rv-card-title">{item.title}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Landscape grid — PC (16:9) — separate row so they're never squeezed into portrait slots */}
      {landscapeItems.length > 0 && (
        <>
          <p className="rv-section-label">
            {portraitItems.length > 0 ? "PC & Desktop" : ""}
          </p>
          <div className="rv-grid rv-grid--landscape">
            {landscapeItems.map(item => (
              <Link key={item.slug} href={item.href} className="rv-card rv-card--landscape">
                <img src={item.thumb} alt={item.title} loading="lazy" />
                <span className="rv-card-title">{item.title}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </section>
  );
}