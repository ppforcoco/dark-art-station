import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import ProductCard from "@/components/ProductCard";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Free Wallpapers | Haunted Wallpapers",
  description: "Download free dark fantasy wallpapers. No account required. High-resolution arcane art, skeletons, tarot, and more — all free.",
};

export default async function FreePage() {
  const freeCollections = await db.collection.findMany({
    where: { isFree: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, slug: true, title: true, category: true,
      price: true, isFree: true, badge: true,
      icon: true, bgClass: true, thumbnail: true,
    },
  });

  return (
    <main style={{ backgroundColor: "#070710", minHeight: "100vh", paddingTop: "100px" }}>
      <div style={{ padding: "60px 60px 40px", borderBottom: "1px solid #2a2535" }}>
        <span className="section-eyebrow">No Sacrifice Required</span>
        <h1 className="section-title" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
          Free Picks
        </h1>
        <p style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic", fontSize: "1.05rem", color: "#8a8099", marginTop: "12px" }}>
          {freeCollections.length > 0
            ? `${freeCollections.length} free ${freeCollections.length === 1 ? "collection" : "collections"} — yours for the taking`
            : "Free collections arriving from the void…"}
        </p>
      </div>

      <div style={{ padding: "60px" }}>
        {freeCollections.length > 0 ? (
          <div className="product-grid">
            {freeCollections.map((p) => (
              <ProductCard
                key={p.id}
                slug={p.slug}
                name={p.title}
                category={p.category}
                price={p.price}
                isFree={p.isFree}
                badge={p.badge as "New" | "Hot" | "Free" | undefined ?? undefined}
                icon={p.icon}
                bgClass={p.bgClass}
                thumbnail={p.thumbnail ? `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${p.thumbnail}` : null}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "120px 0" }}>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "#2a2535", marginBottom: "16px" }}>
              All collections are free — browse the full grimoire.
            </p>
            <Link href="/shop" className="section-link">Browse All →</Link>
          </div>
        )}
      </div>
    </main>
  );
}