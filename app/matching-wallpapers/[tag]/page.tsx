// app/matching-wallpapers/[tag]/page.tsx
// Dedicated long-tail category pages: /matching-wallpapers/best-friends and
// /matching-wallpapers/couples. Filters images by the `tags` array (exact,
// case-insensitive match), not by matchingGroupId alone — so a pair only
// shows up here once it's tagged "best-friends" or "couples" in the admin
// panel. Mirrors app/avatars/[tag]/page.tsx.

import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import Breadcrumbs from "@/components/Breadcrumbs";
import MatchingWallpaperCard from "@/components/MatchingWallpaperCard";

export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";
const DEFAULT_OG_IMAGE = "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/og-image.webp";

interface TagConfig {
  slug: string;
  matchKeyword: string; // tag that must exactly equal this (lowercased) for a pair to show up here
  pillLabel: string;
  tagline: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  emptyTitle: string;
  emptyBody: string;
  aboutHeadline: string;
  aboutParagraphs: string[];
}

const TAG_CONFIGS: Record<string, TagConfig> = {
  "best-friends": {
    slug: "best-friends",
    matchKeyword: "best-friends",
    pillLabel: "Best Friends",
    tagline: "One for you. One for your ride-or-die.",
    description:
      "Matching wallpapers made for two best friends — download both, set one each, and your lock screens tell the same story. Cute, aesthetic, and a little dramatic. Exactly how it should be.",
    metaTitle: "Matching Wallpapers for Best Friends 2026 | Free HD Duo Downloads",
    metaDescription:
      "Free matching wallpapers for best friends. Cute, aesthetic paired phone backgrounds — one for you, one for your bestie. Download both in HD.",
    emptyTitle: "Coming soon",
    emptyBody: "New best-friend matching pairs are being tagged and added. Check back shortly.",
    aboutHeadline: "Matching wallpapers for ride-or-dies.",
    aboutParagraphs: [
      "Built for duos who don't need a label to prove it. Each pair is made to be used together — side by side, coast to coast, or across the group chat.",
      "Pick your vibe. Share the screen.",
    ],
  },
  "couples": {
    slug: "couples",
    matchKeyword: "couples",
    pillLabel: "Couples",
    tagline: "His and hers, without saying a word.",
    description:
      "Matching wallpapers built for two — one half for you, one half for them. Set them side by side and it's obvious you're a pair, no caption needed. Free, HD, and made to be downloaded together.",
    metaTitle: "Matching Wallpapers for Couples 2026 | Free HD His & Hers Downloads",
    metaDescription:
      "Free matching wallpapers for couples. Aesthetic his-and-hers phone backgrounds made as a pair. Download both in HD, no explanation needed.",
    emptyTitle: "Coming soon",
    emptyBody: "New couple matching pairs are being tagged and added. Check back shortly.",
    aboutHeadline: "Matching wallpapers for two.",
    aboutParagraphs: [
      "Designed for couples who want their lock screens to mean something. Each set is built as a pair — one for you, one for them. Romantic, subtle, or bold.",
      "Find the match that fits your relationship.",
    ],
  },
};

