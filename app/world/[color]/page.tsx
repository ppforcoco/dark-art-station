// app/world/[color]/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// COLOR WORLD PAGE
//
// Fixes applied:
//   1. Tags: ONLY exact color-name tags — no broad words that bleed across worlds
//   2. No PC — query filters out PC, filter bar has no PC option
//   3. Images load properly — priority on first 8, lazy after, correct sizes
//   4. Cards never cut — 9:16 portrait only (no PC cards, no landscape)
//   5. Title fallback — if few tag results, also match title containing the color word only
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import Pagination from "@/components/Pagination";
import WorldTheme from "@/components/WorldTheme";

export const dynamic = "force-dynamic";
export const revalidate = 300;

// ── World definitions ─────────────────────────────────────────────────────────
// tags:       ONLY the exact tags you actually put in the DB for this color.
//             No synonyms, no broad words. If a wallpaper doesn't have one of
//             these exact tags it will NOT show here.
// titleWords: Single words to match in the title as a fallback.
//             Keep this SHORT — only the actual color name(s).
const WORLDS = {
  purple: {
    label:      "Void",
    dot:        "#7c3aed",
    accent:     "#a855f7",
    accentDim:  "#6d28d9",
    bg:         "#0a0614",
    bgDeep:     "#06030d",
    border:     "rgba(147,51,234,0.3)",
    borderHi:   "rgba(168,85,247,0.7)",
    glow:       "rgba(124,58,237,0.35)",
    text:       "#e9d5ff",
    textMuted:  "#c4b5fd",
    // Purple exact tags — these are what you tag in admin
    tags:       ["purple", "violet", "lavender", "indigo", "dark purple", "neon purple", "amethyst"],
    titleWords: ["purple", "violet"],
    desc:       "Where reality dissolves into violet mist.",
    eyebrow:    "ENTER THE VOID",
  },
  red: {
    label:      "Crimson",
    dot:        "#e0001f",
    accent:     "#ff1a33",
    accentDim:  "#8b0000",
    bg:         "#0d0000",
    bgDeep:     "#080000",
    border:     "rgba(192,0,26,0.3)",
    borderHi:   "rgba(255,26,51,0.7)",
    glow:       "rgba(192,0,26,0.35)",
    text:       "#ffe0e0",
    textMuted:  "#ffb3b3",
    tags:       ["red", "crimson", "scarlet", "dark red"],
    titleWords: ["red", "crimson", "scarlet"],
    desc:       "Blood and fire. The darkest reds the dark has to offer.",
    eyebrow:    "BLEED INTO CRIMSON",
  },
  green: {
    label:      "Haunted",
    dot:        "#16a34a",
    accent:     "#22c55e",
    accentDim:  "#14532d",
    bg:         "#030a04",
    bgDeep:     "#010502",
    border:     "rgba(34,197,94,0.25)",
    borderHi:   "rgba(34,197,94,0.6)",
    glow:       "rgba(22,163,74,0.3)",
    text:       "#dcfce7",
    textMuted:  "#86efac",
    // ONLY green-specific tags — removed broad words like "haunted", "forest", "nature"
    // that match wallpapers meant for other worlds
    tags:       ["green", "emerald", "dark green", "neon green"],
    titleWords: ["green", "emerald"],
    desc:       "Something stirs in the green. A world of shadow and overgrowth.",
    eyebrow:    "INTO THE DARK FOREST",
  },
  blue: {
    label:      "Deep",
    dot:        "#1d4ed8",
    accent:     "#3b82f6",
    accentDim:  "#1e3a8a",
    bg:         "#030614",
    bgDeep:     "#010209",
    border:     "rgba(59,130,246,0.25)",
    borderHi:   "rgba(59,130,246,0.6)",
    glow:       "rgba(29,78,216,0.3)",
    text:       "#dbeafe",
    textMuted:  "#93c5fd",
    // ONLY blue-specific tags — removed "deep", "midnight", "electric", "cyber"
    // which match non-blue wallpapers
    tags:       ["blue", "dark blue", "neon blue", "ice blue"],
    titleWords: ["blue"],
    desc:       "From the deepest cold. Electric, frozen, vast.",
    eyebrow:    "DESCEND INTO THE DEEP",
  },
  black: {
    label:      "Shadow",
    dot:        "#050505",
    accent:     "#ffffff",
    accentDim:  "#888888",
    bg:         "#000000",
    bgDeep:     "#000000",
    border:     "rgba(255,255,255,0.1)",
    borderHi:   "rgba(255,255,255,0.35)",
    glow:       "rgba(100,100,100,0.2)",
    text:       "#f0f0f0",
    textMuted:  "#aaaaaa",
    tags:       ["black", "obsidian", "pitch black", "amoled", "monochrome"],
    titleWords: ["black", "obsidian"],
    desc:       "Pure void. The absence of everything. AMOLED-perfect.",
    eyebrow:    "EMBRACE THE SHADOW",
  },
} as const;

