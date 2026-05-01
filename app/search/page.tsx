import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { searchWallpapers, type SearchResultItem } from "@/lib/db";
import Pagination from "@/components/Pagination";
import SearchPageClient from "@/components/SearchPageClient";

const PAGE_SIZE = 24;

export async function generateMetadata(
  { searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }
): Promise<Metadata> {
  const { q: rawQ, page: rawPage } = await searchParams;
  const q    = rawQ?.trim() ?? "";
  const page = Math.max(1, parseInt(rawPage ?? "1", 10) || 1);
  const pageLabel = page > 1 ? ` — Page ${page}` : "";
  return {
    title: q
      ? `"${q}" — Search Results${pageLabel} | HauntedWallpapers`
      : "Search | HauntedWallpapers",
    description: q
      ? `Discover dark fantasy wallpapers matching "${q}". Curated for iPhone, Android & PC.`
      : "Search the full HauntedWallpapers collection.",
    openGraph: {
      title: q ? `"${q}" — Search Results | Haunted Wallpapers` : "Search | Haunted Wallpapers",
      description: q ? `Discover dark fantasy wallpapers matching "${q}".` : "Search the full Haunted Wallpapers collection.",
      images: [{ url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com"}/og-image.jpg`, width: 1200, height: 630 }],
    },
  };
}

const CDN_BASE = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";
function r2Url(key: string) { return `${CDN_BASE}/${key}`; }

// ── Result Card ───────────────────────────────────────────────
function ResultCard({ item }: { item: SearchResultItem }) {
  const devicePath =
    item.deviceType === "IPHONE"  ? "iphone"  :
    item.deviceType === "ANDROID" ? "android" :
    item.deviceType === "PC"      ? "pc"       : null;

  const href =
    item.kind === "collection"
      ? `/shop/${item.slug}`
      : item.collectionSlug
        ? `/shop/${item.collectionSlug}/${item.slug}`
        : devicePath
          ? `/${devicePath}/${item.slug}`
          : `/shop/${item.slug}`;

  const deviceLabel =
    item.kind === "standalone" && item.deviceType
      ? item.deviceType.charAt(0) + item.deviceType.slice(1).toLowerCase()
      : null;

  return (
    <Link href={href} className="search-card">
      <div className={`search-card-thumb ${item.bgClass ?? "p-bg-1"}`} style={{ position: "relative" }}>
        <Image
          src={r2Url(item.thumbnail)}
          alt={item.title}
          fill
          loading="lazy"
          unoptimized
          style={{ objectFit: "cover" }}
          sizes="(max-width: 640px) 50vw, 200px"
        />
        {item.badge && (
          <span className={`product-badge badge-${item.badge.toLowerCase()}`}>
            {item.badge}
          </span>
        )}
        <div className="search-card-kind">
          {item.kind === "collection" ? (item.tag ?? "Collection") : (deviceLabel ?? "Standalone")}
        </div>
      </div>
      <div className="search-card-info">
        <p className="search-card-title">{item.title}</p>
        {item.kind === "standalone" && item.tags && item.tags.length > 0 && (
          <div className="search-card-tags-row">
            {item.tags.slice(0, 3).map(tag => (
              <span key={tag} className="search-card-tag-pill">#{tag}</span>
            ))}
          </div>
        )}
        {item.kind === "collection" && item.category && (
          <div className="search-card-tags-row">
            <span className="search-card-tag-pill">{item.category}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

// ── Empty State ───────────────────────────────────────────────
const TRENDING = [
  { label: "iPhone",      href: "/iphone"                  },
  { label: "Android",     href: "/android"                 },
  { label: "PC",          href: "/pc"                      },
  { label: "Collections", href: "/collections"             },
  { label: "Free",        href: "/collections?filter=free" },
];

function EmptyState({ query }: { query: string }) {
  return (
    <div className="search-empty">
      <p className="search-empty-glyph">✦</p>
      <h2 className="search-empty-heading">
        No answers found for <em>&ldquo;{query}&rdquo;</em>
      </h2>
      <p className="search-empty-sub">Try a different incantation, or explore:</p>
      <div className="search-empty-links">
        {TRENDING.map(({ label, href }) => (
          <Link key={label} href={href} className="search-empty-tag">
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Category filter chips ─────────────────────────────────────
const CATEGORY_FILTERS = [
  { label: "All",            value: ""           },
  { label: "📱 iPhone",      value: "iphone"     },
  { label: "🤖 Android",     value: "android"    },
  { label: "🖥 PC",          value: "pc"         },
  { label: "🗂 Collections", value: "collection" },
];

// ── Page ──────────────────────────────────────────────────────
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; kind?: string }>;
}) {
  const { q: rawQ, page: rawPage, kind: rawKind } = await searchParams;
  const query      = rawQ?.trim() ?? "";
  const page       = Math.max(1, parseInt(rawPage ?? "1", 10) || 1);
  const kindFilter = rawKind ?? "";

  const { items: allResults, total } = query
    ? await searchWallpapers(query, page, PAGE_SIZE)
    : { items: [], total: 0 };

  // Filter by device/collection kind
  const results = kindFilter
    ? allResults.filter((r) => {
        if (kindFilter === "collection") return r.kind === "collection";
        if (kindFilter === "iphone")     return r.kind === "standalone" && r.deviceType === "IPHONE";
        if (kindFilter === "android")    return r.kind === "standalone" && r.deviceType === "ANDROID";
        if (kindFilter === "pc")         return r.kind === "standalone" && r.deviceType === "PC";
        return true;
      })
    : allResults;

  const hasResults = results.length > 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const baseUrl    = query ? `/search?q=${encodeURIComponent(query)}` : "/search";

  return (
    <main className="search-page">

      {/* Top ad */}
      <div className="search-ad-top">
      </div>

      {/* Big live search bar */}
      <SearchPageClient initialQuery={query} />

      {/* Category filter chips — only when there's a query */}
      {query && (
        <div className="search-filter-bar">
          {CATEGORY_FILTERS.map(({ label, value }) => {
            const isActive = kindFilter === value;
            const href = value ? `${baseUrl}&kind=${value}` : baseUrl;
            return (
              <Link
                key={value}
                href={href}
                className={`search-filter-chip${isActive ? " active" : ""}`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      )}

      {/* Results header + X clear button */}
      <header className="search-header">
        <p className="search-header-label">THE Watch&apos;S Tower</p>
        {query ? (
          <div className="search-header-row">
            <h1 className="search-header-title">
              Results for{" "}
              <em className="search-query-em">&ldquo;{query}&rdquo;</em>
            </h1>
            <Link href="/search" className="search-clear-btn" aria-label="Clear search">
              ✕
            </Link>
          </div>
        ) : (
          <h1 className="search-header-title">Search Wallpapers</h1>
        )}
        {hasResults && (
          <p className="search-header-count">
            {results.length} vision{results.length !== 1 ? "s" : ""} surfaced
            {totalPages > 1 && ` — page ${page} of ${totalPages}`}
          </p>
        )}
      </header>

      {/* Main content */}
      <div className="search-body">
        <section className="search-results-col">
          {!query && (
            <p className="search-no-query">Type above to begin your search.</p>
          )}
          {query && !hasResults && <EmptyState query={query} />}
          {hasResults && (
            <div className="search-grid">
              {results.map((item, idx) => (
                <>
                  <ResultCard key={item.id} item={item} />
                  {idx === 5 && (
                    <div key="search-mid-ad" style={{ gridColumn: "1 / -1" }}>
                    </div>
                  )}
                </>
              ))}
            </div>
          )}
          {hasResults && totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              baseUrl={baseUrl}
            />
          )}
        </section>

        {/* Sidebar ad */}
        <aside className="search-sidebar">
          <div className="search-sidebar-ad-sticky">
            <p className="search-sidebar-label">Sponsored</p>
          </div>
        </aside>
      </div>

      {/* Bottom ad */}
      {(hasResults || query) && (
        <div className="search-ad-bottom">
        </div>
      )}

    </main>
  );
}