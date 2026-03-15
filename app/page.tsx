// app/page.tsx
import { db, getWallpaperOfTheDay } from "@/lib/db";
import MarqueeTicker from "@/components/MarqueeTicker";
import NewsletterForm from "@/components/NewsletterForm";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import AdSlot from "@/components/AdSlot";
import { getPublicUrl } from "@/lib/r2";
import HeroMosaic from "@/components/HeroMosaic";

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

  // Featured categories for the grid
  const categories = await db.collection.findMany({
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 5,
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
    },
  });

  return (
    <>

      {/* ════════════════════════════ HERO */}
      <section className="hero-section">
        <div className="hero-left">
          <div className="hero-eyebrow fade-up-1">
            <span className="eyebrow-line" />
            Dark Digital Sanctum
          </div>
          <h1 className="hero-title fade-up-2">
            Art Born<br />From <span className="t-red">The</span><br />
            <span className="t-gold">Abyss</span>
          </h1>
          <p className="hero-subtitle fade-up-3">
            Premium dark fantasy wallpapers, tarot art, and occult designs for those
            who dwell beyond the veil. Crafted for the damned and the divine alike.
          </p>
          <div className="hero-ctas fade-up-4">
            <Link href="/shop" className="btn-primary"><span>Enter the Grimoire</span></Link>
            <Link href="/shop?filter=free" className="btn-secondary">Free Downloads</Link>
          </div>
          <div className="hero-stats fade-up-5">
            <div><span className="stat-num">500+</span><span className="stat-label">Dark Artworks</span></div>
            <div><span className="stat-num">12K</span><span className="stat-label">Souls Collected</span></div>
            <div><span className="stat-num">Free</span><span className="stat-label">Shipping (Digital)</span></div>
          </div>
        </div>

        <div className="hero-right">
          <HeroMosaic />
        </div>
      </section>

      {/* ════════════════════════════ MARQUEE */}
      <MarqueeTicker />

      {/* ════════════════════════════ DAILY SANCTUM */}
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
                  <span className="wotd-eyebrow">Daily Sanctum</span>
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
      <section className="section-pad" style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="section-header">
          <div>
            <span className="section-eyebrow">Browse the Darkness</span>
            <h2 className="section-title">Choose Your<br />Obsession</h2>
          </div>
          <Link href="/shop" className="section-link">View All Collections →</Link>
        </div>

        <div className="category-grid">
          {categories.length > 0 ? categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop/${cat.slug}`}
              className={`cat-card${cat.featured ? " featured" : ""}`}
            >
              {cat.thumbnail ? (
                <Image
                  src={`${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${cat.thumbnail}`}
                  alt={cat.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 479px) 100vw, (max-width: 767px) 50vw, (max-width: 1024px) 33vw, 20vw"
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
                <div className="cat-count">{cat._count.downloads} downloads</div>
              </div>
            </Link>
          )) : (
            <p style={{ color:"#4a445a", fontFamily:"var(--font-space)", fontSize:"0.75rem",
              gridColumn:"1/-1", padding:"60px 0", textAlign:"center" }}>
              Collections loading from the abyss…
            </p>
          )}
        </div>
      </section>

      {/* ════════════════════════════ AD SLOT */}
      <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN} width={728} height={90} />

      {/* ════════════════════════════ PRODUCTS */}
      <section className="section-pad products-bg">
        <div className="section-header">
          <div>
            <span className="section-eyebrow">Freshly Summoned</span>
            <h2 className="section-title">Latest<br />Arrivals</h2>
          </div>
          <Link href="/shop" className="section-link">Browse All →</Link>
        </div>

        <div className="product-grid">
          {products.length > 0 ? products.map((p) => (
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
          )) : (
            <p style={{ color:"#4a445a", fontFamily:"var(--font-space)", fontSize:"0.75rem",
              gridColumn:"1/-1", padding:"60px 0", textAlign:"center" }}>
              Summoning artworks…
            </p>
          )}
        </div>
      </section>

      {/* ════════════════════════════ MANIFESTO */}
      <section className="manifesto-section">
        <div className="manifesto-vert-label">Our Creed</div>
        <div>
          <h2 className="manifesto-quote">
            Art that lives in the <span className="em">beautiful dark</span> — for
            those who see beauty where others see shadow.
          </h2>
          <p className="manifesto-text">
            We create for the unconventional. The ones who hang skulls where others
            hang flowers. Who find divinity in demons, humor in death, and power in
            the occult. Every wallpaper is a window into a world most dare not enter.
          </p>
          <Link href="/lore" className="btn-primary"><span>Read Our Story</span></Link>
        </div>
      </section>

      {/* ════════════════════════════ NEWSLETTER */}
      <div className="newsletter-section">
        <h2 className="newsletter-title">Join the Dark Congregation</h2>
        <p className="newsletter-sub">
          New arrivals, free downloads, and cursed deals — delivered to your crypt.
        </p>
        <NewsletterForm />
      </div>

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