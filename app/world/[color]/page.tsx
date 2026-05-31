// app/world/[color]/page.tsx
// Dedicated color-world page — shows wallpapers filtered by color tag OR title
// with the full site theme tinted to that color

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
    tags:       ["purple", "violet", "lavender", "indigo", "dark purple", "neon purple", "mystic", "cosmic", "galaxy", "nebula", "magic", "ethereal", "amethyst", "ultraviolet"],
    titleWords: ["purple", "violet", "lavender", "indigo", "amethyst", "mystic", "cosmic", "galaxy", "nebula"],
    desc:       "Where reality dissolves into violet mist. Wallpapers that hum with cosmic energy.",
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
    tags:       ["red", "crimson", "blood", "fire", "scarlet", "ruby", "inferno", "rage", "dark red", "burning"],
    titleWords: ["red", "crimson", "scarlet", "ruby", "fire", "inferno", "burning", "blood"],
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
    tags:       ["green", "forest", "nature", "emerald", "poison", "toxic", "fungal", "mold", "swamp", "haunted", "zombie", "plague", "moss", "dark forest"],
    titleWords: ["green", "forest", "emerald", "nature", "swamp", "haunted", "moss", "toxic"],
    desc:       "Something lurks in the green. Overgrown, rotting, alive.",
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
    tags:       ["blue", "ocean", "deep", "ice", "frozen", "water", "storm", "thunder", "electric", "neon blue", "cyber", "midnight", "dark ocean"],
    titleWords: ["blue", "ocean", "deep", "ice", "frozen", "storm", "midnight", "electric", "cyber"],
    desc:       "Wallpapers born from the deepest cold. Electric, frozen, vast.",
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
    tags:       ["black", "shadow", "dark", "obsidian", "night", "eclipse", "monochrome", "noir", "coal", "onyx", "pitch black", "darkness"],
    titleWords: ["black", "shadow", "dark", "obsidian", "night", "eclipse", "monochrome", "noir"],
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
    description: world.desc + " Free dark wallpapers for iPhone, Android and PC.",
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
  const device = rawDevice ?? "";
  const skip   = (page - 1) * PAGE_SIZE;

  // Device type filter
  const deviceFilter =
    device === "iphone"  ? { deviceType: "IPHONE"  as const } :
    device === "android" ? { deviceType: "ANDROID" as const } :
    device === "pc"      ? { deviceType: "PC"      as const } :
    {};

  // Match by tags OR title containing any of the world's keywords
  const titleConditions = world.titleWords.map((w) => ({
    title: { contains: w, mode: "insensitive" as const },
  }));

  const where = {
    isAdult: false,
    ...deviceFilter,
    OR: [
      { tags: { hasSome: world.tags as unknown as string[] } },
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
  const accentDim = world.accentDim;
  const bg        = world.bg;
  const bgDeep    = world.bgDeep;
  const border    = world.border;
  const borderHi  = world.borderHi;
  const glow      = world.glow;
  const text      = world.text;
  const textMuted = world.textMuted;

  return (
    <>
      {/* ── Inline scoped theme ── */}
      <WorldTheme color={color} />

      <style>{`
        .world-page { background: ${bgDeep}; min-height: 100vh; }
        .world-hero {
          background:
            radial-gradient(ellipse 80% 50% at 50% 0%, ${glow.replace("0.35", "0.25")} 0%, transparent 65%),
            ${bg};
          border-bottom: 1px solid ${border};
          padding: 64px 40px 48px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .world-hero::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, ${accent}, transparent);
        }
        .world-eyebrow {
          font-family: var(--font-space, 'Courier New', monospace);
          font-size: 0.62rem;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: ${accent};
          margin-bottom: 16px;
          display: block;
        }
        .world-title {
          font-family: var(--font-cinzel, serif);
          font-size: clamp(2.2rem, 5vw, 4rem);
          font-weight: 900;
          color: ${text};
          line-height: 1.1;
          margin-bottom: 16px;
          text-shadow: 0 0 40px ${glow};
        }
        .world-desc {
          font-family: var(--font-cormorant, Georgia, serif);
          font-size: 1.1rem;
          font-style: italic;
          color: ${textMuted};
          max-width: 520px;
          margin: 0 auto 32px;
          line-height: 1.7;
        }
        .world-stats {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 24px;
          flex-wrap: wrap;
        }
        .world-stat {
          font-family: var(--font-space, 'Courier New', monospace);
          font-size: 0.62rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: ${textMuted};
        }
        .world-stat strong {
          color: ${accent};
          font-size: 1rem;
          font-family: var(--font-cinzel, serif);
          display: block;
          margin-bottom: 2px;
        }
        .world-back {
          position: absolute;
          top: 20px;
          left: 24px;
          font-family: var(--font-space, 'Courier New', monospace);
          font-size: 0.6rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: ${textMuted};
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: opacity 0.2s;
        }
        .world-back:hover { color: ${accent}; }

        /* ── Device filter bar ── */
        .world-filter-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 20px 40px;
          border-bottom: 1px solid ${border};
          background: ${bg};
          flex-wrap: wrap;
        }
        .world-filter-label {
          font-family: var(--font-space, 'Courier New', monospace);
          font-size: 0.56rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: ${textMuted};
          margin-right: 4px;
        }
        .world-filter-pill {
          font-family: var(--font-space, 'Courier New', monospace);
          font-size: 0.62rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: ${textMuted};
          border: 1px solid ${border};
          padding: 7px 16px;
          min-height: 36px;
          display: inline-flex;
          align-items: center;
          text-decoration: none;
          transition: color 0.2s, border-color 0.2s, background 0.2s;
          background: transparent;
        }
        .world-filter-pill:hover {
          color: ${text};
          border-color: ${borderHi};
          background: ${glow.replace("0.35", "0.08")};
        }
        .world-filter-pill.active {
          color: ${text};
          border-color: ${accent};
          background: ${glow.replace("0.35", "0.15")};
          box-shadow: 0 0 12px ${glow.replace("0.35", "0.2")};
        }

        /* ── Grid ── */
        .world-grid-wrap {
          padding: 40px;
          background: ${bgDeep};
        }
        @media (max-width: 767px) {
          .world-grid-wrap { padding: 16px; }
          .world-filter-bar { padding: 14px 16px; gap: 8px; }
          .world-hero { padding: 56px 20px 36px; }
        }
        .world-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        @media (max-width: 1279px) { .world-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 767px)  { .world-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; } }

        /* ── Card ── */
        .world-card {
          display: block;
          text-decoration: none;
          position: relative;
          overflow: hidden;
          border: 1px solid ${border};
          background: #0a0a0a;
          transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
        }
        .world-card:hover {
          border-color: ${borderHi};
          transform: translateY(-4px);
          box-shadow: 0 12px 40px ${glow.replace("0.35", "0.3")}, 0 0 0 1px ${accent}33;
        }
        .world-card-img {
          position: relative;
          width: 100%;
          aspect-ratio: 9 / 16;
        }
        .world-card-img--landscape { aspect-ratio: 16 / 9; }
        .world-card-cap {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.92) 40%);
          padding: 32px 12px 12px;
          opacity: 0;
          transition: opacity 0.25s;
        }
        .world-card:hover .world-card-cap { opacity: 1; }
        /* Always show caption on touch screens */
        @media (hover: none) { .world-card-cap { opacity: 1; padding: 20px 10px 10px; } }
        .world-card-title {
          font-family: var(--font-cormorant, Georgia, serif);
          font-size: 0.9rem;
          font-style: italic;
          color: #f0f0f0;
          line-height: 1.3;
          display: block;
        }
        .world-card-device {
          font-family: var(--font-space, 'Courier New', monospace);
          font-size: 0.5rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: ${accent};
          margin-top: 3px;
          display: block;
        }
        .world-card::after {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 50% 100%, ${glow.replace("0.35","0.12")} 0%, transparent 65%);
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
        }
        .world-card:hover::after { opacity: 1; }

        /* ── Other worlds nav ── */
        .world-nav {
          padding: 48px 40px;
          border-top: 1px solid ${border};
          background: ${bg};
          text-align: center;
        }
        @media (max-width: 767px) { .world-nav { padding: 32px 20px; } }
        .world-nav-label {
          font-family: var(--font-space, 'Courier New', monospace);
          font-size: 0.58rem;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: ${textMuted};
          margin-bottom: 20px;
          display: block;
        }
        .world-nav-dots {
          display: flex;
          gap: 16px;
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
          transition: transform 0.2s;
        }
        .world-nav-dot:hover { transform: scale(1.15); }
        .world-nav-dot-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.15);
        }
        .world-nav-dot-label {
          font-family: var(--font-space, 'Courier New', monospace);
          font-size: 0.52rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
        }
        .world-nav-dot--active .world-nav-dot-circle {
          border-color: ${accent};
          box-shadow: 0 0 12px ${glow};
        }
        .world-nav-dot--active .world-nav-dot-label { color: ${accent}; }

        /* ── Empty state ── */
        .world-empty {
          padding: 80px 40px;
          text-align: center;
        }
        .world-empty-glyph {
          font-size: 2rem;
          color: ${accent};
          opacity: 0.4;
          margin-bottom: 16px;
          display: block;
        }
        .world-empty-title {
          font-family: var(--font-cinzel, serif);
          font-size: 1.4rem;
          color: ${text};
          margin-bottom: 12px;
        }
        .world-empty-sub {
          font-family: var(--font-cormorant, serif);
          font-style: italic;
          color: ${textMuted};
          font-size: 1rem;
        }
      `}</style>

      <div className="world-page">

        {/* ── Hero ── */}
        <section className="world-hero">
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

        {/* ── Device filter bar ── */}
        <nav className="world-filter-bar" aria-label="Filter by device">
          <span className="world-filter-label">Filter:</span>
          {[
            { label: "All",     value: "" },
            { label: "iPhone",  value: "iphone" },
            { label: "Android", value: "android" },
            { label: "PC",      value: "pc" },
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
              <span className="world-empty-glyph">✦</span>
              <p className="world-empty-title">No wallpapers found in this world</p>
              <p className="world-empty-sub">Try a different device filter or explore another world.</p>
            </div>
          ) : (
            <div className="world-grid">
              {images.map((img) => {
                const devicePath =
                  img.deviceType === "IPHONE"  ? "iphone"  :
                  img.deviceType === "ANDROID" ? "android" :
                  img.deviceType === "PC"      ? "pc"      : null;
                const href = devicePath ? `/${devicePath}/${img.slug}` : `/shop/${img.slug}`;
                const isLandscape = img.deviceType === "PC";
                const url = getPublicUrl(img.r2Key);

                return (
                  <Link key={img.id} href={href} className="world-card">
                    <div className={`world-card-img${isLandscape ? " world-card-img--landscape" : ""}`}>
                      <Image
                        src={url}
                        alt={img.title}
                        fill
                        loading="lazy"
                        sizes="(max-width: 640px) 50vw, (max-width: 1279px) 33vw, 25vw"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div className="world-card-cap">
                      <span className="world-card-title">{img.title}</span>
                      {img.deviceType && (
                        <span className="world-card-device">
                          {img.deviceType.charAt(0) + img.deviceType.slice(1).toLowerCase()}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ marginTop: "48px" }}>
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