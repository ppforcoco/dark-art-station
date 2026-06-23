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

export const revalidate = 300;

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
}

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
          r2Key: true, tags: true,
        },
      }),
      getPageContent("avatars"),
    ]);

    avatars = rawAvatars.map((img) => ({
      id:          img.id,
      slug:        img.slug,
      title:       img.title,
      description: img.description,
      src:         getPublicUrl(img.r2Key),
      tags:        img.tags,
    }));

    pageContent = content;
  } catch (err) {
    console.error("[avatars/page] DB error:", err);
    dbError = true;
  }

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Dark Discord Avatars & Profile Pictures | Haunted Wallpapers",
    url: `${SITE_URL}/avatars`,
    numberOfItems: avatars.length,
    itemListElement: avatars.map((img, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/avatars`,
      name: img.title,
      image: img.src,
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
          <p className="hw-avatars-eyebrow">Profile Pictures</p>
          <h1 className="hw-avatars-title">
            {pageContent?.title ? (
              <span dangerouslySetInnerHTML={{ __html: pageContent.title }} />
            ) : (
              <>
                Dark <span className="hw-avatars-title__accent">Avatars</span> for Discord
              </>
            )}
          </h1>

          {!pageContent?.body && (
            <div className="hw-avatars-intro">
              <p>
                Your default pfp is doing you dirty. These were made specifically for Discord,
                Steam, and anywhere else a tiny square needs to say something — 1:1 ratio,
                sharp at every size, no white backgrounds, no cheerful gradients.
              </p>
              <p>
                Pick one, right-click, save. That&apos;s the whole process. No account,
                no watermark, no &ldquo;download our app first.&rdquo; Just dark art that
                actually fits the vibe.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Admin HTML Block (overrides default intro if set) ── */}
      {pageContent?.body && (
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px 40px" }}>
          <AdminHtmlBlock html={pageContent.body} />
        </div>
      )}

      {/* ── Nav pills ── */}
      <nav className="hw-avatars-nav" aria-label="Related pages">
        <div className="hw-avatars-nav__inner">
          <Link href="/avatars" className="hw-avatars-nav__pill hw-avatars-nav__pill--active">
            👻 All Avatars
          </Link>
          <Link href="/iphone" className="hw-avatars-nav__pill">📱 iPhone Wallpapers</Link>
          <Link href="/android" className="hw-avatars-nav__pill">🤖 Android</Link>
          <Link href="/pc" className="hw-avatars-nav__pill">🖥 PC / Desktop</Link>
        </div>
      </nav>

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
        ) : avatars.length === 0 ? (
          <div className="hw-avatars-empty">
            <div className="hw-avatars-empty__sigil">✦ ☽ ✦</div>
            <h2 className="hw-avatars-empty__title">Coming soon</h2>
            <p className="hw-avatars-empty__sub">
              The first drop is being prepared. Mark images as &ldquo;Avatar&rdquo; in the
              admin panel to populate this page.
            </p>
          </div>
        ) : (
          <>
            <p className="hw-avatars-count">
              — {avatars.length} avatar{avatars.length !== 1 ? "s" : ""} ready to use
            </p>
            <div className="hw-avatars-grid">
              {avatars.map((avatar, i) => (
                <article key={avatar.id} className="hw-avatar-card">
                  {/* 1:1 square image wrapper */}
                  <div className="hw-avatar-card__img-wrap">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={avatar.src}
                      alt={`${avatar.title} — dark Discord avatar`}
                      className="hw-avatar-card__img"
                      loading={i < 8 ? "eager" : "lazy"}
                      decoding="async"
                      draggable={false}
                    />
                    <div className="hw-avatar-card__overlay">
                      <a
                        href={avatar.src}
                        download={`${avatar.slug}-haunted-avatar.jpg`}
                        className="hw-avatar-card__dl"
                        aria-label={`Download ${avatar.title}`}
                      >
                        ↓ Save
                      </a>
                    </div>
                  </div>

                  {/* Description block — renders any HTML from admin */}
                  <div className="hw-avatar-card__body">
                    <h2 className="hw-avatar-card__title">{avatar.title}</h2>
                    {avatar.description && (
                      <div
                        className="hw-avatar-card__desc"
                        dangerouslySetInnerHTML={{ __html: avatar.description }}
                      />
                    )}
                    {avatar.tags.length > 0 && (
                      <div className="hw-avatar-card__tags">
                        {avatar.tags
                          .filter((t) => !t.startsWith("badge-"))
                          .slice(0, 4)
                          .map((tag) => (
                            <span key={tag} className="hw-avatar-card__tag">
                              #{tag}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </>
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
          padding: clamp(40px, 8vw, 80px) clamp(20px, 5vw, 60px) 32px;
          max-width: 1280px;
          margin: 0 auto;
        }
        .hw-avatars-hero__inner { max-width: 680px; }
        .hw-avatars-eyebrow {
          font-family: var(--font-space, monospace);
          font-size: 0.6rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #c0001a;
          margin-bottom: 12px;
        }
        .hw-avatars-title {
          font-family: var(--font-display, serif);
          font-size: clamp(2rem, 6vw, 3.5rem);
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 20px;
          color: var(--text-primary, #e8e4dc);
        }
        .hw-avatars-title__accent {
          color: #c9a84c;
          font-style: italic;
        }
        .hw-avatars-intro {
          max-width: 580px;
        }
        .hw-avatars-intro p {
          font-size: clamp(0.88rem, 2.2vw, 1rem);
          color: rgba(232,228,220,0.75);
          line-height: 1.75;
          margin-bottom: 12px;
        }

        /* ── Nav pills ── */
        .hw-avatars-nav {
          padding: 0 clamp(20px, 5vw, 60px) 28px;
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
          padding: 9px 18px;
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
          box-shadow: 0 0 14px rgba(192,0,26,0.15);
        }

        /* ── Section wrapper ── */
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
          margin-bottom: 24px;
        }

        /* ── Grid — auto-fill, min 140px on mobile, max 260px on desktop ── */
        .hw-avatars-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: clamp(10px, 2vw, 20px);
        }
        @media (min-width: 640px) {
          .hw-avatars-grid {
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          }
        }
        @media (min-width: 1024px) {
          .hw-avatars-grid {
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          }
        }

        /* ── Avatar card ── */
        .hw-avatar-card {
          background: #13111e;
          border: 1px solid #2a2535;
          overflow: hidden;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .hw-avatar-card:hover {
          border-color: rgba(192,0,26,0.55);
          box-shadow: 0 0 20px rgba(192,0,26,0.12);
        }

        /* ── 1:1 square container — always perfect square, never cuts ── */
        .hw-avatar-card__img-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          background: #0a0812;
        }
        .hw-avatar-card__img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
          transition: transform 0.35s ease;
        }
        .hw-avatar-card:hover .hw-avatar-card__img {
          transform: scale(1.04);
        }

        /* ── Download overlay ── */
        .hw-avatar-card__overlay {
          position: absolute;
          inset: 0;
          background: rgba(10,8,18,0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .hw-avatar-card:hover .hw-avatar-card__overlay {
          opacity: 1;
        }
        .hw-avatar-card__dl {
          font-family: var(--font-space, monospace);
          font-size: 0.7rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          text-decoration: none;
          color: #fff;
          border: 1px solid rgba(255,255,255,0.55);
          padding: 10px 20px;
          background: rgba(0,0,0,0.45);
          transition: background 0.15s ease, border-color 0.15s ease;
        }
        .hw-avatar-card__dl:hover {
          background: rgba(192,0,26,0.6);
          border-color: rgba(192,0,26,0.9);
        }
        /* Touch devices — always show overlay */
        @media (hover: none) {
          .hw-avatar-card__overlay {
            opacity: 1;
            background: rgba(10,8,18,0.35);
          }
        }

        /* ── Card body ── */
        .hw-avatar-card__body {
          padding: clamp(10px, 2vw, 16px);
        }
        .hw-avatar-card__title {
          font-family: var(--font-space, monospace);
          font-size: clamp(0.7rem, 1.8vw, 0.82rem);
          font-weight: 600;
          color: var(--text-primary, #e8e4dc);
          margin-bottom: 8px;
          line-height: 1.35;
          /* Clamp to 2 lines */
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .hw-avatar-card__desc {
          font-size: clamp(0.72rem, 1.8vw, 0.82rem);
          color: rgba(232,228,220,0.6);
          line-height: 1.65;
          margin-bottom: 10px;
        }
        /* All HTML tags from admin render nicely */
        .hw-avatar-card__desc p  { margin-bottom: 8px; }
        .hw-avatar-card__desc h2 { font-size: 0.88rem; color: #c9a84c; margin-bottom: 6px; }
        .hw-avatar-card__desc h3 { font-size: 0.82rem; color: #c9a84c; margin-bottom: 6px; }
        .hw-avatar-card__desc ul { padding-left: 18px; margin-bottom: 8px; }
        .hw-avatar-card__desc li { margin-bottom: 4px; }
        .hw-avatar-card__desc strong { color: var(--text-primary, #e8e4dc); font-weight: 600; }
        .hw-avatar-card__desc em    { color: #c9a84c; font-style: italic; }
        .hw-avatar-card__desc a     { color: #c0001a; text-underline-offset: 3px; }
        .hw-avatar-card__desc blockquote {
          border-left: 3px solid #c0001a;
          padding: 6px 12px;
          margin: 8px 0;
          color: rgba(232,228,220,0.5);
          font-style: italic;
        }
        .hw-avatar-card__tags {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }
        .hw-avatar-card__tag {
          font-family: var(--font-space, monospace);
          font-size: 0.58rem;
          letter-spacing: 0.1em;
          color: #4a445a;
          background: rgba(255,255,255,0.03);
          border: 1px solid #2a2535;
          padding: 3px 8px;
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
          padding: 12px 24px;
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
          box-shadow: 0 0 20px rgba(192,0,26,0.18);
        }
      `}</style>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
    </main>
  );
}