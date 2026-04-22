// app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { db, getWallpaperOfTheDay } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import MarqueeTicker from "@/components/MarqueeTicker";
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
  twitter: { card: "summary_large_image", title: "Haunted Wallpapers | Free Dark Fantasy Wallpapers", description: "Gothic, horror and fantasy wallpapers. HD downloads. No sign-up.", images: [OG_IMAGE] },
  alternates: { canonical: SITE_URL },
};

export const revalidate = 60;

export default async function Home() {
  const wotd = await getWallpaperOfTheDay();
  const totalImages = await db.image.count();

  function fmt(n: number) {
    if (n >= 1000) return `${Math.floor(n / 100) / 10}K+`;
    return `${Math.floor(n / 50) * 50}+`;
  }

  const obsessions = await db.collection.findMany({
    orderBy: [{ featured: "desc" }, { createdAt: "asc" }],
    where: { isAdult: false },
    take: 10,
    select: {
      id: true, slug: true, title: true, thumbnail: true,
      tag: true, icon: true, bgClass: true,
      _count: { select: { images: true } },
    },
  });

  const r2Base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";

  return (
    <>
      {/* ── FLOATING PARTICLES ── */}
      <div className="hw2-particles" aria-hidden="true">
        {Array.from({ length: 20 }).map((_, i) => (
          <span key={i} className="hw2-particle" style={{ "--i": i } as React.CSSProperties} />
        ))}
      </div>

      {/* ── HERO: original 2-column layout preserved ── */}
      <section className="hw-hero">
        {/* Left: text + stats */}
        <div className="hw-hero__text">
          <p className="hw-hero__tagline">Art that whispers long after you close the tab.</p>
          <p className="hw-hero__sub">
            Gothic, horror, fantasy — updated regularly. Every download is HD and free.
            No sign-up. No &ldquo;verify your email.&rdquo; Just art.
          </p>

          {/* Horror stat boxes */}
          <div className="hw2-stat-boxes">
            <div className="hw2-stat-box">
              <span className="hw2-stat-box__num">{fmt(totalImages)}</span>
              <span className="hw2-stat-box__label">Wallpapers</span>
            </div>
            <div className="hw2-stat-box hw2-stat-box--crimson">
              <span className="hw2-stat-box__num">4K</span>
              <span className="hw2-stat-box__label">Resolution</span>
            </div>
            <div className="hw2-stat-box">
              <span className="hw2-stat-box__num">Free</span>
              <span className="hw2-stat-box__label">Always</span>
            </div>
          </div>
        </div>

        {/* Right: 4-column theme mosaic */}
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

      {/* ── CHOOSE YOUR OBSESSION ── */}
      <section className="hw2-obsessions">
        <div className="hw2-section-head">
          <div className="hw2-section-head__left">
            <span className="hw2-eyebrow">Choose Your Obsession</span>
            <h2 className="hw2-section-title">What haunts you?</h2>
          </div>
          <Link href="/collections" className="hw2-see-all">All Collections →</Link>
        </div>

        {obsessions.length > 0 ? (
          <div className="hw2-obsessions__grid">
            {obsessions.map((obs, i) => {
              const thumb = obs.thumbnail ? `${r2Base}/${obs.thumbnail}` : null;
              return (
                <Link
                  key={obs.id}
                  href={`/shop/${obs.slug}`}
                  className="hw2-obs-card"
                  style={{ "--delay": `${i * 0.06}s` } as React.CSSProperties}
                >
                  <div className="hw2-obs-card__bg">
                    {thumb ? (
                      <Image src={thumb} alt={obs.title} fill unoptimized className="object-cover" sizes="(max-width:600px) 50vw, (max-width:1024px) 33vw, 25vw" />
                    ) : (
                      <div className="hw2-obs-card__placeholder">
                        <span className="hw2-obs-card__icon">{obs.icon ?? "🖤"}</span>
                      </div>
                    )}
                    <div className="hw2-obs-card__veil" />
                  </div>
                  <div className="hw2-obs-card__glitch" aria-hidden="true" />
                  <div className="hw2-obs-card__body">
                    <span className="hw2-obs-card__tag">{obs.tag ?? "Collection"}</span>
                    <h3 className="hw2-obs-card__title">{obs.title}</h3>
                    <span className="hw2-obs-card__count">{obs._count.images} wallpapers</span>
                  </div>
                  <div className="hw2-obs-card__glow" aria-hidden="true" />
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="hw-coming-soon" style={{gridColumn: "1 / -1"}}>
            <div className="hw-coming-soon__sigil">✦ ☽ ✦</div>
            <div className="hw-coming-soon__bar" />
            <h2 className="hw-coming-soon__title">Coming Soon</h2>
            <p className="hw-coming-soon__sub">
              Dark collections are being summoned. Upload images from the admin panel to awaken this page.
            </p>
          </div>
        )}
      </section>

      <div className="hw-ad-row">
        <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} width={728} height={90} />
      </div>

      {/* ── MANIFESTO ── */}
      <section className="hw-statement">
        <blockquote className="hw-statement__quote">
          Some people want bright and simple.<br />
          <em className="hw-statement__em">You&rsquo;re not one of them.</em>
        </blockquote>
        <p className="hw-statement__body">
          You like the strange, the shadowed, the kind of art that feels like a half-remembered dream.
          Bold illustrations, creepy atmospheres, fantasy worlds you wish you could walk into.
        </p>
        <p className="hw-statement__body">
          Download everything in full HD. No account needed. No email required. Just art that gets you.
        </p>
        <Link href="/shop" className="hw-statement__cta">Browse the Collection →</Link>
      </section>

      <RecentlyViewed />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "ItemList",
        name: "Haunted Wallpapers — Obsession Collections",
        url: SITE_URL, numberOfItems: obsessions.length,
        itemListElement: obsessions.map((o, i) => ({
          "@type": "ListItem", position: i + 1,
          url: `${SITE_URL}/shop/${o.slug}`, name: o.title,
        })),
      }) }} />
    </>
  );
}