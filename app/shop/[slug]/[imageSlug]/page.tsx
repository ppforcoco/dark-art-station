// app/shop/[slug]/[imageSlug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import AdSlot from "@/components/AdSlot";
import DownloadButton from "@/components/DownloadButton";
import SocialShare from "@/components/SocialShare";
import DeviceMockup from "@/components/DeviceMockup";
import RelatedWallpapers from "@/components/RelatedWallpapers";
import { getRelatedImages } from "@/lib/db";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageTracker from "@/components/PageTracker";
import RecentlyViewed from "@/components/RecentlyViewed";
import FavoriteButton from "@/components/FavoriteButton";

interface PageProps {
  params: Promise<{ slug: string; imageSlug: string }>;
}

// ─── SEO ─────────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, imageSlug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

  const image = await db.image.findUnique({
    where: { slug: imageSlug },
    select: {
      title: true,
      description: true,
      r2Key: true,
      collection: { select: { title: true, category: true, slug: true } },
    },
  });

  if (!image || !image.collection || image.collection.slug !== slug) {
    return { title: "Not Found | HAUNTED WALLPAPERS" };
  }

  const ogImage = getPublicUrl(image.r2Key);

  return {
    title: `${image.title} — ${image.collection.title} | HAUNTED WALLPAPERS`,
    description: image.description ?? `${image.title} from the ${image.collection.title} collection. Dark fantasy art for download.`,
    keywords: [
      image.collection.category,
      image.title,
      image.collection.title,
      "dark wallpaper",
      "dark art",
      "AI art",
      "desktop wallpaper",
    ],
    openGraph: {
      title: `${image.title} | HAUNTED WALLPAPERS`,
      description: image.description ?? `Dark fantasy art: ${image.title}`,
      url: `${siteUrl}/shop/${slug}/${imageSlug}`,
      siteName: "HAUNTED WALLPAPERS",
      images: [{ url: ogImage, width: 1200, height: 630, alt: image.title }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${image.title} | HAUNTED WALLPAPERS`,
      description: image.description ?? `Dark fantasy art: ${image.title}`,
      images: [ogImage],
    },
    alternates: { canonical: `${siteUrl}/shop/${slug}/${imageSlug}` },
  };
}

export async function generateStaticParams() {
  const images = await db.image.findMany({
    select: { slug: true, collection: { select: { slug: true } } },
  });
  return images
    .filter((img) => img.collection?.slug)
    .map((img) => ({
      slug: img.collection?.slug,
      imageSlug: img.slug,
    }));
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ImagePage({ params }: PageProps) {
  const { slug, imageSlug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

  const image = await db.image.findUnique({
    where: { slug: imageSlug },
    include: {
      collection: {
        select: {
          id: true,
          slug: true,
          title: true,
          category: true,
          price: true,
          isFree: true,
          images: {
            orderBy: { sortOrder: "asc" },
            select: { slug: true, title: true, r2Key: true },
          },
        },
      },
    },
  });

  if (!image || !image.collection || image.collection.slug !== slug) notFound();

  db.image.update({
    where: { id: image.id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {});

  const thumbUrl = getPublicUrl(image.r2Key);

  const [related] = await Promise.all([
    getRelatedImages(image.id, image.tags ?? [], 6),
  ]);

  const siblings   = image.collection.images;
  const currentIdx = siblings.findIndex((s) => s.slug === imageSlug);
  const prevImage  = currentIdx > 0 ? siblings[currentIdx - 1] : null;
  const nextImage  = currentIdx < siblings.length - 1 ? siblings[currentIdx + 1] : null;

  return (
    <main
      className="image-detail-page min-h-screen"
      style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
      id="image-detail-page"
    >
      {/* ── Breadcrumb path bar ── */}
      <Breadcrumbs items={[
        { label: "Home",                 href: "/"             },
        { label: "Collections",          href: "/shop"         },
        { label: image.collection.title, href: `/shop/${slug}` },
        { label: image.title },
      ]} />

      {/* ── Top Ad ── */}
      <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN} width={728} height={90} />

      {/* ── Main layout: image left, details right on desktop ── */}
      <section className="image-detail-section">
        <div className="image-detail-grid">

          {/* ── Left: Image ── */}
          {/*
            FIX 1 — Image distortion / blurring:
            - Container locks to aspect-ratio 9/16 so it never stretches
            - object-fit: contain shows the FULL image without cropping
            - background #0a0a0a fills letterbox areas with the site's dark colour
            - max-width caps it at a sensible portrait size on wide screens
          */}
          <div className="image-detail-frame">
            {/* Inner wrapper enforces 9:16 via padding-top so Next.js fill works */}
            <div className="image-detail-frame-inner">
              <Image
                src={thumbUrl}
                alt={image.title}
                fill
                className="image-detail-img"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 480px, 480px"
                style={{ objectFit: "contain", objectPosition: "center center" }}
              />
            </div>
            {image.collection.category && (
              <span className="image-detail-badge">
                {image.collection.category}
              </span>
            )}
          </div>

          {/* ── Right: Details panel ── */}
          <div className="image-detail-panel">
            <div>
              <Link
                href={`/shop/${slug}`}
                className="font-mono text-[0.6rem] tracking-[0.25em] uppercase text-[#8b0000] hover:text-[#c0001a] transition-colors"
              >
                ← {image.collection.title}
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

            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-[#4a445a] border border-[#2a2535] px-3 py-1">
                {image.collection.category}
              </span>
            </div>

            {/* Ad above download — highest converting position */}
            <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR} width={300} height={250} className="mt-2" />

            {/* Download CTA with success state */}
            <DownloadButton
              href={`/api/download/image/${image.id}`}
              viewCount={image.viewCount}
            />

            {/* Save to favorites */}
            <div className="detail-fav-row">
              <FavoriteButton
                size="md"
                className="detail-fav-inline"
                item={{
                  slug:   imageSlug,
                  title:  image.title,
                  thumb:  thumbUrl,
                  href:   `/shop/${slug}/${imageSlug}`,
                  device: "collection",
                }}
              />
              <span className="detail-fav-label">Save to Favorites</span>
            </div>

            <SocialShare
              title={image.title}
              imageUrl={thumbUrl}
              pageUrl={`${siteUrl}/shop/${slug}/${imageSlug}`}
            />


          </div>
        </div>
      </section>

      {/* ── Prev / Next Navigation ── */}
      {/*
        FIX 2 — Prev/Next thumbnails:
        - Thumbnails are now locked to aspect-ratio 9/16 (portrait)
        - object-fit: cover fills each thumb cleanly and uniformly
        - Cards are full-width within a 2-col grid, not tiny 56×56 squares
        - Consistent border + hover state on both cards
      */}
      {(prevImage || nextImage) && (
        <nav className="image-detail-nav">
          {prevImage ? (
            <Link href={`/shop/${slug}/${prevImage.slug}`} className="image-detail-nav-card image-detail-nav-card--prev">
              <div className="image-detail-nav-thumb">
                <div className="image-detail-nav-thumb-inner">
                  <Image
                    src={getPublicUrl(prevImage.r2Key)}
                    alt={prevImage.title}
                    fill
                    className="object-cover"
                    sizes="90px"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              </div>
              <div className="image-detail-nav-info">
                <span className="image-detail-nav-label">← Previous</span>
                <span className="image-detail-nav-title">{prevImage.title}</span>
              </div>
            </Link>
          ) : (
            <div /> /* empty placeholder keeps the grid balanced */
          )}

          {nextImage ? (
            <Link href={`/shop/${slug}/${nextImage.slug}`} className="image-detail-nav-card image-detail-nav-card--next">
              <div className="image-detail-nav-thumb">
                <div className="image-detail-nav-thumb-inner">
                  <Image
                    src={getPublicUrl(nextImage.r2Key)}
                    alt={nextImage.title}
                    fill
                    className="object-cover"
                    sizes="90px"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              </div>
              <div className="image-detail-nav-info image-detail-nav-info--right">
                <span className="image-detail-nav-label">Next →</span>
                <span className="image-detail-nav-title">{nextImage.title}</span>
              </div>
            </Link>
          ) : (
            <div />
          )}
        </nav>
      )}

      {/* ── Related Wallpapers ── */}
      {related.length > 0 && (
        <RelatedWallpapers images={related} />
      )}

      {/* ── Footer Ad ── */}
      <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} width={728} height={90} />

      {/* ── Recently Viewed ── */}
      <PageTracker item={{
        slug:  imageSlug,
        title: image.title,
        thumb: thumbUrl,
        href:  `/shop/${slug}/${imageSlug}`,
      }} />
      <RecentlyViewed />

      {/* ── JSON-LD ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "@id": `${siteUrl}/shop/${slug}/${imageSlug}#product`,
            name: image.title,
            alternateName: `${image.title} — ${image.collection.title}`,
            description: image.description ?? `${image.title} from the ${image.collection.title} collection. Free 4K dark fantasy wallpaper for download.`,
            url: `${siteUrl}/shop/${slug}/${imageSlug}`,
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `${siteUrl}/shop/${slug}/${imageSlug}`,
            },
            brand: { "@type": "Brand", name: "HAUNTED WALLPAPERS", url: siteUrl },
            category: `Digital Products > Wallpapers > ${image.collection.category}`,
            image: [{
              "@type": "ImageObject",
              url: thumbUrl,
              contentUrl: thumbUrl,
              caption: image.title,
              description: image.description ?? `${image.title} — dark fantasy wallpaper`,
            }],
            additionalProperty: [
              { "@type": "PropertyValue", name: "Format",           value: "PNG (4K High Resolution)" },
              { "@type": "PropertyValue", name: "License",          value: "Personal Use License Included" },
              { "@type": "PropertyValue", name: "Instant Download", value: "Yes" },
              { "@type": "PropertyValue", name: "Resolution",       value: "4K Ultra HD" },
            ],
            offers: {
              "@type": "Offer",
              "@id": `${siteUrl}/shop/${slug}/${imageSlug}#offer`,
              url: `${siteUrl}/shop/${slug}/${imageSlug}`,
              price: "0.00",
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
              itemCondition: "https://schema.org/NewCondition",
              category: "Digital Download",
              eligibleRegion: { "@type": "Country", name: "Worldwide" },
              shippingDetails: {
                "@type": "OfferShippingDetails",
                shippingRate: { "@type": "MonetaryAmount", value: "0.00", currency: "USD" },
                shippingDestination: { "@type": "DefinedRegion", addressCountry: "Worldwide" },
                deliveryTime: {
                  "@type": "ShippingDeliveryTime",
                  handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 0, unitCode: "HUR" },
                  transitTime:  { "@type": "QuantitativeValue", minValue: 0, maxValue: 0, unitCode: "HUR" },
                },
              },
              hasMerchantReturnPolicy: {
                "@type": "MerchantReturnPolicy",
                returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
                applicableCountry: "Worldwide",
              },
              seller: { "@type": "Organization", name: "HAUNTED WALLPAPERS", url: siteUrl },
            },
            isPartOf: {
              "@type": "CollectionPage",
              name: image.collection.title,
              url:  `${siteUrl}/shop/${slug}`,
            },
            potentialAction: {
              "@type": "DownloadAction",
              target: `${siteUrl}/api/download/image/${image.id}`,
            },
            audience: {
              "@type": "Audience",
              audienceType: `${image.collection.category} enthusiasts, dark fantasy art lovers, digital wallpaper collectors`,
            },
          }),
        }}
      />
    </main>
  );
}