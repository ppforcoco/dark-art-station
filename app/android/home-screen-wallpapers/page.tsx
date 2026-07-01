// app/android/home-screen-wallpapers/page.tsx
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
const SCREEN_TAG = "home-screen";

interface PageProps {
  searchParams: Promise<{ tag?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { tag, page: rawPage } = await searchParams;
  const page      = Math.max(1, parseInt(rawPage ?? "1", 10) || 1);
  const pageLabel = page > 1 ? ` — Page ${page}` : "";
  const siteUrl   = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

  const title = tag
    ? `Dark #${tag} Home Screen Wallpapers for Android${pageLabel} | HAUNTED WALLPAPERS`
    : `Best Android Home Screen Wallpapers 2026 | Dark, Minimal & Icon-Friendly${pageLabel}`;

  const description = tag
    ? `Free dark #${tag} home screen wallpapers for Android. Composed to stay readable behind a full grid of app icons. Download instantly.`
    : "Android home screen wallpapers built around your apps and widgets. Dark, minimal backgrounds that make icons pop without the clutter. Free downloads for every launcher.";

  const canonical = tag
    ? `${siteUrl}/android/home-screen-wallpapers?tag=${tag}`
    : `${siteUrl}/android/home-screen-wallpapers`;

  return {
    title,
    description,
    keywords: ["Android home screen wallpaper", "home screen background", "minimal Android wallpaper", "dark wallpaper for apps", "launcher wallpaper", "icon-friendly background", "free Android wallpaper 2026", "widget wallpaper", tag ?? "dark"].filter(Boolean),
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

export default async function AndroidHomeScreenPage({ searchParams }: PageProps) {
  const { tag, page: rawPage } = await searchParams;
  const page = Math.max(1, parseInt(rawPage ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;
  const locked = isGloballyPremiumLocked();

  // Exact hyphenated tag match only — never a title/partial match — so this
  // never pulls in unrelated wallpapers just because a word overlaps.
  const andConditions: Prisma.ImageWhereInput[] = [
    {
      OR: [
        { tags: { has: SCREEN_TAG } },
        { tags: { has: SCREEN_TAG.toUpperCase() } },
        { tags: { has: "Home-Screen" } },
      ],
    },
  ];

  if (tag) {
    andConditions.push({
      OR: [
        { tags: { has: tag } },
        { tags: { has: tag.toLowerCase() } },
        { tags: { has: tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase() } },
      ],
    });
  }

  const where: Prisma.ImageWhereInput = {
    collectionId: null,
    deviceType: "ANDROID",
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
    console.error("[android/home-screen-wallpapers] DB error:", err);
    dbError = true;
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const baseUrl    = tag ? `/android/home-screen-wallpapers?tag=${encodeURIComponent(tag)}` : "/android/home-screen-wallpapers";

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Home Screen Wallpapers for Android | Haunted Wallpapers",
    url: `${process.env.NEXT_PUBLIC_SITE_URL}${baseUrl}`,
    numberOfItems: total,
    itemListElement: images.map((img, i) => ({
      "@type": "ListItem",
      position: skip + i + 1,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/android/${img.slug}`,
      name: img.title,
      image: img.src,
    })),
  });

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Android Wallpapers", href: "/android" },
        { label: "Home Screen Wallpapers" },
      ]} />

      <section className="max-w-7xl mx-auto px-6 md:px-[60px] pt-10 pb-8">
        <p className="device-page-tagline">Your apps live here. Your wallpaper shouldn't fight them.</p>

        <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight">
          Dark <span className="text-[#c9a84c] italic">Home Screen</span> Wallpapers for Android
          {page > 1 && <span className="text-[#4a445a] text-2xl"> — Page {page}</span>}
        </h1>
      </section>

      <div className="hw-tag-pills-wrap">
        <ScreenStyleFilters
          rootPath="/android"
          currentPath="/android/home-screen-wallpapers"
          currentTag={tag}
          activeScreen="home-screen"
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
              Home screen wallpapers are on their way — tag wallpapers <code>home-screen</code> in the admin panel to have them show up here.
            </p>
          </div>
        ) : (
          <>
            <p className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-[#4a445a] mb-6">
              — {total} wallpapers · page {page} of {totalPages}
            </p>
            <IphoneImageGrid
              images={images}
              hrefPrefix="/android"
              altSuffix="free dark Android home screen wallpaper HD"
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
            Your home screen is where the chaos lives — app icons, widgets, folders everywhere.
            The wallpaper underneath has one job: hold it together without adding to the mess.
            Every Android home screen wallpaper here is built for clarity.
          </p>
          <p>
            Dark tones that make icons pop. Subtle depth that doesn&apos;t drown your apps.
            Clean gradients, moody landscapes, and minimal textures that look sharp behind
            every launcher. No busy patterns. No icon camouflage. Just backdrops that let your
            setup breathe.
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