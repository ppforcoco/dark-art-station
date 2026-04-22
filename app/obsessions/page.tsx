// app/obsessions/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { db, getPageContent } from "@/lib/db";
import AdSlot from "@/components/AdSlot";
import Breadcrumbs from "@/components/Breadcrumbs";
import AgeGateLink from "@/components/AgeGateLink";

export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

export async function generateMetadata(): Promise<Metadata> {
  const pageContent = await getPageContent("obsessions");
  const desc = pageContent?.metaDesc ??
    "Browse all dark fantasy wallpaper obsessions — horror, gothic, dark humor and more. Free HD downloads for iPhone, Android and PC.";
  const title = pageContent?.title ?? "Obsessions | Dark Wallpaper Collections | Haunted Wallpapers";
  return {
    title,
    description: desc,
    alternates: { canonical: `${SITE_URL}/obsessions` },
    openGraph: {
      title,
      description: desc,
      url: `${SITE_URL}/obsessions`,
      siteName: "Haunted Wallpapers",
      type: "website",
      images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630, alt: "Haunted Wallpapers — Obsessions" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [`${SITE_URL}/og-image.jpg`],
    },
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

  // Group by category
  const grouped = collections.reduce<Record<string, typeof collections>>((acc, col) => {
    if (!acc[col.category]) acc[col.category] = [];
    acc[col.category].push(col);
    return acc;
  }, {});

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Obsessions", href: "/obsessions" },
      ]} />

      <section className="max-w-7xl mx-auto px-6 md:px-[60px] pt-10 pb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight mb-6">
          Choose Your <span className="text-[#c9a84c] italic">Obsession</span>
        </h1>

        {/* Admin-editable page intro */}
        {pageContent?.body && (
          <div className="device-page-intro" dangerouslySetInnerHTML={{ __html: pageContent.body }} />
        )}
      </section>

      <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN} width={728} height={90} />

      <section className="max-w-7xl mx-auto px-6 md:px-[60px] py-10">
        {collections.length === 0 ? (
          <div className="hw-coming-soon">
            <div className="hw-coming-soon__sigil">✦ ☽ ✦</div>
            <div className="hw-coming-soon__bar" />
            <h2 className="hw-coming-soon__title">Coming Soon</h2>
            <p className="hw-coming-soon__sub">Dark obsessions are being assembled. Check back soon.</p>
          </div>
        ) : (
          <>
            {Object.entries(grouped).map(([category, cols], groupIdx) => (
              <div key={category} style={{ marginBottom: "56px" }}>
                {/* Category heading */}
                <h2 style={{
                  fontFamily: "var(--font-space, monospace)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "#4a445a",
                  marginBottom: "20px",
                  paddingBottom: "10px",
                  borderBottom: "1px solid #2a2535",
                }}>
                  — {category}
                </h2>

                <div className="dt-obs-grid">
                  {cols.map((col, i) => {
                    const thumb = col.thumbnail ? `${r2Base}/${col.thumbnail}` : null;
                    const hasImages = col._count.images > 0;

                    const cardContent = (
                      <div
                        className="dt-obs-card"
                        style={{ "--delay": `${i * 0.06}s` } as React.CSSProperties}
                      >
                        <div className="dt-obs-card__bg">
                          {thumb && hasImages ? (
                            <Image
                              src={thumb}
                              alt={col.thumbnailAlt ?? col.title}
                              fill
                              unoptimized
                              className="object-cover"
                              sizes="(max-width:600px) 50vw, (max-width:1024px) 33vw, 25vw"
                            />
                          ) : (
                            <div className="dt-obs-card__placeholder" style={{
                              display: "flex", flexDirection: "column",
                              alignItems: "center", justifyContent: "center",
                              height: "100%", gap: "0.5rem",
                            }}>
                              <span style={{ fontSize: "2.5rem" }}>{col.icon ?? "🖤"}</span>
                              <span style={{
                                fontSize: "0.7rem", letterSpacing: "0.15em",
                                color: "rgba(255,255,255,0.35)", textTransform: "uppercase",
                              }}>Coming Soon</span>
                            </div>
                          )}
                          <div className="dt-obs-card__veil" />
                        </div>
                        <div className="dt-obs-card__glitch" aria-hidden="true" />
                        <div className="dt-obs-card__drip" aria-hidden="true" />
                        <div className="dt-obs-card__body">
                          <h3 className="dt-obs-card__title">{col.title}</h3>
                          <span className="dt-obs-card__count">
                            {hasImages ? `${col._count.images} wallpapers` : "Coming soon"}
                          </span>
                        </div>
                        <div className="dt-obs-card__glow" aria-hidden="true" />
                        <span className="dt-obs-card__corner dt-obs-card__corner--tl">†</span>
                        <span className="dt-obs-card__corner dt-obs-card__corner--br">†</span>
                        {/* 16+ badge */}
                        {col.isAdult && (
                          <div style={{
                            position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            gap: "6px", background: "#000", borderTop: "2px solid #fff",
                            padding: "5px 8px",
                          }}>
                            <span style={{
                              background: "#c0001a", color: "#fff",
                              fontFamily: "monospace", fontSize: "0.65rem",
                              fontWeight: 900, padding: "1px 6px",
                            }}>16+</span>
                          </div>
                        )}
                      </div>
                    );

                    if (col.isAdult) {
                      return (
                        <AgeGateLink key={col.id} slug={col.slug} style={{ textDecoration: "none" }}>
                          {cardContent}
                        </AgeGateLink>
                      );
                    }

                    return (
                      <Link key={col.id} href={`/shop/${col.slug}`} style={{ textDecoration: "none" }}>
                        {cardContent}
                      </Link>
                    );
                  })}
                </div>

                {groupIdx % 2 === 1 && (
                  <div style={{ marginTop: "32px", display: "flex", justifyContent: "center" }}>
                    <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN} width={728} height={90} />
                  </div>
                )}
              </div>
            ))}

            <p className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-[#4a445a] mt-4">
              — {collections.length} obsessions total
            </p>
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