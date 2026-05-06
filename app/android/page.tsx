// app/android/page.tsx
import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { db, getPageContent } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import Pagination from "@/components/Pagination";
import WallpaperTips from "@/components/WallpaperTips";
import Breadcrumbs from "@/components/Breadcrumbs";
import IphoneImageGrid from "@/components/IphoneImageGrid";
import AdminHtmlBlock from "@/components/AdminHtmlBlock";

export const revalidate = 60;

const PAGE_SIZE = 24;

// ── Premium lock: same 24h alternating cycle as PremiumCountdown ──────────
const CYCLE_H   = 48;
const VISIBLE_H = 24;

function getServerLockState(): boolean {
  const EPOCH_MS = Date.UTC(2025, 0, 1, 0, 0, 0);
  const msSinceEpoch = Date.now() - EPOCH_MS;
  const cycleMs = CYCLE_H * 60 * 60 * 1000;
  const posInCycle = msSinceEpoch % cycleMs;
  const hoursInCycle = posInCycle / (1000 * 60 * 60);
  return hoursInCycle >= VISIBLE_H;
}

interface PageProps {
  searchParams: Promise<{ tag?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { tag, page: rawPage } = await searchParams;
  const page      = Math.max(1, parseInt(rawPage ?? "1", 10) || 1);
  const pageLabel = page > 1 ? ` — Page ${page}` : "";
  const siteUrl   = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

  const title = tag
    ? `Dark #${tag} Wallpapers for Android & iPhone${pageLabel} | HAUNTED WALLPAPERS`
    : `Dark Android Wallpapers Free Download (iPhone & Android)${pageLabel} | HAUNTED WALLPAPERS`;

  const description = tag
    ? `Browse free AMOLED-optimised dark wallpapers for Android tagged #${tag}. Download instantly, no account required.`
    : "Free AMOLED-optimised dark wallpapers for Android. Deep blacks, zero battery waste on OLED screens. Samsung, Pixel, OnePlus ready. No account required.";

  const canonical = tag ? `${siteUrl}/android?tag=${tag}` : `${siteUrl}/android`;

  return {
    title,
    description,
    keywords: ["android wallpaper", "dark wallpaper android", "hd android wallpaper", "free android wallpaper", tag ?? "dark", "dark fantasy"].filter(Boolean),
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

export default async function AndroidPage({ searchParams }: PageProps) {
  const { tag, page: rawPage } = await searchParams;
  const page = Math.max(1, parseInt(rawPage ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const isLockedGlobal = getServerLockState();

  const where = {
    collectionId: null,
    isAdult: false,
    deviceType: "ANDROID" as const,
    ...(tag ? { tags: { has: tag } } : {}),
  };

  let pinnedImages: ImageItem[] = [];
  let images: ImageItem[] = [];
  let total = 0;
  let pageContent = null;
  let dbError = false;

  try {
    const [pinnedRaw, imagesRaw, totalCount, content] = await Promise.all([
      (!tag && page === 1)
        ? db.image.findMany({
            where: { collectionId: null, deviceType: "ANDROID", isAdult: false, sortOrder: { lt: 0 } },
            orderBy: { sortOrder: "asc" },
            select: { id: true, slug: true, title: true, r2Key: true, viewCount: true, tags: true, isAdult: true, updatedAt: true },
            take: 3,
          })
        : Promise.resolve([] as Array<{ id: string; slug: string; title: string; r2Key: string; viewCount: number; tags: string[]; isAdult: boolean; updatedAt: Date }>),
      db.image.findMany({
        where,
        orderBy: { createdAt: "desc" },
        select: { id: true, slug: true, title: true, r2Key: true, viewCount: true, tags: true, isAdult: true, updatedAt: true },
        take: PAGE_SIZE,
        skip,
      }),
      db.image.count({ where }),
      getPageContent("android"),
    ]);

    pinnedImages = pinnedRaw.map((img) => ({
      id: img.id, slug: img.slug, title: img.title,
      src: getPublicUrl(img.r2Key),
      viewCount: img.viewCount, tags: img.tags, isAdult: img.isAdult,
    }));

    images = imagesRaw.map((img) => ({
      id: img.id, slug: img.slug, title: img.title,
      src: getPublicUrl(img.r2Key),
      viewCount: img.viewCount, tags: img.tags, isAdult: img.isAdult,
    }));

    total = totalCount;
    pageContent = content;
  } catch (err) {
    console.error("[android/page] DB error:", err);
    dbError = true;
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const baseUrl    = tag ? `/android?tag=${encodeURIComponent(tag)}` : "/android";

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: tag ? `Dark #${tag} Android Wallpapers | Haunted Wallpapers` : "Free Dark Android Wallpapers HD | Haunted Wallpapers",
    url: tag ? `${process.env.NEXT_PUBLIC_SITE_URL}/android?tag=${tag}` : `${process.env.NEXT_PUBLIC_SITE_URL}/android`,
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
      <WallpaperTips mode="banner" />
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Android Wallpapers" },
      ]} />

      <section className="max-w-7xl mx-auto px-6 md:px-[60px] pt-10 pb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight mb-6">
          {tag ? (
            <>Dark <span className="text-[#c9a84c] italic">#{tag}</span> Wallpapers for Android</>
          ) : pageContent?.title ? (
            <span dangerouslySetInnerHTML={{ __html: pageContent.title }} />
          ) : (
            <>Free Dark Android <span className="text-[#c9a84c] italic">Wallpapers</span></>
          )}
          {page > 1 && <span className="text-[#4a445a] text-2xl"> — Page {page}</span>}
        </h1>

        {!tag && !pageContent?.body && (
          <div className="device-page-intro">
            <p>
              All Android wallpapers here are portrait 9:16 format, sized for modern flagship
              screens including Samsung Galaxy, Google Pixel, OnePlus, and Xiaomi devices.
              AMOLED-optimised: near-black backgrounds let your OLED screen turn pixels completely
              off, extending battery life while looking dramatically better.
            </p>
            <p>
              Download is instant — tap any image, tap download, and it saves directly to your
              gallery. No account, no watermarks, no limits.
            </p>
            <div className="device-page-guide-link">
              <span>Need help setting it up?</span>
              <a href="/blog/the-dark-aesthetic-a-complete-guide-to-customizing-your-devices">Read our wallpaper guide →</a>
            </div>
          </div>
        )}
      </section>

      {!tag && pageContent?.body && (
        <div className="w-full pb-8">
          <AdminHtmlBlock html={pageContent.body} />
        </div>
      )}

      {pinnedImages.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 md:px-[60px] pb-10">
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
            <span style={{
              fontFamily: "var(--font-space, monospace)",
              fontSize: "0.58rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#c0001a",
              border: "1px solid rgba(192,0,26,0.5)",
              padding: "5px 12px",
              background: "rgba(192,0,26,0.08)",
              boxShadow: "0 0 12px rgba(192,0,26,0.15)",
            }}>★ The Most Haunted</span>
            <div style={{ flex: 1, height: "1px", background: "linear-gradient(to right, rgba(192,0,26,0.35), transparent)" }} />
          </div>
          <IphoneImageGrid
            images={pinnedImages}
            hrefPrefix="/android"
            altSuffix="free dark Android wallpaper HD"
            gridStyle={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", maxWidth: "480px" }}
            priority
            aspectRatio="9/16"
            sizes="(max-width: 640px) 33vw, 160px"
            isLockedGlobal={isLockedGlobal}
          />
        </section>
      )}

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
              {tag ? `New wallpapers tagged #${tag} are on their way.` : "Dark art is brewing. Upload images from the admin panel to fill this page."}
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
              altSuffix="free dark Android wallpaper HD"
              gridClassName="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
              priorityCount={10}
              aspectRatio="9/16"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
              insertAfter={9}
              isLockedGlobal={isLockedGlobal}
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
        }}>Too bright for you? Explore more darkness</p>
        <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/iphone" className="hw-crosslink-btn">📱 iPhone Wallpapers</Link>
          <Link href="/pc" className="hw-crosslink-btn">🖥 Desktop PC Nightmares</Link>
        </div>
      </section>

      <style>{`
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