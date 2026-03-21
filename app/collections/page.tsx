import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import AdSlot from "@/components/AdSlot";

export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

export const metadata: Metadata = {
  title: "All Collections | Free Dark Wallpapers | Haunted Wallpapers",
  description: "Browse all dark fantasy wallpaper collections — horror, gothic, street style, dark humor and more. Free 4K downloads for iPhone, Android and PC.",
  alternates: { canonical: `${SITE_URL}/collections` },
  openGraph: {
    title: "All Collections | Haunted Wallpapers",
    description: "Browse all dark fantasy wallpaper collections. Free 4K downloads for iPhone, Android and PC.",
    url: `${SITE_URL}/collections`,
    siteName: "Haunted Wallpapers",
    type: "website",
    images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630, alt: "Haunted Wallpapers — All Collections" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "All Collections | Haunted Wallpapers",
    description: "Browse all dark fantasy wallpaper collections. Free 4K downloads.",
    images: [`${SITE_URL}/og-image.jpg`],
  },
};

export default async function CollectionsPage() {
  const collections = await db.collection.findMany({
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    select: {
      id: true, slug: true, title: true, category: true,
      tag: true, icon: true, bgClass: true, featured: true,
      _count: { select: { images: true } },
    },
  });

  const grouped = collections.reduce<Record<string, typeof collections>>((acc, col) => {
    if (!acc[col.category]) acc[col.category] = [];
    acc[col.category].push(col);
    return acc;
  }, {});

  return (
    <main style={{ backgroundColor: "#070710", minHeight: "100vh", paddingTop: "100px" }}>
      <div style={{ padding: "clamp(20px, 5vw, 60px) clamp(20px, 5vw, 60px) 40px", borderBottom: "1px solid #2a2535" }}>
        <span className="section-eyebrow">The Archive</span>
        <h1 className="section-title" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
          All Collections
        </h1>
        <p style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic", fontSize: "1.05rem", color: "#8a8099", marginTop: "12px" }}>
          {collections.length} {collections.length === 1 ? "collection" : "collections"} available
        </p>
      </div>

      <div style={{ padding: "0 clamp(20px, 5vw, 60px) 60px" }}>
        {Object.entries(grouped).map(([category, cols], groupIdx) => (
          <div key={category} style={{ marginBottom: "60px" }}>
            <h2 style={{
              fontFamily: "var(--font-space)", fontSize: "0.65rem", letterSpacing: "0.3em",
              textTransform: "uppercase", color: "#4a445a", marginBottom: "24px",
              paddingBottom: "12px", borderBottom: "1px solid #2a2535"
            }}>
              — {category}
            </h2>
            <div className="category-grid">
              {cols.map((col) => (
                <Link
                  key={col.id}
                  href={`/shop/${col.slug}`}
                  className={`cat-card${col.featured ? " featured" : ""}`}
                >
                  <div className={`cat-bg-layer ${col.bgClass}`} />
                  <div className="cat-icon-el">{col.icon}</div>
                  <div className="cat-overlay" />
                  <div className="cat-content">
                    <span className="cat-tag">{col.tag}</span>
                    <div className="cat-name">{col.title}</div>
                    <div className="cat-count">{col._count.images} images</div>
                  </div>
                </Link>
              ))}
            </div>
            {/* In-feed ad after every other category group */}
            {groupIdx % 2 === 1 && (
              <div style={{ marginTop: "32px", display: "flex", justifyContent: "center" }}>
                <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN} width={728} height={90} />
              </div>
            )}
          </div>
        ))}

        {collections.length === 0 && (
          <div style={{ textAlign: "center", padding: "120px 0" }}>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "#2a2535", marginBottom: "16px" }}>
              Loading collections…
            </p>
            <Link href="/shop" className="section-link">Try the Shop →</Link>
          </div>
        )}
      </div>
    </main>
  );
}