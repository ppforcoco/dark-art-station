import { db } from "@/lib/db";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import Pagination from "@/components/Pagination";
import Breadcrumbs from "@/components/Breadcrumbs";

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

  // Build base URL preserving current filters for pagination links
  const baseUrl = filter === "free"
    ? "/shop?filter=free"
    : category
      ? `/shop?category=${encodeURIComponent(category)}`
      : "/shop";

  return (
    <main style={{ backgroundColor: "#070710", minHeight: "100vh", paddingTop: "100px" }}>

      {/* ── Page Header ── */}
      <div style={{ padding: "60px 60px 24px", borderBottom: "1px solid #2a2535" }}>
        <Breadcrumbs items={[
          { label: "Home",        href: "/"     },
          { label: "Collections", href: "/shop" },
          ...(category ? [{ label: category }] : []),
          ...(filter === "free" ? [{ label: "Free Downloads" }] : []),
        ]} />
        <span className="section-eyebrow">The Grimoire</span>
          <h1 className="section-title" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
            {activeLabel}
            {page > 1 && <span style={{ fontSize: "1.5rem", color: "#4a445a" }}> — Page {page}</span>}
          </h1>
          <p style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic",
            fontSize: "1.05rem", color: "#8a8099", marginTop: "12px" }}>
            {total} {total === 1 ? "work" : "works"} found in the abyss
          </p>
        </div>

        {/* ── Filter Bar ── */}
        <div style={{ padding: "24px 60px", borderBottom: "1px solid #2a2535",
          display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <Link href="/shop" className="filter-pill" data-active={!category && !filter}>All</Link>
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

        {/* ── Grid ── */}
        <div style={{ padding: "60px 60px 0" }}>
          {collections.length > 0 ? (
            <div className="product-grid">
              {collections.map((p) => (
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
                />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "120px 0" }}>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem",
                color: "#2a2535", marginBottom: "16px" }}>
                Nothing stirs in this corner of the void.
              </p>
              <Link href="/shop" className="section-link">Clear filters →</Link>
            </div>
          )}
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <Pagination currentPage={page} totalPages={totalPages} baseUrl={baseUrl} />
        )}

      </main>

      {/* Filter pill styles */}
      <style>{`
        .filter-pill {
          font-family: var(--font-space), monospace;
          font-size: 0.65rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #8a8099;
          text-decoration: none;
          border: 1px solid #2a2535;
          padding: 8px 16px;
          transition: color 0.2s, border-color 0.2s, background 0.2s;
        }
        .filter-pill:hover,
        .filter-pill[data-active="true"] {
          color: #f0ecff;
          border-color: #c0001a;
          background: rgba(192, 0, 26, 0.1);
        }
        @media (max-width: 767px) {
          .filter-pill { padding: 6px 12px; }
        }
      `}</style>

    </main>
  );
}