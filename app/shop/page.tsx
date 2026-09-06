// app/shop/page.tsx
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import Breadcrumbs from "@/components/Breadcrumbs";
import ShopProductCard from "@/components/ShopProductCard";

export const revalidate = 0;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

export const metadata: Metadata = {
  title: "Shop — Dark Art Phone Cases, Tees & More | HauntedWallpapers",
  description: "Wear the art. Custom print-on-demand phone cases, t-shirts and more featuring original dark, gothic and horror designs.",
  alternates: { canonical: `${SITE_URL}/shop` },
  openGraph: {
    title: "Shop — HauntedWallpapers",
    description: "Custom print-on-demand phone cases, t-shirts and more featuring original dark art.",
    url: `${SITE_URL}/shop`, siteName: "Haunted Wallpapers", type: "website",
  },
};

export default async function ShopPage() {
  const products = await db.product.findMany({
    where: { isPublished: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    select: {
      id: true, slug: true, name: true, category: true,
      price: true, compareAtPrice: true, badge: true, thumbnailKey: true,
    },
  });

  const grouped = products.reduce<Record<string, typeof products>>((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Shop" },
      ]} />

      <section className="max-w-7xl mx-auto px-6 md:px-[60px] pt-10 pb-4">
        <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight mb-2">
          Wear the <span style={{ color: "#c9a84c", fontStyle: "italic" }}>Darkness</span>
        </h1>
        <p style={{ color: "#a89bc0", fontSize: "0.95rem", maxWidth: "620px" }}>
          Original dark art, printed on demand — phone cases, tees and more. Every piece made when you order it.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6 md:px-[60px] py-10">
        {products.length === 0 ? (
          <div className="hw-coming-soon" style={{ marginTop: "60px" }}>
            <div className="hw-coming-soon__sigil">✦ ☽ ✦</div>
            <div className="hw-coming-soon__bar" />
            <h2 className="hw-coming-soon__title">Coming Soon</h2>
            <p className="hw-coming-soon__sub">The shop is being stocked. Check back soon.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([category, items]) => (
            <div key={category} style={{ marginBottom: "48px" }}>
              <p style={{
                fontFamily: "var(--font-space,monospace)", fontSize: "0.58rem",
                letterSpacing: "0.3em", textTransform: "uppercase", color: "#4a445a",
                marginBottom: "14px", paddingBottom: "8px", borderBottom: "1px solid #2a2535",
              }}>
                — {category}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {items.map((p, i) => (
                  <ShopProductCard
                    key={p.id}
                    slug={p.slug}
                    name={p.name}
                    category={p.category}
                    price={p.price}
                    compareAtPrice={p.compareAtPrice}
                    badge={p.badge}
                    thumbnail={p.thumbnailKey ? getPublicUrl(p.thumbnailKey) : null}
                    priority={i < 5}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}