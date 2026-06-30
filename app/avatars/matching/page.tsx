// app/avatars/matching/page.tsx
// Matching Avatars — the third category pill on /avatars. Pulls images that
// share a matchingGroupId and renders them as paired slideshow cards.

import React from "react";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import Breadcrumbs from "@/components/Breadcrumbs";
import MatchingAvatarCard from "@/components/MatchingAvatarCard";

export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

export const metadata: Metadata = {
  title: "Best Matching Avatars 2026 | Free Dark PFPs for Best Friends & Couples",
  description:
    "Matching profile pictures built for two. Download paired dark-aesthetic avatars for Discord, WhatsApp, and Steam — one for you, one for them.",
  keywords: ["matching avatars", "matching pfp for best friends", "matching couple pfp", "matching discord avatars"],
  openGraph: {
    title: "Best Matching Avatars 2026 | Free Dark PFPs for Best Friends & Couples",
    description:
      "Matching profile pictures built for two. Download paired dark-aesthetic avatars for Discord, WhatsApp, and Steam — one for you, one for them.",
    url: `${SITE_URL}/avatars/matching`,
    siteName: "Haunted Wallpapers",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Matching Avatars 2026 | Free Dark PFPs for Best Friends & Couples",
    description: "Matching profile pictures built for two. One for you, one for them.",
  },
  alternates: { canonical: `${SITE_URL}/avatars/matching` },
};

interface PairFrame { id: string; src: string; label: string }
interface PairEntry { groupId: string; title: string; description: string | null; frames: PairFrame[] }

export default async function MatchingAvatarsPage() {
  let pairs: PairEntry[] = [];
  let dbError = false;

  try {
    const images = await db.image.findMany({
      where: { isAvatar: true, isAdult: false, matchingGroupId: { not: null } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, title: true, description: true, r2Key: true,
        matchingGroupId: true, matchingLabel: true,
      },
    });

    const seen = new Set<string>();
    for (const img of images) {
      const groupId = img.matchingGroupId!;
      if (seen.has(groupId)) continue;
      seen.add(groupId);
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
    console.error("[avatars/matching] DB error:", err);
    dbError = true;
  }

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Matching Avatars | Haunted Wallpapers",
    url: `${SITE_URL}/avatars/matching`,
    numberOfItems: pairs.length,
    itemListElement: pairs.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/avatars/matching`,
      name: p.title,
      image: p.frames[0]?.src,
    })),
  });

  return (
    <main className="hw-match">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Avatars", href: "/avatars" },
          { label: "Matching Avatars" },
        ]}
      />

      <section className="hw-match-hero">
        <div className="hw-match-hero__inner">
          <span className="hw-match-pill">Matching Avatars</span>
          <h1 className="hw-match-title">One for you. One for them. Both haunted.</h1>
          <p className="hw-match-desc">
            Download both. Set one each. No explanation needed.
          </p>
        </div>
      </section>

      <section className="hw-match-section">
        {dbError ? (
          <div className="hw-match-empty">
            <h2 className="hw-match-empty__title">Something went wrong</h2>
            <p className="hw-match-empty__sub">Couldn&apos;t load matching avatars right now. Try again shortly.</p>
          </div>
        ) : pairs.length === 0 ? (
          <div className="hw-match-empty">
            <h2 className="hw-match-empty__title">Coming soon</h2>
            <p className="hw-match-empty__sub">New matching pairs drop occasionally. Check back soon.</p>
          </div>
        ) : (
          <>
            <p className="hw-match-count">
              — {pairs.length} matching {pairs.length === 1 ? "pair" : "pairs"} ready to use
            </p>
            <div className="hw-match-grid">
              {pairs.map((pair) => (
                <MatchingAvatarCard
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

      <style>{`
        .hw-match { min-height: 100vh; background-color: var(--bg-primary, #0c0b14); color: var(--text-primary, #e8e4dc); }
        .hw-match-hero { padding: clamp(32px, 6vw, 64px) clamp(20px, 5vw, 60px) 24px; max-width: 1280px; margin: 0 auto; }
        .hw-match-hero__inner { max-width: 700px; }
        .hw-match-pill {
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
        .hw-match-title {
          font-family: var(--font-display, serif);
          font-size: clamp(1.6rem, 4.5vw, 2.6rem);
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 16px;
        }
        .hw-match-desc { color: rgba(232,228,220,0.72); font-size: clamp(0.9rem, 2vw, 1rem); line-height: 1.75; }
        .hw-match-section { max-width: 1280px; margin: 0 auto; padding: 0 clamp(16px, 4vw, 60px) 60px; }
        .hw-match-count {
          font-family: var(--font-space, monospace);
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #4a445a;
          margin-bottom: 20px;
        }
        .hw-match-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: clamp(10px, 2vw, 18px);
        }
        @media (min-width: 640px) { .hw-match-grid { grid-template-columns: repeat(auto-fill, minmax(175px, 1fr)); } }
        @media (min-width: 1024px) { .hw-match-grid { grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); } }
        .hw-match-empty { text-align: center; padding: 80px 24px; }
        .hw-match-empty__title {
          font-family: var(--font-display, serif);
          font-size: clamp(1.4rem, 4vw, 2rem);
          font-weight: 300;
          margin-bottom: 12px;
        }
        .hw-match-empty__sub { color: rgba(232,228,220,0.45); font-size: 0.9rem; max-width: 420px; margin: 0 auto; line-height: 1.7; }
      `}</style>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
    </main>
  );
}