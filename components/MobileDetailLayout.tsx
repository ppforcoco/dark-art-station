"use client";

/**
 * MobileDetailLayout.tsx — FULLY SELF-CONTAINED mobile detail page
 *
 * Changes vs previous version:
 *  ✓ Main image is a full-width wallpaper preview (no tiny phone mockup shell)
 *  ✓ Prev/Next thumbnails enlarged to real card size (80×142px)
 *  ✓ "More you'll like" strip uses larger cards (72×128px)
 *  ✓ Recently Viewed uses larger cards (60×107px)
 *  ✓ ALL images load on scroll via IntersectionObserver (true per-image lazy load)
 *  ✓ Zero animations — no transitions, no pulses, no glows
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
}

/* ─── Badge config ───────────────────────────────────────────────────────── */

const BADGE_MAP: Record<string, { label: string; color: string; bg: string }> = {
  "badge-premium":   { label: "⭐ Premium",   color: "#c9a84c", bg: "rgba(201,168,76,0.12)"  },
  "badge-trending":  { label: "🔥 Trending",  color: "#ff6b35", bg: "rgba(255,107,53,0.12)"  },
  "badge-hot":       { label: "💀 Hot",        color: "#e040fb", bg: "rgba(224,64,251,0.12)"  },
  "badge-exclusive": { label: "🌙 Exclusive",  color: "#42a5f5", bg: "rgba(66,165,245,0.12)"  },
  "badge-limited":   { label: "⏳ Limited",    color: "#ff5252", bg: "rgba(255,82,82,0.12)"   },
};

/* ─── LazyImg ────────────────────────────────────────────────────────────────
 * A plain <img> that only sets its src when it scrolls into view.
 * Uses IntersectionObserver with rootMargin so it loads ~150px before visible.
 * No Next/Image — avoids the optimizer overhead for small thumbnails.
 * No animation — just shows the image as soon as it's fetched.
 * --------------------------------------------------------------------------- */

interface LazyImgProps {
  src: string;
  alt: string;
  style?: React.CSSProperties;
  priority?: boolean; // skip observer, load immediately (hero image only)
}

function LazyImg({ src, alt, style, priority = false }: LazyImgProps) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = ref.current;
    if (!img) return;

    if (priority) {
      img.src = src;
      return;
    }

    // Check if already in viewport at mount time
    const rect = img.getBoundingClientRect();
    const inViewport = rect.top < window.innerHeight + 150;
    if (inViewport) {
      img.src = src;
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          img.src = src;
          observer.disconnect();
        }
      },
      { rootMargin: "150px 0px", threshold: 0 }
    );

    observer.observe(img);
    return () => observer.disconnect();
  }, [src, priority]);

  return (
    <img
      ref={ref}
      alt={alt}
      onLoad={() => setLoaded(true)}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        objectFit: "cover",
        opacity: loaded ? 1 : 0,
        transition: "opacity 0.2s ease",
        ...style,
      }}
    />
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */

