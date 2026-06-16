// app/shop/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import AdminHtmlBlock from "@/components/AdminHtmlBlock";
import Breadcrumbs from "@/components/Breadcrumbs";
import { sanitizeAdminHtml } from "@/lib/sanitize-html";
import { isPremiumLocked } from "@/lib/premium-lock";

export const dynamic = "force-dynamic";

const DISTRICT_TAG_MAP: Record<string, string> = {
  "the-classic-district": "classic-district",
  "the-city-center":      "city-center",
  "bone-street":          "bone-street",
  "the-nature-trail":     "nature-trail",
  "minimalist-row":       "minimalist-row",
  "the-character-ward":   "character-ward",
};

export const dynamicParams = true;
export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

  const collection = await db.collection.findUnique({
    where: { slug },
    select: { title: true, description: true, metaDescription: true, thumbnail: true, thumbnailAlt: true },
  });

  if (!collection) return { title: "Not Found | Haunted Wallpapers" };

  const ogImage = collection.thumbnail
    ? `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${collection.thumbnail}`
    : `${siteUrl}/og-image.jpg`;

  const metaDesc =
    collection.metaDescription ??
    collection.description ??
    `Download ${collection.title} wallpapers free for iPhone, Android and PC. High-quality dark art wallpapers, instant download.`;

  return {
    title: `${collection.title} | Haunted Wallpapers`,
    description: metaDesc,
    openGraph: {
      title: `${collection.title} | Haunted Wallpapers`,
      description: metaDesc,
      url: `${siteUrl}/shop/${slug}`,
      siteName: "Haunted Wallpapers",
      images: [{ url: ogImage, width: 1200, height: 630, alt: collection.thumbnailAlt ?? collection.title }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${collection.title} | Haunted Wallpapers`,
      description: metaDesc,
      images: [ogImage],
    },
    alternates: { canonical: `${siteUrl}/shop/${slug}` },
  };
}

export async function generateStaticParams() {
  return [];
}

export default async function CollectionPage({ params }: PageProps) {
  const { slug } = await params;

  const collection = await db.collection.findUnique({
    where: { slug },
    select: {
      id: true, slug: true, title: true, description: true,
      thumbnail: true, thumbnailAlt: true, icon: true,
      category: true, isAdult: true, isPublished: true,
      images: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true, slug: true, title: true, altText: true,
          r2Key: true, tags: true, sortOrder: true, updatedAt: true,
        },
      },
      _count: { select: { downloads: true } },
    },
  });

  if (!collection) notFound();
  if (!collection.isPublished) notFound();

  const districtTag = DISTRICT_TAG_MAP[slug];
  const districtImages = districtTag
    ? await db.image.findMany({
        where: { collectionId: null, tags: { has: districtTag } },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        select: {
          id: true, slug: true, title: true, altText: true,
          r2Key: true, tags: true, sortOrder: true, updatedAt: true, deviceType: true,
        },
      })
    : [];

  const collectionImageIds = new Set(collection.images.map((i) => i.id));
  const mergedImages = [
    ...collection.images,
    ...districtImages.filter((i) => !collectionImageIds.has(i.id)),
  ];

  const relatedRaw = await db.collection.findMany({
    where: { slug: { not: slug }, isPublished: true },
    select: {
      slug: true, title: true, category: true, thumbnail: true, thumbnailAlt: true,
      _count: { select: { images: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  const sameCategory = relatedRaw.filter((c) => c.category === collection.category);
  const others      = relatedRaw.filter((c) => c.category !== collection.category);
  const relatedCollections = [...sameCategory, ...others].slice(0, 3);

  const r2Base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";

  const fallbackDesc =
    `${collection.title} is a curated collection of free dark art wallpapers from Haunted Wallpapers. ` +
    `Each piece is available as an instant free download — no account required, no watermarks. ` +
    `Formatted for mobile portrait screens (9:16) and optimised for AMOLED displays.`;

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      <style>{`
        /* ─── Desktop two-column layout ─── */
        /* On desktop: left = wallpaper grid (2-col masonry), right = sticky info panel */
        /* On mobile: info first, then full grid — untouched */

        .coll-layout {
          max-width: 1280px;
          margin: 0 auto;
          padding: 24px 24px 80px;
        }

        /* MOBILE: single column, info on top, grid below */
        .coll-desktop-split { display: none; }
        .coll-mobile-info   { display: block; padding-bottom: 28px; }
        .coll-mobile-grid   { display: block; }

        @media (min-width: 900px) {
          .coll-layout { padding: 32px 60px 80px; }
          /* Hide mobile stacks */
          .coll-mobile-info { display: none; }
          .coll-mobile-grid { display: none; }
          /* Show desktop split */
          .coll-desktop-split {
            display: grid;
            grid-template-columns: 1fr 340px;
            gap: 48px;
            align-items: start;
          }
        }

        @media (min-width: 1100px) {
          .coll-desktop-split { grid-template-columns: 1fr 380px; gap: 56px; }
        }

        /* ── Left: 2-col wallpaper grid ── */
        .coll-left-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .coll-img-card {
          position: relative;
          aspect-ratio: 9 / 16;
          overflow: hidden;
          background: #1a1825;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 4px;
          transition: border-color 0.2s, transform 0.2s;
          display: block;
        }
        .coll-img-card:hover {
          border-color: rgba(192,0,26,0.35);
          transform: translateY(-3px);
        }
        .coll-card-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(10,8,18,0.85) 0%, transparent 55%);
          display: flex; align-items: flex-end; padding: 10px;
          opacity: 0; transition: opacity 0.2s;
        }
        .coll-img-card:hover .coll-card-overlay { opacity: 1; }

        /* ── Right: sticky info panel ── */
        .coll-info-panel {
          position: sticky;
          top: 88px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .coll-info-eyebrow {
          font-family: monospace;
          font-size: 0.55rem;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: #4a445a;
          margin: 0;
        }

        .coll-info-title {
          font-family: var(--font-cinzel, serif);
          font-size: clamp(1.5rem, 2.5vw, 2.2rem);
          font-weight: 700;
          line-height: 1.15;
          margin: 0;
          color: var(--text-primary, #e8e4f8);
        }

        .coll-info-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .coll-info-count {
          font-family: monospace;
          font-size: 0.58rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #8a809a;
          border: 1px solid rgba(255,255,255,0.08);
          padding: 4px 10px;
          border-radius: 3px;
        }

        .coll-info-adult {
          background: rgba(192,0,26,0.12);
          border: 1px solid rgba(192,0,26,0.35);
          color: #c0001a;
          font-family: monospace;
          font-size: 0.55rem;
          letter-spacing: 0.1em;
          padding: 4px 10px;
          border-radius: 3px;
        }

        .coll-info-desc {
          font-family: monospace;
          font-size: 0.78rem;
          line-height: 1.85;
          color: #8a809a;
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: 18px;
        }
        .coll-info-desc p { margin: 0 0 10px; }
        .coll-info-desc p:last-child { margin: 0; }

        .coll-info-divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
        }

        /* ── Mobile info (top, before grid) ── */
        .coll-mobile-title {
          font-family: var(--font-cinzel, serif);
          font-size: 1.7rem;
          font-weight: 700;
          line-height: 1.2;
          margin: 0 0 8px;
          color: var(--text-primary, #e8e4f8);
        }
        .coll-mobile-eyebrow {
          font-family: monospace;
          font-size: 0.55rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #4a445a;
          margin: 0 0 12px;
        }
        .coll-mobile-count {
          font-family: monospace;
          font-size: 0.6rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #8a809a;
          margin-bottom: 20px;
          display: block;
        }

        /* ── Mobile grid (below info) ── */
        .coll-mobile-grid-inner {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }
      `}</style>

      <Breadcrumbs items={[
        { label: "Home",       href: "/" },
        { label: "Obsessions", href: "/obsessions" },
        { label: collection.title },
      ]} />

      <div className="coll-layout">

        {/* ══════════════════════════════════════
            MOBILE LAYOUT (< 900px)
            Info panel first, then full grid
        ══════════════════════════════════════ */}
        <div className="coll-mobile-info">
          <p className="coll-mobile-eyebrow">{collection.category ?? "Collection"}</p>
          <h1 className="coll-mobile-title">
            {collection.title}
            {collection.isAdult && (
              <span className="coll-info-adult" style={{ marginLeft: "10px", verticalAlign: "middle" }}>16+</span>
            )}
          </h1>
          <span className="coll-mobile-count">
            {mergedImages.length} wallpaper{mergedImages.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="coll-mobile-grid">
          {mergedImages.length === 0 ? (
            <div className="hw-coming-soon">
              <div className="hw-coming-soon__sigil">✦ ☽ ✦</div>
              <div className="hw-coming-soon__bar" />
              <h2 className="hw-coming-soon__title">Coming Soon</h2>
              <p className="hw-coming-soon__sub">Dark art is being assembled. Check back soon.</p>
            </div>
          ) : (
            <div className="coll-mobile-grid-inner">
              {mergedImages.map((img, idx) => {
                const locked = (img.tags ?? []).includes("badge-premium") && isPremiumLocked((img as any).updatedAt);
                const href = !collectionImageIds.has(img.id) && (img as any).deviceType
                  ? `/${(img as any).deviceType.toLowerCase()}/${img.slug}`
                  : `/shop/${slug}/${img.slug}`;
                return (
                  <Link key={img.id} href={href} className="coll-img-card"
                    style={{ pointerEvents: locked ? "none" : "auto", textDecoration: "none" }}>
                    <Image
                      src={getPublicUrl(img.r2Key)}
                      alt={img.altText ?? img.title}
                      fill unoptimized className="object-cover"
                      sizes="50vw"
                      priority={idx < 6}
                      style={{ filter: locked ? "blur(10px) brightness(0.25)" : "none" }}
                    />
                    {locked ? <LockedOverlay /> : (
                      <div className="coll-card-overlay">
                        <span style={{ fontFamily: "monospace", fontSize: "0.48rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#c9a84c" }}>View →</span>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════
            DESKTOP LAYOUT (≥ 900px)
            Left: 2-col grid | Right: sticky info
        ══════════════════════════════════════ */}
        <div className="coll-desktop-split">

          {/* LEFT — full wallpaper grid, 2 columns */}
          <div>
            {mergedImages.length === 0 ? (
              <div className="hw-coming-soon">
                <div className="hw-coming-soon__sigil">✦ ☽ ✦</div>
                <div className="hw-coming-soon__bar" />
                <h2 className="hw-coming-soon__title">Coming Soon</h2>
                <p className="hw-coming-soon__sub">Dark art is being assembled. Check back soon.</p>
              </div>
            ) : (
              <div className="coll-left-grid">
                {mergedImages.map((img, idx) => {
                  const locked = (img.tags ?? []).includes("badge-premium") && isPremiumLocked((img as any).updatedAt);
                  const href = !collectionImageIds.has(img.id) && (img as any).deviceType
                    ? `/${(img as any).deviceType.toLowerCase()}/${img.slug}`
                    : `/shop/${slug}/${img.slug}`;
                  return (
                    <Link key={img.id} href={href} className="coll-img-card"
                      style={{ pointerEvents: locked ? "none" : "auto", textDecoration: "none" }}>
                      <Image
                        src={getPublicUrl(img.r2Key)}
                        alt={img.altText ?? img.title}
                        fill unoptimized className="object-cover"
                        sizes="(max-width: 1280px) 30vw, 360px"
                        priority={idx < 4}
                        style={{ filter: locked ? "blur(10px) brightness(0.25)" : "none" }}
                      />
                      {locked ? <LockedOverlay /> : (
                        <div className="coll-card-overlay">
                          <span style={{ fontFamily: "monospace", fontSize: "0.48rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#c9a84c" }}>View & Download →</span>
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT — sticky info panel */}
          <div className="coll-info-panel">
            <p className="coll-info-eyebrow">{collection.category ?? "Collection"} · Haunted Wallpapers</p>

            <h1 className="coll-info-title">
              {collection.title}
            </h1>

            <div className="coll-info-meta">
              <span className="coll-info-count">
                {mergedImages.length} wallpaper{mergedImages.length !== 1 ? "s" : ""}
              </span>
              {collection.isAdult && <span className="coll-info-adult">16+</span>}
            </div>

            <div className="coll-info-divider" />

            <div className="coll-info-desc">
              {collection.description ? (
                <AdminHtmlBlock html={collection.description} />
              ) : (
                <p>{fallbackDesc}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          YOU MAY ALSO LIKE
      ══════════════════════════════════════ */}
      {relatedCollections.length > 0 && (
        <section style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "48px 24px 64px",
          background: "rgba(12,8,20,0.4)",
        }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <h2 style={{
              fontFamily: "var(--font-cinzel, serif)",
              fontSize: "1rem", fontWeight: 700,
              letterSpacing: "0.22em", textTransform: "uppercase",
              color: "#ffffff", marginBottom: "24px",
              display: "flex", alignItems: "center", gap: "10px",
            }}>
              <span style={{ color: "#c0001a" }}>✦</span> You May Also Like
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "16px" }}>
              {relatedCollections.map((rc) => {
                const thumb = rc.thumbnail ? `${r2Base}/${rc.thumbnail}` : null;
                return (
                  <Link key={rc.slug} href={`/shop/${rc.slug}`} style={{ textDecoration: "none", display: "block" }}>
                    <div style={{ position: "relative", aspectRatio: "9/16", overflow: "hidden", background: "#0f0c1a", border: "1px solid rgba(255,255,255,0.06)", marginBottom: "10px" }}>
                      {thumb
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={thumb} alt={rc.thumbnailAlt ?? rc.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(192,0,26,0.25)", fontSize: "2rem" }}>✦</div>
                      }
                    </div>
                    <span style={{ fontFamily: "monospace", fontSize: "0.48rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#c0001a", display: "block", marginBottom: "4px" }}>{rc.category}</span>
                    <h3 style={{ fontFamily: "var(--font-cinzel, serif)", fontSize: "0.85rem", fontWeight: 700, color: "#e8e4f8", margin: "0 0 4px", lineHeight: 1.3 }}>{rc.title}</h3>
                    <span style={{ fontFamily: "monospace", fontSize: "0.5rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#4a445a" }}>{rc._count.images} wallpapers</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function LockedOverlay() {
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 5,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: "8px", textAlign: "center",
      background: "rgba(10,8,16,0.5)",
    }}>
      <span style={{ fontSize: "1.6rem" }}>🔒</span>
      <span style={{ fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#c9a84c", fontFamily: "monospace", fontWeight: 700 }}>Back in the Vault</span>
      <span style={{ fontSize: "0.45rem", color: "rgba(201,168,76,0.6)", fontFamily: "monospace" }}>Returns in 24h</span>
    </div>
  );
}