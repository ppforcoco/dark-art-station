// app/shop/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import AdSlot from "@/components/AdSlot";
import Breadcrumbs from "@/components/Breadcrumbs";

export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

  const collection = await db.collection.findUnique({
    where: { slug },
    select: { title: true, description: true, thumbnail: true },
  });

  if (!collection) return { title: "Not Found | Haunted Wallpapers" };

  const ogImage = collection.thumbnail
    ? `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${collection.thumbnail}`
    : `${siteUrl}/og-image.jpg`;

  return {
    title: `${collection.title} — Free Dark Wallpapers | Haunted Wallpapers`,
    description:
      collection.description ??
      `Browse all wallpapers in the ${collection.title} collection. Free 4K dark art downloads for iPhone, Android and PC.`,
    openGraph: {
      title: `${collection.title} | Haunted Wallpapers`,
      description: collection.description ?? `Free dark wallpapers — ${collection.title}`,
      url: `${siteUrl}/shop/${slug}`,
      siteName: "Haunted Wallpapers",
      images: [{ url: ogImage, width: 1200, height: 630, alt: collection.title }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${collection.title} | Haunted Wallpapers`,
      description: collection.description ?? `Free dark wallpapers — ${collection.title}`,
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
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      thumbnail: true,
      icon: true,
      images: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          slug: true,
          title: true,
          r2Key: true,
          tags: true,
          sortOrder: true,
        },
      },
      _count: { select: { downloads: true } },
    },
  });

  if (!collection) notFound();

  const coverUrl = collection.thumbnail
    ? `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${collection.thumbnail}`
    : null;

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Collections", href: "/collections" },
          { label: collection.title },
        ]}
      />

      <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN} width={728} height={90} />

      {/* ── Collection Header ── */}
      <div className="coll-header">
        <div className="coll-header-inner">
          {coverUrl && (
            <div className="coll-cover-wrap">
              <Image
                src={coverUrl}
                alt={collection.title}
                fill
                unoptimized
                className="object-cover"
                sizes="(max-width: 640px) 80px, 120px"
                priority
              />
            </div>
          )}
          <div className="coll-header-text">
            <span className="coll-eyebrow">Collection</span>
            <h1 className="coll-title">{collection.title}</h1>
            {collection.description && (
              <p className="coll-desc">{collection.description}</p>
            )}
            <p className="coll-meta">
              {collection.images.length} wallpaper{collection.images.length !== 1 ? "s" : ""}
              {" · "}
              {collection._count.downloads} downloads
            </p>
          </div>
        </div>
      </div>

      {/* ── Image Grid ── */}
      <section className="coll-grid-section">
        <div className="coll-grid">
          {collection.images.map((img, idx) => {
            const thumbUrl = getPublicUrl(img.r2Key);
            return (
              <Link
                key={img.id}
                href={`/shop/${slug}/${img.slug}`}
                className="coll-card"
                aria-label={img.title}
              >
                <div className="coll-card-img-wrap">
                  <Image
                    src={thumbUrl}
                    alt={img.title}
                    fill
                    unoptimized
                    className="object-cover coll-card-img"
                    sizes="(max-width: 479px) 50vw, (max-width: 767px) 33vw, (max-width: 1199px) 25vw, 20vw"
                    priority={idx < 4}
                  />
                  <div className="coll-card-overlay">
                    <span className="coll-card-view-label">View & Download →</span>
                  </div>
                </div>
                <div className="coll-card-info">
                  <span className="coll-card-title">{img.title}</span>
                  {img.tags.length > 0 && (
                    <span className="coll-card-tag">#{img.tags[0]}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {collection.images.length === 0 && (
          <div className="coll-empty">
            <span style={{ fontSize: "2.5rem" }}>{collection.icon ?? "🖤"}</span>
            <p className="coll-empty-text">No wallpapers in this collection yet. Check back soon.</p>
          </div>
        )}
      </section>

      <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} width={728} height={90} />

      <style>{`
        /* ── Collection Header ── */
        .coll-header {
          border-bottom: 1px solid var(--border-dim, #2a2535);
          padding: 40px 24px 32px;
        }
        .coll-header-inner {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          align-items: flex-start;
          gap: 24px;
        }
        .coll-cover-wrap {
          position: relative;
          flex-shrink: 0;
          width: 100px;
          height: 100px;
          overflow: hidden;
          border: 1px solid var(--border-dim, #2a2535);
        }
        @media (max-width: 479px) {
          .coll-cover-wrap { width: 72px; height: 72px; }
        }
        .coll-header-text { display: flex; flex-direction: column; gap: 8px; }
        .coll-eyebrow {
          font-family: var(--font-space), monospace;
          font-size: 0.55rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #c0001a;
        }
        .coll-title {
          font-family: var(--font-cinzel), cursive;
          font-size: clamp(1.6rem, 4vw, 2.8rem);
          font-weight: 900;
          color: #f0ecff;
          line-height: 1.1;
          margin: 0;
        }
        [data-theme="light"] .coll-title { color: #1a1814; }
        .coll-desc {
          font-family: var(--font-cormorant), serif;
          font-size: 1rem;
          color: #8a8099;
          line-height: 1.65;
          margin: 0;
          max-width: 600px;
        }
        [data-theme="light"] .coll-desc { color: #5a5450; }
        .coll-meta {
          font-family: var(--font-space), monospace;
          font-size: 0.58rem;
          letter-spacing: 0.1em;
          color: #4a445a;
          margin: 0;
          text-transform: uppercase;
        }
        [data-theme="light"] .coll-meta { color: #8a8468; }

        /* ── Grid Section ── */
        .coll-grid-section {
          max-width: 1280px;
          margin: 0 auto;
          padding: 32px 24px 64px;
        }
        .coll-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
        }
        @media (max-width: 1199px) { .coll-grid { grid-template-columns: repeat(4, 1fr); } }
        @media (max-width: 767px)  { .coll-grid { grid-template-columns: repeat(3, 1fr); gap: 12px; } }
        @media (max-width: 479px)  { .coll-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }

        /* ── Cards ── */
        .coll-card {
          display: flex;
          flex-direction: column;
          text-decoration: none;
          background: #1a1825;
          border: 1px solid rgba(255,255,255,0.05);
          overflow: hidden;
          transition: border-color 0.2s, transform 0.2s;
        }
        .coll-card:hover {
          border-color: rgba(192,0,26,0.5);
          transform: translateY(-3px);
        }
        [data-theme="light"] .coll-card {
          background: #f0ebe0;
          border-color: rgba(0,0,0,0.07);
        }
        [data-theme="light"] .coll-card:hover {
          border-color: rgba(192,0,26,0.35);
        }
        .coll-card-img-wrap {
          position: relative;
          aspect-ratio: 9 / 16;
          overflow: hidden;
        }
        .coll-card-img {
          transition: transform 0.4s ease;
        }
        .coll-card:hover .coll-card-img { transform: scale(1.05); }
        .coll-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(5,5,14,0.92) 0%, transparent 55%);
          display: flex;
          align-items: flex-end;
          padding: 12px;
          opacity: 0;
          transition: opacity 0.25s;
        }
        .coll-card:hover .coll-card-overlay { opacity: 1; }
        .coll-card-view-label {
          font-family: var(--font-space), monospace;
          font-size: 0.48rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #c9a84c;
        }
        .coll-card-info {
          padding: 10px 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .coll-card-title {
          font-family: var(--font-cormorant), serif;
          font-style: italic;
          font-size: 0.85rem;
          color: #c4bdd8;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        [data-theme="light"] .coll-card-title { color: #3a3450; }
        .coll-card-tag {
          font-family: var(--font-space), monospace;
          font-size: 0.48rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #4a445a;
        }
        [data-theme="light"] .coll-card-tag { color: #8a8468; }

        /* ── Empty state ── */
        .coll-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 80px 24px;
          text-align: center;
        }
        .coll-empty-text {
          font-family: var(--font-cormorant), serif;
          font-size: 1.05rem;
          color: #6a6080;
          max-width: 420px;
          line-height: 1.65;
          margin: 0;
        }
      `}</style>
    </main>
  );
}