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

// Display title overrides — fix DB title mismatches without a DB migration
const TITLE_OVERRIDES: Record<string, string> = {
  "dark-sorceress-collection": "Skulls & Skeletons",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";
  const collection = await db.collection.findUnique({
    where: { slug },
    select: { title: true, description: true, thumbnail: true, category: true },
  });
  if (!collection) return { title: "Not Found | Haunted Wallpapers" };
  const displayTitle = TITLE_OVERRIDES[slug] ?? collection.title;
  const ogImage = collection.thumbnail ? getPublicUrl(collection.thumbnail) : `${siteUrl}/og-default.jpg`;
  return {
    title: `${displayTitle} | Haunted Wallpapers`,
    description: collection.description,
    keywords: [collection.category, "dark wallpaper", "dark art", "dark fantasy", "AI art", displayTitle],
    openGraph: {
      title: `${displayTitle} | Haunted Wallpapers`,
      description: collection.description,
      url: `${siteUrl}/shop/${slug}`,
      siteName: "Haunted Wallpapers",
      images: [{ url: ogImage, width: 1200, height: 630, alt: displayTitle }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${displayTitle} | Haunted Wallpapers`,
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

  const displayTitle = TITLE_OVERRIDES[slug] ?? collection.title;

  const thumbnailUrl = collection.thumbnail ? getPublicUrl(collection.thumbnail) : null;
  const hasImages = collection.images.length > 0;

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>

      <Breadcrumbs items={[
        { label: "Home",        href: "/" },
        { label: "Collections", href: "/shop" },
        { label: displayTitle },
      ]} />

      {/* ── Collection Header ── */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px" }}>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }}
          className="collection-header-grid"
        >
          {/* ── Thumbnail image ──
              FIX: object-fit: contain via inline style so the full wallpaper
              is always visible. The inline style prop beats Tailwind + Next.js
              injected styles reliably. Container is locked to 9/16 portrait.  */}
          {/* Outer: caps max-width. Inner padding-top wrapper: enforces 9:16 so
               Next.js <Image fill> has real pixel dimensions to fill into.       */}
          <div style={{
            width: "100%",
            maxWidth: "360px",
            margin: "0 auto",
            background: "#070710",
            border: "1px solid rgba(139,0,0,0.3)",
            overflow: "hidden",
          }}>
            <div style={{ position: "relative", width: "100%", paddingTop: "177.78%" }}>
            {thumbnailUrl ? (
              <Image
                src={thumbnailUrl}
                alt={displayTitle}
                fill
                priority
                sizes="360px"
                style={{ objectFit: "contain", objectPosition: "center center" }}
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center text-8xl ${collection.bgClass}`}>
                {collection.icon}
              </div>
            )}
            </div>
            {collection.badge && (
              <span style={{ position:"absolute", top:"16px", left:"16px" }} className="font-mono text-[0.6rem] tracking-[0.2em] uppercase bg-[#8b0000] text-white px-3 py-1">
                {collection.badge}
              </span>
            )}
          </div>

          {/* Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <span className="font-mono text-[0.6rem] tracking-[0.25em] uppercase text-[#8b0000]">
                {collection.category}
              </span>
              <h1 className="font-display text-3xl font-bold mt-2 leading-tight">
                {displayTitle}
              </h1>
            </div>
            <p className="font-body text-[1.05rem] text-[#a89bc0] leading-relaxed">
              {collection.description}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
              <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-[#4a445a] border border-[#2a2535] px-3 py-1">
                {collection.tag}
              </span>
              {hasImages && (
                <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-[#4a445a]">
                  {collection.images.length} images
                </span>
              )}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
              <span className="font-mono text-[0.6rem] tracking-[0.25em] uppercase text-[#c9a84c] border border-[#c9a84c] px-3 py-1">
                Free Download
              </span>
              {collection.downloadUrl && (
                <a
                  href={`/api/download/${collection.id}`}
                  style={{ flex: "1 1 auto", textAlign: "center", minWidth: "160px" }}
                  className="font-mono text-[0.7rem] tracking-[0.2em] uppercase bg-[#8b0000] hover:bg-[#a80000] text-white px-6 py-3 transition-colors duration-200 border border-[#8b0000] block"
                >
                  Download 4K Bundle (Free)
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Responsive grid: single col mobile → 2 col desktop */}
      <style>{`
        @media (min-width: 768px) {
          .collection-header-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>

      {/* AdSlot hidden when empty via .ad-banner--empty in globals.css */}
      <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN} width={728} height={90} />

      {hasImages && (
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "48px 24px" }}>
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

      <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} width={728} height={90} className="mt-8" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: displayTitle,
            description: collection.description,
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/shop/${slug}`,
            offers: {
              "@type": "Offer",
              price: "0.00",
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
            },
          })
        }}
      />
    </main>
  );
}