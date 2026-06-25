// app/avatars/page.tsx
// Discord profile picture / avatar gallery — 1:1 square crops, dark aesthetic.

import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdminHtmlBlock from "@/components/AdminHtmlBlock";
import { getPageContent } from "@/lib/db";
import AvatarsGrid from "@/components/AvatarsGrid";

export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

export const metadata: Metadata = {
  title: "Dark Discord Avatars & Profile Pictures | HAUNTED WALLPAPERS",
  description:
    "Dark fantasy profile pictures made for Discord, Steam, and anywhere else your avatar actually matters. Square 1:1 crops, high resolution, ready to use.",
  keywords: [
    "discord avatar", "dark pfp", "discord profile picture", "dark aesthetic pfp",
    "gothic avatar", "horror pfp", "dark fantasy profile picture", "steam avatar",
  ],
  openGraph: {
    title: "Dark Discord Avatars & Profile Pictures | HAUNTED WALLPAPERS",
    description: "Dark fantasy profile pictures for Discord, Steam, and beyond. Square 1:1, high resolution.",
    url: `${SITE_URL}/avatars`,
    siteName: "HAUNTED WALLPAPERS",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dark Discord Avatars & Profile Pictures | HAUNTED WALLPAPERS",
    description: "Dark fantasy profile pictures for Discord, Steam, and beyond.",
  },
  alternates: { canonical: `${SITE_URL}/avatars` },
};

interface AvatarItem {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  src: string;
  tags: string[];
  matchingGroupId: string | null;
  matchingLabel: string | null;
}

// After grouping, the page renders a flat list of either single avatars or
// matching pairs (two avatars that share a matchingGroupId).
type GalleryEntry =
  | { kind: "single"; item: AvatarItem }
  | { kind: "pair"; groupId: string; title: string; description: string | null; frames: { id: string; src: string; label: string }[] };

