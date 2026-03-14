// app/shop/[slug]/[imageSlug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import AdSlot from "@/components/AdSlot";
import SocialShare from "@/components/SocialShare";
import DeviceMockup from "@/components/DeviceMockup";
import RelatedWallpapers from "@/components/RelatedWallpapers";
import { getRelatedImages } from "@/lib/db";
import Breadcrumbs from "@/components/Breadcrumbs";

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
      "occult art",
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

  // Fetch image with collection context + siblings for navigation
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

  // Guard: image must exist AND belong to the correct collection slug
  if (!image || !image.collection || image.collection.slug !== slug) notFound();

  // Increment view count — fire and forget
  db.image.update({
    where: { id: image.id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {});

  const thumbUrl  = getPublicUrl(image.r2Key);

  // Related images — parallel fetch with siblings
  const [related] = await Promise.all([
    getRelatedImages(image.id, image.tags ?? [], 6),
  ]);

  // Sibling navigation
  const siblings  = image.collection.images;
  const currentIdx = siblings.findIndex((s) => s.slug === imageSlug);
  const prevImage  = currentIdx > 0 ? siblings[currentIdx - 1] : null;
  const nextImage  = currentIdx < siblings.length - 1 ? siblings[currentIdx + 1] : null;

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }} id="image-detail-page">

      {/* ── Breadcrumb path bar ── */}
      <Breadcrumbs items={[
        { label: "Home",                  href: "/"           },
        { label: "Collections",           href: "/shop"       },
        { label: image.collection.title,  href: `/shop/${slug}` },
        { label: image.title },
      ]} />

      {/* ── Top Ad ──────────────────────────────────────────────────────── */}
      <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN} width={728} height={90} />

      {/* ── Main Image + Details ────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 md:px-[60px] py-10">
        <div className="grid md:grid-cols-[1fr_360px] gap-10 items-start">

          {/* Full image — plain frame with locked 9:16 ratio */}
          <div className="relative w-full overflow-hidden border border-[rgba(139,0,0,0.3)] bg-[#0a0a0a]" style={{ aspectRatio: "9/16" }}>
            <Image
              src={thumbUrl}
              alt={image.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 65vw"
            />
          </div>

          {/* Details panel */}
          <div className="flex flex-col gap-6 sticky top-8">
            <div>
              <Link
                href={`/shop/${slug}`}
                className="font-mono text-[0.6rem] tracking-[0.25em] uppercase text-[#8b0000] hover:text-[#c0001a] transition-colors"
              >
                ← {image.collection!.title}
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
              <span className="font-mono text-[0.55rem] tracking-[0.1em] text-[#4a445a]">
                {image.viewCount} views
              </span>
            </div>

            {/* Download CTA */}
            <div className="flex flex-col gap-3 mt-2">
              <a
                href={`/api/download/image/${image.id}`}
                className="font-mono text-[0.7rem] tracking-[0.2em] uppercase bg-[#8b0000] hover:bg-[#a80000] text-white px-8 py-4 transition-colors duration-200 border border-[#8b0000] text-center"
                style={{ touchAction: "manipulation" }}
              >
                ↓ Download 4K Wallpaper (Free)
              </a>
              <p className="font-mono text-[0.5rem] tracking-[0.1em] text-[#4a445a]">
                PNG · 4K resolution · No account required
              </p>
            </div>

            {/* Social Share */}
            <SocialShare
              title={image.title}
              imageUrl={thumbUrl}
              pageUrl={`${siteUrl}/shop/${slug}/${imageSlug}`}
            />

            {/* Sidebar Ad */}
            <AdSlot
              slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR}
              width={300}
              height={250}
              className="mt-4"
            />
          </div>
        </div>
      </section>

      {/* ── Prev / Next Navigation ──────────────────────────────────────── */}
      {(prevImage || nextImage) && (
        <nav className="max-w-7xl mx-auto px-6 md:px-[60px] pb-8 flex items-center justify-between gap-4">
          {prevImage ? (
            <Link
              href={`/shop/${slug}/${prevImage.slug}`}
              className="group flex items-center gap-4 border border-[#2a2535] hover:border-[rgba(139,0,0,0.5)] p-4 transition-colors flex-1 max-w-[280px]"
            >
              <div className="relative w-14 h-14 shrink-0 overflow-hidden">
                <Image src={getPublicUrl(prevImage.r2Key)} alt={prevImage.title} fill className="object-cover" sizes="56px" />
              </div>
              <div>
                <span className="font-mono text-[0.5rem] tracking-[0.2em] uppercase text-[#4a445a] block">← Previous</span>
                <span className="font-body italic text-[0.9rem] text-[#f0ecff]">{prevImage.title}</span>
              </div>
            </Link>
          ) : <div />}

          {nextImage && (
            <Link
              href={`/shop/${slug}/${nextImage.slug}`}
              className="group flex items-center gap-4 border border-[#2a2535] hover:border-[rgba(139,0,0,0.5)] p-4 transition-colors flex-1 max-w-[280px] justify-end text-right ml-auto"
            >
              <div>
                <span className="font-mono text-[0.5rem] tracking-[0.2em] uppercase text-[#4a445a] block">Next →</span>
                <span className="font-body italic text-[0.9rem] text-[#f0ecff]">{nextImage.title}</span>
              </div>
              <div className="relative w-14 h-14 shrink-0 overflow-hidden">
                <Image src={getPublicUrl(nextImage.r2Key)} alt={nextImage.title} fill className="object-cover" sizes="56px" />
              </div>
            </Link>
          )}
        </nav>
      )}

      {/* ── Related Wallpapers ─────────────────────────────────────────── */}
      {related.length > 0 && (
        <RelatedWallpapers images={related} />
      )}

      {/* ── Mobile spacer so sticky CTA doesn't cover content ────────── */}
      <div className="mobile-cta-spacer" aria-hidden="true" />

      {/* ── Footer Ad ───────────────────────────────────────────────────── */}
      <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} width={728} height={90} />

      {/* ── Sticky Mobile Download CTA ──────────────────────────────────── */}
      <div className="mobile-sticky-cta">
        <a
          href={`/api/download/image/${image.id}`}
          className="font-mono text-[0.72rem] tracking-[0.18em] uppercase bg-[#8b0000] hover:bg-[#a80000] text-white px-6 py-4 transition-colors duration-200 border border-[#8b0000] text-center flex items-center justify-center gap-2"
          style={{ touchAction: "manipulation" }}
        >
          ↓ Download Free 4K
        </a>
      </div>

      {/* ── JSON-LD ─────────────────────────────────────────────────────── */}
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
            category: `Digital Products > Wallpapers > ${image.collection!.category}`,
            image: [{
              "@type": "ImageObject",
              url: thumbUrl,
              contentUrl: thumbUrl,
              caption: image.title,
              description: image.description ?? `${image.title} — dark fantasy wallpaper`,
            }],
            additionalProperty: [
              { "@type": "PropertyValue", name: "Format", value: "PNG (4K High Resolution)" },
              { "@type": "PropertyValue", name: "License", value: "Personal Use License Included" },
              { "@type": "PropertyValue", name: "Instant Download", value: "Yes" },
              { "@type": "PropertyValue", name: "Resolution", value: "4K Ultra HD" },
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
                  transitTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 0, unitCode: "HUR" },
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
              name: image.collection!.title,
              url: `${siteUrl}/shop/${slug}`,
            },
            potentialAction: {
              "@type": "DownloadAction",
              target: `${siteUrl}/api/download/image/${image.id}`,
            },
            audience: {
              "@type": "Audience",
              audienceType: `${image.collection!.category} enthusiasts, dark fantasy art lovers, digital wallpaper collectors`,
            },
          }),
        }}
      />
    </main>
  );
}