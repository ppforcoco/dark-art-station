// app/[slug]/page.tsx
//
// Root-level slug catch-all. Only serves content that has explicitly opted
// in via Collection.rootSlug — every existing static route (/about, /admin,
// /iphone, /collections, etc.) is matched first by Next.js because it's more
// specific, so this file can never shadow them; it only catches slugs that
// don't match anything else.
//
// A slug here can mean one of two things:
//   1. A root-flagged Collection  → hauntedwallpapers.com/melodie-brawl-stars-wallpaper
//   2. One of that collection's Images → hauntedwallpapers.com/melodie-4k
//
// Both live at a single flat URL segment, matching how the admin panel's
// "Root-level URL" toggle is described to editors.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { db, getRelatedImages } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import { isPremiumLocked } from "@/lib/premium-lock";
import { sanitizeAdminHtml } from "@/lib/sanitize-html";
import AdminHtmlBlock from "@/components/AdminHtmlBlock";
import Breadcrumbs from "@/components/Breadcrumbs";
import KeyboardNav from "@/components/KeyboardNav";
import DownloadButton from "@/components/DownloadButton";
import RelatedWallpapers from "@/components/RelatedWallpapers";
import SocialShare from "@/components/SocialShare";
import FavoriteButton from "@/components/FavoriteButton";
import PageTracker from "@/components/PageTracker";
import RecentlyViewed from "@/components/RecentlyViewed";
import WallpaperReactions from "@/components/WallpaperReactions";
import BirthdayComments from "@/components/BirthdayComments";

export const revalidate = 3600;
export const dynamicParams = true;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

interface PageProps {
  params: Promise<{ slug: string }>;
}

type Kind = "collection" | "image" | null;

async function resolveKind(slug: string): Promise<Kind> {
  const collection = await db.collection.findUnique({
    where: { slug },
    select: { rootSlug: true, isPublished: true },
  });
  if (collection?.rootSlug && collection.isPublished) return "collection";

  const image = await db.image.findFirst({
    where: { slug, collection: { rootSlug: true, isPublished: true } },
    select: { id: true },
  });
  if (image) return "image";

  return null;
}

export async function generateStaticParams() {
  return [];
}

// ─────────────────────────────────────────────────────────────────────────
// METADATA
// ─────────────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const kind = await resolveKind(slug);

  if (kind === "collection") return collectionMetadata(slug);
  if (kind === "image") return imageMetadata(slug);
  return { title: "Not Found | Haunted Wallpapers" };
}

async function collectionMetadata(slug: string): Promise<Metadata> {
  const collection = await db.collection.findUnique({
    where: { slug },
    select: {
      title: true, description: true, metaDescription: true, thumbnail: true, thumbnailAlt: true,
      images: { select: { r2Key: true } },
    },
  });
  if (!collection) return { title: "Not Found | Haunted Wallpapers" };

  const thumbnailIsDuplicateOfChildImage =
    !!collection.thumbnail && collection.images.some((img) => img.r2Key === collection.thumbnail);

  const ogImage = collection.thumbnail && !thumbnailIsDuplicateOfChildImage
    ? `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${collection.thumbnail}`
    : `${SITE_URL}/og-image.jpg`;

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
      url: `${SITE_URL}/${slug}`,
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
    alternates: { canonical: `${SITE_URL}/${slug}` },
  };
}

