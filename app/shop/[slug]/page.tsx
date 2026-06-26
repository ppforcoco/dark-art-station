// app/shop/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import AdminHtmlBlock from "@/components/AdminHtmlBlock";
import Breadcrumbs from "@/components/Breadcrumbs";
import { isPremiumLocked } from "@/lib/premium-lock";

export const revalidate = 3600;

const DISTRICT_TAG_MAP: Record<string, string> = {
  "the-classic-district": "classic-district",
  "the-city-center":      "city-center",
  "bone-street":          "bone-street",
  "the-nature-trail":     "nature-trail",
  "minimalist-row":       "minimalist-row",
  "the-character-ward":   "character-ward",
};

export const dynamicParams = true;

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
          r2Key: true, tags: true, sortOrder: true, updatedAt: true, deviceType: true,
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
  const others       = relatedRaw.filter((c) => c.category !== collection.category);
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
        .coll-layout {
          max-width: 1280px;
          margin: 0 auto;
          padding: 24px 24px 80px;
        }

        /* ── Mobile: untouched ── */
        .coll-desktop-only { display: none; }
        .coll-mobile-info  { display: block; padding-bottom: 28px; }
        .coll-mobile-grid  { display: block; }

        @media (min-width: 900px) {
          .coll-layout       { padding: 32px 60px 80px; }
          .coll-mobile-info  { display: none; }
          .coll-mobile-grid  { display: none; }
          .coll-desktop-only { display: block; }
        }

        /* ── Mobile card ── */
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

        /* ── Desktop header ── */
        .coll-desktop-header {
          text-align: center;
          max-width: 760px;
          margin: 0 auto 48px;
        }
        .coll-info-eyebrow {
          font-family: monospace;
          font-size: 0.55rem;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: #4a445a;
          margin: 0;
        }
        .coll-desktop-title {
          font-family: var(--font-cinzel, serif);
          font-size: clamp(1.8rem, 3vw, 2.6rem);
          font-weight: 700;
          line-height: 1.18;
          margin: 12px 0 16px;
          color: var(--text-primary, #e8e4f8);
        }
        .coll-desktop-count {
          display: inline-block;
          font-family: monospace;
          font-size: 0.58rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #8a809a;
          border: 1px solid rgba(255,255,255,0.08);
          padding: 5px 12px;
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

        /* ══════════════════════════════════════════════
           PHONE MOCKUP — self-contained, no DeviceMockup
           The image sits edge-to-edge inside the screen.
           The bezel is CSS-only, always visible.
        ══════════════════════════════════════════════ */
        .coll-mockup-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 32px 20px;
        }

        .coll-mockup-link {
          display: block;
          text-decoration: none;
          transition: transform 0.22s ease;
        }
        .coll-mockup-link:hover { transform: translateY(-6px); }

        /* The outer phone shell */
        .coll-phone {
          position: relative;
          width: 100%;
          aspect-ratio: 9 / 19.5;
          background: #080810;
          border-radius: 28px;
          border: 2px solid rgba(255,255,255,0.12);
          box-shadow:
            0 0 0 1px rgba(0,0,0,0.9),
            0 16px 48px rgba(0,0,0,0.85),
            0 4px 12px rgba(0,0,0,0.6),
            inset 0 1px 0 rgba(255,255,255,0.08);
          overflow: hidden; /* clip the image to phone shape */
        }

        /* Dynamic Island notch */
        .coll-phone-notch {
          position: absolute;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          width: 36%;
          height: 14px;
          background: #04040c;
          border-radius: 10px;
          z-index: 10;
          border: 1px solid rgba(255,255,255,0.05);
        }

        /* The wallpaper image — fills the whole phone, behind the notch */
        .coll-phone-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 26px;
        }

        /* Glass sheen overlay */
        .coll-phone-glass {
          position: absolute;
          inset: 0;
          border-radius: 26px;
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.06) 0%,
            rgba(255,255,255,0.01) 35%,
            transparent 60%
          );
          pointer-events: none;
          z-index: 5;
        }

        /* Hover CTA */
        .coll-phone-overlay {
          position: absolute;
          inset: 0;
          border-radius: 26px;
          background: linear-gradient(to top, rgba(10,8,18,0.82) 0%, transparent 50%);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 18px;
          opacity: 0;
          transition: opacity 0.2s;
          z-index: 8;
        }
        .coll-mockup-link:hover .coll-phone-overlay { opacity: 1; }
        .coll-phone-overlay span {
          font-family: monospace;
          font-size: 0.5rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #c9a84c;
        }

        /* Title under each phone */
        .coll-phone-label {
          margin-top: 10px;
          font-family: monospace;
          font-size: 0.52rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #4a445a;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ── Description ── */
        .coll-desc-section {
          max-width: 720px;
          width: 100%;
          margin: 48px auto 0;
          padding-top: 32px;
          border-top: 1px solid rgba(255,255,255,0.07);
          overflow: hidden;
          box-sizing: border-box;
        }
        .coll-desc-heading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-family: var(--font-cinzel, serif);
          font-size: 0.9rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #ffffff;
          margin: 0 0 24px;
        }
        .coll-desc-heading .coll-desc-accent { color: #c0001a; }
        .coll-desc-body {
          font-family: monospace;
          font-size: 0.85rem;
          line-height: 1.9;
          color: #a89bc0;
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
          overflow-wrap: break-word;
          word-break: break-word;
          box-sizing: border-box;
        }
        .coll-desc-body p { margin: 0 0 14px; }
        .coll-desc-body p:last-child { margin: 0; }
        .coll-desc-body .admin-html-block {
          column-count: 1 !important;
          columns: auto !important;
          display: block !important;
          width: 100% !important;
          max-width: 100% !important;
          overflow-x: hidden !important;
        }
        /* Neutralise any fixed widths, absolute positioning, or floats
           pasted in via admin HTML — this is the safety net that stops
           layout from breaking out of the page on mobile/desktop. */
        .coll-desc-body .admin-html-block * {
          max-width: 100% !important;
          position: static !important;
          float: none !important;
          box-sizing: border-box !important;
        }
        .coll-desc-body .admin-html-block div,
        .coll-desc-body .admin-html-block section,
        .coll-desc-body .admin-html-block span[style*="column"] {
          display: block !important;
          float: none !important;
          width: 100% !important;
          max-width: 100% !important;
          column-count: 1 !important;
          columns: auto !important;
        }
        .coll-desc-body .admin-html-block img,
        .coll-desc-body .admin-html-block svg,
        .coll-desc-body .admin-html-block video {
          max-width: 100% !important;
          height: auto !important;
        }

        /* ── Mobile info ── */
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

        {/* ══ MOBILE (< 900px) — untouched ══ */}
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
                      fill className="object-cover"
                      sizes="50vw"
                      priority={idx < 2}
                      unoptimized
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

        {/* ══ DESKTOP (≥ 900px) ══ */}
        <div className="coll-desktop-only">

          {/* HEADER */}
          <div className="coll-desktop-header">
            <p className="coll-info-eyebrow">{collection.category ?? "Collection"} · Haunted Wallpapers</p>
            <h1 className="coll-desktop-title">
              {collection.title}
              {collection.isAdult && (
                <span className="coll-info-adult" style={{ marginLeft: "10px", verticalAlign: "middle" }}>16+</span>
              )}
            </h1>
            <span className="coll-desktop-count">
              {mergedImages.length} wallpaper{mergedImages.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* PHONE MOCKUP GRID */}
          {mergedImages.length === 0 ? (
            <div className="hw-coming-soon">
              <div className="hw-coming-soon__sigil">✦ ☽ ✦</div>
              <div className="hw-coming-soon__bar" />
              <h2 className="hw-coming-soon__title">Coming Soon</h2>
              <p className="hw-coming-soon__sub">Dark art is being assembled. Check back soon.</p>
            </div>
          ) : (
            <div className="coll-mockup-grid">
              {mergedImages.map((img, idx) => {
                const locked = (img.tags ?? []).includes("badge-premium") && isPremiumLocked((img as any).updatedAt);
                const href = !collectionImageIds.has(img.id) && (img as any).deviceType
                  ? `/${(img as any).deviceType.toLowerCase()}/${img.slug}`
                  : `/shop/${slug}/${img.slug}`;
                const imgUrl = getPublicUrl(img.r2Key);

                return (
                  <Link key={img.id} href={href} className="coll-mockup-link"
                    style={{ pointerEvents: locked ? "none" : "auto" }}>
                    {/* Self-contained phone frame — no DeviceMockup dependency */}
                    <div className="coll-phone">
                      <div className="coll-phone-notch" aria-hidden="true" />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgUrl}
                        alt={img.altText ?? img.title}
                        className="coll-phone-img"
                        loading={idx < 6 ? "eager" : "lazy"}
                        style={{
                          filter: locked ? "blur(10px) brightness(0.25)" : "none",
                        }}
                      />
                      <div className="coll-phone-glass" aria-hidden="true" />
                      {locked ? (
                        <div style={{ position: "absolute", inset: 0, zIndex: 9 }}>
                          <LockedOverlay />
                        </div>
                      ) : (
                        <div className="coll-phone-overlay">
                          <span>View →</span>
                        </div>
                      )}
                    </div>
                    <p className="coll-phone-label">{img.title}</p>
                  </Link>
                );
              })}
            </div>
          )}

        </div>

        {/* DESCRIPTION — visible on both mobile and desktop */}
        <div className="coll-desc-section">
          <h2 className="coll-desc-heading">
            <span className="coll-desc-accent">✦</span> About This Collection
          </h2>
          <div className="coll-desc-body">
            {collection.description ? (
              <AdminHtmlBlock html={collection.description} />
            ) : (
              <p>{fallbackDesc}</p>
            )}
          </div>
        </div>

      </div>

      {/* ══ YOU MAY ALSO LIKE ══ */}
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