interface PageProps {
  params: Promise<{ tag: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const config = TAG_CONFIGS[tag];
  if (!config) return {};

  let previewImage: string = DEFAULT_OG_IMAGE;
  try {
    const rawImages = await db.image.findMany({
      where: { isAvatar: false, isAdult: false, matchingGroupId: { not: null } },
      orderBy: { createdAt: "desc" },
      select: { r2Key: true, tags: true },
      take: 200,
    });
    const match = rawImages.find((img) => img.tags.some((t) => t.toLowerCase() === config.matchKeyword));
    if (match) previewImage = getPublicUrl(match.r2Key);
  } catch {
    // fall back silently to DEFAULT_OG_IMAGE
  }

  return {
    title: config.metaTitle,
    description: config.metaDescription,
    keywords: [
      `matching wallpapers for ${config.pillLabel.toLowerCase()}`,
      "matching wallpapers", "matching phone wallpapers", "cute matching wallpapers",
    ],
    openGraph: {
      title: config.metaTitle,
      description: config.metaDescription,
      url: `${SITE_URL}/matching-wallpapers/${config.slug}`,
      siteName: "Haunted Wallpapers",
      type: "website",
      images: [{ url: previewImage, width: 1200, height: 630, alt: config.metaTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: config.metaTitle,
      description: config.metaDescription,
      images: [previewImage],
    },
    alternates: { canonical: `${SITE_URL}/matching-wallpapers/${config.slug}` },
  };
}

export function generateStaticParams() {
  return Object.keys(TAG_CONFIGS).map((tag) => ({ tag }));
}

interface PairFrame { id: string; src: string; label: string }
interface PairEntry { groupId: string; title: string; description: string | null; frames: PairFrame[] }

export default async function MatchingWallpaperTagPage({ params }: PageProps) {
  const { tag } = await params;
  const config = TAG_CONFIGS[tag];
  if (!config) notFound();

  let pairs: PairEntry[] = [];
  let dbError = false;

  try {
    const images = await db.image.findMany({
      where: { isAvatar: false, isAdult: false, matchingGroupId: { not: null } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, title: true, description: true, r2Key: true,
        matchingGroupId: true, matchingLabel: true, tags: true,
      },
    });

    const tagged = images.filter((img) => img.tags.some((t) => t.toLowerCase() === config.matchKeyword));

    const seen = new Set<string>();
    for (const img of tagged) {
      const groupId = img.matchingGroupId!;
      if (seen.has(groupId)) continue;
      seen.add(groupId);
      // Pull every half of this pair from the full image set (not just `tagged`)
      // in case only one half happened to get the category tag applied.
      const partners = images.filter((p) => p.matchingGroupId === groupId);
      pairs.push({
        groupId,
        title: img.title.replace(/\s+—\s+[^—]+$/, ""),
        description: img.description,
        frames: partners.slice().reverse().map((p) => ({
          id: p.id,
          src: getPublicUrl(p.r2Key),
          label: p.matchingLabel || "View",
        })),
      });
    }
  } catch (err) {
    console.error(`[matching-wallpapers/${tag}] DB error:`, err);
    dbError = true;
  }

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: config.metaTitle,
    url: `${SITE_URL}/matching-wallpapers/${config.slug}`,
    numberOfItems: pairs.length,
    itemListElement: pairs.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/matching-wallpapers/${config.slug}`,
      name: p.title,
      image: p.frames[0]?.src,
    })),
  });

  return (
    <main className="hw-mwtag">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Matching Wallpapers", href: "/matching-wallpapers" },
          { label: config.pillLabel },
        ]}
      />

      <section className="hw-mwtag-hero">
        <div className="hw-mwtag-hero__inner">
          <span className="hw-mwtag-pill">{config.pillLabel}</span>
          <h1 className="hw-mwtag-title">{config.tagline}</h1>
          <p className="hw-mwtag-desc">{config.description}</p>
        </div>
      </section>

      <section className="hw-mwtag-section">
        {dbError ? (
          <div className="hw-mwtag-empty">
            <div className="hw-mwtag-empty__sigil">✦ ☽ ✦</div>
            <h2 className="hw-mwtag-empty__title">Something went wrong</h2>
            <p className="hw-mwtag-empty__sub">Couldn&apos;t load matching wallpapers right now. Try again shortly.</p>
          </div>
        ) : pairs.length === 0 ? (
          <div className="hw-mwtag-empty">
            <div className="hw-mwtag-empty__sigil">✦ ☽ ✦</div>
            <h2 className="hw-mwtag-empty__title">{config.emptyTitle}</h2>
            <p className="hw-mwtag-empty__sub">{config.emptyBody}</p>
          </div>
        ) : (
          <>
            <p className="hw-mwtag-count">
              — {pairs.length} matching {pairs.length === 1 ? "pair" : "pairs"} ready to use
            </p>
            <div className="hw-mwtag-grid">
              {pairs.map((pair) => (
                <MatchingWallpaperCard
                  key={pair.groupId}
                  title={pair.title}
                  description={pair.description}
                  frames={pair.frames}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* ── Description block ── */}
      <section className="hw-mwtag-about">
        <div className="hw-mwtag-about__inner">
          <span className="hw-mwtag-about__eyebrow">{config.pillLabel}</span>
          <h2 className="hw-mwtag-about__headline">{config.aboutHeadline}</h2>
          {config.aboutParagraphs.map((p, i) => (
            <p
              key={i}
              className={`hw-mwtag-about__text${i === config.aboutParagraphs.length - 1 ? " hw-mwtag-about__text--cta" : ""}`}
            >
              {p}
            </p>
          ))}
        </div>
      </section>

      <style>{`
        .hw-mwtag { min-height: 100vh; background-color: var(--bg-primary, #0c0b14); color: var(--text-primary, #e8e4dc); }
        .hw-mwtag-hero { padding: clamp(32px, 6vw, 64px) clamp(20px, 5vw, 60px) 24px; max-width: 1280px; margin: 0 auto; }
        .hw-mwtag-hero__inner { max-width: 700px; }
        .hw-mwtag-pill {
          display: inline-block;
          font-family: var(--font-space, monospace);
          font-size: 0.62rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #ec4899;
          border: 1px solid rgba(236,72,153,0.4);
          padding: 5px 12px;
          margin-bottom: 16px;
        }
        .hw-mwtag-title {
          font-family: var(--font-display, serif);
          font-size: clamp(1.6rem, 4.5vw, 2.6rem);
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 16px;
        }
        .hw-mwtag-desc { color: rgba(232,228,220,0.72); font-size: clamp(0.9rem, 2vw, 1rem); line-height: 1.75; }
        .hw-mwtag-section { max-width: 1280px; margin: 0 auto; padding: 0 clamp(16px, 4vw, 60px) 60px; }
        .hw-mwtag-count {
          font-family: var(--font-space, monospace);
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #4a445a;
          margin-bottom: 20px;
        }
        .hw-mwtag-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: clamp(10px, 2vw, 18px);
        }
        @media (min-width: 640px) {
          .hw-mwtag-grid { grid-template-columns: repeat(auto-fill, minmax(175px, 1fr)); }
        }
        @media (min-width: 1024px) {
          .hw-mwtag-grid { grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); }
        }
        .hw-mwtag-empty {
          text-align: center;
          padding: 80px 24px;
        }
        .hw-mwtag-empty__sigil {
          color: #c0001a;
          font-size: 1.4rem;
          margin-bottom: 20px;
          letter-spacing: 0.3em;
        }
        .hw-mwtag-empty__title {
          font-family: var(--font-display, serif);
          font-size: clamp(1.4rem, 4vw, 2rem);
          color: var(--text-primary, #e8e4dc);
          font-weight: 300;
          margin-bottom: 12px;
        }
        .hw-mwtag-empty__sub {
          color: rgba(232,228,220,0.45);
          font-size: 0.9rem;
          max-width: 420px;
          margin: 0 auto;
          line-height: 1.7;
        }

        /* ── Description block ── */
        .hw-mwtag-about {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 clamp(20px, 5vw, 60px) clamp(56px, 9vw, 96px);
        }
        .hw-mwtag-about__inner {
          max-width: 720px;
          border-left: 2px solid rgba(236,72,153,0.45);
          padding-left: clamp(16px, 3vw, 28px);
        }
        .hw-mwtag-about__eyebrow {
          display: block;
          font-family: var(--font-space, monospace);
          font-size: 0.6rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #ec4899;
          margin-bottom: 10px;
        }
        .hw-mwtag-about__headline {
          font-family: var(--font-display, serif);
          font-size: clamp(1.15rem, 2.6vw, 1.5rem);
          font-weight: 700;
          line-height: 1.4;
          margin: 0 0 14px;
          color: var(--text-primary, #e8e4dc);
        }
        .hw-mwtag-about__text {
          color: rgba(232,228,220,0.68);
          font-size: clamp(0.9rem, 1.8vw, 1rem);
          line-height: 1.8;
          margin: 0 0 12px;
        }
        .hw-mwtag-about__text--cta {
          color: rgba(236,72,153,0.9);
          font-weight: 600;
          margin-bottom: 0;
        }
      `}</style>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
    </main>
  );
}