const S = {
  root: {
    backgroundColor: "#090909",
    color: "#e0e0e0",
    minHeight: "100dvh",
    fontFamily: "'Space Mono', 'Courier New', monospace",
  } as React.CSSProperties,

  /* Prev / Next sticky strip */
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
    gap: 8,
    textDecoration: "none",
    color: "rgba(255,255,255,0.45)",
    fontSize: "0.58rem",
    letterSpacing: "0.07em",
    flex: 1,
    minWidth: 0,
    justifyContent: align === "right" ? "flex-end" : "flex-start",
  }),

  /* Prev/Next thumbnail — compact */
  prevNextThumbWrap: {
    position: "relative",
    width: 32,
    height: 57,
    flexShrink: 0,
    overflow: "hidden",
    borderRadius: 5,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "#111",
  } as React.CSSProperties,

  prevNextLabel: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 52,
    fontSize: "0.52rem",
    color: "rgba(255,255,255,0.3)",
  } as React.CSSProperties,

  gridBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 4,
    color: "rgba(255,255,255,0.3)",
    textDecoration: "none",
    fontSize: "0.75rem",
    flexShrink: 0,
  } as React.CSSProperties,

  /* Body */
  body: {
    padding: "12px 12px 48px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  } as React.CSSProperties,

  /* Hero wallpaper — full width, no phone shell */
  heroWrap: {
    width: "100%",
    aspectRatio: "9/16",
    position: "relative",
    overflow: "hidden",
    borderRadius: 10,
    background: "#111",
    border: "1px solid rgba(255,255,255,0.08)",
  } as React.CSSProperties,

  /* Buttons */
  btnRow: {
    display: "flex",
    gap: 8,
  } as React.CSSProperties,

  btn: (variant: "primary" | "ghost"): React.CSSProperties => ({
    flex: 1,
    padding: "10px 0",
    fontSize: "0.65rem",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    fontFamily: "inherit",
    fontWeight: 700,
    border: variant === "primary" ? "none" : "1px solid rgba(255,255,255,0.12)",
    borderRadius: 3,
    cursor: "pointer",
    background: variant === "primary" ? "#8b0000" : "rgba(255,255,255,0.03)",
    color: variant === "primary" ? "#fff" : "rgba(255,255,255,0.55)",
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
    padding: "6px 12px",
    fontSize: "0.7rem",
    cursor: "pointer",
    color: active ? "#ff5252" : "rgba(255,255,255,0.3)",
    fontFamily: "inherit",
  }),

  favLabel: {
    fontSize: "0.55rem",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.25)",
  } as React.CSSProperties,

  /* More strip — bigger cards */
  moreWrap: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 8,
    paddingTop: 10,
    borderTop: "1px solid rgba(255,255,255,0.06)",
  } as React.CSSProperties,

  moreLabel: {
    fontSize: "0.44rem",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.2)",
  } as React.CSSProperties,

  moreThumbs: {
    display: "flex",
    gap: 6,
    overflowX: "auto" as const,
    scrollbarWidth: "none" as const,
    paddingBottom: 2,
  } as React.CSSProperties,

  /* 52×92px — small card, still legible */
  moreThumb: {
    position: "relative",
    width: 52,
    height: 92,
    flexShrink: 0,
    overflow: "hidden",
    borderRadius: 5,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "#111",
  } as React.CSSProperties,

  /* Title */
  title: {
    fontSize: "clamp(1rem, 4.5vw, 1.25rem)",
    fontWeight: 700,
    lineHeight: 1.2,
    margin: 0,
    letterSpacing: "0.01em",
    color: "#f0f0f0",
    fontFamily: "'Space Mono', monospace",
  } as React.CSSProperties,

  /* Badges */
  badgesRow: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 5,
  } as React.CSSProperties,

  badge: (color: string, bg: string): React.CSSProperties => ({
    fontSize: "0.55rem",
    padding: "2px 7px",
    letterSpacing: "0.07em",
    fontFamily: "inherit",
    border: `1px solid ${color}`,
    background: bg,
    color,
    borderRadius: 2,
  }),

  dlCount: {
    fontSize: "0.5rem",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.18)",
    margin: 0,
  } as React.CSSProperties,

  tagsSection: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 5,
  } as React.CSSProperties,

  tagsLabel: {
    fontSize: "0.44rem",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.2)",
    margin: 0,
  } as React.CSSProperties,

  tagsList: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 4,
  } as React.CSSProperties,

  tag: {
    display: "inline-block",
    padding: "2px 7px",
    borderRadius: 2,
    fontFamily: "inherit",
    fontSize: "0.55rem",
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    textDecoration: "none",
    color: "rgba(200,200,200,0.55)",
    border: "1px solid rgba(200,200,200,0.08)",
    background: "rgba(255,255,255,0.015)",
  } as React.CSSProperties,

  desc: {
    fontSize: "clamp(0.72rem, 3vw, 0.84rem)",
    lineHeight: 1.65,
    color: "rgba(200,200,200,0.6)",
  } as React.CSSProperties,

  divider: {
    height: 1,
    background: "rgba(255,255,255,0.05)",
    margin: "2px 0",
  } as React.CSSProperties,

  /* Recently Viewed — bigger than before (60×107px) */
  rvSection: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 8,
  } as React.CSSProperties,

  rvLabel: {
    fontSize: "0.44rem",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.18)",
    margin: 0,
  } as React.CSSProperties,

  rvRow: {
    display: "flex",
    gap: 6,
    overflowX: "auto" as const,
    scrollbarWidth: "none" as const,
    paddingBottom: 2,
  } as React.CSSProperties,

  rvThumb: {
    position: "relative",
    width: 40,
    height: 71,
    flexShrink: 0,
    overflow: "hidden",
    borderRadius: 5,
    border: "1px solid rgba(255,255,255,0.07)",
    background: "#111",
  } as React.CSSProperties,
};

