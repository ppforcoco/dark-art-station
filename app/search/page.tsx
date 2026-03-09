import type { Metadata } from "next";
import Link from "next/link";
import { searchWallpapers, type SearchResultItem } from "@/lib/db";

// ─── Metadata (dynamic for SEO) ───────────────────────────────────────────────

export async function generateMetadata(
  { searchParams }: { searchParams: Promise<{ q?: string }> }
): Promise<Metadata> {
  const { q: rawQ } = await searchParams;
  const q = rawQ?.trim() ?? "";
  return {
    title: q
      ? `"${q}" — Search Results | HauntedWallpapers`
      : "Search | HauntedWallpapers",
    description: q
      ? `Discover dark, occult wallpapers matching "${q}". Curated for iPhone, Android & PC.`
      : "Search the full HauntedWallpapers sanctum.",
  };
}

// ─── R2 → public URL helper ───────────────────────────────────────────────────

const CDN_BASE = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";

function r2Url(key: string) {
  return `${CDN_BASE}/${key}`;
}

// ─── AdSense ──────────────────────────────────────────────────────────────────
// Slot IDs are read directly from your established env variables.
// AdSense <script> must be loaded in app/layout.tsx <head>.

const ADSENSE_PID  = process.env.NEXT_PUBLIC_ADSENSE_PID          ?? "";
const SLOT_MAIN    = process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN    ?? ""; // top leaderboard
const SLOT_SIDEBAR = process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR ?? ""; // sticky sidebar
const SLOT_FOOTER  = process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER  ?? ""; // bottom leaderboard

function AdSlot({ slot, className = "" }: { slot: string; className?: string }) {
  if (!slot) return null; // silently skip if env var is missing
  return (
    <div className={`ad-slot-wrapper ${className}`} aria-label="Advertisement">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_PID}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

// ─── Result Card ──────────────────────────────────────────────────────────────

function ResultCard({ item }: { item: SearchResultItem }) {
  const href =
    item.kind === "collection"
      ? `/collections/${item.slug}`
      : `/wallpaper/${item.slug}`;

  const deviceLabel =
    item.kind === "standalone" && item.deviceType
      ? item.deviceType.charAt(0) + item.deviceType.slice(1).toLowerCase()
      : null;

  return (
    <Link href={href} className="search-card">
      <div className={`search-card-thumb ${item.bgClass ?? "p-bg-1"}`}>
        <img
          src={r2Url(item.thumbnail)}
          alt={item.title}
          className="search-card-img"
          loading="lazy"
          decoding="async"
        />
        {item.badge && (
          <span className={`product-badge badge-${item.badge.toLowerCase()}`}>
            {item.badge}
          </span>
        )}
        <div className="search-card-kind">
          {item.kind === "collection" ? item.tag ?? "Collection" : deviceLabel ?? "Standalone"}
        </div>
      </div>
      <div className="search-card-info">
        <p className="search-card-title">{item.title}</p>
        {item.kind === "standalone" && item.tags && item.tags.length > 0 && (
          <p className="search-card-tags">{item.tags.slice(0, 3).join(" · ")}</p>
        )}
        {item.kind === "collection" && item.category && (
          <p className="search-card-tags">{item.category}</p>
        )}
      </div>
    </Link>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

const TRENDING = [
  { label: "iPhone",      href: "/iphone"          },
  { label: "Android",     href: "/android"         },
  { label: "PC",          href: "/pc"              },
  { label: "Collections", href: "/collections"     },
  { label: "Free",        href: "/collections?filter=free" },
];

function EmptyState({ query }: { query: string }) {
  return (
    <div className="search-empty">
      <p className="search-empty-glyph">✦</p>
      <h2 className="search-empty-heading">
        No spirits answered for <em>&ldquo;{query}&rdquo;</em>
      </h2>
      <p className="search-empty-sub">
        Try a different incantation, or explore these sanctums:
      </p>
      <div className="search-empty-links">
        {TRENDING.map(({ label, href }) => (
          <Link key={label} href={href} className="search-empty-tag">
            {label}
          </Link>
        ))}
      </div>

      {/* Newsletter nudge */}
      <div className="search-empty-newsletter">
        <p className="search-empty-nl-label">JOIN THE DARK CONGREGATION</p>
        <p className="search-empty-nl-sub">
          Be first to receive new drops straight from the void.
        </p>
        <form
          className="newsletter-form search-nl-form"
          onSubmit={e => e.preventDefault()}
        >
          <input
            type="email"
            className="nl-input"
            placeholder="your@email.com"
            aria-label="Email address"
          />
          <button type="submit" className="nl-btn">Summon</button>
        </form>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SearchPage(
  { searchParams }: { searchParams: Promise<{ q?: string }> }
) {
  const { q: rawQ } = await searchParams;
  const query   = rawQ?.trim() ?? "";
  const results = query ? await searchWallpapers(query) : [];
  const hasResults = results.length > 0;

  return (
    <main className="search-page">

      {/* ── Top Ad Slot — SLOT_MAIN ── */}
      <div className="search-ad-top">
        <AdSlot slot={SLOT_MAIN} className="ad-leaderboard" />
      </div>

      {/* ── Page Header ── */}
      <header className="search-header">
        <p className="search-header-label">THE ORACLE&apos;S EYE</p>
        {query ? (
          <h1 className="search-header-title">
            Results for <em className="search-query-em">&ldquo;{query}&rdquo;</em>
          </h1>
        ) : (
          <h1 className="search-header-title">Search the Sanctum</h1>
        )}
        {hasResults && (
          <p className="search-header-count">
            {results.length} vision{results.length !== 1 ? "s" : ""} surfaced
          </p>
        )}
      </header>

      {/* ── Main Content + Sidebar ── */}
      <div className="search-body">

        {/* ── Results Grid ── */}
        <section className="search-results-col">
          {!query && (
            <p className="search-no-query">Enter a theme above to begin your search.</p>
          )}

          {query && !hasResults && <EmptyState query={query} />}

          {hasResults && (
            <div className="search-grid">
              {results.map((item) => (
                <ResultCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>

        {/* ── Sidebar Ad — SLOT_SIDEBAR ── */}
        <aside className="search-sidebar">
          <div className="search-sidebar-ad-sticky">
            <p className="search-sidebar-label">Sponsored</p>
            <AdSlot slot={SLOT_SIDEBAR} className="ad-sidebar-rect" />
          </div>
        </aside>

      </div>

      {/* ── Bottom Ad Slot — SLOT_FOOTER ── */}
      {(hasResults || query) && (
        <div className="search-ad-bottom">
          <AdSlot slot={SLOT_FOOTER} className="ad-leaderboard" />
        </div>
      )}

    </main>
  );
}