// app/shop/page.tsx
import type { Metadata } from "next";
import { db } from "@/lib/db";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import Pagination from "@/components/Pagination";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdSlot from "@/components/AdSlot";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";
const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

export const metadata: Metadata = {
  title: "All Collections | Haunted Wallpapers",
  description: "Browse all dark fantasy wallpaper collections. Free high-resolution downloads for iPhone, Android and PC. New art added regularly.",
  openGraph: {
    title: "All Collections — Haunted Wallpapers",
    description: "Browse all dark fantasy wallpaper collections. Free high-resolution downloads for iPhone, Android and PC.",
    siteName: "Haunted Wallpapers",
    type: "website",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Haunted Wallpapers" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "All Collections — Haunted Wallpapers",
    description: "Browse all dark fantasy wallpaper collections. Free high-resolution downloads for iPhone, Android and PC.",
    images: [OG_IMAGE],
  },
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

const VALID_BADGES = ["New", "Hot", "Free"] as const;
type Badge = (typeof VALID_BADGES)[number];
function parseBadge(b: string | null | undefined): Badge | undefined {
  return VALID_BADGES.includes(b as Badge) ? (b as Badge) : undefined;
}

interface ShopPageProps {
  searchParams: Promise<{ category?: string; filter?: string; page?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { category, filter, page: rawPage } = await searchParams;
  const page = Math.max(1, parseInt(rawPage ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const where = {
    ...(category ? { category: { contains: category, mode: "insensitive" as const } } : {}),
    ...(filter === "free" ? { isFree: true } : {}),
  };

  const [collections, total, allCategories] = await Promise.all([
    db.collection.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, slug: true, title: true, category: true,
        price: true, isFree: true, badge: true,
        icon: true, bgClass: true, description: true, thumbnail: true,
        _count: { select: { downloads: true } },
      },
      take: PAGE_SIZE,
      skip,
    }),
    db.collection.count({ where }),
    db.collection.findMany({
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    }),
  ]);

  const totalPages  = Math.ceil(total / PAGE_SIZE);
  const activeLabel = filter === "free" ? "Free Downloads" : category ?? "All Collections";

  const baseUrl = filter === "free"
    ? "/shop?filter=free"
    : category
      ? `/shop?category=${encodeURIComponent(category)}`
      : "/shop";

  return (
    <main className="shop-page" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>

      <Breadcrumbs items={[
        { label: "Home",        href: "/"     },
        { label: "Collections", href: "/shop" },
        ...(category ? [{ label: category }] : []),
        ...(filter === "free" ? [{ label: "Free Downloads" }] : []),
      ]} />

      <div className="shop-header">
        <h1 className="section-title shop-page-title">
          {activeLabel}
          {page > 1 && <span className="shop-page-num"> — Page {page}</span>}
        </h1>
        <p className="shop-page-count">
          {total} {total === 1 ? "work" : "works"} found
        </p>
      </div>

      <div className="shop-filter-bar">
        <Link href="/shop"             className="filter-pill" data-active={!category && !filter}>All</Link>
        <Link href="/shop?filter=free" className="filter-pill" data-active={filter === "free"}>Free</Link>
        {allCategories.map((c) => (
          <Link
            key={c.category}
            href={`/shop?category=${encodeURIComponent(c.category)}`}
            className="filter-pill"
            data-active={category === c.category}
          >
            {c.category}
          </Link>
        ))}
      </div>

      <div className="shop-grid-wrap">
        {collections.length > 0 ? (
          <div className="product-grid">
            {collections.flatMap((p, idx) => {
              const card = (
                <ProductCard
                  key={p.id}
                  slug={p.slug}
                  name={p.title}
                  category={p.category}
                  price={p.price}
                  isFree={p.isFree}
                  badge={parseBadge(p.badge)}
                  icon={p.icon}
                  bgClass={p.bgClass}
                  thumbnail={p.thumbnail ? `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${p.thumbnail}` : null}
                  priority={idx < 4}
                  downloadCount={p._count.downloads}
                />
              );
              if ((idx + 1) % 8 === 0) {
                return [card, (
                  <div key={`ad-${idx}`} style={{ gridColumn: "1 / -1" }}>
                    <AdSlot
                      slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_INFEED ?? process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN}
                      format="auto"
                      width={728}
                      height={90}
                    />
                  </div>
                )];
              }
              return [card];
            })}
          </div>
        ) : (
          <div className="shop-empty">
            <p className="shop-empty-msg">Nothing here yet.</p>
            <Link href="/shop" className="section-link">Clear filters →</Link>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} baseUrl={baseUrl} />
      )}

    </main>
  );
}