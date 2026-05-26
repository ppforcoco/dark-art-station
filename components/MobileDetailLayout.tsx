"use client";

/**
 * MobileDetailLayout.tsx — FULLY SELF-CONTAINED mobile detail page
 *
 * Fixes vs previous version:
 *  ✓ Prev/Next thumbnails: 28×50px (9:16) — tiny but correct ratio
 *  ✓ "More you'll like": 44×78px (9:16) — small, correct ratio
 *  ✓ "Recently Viewed": 36×64px (9:16) — tiny, correct ratio
 *  ✓ All images load on scroll via IntersectionObserver
 *  ✓ Zero animations
 *  ✓ Only renders on ≤767px viewports
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
  "badge-premium":   { label: "⭐ Premium",   color: "#c9a84c", bg: "rgba(201,168,76,0.12)"  },
  "badge-trending":  { label: "🔥 Trending",  color: "#ff6b35", bg: "rgba(255,107,53,0.12)"  },
  "badge-hot":       { label: "💀 Hot",        color: "#e040fb", bg: "rgba(224,64,251,0.12)"  },
  "badge-exclusive": { label: "🌙 Exclusive",  color: "#42a5f5", bg: "rgba(66,165,245,0.12)"  },
  "badge-limited":   { label: "⏳ Limited",    color: "#ff5252", bg: "rgba(255,82,82,0.12)"   },
  "badge-new":       { label: "✦ New",         color: "#4caf50", bg: "rgba(76,175,80,0.12)"   },
};

/* ─── LazyImg ─────────────────────────────────────────────────────────────
 * Pure <img> with IntersectionObserver lazy loading.
 * No Next/Image — avoids optimizer overhead for tiny thumbnails.
 * -------------------------------------------------------------------------- */

interface LazyImgProps {
  src: string;
  alt: string;
  style?: React.CSSProperties;
  priority?: boolean;
}

function LazyImg({ src, alt, style, priority = false }: LazyImgProps) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = ref.current;
    if (!img) return;

    const doLoad = () => { img.src = src; };

    if (priority) { doLoad(); return; }

    const rect = img.getBoundingClientRect();
    if (rect.top < window.innerHeight + 300) { doLoad(); return; }

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { doLoad(); observer.disconnect(); } },
      { rootMargin: "300px 0px", threshold: 0 }
    );
    observer.observe(img);
    return () => observer.disconnect();
  }, [src, priority]);

  useEffect(() => {
    const img = ref.current;
    if (img?.complete && img.naturalWidth > 0) setLoaded(true);
  });

  return (
    <img
      ref={ref}
      alt={alt}
      onLoad={() => setLoaded(true)}
      onError={() => setLoaded(true)}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        objectFit: "cover",
        opacity: loaded ? 1 : 0,
        transition: "opacity 0.12s ease",
        ...style,
      }}
    />
  );
}

/* ─── Thumb helper ────────────────────────────────────────────────────────── 
 * Renders a thumbnail box with explicit width/height maintaining ratio.
 * ratio: "portrait" = 9:16, "landscape" = 16:9
 * -------------------------------------------------------------------------- */

interface ThumbProps {
  src: string;
  alt: string;
  width: number;        // px
  ratio?: "portrait" | "landscape";
  priority?: boolean;
  href?: string;
  devicePath?: string;
}