export default async function AvatarsPage() {
  let avatars: AvatarItem[] = [];
  let pageContent = null;
  let dbError = false;

  try {
    const [rawAvatars, content] = await Promise.all([
      db.image.findMany({
        where: { isAvatar: true, isAdult: false },
        orderBy: { createdAt: "desc" },
        select: {
          id: true, slug: true, title: true, description: true,
          r2Key: true, highResKey: true, tags: true,
          matchingGroupId: true, matchingLabel: true,
        },
      }),
      getPageContent("avatars"),
    ]);

    avatars = rawAvatars.map((img) => ({
      id:              img.id,
      slug:            img.slug,
      title:           img.title,
      description:     img.description,
      src:             getPublicUrl(img.r2Key),
      tags:            img.tags,
      matchingGroupId: img.matchingGroupId,
      matchingLabel:   img.matchingLabel,
    }));

    pageContent = content;
  } catch (err) {
    console.error("[avatars/page] DB error:", err);
    dbError = true;
  }

  // ── Group into singles + matching pairs ────────────────────────────────
  // Two avatars sharing the same matchingGroupId render as one slideshow
  // card instead of two separate cards. Order is preserved by first
  // appearance (avatars are already newest-first from the query above).
  const entries: GalleryEntry[] = [];
  const seenGroups = new Set<string>();
  for (const avatar of avatars) {
    if (avatar.matchingGroupId) {
      if (seenGroups.has(avatar.matchingGroupId)) continue; // already added with its partner
      seenGroups.add(avatar.matchingGroupId);
      const partners = avatars.filter((a) => a.matchingGroupId === avatar.matchingGroupId);
      entries.push({
        kind: "pair",
        groupId: avatar.matchingGroupId,
        // Strip the " — Label" suffix added at upload time, so the shared
        // card title reads clean (e.g. "Soulmates in the Dark", not
        // "Soulmates in the Dark — Him").
        title: avatar.title.replace(/\s+—\s+[^—]+$/, ""),
        description: avatar.description,
        frames: partners.slice().reverse().map((p) => ({ id: p.id, src: p.src, label: p.matchingLabel || "View" })),
      });
    } else {
      entries.push({ kind: "single", item: avatar });
    }
  }

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Dark Discord Avatars & Profile Pictures | Haunted Wallpapers",
    url: `${SITE_URL}/avatars`,
    numberOfItems: entries.length,
    itemListElement: entries.map((entry, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/avatars`,
      name: entry.kind === "single" ? entry.item.title : entry.title,
      image: entry.kind === "single" ? entry.item.src : entry.frames[0]?.src,
    })),
  });

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-primary, #0c0b14)",
        color: "var(--text-primary, #e8e4dc)",
      }}
    >
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Discord Avatars" },
        ]}
      />

      {/* ── Hero ── */}
      <section className="hw-avatars-hero">
        <div className="hw-avatars-hero__inner">
          <h1 className="hw-avatars-title">
            {pageContent?.title ? (
              <span dangerouslySetInnerHTML={{ __html: pageContent.title }} />
            ) : (
              <>
                Dark <span className="hw-avatars-title__accent">Avatars</span> for Discord
              </>
            )}
          </h1>
        </div>
      </section>



      {/* ── Grid ── */}
      <section className="hw-avatars-section">
        {dbError ? (
          <div className="hw-avatars-empty">
            <div className="hw-avatars-empty__sigil">✦ ☽ ✦</div>
            <h2 className="hw-avatars-empty__title">Something went wrong</h2>
            <p className="hw-avatars-empty__sub">
              Couldn&apos;t load avatars right now. Try again in a second.
            </p>
          </div>
        ) : entries.length === 0 ? (
          <div className="hw-avatars-empty">
            <div className="hw-avatars-empty__sigil">✦ ☽ ✦</div>
            <h2 className="hw-avatars-empty__title">Coming soon</h2>
            <p className="hw-avatars-empty__sub">
              The first drop is being prepared. Mark images as &ldquo;Avatar&rdquo; in the
              admin panel to populate this page.
            </p>
          </div>
        ) : (
          <AvatarsGrid entries={entries} />
        )}
      </section>

      {/* ── Cross-links ── */}
      <section className="hw-avatars-crosslinks">
        <p className="hw-avatars-crosslinks__label">Also worth a look</p>
        <div className="hw-avatars-crosslinks__row">
          <Link href="/iphone" className="hw-avatars-crosslink-btn">
            📱 iPhone Wallpapers
          </Link>
          <Link href="/android" className="hw-avatars-crosslink-btn">
            🤖 Android Wallpapers
          </Link>
          <Link href="/pc" className="hw-avatars-crosslink-btn">
            🖥 PC Wallpapers
          </Link>
        </div>
      </section>

      <style>{`
        /* ── Hero ── */
        .hw-avatars-hero {
          padding: clamp(32px, 6vw, 64px) clamp(20px, 5vw, 60px) 24px;
          max-width: 1280px;
          margin: 0 auto;
        }
        .hw-avatars-hero__inner { max-width: 680px; }
        .hw-avatars-title {
          font-family: var(--font-display, serif);
          font-size: clamp(1.8rem, 5vw, 3rem);
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 0;
          color: var(--text-primary, #e8e4dc);
        }
        .hw-avatars-title__accent {
          color: #c9a84c;
          font-style: italic;
        }

        /* ── Nav pills ── */
        .hw-avatars-nav {
          padding: 20px clamp(20px, 5vw, 60px) 24px;
          max-width: 1280px;
          margin: 0 auto;
        }
        .hw-avatars-nav__inner {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .hw-avatars-nav__pill {
          font-family: var(--font-space, monospace);
          font-size: 0.6rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          text-decoration: none;
          color: rgba(232,228,220,0.6);
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03);
          padding: 7px 14px;
          transition: all 0.2s ease;
        }
        .hw-avatars-nav__pill:hover {
          border-color: rgba(192,0,26,0.5);
          color: #fff;
          background: rgba(192,0,26,0.07);
        }
        .hw-avatars-nav__pill--active {
          border-color: rgba(192,0,26,0.65);
          color: #fff;
          background: rgba(192,0,26,0.12);
        }

        /* ── Section ── */
        .hw-avatars-section {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 clamp(16px, 4vw, 60px) 60px;
        }
        .hw-avatars-count {
          font-family: var(--font-space, monospace);
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #4a445a;
          margin-bottom: 20px;
        }

        /* ── Grid ── */
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

        /* ── Card ── */
        .hw-avatar-card {
          background: #13111e;
          border: 1px solid #2a2535;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .hw-avatar-card:hover {
          border-color: rgba(192,0,26,0.45);
          box-shadow: 0 0 16px rgba(192,0,26,0.1);
        }

        /* ── 1:1 image ── */
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
        .hw-avatar-card:hover .hw-avatar-card__img {
          transform: scale(1.03);
        }

        /* ── Card body ── */
        .hw-avatar-card__body {
          padding: 10px 10px 12px;
        }
        .hw-avatar-card__title {
          font-family: var(--font-space, monospace);
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-primary, #e8e4dc);
          margin-bottom: 8px;
          line-height: 1.3;
        }

        /* ── Action buttons — always visible ── */
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

        /* ── HTML description — no overrides, renders exactly as admin wrote it ── */
        .hw-avatar-card__desc {
          margin-top: 8px;
          overflow: hidden;
          border-radius: 0 0 4px 4px;
        }

        /* ── Empty state ── */
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

        /* ── Cross-links ── */
        .hw-avatars-crosslinks {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 24px 64px;
          border-top: 1px solid rgba(192,0,26,0.15);
          text-align: center;
        }
        .hw-avatars-crosslinks__label {
          font-family: var(--font-space, monospace);
          font-size: 0.6rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #4a445a;
          margin-bottom: 20px;
        }
        .hw-avatars-crosslinks__row {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .hw-avatars-crosslink-btn {
          font-family: var(--font-space, monospace);
          font-size: 0.7rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #e8e4dc;
          text-decoration: none;
          border: 1px solid rgba(192,0,26,0.35);
          padding: 10px 20px;
          background: rgba(192,0,26,0.05);
          transition: all 0.22s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .hw-avatars-crosslink-btn:hover {
          border-color: rgba(192,0,26,0.75);
          background: rgba(192,0,26,0.12);
          color: #fff;
        }
      `}</style>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
    </main>
  );
}