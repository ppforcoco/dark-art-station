"use client";
// components/WallpaperCardGrid.tsx

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

// ─── Cycle constants — must match all other files ────────────────────────────
const EPOCH_MS  = Date.UTC(2025, 0, 1, 0, 0, 0);
const CYCLE_MS  = 48 * 60 * 60 * 1000;
const UNLOCK_MS = 24 * 60 * 60 * 1000;

function getClientIsLocked(): boolean {
  const pos = (Date.now() - EPOCH_MS) % CYCLE_MS;
  return pos >= UNLOCK_MS;
}

function getMsUntilUnlock(): number {
  const pos = (Date.now() - EPOCH_MS) % CYCLE_MS;
  if (pos >= UNLOCK_MS) return Math.max(0, CYCLE_MS - pos);
  return 0;
}

function fmtMs(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(h)}h ${p(m)}m ${p(sec)}s`;
}

function VaultCountdown() {
  const [display, setDisplay] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setDisplay(fmtMs(getMsUntilUnlock()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  if (!display) return null;
  return <>{display}</>;
}

// ─── Seeded fake download count ───────────────────────────────────────────────
// Hashes the slug into a stable integer. Range: 12–97 (never round, believable).
// TO REMOVE BEFORE ADSENSE: delete this function + all fakeDownloads usages.
function seededFakeDownloads(slug: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  // sqrt curve weights toward lower numbers — most land 15–50, outliers up to 97
  const t = Math.sqrt((h % 10000) / 10000);
  return Math.floor(12 + t * 85);
}

function fmtDownloads(n: number): string {
  return String(n);
}

export interface WallpaperCardItem {
  id: string;
  slug: string;
  title: string;
  src: string;
  devicePath: string;
  isLocked?: boolean;
  downloadCount?: number;
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

  // ── FIX: hydration-safe lock state ───────────────────────────────────────
  const [isLockedNow, setIsLockedNow] = useState(false);
  useEffect(() => {
    setIsLockedNow(getClientIsLocked());
    const id = setInterval(() => setIsLockedNow(getClientIsLocked()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <style>{`
        .wcg-card:hover .wcg-hover-overlay { opacity: 1 !important; }
        .wcg-outer {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: clamp(12px,2vw,24px);
          max-width: 1100px;
          margin: 0 auto;
        }
        @media (max-width: 640px) {
          .wcg-outer {
            display: flex;
            flex-direction: row;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            gap: 8px;
            padding: 4px 4px 12px;
            scrollbar-width: none;
            max-width: 100%;
          }
          .wcg-outer::-webkit-scrollbar { display: none; }
          .wcg-outer > * {
            flex: 0 0 100px;
            scroll-snap-align: start;
          }
        }
        @media (pointer: fine) {
          .wcg-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
          .wcg-card:hover { transform: translateY(-4px); }
        }
      `}</style>
      <div className="wcg-outer">
      {items.map((img) => {
        // REMOVE BEFORE ADSENSE: seededFakeDownloads line below
        const displayCount = img.downloadCount ?? seededFakeDownloads(img.slug);

        /* LOCKED CARD */
        if (img.isLocked && isLockedNow) {
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
                <div style={{ position: "absolute", left: "-3px", top: "24%", width: "3px", height: "20px", background: "#222", borderRadius: "2px 0 0 2px" }} />
                <div style={{ position: "absolute", left: "-3px", top: "37%", width: "3px", height: "20px", background: "#222", borderRadius: "2px 0 0 2px" }} />
                <div style={{ position: "absolute", right: "-3px", top: "29%", width: "3px", height: "28px", background: "#222", borderRadius: "0 2px 2px 0" }} />
                <div style={{ position: "absolute", top: "7px", left: "50%", transform: "translateX(-50%)", width: "35%", height: "10px", background: "#000", borderRadius: "6px", zIndex: 4 }} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <Image src={img.src} alt="" aria-hidden="true" fill loading="lazy" sizes="100px" style={{ objectFit: "cover", filter: "blur(12px) brightness(0.18)", transform: "scale(1.12)" }} unoptimized />
                <div style={{ position: "absolute", inset: 0, zIndex: 5, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", padding: "1rem", textAlign: "center", background: "rgba(8,6,16,0.5)" }}>
                  <span style={{ fontSize: "1.8rem", lineHeight: 1, filter: `drop-shadow(0 0 8px rgba(${accentRgb},0.6))` }}>🔒</span>
                  <span style={{ fontSize: "0.52rem", letterSpacing: "0.2em", textTransform: "uppercase", color: accent, fontFamily: "monospace", fontWeight: 700 }}>Back in the Vault</span>
                  <span style={{ fontSize: "0.46rem", color: `rgba(${accentRgb},0.55)`, fontFamily: "monospace", lineHeight: 1.5 }}>BACK IN <VaultCountdown /></span>
                </div>
                <div style={{ position: "absolute", bottom: "6px", left: "50%", transform: "translateX(-50%)", width: "38px", height: "3px", background: "rgba(255,255,255,0.12)", borderRadius: "2px", zIndex: 6 }} />
              </div>
              <div style={{ padding: "10px 10px 12px", background: "#0d0b14", borderTop: `1px solid rgba(${accentRgb},0.08)` }}>
                <p style={{ color: `rgba(${accentRgb},0.35)`, fontSize: "0.68rem", fontFamily: "monospace", margin: 0, lineHeight: 1.3 }}>&nbsp;</p>
              </div>
            </div>
          );
        }

        /* UNLOCKED CARD */
        return (
          <Link prefetch={false} key={img.id} href={`/${img.devicePath}/${img.slug}`} style={{ textDecoration: "none", display: "block" }}>
            <div
              className="wcg-card"
              style={{
                position: "relative",
                borderRadius: "22px",
                overflow: "hidden",
                background: "#0d0b14",
                boxShadow: shadowDefault,
              }}
            >
              {/* Phone mockup shell */}
              <div style={{ position: "relative", aspectRatio: "9/16", background: "#111", borderRadius: "22px 22px 0 0", overflow: "hidden" }}>
                <div style={{ position: "absolute", left: "-3px", top: "24%", width: "3px", height: "20px", background: "#222", borderRadius: "2px 0 0 2px" }} />
                <div style={{ position: "absolute", left: "-3px", top: "37%", width: "3px", height: "20px", background: "#222", borderRadius: "2px 0 0 2px" }} />
                <div style={{ position: "absolute", right: "-3px", top: "29%", width: "3px", height: "28px", background: "#222", borderRadius: "0 2px 2px 0" }} />
                <div style={{ position: "absolute", top: "7px", left: "50%", transform: "translateX(-50%)", width: "35%", height: "10px", background: "#000", borderRadius: "6px", zIndex: 3 }} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <Image
                  src={img.src}
                  alt={img.title}
                  fill
                  unoptimized
                  loading="lazy"
                  sizes="(max-width: 640px) 100px, (max-width: 1024px) 180px, 220px"
                  style={{ objectFit: "cover" }}
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
              {/* Title + download count footer */}
              <div style={{ padding: "10px 10px 12px", background: "#0d0b14", borderTop: `1px solid rgba(${accentRgb},0.1)` }}>
                <p style={{ color: "#e8e4dc", fontSize: "0.7rem", fontFamily: "monospace", margin: 0, lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
                  {img.title}
                </p>
                {/* REMOVE BEFORE ADSENSE: the <p> below */}
                <p style={{ color: "rgba(255,255,255,0.38)", fontSize: "0.56rem", fontFamily: "monospace", margin: "5px 0 0", lineHeight: 1.2, display: "flex", alignItems: "center", gap: "3px" }}>
                  <span style={{ opacity: 0.6 }}>↓</span>
                  {fmtDownloads(displayCount)} downloads
                </p>
              </div>
            </div>
          </Link>
        );
      })}
      </div>
    </>
  );
}