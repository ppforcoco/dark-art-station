"use client";

/**
 * MobileDetailLayout.tsx — LIGHTNING FAST mobile detail page
 *
 * Fixes in this version:
 *  ✓ ZERO animations — instant everything
 *  ✓ Heart/fav button is reachable — no z-index clashes with nav/bottom bar
 *  ✓ Prev/Next strip: 28×50px portrait thumbnails, instant tap
 *  ✓ "More you'll like": 44×78px portrait, lazy via IntersectionObserver
 *  ✓ "Recently Viewed": 36×64px portrait, lazy via IntersectionObserver
 *  ✓ All images: native lazy loading + IntersectionObserver — nothing blocks paint
 *  ✓ Only renders on ≤767px — SSR returns null
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

/* ─── Types ─────────────────────────────────────────────────────────────── */

export interface MobileImage {
  id: string;
  slug: string;
  title: string;
  thumbUrl: string;
  fullUrl: string;
  displayDescription: string;
  tags: string[];
  downloadCount?: number;
  isFavorited?: boolean;
  commentsEnabled?: boolean;
}

export interface MobileSibling {
  slug: string;
  title: string;
  thumbUrl: string;
}

interface Props {
  image: MobileImage;
  prevImage: MobileSibling | null;
  nextImage: MobileSibling | null;
  relatedImages: MobileSibling[];
  recentlyViewed?: MobileSibling[];
  deviceType?: "iphone" | "android" | "pc";
}

/* ─── Badge config ───────────────────────────────────────────────────────── */

const BADGE_MAP: Record<string, { label: string; color: string; bg: string }> = {
  "badge-premium":   { label: "⭐ Premium",  color: "#c9a84c", bg: "rgba(201,168,76,0.12)"  },
  "badge-trending":  { label: "🔥 Trending", color: "#ff6b35", bg: "rgba(255,107,53,0.12)"  },
  "badge-hot":       { label: "💀 Hot",       color: "#e040fb", bg: "rgba(224,64,251,0.12)"  },
  "badge-exclusive": { label: "🌙 Exclusive", color: "#42a5f5", bg: "rgba(66,165,245,0.12)"  },
  "badge-limited":   { label: "⏳ Limited",   color: "#ff5252", bg: "rgba(255,82,82,0.12)"   },
  "badge-new":       { label: "✦ New",        color: "#4caf50", bg: "rgba(76,175,80,0.12)"   },
};

/* ─── LazyImg ─────────────────────────────────────────────────────────────
 * Zero-overhead lazy image. Uses native loading="lazy" + IntersectionObserver
 * fallback. No opacity animation — instant paint once loaded.
 * -------------------------------------------------------------------------- */

interface LazyImgProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  style?: React.CSSProperties;
}

function LazyImg({ src, alt, width, height, priority = false, style }: LazyImgProps) {
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = ref.current;
    if (!img || img.src === src) return;
    if (priority) { img.src = src; return; }

    // Already in viewport → load immediately
    const rect = img.getBoundingClientRect();
    if (rect.top < window.innerHeight + 200) { img.src = src; return; }

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { img.src = src; observer.disconnect(); } },
      { rootMargin: "200px 0px", threshold: 0 }
    );
    observer.observe(img);
    return () => observer.disconnect();
  }, [src, priority]);

  return (
    <img
      ref={ref}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        objectFit: "cover",
        /* NO opacity transition — instant display, no layout shift */
        ...style,
      }}
    />
  );
}

/* ─── Thumb ───────────────────────────────────────────────────────────────
 * Tiny portrait thumbnail (9:16). Pixel-exact sizing, no wasted bytes.
 * -------------------------------------------------------------------------- */

interface ThumbProps {
  src: string;
  alt: string;
  width: number;  // px
  priority?: boolean;
  href?: string;
}

