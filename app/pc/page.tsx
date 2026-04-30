// app/pc/page.tsx
import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { db, getPageContent } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import AdSlot from "@/components/AdSlot";
import Pagination from "@/components/Pagination";

import DeviceImageCard from "@/components/DeviceImageCard";

export const revalidate = 60;

const PAGE_SIZE = 24;

interface PageProps {
  searchParams: Promise<{ tag?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { tag, page: rawPage } = await searchParams;
  const page      = Math.max(1, parseInt(rawPage ?? "1", 10) || 1);
  const pageLabel = page > 1 ? ` — Page ${page}` : "";
  const siteUrl   = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

  const title = tag
    ? `Dark #${tag} Desktop Wallpapers for PC & iPhone${pageLabel} | HAUNTED WALLPAPERS`
    : `Dark Desktop Wallpapers Free Download (PC & iPhone)${pageLabel} | HAUNTED WALLPAPERS`;

  const description = tag
    ? `Browse free dark fantasy desktop wallpapers tagged #${tag}. Download instantly, no account required.`
    : "Free dark fantasy wallpapers for PC and desktop. Landscape 16:9 optimised. New drops daily. No account required.";

  const canonical = tag ? `${siteUrl}/pc?tag=${tag}` : `${siteUrl}/pc`;

  return {
    title,
    description,
    keywords: ["pc wallpaper", "desktop wallpaper dark", "hd desktop wallpaper", "free pc wallpaper", "16:9 wallpaper", tag ?? "dark", "dark fantasy"].filter(Boolean),
    openGraph: { title, description, url: canonical, siteName: "HAUNTED WALLPAPERS", type: "website" },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical },
  };
}

export default async function PcPage({ searchParams }: PageProps) {
  const { tag, page: rawPage } = await searchParams;
  const page = Math.max(1, parseInt(rawPage ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const where = {
    collectionId: null,
    deviceType: "PC" as const,
    ...(tag ? { tags: { has: tag } } : {}),
  };

  const [pinnedImages, images, total, pageContent] = await Promise.all([
    (!tag && page === 1)
      ? db.image.findMany({
          where: { collectionId: null, deviceType: "PC", sortOrder: { lt: 0 } },
          orderBy: { sortOrder: "asc" },
          select: { id: true, slug: true, title: true, r2Key: true, viewCount: true, tags: true, isAdult: true },
          take: 3,
        })
      : Promise.resolve([] as Array<{ id: string; slug: string; title: string; r2Key: string; viewCount: number; tags: string[]; isAdult: boolean }>),
    db.image.findMany({
      where: { ...where, sortOrder: { gte: 0 } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: { id: true, slug: true, title: true, r2Key: true, viewCount: true, tags: true, isAdult: true },
      take: PAGE_SIZE,
      skip,
    }),
    db.image.count({ where: { ...where, sortOrder: { gte: 0 } } }),
    getPageContent("pc"),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const baseUrl    = tag ? `/pc?tag=${encodeURIComponent(tag)}` : "/pc";

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>

      <section className="max-w-7xl mx-auto px-6 md:px-[60px] pt-10 pb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight mb-6">
          {tag ? (
            <>Dark <span className="text-[#c9a84c] italic">#{tag}</span> Desktop Wallpapers for PC</>
          ) : (
            <>Free Dark PC <span className="text-[#c9a84c] italic">Wallpapers</span></>
          )}
          {page > 1 && <span className="text-[#4a445a] text-2xl"> — Page {page}</span>}
        </h1>

        {!tag && (
          <div className="device-page-intro">
            {pageContent?.body
              ? <div dangerouslySetInnerHTML={{ __html: pageContent.body }} />
              : <>
                  <p>
                    Every wallpaper in this collection is built for desktop and widescreen monitors —
                    native 16:9 landscape format, sized for 1080p, 1440p, and 4K displays without
                    cropping or distortion. Images are generated at high resolution and downsampled
                    cleanly, so edges stay sharp and shadows stay deep no matter how large your screen is.
                  </p>
                  <p>
                    Dark desktop wallpapers hit differently on a large monitor. These are not phone
                    wallpapers stretched to fill a screen — they are built wide, with composition and
                    atmosphere designed for the horizontal canvas. Gothic architecture, cosmic horror,
                    cyberpunk decay, dark fantasy — every piece is made to own your workspace.
                  </p>
                  <p>
                    All wallpapers are free to download with no account required. Right-click any image
                    and save, or use the download button for the full-resolution file. Works on Windows,
                    Mac, and Linux. New collections added regularly.
                  </p>
                  <div className="device-page-guide-link">
                    <span>Need help setting it up?</span>
                    <a href="/blog/the-dark-aesthetic-a-complete-guide-to-customizing-your-devices">Read our wallpaper guide →</a>
                  </div>
                </>}
          </div>
        )}
      </section>

      <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN} width={728} height={90} />

      {/* ── Pinned "The Most Haunted" top 3 — 16:9 ratio for PC ── */}
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
          {/* 16:9 grid for PC */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {pinnedImages.map((img) => (
              <DeviceImageCard
                key={img.id}
                href={`/pc/${img.slug}`}
                src={getPublicUrl(img.r2Key)}
                alt={`${img.title} — free dark PC desktop wallpaper`}
                title={img.title}
                tags={img.tags}
                isAdult={img.isAdult}
                priority={true}
                aspectRatio="16/9"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
            ))}
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-6 md:px-[60px] py-10">
        {images.length === 0 ? (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((img, idx) => (
                <React.Fragment key={img.id}>
                  <DeviceImageCard
                    href={`/pc/${img.slug}`}
                    src={getPublicUrl(img.r2Key)}
                    alt={`${img.title} — free dark PC desktop wallpaper`}
                    title={img.title}
                    tags={img.tags}
                    isAdult={img.isAdult}
                    priority={idx < 6}
                    aspectRatio="16/9"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  {idx === 5 && (
                    <div className="col-span-1 sm:col-span-2 lg:col-span-3 my-2">
                      <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN} width={728} height={90} />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
            <Pagination currentPage={page} totalPages={totalPages} baseUrl={baseUrl} />
          </>
        )}
      </section>

      <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} width={728} height={90} className="mt-8" />

      {/* ── Cross-Link Footer ── */}
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
          <Link href="/iphone" className="hw-crosslink-btn">
            📱 iPhone Wallpapers
          </Link>
          <Link href="/android" className="hw-crosslink-btn">
            🤖 Nocturnal Android Collection
          </Link>
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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: tag ? `Dark #${tag} PC Wallpapers | Haunted Wallpapers` : "Free Dark Desktop Wallpapers HD | Haunted Wallpapers",
            url: tag ? `${process.env.NEXT_PUBLIC_SITE_URL}/pc?tag=${tag}` : `${process.env.NEXT_PUBLIC_SITE_URL}/pc`,
            numberOfItems: total,
            itemListElement: images.map((img, i) => ({
              "@type": "ListItem",
              position: skip + i + 1,
              url: `${process.env.NEXT_PUBLIC_SITE_URL}/pc/${img.slug}`,
              name: img.title,
              image: getPublicUrl(img.r2Key),
            })),
          }),
        }}
      />
    </main>
  );
}