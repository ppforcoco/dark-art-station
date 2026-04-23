// app/obsessions/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { db, getPageContent } from "@/lib/db";
import AdSlot from "@/components/AdSlot";
import AgeGateLink from "@/components/AgeGateLink";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdminHtmlBlock from "@/components/AdminHtmlBlock";
import { sanitizeAdminHtml } from "@/lib/sanitize-html";

// No cache — always serve fresh so admin changes show instantly
export const revalidate = 0;
export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

export async function generateMetadata(): Promise<Metadata> {
  const pageContent = await getPageContent("obsessions");
  const desc =
    pageContent?.metaDesc ??
    "Browse all dark fantasy wallpaper obsessions — horror, gothic, dark humor and more. Free HD downloads for iPhone, Android and PC.";
  const title =
    pageContent?.title ?? "Obsessions | Dark Wallpaper Collections | Haunted Wallpapers";
  return {
    title,
    description: desc,
    alternates: { canonical: `${SITE_URL}/obsessions` },
    openGraph: {
      title, description: desc,
      url: `${SITE_URL}/obsessions`, siteName: "Haunted Wallpapers", type: "website",
      images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630, alt: "Haunted Wallpapers — Obsessions" }],
    },
    twitter: { card: "summary_large_image", title, description: desc, images: [`${SITE_URL}/og-image.jpg`] },
  };
}

export default async function ObsessionsPage() {
  const [collections, pageContent] = await Promise.all([
    db.collection.findMany({
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
    <main style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>

      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Obsessions", href: "/obsessions" },
      ]} />

      {/* ── Title + Description (matches iPhone/Android page style) ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-[60px] pt-10 pb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight mb-6">
          Choose Your <span style={{ color: "#c9a84c", fontStyle: "italic" }}>Obsession</span>
        </h1>

        {/* Description from admin — rendered in iframe, supports any HTML */}
        {pageContent?.body && (
          <AdminHtmlBlock html={pageContent.body} />
        )}
      </section>

      <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN} width={728} height={90} />

      {/* ── Collections Grid ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-[60px] py-10">
        {collections.length === 0 ? (
          <div className="hw-coming-soon" style={{ marginTop: "60px" }}>
            <div className="hw-coming-soon__sigil">✦ ☽ ✦</div>
            <div className="hw-coming-soon__bar" />
            <h2 className="hw-coming-soon__title">Coming Soon</h2>
            <p className="hw-coming-soon__sub">Dark obsessions are being assembled. Check back soon.</p>
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

                {/* 9:16 portrait grid — same column count as iPhone page */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {cols.map((col, i) => {
                    const thumb = col.thumbnail && col.thumbnail.trim() !== ""
                      ? `${r2Base}/${col.thumbnail}`
                      : null;
                    const hasImages = col._count.images > 0;

                    const card = (
                      <div
                        className="dt-obs-card"
                        style={{
                          "--delay": `${i * 0.05}s`,
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

                    return col.isAdult ? (
                      <AgeGateLink key={col.id} slug={col.slug} style={{ textDecoration: "none", display: "block" }}>{card}</AgeGateLink>
                    ) : (
                      <Link key={col.id} href={`/shop/${col.slug}`} style={{ textDecoration: "none", display: "block" }}>{card}</Link>
                    );
                  })}
                </div>

                {groupIdx % 2 === 1 && (
                  <div style={{ marginTop: "28px", display: "flex", justifyContent: "center" }}>
                    <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN} width={728} height={90} />
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </section>

      <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} width={728} height={90} className="mt-8" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Obsessions | Haunted Wallpapers",
            url: `${SITE_URL}/obsessions`,
            description: "Dark fantasy wallpaper obsessions — horror, gothic, dark humor and more.",
            numberOfItems: collections.length,
          }),
        }}
      />
    </main>
  );
}