function Thumb({ src, alt, width, priority = false, href }: ThumbProps) {
  const height = Math.round(width * (16 / 9));

  const box = (
    <div style={{
      width,
      height,
      flexShrink: 0,
      overflow: "hidden",
      borderRadius: 4,
      border: "1px solid rgba(255,255,255,0.08)",
      background: "#0f0f0f",
      display: "block",
    }}>
      <LazyImg src={src} alt={alt} width={width} height={height} priority={priority} />
    </div>
  );

  if (!href) return box;
  return (
    <Link
      href={href}
      prefetch={false}
      style={{ textDecoration: "none", flexShrink: 0, display: "block" }}
    >
      {box}
    </Link>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */

const S = {
  root: {
    backgroundColor: "#090909",
    color: "#e0e0e0",
    minHeight: "100dvh",
    fontFamily: "'Space Mono', 'Courier New', monospace",
    /* FIX: this component never sets z-index on itself — it stays in normal flow.
       The nav (z:600) and bottom bar (z:650) sit above, but because this component
       has no position:fixed children that clash, the heart button is fully tappable. */
  } as React.CSSProperties,

  /* FIX: prev/next bar — z:10 only, never fights with nav (z:600) */
  prevNext: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "6px 8px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    gap: 6,
    background: "#0a0a0a",
    position: "sticky",
    /* top equals nav height (~56px) so it sticks below the nav bar */
    top: "56px",
    zIndex: 10,
  } as React.CSSProperties,

  prevNextItem: (align: "left" | "right"): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: 5,
    textDecoration: "none",
    color: "rgba(255,255,255,0.35)",
    fontSize: "0.5rem",
    letterSpacing: "0.06em",
    flex: 1,
    minWidth: 0,
    justifyContent: align === "right" ? "flex-end" : "flex-start",
    /* min tap target */
    minHeight: 44,
    padding: "0 4px",
  }),

  prevNextLabel: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 48,
    fontSize: "0.46rem",
    color: "rgba(255,255,255,0.25)",
  } as React.CSSProperties,

  gridBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 4,
    color: "rgba(255,255,255,0.28)",
    textDecoration: "none",
    fontSize: "0.72rem",
    flexShrink: 0,
  } as React.CSSProperties,

  body: {
    /* FIX: paddingBottom = bottom nav height (64px) + safe area + extra.
       This ensures heart/fav button is never obscured by the bottom nav bar. */
    padding: "12px 12px 80px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  } as React.CSSProperties,

  heroWrap: {
    width: "100%",
    aspectRatio: "9/16",
    position: "relative",
    overflow: "hidden",
    borderRadius: 8,
    background: "#111",
    border: "1px solid rgba(255,255,255,0.06)",
  } as React.CSSProperties,

  btnRow: {
    display: "flex",
    gap: 8,
  } as React.CSSProperties,

  btn: (variant: "primary" | "ghost"): React.CSSProperties => ({
    flex: 1,
    padding: "11px 0",
    fontSize: "0.6rem",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    fontFamily: "inherit",
    fontWeight: 700,
    border: variant === "primary" ? "none" : "1px solid rgba(255,255,255,0.1)",
    borderRadius: 3,
    cursor: "pointer",
    background: variant === "primary" ? "#8b0000" : "rgba(255,255,255,0.03)",
    color: variant === "primary" ? "#fff" : "rgba(255,255,255,0.45)",
    /* no transition — instant response */
    WebkitTapHighlightColor: "transparent",
    touchAction: "manipulation",
    minHeight: 44,
  }),

  /* FIX: favRow has explicit position:relative + z:1 — sits in normal flow.
     No fixed/sticky positioning, so it never battles the nav or bottom bar. */
  favRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "4px 0",
    position: "relative",
    zIndex: 1,
  } as React.CSSProperties,

  favBtn: (active: boolean): React.CSSProperties => ({
    background: "none",
    border: `1px solid ${active ? "rgba(255,82,82,0.5)" : "rgba(255,255,255,0.1)"}`,
    borderRadius: 3,
    padding: "0 14px",
    fontSize: "0.65rem",
    cursor: "pointer",
    color: active ? "#ff5252" : "rgba(255,255,255,0.28)",
    fontFamily: "inherit",
    /* FIX: min tap target — this was getting clipped by bottom nav */
    minHeight: 44,
    minWidth: 80,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    WebkitTapHighlightColor: "transparent",
    touchAction: "manipulation",
  }),

  favLabel: {
    fontSize: "0.48rem",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.2)",
  } as React.CSSProperties,

  stripWrap: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 5,
    paddingTop: 10,
    borderTop: "1px solid rgba(255,255,255,0.05)",
  } as React.CSSProperties,

  stripLabel: {
    fontSize: "0.4rem",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.18)",
    margin: 0,
  } as React.CSSProperties,

  hscroll: {
    display: "flex",
    gap: 5,
    overflowX: "auto" as const,
    scrollbarWidth: "none" as const,
    paddingBottom: 2,
    WebkitOverflowScrolling: "touch",
  } as React.CSSProperties,

  title: {
    fontSize: "clamp(0.9rem, 4vw, 1.15rem)",
    fontWeight: 700,
    lineHeight: 1.2,
    margin: 0,
    letterSpacing: "0.01em",
    color: "#f0f0f0",
    fontFamily: "'Space Mono', monospace",
  } as React.CSSProperties,

  badgesRow: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 4,
  } as React.CSSProperties,

  badge: (color: string, bg: string): React.CSSProperties => ({
    fontSize: "0.48rem",
    padding: "2px 6px",
    letterSpacing: "0.07em",
    fontFamily: "inherit",
    border: `1px solid ${color}`,
    background: bg,
    color,
    borderRadius: 2,
  }),

  dlCount: {
    fontSize: "0.44rem",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.15)",
    margin: 0,
  } as React.CSSProperties,

  tagsSection: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 5,
  } as React.CSSProperties,

  tagsLabel: {
    fontSize: "0.4rem",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.16)",
    margin: 0,
  } as React.CSSProperties,

  tagsList: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 4,
  } as React.CSSProperties,

  tag: {
    display: "inline-block",
    padding: "2px 6px",
    borderRadius: 2,
    fontFamily: "inherit",
    fontSize: "0.48rem",
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    textDecoration: "none",
    color: "rgba(180,180,180,0.45)",
    border: "1px solid rgba(200,200,200,0.07)",
    background: "rgba(255,255,255,0.01)",
  } as React.CSSProperties,

  desc: {
    fontSize: "clamp(0.65rem, 2.6vw, 0.78rem)",
    lineHeight: 1.65,
    color: "rgba(200,200,200,0.5)",
  } as React.CSSProperties,

  divider: {
    height: 1,
    background: "rgba(255,255,255,0.04)",
    margin: "2px 0",
  } as React.CSSProperties,
};

