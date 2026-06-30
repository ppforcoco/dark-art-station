// app/avatars/page.tsx
// Avatars hub — landing page with 3 big categories: Discord PFP, Gaming PFP,
// Matching Avatars. This page no longer renders the raw image grid itself;
// it routes users into the dedicated, tag-filtered sub-pages instead.

import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import Breadcrumbs from "@/components/Breadcrumbs";

export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

export const metadata: Metadata = {
  title: "Viral Gaming Avatars 2026 | Discord, Twitch, Steam & WhatsApp PFPs",
  description:
    "The avatar refresh everyone's doing right now. Grab scroll-stopping profile pictures for Discord, Steam, Twitch, and WhatsApp before your friends copy the look.",
  keywords: [
    "discord pfp", "gaming pfp", "matching avatars", "dark pfp", "aesthetic discord avatar",
    "gaming profile picture", "steam avatar", "twitch pfp", "whatsapp dp", "matching pfp for best friends",
  ],
  openGraph: {
    title: "Viral Gaming Avatars 2026 | Discord, Twitch, Steam & WhatsApp PFPs",
    description:
      "The avatar refresh everyone's doing right now. Grab scroll-stopping profile pictures for Discord, Steam, Twitch, and WhatsApp before your friends copy the look.",
    url: `${SITE_URL}/avatars`,
    siteName: "Haunted Wallpapers",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Viral Gaming Avatars 2026 | Discord, Twitch, Steam & WhatsApp PFPs",
    description:
      "The avatar refresh everyone's doing right now. Grab scroll-stopping profile pictures for Discord, Steam, Twitch, and WhatsApp before your friends copy the look.",
  },
  alternates: { canonical: `${SITE_URL}/avatars` },
};

// ── Category card data ──────────────────────────────────────────────────────
// Counts are fetched live below; everything else here is static copy.
const CATEGORIES = [
  {
    key: "discord-pfp",
    href: "/avatars/discord-pfp",
    label: "Discord PFP",
    tagline: "The PFP that starts conversations before you even type.",
    tagFilter: "discord",
  },
  {
    key: "gaming-pfp",
    href: "/avatars/gaming-pfp",
    label: "Gaming PFP",
    tagline: "Spawn in with an avatar worth remembering.",
    tagFilter: "gaming",
  },
  {
    key: "matching-avatars",
    href: "/avatars/matching",
    label: "Matching Avatars",
    tagline: "One for you. One for them. Both haunted.",
    tagFilter: null,
  },
] as const;

