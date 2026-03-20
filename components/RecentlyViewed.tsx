'use client';

import { useEffect, useState } from "react";
import Link from "next/link";

export interface RecentItem {
  slug: string;
  title: string;
  thumb: string; // r2 public URL
  href: string;
}

const KEY = "hw-recently-viewed";
const MAX = 8;

// Call this from any wallpaper page to record the visit
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

  return (
    <section className="recently-viewed">
      <div className="rv-header">
        <span className="section-eyebrow">Your Trail</span>
        <h2 className="rv-title">Recently Viewed</h2>
      </div>
      <div className="rv-grid">
        {items.map(item => (
          <Link key={item.slug} href={item.href} className="rv-card">
            <img src={item.thumb} alt={item.title} loading="lazy" />
            <span className="rv-card-title">{item.title}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}