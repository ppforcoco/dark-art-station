// app/matching-wallpapers/page.tsx
// Matching Wallpapers hub — landing page with 2 categories: Best Friends,
// Couples. Mirrors app/avatars/page.tsx exactly: this page does not render
// the raw pair grid itself, it routes into the dedicated tag-filtered
// sub-pages at /matching-wallpapers/best-friends and /matching-wallpapers/couples.

import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import Breadcrumbs from "@/components/Breadcrumbs";

export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";
const DEFAULT_OG_IMAGE = "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/og-image.webp";

const META_TITLE = "Matching Wallpapers for Couples & Best Friends | Free HD Downloads";
const META_DESCRIPTION =
  "Download free matching wallpapers for couples, best friends & colleagues. Cute, aesthetic & funny paired phone backgrounds. Perfect for duos!";

export async function generateMetadata(): Promise<Metadata> {
  // Pull one real matching-wallpaper pair to use as the preview thumbnail
  // instead of the generic branded fallback.
  let ogImage: string = DEFAULT_OG_IMAGE;
  try {
    const latest = await db.image.findFirst({
      where: { isAvatar: false, isAdult: false, matchingGroupId: { not: null } },
      orderBy: { createdAt: "desc" },
      select: { r2Key: true },
    });
    if (latest) ogImage = getPublicUrl(latest.r2Key);
  } catch {
    // fall back silently to DEFAULT_OG_IMAGE
  }

  return {
    title: META_TITLE,
    description: META_DESCRIPTION,
    keywords: [
      "matching wallpapers", "matching wallpapers for best friends", "matching wallpapers for couples",
      "matching wallpapers for besties", "cute matching wallpapers", "matching phone wallpapers",
    ],
    openGraph: {
      title: META_TITLE,
      description: META_DESCRIPTION,
      url: `${SITE_URL}/matching-wallpapers`,
      siteName: "Haunted Wallpapers",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 1200, alt: "Haunted Wallpapers Matching Wallpapers" }],
    },
    twitter: {
      card: "summary_large_image",
      title: META_TITLE,
      description: META_DESCRIPTION,
      images: [ogImage],
    },
    alternates: { canonical: `${SITE_URL}/matching-wallpapers` },
  };
}

// ── Category pill data ──────────────────────────────────────────────────────
// Counts are fetched live below; everything else here is static copy.
// Adding a new pill later (e.g. "colleagues") is just one more entry here +
// one more key in TAG_CONFIGS in app/matching-wallpapers/[tag]/page.tsx.
const CATEGORIES = [
  {
    key: "best-friends",
    href: "/matching-wallpapers/best-friends",
    label: "Best Friends",
    tagline: "One for you. One for your ride-or-die.",
    tagMatch: "best-friends",
  },
  {
    key: "couples",
    href: "/matching-wallpapers/couples",
    label: "Couples",
    tagline: "His and hers, without saying a word.",
    tagMatch: "couples",
  },
] as const;

