// app/android/home-screen-wallpapers/page.tsx
import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
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
    : `Best Home Screen Wallpapers for Android (Dark & HD)${pageLabel} | HAUNTED WALLPAPERS`;

  const description = tag
    ? `Free dark #${tag} home screen wallpapers for Android. Composed to stay readable behind a full grid of app icons. Download instantly.`
    : "Free dark, HD home screen wallpapers for Android. Every image is picked to stay calm and readable once your app icons are laid over it. No account required.";

  const canonical = tag
    ? `${siteUrl}/android/home-screen-wallpapers?tag=${tag}`
    : `${siteUrl}/android/home-screen-wallpapers`;

  return {
    title,
    description,
    keywords: ["android home screen wallpaper", "home screen wallpaper", "dark home screen wallpaper", "aesthetic home screen android", tag ?? "dark"].filter(Boolean),
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
        <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight mb-6">
          Dark <span className="text-[#c9a84c] italic">Home Screen</span> Wallpapers for Android
          {page > 1 && <span className="text-[#4a445a] text-2xl"> — Page {page}</span>}
        </h1>

        <div className="device-page-intro">
          <p>
            Every wallpaper here is picked for what sits <em>on top</em> of it — 4–5 rows of
            app icons. That means calmer, less busy compositions overall, so your icons stay
            easy to read instead of disappearing into the art.
          </p>
          <p>
            Free to download, no account required, no watermarks. Portrait 9:16, HD.
          </p>
        </div>
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

      <section style={{
        maxWidth: "860px",
        margin: "0 auto",
        padding: "40px 24px 64px",
        borderTop: "1px solid rgba(192,0,26,0.18)",
        textAlign: "center",
      }}>
        <p style={{
          fontFamily: "var(--font-space, monospace)",
          fontSize: "0.6rem",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "#4a445a",
          marginBottom: "20px",
        }}>Also available for</p>
        <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/android/lock-screen-wallpapers" className="hw-crosslink-btn">🔒 Android Lock Screen</Link>
          <Link href="/iphone/home-screen-wallpapers" className="hw-crosslink-btn">📱 iPhone Home Screen</Link>
          <Link href="/android" className="hw-crosslink-btn">🤖 All Android Wallpapers</Link>
        </div>
      </section>

      <style>{`
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
        .hw-crosslink-btn {
          font-family: var(--font-space, monospace);
          font-size: 0.72rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #e8e4f8;
          text-decoration: none;
          border: 1px solid rgba(192,0,26,0.4);
          padding: 13px 26px;
          background: rgba(192,0,26,0.06);
          transition: all 0.25s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .hw-crosslink-btn:hover {
          border-color: rgba(192,0,26,0.8);
          background: rgba(192,0,26,0.13);
          color: #ffffff;
          box-shadow: 0 0 22px rgba(192,0,26,0.22);
        }
      `}</style>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
    </main>
  );
}