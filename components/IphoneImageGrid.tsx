"use client";
// components/IphoneImageGrid.tsx
//
// Renders a grid of wallpaper cards for iPhone / Android pages.
// When isLockedGlobal=true, cards tagged "badge-premium" show a vault
// placeholder with a LIVE countdown instead of the real image.
// When isLockedGlobal=false, premium cards show normally with the badge + "GONE IN" countdown.

import Link from "next/link";
import Image from "next/image";
import { CSSProperties, useEffect, useState } from "react";

// ─── Cycle constants — must match PremiumCountdown.tsx and page.tsx files ──
const EPOCH_MS  = Date.UTC(2025, 0, 1, 0, 0, 0); // Jan 1 2025 00:00 UTC
const CYCLE_MS  = 48 * 60 * 60 * 1000;            // 48 h full cycle
const UNLOCK_MS = 24 * 60 * 60 * 1000;            // first 24 h = unlocked

function getMsRemaining(isLocked: boolean): number {
  const pos = (Date.now() - EPOCH_MS) % CYCLE_MS;
  if (!isLocked) return Math.max(0, UNLOCK_MS - pos);
  return Math.max(0, CYCLE_MS - pos);
}

function fmt(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

/** Small inline countdown used inside vault/badge overlay */
function MiniCountdown({ isLocked }: { isLocked: boolean }) {
  const [display, setDisplay] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setDisplay(fmt(getMsRemaining(isLocked)));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [isLocked]);

  if (!display) return null;
  return <>{display}</>;
}

interface ImageItem {
  id: string;
  slug: string;
  title: string;
  src: string;
  viewCount?: number;
  tags: string[];
  isAdult?: boolean;
}

interface IphoneImageGridProps {
  images: ImageItem[];
  hrefPrefix: string;
  altSuffix?: string;
  gridClassName?: string;
  gridStyle?: CSSProperties;
  priority?: boolean;
  priorityCount?: number;
  aspectRatio?: string;
  sizes?: string;
  insertAfter?: number;
  /** When true, premium cards show vault placeholder + "BACK IN" countdown */
  isLockedGlobal?: boolean;
}

export default function IphoneImageGrid({
  images,
  hrefPrefix,
  altSuffix = "",
  gridClassName,
  gridStyle,
  priority = false,
  priorityCount = 6,
  aspectRatio = "9/16",
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw",
  insertAfter,
  isLockedGlobal = false,
}: IphoneImageGridProps) {
  const defaultGridClass = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3";

  return (
    <div className={gridClassName ?? defaultGridClass} style={gridStyle}>
      {images.map((img, idx) => {
        const isPremium = img.tags.includes("badge-premium");
        const isNew     = img.tags.includes("badge-new");
        const showVault = isPremium && isLockedGlobal;

        return (
          <>
            {insertAfter !== undefined && idx === insertAfter && (
              <div key={`ad-${idx}`} className="hw-ad-slot" aria-label="Advertisement" />
            )}
            <Link
              key={img.id}
              href={`${hrefPrefix}/${img.slug}`}
              className="group relative block overflow-hidden rounded-lg bg-[#0e0d1a] border border-white/[0.06] hover:border-white/20 transition-all duration-300"
              style={{ aspectRatio }}
            >
              {showVault ? (
                /* ── LOCKED PREMIUM — vault placeholder with live countdown ── */
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  gap: "8px", padding: "12px",
                  background: "linear-gradient(135deg, #0a0914 0%, #0e0d1a 100%)",
                }}>
                  {/* Lock icon */}
                  <span style={{ fontSize: "20px", opacity: 0.6 }}>🔒</span>

                  {/* BACK IN THE VAULT label */}
                  <span style={{
                    fontFamily: "var(--font-space, monospace)",
                    fontSize: "0.52rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.45)",
                    textAlign: "center",
                    fontWeight: 700,
                  }}>
                    BACK IN
                  </span>

                  {/* Live countdown */}
                  <span style={{
                    fontFamily: "var(--font-space, monospace)",
                    fontSize: "0.62rem",
                    fontWeight: 700,
                    color: "#c9a84c",
                    letterSpacing: "0.08em",
                    textAlign: "center",
                  }}>
                    <MiniCountdown isLocked={true} />
                  </span>
                </div>
              ) : (
                /* ── NORMAL — show real image ── */
                <Image
                  src={img.src}
                  alt={`${img.title}${altSuffix ? " — " + altSuffix : ""}`}
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes={sizes}
                  priority={priority || idx < priorityCount}
                  loading={priority || idx < priorityCount ? "eager" : "lazy"}
                />
              )}

              {/* ── PREMIUM badge + "GONE IN" on available premium cards ── */}
              {!showVault && isPremium && (
                <>
                  <span style={{
                    position: "absolute", top: 7, left: 7,
                    fontFamily: "var(--font-space, monospace)",
                    fontSize: "0.52rem", fontWeight: 700,
                    letterSpacing: "0.12em", textTransform: "uppercase",
                    color: "#0c0b14", background: "#c9a84c",
                    padding: "2px 6px", borderRadius: "2px",
                    zIndex: 10, pointerEvents: "none",
                  }}>
                    PREMIUM
                  </span>

                  {/* "GONE IN" countdown at bottom of premium card */}
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    padding: "20px 8px 6px",
                    background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                    zIndex: 9,
                    pointerEvents: "none",
                  }}>
                    <span style={{
                      fontFamily: "var(--font-space, monospace)",
                      fontSize: "0.45rem",
                      letterSpacing: "0.12em",
                      color: "rgba(201,168,76,0.7)",
                      textTransform: "uppercase",
                    }}>GONE IN</span>
                    <span style={{
                      fontFamily: "var(--font-space, monospace)",
                      fontSize: "0.52rem",
                      fontWeight: 700,
                      color: "#c9a84c",
                      letterSpacing: "0.06em",
                    }}>
                      <MiniCountdown isLocked={false} />
                    </span>
                  </div>
                </>
              )}

              {/* NEW badge */}
              {isNew && (
                <span style={{
                  position: "absolute", top: 7, left: isPremium && !showVault ? 70 : 7,
                  fontFamily: "var(--font-space, monospace)",
                  fontSize: "0.55rem", fontWeight: 700,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  color: "#fff", background: "#4caf50",
                  padding: "2px 6px", borderRadius: "2px",
                  zIndex: 10, pointerEvents: "none",
                }}>
                  NEW
                </span>
              )}
            </Link>
          </>
        );
      })}
    </div>
  );
}