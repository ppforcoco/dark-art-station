"use client";
// components/IphoneImageGrid.tsx
//
// Renders a grid of wallpaper cards for iPhone / Android pages.
// When isLockedGlobal=true, cards tagged "badge-premium" show a vault
// placeholder with a LIVE countdown instead of the real image.
// When isLockedGlobal=false, premium cards show normally with the badge + "GONE IN" countdown.

import Link from "next/link";
import Image from "next/image";
import { CSSProperties, useCallback, useEffect, useRef, useState } from "react";

// ─── Inline favorites helpers (no import to avoid circular deps) ──────────────
const FAV_KEY = "hw-favorites";
type FavItem = { slug: string; title: string; thumb: string; href: string; device?: string };
function getFavs(): FavItem[] {
  try { const r = localStorage.getItem(FAV_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
}
function isFaved(slug: string) { return getFavs().some(f => f.slug === slug); }
function toggleFav(item: FavItem): boolean {
  const existing = getFavs();
  const idx = existing.findIndex(f => f.slug === item.slug);
  const updated = idx !== -1 ? existing.filter(f => f.slug !== item.slug) : [item, ...existing].slice(0, 200);
  try { localStorage.setItem(FAV_KEY, JSON.stringify(updated)); } catch {}
  window.dispatchEvent(new CustomEvent("hw-favorites-change", { detail: updated }));
  return idx === -1;
}

// ─── Heart button — self-contained, reads/writes localStorage ─────────────────
function HeartBtn({ slug, title, thumb, href, device }: FavItem) {
  const [saved, setSaved] = useState(false);
  const [pop, setPop] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    setSaved(isFaved(slug));
    const h = (e: Event) => {
      const list = (e as CustomEvent<FavItem[]>).detail;
      setSaved(list.some(f => f.slug === slug));
    };
    window.addEventListener("hw-favorites-change", h);
    return () => window.removeEventListener("hw-favorites-change", h);
  }, [slug]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nowSaved = toggleFav({ slug, title, thumb, href, device });
    setSaved(nowSaved);
    if (nowSaved) { setPop(true); setTimeout(() => setPop(false), 300); }
  }, [slug, title, thumb, href, device]);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={saved ? "Remove from favorites" : "Save to favorites"}
      style={{
        position: "absolute",
        top: 8,
        right: 8,
        zIndex: 20,
        width: 30,
        height: 30,
        borderRadius: "50%",
        border: saved ? "1px solid rgba(255,30,50,0.6)" : "1px solid rgba(255,255,255,0.18)",
        background: saved ? "rgba(192,0,26,0.85)" : "rgba(7,7,16,0.72)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        padding: 0,
        transform: pop ? "scale(1.3)" : "scale(1)",
        transition: "transform 0.15s ease, background 0.15s ease, border-color 0.15s ease",
        WebkitTapHighlightColor: "transparent",
        touchAction: "manipulation",
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={saved ? 0 : 1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ width: 14, height: 14, color: saved ? "#fff" : "rgba(255,255,255,0.8)", display: "block" }}
        aria-hidden="true"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}

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
  /** How many cards to show immediately without scrolling (default 6 on mobile) */
  initialCount?: number;
  /** How many cards to add per scroll batch (default 6) */
  batchSize?: number;
}

/* ── Sentinel — triggers next batch when it enters viewport ────────────── */
function LoadMoreSentinel({ onVisible }: { onVisible: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { onVisible(); obs.disconnect(); } },
      { rootMargin: "300px 0px", threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [onVisible]);
  return <div ref={ref} style={{ height: 1, gridColumn: "1/-1" }} />;
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
  initialCount = 6,
  batchSize = 6,
}: IphoneImageGridProps) {
  const defaultGridClass = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3";

  // Start as true (assume mobile) so SSR and first client render agree.
  // useEffect immediately corrects to actual screen size.
  // Previously was useState(null) causing SSR→client mismatch → React bail-out.
  const [isMobile, setIsMobile] = useState(true);
  const [visibleCount, setVisibleCount] = useState(initialCount);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const h = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  const loadMore = useCallback(() => {
    setVisibleCount(c => Math.min(c + batchSize, images.length));
  }, [batchSize, images.length]);

  // How many to actually render — progressive on mobile, all on desktop
  const renderCount = isMobile ? visibleCount : images.length;

  const visibleImages = images.slice(0, renderCount);
  const hasMore = isMobile && renderCount < images.length;

  return (
    <div className={gridClassName ?? defaultGridClass} style={gridStyle}>
      {visibleImages.map((img, idx) => {
        const isPremium = img.tags.includes("badge-premium");
        const isNew     = img.tags.includes("badge-new");
        const showVault = isPremium && isLockedGlobal;

        return (
            <Link
              key={img.id}
              href={`${hrefPrefix}/${img.slug}`}
              style={{
                position: "relative",
                display: "block",
                overflow: "hidden",
                borderRadius: "8px",
                backgroundColor: "#0e0d1a",
                border: "1px solid rgba(255,255,255,0.06)",
                aspectRatio,
              }}
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
                  className="object-cover"
                  sizes={sizes}
                  priority={priority || idx < priorityCount}
                  loading={priority || idx < priorityCount ? "eager" : "lazy"}
                />
              )}

              {/* ── HEART / FAVORITE button — always visible top-right ── */}
              {!showVault && (
                <HeartBtn
                  slug={img.slug}
                  title={img.title}
                  thumb={img.src}
                  href={`${hrefPrefix}/${img.slug}`}
                  device={hrefPrefix.replace("/", "")}
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
        );
      })}

      {/* ── Load-more sentinel — fires when user scrolls near bottom of loaded cards ── */}
      {hasMore && (
        <>
          <LoadMoreSentinel onVisible={loadMore} />
          {/* Ghost skeleton cards so the page doesn't jump */}
          {Array.from({ length: Math.min(batchSize, images.length - renderCount) }).map((_, i) => (
            <div
              key={`skel-${i}`}
              style={{
                aspectRatio,
                borderRadius: 8,
                background: "#0e0d1a",
                border: "1px solid rgba(255,255,255,0.04)",
                overflow: "hidden",
              }}
            >
              <div style={{
                width: "100%",
                height: "100%",
                background: "linear-gradient(90deg, #0c0a18 0px, rgba(255,255,255,0.03) 50%, #0c0a18 100%)",
                backgroundSize: "200% 100%",
              }} />
            </div>
          ))}
        </>
      )}
    </div>
  );
}