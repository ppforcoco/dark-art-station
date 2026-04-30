// app/shop/[slug]/[imageSlug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db, getRelatedImages } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import AdSlot from "@/components/AdSlot";
import DownloadButton from "@/components/DownloadButton";
import RelatedWallpapers from "@/components/RelatedWallpapers";
import SocialShare from "@/components/SocialShare";
import FavoriteButton from "@/components/FavoriteButton";
import PageTracker from "@/components/PageTracker";
import RecentlyViewed from "@/components/RecentlyViewed";

export const dynamicParams = true;
export const revalidate = 0; // always fetch fresh from DB

interface PageProps {
  params: Promise<{ slug: string; imageSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, imageSlug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

  const image = await db.image.findFirst({
    where: { slug: imageSlug, collection: { slug } },
    select: { title: true, description: true, altText: true, r2Key: true, tags: true },
  });
  const collection = await db.collection.findUnique({
    where: { slug },
    select: { title: true },
  });

  if (!image) return { title: "Not Found | Haunted Wallpapers" };

  const ogImage = getPublicUrl(image.r2Key);

  // Use altText as the OG image alt (it's richer than just the title)
  const ogAlt = image.altText ?? image.title;

  // Use description as meta description — it already has the SEO tail appended
  const metaDesc =
    image.description ??
    `${image.title} — free dark wallpaper for iPhone, Android and PC. Download instantly, no account required.`;

  return {
    title: `${image.title} — Free Dark Wallpaper | Haunted Wallpapers`,
    description: metaDesc,
    keywords: [
      "dark wallpaper",
      "free wallpaper download",
      "gothic wallpaper",
      "horror wallpaper",
      image.title,
      collection?.title ?? "",
      ...image.tags,
    ],
    openGraph: {
      title: `${image.title} | Haunted Wallpapers`,
      description: metaDesc,
      url: `${siteUrl}/shop/${slug}/${imageSlug}`,
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

  const image = await db.image.findFirst({
    where: { slug: imageSlug, collection: { slug } },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      altText: true,
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
        select: { slug: true, title: true, altText: true, r2Key: true, sortOrder: true },
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

  // Rich alt text for the main hero image
  const heroAlt = image.altText ?? `${image.title} — free dark wallpaper download`;

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
    >

      <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN} width={728} height={90} />

      {/* ── Main layout ── */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "16px 24px 0" }}>
        <div className="image-detail-grid">

          {/* ── Left: image preview ── */}
          <div style={{ position: "relative", width: "100%", maxWidth: "480px", margin: "0 auto", alignSelf: "flex-start" }}>
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
                alt={heroAlt}
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
              <h1 className="font-display text-2xl md:text-3xl font-bold mt-3 leading-tight">
                {image.title}
              </h1>
            </div>

            {image.description && (
              <div
                className="font-body text-[1rem] text-[#a89bc0] leading-relaxed image-description-html"
                dangerouslySetInnerHTML={{ __html: image.description }}
              />
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
              <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase px-3 py-1" style={{ color: "var(--text-muted)", border: "1px solid var(--border-dim)" }}>
                HD · Free
              </span>
              <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase px-3 py-1" style={{ color: "var(--text-muted)", border: "1px solid var(--border-dim)" }}>
                JPEG
              </span>
              <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase px-3 py-1" style={{ color: "var(--text-muted)", border: "1px solid var(--border-dim)" }}>
                9:16 Portrait
              </span>
            </div>

            {/* ── DOWNLOAD SECTION ── */}
            <div className="download-section">
              <DownloadButton href={`/api/download/image/${image.id}`}>
                ↓ Download Free
              </DownloadButton>

              <Link
                href="/blog/the-dark-aesthetic-a-complete-guide-to-customizing-your-devices"
                className="setup-guide-link"
              >
                How to set wallpaper on iPhone, Android & PC →
              </Link>

              <p className="download-note">
                JPEG · HD resolution · No account · No watermark · Instant download
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
          align-items: flex-start;
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
            z-index: 1;
            align-self: flex-start;
          }
          .image-detail-grid > *:last-child {
            flex: 1;
          }
        }

        /* ── Download section ── */
        .download-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 20px;
          border: 1px solid rgba(139,0,0,0.3);
          background: rgba(7,7,16,0.6);
        }
        [data-theme="fog"] .download-section {
          background: #f0ebe0;
          border: 1px solid rgba(139,0,0,0.2);
          box-shadow: 0 2px 14px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.5);
        }
        [data-theme="ghost"] .download-section {
          background: rgba(26,26,30,0.8);
          border-color: rgba(248,248,255,0.1);
        }
        [data-theme="ember"] .download-section {
          background: rgba(10,6,0,0.8);
          border-color: rgba(255,102,0,0.25);
        }

        .setup-guide-link {
          font-family: var(--font-space), monospace;
          font-size: 0.65rem;
          letter-spacing: 0.1em;
          color: #9a90a9;
          text-decoration: underline;
          text-underline-offset: 2px;
          transition: color 0.2s ease;
          text-align: center;
          display: inline-block;
        }
        .setup-guide-link:hover { color: #f0ecff; }

        .download-note {
          font-family: var(--font-space), monospace;
          font-size: 0.52rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted, #4a445a);
          margin: 0;
          text-align: center;
        }
        [data-theme="fog"] .download-note { color: #7a7468; }

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
          color: var(--text-muted, #6b6480);
        }
        [data-theme="fog"] .detail-fav-label { color: #7a7468; }

        /* ── Prev / Next navigation ── */
        .prev-next-nav {
          max-width: 1280px;
          margin: 0 auto;
          padding: 40px 24px 40px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          border-top: 1px solid rgba(42,37,53,0.6);
          position: relative;
          z-index: 10;
          background: var(--bg-primary, #0c0b14);
        }
        [data-theme="fog"] .prev-next-nav { border-top-color: #ddd8ce; }
        .prev-next-link {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          border: 1px solid rgba(42,37,53,0.9);
          text-decoration: none;
          background: rgba(7,7,16,0.5);
          transition: border-color 0.2s, background 0.2s;
          min-height: 80px;
          overflow: hidden;
        }
        .prev-next-link--next {
          flex-direction: row-reverse;
          text-align: right;
        }
        .prev-next-link:hover {
          border-color: rgba(139,0,0,0.5);
          background: rgba(12,11,20,0.8);
        }
        [data-theme="fog"] .prev-next-link {
          background: #f0ebe0;
          border-color: #cdc8bc;
        }
        [data-theme="fog"] .prev-next-link:hover {
          border-color: rgba(139,0,0,0.4);
          background: #e8e3d8;
        }
        [data-theme="ghost"] .prev-next-link {
          background: rgba(26,26,30,0.7);
          border-color: rgba(255,255,255,0.08);
        }
        [data-theme="ember"] .prev-next-link {
          background: rgba(10,6,0,0.6);
          border-color: rgba(255,102,0,0.15);
        }

        .prev-next-thumb-wrap {
          position: relative;
          flex-shrink: 0;
          width: 40px;
          height: 71px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 3px;
        }
        [data-theme="fog"] .prev-next-thumb-wrap { border-color: rgba(0,0,0,0.1); }

        .prev-next-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
          flex: 1;
        }
        .prev-next-label {
          font-family: var(--font-space), monospace;
          font-size: 0.48rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #4a445a;
          flex-shrink: 0;
        }
        [data-theme="fog"] .prev-next-label { color: #8a8468; }
        .prev-next-title {
          font-family: var(--font-cormorant), serif;
          font-style: italic;
          font-size: 0.85rem;
          color: var(--text-primary);
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @media (max-width: 479px) {
          .prev-next-nav { gap: 10px; }
          .prev-next-link { padding: 10px 12px; gap: 10px; min-height: 64px; }
          .prev-next-thumb-wrap { width: 32px; height: 57px; }
          .prev-next-title { font-size: 0.78rem; }
        }
      `}</style>

      {/* ── Prev / Next within collection ── */}
      {(prevImage || nextImage) && (
        <nav className="prev-next-nav">
          {prevImage ? (
            <Link href={`/shop/${slug}/${prevImage.slug}`} className="prev-next-link">
              <div className="prev-next-thumb-wrap">
                <Image
                  src={getPublicUrl(prevImage.r2Key)}
                  alt={prevImage.altText ?? `${prevImage.title} — dark wallpaper`}
                  fill
                  className="object-cover"
                  unoptimized
                  sizes="60px"
                />
              </div>
              <div className="prev-next-text">
                <span className="prev-next-label">← Previous</span>
                <span className="prev-next-title">{prevImage.title}</span>
              </div>
            </Link>
          ) : (
            <div />
          )}

          {nextImage ? (
            <Link
              href={`/shop/${slug}/${nextImage.slug}`}
              className="prev-next-link prev-next-link--next"
            >
              <div className="prev-next-thumb-wrap">
                <Image
                  src={getPublicUrl(nextImage.r2Key)}
                  alt={nextImage.altText ?? `${nextImage.title} — dark wallpaper`}
                  fill
                  className="object-cover"
                  unoptimized
                  sizes="60px"
                />
              </div>
              <div className="prev-next-text">
                <span className="prev-next-label">Next →</span>
                <span className="prev-next-title">{nextImage.title}</span>
              </div>
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
      <RecentlyViewed currentSlug={image.slug} />

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
              `${image.title} — free dark wallpaper.`,
            url: `${siteUrl}/shop/${slug}/${imageSlug}`,
            brand: {
              "@type": "Brand",
              name: "Haunted Wallpapers",
              url: siteUrl,
            },
            category: "Digital Products > Wallpapers",
            image: [
              {
                "@type": "ImageObject",
                url: thumbUrl,
                contentUrl: thumbUrl,
                caption: image.altText ?? image.title,
              },
            ],
            additionalProperty: [
              { "@type": "PropertyValue", name: "Format", value: "JPEG (High Resolution)" },
              { "@type": "PropertyValue", name: "Aspect Ratio", value: "9:16 Portrait" },
              { "@type": "PropertyValue", name: "Instant Download", value: "Yes" },
            ],
            offers: {
              "@type": "Offer",
              url: `${siteUrl}/shop/${slug}/${imageSlug}`,
              price: "0.00",
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
              seller: {
                "@type": "Organization",
                name: "Haunted Wallpapers",
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