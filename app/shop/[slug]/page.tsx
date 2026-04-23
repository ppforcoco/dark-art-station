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

  const metaDesc =
    collection.metaDescription ??
    collection.description ??
    `Download ${collection.title} wallpapers free for iPhone, Android and PC. High-quality dark art wallpapers, instant download.`;

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

  // Related collections
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

  const r2Base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";

  // Description: HTML or plain text
  const isHtml = collection.description && /<[a-z][\s\S]*>/i.test(collection.description);
  const fallbackDesc =
    `${collection.title} is a curated collection of free dark art wallpapers from Haunted Wallpapers. ` +
    `Each piece in this ${collection.category ?? "dark"} collection is available as an instant free download ` +
    `— no account required, no watermarks. Images are formatted for mobile portrait screens (9:16) ` +
    `and look exceptional on AMOLED displays where true blacks create maximum contrast.`;

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Obsessions", href: "/obsessions" },
          { label: collection.title },
        ]}
      />

      {/* ── Title + Description — matches iPhone/Android page style ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-[60px] pt-10 pb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight mb-6">
          {collection.title}
          {collection.isAdult && (
            <span style={{
              marginLeft: "12px",
              background: "rgba(192,0,26,0.12)",
              border: "1px solid rgba(192,0,26,0.35)",
              color: "#c0001a",
              fontSize: "0.6rem",
              fontFamily: "var(--font-space, monospace)",
              letterSpacing: "0.1em",
              padding: "2px 8px",
              verticalAlign: "middle",
            }}>16+</span>
          )}
        </h1>

        <p style={{
          fontFamily: "var(--font-space, monospace)",
          fontSize: "0.6rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "#4a445a",
          marginBottom: "24px",
        }}>
          — {collection.images.length} wallpaper{collection.images.length !== 1 ? "s" : ""} · {collection._count.downloads} downloads · {collection.category}
        </p>

        {/* Description from admin — full HTML support, landscape prose style */}
        <div className="device-page-intro">
          {collection.description ? (
            isHtml
              ? <div dangerouslySetInnerHTML={{ __html: collection.description }} />
              : <p>{collection.description}</p>
          ) : (
            <p>{fallbackDesc}</p>
          )}
        </div>
      </section>

      <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN} width={728} height={90} />

      {/* ── Image Grid — full-width 9:16, matches iPhone/Android page ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-[60px] py-10">
        {collection.images.length === 0 ? (
          <div className="hw-coming-soon">
            <div className="hw-coming-soon__sigil">✦ ☽ ✦</div>
            <div className="hw-coming-soon__bar" />
            <h2 className="hw-coming-soon__title">Coming Soon</h2>
            <p className="hw-coming-soon__sub">
              Dark art is being assembled for this collection. Check back soon.
            </p>
          </div>
        ) : (
          <>
            <p className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-[#4a445a] mb-6">
              — {collection.images.length} wallpaper{collection.images.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {collection.images.map((img, idx) => {
                const thumbUrl = getPublicUrl(img.r2Key);
                const imgAlt =
                  img.altText ??
                  `${img.title} — free dark wallpaper from ${collection.title}`;
                return (
                  <Link
                    key={img.id}
                    href={`/shop/${slug}/${img.slug}`}
                    style={{ textDecoration: "none", display: "block" }}
                  >
                    <div style={{
                      position: "relative",
                      aspectRatio: "9/16",
                      overflow: "hidden",
                      background: "#1a1825",
                      border: "1px solid rgba(255,255,255,0.05)",
                      transition: "border-color 0.2s, transform 0.2s",
                    }}
                      className="coll-img-card"
                    >
                      <Image
                        src={thumbUrl}
                        alt={imgAlt}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                        priority={idx < 10}
                      />
                      <div className="coll-card-overlay">
                        <span style={{
                          fontFamily: "var(--font-space, monospace)",
                          fontSize: "0.48rem",
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: "#c9a84c",
                        }}>View & Download →</span>
                      </div>
                    </div>
                    <div style={{ padding: "8px 4px 4px" }}>
                      <span style={{
                        fontFamily: "var(--font-cormorant, serif)",
                        fontStyle: "italic",
                        fontSize: "0.82rem",
                        color: "var(--text-secondary, #8a809a)",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical" as const,
                        overflow: "hidden",
                      }}>{img.title}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </section>

      <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} width={728} height={90} className="mt-8" />

      {/* ── You May Also Like ── */}
      {relatedCollections.length > 0 && (
        <section style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "48px 24px 64px",
          background: "rgba(12,8,20,0.4)",
        }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <h2 style={{
              fontFamily: "var(--font-cinzel, serif)",
              fontSize: "1rem",
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#ffffff",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}>
              <span style={{ color: "#c0001a" }}>✦</span> You May Also Like
            </h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: "16px",
            }}>
              {relatedCollections.map((rc) => {
                const thumb = rc.thumbnail ? `${r2Base}/${rc.thumbnail}` : null;
                return (
                  <Link key={rc.slug} href={`/shop/${rc.slug}`} style={{ textDecoration: "none", display: "block" }}>
                    <div style={{
                      position: "relative",
                      aspectRatio: "9/16",
                      overflow: "hidden",
                      background: "#0f0c1a",
                      border: "1px solid rgba(255,255,255,0.06)",
                      marginBottom: "10px",
                    }}>
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={thumb} alt={rc.thumbnailAlt ?? rc.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          loading="lazy" />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(192,0,26,0.25)", fontSize: "2rem" }}>✦</div>
                      )}
                    </div>
                    <span style={{
                      fontFamily: "var(--font-space, monospace)",
                      fontSize: "0.48rem",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "#c0001a",
                      display: "block",
                      marginBottom: "4px",
                    }}>{rc.category}</span>
                    <h3 style={{
                      fontFamily: "var(--font-cinzel, serif)",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: "#e8e4f8",
                      margin: "0 0 4px",
                      lineHeight: 1.3,
                    }}>{rc.title}</h3>
                    <span style={{
                      fontFamily: "var(--font-space, monospace)",
                      fontSize: "0.5rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#4a445a",
                    }}>{rc._count.images} wallpapers</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <style>{`
        .coll-img-card:hover {
          border-color: rgba(192,0,26,0.5) !important;
          transform: translateY(-3px);
        }
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
        .coll-img-card:hover .coll-card-overlay { opacity: 1; }
        [data-theme="light"] .coll-img-card {
          background: #f0ebe0 !important;
          border-color: rgba(0,0,0,0.07) !important;
        }
        [data-theme="light"] .coll-img-card:hover {
          border-color: rgba(192,0,26,0.35) !important;
        }
      `}</style>
    </main>
  );
}