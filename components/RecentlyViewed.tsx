'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

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

interface RecentlyViewedProps {
  /** Slug of the item currently being viewed — excluded from the list */
  currentSlug?: string;
}

export default function RecentlyViewed({ currentSlug }: RecentlyViewedProps) {
  const [items, setItems] = useState<RecentItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const all: RecentItem[] = JSON.parse(raw);
        // Filter out the current page so clicking it doesn't do nothing
        const filtered = currentSlug
          ? all.filter(i => i.slug !== currentSlug)
          : all;
        setItems(filtered);
      }
    } catch {}
  }, [currentSlug]);

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
              <div style={{ position: "relative", width: "100%", height: "100%" }}>
                <Image
                  src={item.thumb}
                  alt={item.title}
                  fill
                  loading="lazy"
                  unoptimized
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 640px) 50vw, 150px"
                />
              </div>
              <span className="rv-card-title">{item.title}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Landscape grid — PC (16:9) */}
      {landscapeItems.length > 0 && (
        <>
          <p className="rv-section-label">
            {portraitItems.length > 0 ? "PC & Desktop" : ""}
          </p>
          <div className="rv-grid rv-grid--landscape">
            {landscapeItems.map(item => (
              <Link key={item.slug} href={item.href} className="rv-card rv-card--landscape">
                <div style={{ position: "relative", width: "100%", height: "100%" }}>
                  <Image
                    src={item.thumb}
                    alt={item.title}
                    fill
                    loading="lazy"
                    unoptimized
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 640px) 100vw, 250px"
                  />
                </div>
                <span className="rv-card-title">{item.title}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
