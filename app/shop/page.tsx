// app/shop/page.tsx
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import Breadcrumbs from "@/components/Breadcrumbs";
import ShopCategoryFilter from "@/components/ShopCategoryFilter";

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

  // Order category sections + pills consistently: Phone Case, T-Shirt, Hoodie
  // first (in that order, if present), then anything else alphabetically —
  // rather than whatever order they happened to be created in.
  const PRIORITY_ORDER = ["Phone Case", "T-Shirt", "Hoodie"];
  const categoryNames = Object.keys(grouped).sort((a, b) => {
    const ai = PRIORITY_ORDER.indexOf(a);
    const bi = PRIORITY_ORDER.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.localeCompare(b);
  });

  const groups = categoryNames.map(category => ({
    category,
    items: grouped[category].map(p => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.category,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      badge: p.badge,
      thumbnail: p.thumbnailKey ? getPublicUrl(p.thumbnailKey) : null,
    })),
  }));

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
          <ShopCategoryFilter groups={groups} />
        )}
      </section>
    </div>
  );
}