export default async function MatchingWallpapersHubPage() {
  let counts: Record<string, number> = { "best-friends": 0, "couples": 0 };
  let previews: Record<string, string[]> = { "best-friends": [], "couples": [] };

  try {
    const images = await db.image.findMany({
      where: { isAvatar: false, isAdult: false, matchingGroupId: { not: null } },
      orderBy: { createdAt: "asc" },
      select: { id: true, r2Key: true, tags: true, matchingGroupId: true },
    });

    const bestFriends = images.filter((img) => img.tags.some((t) => t.toLowerCase() === "best-friends"));
    const couples = images.filter((img) => img.tags.some((t) => t.toLowerCase() === "couples"));

    // Count distinct pairs, not individual images (each pair is 2 rows).
    const countPairs = (rows: typeof images) => new Set(rows.map((r) => r.matchingGroupId)).size;

    counts = {
      "best-friends": countPairs(bestFriends),
      "couples": countPairs(couples),
    };
    previews = {
      "best-friends": bestFriends.slice(0, 4).map((img) => getPublicUrl(img.r2Key)),
      "couples": couples.slice(0, 4).map((img) => getPublicUrl(img.r2Key)),
    };
  } catch (err) {
    console.error("[matching-wallpapers/hub] DB error:", err);
  }

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: META_TITLE,
    url: `${SITE_URL}/matching-wallpapers`,
    hasPart: CATEGORIES.map((c) => ({
      "@type": "CollectionPage",
      name: c.label,
      url: `${SITE_URL}${c.href}`,
    })),
  });

  return (
    <main className="hw-mw-hub">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Matching Wallpapers" }]} />

      {/* ── Hero ── */}
      <section className="hw-mw-hero">
        <div className="hw-mw-hero__inner">
          <h1 className="hw-mw-title">Matching Wallpapers for Couples &amp; Best Friends</h1>
        </div>
      </section>

      {/* ── Category pills ── */}
      <section className="hw-mw-categories">
        <div className="hw-mw-categories__grid">
          {CATEGORIES.map((cat) => (
            <Link key={cat.key} href={cat.href} className="hw-mw-pill">
              <div className="hw-mw-pill__previews">
                {previews[cat.key].length > 0 ? (
                  previews[cat.key].map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={src}
                      alt=""
                      className="hw-mw-pill__preview-img"
                      loading={i === 0 ? "eager" : "lazy"}
                    />
                  ))
                ) : (
                  <div className="hw-mw-pill__preview-empty" aria-hidden="true" />
                )}
              </div>

              <div className="hw-mw-pill__body">
                <span className="hw-mw-pill__count">
                  {counts[cat.key]} {counts[cat.key] === 1 ? "pair" : "pairs"}
                </span>
                <h2 className="hw-mw-pill__label">{cat.label}</h2>
                <p className="hw-mw-pill__tagline">{cat.tagline}</p>
                <span className="hw-mw-pill__cta">Browse collection →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Description block ── */}
      <section className="hw-mw-about">
        <div className="hw-mw-about__inner">
          <h2 className="hw-mw-about__headline">Matching wallpapers for duos. Two designs, one connection.</h2>
          <p className="hw-mw-about__text">
            Built for couples, best friends, colleagues, or any two people who want their phones to
            reflect what they share. Each set is made as a pair — meant to be used together, side by side.
          </p>
          <p className="hw-mw-about__text hw-mw-about__text--cta">
            Browse by relationship or style. Download what fits.
          </p>
        </div>
      </section>

      <style>{`
        .hw-mw-hub {
          min-height: 100vh;
          background-color: var(--bg-primary, #0c0b14);
          color: var(--text-primary, #e8e4dc);
        }

        /* ── Hero ── */
        .hw-mw-hero {
          padding: clamp(32px, 6vw, 64px) clamp(20px, 5vw, 60px) 8px;
          max-width: 1280px;
          margin: 0 auto;
        }
        .hw-mw-hero__inner { max-width: 760px; }
        .hw-mw-title {
          font-family: var(--font-display, serif);
          font-size: clamp(1.8rem, 5vw, 3rem);
          font-weight: 700;
          line-height: 1.15;
          margin: 0;
          color: var(--text-primary, #e8e4dc);
        }

        /* ── Category pill grid ── */
        .hw-mw-categories {
          max-width: 1280px;
          margin: 0 auto;
          padding: 32px clamp(16px, 4vw, 60px) 24px;
        }
        .hw-mw-categories__grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        @media (min-width: 640px) {
          .hw-mw-categories__grid { grid-template-columns: repeat(2, 1fr); gap: 24px; }
        }

        .hw-mw-pill {
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: inherit;
          background: #13111e;
          border: 1px solid #2a2535;
          border-radius: 18px;
          overflow: hidden;
          transition: border-color 0.22s ease, transform 0.22s ease, box-shadow 0.22s ease;
        }
        .hw-mw-pill:hover {
          border-color: rgba(236,72,153,0.55);
          box-shadow: 0 0 24px rgba(236,72,153,0.14);
          transform: translateY(-2px);
        }

        .hw-mw-pill__previews {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          grid-template-rows: repeat(2, 1fr);
          gap: 2px;
          aspect-ratio: 16 / 9;
          background: #0a0812;
        }
        .hw-mw-pill__preview-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .hw-mw-pill__preview-empty {
          grid-column: 1 / -1;
          grid-row: 1 / -1;
          background: linear-gradient(135deg, rgba(236,72,153,0.1), rgba(0,0,0,0.2));
        }

        .hw-mw-pill__body {
          padding: 20px 22px 24px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .hw-mw-pill__count {
          font-family: var(--font-space, monospace);
          font-size: 0.62rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #ec4899;
        }
        .hw-mw-pill__label {
          font-family: var(--font-display, serif);
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--text-primary, #e8e4dc);
          margin: 2px 0 4px;
        }
        .hw-mw-pill__tagline {
          color: rgba(232,228,220,0.62);
          font-size: 0.88rem;
          line-height: 1.6;
          margin-bottom: 14px;
        }
        .hw-mw-pill__cta {
          font-family: var(--font-space, monospace);
          font-size: 0.66rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #e8e4dc;
          border-top: 1px solid rgba(255,255,255,0.08);
          padding-top: 14px;
          transition: color 0.2s ease;
        }
        .hw-mw-pill:hover .hw-mw-pill__cta { color: #ec4899; }

        /* ── Description block ── */
        .hw-mw-about {
          max-width: 1280px;
          margin: 0 auto;
          padding: 24px clamp(20px, 5vw, 60px) clamp(56px, 9vw, 96px);
        }
        .hw-mw-about__inner {
          max-width: 720px;
          border-left: 2px solid rgba(236,72,153,0.45);
          padding-left: clamp(16px, 3vw, 28px);
        }
        .hw-mw-about__headline {
          font-family: var(--font-display, serif);
          font-size: clamp(1.15rem, 2.6vw, 1.5rem);
          font-weight: 700;
          line-height: 1.4;
          margin: 0 0 14px;
          color: var(--text-primary, #e8e4dc);
        }
        .hw-mw-about__text {
          color: rgba(232,228,220,0.68);
          font-size: clamp(0.9rem, 1.8vw, 1rem);
          line-height: 1.8;
          margin: 0 0 12px;
        }
        .hw-mw-about__text--cta {
          color: rgba(236,72,153,0.9);
          font-weight: 600;
          margin-bottom: 0;
        }
      `}</style>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
    </main>
  );
}