// app/page.tsx
import type { Metadata } from "next";
import { db, getWallpaperOfTheDay } from "@/lib/db";
import MarqueeTicker from "@/components/MarqueeTicker";
import Image from "next/image";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";
const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

export const metadata: Metadata = {
  title: "Haunted Wallpapers | Free Dark Fantasy Wallpapers for iPhone, Android & PC",
  description: "Free dark fantasy wallpapers for iPhone, Android and PC. Download high-resolution AI art — horror, gothic, street style, dark humor and more. No account required.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "Haunted Wallpapers | Free Dark Fantasy Wallpapers",
    description: "Free dark fantasy wallpapers for iPhone, Android and PC. Download high-resolution AI art collections instantly.",
    url: SITE_URL,
    siteName: "Haunted Wallpapers",
    type: "website",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Haunted Wallpapers — Dark Fantasy Art" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Haunted Wallpapers | Free Dark Fantasy Wallpapers",
    description: "Free dark fantasy wallpapers for iPhone, Android and PC. Download high-resolution AI art collections instantly.",
    images: [OG_IMAGE],
  },
  alternates: { canonical: SITE_URL },
};
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import AdSlot from "@/components/AdSlot";
import { getPublicUrl } from "@/lib/r2";
import HeroMosaic from "@/components/HeroMosaic";
import RecentlyViewed from "@/components/RecentlyViewed";

// ISR — revalidate every 60s so edits in Prisma Studio go live quickly
export const revalidate = 60;

const VALID_BADGES = ["New", "Hot", "Free"] as const;
type Badge = (typeof VALID_BADGES)[number];
function parseBadge(b: string | null | undefined): Badge | undefined {
  return VALID_BADGES.includes(b as Badge) ? (b as Badge) : undefined;
}

