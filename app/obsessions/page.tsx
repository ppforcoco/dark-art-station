// app/obsessions/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { db, getPageContent } from "@/lib/db";
import AdSlot from "@/components/AdSlot";
import AgeGateLink from "@/components/AgeGateLink";

export const revalidate = 60;

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

  // Parse pageContent.body HTML into individual card blocks for horizontal layout
  const bodyHtml = pageContent?.body ?? "";
  // Split on common block separators so we can lay them out in a row
  const bodyBlocks: string[] = bodyHtml
    ? bodyHtml
        .split(/(?=<(?:div|section|article|p|blockquote|h[1-6])[^>]*class[^>]*(?:card|block|item|quote|box|text)[^>]*>)/i)
        .map(s => s.trim())
        .filter(Boolean)
    : [];

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>

      <div style={{ paddingTop: "calc(var(--nav-h, 64px) + 32px)", paddingBottom: "24px", paddingLeft: "clamp(16px,4vw,60px)", paddingRight: "clamp(16px,4vw,60px)" }}>
        <h1 style={{ fontFamily: "var(--font-cinzel,serif)", fontSize: "clamp(1.8rem,5vw,3.2rem)", fontWeight: 700, lineHeight: 1.1, margin: 0 }}>
          Choose Your <span style={{ color: "#c9a84c", fontStyle: "italic" }}>Obsession</span>
        </h1>
        <p style={{ fontFamily: "var(--font-space,monospace)", fontSize: "0.6rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "#4a445a", marginTop: "10px" }}>
          — {collections.length} {collections.length === 1 ? "obsession" : "obsessions"} available
        </p>
      </div>

      <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN} width={728} height={90} />

      <div style={{ paddingLeft: "clamp(12px,3vw,40px)", paddingRight: "clamp(12px,3vw,40px)", paddingBottom: "60px" }}>
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

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(clamp(130px, 22vw, 260px), 1fr))",
                  gap: "clamp(6px,1.5vw,16px)",
                }}>
                  {cols.map((col, i) => {
                    const thumb = col.thumbnail ? `${r2Base}/${col.thumbnail}` : null;
                    const hasImages = col._count.images > 0;

                    const card = (
                      <div
                        className="dt-obs-card"
                        style={{ "--delay": `${i * 0.05}s` } as React.CSSProperties}
                      >
                        <div className="dt-obs-card__bg">
                          {thumb && hasImages ? (
                            <Image
                              src={thumb} alt={col.thumbnailAlt ?? col.title}
                              fill unoptimized className="object-cover"
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
                                Coming Soon
                              </span>
                            </div>
                          )}
                          <div className="dt-obs-card__veil" />
                        </div>
                        <div className="dt-obs-card__glitch" aria-hidden="true" />
                        <div className="dt-obs-card__drip" aria-hidden="true" />
                        <div className="dt-obs-card__body">
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
                      <AgeGateLink key={col.id} slug={col.slug} style={{ textDecoration: "none" }}>{card}</AgeGateLink>
                    ) : (
                      <Link key={col.id} href={`/shop/${col.slug}`} style={{ textDecoration: "none" }}>{card}</Link>
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

        {/* ── Page body content: horizontal scrolling landscape strip ── */}
        {bodyHtml && (
          <div style={{ marginTop: "56px" }}>
            {/* Divider */}
            <div style={{
              display: "flex", alignItems: "center", gap: "16px",
              marginBottom: "28px",
            }}>
              <div style={{ flex: 1, height: "1px", background: "linear-gradient(to right, transparent, #2a2535)" }} />
              <span style={{ fontFamily: "var(--font-space,monospace)", fontSize: "0.5rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#4a445a" }}>
                ✦ lore ✦
              </span>
              <div style={{ flex: 1, height: "1px", background: "linear-gradient(to left, transparent, #2a2535)" }} />
            </div>

            {/* Horizontal scrolling row of description cards */}
            <div style={{
              display: "grid",
              gridTemplateColumns: bodyBlocks.length > 1
                ? `repeat(${Math.min(bodyBlocks.length, 3)}, 1fr)`
                : "1fr",
              gap: "clamp(12px, 2vw, 24px)",
            }}
              className="obs-body-grid"
            >
              {bodyBlocks.length > 1 ? (
                bodyBlocks.map((block, i) => (
                  <div
                    key={i}
                    className="obs-body-card device-page-intro"
                    dangerouslySetInnerHTML={{ __html: block }}
                    style={{
                      background: "rgba(10,6,18,0.7)",
                      border: "1px solid #2a2535",
                      padding: "clamp(16px,2.5vw,28px)",
                      fontSize: "clamp(0.7rem,1.2vw,0.85rem)",
                      lineHeight: 1.75,
                    }}
                  />
                ))
              ) : (
                /* Single body block — render inline, no card wrapping */
                <div
                  className="device-page-intro obs-body-single"
                  dangerouslySetInnerHTML={{ __html: bodyHtml }}
                  style={{
                    maxWidth: "860px",
                    fontSize: "clamp(0.75rem,1.2vw,0.9rem)",
                    lineHeight: 1.8,
                  }}
                />
              )}
            </div>

            <style>{`
              /* Obsessions body grid — responsive */
              @media (max-width: 900px) {
                .obs-body-grid {
                  grid-template-columns: repeat(2, 1fr) !important;
                }
              }
              @media (max-width: 560px) {
                .obs-body-grid {
                  grid-template-columns: 1fr !important;
                }
              }
              /* Trim excessive font-size from CMS-injected cards */
              .obs-body-card p,
              .obs-body-card div {
                font-size: inherit !important;
                line-height: inherit !important;
              }
              /* Ensure text inside doesn't overflow */
              .obs-body-card {
                overflow: hidden;
                word-break: break-word;
              }
            `}</style>
          </div>
        )}
      </div>

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