function Thumb({ src, alt, width, ratio = "portrait", priority = false, href, devicePath = "iphone" }: ThumbProps) {
  const height = ratio === "portrait"
    ? Math.round(width * (16 / 9))
    : Math.round(width * (9 / 16));

  const box = (
    <div style={{
      position: "relative",
      width,
      height,
      flexShrink: 0,
      overflow: "hidden",
      borderRadius: ratio === "landscape" ? 4 : 5,
      border: "1px solid rgba(255,255,255,0.09)",
      background: "#111",
    }}>
      <LazyImg src={src} alt={alt} priority={priority} />
    </div>
  );

  if (href) {
    return (
      <Link href={href} prefetch={false} style={{ textDecoration: "none", flexShrink: 0, display: "block" }}>
        {box}
      </Link>
    );
  }
  return box;
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */

const S = {
  root: {
    backgroundColor: "#090909",
    color: "#e0e0e0",
    minHeight: "100dvh",
    fontFamily: "'Space Mono', 'Courier New', monospace",
  } as React.CSSProperties,

  prevNext: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "6px 8px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    gap: 6,
    background: "#0a0a0a",
    position: "sticky",
    top: 0,
    zIndex: 10,
  } as React.CSSProperties,

  prevNextItem: (align: "left" | "right"): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: 6,
    textDecoration: "none",
    color: "rgba(255,255,255,0.4)",
    fontSize: "0.52rem",
    letterSpacing: "0.07em",
    flex: 1,
    minWidth: 0,
    justifyContent: align === "right" ? "flex-end" : "flex-start",
  }),

  prevNextLabel: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 44,
    fontSize: "0.48rem",
    color: "rgba(255,255,255,0.28)",
  } as React.CSSProperties,

  gridBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 30,
    height: 30,
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 4,
    color: "rgba(255,255,255,0.3)",
    textDecoration: "none",
    fontSize: "0.7rem",
    flexShrink: 0,
  } as React.CSSProperties,

  body: {
    padding: "12px 12px 56px",
    display: "flex",
    flexDirection: "column",
    gap: 11,
  } as React.CSSProperties,

  heroWrap: {
    width: "100%",
    aspectRatio: "9/16",
    position: "relative",
    overflow: "hidden",
    borderRadius: 10,
    background: "#111",
    border: "1px solid rgba(255,255,255,0.08)",
  } as React.CSSProperties,

  btnRow: {
    display: "flex",
    gap: 8,
  } as React.CSSProperties,

  btn: (variant: "primary" | "ghost"): React.CSSProperties => ({
    flex: 1,
    padding: "10px 0",
    fontSize: "0.62rem",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    fontFamily: "inherit",
    fontWeight: 700,
    border: variant === "primary" ? "none" : "1px solid rgba(255,255,255,0.12)",
    borderRadius: 3,
    cursor: "pointer",
    background: variant === "primary" ? "#8b0000" : "rgba(255,255,255,0.03)",
    color: variant === "primary" ? "#fff" : "rgba(255,255,255,0.5)",
  }),

  favRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "2px 0",
  } as React.CSSProperties,

  favBtn: (active: boolean): React.CSSProperties => ({
    background: "none",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 3,
    padding: "5px 10px",
    fontSize: "0.65rem",
    cursor: "pointer",
    color: active ? "#ff5252" : "rgba(255,255,255,0.3)",
    fontFamily: "inherit",
  }),

  favLabel: {
    fontSize: "0.5rem",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.22)",
  } as React.CSSProperties,

  stripWrap: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 6,
    paddingTop: 10,
    borderTop: "1px solid rgba(255,255,255,0.06)",
  } as React.CSSProperties,

  stripLabel: {
    fontSize: "0.42rem",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.2)",
    margin: 0,
  } as React.CSSProperties,

  hscroll: {
    display: "flex",
    gap: 5,
    overflowX: "auto" as const,
    scrollbarWidth: "none" as const,
    paddingBottom: 2,
  } as React.CSSProperties,

  title: {
    fontSize: "clamp(0.95rem, 4vw, 1.2rem)",
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
    fontSize: "0.5rem",
    padding: "2px 6px",
    letterSpacing: "0.07em",
    fontFamily: "inherit",
    border: `1px solid ${color}`,
    background: bg,
    color,
    borderRadius: 2,
  }),

  dlCount: {
    fontSize: "0.46rem",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.16)",
    margin: 0,
  } as React.CSSProperties,

  tagsSection: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 5,
  } as React.CSSProperties,

  tagsLabel: {
    fontSize: "0.42rem",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.18)",
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
    fontSize: "0.5rem",
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    textDecoration: "none",
    color: "rgba(190,190,190,0.5)",
    border: "1px solid rgba(200,200,200,0.07)",
    background: "rgba(255,255,255,0.01)",
  } as React.CSSProperties,

  desc: {
    fontSize: "clamp(0.68rem, 2.8vw, 0.8rem)",
    lineHeight: 1.65,
    color: "rgba(200,200,200,0.55)",
  } as React.CSSProperties,

  divider: {
    height: 1,
    background: "rgba(255,255,255,0.05)",
    margin: "1px 0",
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
  const [previewing, setPreviewing] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
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
      a.click();
    } finally {
      setTimeout(() => setDownloading(false), 1500);
    }
  }, [downloading, image.fullUrl, image.slug]);

  const handlePreview = useCallback(() => {
    window.open(image.fullUrl, "_blank", "noopener");
    setPreviewing(true);
    setTimeout(() => setPreviewing(false), 1000);
  }, [image.fullUrl]);

  const handleFavorite = useCallback(() => setFavorited(f => !f), []);

  if (!isMobile) return null;

  const badges = image.tags.filter(t => t.startsWith("badge-"));
  const plainTags = image.tags.filter(t => !t.startsWith("badge-"));
  const dp = deviceType;

  return (
    <div style={S.root}>
      <style>{`
        .mdl-desc * { font-size: inherit !important; }
        .mdl-desc p { margin: 0 0 0.5em; }
        .mdl-desc p:last-child { margin-bottom: 0; }
        .mdl-desc a { color: #8b0000; }
        .mdl-desc strong, .mdl-desc b { color: #e8e8e8; font-weight: 600; }
        .mdl-desc ul, .mdl-desc ol { padding-left: 1rem; margin: 0 0 0.5em; }
        .mdl-desc h1, .mdl-desc h2, .mdl-desc h3 {
          font-size: 0.8rem !important; font-weight: 700;
          color: #e0e0e0; margin: 0.6em 0 0.3em;
        }
        .mdl-hscroll::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ── Prev / Next sticky strip ── */}
      {/* Portrait thumbnails: 28px wide × 50px tall (≈9:16) */}
      <div style={S.prevNext}>
        {prevImage ? (
          <Link href={`/${dp}/${prevImage.slug}`} style={S.prevNextItem("left")} prefetch={false}>
            <Thumb src={prevImage.thumbUrl} alt={prevImage.title} width={28} ratio="portrait" />
            <span style={S.prevNextLabel}>‹ Prev</span>
          </Link>
        ) : <div style={{ flex: 1 }} />}

        <Link href={`/${dp}`} style={S.gridBtn} aria-label="All wallpapers">⊞</Link>

        {nextImage ? (
          <Link href={`/${dp}/${nextImage.slug}`} style={S.prevNextItem("right")} prefetch={false}>
            <span style={S.prevNextLabel}>Next ›</span>
            <Thumb src={nextImage.thumbUrl} alt={nextImage.title} width={28} ratio="portrait" />
          </Link>
        ) : <div style={{ flex: 1 }} />}
      </div>

      {/* ── Main body ── */}
      <div style={S.body}>

        {/* Hero wallpaper — full width 9:16 */}
        <div style={S.heroWrap}>
          <LazyImg src={image.thumbUrl} alt={image.title} priority />
        </div>

        {/* Download count */}
        {image.downloadCount !== undefined && (
          <p style={S.dlCount}>↓ {image.downloadCount.toLocaleString()} downloads</p>
        )}

        {/* Action buttons */}
        <div style={S.btnRow}>
          <button style={S.btn("primary")} onClick={handleDownload} disabled={downloading}>
            {downloading ? "Saving…" : "↓ Download"}
          </button>
          <button style={S.btn("ghost")} onClick={handlePreview} disabled={previewing}>
            {previewing ? "Opening…" : "⤢ Preview"}
          </button>
        </div>

        {/* Favorites */}
        <div style={S.favRow}>
          <button style={S.favBtn(favorited)} onClick={handleFavorite} aria-label="Toggle favorite">
            {favorited ? "♥ Saved" : "♡ Save"}
          </button>
          <span style={S.favLabel}>Add to Favorites</span>
        </div>

        {/* More you'll like — 44×78px (9:16) */}
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
                  ratio="portrait"
                  href={`/${dp}/${img.slug}`}
                  devicePath={dp}
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
                <a key={tag} href={`/${dp}?tag=${encodeURIComponent(tag)}`} style={S.tag}>#{tag}</a>
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

        {/* Recently Viewed — 36×64px (9:16) */}
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
                  ratio="portrait"
                  href={`/${dp}/${img.slug}`}
                  devicePath={dp}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}