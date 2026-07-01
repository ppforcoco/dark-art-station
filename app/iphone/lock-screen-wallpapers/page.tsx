// app/iphone/lock-screen-wallpapers/page.tsx
import React from "react";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { getPublicUrl } from "@/lib/r2";
import Pagination from "@/components/Pagination";
import Breadcrumbs from "@/components/Breadcrumbs";
import IphoneImageGrid from "@/components/IphoneImageGrid";
import ScreenStyleFilters from "@/components/ScreenStyleFilters";
import { isGloballyPremiumLocked } from "@/lib/premium-lock";

export const revalidate = 3600;

const PAGE_SIZE = 24;
const SCREEN_TAG = "lock-screen-wallpaper";

interface PageProps {
  searchParams: Promise<{ tag?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { tag, page: rawPage } = await searchParams;
  const page      = Math.max(1, parseInt(rawPage ?? "1", 10) || 1);
  const pageLabel = page > 1 ? ` — Page ${page}` : "";
  const siteUrl   = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

  const title = tag
    ? `Dark #${tag} Lock Screen Wallpapers for iPhone${pageLabel} | HAUNTED WALLPAPERS`
    : `Best iPhone Lock Screen Wallpapers 2026 | iOS 19, Depth Effect & Dynamic Island${pageLabel}`;

  const description = tag
    ? `Free dark #${tag} lock screen wallpapers for iPhone. Composed with open space up top so the clock and notifications stay readable. Download instantly.`
    : "iPhone wallpapers built around the lock screen clock and Dynamic Island. Dark, depth-ready backgrounds tested on iOS 19. No text overlap. No bad crops. Just clean, Apple-grade lock screens.";

  const canonical = tag
    ? `${siteUrl}/iphone/lock-screen-wallpapers?tag=${tag}`
    : `${siteUrl}/iphone/lock-screen-wallpapers`;

  return {
    title,
    description,
    keywords: ["iPhone lock screen wallpaper", "iOS 19 wallpaper", "Dynamic Island background", "depth effect wallpaper", "dark iPhone wallpaper", "Apple lock screen", "free iPhone wallpaper 2026", tag ?? "dark"].filter(Boolean),
    openGraph: { title, description, url: canonical, siteName: "HAUNTED WALLPAPERS", type: "website" },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical },
  };
}

interface ImageItem {
  id: string;
  slug: string;
  title: string;
  src: string;
  viewCount: number;
  tags: string[];
  isAdult: boolean;
}

