"use client";
// components/WallpaperCardGrid.tsx
//
// Client component that owns the onMouseEnter / onMouseLeave handlers.
// Accepts only plain serialisable props so it can be rendered from a Server Component.

import React from "react";
import Link from "next/link";

export interface WallpaperCardItem {
  id: string;
  slug: string;
  title: string;
  src: string;        // pre-resolved public URL
  devicePath: string; // "iphone" | "android" | "pc"
}

interface WallpaperCardGridProps {
  items: WallpaperCardItem[];
  /** Accent colour used for the border/shadow glow, e.g. "76,175,80" or "201,168,76" */
  accentRgb: string;
  /** Optional badge text rendered on each card (e.g. "PREMIUM"). Omit for no badge. */
  badge?: string;
  /** Badge colour when shown */
  badgeColor?: string;
}

export default function WallpaperCardGrid({ items, accentRgb, badge, badgeColor }: WallpaperCardGridProps) {
  const shadowDefault = `0 0 0 1px rgba(${accentRgb},0.25), 0 8px 32px rgba(0,0,0,0.6)`;
  const shadowHover   = `0 0 0 1px rgba(${accentRgb},0.5), 0 16px 48px rgba(0,0,0,0.8)`;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "clamp(12px,2vw,24px)", maxWidth: "1100px", margin: "0 auto" }}>
      {items.map((img) => (
        <Link key={img.id} href={`/${img.devicePath}/${img.slug}`} style={{ textDecoration: "none", display: "block" }}>
          <div
            style={{ position: "relative", borderRadius: "20px", overflow: "hidden", background: "#0d0b14", boxShadow: shadowDefault, transition: "transform 0.2s, box-shadow 0.2s" }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = shadowHover;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.transform = "";
              (e.currentTarget as HTMLDivElement).style.boxShadow = shadowDefault;
            }}
          >
            {/* Phone mockup shell */}
            <div style={{ position: "relative", aspectRatio: "9/16", background: "#111" }}>
              {/* Phone buttons */}
              <div style={{ position: "absolute", left: "-3px", top: "25%", width: "3px", height: "20px", background: "#222", borderRadius: "2px 0 0 2px" }} />
              <div style={{ position: "absolute", left: "-3px", top: "38%", width: "3px", height: "20px", background: "#222", borderRadius: "2px 0 0 2px" }} />
              <div style={{ position: "absolute", right: "-3px", top: "30%", width: "3px", height: "28px", background: "#222", borderRadius: "0 2px 2px 0" }} />

              {/* Dynamic island */}
              <div style={{ position: "absolute", top: "6px", left: "50%", transform: "translateX(-50%)", width: "36px", height: "10px", background: "#000", borderRadius: "6px", zIndex: 3 }} />

              {/* Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.src} alt={img.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", borderRadius: "20px" }} loading="lazy" />

              {/* Glass gloss */}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%)", borderRadius: "20px", pointerEvents: "none" }} />

              {/* Optional badge */}
              {badge && (
                <div style={{ position: "absolute", top: "18px", left: "8px", background: `rgba(${accentRgb},0.15)`, border: `1px solid ${badgeColor ?? `rgb(${accentRgb})`}`, color: badgeColor ?? `rgb(${accentRgb})`, fontSize: "0.5rem", fontFamily: "monospace", padding: "2px 6px", letterSpacing: "0.1em" }}>
                  {badge}
                </div>
              )}

              {/* Home indicator */}
              <div style={{ position: "absolute", bottom: "6px", left: "50%", transform: "translateX(-50%)", width: "40px", height: "3px", background: "rgba(255,255,255,0.3)", borderRadius: "2px" }} />
            </div>

            {/* Title */}
            <div style={{ padding: "10px 10px 12px", background: "#0d0b14", borderTop: `1px solid rgba(${accentRgb},0.1)` }}>
              <p style={{ color: badgeColor ?? `rgb(${accentRgb})`, fontSize: "0.7rem", fontFamily: "monospace", margin: 0, lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
                {img.title}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}