export default async function AvatarsHubPage() {
  let counts: Record<string, number> = { "discord-pfp": 0, "gaming-pfp": 0, "matching-avatars": 0 };
  let previews: Record<string, string[]> = { "discord-pfp": [], "gaming-pfp": [], "matching-avatars": [] };

  try {
    const images = await db.image.findMany({
      where: { isAvatar: true, isAdult: false },
      orderBy: { createdAt: "desc" },
      select: { id: true, r2Key: true, tags: true, matchingGroupId: true },
    });

    const discord = images.filter((img) => img.tags.some((t) => t.toLowerCase().includes("discord")));
    const gaming  = images.filter((img) => img.tags.some((t) => t.toLowerCase().includes("gaming")));
    const pairs   = images.filter((img) => img.matchingGroupId);

    counts = {
      "discord-pfp": discord.length,
      "gaming-pfp": gaming.length,
      "matching-avatars": pairs.length,
    };
    previews = {
      "discord-pfp": discord.slice(0, 4).map((img) => getPublicUrl(img.r2Key)),
      "gaming-pfp": gaming.slice(0, 4).map((img) => getPublicUrl(img.r2Key)),
      "matching-avatars": pairs.slice(0, 4).map((img) => getPublicUrl(img.r2Key)),
    };
  } catch (err) {
    console.error("[avatars/hub] DB error:", err);
  }

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Viral Gaming Avatars 2026",
    url: `${SITE_URL}/avatars`,
    hasPart: CATEGORIES.map((c) => ({
      "@type": "CollectionPage",
      name: c.label,
      url: `${SITE_URL}${c.href}`,
    })),
  });

  return (
    <main className="hw-hub">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Avatars" }]} />

      {/* ── Hero ── */}
      <section className="hw-hub-hero">
        <div className="hw-hub-hero__inner">
          <h1 className="hw-hub-title">
            Dark <span className="hw-hub-title__accent">PFP</span> &amp; Avatar Vault
          </h1>
          <p className="hw-hub-desc">
            Your avatar follows you everywhere. So why does it still look basic? Upgrade your
            Discord PFP, Steam avatar, Twitch profile pic, and WhatsApp photo in one shot.
            HD, cropped right, and impossible to ignore.
          </p>
        </div>
      </section>

      {/* ── Category cards ── */}
      <section className="hw-hub-categories">
        <div className="hw-hub-categories__grid">
          {CATEGORIES.map((cat) => (
            <Link key={cat.key} href={cat.href} className="hw-cat-card">
              <div className="hw-cat-card__previews">
                {previews[cat.key].length > 0 ? (
                  previews[cat.key].map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={src}
                      alt=""
                      className="hw-cat-card__preview-img"
                      loading={i === 0 ? "eager" : "lazy"}
                    />
                  ))
                ) : (
                  <div className="hw-cat-card__preview-empty" aria-hidden="true" />
                )}
              </div>

              <div className="hw-cat-card__body">
                <span className="hw-cat-card__count">
                  {counts[cat.key]} {counts[cat.key] === 1 ? "avatar" : "avatars"}
                </span>
                <h2 className="hw-cat-card__label">{cat.label}</h2>
                <p className="hw-cat-card__tagline">{cat.tagline}</p>
                <span className="hw-cat-card__cta">Browse collection →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <style>{`
        .hw-hub {
          min-height: 100vh;
          background-color: var(--bg-primary, #0c0b14);
          color: var(--text-primary, #e8e4dc);
        }

        /* ── Hero ── */
        .hw-hub-hero {
          padding: clamp(32px, 6vw, 64px) clamp(20px, 5vw, 60px) 8px;
          max-width: 1280px;
          margin: 0 auto;
        }
        .hw-hub-hero__inner { max-width: 720px; }
        .hw-hub-title {
          font-family: var(--font-display, serif);
          font-size: clamp(1.8rem, 5vw, 3rem);
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 16px;
          color: var(--text-primary, #e8e4dc);
        }
        .hw-hub-title__accent { color: #c9a84c; font-style: italic; }
        .hw-hub-desc {
          color: rgba(232, 228, 220, 0.7);
          font-size: clamp(0.92rem, 2vw, 1.05rem);
          line-height: 1.75;
          max-width: 640px;
        }

        /* ── Category grid ── */
        .hw-hub-categories {
          max-width: 1280px;
          margin: 0 auto;
          padding: 32px clamp(16px, 4vw, 60px) 80px;
        }
        .hw-hub-categories__grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        @media (min-width: 760px) {
          .hw-hub-categories__grid { grid-template-columns: repeat(3, 1fr); gap: 24px; }
        }

        .hw-cat-card {
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: inherit;
          background: #13111e;
          border: 1px solid #2a2535;
          overflow: hidden;
          transition: border-color 0.22s ease, transform 0.22s ease, box-shadow 0.22s ease;
        }
        .hw-cat-card:hover {
          border-color: rgba(192,0,26,0.55);
          box-shadow: 0 0 24px rgba(192,0,26,0.12);
          transform: translateY(-2px);
        }

        .hw-cat-card__previews {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          grid-template-rows: repeat(2, 1fr);
          gap: 2px;
          aspect-ratio: 1 / 1;
          background: #0a0812;
        }
        .hw-cat-card__preview-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .hw-cat-card__preview-empty {
          grid-column: 1 / -1;
          grid-row: 1 / -1;
          background: linear-gradient(135deg, rgba(192,0,26,0.08), rgba(0,0,0,0.2));
        }

        .hw-cat-card__body {
          padding: 20px 22px 24px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .hw-cat-card__count {
          font-family: var(--font-space, monospace);
          font-size: 0.62rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #c9a84c;
        }
        .hw-cat-card__label {
          font-family: var(--font-display, serif);
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--text-primary, #e8e4dc);
          margin: 2px 0 4px;
        }
        .hw-cat-card__tagline {
          color: rgba(232,228,220,0.62);
          font-size: 0.88rem;
          line-height: 1.6;
          margin-bottom: 14px;
        }
        .hw-cat-card__cta {
          font-family: var(--font-space, monospace);
          font-size: 0.66rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #e8e4dc;
          border-top: 1px solid rgba(255,255,255,0.08);
          padding-top: 14px;
          transition: color 0.2s ease;
        }
        .hw-cat-card:hover .hw-cat-card__cta { color: #c0001a; }
      `}</style>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
    </main>
  );
}