// app/avatars/[tag]/page.tsx
// Dedicated long-tail category pages: /avatars/discord-pfp and /avatars/gaming-pfp.
// Filters images by the `tags` array (case-insensitive substring match), not by
// the isAvatar toggle alone — so existing /avatars images only show up here once
// they're tagged "discord" or "gaming" in the admin panel.

import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import Breadcrumbs from "@/components/Breadcrumbs";
import AvatarShareBtn from "@/components/AvatarShareBtn";

export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

interface TagConfig {
  slug: string;
  matchKeyword: string; // substring (or exact, if exactMatch) matched against each image's tags (lowercased)
  exactMatch?: boolean; // true = tag must equal matchKeyword exactly, not just contain it
  pillLabel: string;
  tagline: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  emptyTitle: string;
  emptyBody: string;
}

const TAG_CONFIGS: Record<string, TagConfig> = {
  "discord-pfp": {
    slug: "discord-pfp",
    matchKeyword: "discord",
    pillLabel: "Discord PFP",
    tagline: "The PFP that starts conversations before you even type.",
    description:
      "Your Discord PFP is your first impression in every server. Make it count. Browse sharp, scroll-stopping profile pictures built for desktop — crisp 1:1 avatars that get noticed in member lists, DMs, and voice chats. Fresh drops. Zero blur. Maximum respect.",
    metaTitle: "Best Discord PFP 2026 | Free HD Profile Pictures for Desktop & PC",
    metaDescription:
      "Stand out in every Discord server. Download free HD profile pictures optimized for 1:1 ratio — crisp 1:1 PFPs that turn heads in member lists and DMs. No more basic avatars.",
    emptyTitle: "Coming soon",
    emptyBody: "New Discord PFPs are being tagged and added. Check back shortly.",
  },
  "gaming-pfp": {
    slug: "gaming-pfp",
    matchKeyword: "gaming-pfp",
    exactMatch: true,
    pillLabel: "Gaming PFP",
    tagline: "Spawn in with an avatar worth remembering.",
    description:
      "Your gaming PFP is your banner in every lobby, server, and friends list. Stop running default. Lock in a profile picture built for Discord, Steam, Twitch, and Xbox — sharp, aggressive, and impossible to scroll past. Built for desktop. Optimized for respect.",
    metaTitle: "Best Gaming PFP 2026 | Free HD Avatars for Discord, Steam & Twitch",
    metaDescription:
      "Level up your presence. Download free HD gaming profile pictures optimized for Discord PFP, Steam avatar, Twitch, and every platform. Crisp 1:1 avatars that dominate on PC and desktop.",
    emptyTitle: "Coming soon",
    emptyBody: "New gaming PFPs are being tagged and added. Check back shortly.",
  },
};

