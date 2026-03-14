// app/shop/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import AdSlot from "@/components/AdSlot";
import LightboxGallery from "@/components/LightboxGallery";
import Breadcrumbs from "@/components/Breadcrumbs";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ─── SEO ─────────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

  const collection = await db.collection.findUnique({
    where: { slug },
    select: { title: true, description: true, thumbnail: true, category: true },
  });

  if (!collection) return { title: "Not Found | Haunted Wallpapers" };

  const ogImage = collection.thumbnail
    ? getPublicUrl(collection.thumbnail)
    : `${siteUrl}/og-default.jpg`;

  return {
    title: `${collection.title} | Haunted Wallpapers`,
    description: collection.description,
    keywords: [collection.category, "dark wallpaper", "occult art", "dark fantasy", "AI art", collection.title],
    openGraph: {
      title:       `${collection.title} | Haunted Wallpapers`,
      description: collection.description,
      url:         `${siteUrl}/shop/${slug}`,
      siteName:    "Haunted Wallpapers",
      images: [{ url: ogImage, width: 1200, height: 630, alt: collection.title }],
      type: "website",
    },
    twitter: {
      card:        "summary_large_image",
      title:       `${collection.title} | Haunted Wallpapers`,
      description: collection.description,
      images:      [ogImage],
    },
    alternates: { canonical: `${siteUrl}/shop/${slug}` },
  };
}

export async function generateStaticParams() {
  const collections = await db.collection.findMany({ select: { slug: true } });
  return collections.map((c) => ({ slug: c.slug }));
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CollectionPage({ params }: PageProps) {
  const { slug } = await params;

  const collection = await db.collection.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      _count: { select: { downloads: true } },
    },
  });

  if (!collection) notFound();

  const thumbnailUrl = collection.thumbnail ? getPublicUrl(collection.thumbnail) : null;
  const hasImages = collection.images.length > 0;

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>

      {/* ── Breadcrumb path bar ── */}
      <Breadcrumbs items={[
        { label: "Home",        href: "/"     },
        { label: "Collections", href: "/shop" },
        { label: collection.title },
      ]} />

      {/* ── Collection Header ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 md:px-[60px] pt-10 pb-10">
        <div className="grid md:grid-cols-2 gap-12 items-start">

          <div className="relative aspect-[4/3] rounded-sm overflow-hidden border border-[rgba(139,0,0,0.3)] bg-[#0a0a0a]">
            {thumbnailUrl ? (
              <Image
                src={thumbnailUrl}
                alt={collection.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center text-8xl ${collection.bgClass}`}>
                {collection.icon}
              </div>
            )}
            {collection.badge && (
              <span className="absolute top-4 left-4 font-mono text-[0.6rem] tracking-[0.2em] uppercase bg-[#8b0000] text-white px-3 py-1">
                {collection.badge}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-6 pt-4">
            <div>
              <span className="font-mono text-[0.6rem] tracking-[0.25em] uppercase text-[#8b0000]">
                {collection.category}
              </span>
              <h1 className="font-display text-3xl md:text-4xl font-bold mt-2 leading-tight">
                {collection.title}
              </h1>
            </div>
            <p className="font-body text-[1.05rem] text-[#a89bc0] leading-relaxed">
              {collection.description}
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-[#4a445a] border border-[#2a2535] px-3 py-1">
                {collection.tag}
              </span>
              {hasImages && (
                <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-[#4a445a]">
                  {collection.images.length} images
                </span>
              )}
            </div>
            <div className="flex items-center gap-6 mt-2">
              <span className="font-mono text-[0.6rem] tracking-[0.25em] uppercase text-[#c9a84c] border border-[#c9a84c] px-3 py-1">
                Free Download
              </span>
              {collection.downloadUrl && (
                <a
                  href={`/api/download/${collection.id}`}
                  className="font-mono text-[0.7rem] tracking-[0.2em] uppercase bg-[#8b0000] hover:bg-[#a80000] text-white px-8 py-3 transition-colors duration-200 border border-[#8b0000]"
                >
                  Download 4K Bundle (Free)
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Ad between header and gallery ──────────────────────────────── */}
      <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN} width={728} height={90} />

      {/* ── Image Gallery Grid ──────────────────────────────────────────── */}
      {hasImages && (
        <section className="max-w-7xl mx-auto px-6 md:px-[60px] py-12">
          <h2 className="font-mono text-[0.7rem] tracking-[0.3em] uppercase text-[#4a445a] mb-8">
            — {collection.images.length} Works in this Collection
          </h2>
          <LightboxGallery
            images={collection.images.map((img) => ({
              id:    img.id,
              src:   getPublicUrl(img.r2Key),
              alt:   img.title,
              title: img.title,
              href:  `/shop/${slug}/${img.slug}`,
            }))}
          />
        </section>
      )}

      {/* ── Footer Ad ───────────────────────────────────────────────────── */}
      <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} width={728} height={90} className="mt-8" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: [JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "@id": `${process.env.NEXT_PUBLIC_SITE_URL}/shop/${slug}#product`,
            name: collection.title,
            description: collection.description,
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/shop/${slug}`,
            category: `Digital Products > ${collection.category}`,
            brand: { "@type": "Brand", "name": "Haunted Wallpapers" },
            image: thumbnailUrl ? [{
              "@type": "ImageObject",
              url: thumbnailUrl,
              contentUrl: thumbnailUrl,
              caption: collection.title,
            }] : undefined,
            additionalProperty: [
              { "@type": "PropertyValue", name: "Format", value: "Digital Download (WebP + PNG)" },
              { "@type": "PropertyValue", name: "License", value: "Personal Use License Included" },
              { "@type": "PropertyValue", name: "Instant Download", value: "Yes" },
              { "@type": "PropertyValue", name: "Number of Images", value: String(collection.images.length) },
            ],
            offers: {
              "@type": "Offer",
              "@id": `${process.env.NEXT_PUBLIC_SITE_URL}/shop/${slug}#offer`,
              url: `${process.env.NEXT_PUBLIC_SITE_URL}/shop/${slug}`,
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
              seller: { "@type": "Organization", name: "Haunted Wallpapers", url: process.env.NEXT_PUBLIC_SITE_URL },
            },
            potentialAction: {
              "@type": "DownloadAction",
              target: `${process.env.NEXT_PUBLIC_SITE_URL}/api/download/${collection.id}`,
            },
            audience: {
              "@type": "Audience",
              audienceType: `${collection.category} enthusiasts, dark fantasy art lovers, digital wallpaper collectors`,
            },
          }),
          // ── ItemList schema: maps every image in the gallery ──────────────
          // Enables Google Visual Gallery rich results in mobile search.
          JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: collection.title,
            description: collection.description,
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/shop/${slug}`,
            numberOfItems: collection.images.length,
            itemListElement: collection.images.slice(0, 20).map((img, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${process.env.NEXT_PUBLIC_SITE_URL}/shop/${slug}/${img.slug}`,
              name: img.title,
              image: getPublicUrl(img.r2Key),
            })),
          })].join("")
        }}
      />
    </main>
  );
}