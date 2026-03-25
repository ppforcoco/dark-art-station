// app/shop/[slug]/[imageSlug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db, getRelatedImages } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import AdSlot from "@/components/AdSlot";
import Breadcrumbs from "@/components/Breadcrumbs";
import DownloadButton from "@/components/DownloadButton";
import RelatedWallpapers from "@/components/RelatedWallpapers";
import SocialShare from "@/components/SocialShare";
import FavoriteButton from "@/components/FavoriteButton";
import PageTracker from "@/components/PageTracker";
import RecentlyViewed from "@/components/RecentlyViewed";

export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string; imageSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, imageSlug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

  const image = await db.image.findFirst({
    where: { slug: imageSlug, collection: { slug } },
    select: { title: true, description: true, r2Key: true, tags: true },
  });
  const collection = await db.collection.findUnique({
    where: { slug },
    select: { title: true },
  });

  if (!image) return { title: "Not Found | Haunted Wallpapers" };

  const ogImage = getPublicUrl(image.r2Key);
  const tagLine = image.tags.slice(0, 3).map((t) => `#${t}`).join(" ");

  return {
    title: `${image.title} — Free Dark Wallpaper | Haunted Wallpapers`,
    description:
      image.description ??
      `${image.title} — free 4K dark wallpaper from the ${collection?.title ?? "Haunted"} collection. ${tagLine}. Download for iPhone, Android or PC instantly.`,
    keywords: [
      "dark wallpaper",
      "free wallpaper download",
      image.title,
      collection?.title ?? "",
      ...image.tags,
    ],
    openGraph: {
      title: `${image.title} | Haunted Wallpapers`,
      description:
        image.description ?? `Free 4K dark wallpaper: ${image.title}`,
      url: `${siteUrl}/shop/${slug}/${imageSlug}`,
      siteName: "Haunted Wallpapers",
      images: [{ url: ogImage, width: 1080, height: 1920, alt: image.title }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${image.title} | Haunted Wallpapers`,
      description:
        image.description ?? `Free 4K dark wallpaper: ${image.title}`,
      images: [ogImage],
    },
    alternates: { canonical: `${siteUrl}/shop/${slug}/${imageSlug}` },
  };
}

export async function generateStaticParams() {
  const collections = await db.collection.findMany({
    select: { slug: true, images: { select: { slug: true } } },
  });
  return collections.flatMap((c) =>
    c.images.map((img) => ({ slug: c.slug, imageSlug: img.slug }))
  );
}

export default async function CollectionImagePage({ params }: PageProps) {
  const { slug, imageSlug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

  // Find image that belongs to this collection
  const image = await db.image.findFirst({
    where: { slug: imageSlug, collection: { slug } },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      r2Key: true,
      highResKey: true,
      tags: true,
      viewCount: true,
      sortOrder: true,
      collectionId: true,
    },
  });

  if (!image) notFound();

  const collection = await db.collection.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      images: {
        orderBy: { sortOrder: "asc" },
        select: { slug: true, title: true, r2Key: true, sortOrder: true },
      },
    },
  });

  if (!collection) notFound();

  // Fire-and-forget view count increment
  db.image
    .update({ where: { id: image.id }, data: { viewCount: { increment: 1 } } })
    .catch(() => {});

  const thumbUrl = getPublicUrl(image.r2Key);

  // Prev/next within the same collection
  const siblings = collection.images;
  const currentIdx = siblings.findIndex((s) => s.slug === imageSlug);
  const prevImage = currentIdx > 0 ? siblings[currentIdx - 1] : null;
  const nextImage =
    currentIdx < siblings.length - 1 ? siblings[currentIdx + 1] : null;

  const related = await getRelatedImages(image.id, image.tags, 6);

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Collections", href: "/collections" },
          { label: collection.title, href: `/shop/${slug}` },
          { label: image.title },
        ]}
      />

      <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN} width={728} height={90} />

      {/* ── Main layout ── */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "16px 24px 40px" }}>
        <div className="image-detail-grid">

          {/* ── Left: image preview ── */}
          <div style={{ position: "relative", width: "100%", maxWidth: "480px", margin: "0 auto" }}>
            <div
              style={{
                position: "relative",
                width: "100%",
                paddingTop: "177.78%", // 9:16 portrait
                background: "#070710",
                border: "1px solid rgba(139,0,0,0.3)",
                overflow: "hidden",
              }}
            >
              <Image
                src={thumbUrl}
                alt={image.title}
                fill
                priority
                quality={90}
                unoptimized
                sizes="(max-width: 768px) 100vw, 480px"
                style={{ objectFit: "cover", objectPosition: "center" }}
              />
            </div>
          </div>

          {/* ── Right: info + download ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <Link
                href={`/shop/${slug}`}
                className="font-mono text-[0.6rem] tracking-[0.25em] uppercase text-[#8b0000] hover:text-[#c0001a] transition-colors"
              >
                ← {collection.title}
              </Link>
              <h1 className="font-display text-2xl md:text-3xl font-bold mt-3 leading-tight">
                {image.title}
              </h1>
            </div>

            {image.description && (
              <p className="font-body text-[1rem] text-[#a89bc0] leading-relaxed">
                {image.description}
              </p>
            )}

            {/* Tags */}
            {image.tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {image.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[0.55rem] tracking-[0.15em] uppercase border border-[#2a2535] px-3 py-1 text-[#8a8099]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Format badge */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
              <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-[#4a445a] border border-[#2a2535] px-3 py-1">
                4K · Free
              </span>
              <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-[#4a445a] border border-[#2a2535] px-3 py-1">
                JPEG
              </span>
              <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-[#4a445a] border border-[#2a2535] px-3 py-1">
                9:16 Portrait
              </span>
            </div>

            {/* ── DOWNLOAD SECTION ── */}
            <div className="download-section">
              <p className="download-section-label">Choose your device:</p>

              {/* iPhone download */}
              <a
                href={`/api/download/image/${image.id}`}
                className="device-download-btn iphone-btn"
                download
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                  <line x1="12" y1="18" x2="12.01" y2="18"/>
                </svg>
                ↓ Download for iPhone
              </a>

              {/* Android download */}
              <a
                href={`/api/download/image/${image.id}`}
                className="device-download-btn android-btn"
                download
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                  <path d="M8 12h8M12 8v8"/>
                </svg>
                ↓ Download for Android
              </a>

              <p className="download-note">
                JPEG · 4K resolution · No account · No watermark · Instant download
              </p>
            </div>

            {/* Save to favorites */}
            <div className="detail-fav-row">
              <FavoriteButton
                size="md"
                className="detail-fav-inline"
                item={{
                  slug: image.slug,
                  title: image.title,
                  thumb: thumbUrl,
                  href: `/shop/${slug}/${imageSlug}`,
                  device: "collection",
                }}
              />
              <span className="detail-fav-label">Save to Favorites</span>
            </div>

            <AdSlot
              slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR}
              format="rectangle"
              width={300}
              height={250}
              className="mt-2"
            />
          </div>
        </div>
      </section>

      {/* ── Styles ── */}
      <style>{`
        .image-detail-grid {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        @media (min-width: 768px) {
          .image-detail-grid {
            flex-direction: row;
            align-items: flex-start;
            gap: 48px;
          }
          .image-detail-grid > *:first-child {
            flex: 1;
            max-width: 480px !important;
            position: sticky;
            top: 100px;
          }
          .image-detail-grid > *:last-child {
            flex: 1;
          }
        }

        /* ── Download section ── */
        .download-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 20px;
          border: 1px solid rgba(139,0,0,0.3);
          background: rgba(7,7,16,0.6);
        }
        .download-section-label {
          font-family: var(--font-space), monospace;
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #6b6480;
          margin: 0 0 4px;
        }

        /* Device buttons */
        .device-download-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          min-height: 56px;
          padding: 0 20px;
          box-sizing: border-box;
          font-family: var(--font-space), monospace;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          text-decoration: none !important;
          text-align: center;
          transition: background-color 0.2s ease, filter 0.2s ease;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          cursor: pointer;
          border: 1px solid;
        }
        .iphone-btn {
          background-color: #8b0000;
          border-color: #8b0000;
          color: #ffffff !important;
        }
        .iphone-btn:hover {
          background-color: #a80000;
          filter: brightness(1.1);
        }
        .android-btn {
          background-color: transparent;
          border-color: #2a7a3a;
          color: #5db870 !important;
        }
        .android-btn:hover {
          background-color: rgba(42,122,58,0.15);
          border-color: #5db870;
        }
        .download-note {
          font-family: var(--font-space), monospace;
          font-size: 0.5rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #4a445a;
          margin: 4px 0 0;
          text-align: center;
        }

        /* Fav row */
        .detail-fav-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .detail-fav-label {
          font-family: var(--font-space), monospace;
          font-size: 0.6rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #6b6480;
        }
      `}</style>

      {/* ── Prev / Next within collection ── */}
      {(prevImage || nextImage) && (
        <nav
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0 24px 40px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}
        >
          {prevImage ? (
            <Link
              href={`/shop/${slug}/${prevImage.slug}`}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                padding: "12px",
                border: "1px solid #2a2535",
                textDecoration: "none",
              }}
              className="hover:border-[rgba(139,0,0,0.5)] transition-colors"
            >
              <span className="font-mono text-[0.5rem] tracking-[0.2em] uppercase text-[#4a445a]">
                ← Previous
              </span>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "9/16",
                  overflow: "hidden",
                  maxWidth: "170px",
                  margin: "0 auto",
                }}
              >
                <Image
                  src={getPublicUrl(prevImage.r2Key)}
                  alt={prevImage.title}
                  fill
                  className="object-cover"
                  unoptimized
                  sizes="(max-width: 640px) 45vw, 200px"
                />
              </div>
              <span
                className="font-body italic text-[0.8rem] text-[#f0ecff]"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical" as const,
                  overflow: "hidden",
                }}
              >
                {prevImage.title}
              </span>
            </Link>
          ) : (
            <div />
          )}

          {nextImage ? (
            <Link
              href={`/shop/${slug}/${nextImage.slug}`}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                padding: "12px",
                border: "1px solid #2a2535",
                textDecoration: "none",
                textAlign: "right",
              }}
              className="hover:border-[rgba(139,0,0,0.5)] transition-colors"
            >
              <span className="font-mono text-[0.5rem] tracking-[0.2em] uppercase text-[#4a445a]">
                Next →
              </span>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "9/16",
                  overflow: "hidden",
                  maxWidth: "170px",
                  margin: "0 auto",
                }}
              >
                <Image
                  src={getPublicUrl(nextImage.r2Key)}
                  alt={nextImage.title}
                  fill
                  className="object-cover"
                  unoptimized
                  sizes="(max-width: 640px) 45vw, 200px"
                />
              </div>
              <span
                className="font-body italic text-[0.8rem] text-[#f0ecff]"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical" as const,
                  overflow: "hidden",
                }}
              >
                {nextImage.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
        </nav>
      )}

      <AdSlot
        slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER}
        width={728}
        height={90}
      />

      <RelatedWallpapers images={related} heading="More Dark Art You'll Like" />

      <PageTracker
        item={{
          slug: image.slug,
          title: image.title,
          thumb: thumbUrl,
          href: `/shop/${slug}/${imageSlug}`,
        }}
      />
      <SocialShare
        title={image.title}
        imageUrl={thumbUrl}
        pageUrl={`${siteUrl}/shop/${slug}/${imageSlug}`}
      />
      <RecentlyViewed />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "@id": `${siteUrl}/shop/${slug}/${imageSlug}#product`,
            name: image.title,
            description:
              image.description ??
              `${image.title} — free 4K dark wallpaper.`,
            url: `${siteUrl}/shop/${slug}/${imageSlug}`,
            brand: {
              "@type": "Brand",
              name: "HAUNTED WALLPAPERS",
              url: siteUrl,
            },
            category: "Digital Products > Wallpapers",
            image: [
              {
                "@type": "ImageObject",
                url: thumbUrl,
                contentUrl: thumbUrl,
                caption: image.title,
              },
            ],
            additionalProperty: [
              {
                "@type": "PropertyValue",
                name: "Format",
                value: "JPEG (4K High Resolution)",
              },
              {
                "@type": "PropertyValue",
                name: "Aspect Ratio",
                value: "9:16 Portrait",
              },
              {
                "@type": "PropertyValue",
                name: "Instant Download",
                value: "Yes",
              },
            ],
            offers: {
              "@type": "Offer",
              url: `${siteUrl}/shop/${slug}/${imageSlug}`,
              price: "0.00",
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
              seller: {
                "@type": "Organization",
                name: "HAUNTED WALLPAPERS",
                url: siteUrl,
              },
            },
            potentialAction: {
              "@type": "DownloadAction",
              target: `${siteUrl}/api/download/image/${image.id}`,
            },
          }),
        }}
      />
    </main>
  );
}