// app/shop/[slug]/[imageSlug]/page.tsx
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
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
import RecentlyViewed from "@/components/RecentlyViewed";
import WallpaperReactions from "@/components/WallpaperReactions";
import { sanitizeAdminHtml } from "@/lib/sanitize-html";
import BirthdayComments from "@/components/BirthdayComments";

export const revalidate = 3600;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string; imageSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, imageSlug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

  const [image, collection] = await Promise.all([
    db.image.findFirst({
      where: { slug: imageSlug, collection: { slug } },
      select: { title: true, description: true, metaDescription: true, altText: true, r2Key: true, tags: true, isAdult: true },
    }),
    db.collection.findUnique({
      where: { slug },
      select: { title: true },
    }),
  ]);

  if (!image) return { title: "Not Found | Haunted Wallpapers" };

  const ogImage = getPublicUrl(image.r2Key);
  const ogAlt = image.altText ?? image.title;

  // IMPORTANT: meta/OG/twitter descriptions must be plain text, never raw HTML.
  // Prefer the dedicated metaDescription field; otherwise strip tags from the
  // rich-HTML `description` field so we never leak markup into <meta> tags.
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
      image.title, collection?.title ?? "", ...image.tags,
    ],
    openGraph: {
      title: `${image.title} | Haunted Wallpapers`,
      description: metaDesc,
      url: `${siteUrl}/collections/${slug}/${imageSlug}`,
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
    alternates: { canonical: `${siteUrl}/collections/${slug}/${imageSlug}` },
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
      id: true, slug: true, title: true, description: true,
      altText: true, r2Key: true, highResKey: true, tags: true,
      viewCount: true, sortOrder: true, collectionId: true,
      commentsEnabled: true,
      _count: { select: { downloads: true } },
    },
  });

  if (!image) notFound();

  // ── PERF FIX: fetch collection with images in one query ──
  const collection = await db.collection.findUnique({
    where: { slug },
    select: {
      id: true, slug: true, title: true, rootSlug: true,
      images: {
        orderBy: { sortOrder: "asc" },
        select: { slug: true, title: true, altText: true, r2Key: true, sortOrder: true, tags: true },
      },
    },
  });

  if (!collection) notFound();

  // Root-level collections' wallpapers live at hauntedwallpapers.com/{imageSlug}
  // directly — send anyone hitting the old nested URL straight there.
  if (collection.rootSlug) permanentRedirect(`/${imageSlug}`);

  // NOTE: view-count increments happen here unconditionally because this
  // page is statically revalidated (export const revalidate = 3600 above).
  // shouldCountPageView() calls next/headers' headers(), which forces a
  // page from static -> dynamic mid-render and crashes with:
  //   "Error: Page changed from static to dynamic at runtime ... reason: headers"
  // Bot/IP filtering for view counts isn't compatible with a statically
  // cached page — do it in a dynamic API route instead if you need it back.
  db.image
    .update({ where: { id: image.id }, data: { viewCount: { increment: 1 } } })
    .catch(() => {});

  const thumbUrl = getPublicUrl(image.r2Key);
  const heroAlt = image.altText ?? `${image.title} — free dark wallpaper download`;

  const siblings = collection.images;
  const currentIdx = siblings.findIndex((s) => s.slug === imageSlug);
  const prevImage = currentIdx > 0 ? siblings[currentIdx - 1] : null;
  const nextImage = currentIdx < siblings.length - 1 ? siblings[currentIdx + 1] : null;
  const nextImageSrc = nextImage ? getPublicUrl(nextImage.r2Key) : null;

  const related = await getRelatedImages(image.id, image.tags, 6);

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
    >

      <KeyboardNav
        prevHref={prevImage ? `/collections/${slug}/${prevImage.slug}` : null}
        nextHref={nextImage ? `/collections/${slug}/${nextImage.slug}` : null}
      />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Collections", href: "/collections" },
          { label: collection.title, href: `/collections/${slug}` },
          { label: image.title },
        ]}
      />

      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "16px 24px 0" }}>
        <div className="image-detail-grid">

          {/* ── Left: image preview ── */}
          <div className="shop-detail-image-wrap">
            <div style={{
              position: "relative", width: "100%", aspectRatio: "9/16",
              background: "#070710", border: "1px solid rgba(139,0,0,0.3)",
              overflow: "hidden", borderRadius: "4px",
            }}>
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
                  href={`/collections/${slug}/${prevImage.slug}`}
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
                  href={`/collections/${slug}/${nextImage.slug}`}
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

          {/* ── Right: info ── */}
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

            <SocialShare title={image.title} imageUrl={thumbUrl} pageUrl={`${siteUrl}/collections/${slug}/${imageSlug}`} />

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
                item={{ slug: image.slug, title: image.title, thumb: thumbUrl, href: `/collections/${slug}/${imageSlug}`, device: "collection" }}
              />
              
            </div>

            {/* ── Reactions ── */}
            <WallpaperReactions imageId={image.id} />

            {/* ── Comments ── */}
            {image.commentsEnabled && (
              <BirthdayComments imageId={image.id} imageTitle={image.title} />
            )}
          </div>
        </div>
      </section>

      <PageTracker item={{ slug: image.slug, title: image.title, thumb: thumbUrl, href: `/collections/${slug}/${imageSlug}` }} />
      <RecentlyViewed currentSlug={image.slug} />
      <RelatedWallpapers images={related} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "@id": `${siteUrl}/collections/${slug}/${imageSlug}#product`,
            name: image.title,
            description:
              (image.description ?? "")
                .replace(/<[^>]*>/g, " ")
                .replace(/&nbsp;/g, " ")
                .replace(/\s+/g, " ")
                .trim()
                .slice(0, 200) || `${image.title} — free dark wallpaper.`,
            url: `${siteUrl}/collections/${slug}/${imageSlug}`,
            brand: { "@type": "Brand", name: "Haunted Wallpapers", url: siteUrl },
            category: "Digital Products > Wallpapers",
            image: [{ "@type": "ImageObject", url: thumbUrl, contentUrl: thumbUrl, caption: image.altText ?? image.title }],
            additionalProperty: [
              { "@type": "PropertyValue", name: "Format", value: "JPEG (High Resolution)" },
              { "@type": "PropertyValue", name: "Aspect Ratio", value: "9:16 Portrait" },
              { "@type": "PropertyValue", name: "Instant Download", value: "Yes" },
            ],
            offers: {
              "@type": "Offer",
              url: `${siteUrl}/collections/${slug}/${imageSlug}`,
              price: "0.00", priceCurrency: "USD",
              availability: "https://schema.org/InStock",
              seller: { "@type": "Organization", name: "Haunted Wallpapers", url: siteUrl },
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
            potentialAction: { "@type": "DownloadAction", target: `${siteUrl}/api/download/image/${image.id}` },
          }),
        }}
      />
    </main>
  );
}