export default async function IphoneLockScreenPage({ searchParams }: PageProps) {
  const { tag, page: rawPage } = await searchParams;
  const page = Math.max(1, parseInt(rawPage ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;
  const locked = isGloballyPremiumLocked();

  // Single exact tag match ONLY — no case variants, no fallback matching.
  // A wallpaper must have the literal tag "lock-screen-wallpaper" to appear here.
  const andConditions: Prisma.ImageWhereInput[] = [
    { tags: { has: SCREEN_TAG } },
  ];

  if (tag) {
    andConditions.push({ tags: { has: tag } });
  }

  const where: Prisma.ImageWhereInput = {
    collectionId: null,
    deviceType: "IPHONE",
    isAvatar: false,
    isAdult: false,
    AND: andConditions,
  };

  let images: ImageItem[] = [];
  let total = 0;
  let dbError = false;

  try {
    const [imagesRaw, totalCount] = await Promise.all([
      db.image.findMany({
        where,
        orderBy: { createdAt: "desc" },
        select: { id: true, slug: true, title: true, r2Key: true, viewCount: true, tags: true, isAdult: true },
        take: PAGE_SIZE,
        skip,
      }),
      db.image.count({ where }),
    ]);

    images = imagesRaw.map((img) => ({
      id: img.id, slug: img.slug, title: img.title,
      src: getPublicUrl(img.r2Key),
      viewCount: img.viewCount, tags: img.tags, isAdult: img.isAdult,
    }));

    total = totalCount;
  } catch (err) {
    console.error("[iphone/lock-screen-wallpapers] DB error:", err);
    dbError = true;
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const baseUrl    = tag ? `/iphone/lock-screen-wallpapers?tag=${encodeURIComponent(tag)}` : "/iphone/lock-screen-wallpapers";

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Lock Screen Wallpapers for iPhone | Haunted Wallpapers",
    url: `${process.env.NEXT_PUBLIC_SITE_URL}${baseUrl}`,
    numberOfItems: total,
    itemListElement: images.map((img, i) => ({
      "@type": "ListItem",
      position: skip + i + 1,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/iphone/${img.slug}`,
      name: img.title,
      image: img.src,
    })),
  });

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "iPhone Wallpapers", href: "/iphone" },
        { label: "Lock Screen Wallpapers" },
      ]} />

      <section className="max-w-7xl mx-auto px-6 md:px-[60px] pt-10 pb-8">
        <p className="device-page-tagline">Built for the notch. Designed for the glance.</p>

        <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight">
          Dark <span className="text-[#c9a84c] italic">Lock Screen</span> Wallpapers for iPhone
          {page > 1 && <span className="text-[#4a445a] text-2xl"> — Page {page}</span>}
        </h1>
      </section>

      <div className="hw-tag-pills-wrap">
        <ScreenStyleFilters
          rootPath="/iphone"
          currentPath="/iphone/lock-screen-wallpapers"
          currentTag={tag}
          activeScreen="lock-screen"
          showStyleDropdown={false}
        />
      </div>

      <section className="max-w-7xl mx-auto px-6 md:px-[60px] py-10">
        {dbError ? (
          <div className="hw-coming-soon">
            <div className="hw-coming-soon__sigil">✦ ☽ ✦</div>
            <div className="hw-coming-soon__bar" />
            <h2 className="hw-coming-soon__title">Something went wrong</h2>
            <p className="hw-coming-soon__sub">Could not load wallpapers. Please try again shortly.</p>
          </div>
        ) : images.length === 0 ? (
          <div className="hw-coming-soon">
            <div className="hw-coming-soon__sigil">✦ ☽ ✦</div>
            <div className="hw-coming-soon__bar" />
            <h2 className="hw-coming-soon__title">Coming Soon</h2>
            <p className="hw-coming-soon__sub">
              Lock screen wallpapers are on their way — tag wallpapers <code>lock-screen-wallpaper</code> (exact, lowercase) in the admin panel to have them show up here.
            </p>
          </div>
        ) : (
          <>
            <p className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-[#4a445a] mb-6">
              — {total} wallpapers · page {page} of {totalPages}
            </p>
            <IphoneImageGrid
              images={images}
              hrefPrefix="/iphone"
              altSuffix="free dark iPhone lock screen wallpaper HD"
              gridClassName="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
              priorityCount={4}
              aspectRatio="9/16"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
              insertAfter={9}
              isLockedGlobal={locked}
              initialCount={6}
              batchSize={6}
            />
            <Pagination currentPage={page} totalPages={totalPages} baseUrl={baseUrl} />
          </>
        )}
      </section>

      <section className="device-page-description-wrap">
        <div className="device-page-description">
          <p>
            iPhone lock screens hit different — the clock floats high, the depth effect layers
            behind it, and your wallpaper has to play nice with both. Every image here is
            cropped and tested for iOS: no clock clash, no Dynamic Island interference, no
            awkward text overlap.
          </p>
          <p>
            Dark modes that make the time pop. Depth-ready layers that respond when you tilt.
            Wake your phone, and it actually looks like Apple designed it.
          </p>
        </div>
      </section>

      <style>{`
        .device-page-tagline {
          font-family: var(--font-display, serif);
          font-style: italic;
          font-size: clamp(1rem, 1.6vw + 0.5rem, 1.4rem);
          line-height: 1.4;
          color: #c9a84c;
          letter-spacing: 0.01em;
          margin-bottom: 12px;
          max-width: 680px;
        }
        @media (max-width: 480px) {
          .device-page-tagline { font-size: 1.05rem; margin-bottom: 10px; }
        }
        .device-page-description-wrap {
          max-width: 760px;
          margin: 0 auto;
          padding: 48px clamp(24px, 5vw, 60px) 72px;
          border-top: 1px solid rgba(192,0,26,0.18);
        }
        .device-page-description {
          position: relative;
          text-align: center;
        }
        .device-page-description::before {
          content: "✦";
          display: block;
          color: #c9a84c;
          font-size: 0.9rem;
          margin-bottom: 20px;
          opacity: 0.7;
        }
        .device-page-description p {
          font-family: var(--font-body, sans-serif);
          font-size: clamp(0.92rem, 0.4vw + 0.85rem, 1rem);
          line-height: 1.75;
          color: rgba(224,224,248,0.72);
          margin-bottom: 16px;
        }
        .device-page-description p:last-child { margin-bottom: 0; }
        .hw-tag-pills-wrap {
          background-color: var(--bg-primary, #0c0b14);
          padding: 0 clamp(24px, 5vw, 60px) 28px;
          max-width: 1280px;
          margin: 0 auto;
        }
        .hw-tag-pills { display: flex; flex-wrap: wrap; gap: 8px; }
        .hw-tag-pill {
          font-family: var(--font-space, monospace);
          font-size: 0.58rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          text-decoration: none;
          color: rgba(224,224,248,0.65);
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03);
          padding: 8px 18px;
          border-radius: 2px;
          transition: all 0.2s ease;
        }
        .hw-tag-pill:hover { border-color: rgba(192,0,26,0.6); color: #fff; background: rgba(192,0,26,0.08); }
        .hw-tag-pill--active {
          border-color: rgba(192,0,26,0.7);
          color: #fff;
          background: rgba(192,0,26,0.12);
          box-shadow: 0 0 14px rgba(192,0,26,0.15);
        }
      `}</style>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
    </main>
  );
}