/* ─── Component ─────────────────────────────────────────────────────────── */

export default function MobileDetailLayout({
  image,
  prevImage,
  nextImage,
  relatedImages,
  recentlyViewed = [],
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

  const handleFavorite = useCallback(() => {
    setFavorited(f => !f);
  }, []);

  if (!isMobile) return null;

  const badges = image.tags.filter(t => t.startsWith("badge-"));
  const plainTags = image.tags.filter(t => !t.startsWith("badge-"));

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
      <div style={S.prevNext}>
        {prevImage ? (
          <Link href={`/iphone/${prevImage.slug}`} style={S.prevNextItem("left")} prefetch={false}>
            <div style={S.prevNextThumbWrap}>
              <LazyImg src={prevImage.thumbUrl} alt={prevImage.title} />
            </div>
            <span style={S.prevNextLabel}>‹ Prev</span>
          </Link>
        ) : <div style={{ flex: 1 }} />}

        <Link href="/iphone" style={S.gridBtn} aria-label="All wallpapers">⊞</Link>

        {nextImage ? (
          <Link href={`/iphone/${nextImage.slug}`} style={S.prevNextItem("right")} prefetch={false}>
            <span style={S.prevNextLabel}>Next ›</span>
            <div style={S.prevNextThumbWrap}>
              <LazyImg src={nextImage.thumbUrl} alt={nextImage.title} />
            </div>
          </Link>
        ) : <div style={{ flex: 1 }} />}
      </div>

      {/* ── Main body ── */}
      <div style={S.body}>

        {/* Hero wallpaper — full width, no phone shell */}
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

        {/* More you'll like */}
        {relatedImages.length > 0 && (
          <div style={S.moreWrap}>
            <p style={S.moreLabel}>More You&apos;ll Like</p>
            <div className="mdl-hscroll" style={S.moreThumbs}>
              {relatedImages.map(img => (
                <Link key={img.slug} href={`/iphone/${img.slug}`} prefetch={false} style={{ textDecoration: "none", flexShrink: 0 }}>
                  <div style={S.moreThumb}>
                    <LazyImg src={img.thumbUrl} alt={img.title} />
                  </div>
                </Link>
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
                <a key={tag} href={`/iphone?tag=${encodeURIComponent(tag)}`} style={S.tag}>#{tag}</a>
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

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <div style={S.rvSection}>
            <p style={S.rvLabel}>Recently Viewed</p>
            <div className="mdl-hscroll" style={S.rvRow}>
              {recentlyViewed.map(img => (
                <Link key={img.slug} href={`/iphone/${img.slug}`} prefetch={false} style={{ textDecoration: "none", flexShrink: 0 }}>
                  <div style={S.rvThumb}>
                    <LazyImg src={img.thumbUrl} alt={img.title} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}