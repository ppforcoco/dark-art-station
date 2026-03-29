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
export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

  const collection = await db.collection.findUnique({
    where: { slug },
    select: { title: true, description: true, metaDescription: true, thumbnail: true, thumbnailAlt: true },
  });

  if (!collection) return { title: "Not Found | Haunted Wallpapers" };

  const ogImage = collection.thumbnail
    ? `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${collection.thumbnail}`
    : `${siteUrl}/og-image.jpg`;

  // Prefer the shorter, keyword-rich metaDescription for the <meta name="description"> tag.
  // Fall back to the long description, then a generic fallback.
  const metaDesc =
    collection.metaDescription ??
    collection.description ??
    `Download ${collection.title} wallpapers free for iPhone, Android and PC. High-quality dark art wallpapers, instant download.`;

  // Use the SEO-optimised thumbnailAlt for OG image alt, fall back to title
  const ogAlt = collection.thumbnailAlt ?? collection.title;

  return {
    title: `${collection.title} | Haunted Wallpapers`,
    description: metaDesc,
    openGraph: {
      title: `${collection.title} | Haunted Wallpapers`,
      description: metaDesc,
      url: `${siteUrl}/shop/${slug}`,
      siteName: "Haunted Wallpapers",
      images: [{ url: ogImage, width: 1200, height: 630, alt: ogAlt }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${collection.title} | Haunted Wallpapers`,
      description: metaDesc,
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
      thumbnailAlt: true,
      icon: true,
      category: true,
      isAdult: true,
      images: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          slug: true,
          title: true,
          altText: true,
          r2Key: true,
          tags: true,
          sortOrder: true,
        },
      },
      _count: { select: { downloads: true } },
    },
  });

  if (!collection) notFound();

  // Fetch related collections: same category first, then others — exclude current
  const relatedRaw = await db.collection.findMany({
    where: { slug: { not: slug } },
    select: {
      slug: true,
      title: true,
      category: true,
      thumbnail: true,
      thumbnailAlt: true,
      _count: { select: { images: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  const sameCategory = relatedRaw.filter((c) => c.category === collection.category);
  const others = relatedRaw.filter((c) => c.category !== collection.category);
  const relatedCollections = [...sameCategory, ...others].slice(0, 3);

  const coverUrl = collection.thumbnail
    ? `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${collection.thumbnail}`
    : null;
  const r2Base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";

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

      {/* ── Page header with title ── */}
      <div className="coll-header">
        <div className="coll-header-inner">
          {coverUrl && (
            <div className="coll-cover-wrap">
              <Image
                src={coverUrl}
                // Use SEO-optimised alt text from DB if available, fall back to title
                alt={collection.thumbnailAlt ?? collection.title}
                fill
                unoptimized
                className="object-cover"
                sizes="(max-width: 640px) 80px, 120px"
                priority
              />
            </div>
          )}
          <div className="coll-header-text">
            <span className="coll-eyebrow">Collection · {collection.category}</span>
            <h1 className="coll-title">{collection.title}</h1>
            <p className="coll-meta">
              {collection.images.length} wallpaper{collection.images.length !== 1 ? "s" : ""}
              {" · "}
              {collection._count.downloads} downloads
              {collection.isAdult && (
                <span className="coll-adult-badge">· 16+</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ── Main layout: grid + sidebar ── */}
      <div className="coll-layout">

        {/* ── Image Grid ── */}
        <section className="coll-grid-section">
          <div className="coll-grid">
            {collection.images.map((img, idx) => {
              const thumbUrl = getPublicUrl(img.r2Key);
              // Build a rich, descriptive alt: prefer the stored altText, fall back to title + collection context
              const imgAlt =
                img.altText ??
                `${img.title} — free dark wallpaper from ${collection.title}`;
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
                      alt={imgAlt}
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

        {/* ── Side Info Panel ── */}
        <aside className="coll-sidebar">
          <div className="coll-sidebar-inner">

            {/* Collection details */}
            <div className="coll-sidebar-details">
              <span className="coll-sidebar-eyebrow">Collection Details</span>
              <h2 className="coll-sidebar-title">{collection.title}</h2>

              {collection.description && (
                <p className="coll-sidebar-desc">{collection.description}</p>
              )}

              {/* Stats row */}
              <div className="coll-sidebar-stats">
                <div className="coll-sidebar-stat">
                  <span className="coll-sidebar-stat-num">{collection.images.length}</span>
                  <span className="coll-sidebar-stat-label">Wallpapers</span>
                </div>
                <div className="coll-sidebar-stat">
                  <span className="coll-sidebar-stat-num">{collection._count.downloads}</span>
                  <span className="coll-sidebar-stat-label">Downloads</span>
                </div>
              </div>

              {/* Feature badges */}
              <div className="coll-sidebar-badges">
                <div className="coll-sidebar-badge">
                  <span className="coll-sidebar-badge-icon">↓</span>
                  <span className="coll-sidebar-badge-label">Free<br/>Download</span>
                </div>
                <div className="coll-sidebar-badge">
                  <span className="coll-sidebar-badge-icon">✦</span>
                  <span className="coll-sidebar-badge-label">HD<br/>Resolution</span>
                </div>
                <div className="coll-sidebar-badge">
                  <span className="coll-sidebar-badge-icon">◈</span>
                  <span className="coll-sidebar-badge-label">AMOLED<br/>Ready</span>
                </div>
                <div className="coll-sidebar-badge">
                  <span className="coll-sidebar-badge-icon">⬡</span>
                  <span className="coll-sidebar-badge-label">No<br/>Watermark</span>
                </div>
              </div>

              {/* Category tag */}
              <div className="coll-sidebar-meta-row">
                <span className="coll-sidebar-meta-key">Category</span>
                <span className="coll-sidebar-meta-val">{collection.category}</span>
              </div>
              <div className="coll-sidebar-meta-row">
                <span className="coll-sidebar-meta-key">Format</span>
                <span className="coll-sidebar-meta-val">JPEG · 9:16 Portrait</span>
              </div>
              <div className="coll-sidebar-meta-row">
                <span className="coll-sidebar-meta-key">License</span>
                <span className="coll-sidebar-meta-val">Free Personal Use</span>
              </div>
              {collection.isAdult && (
                <div className="coll-sidebar-meta-row">
                  <span className="coll-sidebar-meta-key">Rating</span>
                  <span className="coll-sidebar-meta-val coll-sidebar-adult">16+ Mature</span>
                </div>
              )}
            </div>

            {/* AdSense sidebar slot */}
            <div className="coll-sidebar-ad">
              <AdSlot
                slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR}
                format="rectangle"
                width={300}
                height={250}
              />
            </div>
          </div>
        </aside>

      </div>

      <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} width={728} height={90} />

      {/* ── You May Also Like ── */}
      {relatedCollections.length > 0 && (
        <section className="coll-related-section">
          <div className="coll-related-inner">
            <h2 className="coll-related-heading">
              <span style={{ color: "#c0001a" }}>✦</span> You May Also Like
            </h2>
            <div className="coll-related-grid">
              {relatedCollections.map((rc) => {
                const thumb = rc.thumbnail ? `${r2Base}/${rc.thumbnail}` : null;
                return (
                  <Link key={rc.slug} href={`/shop/${rc.slug}`} className="coll-related-card">
                    <div className="coll-related-thumb-wrap">
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={thumb} alt={rc.thumbnailAlt ?? rc.title} className="coll-related-thumb" loading="lazy" />
                      ) : (
                        <div className="coll-related-no-thumb">✦</div>
                      )}
                    </div>
                    <div className="coll-related-body">
                      <span className="coll-related-category">{rc.category}</span>
                      <h3 className="coll-related-title">{rc.title}</h3>
                      <span className="coll-related-count">{rc._count.images} wallpapers</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <style>{`
        /* ── Collection Header ── */
        .coll-header {
          border-bottom: 1px solid var(--border-dim, #2a2535);
          padding: 32px 24px 28px;
          background: linear-gradient(135deg, rgba(139,0,0,0.04) 0%, transparent 60%);
        }
        .coll-header-inner {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: flex-start;
          gap: 20px;
        }
        .coll-cover-wrap {
          position: relative;
          flex-shrink: 0;
          width: 72px;
          aspect-ratio: 9 / 16;
          overflow: hidden;
          border: 1px solid var(--border-dim, #2a2535);
        }
        @media (min-width: 640px) {
          .coll-cover-wrap { width: 100px; }
        }
        .coll-header-text { display: flex; flex-direction: column; gap: 6px; }
        .coll-eyebrow {
          font-family: var(--font-space), monospace;
          font-size: 0.52rem;
          letter-spacing: 0.28em;
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
        .coll-meta {
          font-family: var(--font-space), monospace;
          font-size: 0.58rem;
          letter-spacing: 0.1em;
          color: #4a445a;
          margin: 0;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        [data-theme="light"] .coll-meta { color: #8a8468; }
        .coll-adult-badge {
          background: rgba(192,0,26,0.12);
          border: 1px solid rgba(192,0,26,0.35);
          color: #c0001a;
          padding: 1px 6px;
          font-size: 0.5rem;
          letter-spacing: 0.1em;
        }

        /* ── Main layout ── */
        .coll-layout {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 0;
          align-items: flex-start;
        }
        @media (min-width: 1100px) {
          .coll-layout {
            flex-direction: row;
          }
        }

        /* ── Grid Section ── */
        .coll-grid-section {
          flex: 1;
          min-width: 0;
          padding: 28px 24px 64px;
        }
        .coll-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 14px;
        }
        @media (max-width: 1199px) { .coll-grid { grid-template-columns: repeat(4, 1fr); } }
        @media (max-width: 767px)  { .coll-grid { grid-template-columns: repeat(3, 1fr); gap: 10px; } }
        @media (max-width: 479px)  { .coll-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; } }

        /* ── Sidebar ── */
        .coll-sidebar {
          width: 100%;
          flex-shrink: 0;
          padding: 24px 16px;
          order: -1;
        }
        @media (min-width: 1100px) {
          .coll-sidebar {
            width: 300px;
            padding: 28px 24px 64px 0;
            position: sticky;
            top: 80px;
            align-self: flex-start;
            order: unset;
          }
        }

        .coll-sidebar-inner {
          display: flex;
          flex-direction: column;
          gap: 0;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(12,8,20,0.7);
          backdrop-filter: blur(8px);
          overflow: hidden;
        }
        [data-theme="light"] .coll-sidebar-inner {
          background: rgba(240,235,224,0.95);
          border-color: rgba(0,0,0,0.08);
        }
        [data-theme="ghost"] .coll-sidebar-inner {
          background: rgba(26,26,30,0.85);
          border-color: rgba(255,255,255,0.07);
        }
        [data-theme="ember"] .coll-sidebar-inner {
          background: rgba(15,8,0,0.85);
          border-color: rgba(255,102,0,0.12);
        }

        /* Sidebar details */
        .coll-sidebar-details {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .coll-sidebar-eyebrow {
          font-family: var(--font-space), monospace;
          font-size: 0.48rem;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #c0001a;
        }
        [data-theme="ember"] .coll-sidebar-eyebrow { color: #ff4400; }
        .coll-sidebar-title {
          font-family: var(--font-cinzel), cursive;
          font-size: clamp(0.9rem, 1.5vw, 1.15rem);
          font-weight: 900;
          color: #f0ecff;
          line-height: 1.2;
          margin: 0;
        }
        [data-theme="light"] .coll-sidebar-title { color: #1a1814; }
        .coll-sidebar-desc {
          font-family: var(--font-cormorant), serif;
          font-size: 0.9rem;
          color: #8a8099;
          line-height: 1.65;
          margin: 0;
        }
        [data-theme="light"] .coll-sidebar-desc { color: #5a5450; }

        /* Stats */
        .coll-sidebar-stats {
          display: flex;
          gap: 12px;
          padding: 14px 0;
          border-top: 1px solid rgba(255,255,255,0.05);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        [data-theme="light"] .coll-sidebar-stats {
          border-color: rgba(0,0,0,0.07);
        }
        .coll-sidebar-stat {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
          align-items: center;
        }
        .coll-sidebar-stat-num {
          font-family: var(--font-space), monospace;
          font-size: 1.2rem;
          font-weight: 700;
          color: #c0001a;
          line-height: 1;
        }
        [data-theme="ember"] .coll-sidebar-stat-num { color: #ff4400; }
        .coll-sidebar-stat-label {
          font-family: var(--font-space), monospace;
          font-size: 0.42rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #4a445a;
        }
        [data-theme="light"] .coll-sidebar-stat-label { color: #8a8468; }

        /* Feature badges */
        .coll-sidebar-badges {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
        }
        .coll-sidebar-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          padding: 10px 8px;
          border: 1px solid rgba(139,0,0,0.2);
          background: rgba(139,0,0,0.05);
          transition: background 0.2s, border-color 0.2s;
        }
        .coll-sidebar-badge:hover {
          background: rgba(139,0,0,0.1);
          border-color: rgba(139,0,0,0.4);
        }
        [data-theme="light"] .coll-sidebar-badge {
          border-color: rgba(139,0,0,0.12);
          background: rgba(139,0,0,0.03);
        }
        .coll-sidebar-badge-icon {
          font-size: 0.95rem;
          color: #c0001a;
          line-height: 1;
        }
        [data-theme="ember"] .coll-sidebar-badge-icon { color: #ff4400; }
        .coll-sidebar-badge-label {
          font-family: var(--font-space), monospace;
          font-size: 0.4rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
          text-align: center;
          line-height: 1.5;
        }

        /* Meta rows */
        .coll-sidebar-meta-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 5px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        [data-theme="light"] .coll-sidebar-meta-row {
          border-color: rgba(0,0,0,0.05);
        }
        .coll-sidebar-meta-key {
          font-family: var(--font-space), monospace;
          font-size: 0.45rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #4a445a;
        }
        [data-theme="light"] .coll-sidebar-meta-key { color: #8a8468; }
        .coll-sidebar-meta-val {
          font-family: var(--font-space), monospace;
          font-size: 0.48rem;
          letter-spacing: 0.08em;
          color: #c4bdd8;
        }
        [data-theme="light"] .coll-sidebar-meta-val { color: #3a3450; }
        .coll-sidebar-adult {
          color: #c0001a !important;
          background: rgba(192,0,26,0.1);
          border: 1px solid rgba(192,0,26,0.3);
          padding: 1px 6px;
        }

        /* Sidebar ad */
        .coll-sidebar-ad {
          border-top: 1px solid rgba(255,255,255,0.04);
          padding: 16px;
        }
        [data-theme="light"] .coll-sidebar-ad { border-color: rgba(0,0,0,0.05); }

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

        /* ── You May Also Like ── */
        .coll-related-section {
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 48px 24px 64px;
          background: rgba(12,8,20,0.4);
        }
        [data-theme="light"] .coll-related-section {
          border-top-color: #cdc8bc;
          background: rgba(244,241,234,0.6);
        }
        .coll-related-inner {
          max-width: 1200px;
          margin: 0 auto;
        }
        .coll-related-heading {
          font-family: var(--font-cinzel), cursive;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #ffffff;
          text-shadow: 0 0 18px rgba(192, 0, 26, 0.5);
          margin: 0 0 24px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        [data-theme="light"] .coll-related-heading { color: #1a1814; text-shadow: none; }
        .coll-related-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        @media (max-width: 640px) { .coll-related-grid { grid-template-columns: 1fr; } }
        @media (min-width: 641px) and (max-width: 900px) { .coll-related-grid { grid-template-columns: repeat(2, 1fr); } }
        .coll-related-card {
          display: flex;
          flex-direction: column;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.06);
          overflow: hidden;
          background: rgba(12,8,20,0.6);
          transition: border-color 0.2s, transform 0.2s;
        }
        .coll-related-card:hover {
          border-color: rgba(192,0,26,0.5);
          transform: translateY(-3px);
        }
        [data-theme="light"] .coll-related-card {
          background: #f0ebe0;
          border-color: #cdc8bc;
        }
        [data-theme="light"] .coll-related-card:hover {
          border-color: rgba(192,0,26,0.4);
          background: #e8e3d8;
        }
        .coll-related-thumb-wrap {
          width: 100%;
          aspect-ratio: 3/4;
          overflow: hidden;
          background: #0f0c1a;
          flex-shrink: 0;
          flex-grow: 0;
        }
        [data-theme="light"] .coll-related-thumb-wrap { background: #e0dbd0; }
        .coll-related-thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.35s ease;
        }
        .coll-related-card:hover .coll-related-thumb { transform: scale(1.05); }
        .coll-related-no-thumb {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(192,0,26,0.25);
          font-size: 2rem;
        }
        .coll-related-body {
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .coll-related-category {
          font-family: var(--font-space), monospace;
          font-size: 0.48rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #c0001a;
        }
        .coll-related-title {
          font-family: var(--font-cinzel), cursive;
          font-size: 0.9rem;
          font-weight: 700;
          color: #e8e4f8;
          line-height: 1.3;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          word-break: break-word;
        }
        [data-theme="light"] .coll-related-title { color: #1a1814; }
        .coll-related-count {
          font-family: var(--font-space), monospace;
          font-size: 0.5rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #4a445a;
          margin-top: 2px;
        }
        [data-theme="light"] .coll-related-count { color: #8a8468; }
      `}</style>
    </main>
  );
}