'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

// ── Re-use the same localStorage key as RecentlyViewed ──────────────────────
const KEY = "hw-recently-viewed";
const MAX = 20;

export interface TrailItem {
  slug:  string;
  title: string;
  thumb: string;
  href:  string;
}

/** Call this from any detail page to record a view into the trail */
export function recordTrail(item: TrailItem) {
  try {
    const raw = localStorage.getItem(KEY);
    const existing: TrailItem[] = raw ? JSON.parse(raw) : [];
    const filtered = existing.filter(i => i.slug !== item.slug);
    const updated = [item, ...filtered].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch {}
}

function isPC(item: TrailItem) {
  return item.href.startsWith("/pc/");
}

// ── Horizontal scroll strip ──────────────────────────────────────────────────
function TrailStrip({
  items,
  aspect,
  label,
}: {
  items: TrailItem[];
  aspect: "portrait" | "landscape";
  label: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  const isPortrait = aspect === "portrait";

  return (
    <div className="ts-strip">
      <p className="ts-strip-label">{label}</p>
      <div className="ts-scroll" ref={scrollRef}>
        {items.map((item) => (
          <Link
            key={item.slug}
            href={item.href}
            prefetch={false}
            className={`ts-card ts-card--${aspect}`}
            aria-label={item.title}
          >
            <div className="ts-thumb-wrap">
              <Image
                src={item.thumb}
                alt={item.title}
                fill
                loading="lazy"
                unoptimized
                sizes={
                  isPortrait
                    ? "(max-width:640px) 28vw, 130px"
                    : "(max-width:640px) 55vw, 240px"
                }
                style={{ objectFit: "cover", objectPosition: "center top" }}
              />
              {/* Device badge */}
              <span className="ts-badge">
                {item.href.startsWith("/iphone/")
                  ? "iPhone"
                  : item.href.startsWith("/android/")
                  ? "Android"
                  : "PC"}
              </span>
              {/* Hover veil */}
              <div className="ts-veil" aria-hidden="true" />
            </div>
            <span className="ts-name">{item.title}</span>
          </Link>
        ))}
      </div>

      <style>{`
        .ts-strip { margin-bottom: clamp(18px,3vw,28px); }
        .ts-strip-label {
          font-family: monospace;
          font-size: .48rem;
          letter-spacing: .22em;
          text-transform: uppercase;
          color: rgba(255,255,255,.3);
          margin: 0 0 10px clamp(16px,5vw,48px);
        }
        .ts-scroll {
          display: flex;
          gap: clamp(8px,1.5vw,12px);
          overflow-x: auto;
          padding: 4px clamp(16px,5vw,48px) 12px;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .ts-scroll::-webkit-scrollbar { display: none; }

        /* ── Portrait card (9:16) — iPhone / Android ── */
        .ts-card--portrait {
          flex-shrink: 0;
          width: clamp(90px,22vw,130px);
          scroll-snap-align: start;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .ts-card--portrait .ts-thumb-wrap {
          position: relative;
          aspect-ratio: 9 / 16;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.07);
          background: #0d0b18;
        }

        /* ── Landscape card (16:9) — PC ── */
        .ts-card--landscape {
          flex-shrink: 0;
          width: clamp(160px,42vw,240px);
          scroll-snap-align: start;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .ts-card--landscape .ts-thumb-wrap {
          position: relative;
          aspect-ratio: 16 / 9;
          border-radius: 6px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.07);
          background: #0d0b18;
        }

        /* ── Shared hover ── */
        .ts-card--portrait:hover .ts-thumb-wrap,
        .ts-card--landscape:hover .ts-thumb-wrap {
          border-color: rgba(201,168,76,.5);
          transform: scale(1.03);
          transition: transform .2s, border-color .2s;
        }

        /* ── Veil overlay on hover ── */
        .ts-veil {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(7,5,16,.8) 0%, transparent 45%);
          opacity: 0;
          transition: opacity .2s;
        }
        .ts-card--portrait:hover .ts-veil,
        .ts-card--landscape:hover .ts-veil { opacity: 1; }

        /* ── Device badge ── */
        .ts-badge {
          position: absolute;
          bottom: 7px;
          left: 7px;
          font-family: monospace;
          font-size: .42rem;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: rgba(255,255,255,.7);
          background: rgba(0,0,0,.65);
          border: 1px solid rgba(255,255,255,.12);
          padding: 2px 6px;
          border-radius: 2px;
          opacity: 0;
          transition: opacity .2s;
        }
        .ts-card--portrait:hover .ts-badge,
        .ts-card--landscape:hover .ts-badge { opacity: 1; }

        /* ── Title ── */
        .ts-name {
          font-family: var(--font-cormorant, Georgia, serif);
          font-size: .8rem;
          color: #a89fc0;
          line-height: 1.25;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          transition: color .15s;
        }
        .ts-card--portrait:hover .ts-name,
        .ts-card--landscape:hover .ts-name { color: #f0ecff; }
      `}</style>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function TrailSection() {
  const [items, setItems] = useState<TrailItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  if (!mounted || items.length < 2) return null;

  const mobileItems    = items.filter(i => !isPC(i));
  const desktopItems   = items.filter(i =>  isPC(i));
  const hasBoth        = mobileItems.length > 0 && desktopItems.length > 0;

  return (
    <section className="hp-trail">
      {/* ── Section header ── */}
      <div className="hp-trail-head" style={{ paddingRight: "clamp(16px,5vw,48px)" }}>
        <div>
          <p className="hp-section-eye" style={{ color: "#c9a84c", marginBottom: 6 }}>
            Your History
          </p>
          <h2 className="hp-section-title">Your Trail</h2>
        </div>
        <button
          className="ts-clear-btn"
          onClick={() => {
            try { localStorage.removeItem(KEY); } catch {}
            setItems([]);
          }}
          aria-label="Clear trail"
        >
          Clear
        </button>
      </div>

      {/* ── Portrait strip (iPhone + Android, 9:16) ── */}
      <TrailStrip
        items={mobileItems}
        aspect="portrait"
        label={hasBoth ? "iPhone & Android" : ""}
      />

      {/* ── Landscape strip (PC, 16:9) ── */}
      <TrailStrip
        items={desktopItems}
        aspect="landscape"
        label={hasBoth ? "PC & Desktop" : ""}
      />

      <style>{`
        .ts-clear-btn {
          font-family: monospace;
          font-size: .5rem;
          letter-spacing: .18em;
          text-transform: uppercase;
          color: rgba(255,255,255,.25);
          background: transparent;
          border: 1px solid rgba(255,255,255,.1);
          padding: 6px 14px;
          cursor: pointer;
          flex-shrink: 0;
          align-self: flex-end;
        }
        .ts-clear-btn:hover {
          color: #ef0014;
          border-color: rgba(239,0,20,.4);
        }
      `}</style>
    </section>
  );
}