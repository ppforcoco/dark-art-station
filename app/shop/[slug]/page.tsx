// app/shop/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
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
    title: `${displayTitle} | Free Download | Haunted Wallpapers`,
    description: `${collection.description} Download all ${displayTitle} wallpapers free — no account required.`,
    keywords: [collection.category, "dark wallpaper", "dark art", "dark fantasy", "free download", displayTitle],
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
  // First image used as fallback download target when no bundle ZIP exists
  const firstImage = collection.images[0] ?? null;

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      <Breadcrumbs
        items={[
          { label: "Home",        href: "/" },
          { label: "Collections", href: "/shop" },
          { label: displayTitle },
        ]}
      />

      {/* ── Collection Header ── */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px" }}>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }}
          className="collection-header-grid"
        >
          {/* Thumbnail */}
          <div
            style={{
              width: "100%",
              maxWidth: "360px",
              margin: "0 auto",
              background: "#070710",
              border: "1px solid rgba(139,0,0,0.3)",
              overflow: "hidden",
              position: "relative",
            }}
          >
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
                <div
                  className={`w-full h-full flex items-center justify-center text-8xl ${collection.bgClass}`}
                  style={{ position: "absolute", inset: 0 }}
                >
                  {collection.icon}
                </div>
              )}
            </div>
            {collection.badge && (
              <span
                style={{ position: "absolute", top: "16px", left: "16px", zIndex: 10 }}
                className="font-mono text-[0.6rem] tracking-[0.2em] uppercase bg-[#8b0000] text-white px-3 py-1"
              >
                {collection.badge}
              </span>
            )}
          </div>

          {/* Info + Download */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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

            {/* Meta tags row */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
              <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-[#4a445a] border border-[#2a2535] px-3 py-1">
                {collection.tag}
              </span>
              {hasImages && (
                <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-[#4a445a] border border-[#2a2535] px-3 py-1">
                  {collection.images.length} images
                </span>
              )}
              <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-[#4a445a] border border-[#2a2535] px-3 py-1">
                4K · Free
              </span>
            </div>

            {/* ── DOWNLOAD CTA ── */}
            <div className="collection-download-wrap">
              {collection.downloadUrl ? (
                /* Full ZIP bundle exists → download the whole thing */
                <a
                  href={`/api/download/${collection.id}`}
                  className="collection-download-btn"
                  download
                >
                  ↓ Download Bundle · Free
                </a>
              ) : firstImage ? (
                /* No ZIP → lead user to the first image detail page */
                <Link
                  href={`/shop/${slug}/${firstImage.slug}`}
                  className="collection-download-btn"
                >
                  ↓ Download Free
                </Link>
              ) : null}

              <p className="collection-download-note">
                {collection.downloadUrl
                  ? "ZIP archive · 4K JPEG · No account · No watermark"
                  : "Tap any image below to download individually · 4K · Free"}
              </p>
            </div>

            {/* AdSense sidebar unit — right beside the download CTA */}
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

      {/* Responsive grid CSS */}
      <style>{`
        @media (min-width: 768px) {
          .collection-header-grid {
            grid-template-columns: 1fr 1fr !important;
            align-items: start;
          }
        }

        /* ── Collection download button ── */
        .collection-download-wrap {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 4px;
        }
        .collection-download-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          min-height: 60px;
          padding: 0 24px;
          box-sizing: border-box;
          background-color: #8b0000;
          border: 1px solid #8b0000;
          color: #ffffff !important;
          font-family: var(--font-space), monospace;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          text-decoration: none !important;
          text-align: center;
          transition: background-color 0.2s ease, filter 0.2s ease;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          cursor: pointer;
          white-space: nowrap;
        }
        .collection-download-btn:hover {
          background-color: #a80000;
          filter: brightness(1.1);
        }
        .collection-download-btn:active {
          filter: brightness(0.9);
        }
        .collection-download-note {
          font-family: var(--font-space), monospace;
          font-size: 0.5rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #4a445a;
          margin: 0;
          text-align: center;
        }
      `}</style>

      {/* Main ad banner */}
      <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN} width={728} height={90} />

      {/* Image gallery */}
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

      {/* Multiplex / native content ad — after gallery, highest CTR position */}
      {hasImages && (
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px 40px" }}>
          <AdSlot
            slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MULTIPLEX ?? process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER}
            format="auto"
            width={728}
            height={90}
          />
        </div>
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
            image: thumbnailUrl ?? undefined,
          }),
        }}
      />
    </main>
  );
}