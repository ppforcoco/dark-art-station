import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { db } from "@/lib/db";
import { getSignedDownloadUrl } from "@/lib/r2";
import AdSlot from "@/components/AdSlot";

// ─── Types ─────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ─── SEO: generateMetadata ──────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";
  const r2PublicUrl = process.env.R2_PUBLIC_URL ?? "";

  const collection = await db.collection.findUnique({
    where: { slug },
    select: { title: true, description: true, thumbnail: true, category: true },
  });

  if (!collection) {
    return { title: "Not Found | VOIDCANVAS" };
  }

  const ogImage = collection.thumbnail
    ? `${r2PublicUrl}/${collection.thumbnail}`
    : `${siteUrl}/og-default.jpg`;

  return {
    title: `${collection.title} | VOIDCANVAS Dark Art`,
    description: collection.description,
    keywords: [
      collection.category,
      "dark wallpaper",
      "occult art",
      "dark fantasy",
      "AI art",
      "desktop wallpaper",
      collection.title,
    ],
    openGraph: {
      title: `${collection.title} | VOIDCANVAS`,
      description: collection.description,
      url: `${siteUrl}/shop/${slug}`,
      siteName: "VOIDCANVAS",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: collection.title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${collection.title} | VOIDCANVAS`,
      description: collection.description,
      images: [ogImage],
    },
    alternates: {
      canonical: `${siteUrl}/shop/${slug}`,
    },
  };
}

// ─── Static params for ISR/SSG ──────────────────────────────────────────────

export async function generateStaticParams() {
  const collections = await db.collection.findMany({ select: { slug: true } });
  return collections.map((c) => ({ slug: c.slug }));
}

// ─── Page Component ─────────────────────────────────────────────────────────

export default async function CollectionPage({ params }: PageProps) {
  const { slug } = await params;
  const r2PublicUrl = process.env.R2_PUBLIC_URL ?? "";

  const collection = await db.collection.findUnique({
    where: { slug },
  });

  if (!collection) notFound();

  const thumbnailUrl = collection.thumbnail
    ? `${r2PublicUrl}/${collection.thumbnail}`
    : null;

  const downloadHref = `/api/download/${collection.id}`;

  return (
    <main className="min-h-screen bg-[#050505] text-white">

      {/* ── Hero / Product Section ─────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 md:px-[60px] pt-16 pb-12">

        <div className="grid md:grid-cols-2 gap-12 items-start">

          {/* Thumbnail */}
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

          {/* Details */}
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

            {/* Tag */}
            <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-[#4a445a] border border-[#2a2535] px-3 py-1 w-fit">
              {collection.tag}
            </span>

            {/* Price + CTA */}
            <div className="flex items-center gap-6 mt-2">
              <span className="font-display text-3xl font-bold text-[#c9a84c]">
                {collection.isFree ? "FREE" : `$${collection.price.toFixed(2)}`}
              </span>

              <a
                href={downloadHref}
                className="font-mono text-[0.7rem] tracking-[0.2em] uppercase bg-[#8b0000] hover:bg-[#a80000] text-white px-8 py-3 transition-colors duration-200 border border-[#8b0000]"
              >
                {collection.isFree ? "Download Free" : "Buy & Download"}
              </a>
            </div>

            {collection.isFree && (
              <p className="font-mono text-[0.55rem] tracking-[0.1em] text-[#4a445a]">
                No account required. Direct download.
              </p>
            )}

          </div>
        </div>
      </section>

      {/* ── Sidebar Ad ─────────────────────────────────────────────────── */}
      <AdSlot
        slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR}
        width={300}
        height={250}
        className="my-4"
      />

      {/* ── JSON-LD Structured Data ─────────────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: collection.title,
            description: collection.description,
            image: thumbnailUrl,
            offers: {
              "@type": "Offer",
              price: collection.price,
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
            },
          }),
        }}
      />
    </main>
  );
}