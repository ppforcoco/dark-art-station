import { db } from "@/lib/db";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export const revalidate = 60;

interface ShopPageProps {
  searchParams: { category?: string; filter?: string };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { category, filter } = searchParams;

  // Build dynamic where clause
  const where = {
    ...(category ? { category: { contains: category, mode: "insensitive" as const } } : {}),
    ...(filter === "free" ? { isFree: true } : {}),
  };

  const [collections, allCategories] = await Promise.all([
    db.collection.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, title: true, category: true,
        price: true, isFree: true, badge: true,
        icon: true, bgClass: true, description: true,
      },
    }),
    // Get distinct categories for the filter bar
    db.collection.findMany({
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    }),
  ]);

  const activeLabel = filter === "free" ? "Free Downloads" : category ?? "All Collections";

  return (
    <>
      <Header />

      <main style={{ backgroundColor: "#070710", minHeight: "100vh", paddingTop: "100px" }}>

        {/* ── Page Header ─────────────────────────────── */}
        <div style={{ padding: "60px 60px 40px", borderBottom: "1px solid #2a2535" }}>
          <span className="section-eyebrow">The Grimoire</span>
          <h1 className="section-title" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
            {activeLabel}
          </h1>
          <p style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic",
            fontSize: "1.05rem", color: "#8a8099", marginTop: "12px" }}>
            {collections.length} {collections.length === 1 ? "work" : "works"} found in the abyss
          </p>
        </div>

        {/* ── Filter Bar ──────────────────────────────── */}
        <div style={{ padding: "24px 60px", borderBottom: "1px solid #2a2535",
          display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>

          <Link href="/shop" className="filter-pill" data-active={!category && !filter}>
            All
          </Link>
          <Link href="/shop?filter=free" className="filter-pill" data-active={filter === "free"}>
            Free
          </Link>
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

        {/* ── Grid ────────────────────────────────────── */}
        <div style={{ padding: "60px" }}>
          {collections.length > 0 ? (
            <div className="product-grid">
              {collections.map((p) => (
                <div key={p.id} className="product-card">
                  <div className="product-thumb-wrap">
                    <div className={`product-thumb-inner ${p.bgClass}`}>{p.icon}</div>
                    {p.badge && (
                      <span className={`product-badge badge-${p.badge.toLowerCase()}`}>
                        {p.badge}
                      </span>
                    )}
                    <div className="product-quick-view">Quick View</div>
                  </div>
                  <div className="product-info">
                    <span className="product-category">{p.category}</span>
                    <div className="product-name">{p.title}</div>
                    {p.description && (
                      <p style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic",
                        fontSize: "0.9rem", color: "#4a445a", marginBottom: "14px",
                        lineHeight: "1.5" }}>
                        {p.description}
                      </p>
                    )}
                    <div className="product-price">
                      <span className={`price-amount${p.isFree ? " price-free" : ""}`}>
                        {p.isFree ? "Free" : `$${p.price.toFixed(2)}`}
                      </span>
                      <a
                        href={`/api/download/${p.id}`}
                        className="add-btn"
                        title={p.isFree ? "Download Free" : "Add to Cart"}
                      >
                        {p.isFree ? "↓" : "+"}
                      </a>
                    </div>
                  </div>
                </div>
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
      </main>

      {/* Filter pill styles — scoped inline to avoid globals bloat */}
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

      <Footer />
    </>
  );
}