"use client";
// components/WallpaperCardGrid.tsx

import React from "react";
import Link from "next/link";

export interface WallpaperCardItem {
  id: string;
  slug: string;
  title: string;
  src: string;
  devicePath: string;
  isLocked?: boolean;
}

interface WallpaperCardGridProps {
  items: WallpaperCardItem[];
  accentRgb: string;
  badge?: string;
  badgeColor?: string;
}

export default function WallpaperCardGrid({ items, accentRgb, badge, badgeColor }: WallpaperCardGridProps) {
  const accent = badgeColor ?? `rgb(${accentRgb})`;
  const shadowDefault = `0 0 0 1px rgba(${accentRgb},0.25), 0 8px 32px rgba(0,0,0,0.6)`;
  const shadowHover   = `0 0 0 1px rgba(${accentRgb},0.65), 0 20px 56px rgba(0,0,0,0.85), 0 0 32px rgba(${accentRgb},0.22)`;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
      gap: "clamp(12px,2vw,24px)",
      maxWidth: "1100px",
      margin: "0 auto",
    }}>
      {items.map((img) => {
        /* LOCKED CARD */
        if (img.isLocked) {
          return (
            <div
              key={img.id}
              style={{
                borderRadius: "22px",
                overflow: "hidden",
                background: "#0d0b14",
                boxShadow: `0 0 0 1px rgba(${accentRgb},0.15), 0 8px 32px rgba(0,0,0,0.6)`,
                cursor: "default",
              }}
            >
              <div style={{ position: "relative", aspectRatio: "9/16", background: "#0d0b14", borderRadius: "22px 22px 0 0", overflow: "hidden" }}>
                {/* Side buttons */}
                <div style={{ position: "absolute", left: "-3px", top: "24%", width: "3px", height: "20px", background: "#222", borderRadius: "2px 0 0 2px" }} />
                <div style={{ position: "absolute", left: "-3px", top: "37%", width: "3px", height: "20px", background: "#222", borderRadius: "2px 0 0 2px" }} />
                <div style={{ position: "absolute", right: "-3px", top: "29%", width: "3px", height: "28px", background: "#222", borderRadius: "0 2px 2px 0" }} />
                {/* Dynamic island */}
                <div style={{ position: "absolute", top: "7px", left: "50%", transform: "translateX(-50%)", width: "35%", height: "10px", background: "#000", borderRadius: "6px", zIndex: 4 }} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.src} alt="" aria-hidden="true" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: "blur(12px) brightness(0.18)", transform: "scale(1.12)" }} loading="lazy" />
                {/* Vault overlay */}
                <div style={{ position: "absolute", inset: 0, zIndex: 5, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", padding: "1rem", textAlign: "center", background: "rgba(8,6,16,0.5)" }}>
                  <span style={{ fontSize: "1.8rem", lineHeight: 1, filter: `drop-shadow(0 0 8px rgba(${accentRgb},0.6))` }}>🔒</span>
                  <span style={{ fontSize: "0.52rem", letterSpacing: "0.2em", textTransform: "uppercase", color: accent, fontFamily: "monospace", fontWeight: 700 }}>Back in the Vault</span>
                  <span style={{ fontSize: "0.46rem", color: `rgba(${accentRgb},0.55)`, fontFamily: "monospace", lineHeight: 1.5 }}>Returns in 24h</span>
                </div>
                <div style={{ position: "absolute", bottom: "6px", left: "50%", transform: "translateX(-50%)", width: "38px", height: "3px", background: "rgba(255,255,255,0.12)", borderRadius: "2px", zIndex: 6 }} />
              </div>
              <div style={{ padding: "10px 10px 12px", background: "#0d0b14", borderTop: `1px solid rgba(${accentRgb},0.08)` }}>
                <p style={{ color: `rgba(${accentRgb},0.35)`, fontSize: "0.68rem", fontFamily: "monospace", margin: 0, lineHeight: 1.3 }}>🔒 Vault</p>
              </div>
            </div>
          );
        }

        /* UNLOCKED CARD */
        return (
          <Link key={img.id} href={`/${img.devicePath}/${img.slug}`} style={{ textDecoration: "none", display: "block" }}>
            <div
              className="wcg-card"
              style={{
                position: "relative",
                borderRadius: "22px",
                overflow: "hidden",
                background: "#0d0b14",
                boxShadow: shadowDefault,
                transition: "transform 0.28s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.28s ease",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-7px) scale(1.025)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = shadowHover;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = "";
                (e.currentTarget as HTMLDivElement).style.boxShadow = shadowDefault;
              }}
            >
              {/* Phone mockup shell */}
              <div style={{ position: "relative", aspectRatio: "9/16", background: "#111", borderRadius: "22px 22px 0 0", overflow: "hidden" }}>
                {/* Side buttons */}
                <div style={{ position: "absolute", left: "-3px", top: "24%", width: "3px", height: "20px", background: "#222", borderRadius: "2px 0 0 2px" }} />
                <div style={{ position: "absolute", left: "-3px", top: "37%", width: "3px", height: "20px", background: "#222", borderRadius: "2px 0 0 2px" }} />
                <div style={{ position: "absolute", right: "-3px", top: "29%", width: "3px", height: "28px", background: "#222", borderRadius: "0 2px 2px 0" }} />
                {/* Dynamic island */}
                <div style={{ position: "absolute", top: "7px", left: "50%", transform: "translateX(-50%)", width: "35%", height: "10px", background: "#000", borderRadius: "6px", zIndex: 3 }} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.45s ease" }}
                  loading="lazy"
                  onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.transform = "scale(1.07)"}
                  onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.transform = ""}
                />
                {/* Glass gloss */}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 50%)", pointerEvents: "none" }} />
                {/* Badge */}
                {badge && (
                  <div style={{ position: "absolute", top: "18px", left: "8px", zIndex: 4, background: `rgba(${accentRgb},0.15)`, border: `1px solid ${accent}`, color: accent, fontSize: "0.5rem", fontFamily: "monospace", fontWeight: 700, padding: "2px 6px", letterSpacing: "0.12em", borderRadius: "2px" }}>
                    {badge}
                  </div>
                )}
                {/* Hover title overlay */}
                <div className="wcg-hover-overlay" style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(4,3,10,0.93) 0%, transparent 55%)", opacity: 0, transition: "opacity 0.25s ease", display: "flex", alignItems: "flex-end", padding: "12px", pointerEvents: "none" }}>
                  <p style={{ color: "#fff", fontSize: "0.72rem", fontFamily: "monospace", margin: 0, lineHeight: 1.35 }}>{img.title}</p>
                </div>
                {/* Home indicator */}
                <div style={{ position: "absolute", bottom: "6px", left: "50%", transform: "translateX(-50%)", width: "38px", height: "3px", background: "rgba(255,255,255,0.28)", borderRadius: "2px", zIndex: 4 }} />
              </div>
              {/* Title footer */}
              <div style={{ padding: "10px 10px 12px", background: "#0d0b14", borderTop: `1px solid rgba(${accentRgb},0.1)` }}>
                <p style={{ color: accent, fontSize: "0.7rem", fontFamily: "monospace", margin: 0, lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
                  {img.title}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
      <style>{`
        .wcg-card:hover .wcg-hover-overlay { opacity: 1 !important; }
      `}</style>
    </div>
  );
}