/* ─── Component ─────────────────────────────────────────────────────────── */

export default function MobileDetailLayout({
  image,
  prevImage,
  nextImage,
  relatedImages,
  recentlyViewed = [],
  deviceType = "iphone",
}: Props) {
  const [isMobile, setIsMobile] = useState(false);
  const [favorited, setFavorited] = useState(image.isFavorited ?? false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    // Check on mount
    setIsMobile(window.matchMedia("(max-width: 767px)").matches);
    const mq = window.matchMedia("(max-width: 767px)");
    const h = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  const handleDownload = useCallback(async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const a = document.createElement("a");
      a.href = image.fullUrl;
      a.download = `${image.slug}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setTimeout(() => setDownloading(false), 1200);
    }
  }, [downloading, image.fullUrl, image.slug]);

  const handlePreview = useCallback(() => {
    window.open(image.fullUrl, "_blank", "noopener,noreferrer");
  }, [image.fullUrl]);

  const handleFavorite = useCallback(() => setFavorited(f => !f), []);

  // Server-side: don't render (mobile-only component)
  if (!isMobile) return null;

  const badges = image.tags.filter(t => t.startsWith("badge-"));
  const plainTags = image.tags.filter(t => !t.startsWith("badge-"));
  const dp = deviceType;

  return (
    <div style={S.root}>
      <style>{`
        /* Description rich text */
        .mdl-desc * { font-size: inherit !important; }
        .mdl-desc p { margin: 0 0 0.5em; }
        .mdl-desc p:last-child { margin-bottom: 0; }
        .mdl-desc a { color: #8b0000; text-decoration: none; }
        .mdl-desc strong, .mdl-desc b { color: #e8e8e8; font-weight: 600; }
        .mdl-desc ul, .mdl-desc ol { padding-left: 1rem; margin: 0 0 0.5em; }
        .mdl-desc h1, .mdl-desc h2, .mdl-desc h3 {
          font-size: 0.8rem !important;
          font-weight: 700;
          color: #e0e0e0;
          margin: 0.6em 0 0.3em;
        }
        /* Hide scrollbars on horizontal strips */
        .mdl-hscroll::-webkit-scrollbar { display: none; }
        .mdl-hscroll { -ms-overflow-style: none; scrollbar-width: none; }
        /* Tap states — instant, no delay */
        .mdl-prev-next-link:active { opacity: 0.6; }
        .mdl-thumb-link:active { opacity: 0.7; }
        /* FIX: remove any global cursor:none or custom cursors that were
           clashing and blocking the heart button area */
        .mdl-fav-btn { cursor: pointer !important; pointer-events: auto !important; }
      `}</style>

      {/* ── Prev / Next sticky strip (sticks below nav bar) ── */}
      <div style={S.prevNext}>
        {prevImage ? (
          <Link
            href={`/${dp}/${prevImage.slug}`}
            style={S.prevNextItem("left")}
            prefetch={false}
            className="mdl-prev-next-link"
          >
            <Thumb src={prevImage.thumbUrl} alt={prevImage.title} width={28} priority={false} />
            <span style={S.prevNextLabel}>‹ Prev</span>
          </Link>
        ) : <div style={{ flex: 1 }} />}

        <Link href={`/${dp}`} style={S.gridBtn} aria-label="All wallpapers">⊞</Link>

        {nextImage ? (
          <Link
            href={`/${dp}/${nextImage.slug}`}
            style={S.prevNextItem("right")}
            prefetch={false}
            className="mdl-prev-next-link"
          >
            <span style={S.prevNextLabel}>Next ›</span>
            <Thumb src={nextImage.thumbUrl} alt={nextImage.title} width={28} priority={false} />
          </Link>
        ) : <div style={{ flex: 1 }} />}
      </div>

      {/* ── Main body ── */}
      <div style={S.body}>

        {/* Hero wallpaper — full width 9:16 */}
        <div style={S.heroWrap}>
          <LazyImg src={image.thumbUrl} alt={image.title} priority={true} />
        </div>

        {/* Download count */}
        {image.downloadCount !== undefined && (
          <p style={S.dlCount}>↓ {image.downloadCount.toLocaleString()} downloads</p>
        )}

        {/* Action buttons */}
        <div style={S.btnRow}>
          <button
            style={S.btn("primary")}
            onClick={handleDownload}
            disabled={downloading}
            type="button"
          >
            {downloading ? "Saving…" : "↓ Download"}
          </button>
          <button
            style={S.btn("ghost")}
            onClick={handlePreview}
            type="button"
          >
            ⤢ Preview
          </button>
        </div>

        {/* ── FAVORITES — FIX: isolated in its own flex row, z:1, min tap target 44px ── */}
        <div style={S.favRow}>
          <button
            style={S.favBtn(favorited)}
            onClick={handleFavorite}
            aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
            aria-pressed={favorited}
            type="button"
            className="mdl-fav-btn"
          >
            {favorited ? "♥ Saved" : "♡ Save"}
          </button>
          <span style={S.favLabel}>Add to Favorites</span>
        </div>

        {/* More you'll like — 44×78px (9:16), lazy */}
        {relatedImages.length > 0 && (
          <div style={S.stripWrap}>
            <p style={S.stripLabel}>More You&apos;ll Like</p>
            <div className="mdl-hscroll" style={S.hscroll}>
              {relatedImages.map(img => (
                <Thumb
                  key={img.slug}
                  src={img.thumbUrl}
                  alt={img.title}
                  width={44}
                  href={`/${dp}/${img.slug}`}
                />
              ))}
            </div>
          </div>
        )}

        <div style={S.divider} />

        {/* Title */}
        <h1 style={S.title}>{image.title}</h1>

        {/* Badges */}
        {badges.length > 0 && (
          <div style={S.badgesRow}>
            {badges.map(tag => {
              const b = BADGE_MAP[tag];
              if (!b) return null;
              return <span key={tag} style={S.badge(b.color, b.bg)}>{b.label}</span>;
            })}
          </div>
        )}

        {/* Tags */}
        {plainTags.length > 0 && (
          <div style={S.tagsSection}>
            <p style={S.tagsLabel}>More Like This</p>
            <div style={S.tagsList}>
              {plainTags.map(tag => (
                <a key={tag} href={`/${dp}?tag=${encodeURIComponent(tag)}`} style={S.tag}>
                  #{tag}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div
          className="mdl-desc"
          style={S.desc}
          dangerouslySetInnerHTML={{ __html: image.displayDescription }}
        />

        <div style={S.divider} />

        {/* Recently Viewed — 36×64px (9:16), lazy */}
        {recentlyViewed.length > 0 && (
          <div style={S.stripWrap}>
            <p style={S.stripLabel}>Recently Viewed</p>
            <div className="mdl-hscroll" style={S.hscroll}>
              {recentlyViewed.map(img => (
                <Thumb
                  key={img.slug}
                  src={img.thumbUrl}
                  alt={img.title}
                  width={36}
                  href={`/${dp}/${img.slug}`}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}