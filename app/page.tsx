// app/page.tsx — Haunted Wallpapers Redesign
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { db, getWallpaperOfTheDay } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import AdSlot from "@/components/AdSlot";
import MarqueeTicker from "@/components/MarqueeTicker";

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

  // Fetch obsession collections — these are your tag-based grids
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
      {/* ── PARTICLES CANVAS (CSS only, no JS) ── */}
      <div className="hw2-particles" aria-hidden="true">
        {Array.from({ length: 20 }).map((_, i) => (
          <span key={i} className="hw2-particle" style={{ "--i": i } as React.CSSProperties} />
        ))}
      </div>

      {/* ── HERO ── */}
      <section className="hw2-hero">
        <div className="hw2-hero__fog" aria-hidden="true" />
        <div className="hw2-hero__content">
          <p className="hw2-hero__eyebrow">
            <span className="hw2-hero__eyebrow-dot" />
            Free · HD · No Sign-up
          </p>
          <h1 className="hw2-hero__title">
            Art that lives<br />
            <em className="hw2-hero__title-em">in the dark.</em>
          </h1>
          <p className="hw2-hero__sub">
            Gothic, horror, fantasy wallpapers for iPhone, Android &amp; PC.
            Download in 4K. No account. No watermark. Just the art.
          </p>
          <div className="hw2-hero__actions">
            <Link href="/iphone" className="hw2-btn hw2-btn--primary">Browse iPhone</Link>
            <Link href="/android" className="hw2-btn hw2-btn--ghost">Android &amp; PC</Link>
          </div>
          <div className="hw2-hero__stats">
            <div className="hw2-stat">
              <span className="hw2-stat__num">{fmt(totalImages)}</span>
              <span className="hw2-stat__label">Wallpapers</span>
            </div>
            <div className="hw2-stat__div" />
            <div className="hw2-stat">
              <span className="hw2-stat__num">4K</span>
              <span className="hw2-stat__label">Resolution</span>
            </div>
            <div className="hw2-stat__div" />
            <div className="hw2-stat">
              <span className="hw2-stat__num">Free</span>
              <span className="hw2-stat__label">Always</span>
            </div>
          </div>
        </div>

        {/* Daily pick floating card */}
        {wotd && (() => {
          const devicePath = wotd.deviceType === "IPHONE" ? "iphone" : wotd.deviceType === "ANDROID" ? "android" : "pc";
          const wotdUrl = getPublicUrl(wotd.r2Key);
          return (
            <Link href={`/${devicePath}/${wotd.slug}`} className="hw2-hero__card" aria-label={wotd.title}>
              <div className="hw2-hero__card-label">Today&rsquo;s Pick</div>
              <Image src={wotdUrl} alt={wotd.title} fill unoptimized priority className="object-cover" sizes="320px" />
              <div className="hw2-hero__card-overlay">
                <span className="hw2-hero__card-title">{wotd.title}</span>
                <span className="hw2-hero__card-cta">Download Free →</span>
              </div>
            </Link>
          );
        })()}
      </section>

      <MarqueeTicker />

      <div className="hw2-ad-row">
        <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN} width={728} height={90} />
      </div>

      {/* ── OBSESSIONS GRID ── */}
      <section className="hw2-obsessions">
        <div className="hw2-section-head">
          <div className="hw2-section-head__left">
            <span className="hw2-eyebrow">Choose Your Obsession</span>
            <h2 className="hw2-section-title">What haunts you?</h2>
          </div>
          <Link href="/collections" className="hw2-see-all">All Collections →</Link>
        </div>

        <div className="hw2-obsessions__grid">
          {obsessions.map((obs, i) => {
            const thumb = obs.thumbnail ? `${r2Base}/${obs.thumbnail}` : null;
            return (
              <Link
                key={obs.id}
                href={`/shop/${obs.slug}`}
                className="hw2-obs-card"
                style={{ "--delay": `${i * 0.07}s` } as React.CSSProperties}
              >
                {/* Background image or gradient */}
                <div className="hw2-obs-card__bg">
                  {thumb ? (
                    <Image src={thumb} alt={obs.title} fill unoptimized className="object-cover" sizes="(max-width:600px) 100vw, (max-width:1024px) 50vw, 33vw" />
                  ) : (
                    <div className="hw2-obs-card__placeholder">
                      <span className="hw2-obs-card__icon">{obs.icon ?? "🖤"}</span>
                    </div>
                  )}
                  <div className="hw2-obs-card__veil" />
                </div>
                {/* Glitch flicker effect */}
                <div className="hw2-obs-card__glitch" aria-hidden="true" />
                {/* Content */}
                <div className="hw2-obs-card__body">
                  <span className="hw2-obs-card__tag">{obs.tag ?? "Collection"}</span>
                  <h3 className="hw2-obs-card__title">{obs.title}</h3>
                  <span className="hw2-obs-card__count">{obs._count.images} wallpapers</span>
                </div>
                {/* Hover border glow */}
                <div className="hw2-obs-card__glow" aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </section>

      <div className="hw2-ad-row">
        <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} width={728} height={90} />
      </div>

      {/* ── MANIFESTO ── */}
      <section className="hw2-manifesto">
        <div className="hw2-manifesto__inner">
          <div className="hw2-manifesto__rune" aria-hidden="true">✦</div>
          <blockquote className="hw2-manifesto__quote">
            Some people want bright and cheerful.<br />
            <em className="hw2-manifesto__em">You know better.</em>
          </blockquote>
          <p className="hw2-manifesto__body">
            The dark isn&rsquo;t empty — it&rsquo;s full of things worth staring at.
            We find them and put them on your screen. Gothic art, horror illustrations,
            dark fantasy worlds. All free. All HD. All yours.
          </p>
          <div className="hw2-manifesto__links">
            <Link href="/iphone" className="hw2-btn hw2-btn--primary">iPhone Wallpapers</Link>
            <Link href="/android" className="hw2-btn hw2-btn--ghost">Android</Link>
            <Link href="/pc" className="hw2-btn hw2-btn--ghost">PC &amp; Desktop</Link>
          </div>
        </div>
      </section>

      {/* JSON-LD */}
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