export default async function Home() {
  // Wallpaper of the Day — deterministic daily rotation
  const wotd = await getWallpaperOfTheDay();

  // Fetch exactly the 6 category collections we display, by slug
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

  // 8 latest products
  const products = await db.collection.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    select: {
      id: true, slug: true, title: true, category: true,
      price: true, isFree: true, badge: true,
      icon: true, bgClass: true, thumbnail: true,
      _count: { select: { downloads: true } },
    },
  });

  return (
    <>

      {/* ════════════════════════════ HERO */}
      <section className="hero-section">
        <div className="hero-left">
          <div className="hero-eyebrow fade-up-1">
            <span className="eyebrow-line" />
            Dark Art Collection
          </div>
          <h1 className="hero-title fade-up-2">
            Art Born<br />From <span className="t-red">The</span><br />
            <span className="t-gold">Abyss</span>
          </h1>
          <p className="hero-subtitle fade-up-3">
            Premium dark fantasy wallpapers for your phone and desktop.
            Bold, original art — free to download.
          </p>
          <div className="hero-ctas fade-up-4">
            <Link href="/shop" className="btn-primary"><span>Browse All Wallpapers</span></Link>
          </div>
          <div className="hero-stats fade-up-5">
            <div><span className="stat-num">500+</span><span className="stat-label">Dark Artworks</span></div>
            <div><span className="stat-num">Free</span><span className="stat-label">Always Free</span></div>
            <div><span className="stat-num">4K</span><span className="stat-label">Resolution Art</span></div>
          </div>
        </div>

        <div className="hero-right">
          <HeroMosaic />
        </div>
      </section>

      {/* ════════════════════════════ MARQUEE */}
      <MarqueeTicker />

      {/* ════════════════════════════ AD SLOT — after marquee */}
      <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN} width={728} height={90} />

      {/* ════════════════════════════ DAILY PICK */}
      {wotd && (() => {
        const devicePath = wotd.deviceType === "IPHONE"
          ? "iphone"
          : wotd.deviceType === "ANDROID"
          ? "android"
          : "pc";
        const wotdUrl  = getPublicUrl(wotd.r2Key);
        const wotdHref = `/${devicePath}/${wotd.slug}`;
        const todayStr = new Date().toLocaleDateString("en-US", {
          weekday: "long", month: "long", day: "numeric",
        });
        return (
          <section className="wotd-section">
            <div className="wotd-inner">
              {/* Left — text */}
              <div>
                <div className="wotd-label-block">
                  <span className="wotd-eyebrow">Daily Pick</span>
                  <span className="wotd-date">{todayStr}</span>
                </div>
                <h2 className="wotd-title">{wotd.title}</h2>
                {wotd.description && (
                  <p className="wotd-desc">{wotd.description}</p>
                )}
                {wotd.tags.length > 0 && (
                  <div className="wotd-tags">
                    {wotd.tags.slice(0, 5).map(t => (
                      <span key={t} className="wotd-tag">#{t}</span>
                    ))}
                  </div>
                )}
                <Link href={wotdHref} className="wotd-cta">
                  View Today&apos;s Wallpaper →
                </Link>
              </div>
              {/* Right — image */}
              <Link href={wotdHref} className="wotd-image-wrap" aria-label={wotd.title}>
                <Image
                  src={wotdUrl}
                  alt={wotd.title}
                  fill
                  priority
                  unoptimized
                  className="object-cover"
                  sizes="(max-width: 900px) 100vw, 50vw"
                />
                {wotd.deviceType && (
                  <span className="wotd-device-badge">
                    {wotd.deviceType.charAt(0) + wotd.deviceType.slice(1).toLowerCase()}
                  </span>
                )}
              </Link>
            </div>
          </section>
        );
      })()}

      {/* ════════════════════════════ CATEGORIES */}
      <section className="section-pad" style={{ backgroundColor: "var(--bg-primary)", scrollMarginTop: "80px" }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">Choose Your<br />Obsession</h2>
          </div>
          <Link href="/collections" className="section-link">View All Collections →</Link>
        </div>

        <div className="category-grid">
          {[
            { slug: "skeleton-card-collection",        icon: "🃏", title: "Tarot Cards",        tag: "Collection", bgClass: "p-bg-2" },
          { slug: "dark-humor-wallpaper-collection",  icon: "💀", title: "Dark Humor",         tag: "Collection", bgClass: "p-bg-1" },
            { slug: "dark-fantasy-art",                icon: "🐉", title: "Dark Fantasy",       tag: "Collection", bgClass: "p-bg-3" },
            { slug: "dark-minimal-horror",             icon: "🌑", title: "Dark Aesthetics",    tag: "Collection", bgClass: "p-bg-4" },
            { slug: "incognito-mode-collection",       icon: "🕵️", title: "Incognito Mode",    tag: "Collection", bgClass: "p-bg-5" },
            { slug: "dark-pattern-wallpaper",          icon: "🕸", title: "Patterns & Textures",tag: "Collection", bgClass: "p-bg-1" },
          ].map((cat) => {
            const dbCat = categories.find(c => c.slug === cat.slug);
            return (
              <Link
                key={cat.slug}
                href={`/shop/${cat.slug}`}
                className="cat-card"
              >
                {dbCat?.thumbnail ? (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${dbCat.thumbnail}`}
                    alt={cat.title}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(max-width: 479px) 100vw, (max-width: 767px) 50vw, (max-width: 1199px) 33vw, 200px"
                  />
                ) : (
                  <>
                    <div className={`cat-bg-layer ${cat.bgClass}`} />
                    <div className="cat-icon-el">{cat.icon}</div>
                  </>
                )}
                <div className="cat-overlay" />
                <div className="cat-content">
                  <span className="cat-tag">{cat.tag}</span>
                  <div className="cat-name">{cat.title}</div>
                  {dbCat && (
                    <div className="cat-count">{dbCat._count.downloads} downloads</div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ════════════════════════════ PRODUCTS */}
      <section className="section-pad products-bg">
        <div className="section-header">
          <div>
            <h2 className="section-title">Latest<br />Arrivals</h2>
          </div>
          <Link href="/shop" className="section-link">Browse All →</Link>
        </div>

        <div className="product-grid">
          {products.length > 0 ? products.map((p, idx) => (
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
          )) : (
            <p style={{ color:"#4a445a", fontFamily:"var(--font-space)", fontSize:"0.75rem",
              gridColumn:"1/-1", padding:"60px 0", textAlign:"center" }}>
              Loading collections…
            </p>
          )}
        </div>
      </section>

      {/* ════════════════════════════ AD SLOT — between products and manifesto */}
      <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} width={728} height={90} />

      {/* ════════════════════════════ MANIFESTO */}
      <section className="manifesto-section">
        <div className="manifesto-vert-label">Our Style</div>
        <div>
          <h2 className="manifesto-quote">
            Art that lives in the <span className="em">beautiful dark</span> — for
            those who see beauty where others see shadow.
          </h2>
          <p className="manifesto-text">
            We create for the unconventional. The ones who go their own way, who find
            beauty in the bold and the dark. Art that makes your screen feel like it
            belongs to you — not to everyone else. Every wallpaper is a statement,
            not just a background.
          </p>
        </div>
      </section>

      {/* ════════════════════════════ RECENTLY VIEWED */}
      <RecentlyViewed />

      {/* ── ItemList JSON-LD: featured collections for Google Visual Gallery ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Haunted Wallpapers — Featured Dark Art Collections",
            description: "Free dark fantasy wallpaper collections for iPhone, Android and PC.",
            url: process.env.NEXT_PUBLIC_SITE_URL,
            numberOfItems: categories.length,
            itemListElement: categories.map((cat, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${process.env.NEXT_PUBLIC_SITE_URL}/shop/${cat.slug}`,
              name: cat.title,
              image: cat.thumbnail
                ? `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${cat.thumbnail}`
                : undefined,
            })),
          }),
        }}
      />
    </>
  );
}