type WorldKey = keyof typeof WORLDS;

const PAGE_SIZE = 24;

// ── Metadata ──────────────────────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: Promise<{ color: string }> }
): Promise<Metadata> {
  const { color } = await params;
  const world = WORLDS[color as WorldKey];
  if (!world) return { title: "Not Found" };

  return {
    title: `${world.label} World — Dark Wallpapers | Haunted Wallpapers`,
    description: world.desc + " Free dark wallpapers for iPhone and Android.",
    openGraph: {
      title: `${world.label} World | Haunted Wallpapers`,
      description: world.desc,
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function WorldPage({
  params,
  searchParams,
}: {
  params: Promise<{ color: string }>;
  searchParams: Promise<{ page?: string; device?: string }>;
}) {
  const { color } = await params;
  const { page: rawPage, device: rawDevice } = await searchParams;

  const world = WORLDS[color as WorldKey];
  if (!world) notFound();

  const page   = Math.max(1, parseInt(rawPage ?? "1", 10) || 1);
  const device = rawDevice === "android" ? "android" : rawDevice === "iphone" ? "iphone" : "";
  const skip   = (page - 1) * PAGE_SIZE;

  // ── Device filter — NO PC on world pages ──────────────────────────────────
  const deviceFilter =
    device === "iphone"  ? { deviceType: "IPHONE"  as const } :
    device === "android" ? { deviceType: "ANDROID" as const } :
    // Default: iPhone + Android only, exclude PC
    { deviceType: { in: ["IPHONE", "ANDROID"] as const } };

  // ── Tag matching — use `has` (exact per tag) not `hasSome` (any in array) ──
  // Each tag becomes its own OR condition so Prisma does:
  //   WHERE tags @> ARRAY['green'] OR tags @> ARRAY['emerald'] OR title ILIKE '%green%'
  // NOT: WHERE tags && ARRAY['green','emerald','haunted','forest'...]
  const tagConditions = (world.tags as unknown as string[]).map((t) => ({
    tags: { has: t },
  }));

  const titleConditions = world.titleWords.map((w) => ({
    title: { contains: w, mode: "insensitive" as const },
  }));

  const where = {
    isAdult: false,
    ...deviceFilter,
    OR: [
      ...tagConditions,
      ...titleConditions,
    ],
  };

  const [images, total] = await Promise.all([
    db.image.findMany({
      where,
      orderBy: [{ viewCount: "desc" }, { createdAt: "desc" }],
      skip,
      take: PAGE_SIZE,
      select: {
        id:         true,
        slug:       true,
        title:      true,
        r2Key:      true,
        deviceType: true,
        tags:       true,
      },
    }),
    db.image.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const baseUrl    = `/world/${color}${device ? `?device=${device}` : ""}`;

  const accent    = world.accent;
  const bg        = world.bg;
  const bgDeep    = world.bgDeep;
  const border    = world.border;
  const borderHi  = world.borderHi;
  const glow      = world.glow;
  const text      = world.text;
  const textMuted = world.textMuted;

  return (
    <>
      <WorldTheme color={color} />

      <style>{`
        /* ── Kill all animations on this page ── */
        .world-page * {
          animation: none !important;
          box-shadow: none !important;
          text-shadow: none !important;
        }
        .world-page a, .world-page button {
          transition: color 0.15s, border-color 0.15s, background 0.15s, opacity 0.15s !important;
        }

        .world-page {
          background: ${bgDeep};
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* ── Hero ── */
        .world-hero {
          background: ${bg};
          border-bottom: 1px solid ${border};
          padding: 60px 24px 44px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .world-hero__line {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, ${accent}, transparent);
        }
        .world-eyebrow {
          font-family: 'Courier New', monospace;
          font-size: 0.6rem;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: ${accent};
          margin-bottom: 14px;
          display: block;
        }
        .world-title {
          font-family: var(--font-cinzel, serif);
          font-size: clamp(2rem, 5vw, 3.6rem);
          font-weight: 900;
          color: ${text};
          line-height: 1.1;
          margin: 0 0 14px;
        }
        .world-desc {
          font-family: var(--font-cormorant, Georgia, serif);
          font-size: 1.05rem;
          font-style: italic;
          color: ${textMuted};
          max-width: 480px;
          margin: 0 auto 28px;
          line-height: 1.65;
        }
        .world-stats {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          border: 1px solid ${border};
          width: fit-content;
          margin: 0 auto;
        }
        .world-stat {
          padding: 10px 20px;
          border-right: 1px solid ${border};
          font-family: 'Courier New', monospace;
          font-size: 0.54rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: ${textMuted};
          text-align: center;
        }
        .world-stat:last-child { border-right: none; }
        .world-stat strong {
          display: block;
          font-family: var(--font-cinzel, serif);
          font-size: 0.95rem;
          color: ${accent};
          margin-bottom: 2px;
          font-weight: 700;
        }
        .world-back {
          position: absolute;
          top: 18px;
          left: 20px;
          font-family: 'Courier New', monospace;
          font-size: 0.58rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: ${textMuted};
          text-decoration: none;
        }
        .world-back:hover { color: ${accent}; }

        /* ── Filter bar — iPhone / Android only ── */
        .world-filter-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px 24px;
          border-bottom: 1px solid ${border};
          background: ${bg};
          flex-wrap: wrap;
          overflow-x: hidden;
        }
        .world-filter-label {
          font-family: 'Courier New', monospace;
          font-size: 0.54rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: ${textMuted};
        }
        .world-filter-pill {
          font-family: 'Courier New', monospace;
          font-size: 0.6rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: ${textMuted};
          border: 1px solid ${border};
          padding: 7px 16px;
          min-height: 34px;
          display: inline-flex;
          align-items: center;
          text-decoration: none;
          background: transparent;
          white-space: nowrap;
        }
        .world-filter-pill:hover {
          color: ${text};
          border-color: ${borderHi};
        }
        .world-filter-pill.active {
          color: ${text};
          border-color: ${accent};
          background: ${glow.replace("0.35", "0.12")};
        }

        /* ── Grid ── */
        .world-grid-wrap {
          padding: 24px;
          background: ${bgDeep};
        }
        @media (max-width: 600px) {
          .world-grid-wrap { padding: 12px; }
          .world-filter-bar { padding: 12px; }
          .world-hero { padding: 52px 16px 32px; }
          .world-stats { flex-wrap: wrap; }
        }

        .world-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        @media (max-width: 1279px) { .world-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 767px)  { .world-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; } }
        @media (max-width: 400px)  { .world-grid { grid-template-columns: repeat(2, 1fr); gap: 6px; } }

        /* ── Card — always 9:16, no landscape, no PC ── */
        .world-card {
          display: block;
          text-decoration: none;
          position: relative;
          overflow: hidden;
          border: 1px solid ${border};
          background: #080808;
          width: 100%;
        }
        .world-card:hover { border-color: ${borderHi}; }

        /* Portrait-only: 9:16 */
        .world-card-img {
          position: relative;
          width: 100%;
          aspect-ratio: 9 / 16;
          overflow: hidden;
          background: #0a0a0a;
        }

        /* Caption: always visible on touch, hover on pointer */
        .world-card-cap {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.9) 35%);
          padding: 28px 10px 10px;
        }
        @media (hover: hover) {
          .world-card-cap { opacity: 0; }
          .world-card:hover .world-card-cap { opacity: 1; }
        }
        .world-card-title {
          font-family: var(--font-cormorant, Georgia, serif);
          font-size: 0.85rem;
          font-style: italic;
          color: #f0f0f0;
          line-height: 1.3;
          display: block;
        }
        .world-card-device {
          font-family: 'Courier New', monospace;
          font-size: 0.48rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: ${accent};
          margin-top: 2px;
          display: block;
        }

        /* ── Empty state ── */
        .world-empty {
          padding: 80px 24px;
          text-align: center;
        }
        .world-empty-title {
          font-family: var(--font-cinzel, serif);
          font-size: 1.3rem;
          color: ${text};
          margin-bottom: 10px;
        }
        .world-empty-sub {
          font-family: var(--font-cormorant, serif);
          font-style: italic;
          color: ${textMuted};
          font-size: 1rem;
        }

        /* ── Other worlds nav ── */
        .world-nav {
          padding: 40px 24px;
          border-top: 1px solid ${border};
          background: ${bg};
          text-align: center;
        }
        .world-nav-label {
          font-family: 'Courier New', monospace;
          font-size: 0.56rem;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: ${textMuted};
          margin-bottom: 18px;
          display: block;
        }
        .world-nav-dots {
          display: flex;
          gap: 20px;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
        }
        .world-nav-dot {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          text-decoration: none;
        }
        .world-nav-dot:hover { opacity: 0.75; }
        .world-nav-dot-circle {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.12);
        }
        .world-nav-dot-label {
          font-family: 'Courier New', monospace;
          font-size: 0.5rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
        }
        .world-nav-dot--active .world-nav-dot-circle {
          border-color: ${accent};
        }
        .world-nav-dot--active .world-nav-dot-label { color: ${accent}; }
      `}</style>

      <div className="world-page">

        {/* ── Hero ── */}
        <section className="world-hero">
          <span className="world-hero__line" aria-hidden="true" />
          <Link href="/" className="world-back">← Back</Link>
          <span className="world-eyebrow">{world.eyebrow}</span>
          <h1 className="world-title">{world.label} World</h1>
          <p className="world-desc">{world.desc}</p>
          <div className="world-stats">
            <div className="world-stat">
              <strong>{total}</strong>
              Wallpapers
            </div>
            <div className="world-stat">
              <strong>Free</strong>
              Always
            </div>
            <div className="world-stat">
              <strong>4K</strong>
              Ready
            </div>
          </div>
        </section>

        {/* ── Device filter — iPhone & Android only, no PC ── */}
        <nav className="world-filter-bar" aria-label="Filter by device">
          <span className="world-filter-label">Filter:</span>
          {[
            { label: "All",     value: "" },
            { label: "iPhone",  value: "iphone" },
            { label: "Android", value: "android" },
          ].map(({ label, value }) => (
            <Link
              key={value}
              href={value ? `/world/${color}?device=${value}` : `/world/${color}`}
              className={`world-filter-pill${device === value ? " active" : ""}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* ── Grid ── */}
        <div className="world-grid-wrap">
          {images.length === 0 ? (
            <div className="world-empty">
              <p className="world-empty-title">No wallpapers found in this world yet.</p>
              <p className="world-empty-sub">
                Try a different filter — or tag wallpapers with &ldquo;{world.tags[0]}&rdquo; in admin.
              </p>
            </div>
          ) : (
            <div className="world-grid">
              {images.map((img, idx) => {
                // Only iPhone and Android — no PC, no landscape
                const dp =
                  img.deviceType === "IPHONE"  ? "iphone" :
                  img.deviceType === "ANDROID" ? "android" : null;

                // Skip any PC that slipped through (shouldn't happen with deviceFilter above)
                if (!dp) return null;

                const href = `/${dp}/${img.slug}`;
                const url  = getPublicUrl(img.r2Key);

                return (
                  <Link key={img.id} href={href} className="world-card" prefetch={false}>
                    {/* Always 9:16 — phone only */}
                    <div className="world-card-img">
                      <Image
                        src={url}
                        alt={img.title}
                        fill
                        // First 8 cards load eagerly — they're above the fold
                        loading={idx < 8 ? "eager" : "lazy"}
                        priority={idx < 4}
                        sizes="(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25vw"
                        style={{ objectFit: "cover" }}
                        unoptimized
                      />
                    </div>
                    <div className="world-card-cap">
                      <span className="world-card-title">{img.title}</span>
                      <span className="world-card-device">{dp}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div style={{ marginTop: "40px" }}>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                baseUrl={baseUrl}
              />
            </div>
          )}
        </div>

        {/* ── Other worlds nav ── */}
        <nav className="world-nav">
          <span className="world-nav-label">Other Worlds</span>
          <div className="world-nav-dots">
            {(Object.entries(WORLDS) as [WorldKey, typeof WORLDS[WorldKey]][]).map(([key, w]) => (
              <Link
                key={key}
                href={`/world/${key}`}
                className={`world-nav-dot${key === color ? " world-nav-dot--active" : ""}`}
                title={w.label}
                prefetch={false}
              >
                <span
                  className="world-nav-dot-circle"
                  style={{ background: w.dot }}
                />
                <span className="world-nav-dot-label">{w.label}</span>
              </Link>
            ))}
          </div>
        </nav>

      </div>
    </>
  );
}

export function generateStaticParams() {
  return Object.keys(WORLDS).map((color) => ({ color }));
}