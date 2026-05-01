// app/iphone/page.tsx
import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { db, getPageContent } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
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
    ? `Trending Dark #${tag} Wallpapers for iPhone${pageLabel} | HAUNTED WALLPAPERS`
    : `Free Dark iPhone Wallpapers HD${pageLabel} | HAUNTED WALLPAPERS`;

  const description = tag
    ? `Browse free HD dark fantasy iPhone wallpapers tagged #${tag}. Download instantly, no account required.`
    : "Free HD dark fantasy wallpapers for iPhone. Portrait 9:16 optimised. New drops daily. No account required.";

  const canonical = tag ? `${siteUrl}/iphone?tag=${tag}` : `${siteUrl}/iphone`;

  return {
    title,
    description,
    keywords: ["iphone wallpaper", "dark wallpaper iphone", "HD iphone wallpaper", "free iphone wallpaper", tag ?? "dark", "dark fantasy"].filter(Boolean),
    openGraph: { title, description, url: canonical, siteName: "HAUNTED WALLPAPERS", type: "website" },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical },
  };
}

export default async function IphonePage({ searchParams }: PageProps) {
  const { tag, page: rawPage } = await searchParams;
  const page = Math.max(1, parseInt(rawPage ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const where = {
    collectionId: null,
    deviceType: "IPHONE" as const,
    ...(tag ? { tags: { has: tag } } : {}),
  };

  // Fetch pinned (sortOrder < 0), regular images, total, page content in parallel
  const [pinnedImages, images, total, pageContent] = await Promise.all([
    (!tag && page === 1)
      ? db.image.findMany({
          where: { collectionId: null, deviceType: "IPHONE", sortOrder: { lt: 0 } },
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
    getPageContent("iphone"),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const baseUrl    = tag ? `/iphone?tag=${encodeURIComponent(tag)}` : "/iphone";

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>

      <section className="max-w-7xl mx-auto px-6 md:px-[60px] pt-10 pb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight mb-6">
          {tag ? (
            <>Dark <span className="text-[#c9a84c] italic">#{tag}</span> Wallpapers for iPhone</>
          ) : pageContent?.title ? (
            <span dangerouslySetInnerHTML={{ __html: pageContent.title }} />
          ) : (
            <>Free Dark iPhone <span className="text-[#c9a84c] italic">Wallpapers</span></>
          )}
          {page > 1 && <span className="text-[#4a445a] text-2xl"> — Page {page}</span>}
        </h1>

        {!tag && (
          <div className="device-page-intro">
            {pageContent?.body
              ? <div dangerouslySetInnerHTML={{ __html: pageContent.body }} />
              : <>
                  <p>
                    Every wallpaper in this collection is designed specifically for iPhone screens —
                    portrait 9:16 format, optimised for the Super Retina XDR display found on iPhone 12
                    through iPhone 16. Images are generated at HD resolution and downsampled cleanly,
                    so you get maximum sharpness without jagged edges or compression artefacts.
                  </p>
                  <p>
                    All wallpapers are free to download. No account required, no watermarks, no paywalls.
                    Tap any image to view it full-size and download directly to your Photos library.
                    New collections drop regularly.
                  </p>
                  <div className="device-page-guide-link">
                    <span>New to setting wallpapers?</span>
                    <a href="/blog/the-dark-aesthetic-a-complete-guide-to-customizing-your-devices">Read our wallpaper guide →</a>
                  </div>
                </>}
          </div>
        )}
      </section>


      {/* ── Pinned "The Most Haunted" top 3 — only on page 1, no tag filter ── */}
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", maxWidth: "480px" }}>
            {pinnedImages.map((img) => (
              <DeviceImageCard
                key={img.id}
                href={`/iphone/${img.slug}`}
                src={getPublicUrl(img.r2Key)}
                alt={`${img.title} — free dark iPhone wallpaper HD`}
                title={img.title}
                tags={img.tags}
                isAdult={img.isAdult}
                priority={true}
                aspectRatio="9/16"
                sizes="(max-width: 640px) 33vw, 160px"
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {images.map((img, idx) => (
                <React.Fragment key={img.id}>
                  <DeviceImageCard
                    href={`/iphone/${img.slug}`}
                    src={getPublicUrl(img.r2Key)}
                    alt={`${img.title} — free dark iPhone wallpaper HD`}
                    title={img.title}
                    tags={img.tags}
                    isAdult={img.isAdult}
                    priority={idx < 10}
                    aspectRatio="9/16"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                  />
                  {idx === 9 && (
                    <div className="col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-5 my-2">
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
            <Pagination currentPage={page} totalPages={totalPages} baseUrl={baseUrl} />
          </>
        )}
      </section>


      {/* ── Cross-Link: Don't let the page just end ── */}
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
          <Link href="/android" className="hw-crosslink-btn">
            🤖 Nocturnal Android Collection
          </Link>
          <Link href="/pc" className="hw-crosslink-btn">
            🖥 Desktop PC Nightmares
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
            name: tag ? `Dark #${tag} iPhone Wallpapers | Haunted Wallpapers` : "Free Dark iPhone Wallpapers HD | Haunted Wallpapers",
            url: tag ? `${process.env.NEXT_PUBLIC_SITE_URL}/iphone?tag=${tag}` : `${process.env.NEXT_PUBLIC_SITE_URL}/iphone`,
            numberOfItems: total,
            itemListElement: images.map((img, i) => ({
              "@type": "ListItem",
              position: skip + i + 1,
              url: `${process.env.NEXT_PUBLIC_SITE_URL}/iphone/${img.slug}`,
              name: img.title,
              image: getPublicUrl(img.r2Key),
            })),
          }),
        }}
      />
    </main>
  );
}