interface PageProps {
  params: Promise<{ tag: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const config = TAG_CONFIGS[tag];
  if (!config) return {};

  return {
    title: config.metaTitle,
    description: config.metaDescription,
    keywords: [config.pillLabel.toLowerCase(), `${config.matchKeyword} pfp`, `${config.matchKeyword} avatar`, "dark pfp", "hd profile picture"],
    openGraph: {
      title: config.metaTitle,
      description: config.metaDescription,
      url: `${SITE_URL}/avatars/${config.slug}`,
      siteName: "Haunted Wallpapers",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: config.metaTitle,
      description: config.metaDescription,
    },
    alternates: { canonical: `${SITE_URL}/avatars/${config.slug}` },
  };
}

export function generateStaticParams() {
  return Object.keys(TAG_CONFIGS).map((tag) => ({ tag }));
}

interface AvatarItem {
  id: string;
  title: string;
  description: string | null;
  src: string;
}

// Shared shape for the original /avatars card markup/CSS, reused identically
// on /avatars/matching-pfp. Cloned exactly from the original card markup/CSS.
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

export default async function AvatarTagPage({ params }: PageProps) {
  const { tag } = await params;
  const config = TAG_CONFIGS[tag];
  if (!config) notFound();

  let avatars: AvatarItem[] = [];
  let dbError = false;

  try {
    const rawImages = await db.image.findMany({
      where: { isAvatar: true, isAdult: false },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, description: true, r2Key: true, tags: true },
    });

    avatars = rawImages
      .filter((img) =>
        config.exactMatch
          ? img.tags.some((t) => t.toLowerCase() === config.matchKeyword)
          : img.tags.some((t) => t.toLowerCase().includes(config.matchKeyword))
      )
      .map((img) => ({
        id: img.id,
        title: img.title,
        description: img.description,
        src: getPublicUrl(img.r2Key),
      }));
    // (description was already selected above and is carried through here)
  } catch (err) {
    console.error(`[avatars/${tag}] DB error:`, err);
    dbError = true;
  }

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: config.metaTitle,
    url: `${SITE_URL}/avatars/${config.slug}`,
    numberOfItems: avatars.length,
    itemListElement: avatars.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/avatars/${config.slug}`,
      name: a.title,
      image: a.src,
    })),
  });

  return (
    <main className="hw-tag">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Avatars", href: "/avatars" },
          { label: config.pillLabel },
        ]}
      />

      {/* ── Hero ── */}
      <section className="hw-tag-hero">
        <div className="hw-tag-hero__inner">
          <span className="hw-tag-pill">{config.pillLabel}</span>
          <h1 className="hw-tag-title">{config.tagline}</h1>
          <p className="hw-tag-desc">{config.description}</p>
        </div>
      </section>

      {/* ── Grid ── */}
      <section className="hw-tag-section">
        {dbError ? (
          <div className="hw-avatars-empty">
            <div className="hw-avatars-empty__sigil">✦ ☽ ✦</div>
            <h2 className="hw-avatars-empty__title">Something went wrong</h2>
            <p className="hw-avatars-empty__sub">Couldn&apos;t load avatars right now. Try again in a second.</p>
          </div>
        ) : avatars.length === 0 ? (
          <div className="hw-avatars-empty">
            <div className="hw-avatars-empty__sigil">✦ ☽ ✦</div>
            <h2 className="hw-avatars-empty__title">{config.emptyTitle}</h2>
            <p className="hw-avatars-empty__sub">{config.emptyBody}</p>
          </div>
        ) : (
          <>
            <p className="hw-avatars-count">
              — {avatars.length} {avatars.length === 1 ? "avatar" : "avatars"} ready to use
            </p>
            <div className="hw-avatars-grid">
              {avatars.map((avatar, i) => (
                <article key={avatar.id} className="hw-avatar-card">
                  <div className="hw-avatar-card__img-wrap">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={avatar.src}
                      alt={`${avatar.title} — ${config.pillLabel}`}
                      className="hw-avatar-card__img"
                      loading={i < 8 ? "eager" : "lazy"}
                      decoding="async"
                      draggable={false}
                    />
                  </div>
                  <div className="hw-avatar-card__body">
                    <h2 className="hw-avatar-card__title">{avatar.title}</h2>
                    <div className="hw-avatar-card__actions">
                      <a
                        href={`/api/download/image/${avatar.id}`}
                        className="hw-avatar-card__btn hw-avatar-card__btn--dl"
                        aria-label={`Download ${avatar.title}`}
                      >
                        ↓ Download
                      </a>
                      <AvatarShareBtn url={avatar.src} title={avatar.title} />
                    </div>
                    {avatar.description && (
                      <div
                        className="hw-avatar-card__desc"
                        dangerouslySetInnerHTML={{ __html: avatar.description }}
                      />
                    )}
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      <style>{`
        .hw-tag {
          min-height: 100vh;
          background-color: var(--bg-primary, #0c0b14);
          color: var(--text-primary, #e8e4dc);
        }

        .hw-tag-hero {
          padding: clamp(32px, 6vw, 64px) clamp(20px, 5vw, 60px) 24px;
          max-width: 1280px;
          margin: 0 auto;
        }
        .hw-tag-hero__inner { max-width: 700px; }
        .hw-tag-pill {
          display: inline-block;
          font-family: var(--font-space, monospace);
          font-size: 0.62rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #c9a84c;
          border: 1px solid rgba(201,168,76,0.4);
          padding: 5px 12px;
          margin-bottom: 16px;
        }
        .hw-tag-title {
          font-family: var(--font-display, serif);
          font-size: clamp(1.6rem, 4.5vw, 2.6rem);
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 16px;
          color: var(--text-primary, #e8e4dc);
        }
        .hw-tag-desc {
          color: rgba(232,228,220,0.72);
          font-size: clamp(0.9rem, 2vw, 1rem);
          line-height: 1.75;
        }

        .hw-tag-section {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 clamp(16px, 4vw, 60px) 60px;
        }
        .hw-tag-count {
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