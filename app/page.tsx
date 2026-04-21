// app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { db, getWallpaperOfTheDay } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import MarqueeTicker from "@/components/MarqueeTicker";
import ProductCard from "@/components/ProductCard";
import AdSlot from "@/components/AdSlot";
import RecentlyViewed from "@/components/RecentlyViewed";
import HeroMosaic from "@/components/HeroMosaic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";
const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

export const metadata: Metadata = {
  title: "Haunted Wallpapers | Free Dark Fantasy Wallpapers for iPhone, Android & PC",
  description: "Free dark wallpapers — gothic, horror, fantasy. HD downloads for iPhone, Android and PC. No account required.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "Haunted Wallpapers | Free Dark Fantasy Wallpapers",
    description: "Gothic, horror and fantasy wallpapers. HD downloads. No sign-up.",
    url: SITE_URL, siteName: "Haunted Wallpapers", type: "website",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Haunted Wallpapers — Dark Fantasy Art" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Haunted Wallpapers | Free Dark Fantasy Wallpapers",
    description: "Gothic, horror and fantasy wallpapers. HD downloads. No sign-up.",
    images: [OG_IMAGE],
  },
  alternates: { canonical: SITE_URL },
};

export const revalidate = 60;

const VALID_BADGES = ["New", "Hot", "Free"] as const;
type Badge = (typeof VALID_BADGES)[number];
function parseBadge(b: string | null | undefined): Badge | undefined {
  return VALID_BADGES.includes(b as Badge) ? (b as Badge) : undefined;
}