async function imageMetadata(imageSlug: string): Promise<Metadata> {
  const image = await db.image.findFirst({
    where: { slug: imageSlug, collection: { rootSlug: true } },
    select: {
      title: true, description: true, metaDescription: true, altText: true,
      r2Key: true, tags: true, isAdult: true,
      collection: { select: { title: true } },
    },
  });
  if (!image) return { title: "Not Found | Haunted Wallpapers" };

  const ogImage = getPublicUrl(image.r2Key);
  const ogAlt = image.altText ?? image.title;

  const plainDesc = (image.metaDescription ?? image.description ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);

  const metaDesc =
    plainDesc ||
    `${image.title} — free dark wallpaper for iPhone, Android and PC. Download instantly, no account required.`;

  return {
    title: `${image.title} — Free Dark Wallpaper | Haunted Wallpapers`,
    description: metaDesc,
    keywords: [
      "dark wallpaper", "free wallpaper download", "gothic wallpaper", "horror wallpaper",
      image.title, image.collection?.title ?? "", ...image.tags,
    ],
    openGraph: {
      title: `${image.title} | Haunted Wallpapers`,
      description: metaDesc,
      url: `${SITE_URL}/${imageSlug}`,
      siteName: "Haunted Wallpapers",
      images: [{ url: ogImage, width: 1080, height: 1920, alt: ogAlt }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${image.title} | Haunted Wallpapers`,
      description: metaDesc,
      images: [ogImage],
    },
    alternates: { canonical: `${SITE_URL}/${imageSlug}` },
    ...(image.isAdult ? { robots: { index: false, follow: false, nosnippet: true } } : {}),
  };
}

// ─────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────

export default async function RootSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const kind = await resolveKind(slug);

  if (kind === "collection") return <RootCollectionView slug={slug} />;
  if (kind === "image") return <RootImageView imageSlug={slug} />;
  notFound();
}

// ─── Collection view ────────────────────────────────────────────────────

async function RootCollectionView({ slug }: { slug: string }) {
  const collection = await db.collection.findUnique({
    where: { slug },
    select: {
      id: true, slug: true, title: true, description: true,
      thumbnail: true, thumbnailAlt: true, icon: true,
      category: true, isAdult: true, isPublished: true, rootSlug: true,
      images: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true, slug: true, title: true, altText: true,
          r2Key: true, tags: true, sortOrder: true, updatedAt: true, deviceType: true,
        },
      },
    },
  });

  if (!collection) notFound();
  if (!collection.isPublished || !collection.rootSlug) notFound();

  const collectionImageIds = new Set(collection.images.map((i) => i.id));
  const mergedImages = collection.images;

  const relatedRaw = await db.collection.findMany({
    where: { slug: { not: slug }, isPublished: true, rootSlug: true },
    select: {
      slug: true, title: true, category: true, thumbnail: true, thumbnailAlt: true, rootSlug: true,
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
        .coll-layout { max-width: 1280px; margin: 0 auto; padding: 24px 24px 80px; }
        @media (min-width: 900px) { .coll-layout { padding: 32px 60px 80px; } }
        .coll-desktop-header { text-align: center; max-width: 760px; margin: 0 auto 32px; }
        @media (min-width: 900px) { .coll-desktop-header { margin: 0 auto 48px; } }
        .coll-info-eyebrow { font-family: monospace; font-size: 0.55rem; letter-spacing: 0.24em; text-transform: uppercase; color: #4a445a; margin: 0; }
        .coll-desktop-title { font-family: var(--font-cinzel, serif); font-size: clamp(1.8rem, 3vw, 2.6rem); font-weight: 700; line-height: 1.18; margin: 12px 0 16px; color: var(--text-primary, #e8e4f8); }
        .coll-desktop-count { display: inline-block; font-family: monospace; font-size: 0.58rem; letter-spacing: 0.16em; text-transform: uppercase; color: #8a809a; border: 1px solid rgba(255,255,255,0.08); padding: 5px 12px; border-radius: 3px; }
        .coll-info-adult { background: rgba(192,0,26,0.12); border: 1px solid rgba(192,0,26,0.35); color: #c0001a; font-family: monospace; font-size: 0.55rem; letter-spacing: 0.1em; padding: 4px 10px; border-radius: 3px; }
        .coll-mockup-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 32px 20px; }
        .coll-mockup-link { display: block; text-decoration: none; transition: transform 0.22s ease; }
        .coll-mockup-link:hover { transform: translateY(-6px); }
        .coll-phone { position: relative; width: 100%; aspect-ratio: 9 / 19.5; background: #080810; border-radius: 28px; border: 2px solid rgba(255,255,255,0.12); box-shadow: 0 0 0 1px rgba(0,0,0,0.9), 0 16px 48px rgba(0,0,0,0.85), 0 4px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08); overflow: hidden; }
        .coll-phone-notch { position: absolute; top: 8px; left: 50%; transform: translateX(-50%); width: 36%; height: 14px; background: #04040c; border-radius: 10px; z-index: 10; border: 1px solid rgba(255,255,255,0.05); }
        .coll-phone-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; border-radius: 26px; }
        .coll-phone-glass { position: absolute; inset: 0; border-radius: 26px; background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 35%, transparent 60%); pointer-events: none; z-index: 5; }
        .coll-phone-overlay { position: absolute; inset: 0; border-radius: 26px; background: linear-gradient(to top, rgba(10,8,18,0.82) 0%, transparent 50%); display: flex; align-items: flex-end; justify-content: center; padding-bottom: 18px; opacity: 0; transition: opacity 0.2s; z-index: 8; }
        .coll-mockup-link:hover .coll-phone-overlay { opacity: 1; }
        .coll-phone-overlay span { font-family: monospace; font-size: 0.5rem; letter-spacing: 0.16em; text-transform: uppercase; color: #c9a84c; }
        .coll-phone-label { margin-top: 10px; font-family: monospace; font-size: 0.52rem; letter-spacing: 0.1em; text-transform: uppercase; color: #c4bdd8; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .coll-desc-section { max-width: 720px; width: 100%; margin: 48px auto 0; padding-top: 32px; border-top: 1px solid rgba(255,255,255,0.07); overflow: hidden; box-sizing: border-box; }
        .coll-desc-heading { display: flex; align-items: center; justify-content: center; gap: 10px; font-family: var(--font-cinzel, serif); font-size: 0.9rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #ffffff; margin: 0 0 24px; }
        .coll-desc-heading .coll-desc-accent { color: #c0001a; }
        .coll-desc-body { font-family: monospace; font-size: 0.85rem; line-height: 1.9; color: #a89bc0; width: 100%; max-width: 100%; overflow-x: hidden; overflow-wrap: break-word; word-break: break-word; box-sizing: border-box; }
        .coll-desc-body p { margin: 0 0 14px; }
        .coll-desc-body p:last-child { margin: 0; }
        .coll-desc-body .admin-html-block { column-count: 1 !important; columns: auto !important; display: block !important; width: 100% !important; max-width: 100% !important; overflow-x: hidden !important; }
        .coll-desc-body .admin-html-block *:not(.hw-anime-bg-glow):not([class*="-bg-glow"]):not([class*="-glow-bg"]):not(.hw-anime-wrapper):not([class*="-wrapper"]) { max-width: 100% !important; position: static !important; float: none !important; box-sizing: border-box !important; }
        .coll-desc-body .admin-html-block [class*="-wrapper"] { position: relative !important; max-width: 100% !important; box-sizing: border-box !important; }
        .coll-desc-body .admin-html-block [class*="-bg-glow"], .coll-desc-body .admin-html-block [class*="-glow-bg"] { max-width: 500px !important; box-sizing: border-box !important; }
        .coll-desc-body .admin-html-block div, .coll-desc-body .admin-html-block section, .coll-desc-body .admin-html-block span[style*="column"] { display: block !important; float: none !important; width: 100% !important; max-width: 100% !important; column-count: 1 !important; columns: auto !important; }
        .coll-desc-body .admin-html-block img, .coll-desc-body .admin-html-block svg, .coll-desc-body .admin-html-block video { max-width: 100% !important; height: auto !important; }
      `}</style>

      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: collection.title },
      ]} />

      <div className="coll-layout">
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
                : `/${img.slug}`;
              const imgUrl = getPublicUrl(img.r2Key);

              return (
                <Link key={img.id} href={href} className="coll-mockup-link"
                  style={{ pointerEvents: locked ? "none" : "auto" }}>
                  <div className="coll-phone">
                    <div className="coll-phone-notch" aria-hidden="true" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgUrl}
                      alt={img.altText ?? img.title}
                      className="coll-phone-img"
                      loading={idx < 6 ? "eager" : "lazy"}
                      style={{ filter: locked ? "blur(10px) brightness(0.25)" : "none" }}
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

        <div className="coll-desc-section">
          <h2 className="coll-desc-heading">
            <span className="coll-desc-accent">✦</span> About This Collection
          </h2>
          <div className="coll-desc-body">
            {collection.description ? (
              <AdminHtmlBlock html={sanitizeAdminHtml(collection.description)} />
            ) : (
              <p>{fallbackDesc}</p>
            )}
          </div>
        </div>
      </div>

      {relatedCollections.length > 0 && (
        <section style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "48px 24px 64px", background: "rgba(12,8,20,0.4)" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <h2 style={{ fontFamily: "var(--font-cinzel, serif)", fontSize: "1rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#ffffff", marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ color: "#c0001a" }}>✦</span> You May Also Like
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "16px" }}>
              {relatedCollections.map((rc) => {
                const thumb = rc.thumbnail ? `${r2Base}/${rc.thumbnail}` : null;
                const rcHref = rc.rootSlug ? `/${rc.slug}` : `/collections/${rc.slug}`;
                return (
                  <Link key={rc.slug} href={rcHref} style={{ textDecoration: "none", display: "block" }}>
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
    <div style={{ position: "absolute", inset: 0, zIndex: 5, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", textAlign: "center", background: "rgba(10,8,16,0.5)" }}>
      <span style={{ fontSize: "1.6rem" }}>🔒</span>
      <span style={{ fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#c9a84c", fontFamily: "monospace", fontWeight: 700 }}>Back in the Vault</span>
      <span style={{ fontSize: "0.45rem", color: "rgba(201,168,76,0.6)", fontFamily: "monospace" }}>Returns in 24h</span>
    </div>
  );
}

// ─── Image detail view ──────────────────────────────────────────────────

async function RootImageView({ imageSlug }: { imageSlug: string }) {
  const image = await db.image.findFirst({
    where: { slug: imageSlug, collection: { rootSlug: true } },
    select: {
      id: true, slug: true, title: true, description: true,
      altText: true, r2Key: true, highResKey: true, tags: true,
      viewCount: true, sortOrder: true, collectionId: true,
      commentsEnabled: true,
      _count: { select: { downloads: true } },
    },
  });

  if (!image) notFound();

  const collection = await db.collection.findUnique({
    where: { id: image.collectionId! },
    select: {
      id: true, slug: true, title: true,
      images: {
        orderBy: { sortOrder: "asc" },
        select: { slug: true, title: true, altText: true, r2Key: true, sortOrder: true, tags: true },
      },
    },
  });

  if (!collection) notFound();

  db.image
    .update({ where: { id: image.id }, data: { viewCount: { increment: 1 } } })
    .catch(() => {});

  const thumbUrl = getPublicUrl(image.r2Key);
  const heroAlt = image.altText ?? `${image.title} — free dark wallpaper download`;

  const siblings = collection.images;
  const currentIdx = siblings.findIndex((s) => s.slug === imageSlug);
  const prevImage = currentIdx > 0 ? siblings[currentIdx - 1] : null;
  const nextImage = currentIdx < siblings.length - 1 ? siblings[currentIdx + 1] : null;

  const related = await getRelatedImages(image.id, image.tags, 6);

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      <KeyboardNav
        prevHref={prevImage ? `/${prevImage.slug}` : null}
        nextHref={nextImage ? `/${nextImage.slug}` : null}
      />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: collection.title, href: `/${collection.slug}` },
          { label: image.title },
        ]}
      />

      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "16px 24px 0" }}>
        <div className="image-detail-grid">
          <div className="shop-detail-image-wrap">
            <div style={{ position: "relative", width: "100%", aspectRatio: "9/16", background: "#070710", border: "1px solid rgba(139,0,0,0.3)", overflow: "hidden", borderRadius: "4px" }}>
              <Image
                src={thumbUrl}
                alt={heroAlt}
                fill
                priority
                fetchPriority="high"
                quality={90}
                unoptimized
                sizes="(max-width: 768px) 100vw, 420px"
                style={{ objectFit: "cover", objectPosition: "center" }}
              />
              {prevImage && (
                <Link
                  href={`/${prevImage.slug}`}
                  prefetch={true}
                  className="hw-img-arrow hw-img-arrow--prev"
                  aria-label={`Previous: ${prevImage.title}`}
                  title={prevImage.title}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </Link>
              )}
              {nextImage && (
                <Link
                  href={`/${nextImage.slug}`}
                  prefetch={true}
                  className="hw-img-arrow hw-img-arrow--next"
                  aria-label={`Next: ${nextImage.title}`}
                  title={nextImage.title}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              )}
            </div>

            <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div className="hw-glow-btn-wrap hw-glow-btn-wrap--download">
                <DownloadButton href={`/api/download/image/${image.id}`} slug={image.slug} downloadCount={0} />
              </div>
              <Link href="/blog/the-dark-aesthetic-a-complete-guide-to-customizing-your-devices" className="setup-guide-link">
                How to set wallpaper on iPhone, Android & PC →
              </Link>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold mt-3 leading-tight">
                {image.title}
              </h1>
              {image.tags.filter((t: string) => t.startsWith("badge-")).length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px", marginBottom: "4px" }}>
                  {image.tags.filter((t: string) => t.startsWith("badge-")).map((tag: string) => {
                    const badgeMap: Record<string, { label: string; color: string; bg: string }> = {
                      "badge-premium":   { label: "⭐ Premium",   color: "#c9a84c", bg: "rgba(201,168,76,0.15)" },
                      "badge-trending":  { label: "🔥 Trending",  color: "#ff6b35", bg: "rgba(255,107,53,0.15)" },
                      "badge-new":       { label: "✨ New",        color: "#4caf50", bg: "rgba(76,175,80,0.15)" },
                      "badge-hot":       { label: "💀 Hot",        color: "#e040fb", bg: "rgba(224,64,251,0.15)" },
                      "badge-exclusive": { label: "🌙 Exclusive",  color: "#42a5f5", bg: "rgba(66,165,245,0.15)" },
                      "badge-limited":   { label: "⏳ Limited",    color: "#ff5252", bg: "rgba(255,82,82,0.15)" },
                    };
                    const b = badgeMap[tag];
                    if (!b) return null;
                    return (
                      <span key={tag} style={{ background: b.bg, border: `1px solid ${b.color}`, color: b.color, fontSize: "0.65rem", fontFamily: "monospace", padding: "3px 10px", letterSpacing: "0.08em" }}>
                        {b.label}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            <SocialShare title={image.title} imageUrl={thumbUrl} pageUrl={`${SITE_URL}/${imageSlug}`} />

            {image.description && (
              <div
                className="font-body text-[1rem] text-[#a89bc0] leading-relaxed image-description-html"
                dangerouslySetInnerHTML={{ __html: sanitizeAdminHtml(image.description) }}
              />
            )}

            {image.tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {image.tags.map((tag) => (
                  <span key={tag} className="font-mono text-[0.55rem] tracking-[0.15em] uppercase border border-[#2a2535] px-3 py-1 text-[#8a8099]">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="detail-fav-row">
              <FavoriteButton
                size="md"
                className="detail-fav-inline"
                item={{ slug: image.slug, title: image.title, thumb: thumbUrl, href: `/${imageSlug}`, device: "collection" }}
              />
            </div>

            <WallpaperReactions imageId={image.id} />

            {image.commentsEnabled && (
              <BirthdayComments imageId={image.id} imageTitle={image.title} />
            )}
          </div>
        </div>
      </section>

      <PageTracker item={{ slug: image.slug, title: image.title, thumb: thumbUrl, href: `/${imageSlug}` }} />
      <RecentlyViewed currentSlug={image.slug} />
      <RelatedWallpapers images={related} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "@id": `${SITE_URL}/${imageSlug}#product`,
            name: image.title,
            description:
              (image.description ?? "")
                .replace(/<[^>]*>/g, " ")
                .replace(/&nbsp;/g, " ")
                .replace(/\s+/g, " ")
                .trim()
                .slice(0, 200) || `${image.title} — free dark wallpaper.`,
            url: `${SITE_URL}/${imageSlug}`,
            brand: { "@type": "Brand", name: "Haunted Wallpapers", url: SITE_URL },
            category: "Digital Products > Wallpapers",
            image: [{ "@type": "ImageObject", url: thumbUrl, contentUrl: thumbUrl, caption: image.altText ?? image.title }],
            additionalProperty: [
              { "@type": "PropertyValue", name: "Format", value: "JPEG (High Resolution)" },
              { "@type": "PropertyValue", name: "Aspect Ratio", value: "9:16 Portrait" },
              { "@type": "PropertyValue", name: "Instant Download", value: "Yes" },
            ],
            offers: {
              "@type": "Offer",
              url: `${SITE_URL}/${imageSlug}`,
              price: "0.00", priceCurrency: "USD",
              availability: "https://schema.org/InStock",
              seller: { "@type": "Organization", name: "Haunted Wallpapers", url: SITE_URL },
              shippingDetails: {
                "@type": "OfferShippingDetails",
                shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "USD" },
                shippingDestination: { "@type": "DefinedRegion", addressCountry: "US" },
                deliveryTime: {
                  "@type": "ShippingDeliveryTime",
                  handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 0, unitCode: "DAY" },
                  transitTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 0, unitCode: "DAY" },
                },
              },
              hasMerchantReturnPolicy: {
                "@type": "MerchantReturnPolicy",
                applicableCountry: "US",
                returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
                merchantReturnDays: 0,
              },
            },
            potentialAction: { "@type": "DownloadAction", target: `${SITE_URL}/api/download/image/${image.id}` },
          }),
        }}
      />
    </main>
  );
}