import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import AdSlot from "@/components/AdSlot";

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

  if (!collection) return { title: "Not Found | VOIDCANVAS" };

  const ogImage = collection.thumbnail
    ? getPublicUrl(collection.thumbnail)
    : `${siteUrl}/og-default.jpg`;

  return {
    title: `${collection.title} | VOIDCANVAS Dark Art`,
    description: collection.description,
    keywords: [collection.category, "dark wallpaper", "occult art", "dark fantasy", "AI art", collection.title],
    openGraph: {
      title: `${collection.title} | VOIDCANVAS`,
      description: collection.description,
      url: `${siteUrl}/shop/${slug}`,
      siteName: "VOIDCANVAS",
      images: [{ url: ogImage, width: 1200, height: 630, alt: collection.title }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${collection.title} | VOIDCANVAS`,
      description: collection.description,
      images: [ogImage],
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
    <main className="min-h-screen bg-[#050505] text-white">

      {/* ── Collection Header ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 md:px-[60px] pt-16 pb-10">
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {collection.images.map((img) => (
              <Link
                key={img.id}
                href={`/shop/${slug}/${img.slug}`}
                className="group relative aspect-[3/4] overflow-hidden bg-[#0a0a0a] border border-[#2a2535] hover:border-[rgba(139,0,0,0.6)] transition-colors duration-300"
              >
                <Image
                  src={getPublicUrl(img.r2Key)}
                  alt={img.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(5,5,5,0.9)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <div>
                    <p className="font-body italic text-[0.9rem] text-white leading-tight">{img.title}</p>
                    <span className="font-mono text-[0.55rem] tracking-[0.15em] uppercase text-[#c9a84c] mt-1 block">
                      View & Download →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Footer Ad ───────────────────────────────────────────────────── */}
      <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} width={728} height={90} className="mt-8" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "@id": `${process.env.NEXT_PUBLIC_SITE_URL}/shop/${slug}#product`,
            name: collection.title,
            description: collection.description,
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/shop/${slug}`,
            category: `Digital Products > ${collection.category}`,
            brand: { "@type": "Brand", "name": "VOIDCANVAS" },
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
              seller: { "@type": "Organization", name: "VOIDCANVAS", url: process.env.NEXT_PUBLIC_SITE_URL },
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
        }}
      />
    </main>
  );
}