export default async function Home() {
  const wotd = await getWallpaperOfTheDay();
  const totalImages = await db.image.count();

  function formatStatCount(n: number): string {
    if (n >= 1000) return `${Math.floor(n / 100) / 10}K+`;
    return `${Math.floor(n / 50) * 50}+`;
  }

  const CATEGORY_SLUGS = [
    "skeleton-card-collection",
    "dark-humor-wallpaper-collection",
    "dark-fantasy-art",
    "dark-minimal-horror",
    "incognito-mode-collection",
    "dark-pattern-wallpaper",
  ];
  const categories = await db.collection.findMany({
    where: { slug: { in: CATEGORY_SLUGS } },
    select: {
      id: true, slug: true, title: true, icon: true, bgClass: true,
      tag: true, featured: true, thumbnail: true,
      _count: { select: { downloads: true } },
    },
  });

  const products = await db.collection.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    where: { isAdult: false },
    select: {
      id: true, slug: true, title: true, category: true,
      price: true, isFree: true, badge: true,
      icon: true, bgClass: true, thumbnail: true,
      _count: { select: { downloads: true } },
    },
  });

  return (
    <>
      {/* ── HERO ── */}
      <section className="hw-hero">
        <div className="hw-hero__text">
          <h1 className="hw-hero__title">
            <span className="hw-hero__title-top">Haunted</span>
            <span className="hw-hero__title-mid">Wall<span className="hw-hero__title-accent">papers</span></span>
          </h1>
          <p className="hw-hero__tagline">Art that whispers long after you close the tab.</p>
          <p className="hw-hero__sub">
            You like the shadows. We like giving you art that lives there. Gothic, horror, fantasy — updated regularly. Every download is HD and free. No sign-up form. No &ldquo;verify your email.&rdquo; Just art.
          </p>
          <div className="hw-hero__stats">
            <div className="hw-hero__stat">
              <span className="hw-hero__stat-num">{formatStatCount(totalImages)}</span>
              <span className="hw-hero__stat-label">Artworks</span>
            </div>
            <div className="hw-hero__stat-divider" />
            <div className="hw-hero__stat">
              <span className="hw-hero__stat-num">Free</span>
              <span className="hw-hero__stat-label">Always</span>
            </div>
            <div className="hw-hero__stat-divider" />
            <div className="hw-hero__stat">
              <span className="hw-hero__stat-num">4K</span>
              <span className="hw-hero__stat-label">Resolution</span>
            </div>
          </div>
        </div>

        {/* Right: Mosaic — labelled so users know what they're clicking */}
        <div className="hw-hero__mosaic-wrap">
          <div className="hw-hero__mosaic-label">
            <span className="hw-hero__mosaic-label-text">Browse by theme</span>
            <span className="hw-hero__mosaic-label-hint">Click any card →</span>
          </div>
          <HeroMosaic />
        </div>
      </section>

      <MarqueeTicker />

      <div className="hw-ad-row">
        <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN} width={728} height={90} />
      </div>

      {/* ── DAILY PICK ── */}
      {wotd && (() => {
        const devicePath = wotd.deviceType === "IPHONE" ? "iphone" : wotd.deviceType === "ANDROID" ? "android" : "pc";
        const wotdUrl = getPublicUrl(wotd.r2Key);
        const wotdHref = `/${devicePath}/${wotd.slug}`;
        const todayStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
        return (
          <section className="hw-daily">
            <div className="hw-daily__inner">
              <div className="hw-daily__text">
                <p className="hw-daily__eyebrow"><span className="hw-daily__dot" />Daily Pick · {todayStr}</p>
                <h2 className="hw-daily__title">{wotd.title}</h2>
                {wotd.description && <p className="hw-daily__desc">{wotd.description}</p>}
                {wotd.tags.length > 0 && (
                  <div className="hw-daily__tags">
                    {wotd.tags.slice(0, 4).map(t => <span key={t} className="hw-daily__tag">#{t}</span>)}
                  </div>
                )}
                <Link href={wotdHref} className="hw-daily__cta">View Wallpaper →</Link>
              </div>
              <Link href={wotdHref} className="hw-daily__image-wrap" aria-label={wotd.title}>
                <Image src={wotdUrl} alt={wotd.title} fill priority unoptimized className="object-cover" sizes="380px" />
                {wotd.deviceType && <span className="hw-daily__badge">{wotd.deviceType.charAt(0) + wotd.deviceType.slice(1).toLowerCase()}</span>}
              </Link>
            </div>
          </section>
        );
      })()}

      {/* ── LATEST DROPS ── */}
      <section className="hw-latest">
        <div className="hw-section-header">
          <h2 className="hw-section-title">Choose Your Obsession</h2>
          <Link href="/shop" className="hw-section-link">Browse All →</Link>
        </div>
        <div className="product-grid">
          {products.length > 0 ? products.map((p, idx) => (
            <ProductCard key={p.id} slug={p.slug} name={p.title} category={p.category} price={p.price} isFree={p.isFree} badge={parseBadge(p.badge)} icon={p.icon} bgClass={p.bgClass} thumbnail={p.thumbnail ? `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${p.thumbnail}` : null} priority={idx < 4} downloadCount={p._count.downloads} />
          )) : (
            <p style={{ color: "#4a445a", fontFamily: "var(--font-space)", fontSize: "0.75rem", gridColumn: "1/-1", padding: "60px 0", textAlign: "center" }}>Loading…</p>
          )}
        </div>
      </section>

      <div className="hw-ad-row">
        <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} width={728} height={90} />
      </div>

      {/* ── CLOSING STATEMENT ── */}
      <section className="hw-statement">
        <blockquote className="hw-statement__quote">
          Some people want bright and simple.<br />
          <em className="hw-statement__em">You&rsquo;re not one of them.</em>
        </blockquote>
        <p className="hw-statement__body">
          You like the strange, the shadowed, the kind of art that feels like a half-remembered dream. We collect that here. Bold illustrations, creepy atmospheres, fantasy worlds you wish you could walk into.
        </p>
        <p className="hw-statement__body">
          Download everything in full HD. No account needed. No email required. Just art that gets you.
        </p>
        <Link href="/shop" className="hw-statement__cta">Browse the Collection →</Link>
      </section>

      <RecentlyViewed />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "ItemList",
        name: "Haunted Wallpapers — Featured Dark Art Collections",
        description: "Free dark wallpaper collections — gothic, horror, fantasy for iPhone, Android and PC.",
        url: SITE_URL, numberOfItems: categories.length,
        itemListElement: categories.map((cat, i) => ({
          "@type": "ListItem", position: i + 1,
          url: `${SITE_URL}/shop/${cat.slug}`, name: cat.title,
          image: cat.thumbnail ? `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${cat.thumbnail}` : undefined,
        })),
      }) }} />
    </>
  );
}