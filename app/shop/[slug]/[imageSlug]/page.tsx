// app/shop/[slug]/[imageSlug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import KeyboardNav from "@/components/KeyboardNav";
import { db, getRelatedImages } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import Breadcrumbs from "@/components/Breadcrumbs";
import DownloadButton from "@/components/DownloadButton";
import RelatedWallpapers from "@/components/RelatedWallpapers";
import SocialShare from "@/components/SocialShare";
import FavoriteButton from "@/components/FavoriteButton";
import PageTracker from "@/components/PageTracker";
import WallpaperReactions from "@/components/WallpaperReactions";
import RecentlyViewed from "@/components/RecentlyViewed";
import { shouldCountPageView } from "@/lib/analytics-filter";

export const dynamic = "force-dynamic";

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
    select: { title: true, description: true, altText: true, r2Key: true, tags: true, isAdult: true },
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
    ...(image.isAdult ? { robots: { index: false, follow: false, nosnippet: true } } : {}),
  };
}

export async function generateStaticParams() {
  return [];
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
      _count: { select: { downloads: true } },
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
        select: { slug: true, title: true, altText: true, r2Key: true, sortOrder: true, tags: true },
      },
    },
  });

  if (!collection) notFound();

  // Fire-and-forget view count — only for real humans, skip bots & admin IPs
  if (await shouldCountPageView()) {
    db.image
      .update({ where: { id: image.id }, data: { viewCount: { increment: 1 } } })
      .catch(() => {});
  }

  const thumbUrl = getPublicUrl(image.r2Key);

  // Prev/next within the same collection
  const siblings = collection.images;
  const currentIdx = siblings.findIndex((s) => s.slug === imageSlug);
  const prevImage = currentIdx > 0 ? siblings[currentIdx - 1] : null;
  const nextImage =
    currentIdx < siblings.length - 1 ? siblings[currentIdx + 1] : null;

  // Tag-sorted strip: siblings sharing most tags appear first
  const imageTags = new Set(image.tags);
  const tagSortedStrip = siblings
    .filter((s) => s.slug !== imageSlug)
    .sort((a, b) => {
      const aScore = ((a as any).tags as string[] ?? []).filter((t) => imageTags.has(t)).length;
      const bScore = ((b as any).tags as string[] ?? []).filter((t) => imageTags.has(t)).length;
      return bScore - aScore;
    })
    .slice(0, 4);

  const related = await getRelatedImages(image.id, image.tags, 6);

  // Rich alt text for the main hero image
  const heroAlt = image.altText ?? `${image.title} — free dark wallpaper download`;

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
    >

      {/* ── More Dark Art — small strip at top ── */}
      {tagSortedStrip.length > 0 && (
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "10px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: "6px", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-space, monospace)", fontSize: "0.45rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", whiteSpace: "nowrap", marginRight: "4px" }}>More ▸</span>
          {tagSortedStrip.map((img) => (
            <Link key={img.slug} href={`/shop/${slug}/${img.slug}`} className="more-strip-link">
              <div className="more-strip-thumb" style={{ position: "relative", width: "44px", height: "78px", overflow: "hidden", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.08)" }}>
                <Image src={getPublicUrl(img.r2Key)} alt={img.title} fill className="object-cover" unoptimized sizes="44px" />
              </div>
            </Link>
          ))}
        </div>
      )}

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Collections", href: "/collections" },
          { label: collection.title, href: `/shop/${slug}` },
          { label: image.title },
        ]}
      />


      {/* ── Main layout ── */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "16px 24px 0" }}>
        <div className="image-detail-grid">

          {/* ── Left: image preview ── */}
          <div className="shop-detail-image-wrap">
            <div style={{
              position: "relative",
              width: "100%",
              aspectRatio: "9/16",
              background: "#070710",
              border: "1px solid rgba(139,0,0,0.3)",
              overflow: "hidden",
              borderRadius: "4px",
            }}>
              <Image
                src={thumbUrl}
                alt={heroAlt}
                fill
                priority
                quality={90}
                unoptimized
                sizes="(max-width: 768px) 100vw, 420px"
                style={{ objectFit: "cover", objectPosition: "center" }}
              />
            </div>

            {/* ── Reactions + Download below image ── */}
            <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <WallpaperReactions imageId={image.id} />
              <div className="hw-glow-btn-wrap hw-glow-btn-wrap--download">
                <DownloadButton href={`/api/download/image/${image.id}`} downloadCount={image._count?.downloads ?? 0} />
              </div>
              <Link
                href="/blog/the-dark-aesthetic-a-complete-guide-to-customizing-your-devices"
                className="setup-guide-link"
              >
                How to set wallpaper on iPhone, Android & PC →
              </Link>
            </div>
          </div>

          {/* ── Right: info ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold mt-3 leading-tight">
                {image.title}
              </h1>
              {/* FOMO Badges */}
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

            {/* ── Share buttons — above description, same as iphone page ── */}
            <SocialShare
              title={image.title}
              imageUrl={thumbUrl}
              pageUrl={`${siteUrl}/shop/${slug}/${imageSlug}`}
            />

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



            {/* Reactions and download moved below image */}

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
          .shop-detail-image-wrap {
            flex: 0 0 380px;
            position: sticky;
            top: 100px;
            z-index: 1;
            align-self: flex-start;
          }
          .image-detail-grid > *:last-child {
            flex: 1;
            min-width: 0;
          }
        }
        @media (min-width: 1024px) {
          .shop-detail-image-wrap { flex: 0 0 420px; }
        }


        .hw-glow-btn-wrap--download { animation: hwDlGlowPulse 2.8s ease-in-out infinite; border-radius: 2px; }
        @keyframes hwDlGlowPulse {
          0%, 100% { box-shadow: 0 0 12px rgba(192,0,26,0.35), 0 0 28px rgba(192,0,26,0.15); }
          50%       { box-shadow: 0 0 22px rgba(192,0,26,0.65), 0 0 50px rgba(192,0,26,0.28); }
        }
        /* Social share styles */
        .social-share { border: 1px solid rgba(192,0,26,0.25); border-radius: 6px; padding: 12px 14px; background: rgba(192,0,26,0.04); }
        .social-share-label { font-family: var(--font-space, monospace); font-size: 0.55rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px; }
        .social-share-btns { display: flex; flex-wrap: wrap; gap: 8px; }
        .social-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 4px; font-size: 0.72rem; font-family: var(--font-space, monospace); letter-spacing: 0.06em; text-decoration: none; border: 1px solid var(--border-dim, rgba(255,255,255,0.1)); color: var(--text-primary); background: transparent; cursor: pointer; transition: border-color 0.2s, background 0.2s; white-space: nowrap; }
        .social-btn svg { width: 14px; height: 14px; fill: currentColor; flex-shrink: 0; }
        .social-btn:hover { border-color: rgba(255,255,255,0.25); background: rgba(255,255,255,0.04); }
        .social-btn--native { border-color: rgba(192,0,26,0.4); color: #f0e8e8; }
        .social-btn--pinterest { color: #e60023; border-color: rgba(230,0,35,0.3); }
        .social-btn--x { color: var(--text-primary); }
        .social-btn--whatsapp { color: #25d366; border-color: rgba(37,211,102,0.3); }
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


      <KeyboardNav
        prevHref={prevImage ? `/shop/${slug}/${prevImage.slug}` : null}
        nextHref={nextImage ? `/shop/${slug}/${nextImage.slug}` : null}
      />

      <PageTracker
        item={{
          slug: image.slug,
          title: image.title,
          thumb: thumbUrl,
          href: `/shop/${slug}/${imageSlug}`,
        }}
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