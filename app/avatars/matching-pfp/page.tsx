// app/avatars/matching-pfp/page.tsx
// Matching Avatars — the third category pill on /avatars. Pulls images that
// share a matchingGroupId and renders them as paired slideshow cards.

import React from "react";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import Breadcrumbs from "@/components/Breadcrumbs";
import MatchingAvatarCard from "@/components/MatchingAvatarCard";

// Cloned exactly from app/avatars/[tag]/page.tsx's AVATAR_CARD_STYLES so the
// card markup (image, title, download/share buttons, HTML description) looks
// identical here, on /avatars/discord-pfp, and on /avatars/gaming-pfp.
const AVATAR_CARD_STYLES = `
  .hw-avatars-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: clamp(10px, 2vw, 18px);
  }
  @media (min-width: 640px) {
    .hw-avatars-grid { grid-template-columns: repeat(auto-fill, minmax(175px, 1fr)); }
  }
  @media (min-width: 1024px) {
    .hw-avatars-grid { grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); }
  }
  .hw-avatar-card {
    background: #13111e;
    border: 1px solid #2a2535;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .hw-avatar-card:hover {
    border-color: rgba(192,0,26,0.45);
    box-shadow: 0 0 16px rgba(192,0,26,0.1);
  }
  .hw-avatar-card__img-wrap {
    position: relative;
    width: 100%;
    aspect-ratio: 1 / 1;
    background: #0a0812;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .hw-avatar-card__img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
    display: block;
    transition: transform 0.35s ease;
    padding: 10px;
  }
  .hw-avatar-card:hover .hw-avatar-card__img { transform: scale(1.03); }
  .hw-avatar-card__body { padding: 10px 10px 12px; }
  .hw-avatar-card__title {
    font-family: var(--font-space, monospace);
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--text-primary, #e8e4dc);
    margin-bottom: 8px;
    line-height: 1.3;
  }
  .hw-avatar-card__actions {
    display: flex;
    gap: 6px;
    margin-bottom: 8px;
  }
  .hw-avatar-card__btn {
    flex: 1;
    font-family: var(--font-space, monospace);
    font-size: 0.58rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    text-decoration: none;
    text-align: center;
    padding: 6px 4px;
    border: 1px solid rgba(255,255,255,0.15);
    background: rgba(255,255,255,0.04);
    color: rgba(232,228,220,0.75);
    cursor: pointer;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3px;
  }
  .hw-avatar-card__btn--dl {
    border-color: rgba(192,0,26,0.4);
    background: rgba(192,0,26,0.08);
    color: #e8e4dc;
  }
  .hw-avatar-card__btn--dl:hover {
    background: rgba(192,0,26,0.22);
    border-color: rgba(192,0,26,0.8);
    color: #fff;
  }
  .hw-avatar-card__btn--share:hover {
    border-color: rgba(201,168,76,0.5);
    color: #c9a84c;
    background: rgba(201,168,76,0.06);
  }
  .hw-avatar-card__desc {
    margin-top: 8px;
    overflow: hidden;
    border-radius: 0 0 4px 4px;
  }
  .hw-avatars-empty {
    text-align: center;
    padding: 80px 24px;
  }
  .hw-avatars-empty__sigil {
    color: #c0001a;
    font-size: 1.4rem;
    margin-bottom: 20px;
    letter-spacing: 0.3em;
  }
  .hw-avatars-empty__title {
    font-family: var(--font-display, serif);
    font-size: clamp(1.4rem, 4vw, 2rem);
    color: var(--text-primary, #e8e4dc);
    font-weight: 300;
    margin-bottom: 12px;
  }
  .hw-avatars-empty__sub {
    color: rgba(232,228,220,0.45);
    font-size: 0.9rem;
    max-width: 420px;
    margin: 0 auto;
    line-height: 1.7;
  }
`;

export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

export const metadata: Metadata = {
  title: "Matching PFP 2026 | Free Dark Matching Avatars for Best Friends & Couples",
  description:
    "Matching pfp sets built for two. Download paired dark-aesthetic avatars for Discord, WhatsApp, and Steam — one for you, one for them.",
  keywords: ["matching pfp", "matching pfp for couples", "matching pfp for 2 friends", "matching pfp for friends", "dark matching pfp for couples", "matching avatars"],
  openGraph: {
    title: "Matching PFP 2026 | Free Dark Matching Avatars for Best Friends & Couples",
    description:
      "Matching pfp sets built for two. Download paired dark-aesthetic avatars for Discord, WhatsApp, and Steam — one for you, one for them.",
    url: `${SITE_URL}/avatars/matching-pfp`,
    siteName: "Haunted Wallpapers",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Matching PFP 2026 | Free Dark Matching Avatars for Best Friends & Couples",
    description: "Matching pfp sets built for two. One for you, one for them.",
  },
  alternates: { canonical: `${SITE_URL}/avatars/matching-pfp` },
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
    console.error("[avatars/matching-pfp] DB error:", err);
    dbError = true;
  }

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Matching PFP | Haunted Wallpapers",
    url: `${SITE_URL}/avatars/matching-pfp`,
    numberOfItems: pairs.length,
    itemListElement: pairs.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/avatars/matching-pfp`,
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
          { label: "Matching PFP" },
        ]}
      />

      <section className="hw-match-hero">
        <div className="hw-match-hero__inner">
          <span className="hw-match-pill">Matching PFP</span>
          <h1 className="hw-match-title">Matching PFP. One for you. One for them. Both haunted.</h1>
          <p className="hw-match-desc">
            Download both. Set one each. No explanation needed.
          </p>
        </div>
      </section>

      <section className="hw-match-section">
        {dbError ? (
          <div className="hw-avatars-empty">
            <div className="hw-avatars-empty__sigil">✦ ☽ ✦</div>
            <h2 className="hw-avatars-empty__title">Something went wrong</h2>
            <p className="hw-avatars-empty__sub">Couldn&apos;t load matching avatars right now. Try again shortly.</p>
          </div>
        ) : pairs.length === 0 ? (
          <div className="hw-avatars-empty">
            <div className="hw-avatars-empty__sigil">✦ ☽ ✦</div>
            <h2 className="hw-avatars-empty__title">Coming soon</h2>
            <p className="hw-avatars-empty__sub">New matching pairs drop occasionally. Check back soon.</p>
          </div>
        ) : (
          <>
            <p className="hw-avatars-count">
              — {pairs.length} matching {pairs.length === 1 ? "pair" : "pairs"} ready to use
            </p>
            <div className="hw-avatars-grid">
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
        ${AVATAR_CARD_STYLES}
      `}</style>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
    </main>
  );
}