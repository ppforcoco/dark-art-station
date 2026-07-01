// app/collections/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { db, getPageContent } from "@/lib/db";
import AdminHtmlBlock from "@/components/AdminHtmlBlock";
import Breadcrumbs from "@/components/Breadcrumbs";

export const revalidate = 0;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";
// Same real, working default image used in the root layout — the old
// `${SITE_URL}/og-image.jpg` fallback pointed at a file that doesn't exist
// in /public, so shares/search previews for this page showed nothing.
const DEFAULT_OG_IMAGE = "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/og-image.webp";

export async function generateMetadata(): Promise<Metadata> {
  const pageContent = await getPageContent("obsessions");
  const desc =
    pageContent?.metaDesc ??
    "Browse all dark wallpaper collections — horror, gothic, dark fantasy and more. Free HD downloads for iPhone, Android and PC.";
  const title =
    pageContent?.title ?? "Collections | Dark Wallpaper Collections | Haunted Wallpapers";

  // Pull one real collection thumbnail — same image visitors already see
  // in the collection cards on this page — instead of the generic fallback.
  let ogImage: string = DEFAULT_OG_IMAGE;
  try {
    const latest = await db.collection.findFirst({
      where: { thumbnail: { not: null } },
      orderBy: { createdAt: "desc" },
      select: { thumbnail: true },
    });
    if (latest?.thumbnail) {
      ogImage = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${latest.thumbnail}`;
    }
  } catch {
    // fall back silently to DEFAULT_OG_IMAGE
  }

  return {
    title,
    description: desc,
    alternates: { canonical: `${SITE_URL}/collections` },
    openGraph: {
      title, description: desc,
      url: `${SITE_URL}/collections`, siteName: "Haunted Wallpapers", type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: "Haunted Wallpapers — Collections" }],
    },
    twitter: { card: "summary_large_image", title, description: desc, images: [ogImage] },
  };
}

export default async function CollectionsPage() {
  const [collections, pageContent] = await Promise.all([
    db.collection.findMany({
      where: { isPublished: true },
      orderBy: [{ featured: "desc" }, { createdAt: "asc" }],
      select: {
        id: true, slug: true, title: true, category: true,
        tag: true, icon: true, bgClass: true, featured: true,
        isAdult: true, thumbnail: true, thumbnailAlt: true,
        _count: { select: { images: true } },
      },
    }),
    getPageContent("obsessions"),
  ]);

  const r2Base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";

  const grouped = collections.reduce<Record<string, typeof collections>>((acc, col) => {
    if (!acc[col.category]) acc[col.category] = [];
    acc[col.category].push(col);
    return acc;
  }, {});

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>

      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Collections" },
      ]} />

      {/* ── Title ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-[60px] pt-10 pb-4">
        <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight mb-6">
          Browse <span style={{ color: "#c9a84c", fontStyle: "italic" }}>Collections</span>
        </h1>
      </section>

      {/* ── Collections Grid ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-[60px] py-10">
        {collections.length === 0 ? (
          <div className="hw-coming-soon" style={{ marginTop: "60px" }}>
            <div className="hw-coming-soon__sigil">✦ ☽ ✦</div>
            <div className="hw-coming-soon__bar" />
            <h2 className="hw-coming-soon__title">Coming Soon</h2>
            <p className="hw-coming-soon__sub">Dark collections are being assembled. Check back soon.</p>
          </div>
        ) : (
          <>
            {Object.entries(grouped).map(([category, cols], groupIdx) => (
              <div key={category} style={{ marginBottom: "48px" }}>
                <p style={{
                  fontFamily: "var(--font-space,monospace)", fontSize: "0.58rem",
                  letterSpacing: "0.3em", textTransform: "uppercase", color: "#4a445a",
                  marginBottom: "14px", paddingBottom: "8px", borderBottom: "1px solid #2a2535",
                }}>
                  — {category}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {cols.map((col, i) => {
                    const thumb = col.thumbnail && col.thumbnail.trim() !== ""
                      ? `${r2Base}/${col.thumbnail}`
                      : null;
                    const hasImages = col._count.images > 0;

                    const BORDER_PALETTE = [
                      { border: "#7c3aed", glow: "rgba(124,58,237,0.4)"   },
                      { border: "#c0001a", glow: "rgba(192,0,26,0.4)"     },
                      { border: "#9aa5b4", glow: "rgba(154,165,180,0.3)"  },
                      { border: "#800020", glow: "rgba(128,0,32,0.4)"     },
                      { border: "#1a5c36", glow: "rgba(26,92,54,0.4)"     },
                      { border: "#111111", glow: "rgba(200,190,255,0.12)" },
                      { border: "#a855f7", glow: "rgba(168,85,247,0.4)"   },
                    ];
                    const palette = BORDER_PALETTE[i % BORDER_PALETTE.length];

                    const card = (
                      <div
                        className="dt-obs-card"
                        style={{
                          "--delay": `${i * 0.05}s`,
                          "--obs-card-border": palette.border,
                          "--obs-card-border-hover": palette.border,
                          "--obs-card-border-glow": palette.glow,
                          aspectRatio: "9/16",
                          position: "relative",
                          overflow: "hidden",
                          borderRadius: "4px",
                          display: "block",
                          width: "100%",
                        } as React.CSSProperties}
                      >
                        <div className="dt-obs-card__bg" style={{ position: "absolute", inset: 0 }}>
                          {thumb ? (
                            <Image
                              src={thumb}
                              alt={col.thumbnailAlt ?? col.title}
                              fill
                              unoptimized
                              className="object-cover"
                              sizes="(max-width:480px) 50vw, (max-width:900px) 33vw, 25vw"
                            />
                          ) : (
                            <div className="dt-obs-card__placeholder" style={{
                              display: "flex", flexDirection: "column",
                              alignItems: "center", justifyContent: "center",
                              height: "100%", gap: "0.5rem",
                            }}>
                              <span style={{ fontSize: "clamp(1.8rem,4vw,2.5rem)" }}>{col.icon ?? "🖤"}</span>
                              <span style={{ fontSize: "0.6rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>
                                {hasImages ? col.tag : "Coming Soon"}
                              </span>
                            </div>
                          )}
                          <div className="dt-obs-card__veil" />
                        </div>
                        <div className="dt-obs-card__glitch" aria-hidden="true" />
                        <div className="dt-obs-card__drip" aria-hidden="true" />
                        <div className="dt-obs-card__body">
                          <span className="dt-obs-card__tag">{col.tag}</span>
                          <h3 className="dt-obs-card__title" style={{ fontSize: "clamp(0.65rem,1.8vw,0.85rem)" }}>{col.title}</h3>
                          <span className="dt-obs-card__count" style={{ fontSize: "clamp(0.55rem,1.2vw,0.72rem)" }}>
                            {hasImages ? `${col._count.images} wallpapers` : "Coming soon"}
                          </span>
                        </div>
                        <div className="dt-obs-card__glow" aria-hidden="true" />
                        <span className="dt-obs-card__corner dt-obs-card__corner--tl">†</span>
                        <span className="dt-obs-card__corner dt-obs-card__corner--br">†</span>
                        {col.isAdult && (
                          <div style={{
                            position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: "#000", borderTop: "2px solid #fff", padding: "4px",
                          }}>
                            <span style={{ background: "#c0001a", color: "#fff", fontFamily: "monospace", fontSize: "0.6rem", fontWeight: 900, padding: "1px 6px" }}>16+</span>
                          </div>
                        )}
                      </div>
                    );

                    return (
                      <Link prefetch={false} key={col.id} href={`/collections/${col.slug}`} style={{ textDecoration: "none", display: "block" }}>{card}</Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </>
        )}
      </section>

      {pageContent?.body && (
        <div className="w-full px-6 md:px-16 pb-8">
          <AdminHtmlBlock html={pageContent.body} />
        </div>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Collections | Haunted Wallpapers",
            url: `${SITE_URL}/collections`,
            description: "Dark wallpaper collections — horror, gothic, dark fantasy and more.",
            numberOfItems: collections.length,
          }),
        }}
      />
    </div>
  );
}