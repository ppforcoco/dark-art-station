// app/page.tsx — DEAD TOWN REDESIGN
// Replace the entire contents of your app/page.tsx with this file.
// All CSS additions go into globals.css (see globals-additions.css companion file).

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
  title: "Haunted Wallpapers | Welcome to Dead Town — Free Dark Horror Wallpapers",
  description:
    "You've entered Dead Town. Free gothic, horror & fantasy wallpapers — HD downloads for iPhone, Android and PC. No sign-up. No email. Just darkness.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "Dead Town | Haunted Wallpapers",
    description: "Enter if you dare. Gothic horror wallpapers. HD. Free. Always.",
    url: SITE_URL, siteName: "Haunted Wallpapers", type: "website",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Dead Town — Haunted Wallpapers" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dead Town | Haunted Wallpapers",
    description: "Enter if you dare. Gothic horror wallpapers. HD. Free.",
    images: [OG_IMAGE],
  },
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
      {/* ── HORROR FOG OVERLAY ── */}
      <div className="dt-fog" aria-hidden="true">
        <div className="dt-fog__layer dt-fog__layer--1" />
        <div className="dt-fog__layer dt-fog__layer--2" />
        <div className="dt-fog__layer dt-fog__layer--3" />
      </div>

      {/* ── BLOOD DRIP TOP BORDER ── */}
      <div className="dt-drip-bar" aria-hidden="true">
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className="dt-drip" style={{ "--di": i } as React.CSSProperties} />
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════
          SECTION 1 — DEAD TOWN HERO GATE
          Full-screen cinematic entrance with the town proclamation
      ══════════════════════════════════════════════════════════ */}
      <section className="dt-gate">
        {/* Particle embers */}
        <div className="dt-embers" aria-hidden="true">
          {Array.from({ length: 28 }).map((_, i) => (
            <span key={i} className="dt-ember" style={{ "--ei": i } as React.CSSProperties} />
          ))}
        </div>

        {/* Cracked texture overlay */}
        <div className="dt-gate__crack" aria-hidden="true" />

        <div className="dt-gate__inner">
          {/* Population sign */}
          <div className="dt-pop-sign">
            <span className="dt-pop-sign__top">POPULATION</span>
            <span className="dt-pop-sign__num">
              {fmt(totalImages)}
              <span className="dt-pop-sign__cross">†</span>
            </span>
            <span className="dt-pop-sign__souls">LOST SOULS &amp; COUNTING</span>
          </div>

          {/* Main gate title */}
          <div className="dt-gate__title-wrap">
            <span className="dt-gate__eyebrow">You have arrived in</span>
            <h1 className="dt-gate__title">
              <span className="dt-gate__title-dead">DEAD</span>
              <span className="dt-gate__title-town">TOWN</span>
            </h1>
            <p className="dt-gate__sub">
              Where darkness hangs like fog and every image<br />
              is a window into something you shouldn&rsquo;t see.
            </p>
          </div>

          {/* Town stat coffins */}
          <div className="dt-coffin-row">
            <div className="dt-coffin">
              <span className="dt-coffin__ico">🕯️</span>
              <span className="dt-coffin__num">{fmt(totalImages)}</span>
              <span className="dt-coffin__label">Wallpapers</span>
            </div>
            <div className="dt-coffin dt-coffin--blood">
              <span className="dt-coffin__ico">💀</span>
              <span className="dt-coffin__num">4K</span>
              <span className="dt-coffin__label">HD Quality</span>
            </div>
            <div className="dt-coffin">
              <span className="dt-coffin__ico">🩸</span>
              <span className="dt-coffin__num">Free</span>
              <span className="dt-coffin__label">Always</span>
            </div>
            <div className="dt-coffin dt-coffin--gold">
              <span className="dt-coffin__ico">👁️</span>
              <span className="dt-coffin__num">No</span>
              <span className="dt-coffin__label">Sign-up</span>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="dt-gate__ctas">
            <Link href="/shop" className="dt-btn dt-btn--enter">
              <span className="dt-btn__flicker" aria-hidden="true" />
              <span>Enter the Town</span>
            </Link>
            <Link href="/iphone" className="dt-btn dt-btn--ghost">
              <span>Browse Wallpapers</span>
            </Link>
          </div>

          {/* Scroll cue */}
          <div className="dt-scroll-cue" aria-hidden="true">
            <span className="dt-scroll-cue__line" />
            <span className="dt-scroll-cue__text">scroll deeper</span>
          </div>
        </div>
      </section>

      <MarqueeTicker />

      {/* ══════════════════════════════════════════════════════════
          SECTION 2 — MOBILE HAUNTS
          3 × 9:16 phone mockups showing horror wallpapers
      ══════════════════════════════════════════════════════════ */}
      <section className="dt-phones">
        <div className="dt-phones__bg-text" aria-hidden="true">HAUNTED</div>

        <div className="dt-section-head">
          <span className="dt-eyebrow">Your Screen, Possessed</span>
          <h2 className="dt-section-title">Mobile Haunts</h2>
          <p className="dt-section-sub">
            Every lock screen is a portal. Choose yours wisely.
          </p>
        </div>

        <div className="dt-phone-row">

          {/* Phone 1 — Always Watching */}
          <div className="dt-phone-wrap dt-phone-wrap--left">
            <div className="dt-phone">
              <div className="dt-phone__shell">
                {/* Notch */}
                <div className="dt-phone__notch">
                  <span className="dt-phone__speaker" />
                  <span className="dt-phone__cam" />
                </div>
                {/* Screen */}
                <div className="dt-phone__screen">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/always-watching-wallpaper.webp"
                    alt="Always Watching — horror wallpaper"
                    className="dt-phone__img"
                  />
                  <div className="dt-phone__scan" aria-hidden="true" />
                  <div className="dt-phone__overlay" aria-hidden="true" />
                </div>
                {/* Side buttons */}
                <span className="dt-phone__vol-up" />
                <span className="dt-phone__vol-dn" />
                <span className="dt-phone__power" />
                <span className="dt-phone__home" />
              </div>
              <div className="dt-phone__glare" aria-hidden="true" />
            </div>
            <div className="dt-phone-label">
              <span className="dt-phone-label__name">Always Watching</span>
              <span className="dt-phone-label__tag">iPhone · 9:16</span>
              <Link href="/iphone" className="dt-phone-label__cta">Download →</Link>
            </div>
          </div>

          {/* Phone 2 — Funny Lockscreen (center, elevated) */}
          <div className="dt-phone-wrap dt-phone-wrap--center">
            <div className="dt-phone dt-phone--featured">
              <div className="dt-phone__shell">
                <div className="dt-phone__notch">
                  <span className="dt-phone__speaker" />
                  <span className="dt-phone__cam" />
                </div>
                <div className="dt-phone__screen">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/funny-lockscreen-wallpaper.jpeg"
                    alt="Funny Lockscreen — horror wallpaper"
                    className="dt-phone__img"
                  />
                  <div className="dt-phone__scan" aria-hidden="true" />
                  <div className="dt-phone__overlay" aria-hidden="true" />
                </div>
                <span className="dt-phone__vol-up" />
                <span className="dt-phone__vol-dn" />
                <span className="dt-phone__power" />
                <span className="dt-phone__home" />
              </div>
              <div className="dt-phone__glare" aria-hidden="true" />
              <div className="dt-phone__featured-glow" aria-hidden="true" />
            </div>
            <div className="dt-phone-label dt-phone-label--featured">
              <span className="dt-phone-label__badge">Featured</span>
              <span className="dt-phone-label__name">The Lookout</span>
              <span className="dt-phone-label__tag">Universal · 9:16</span>
              <Link href="/iphone" className="dt-phone-label__cta">Download →</Link>
            </div>
          </div>

          {/* Phone 3 — Skeleton Brick Wall */}
          <div className="dt-phone-wrap dt-phone-wrap--right">
            <div className="dt-phone">
              <div className="dt-phone__shell">
                <div className="dt-phone__notch">
                  <span className="dt-phone__speaker" />
                  <span className="dt-phone__cam" />
                </div>
                <div className="dt-phone__screen">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/skeleton-brick-wall-green.jpeg"
                    alt="Skeleton Brick Wall — horror wallpaper"
                    className="dt-phone__img"
                  />
                  <div className="dt-phone__scan" aria-hidden="true" />
                  <div className="dt-phone__overlay" aria-hidden="true" />
                </div>
                <span className="dt-phone__vol-up" />
                <span className="dt-phone__vol-dn" />
                <span className="dt-phone__power" />
                <span className="dt-phone__home" />
              </div>
              <div className="dt-phone__glare" aria-hidden="true" />
            </div>
            <div className="dt-phone-label">
              <span className="dt-phone-label__name">Bone Wall</span>
              <span className="dt-phone-label__tag">Android · 9:16</span>
              <Link href="/android" className="dt-phone-label__cta">Download →</Link>
            </div>
          </div>

        </div>

        <div className="dt-phones__footer">
          <Link href="/iphone" className="dt-btn dt-btn--ghost dt-btn--sm">View All Mobile →</Link>
        </div>
      </section>

      <div className="hw-ad-row">
        <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN} width={728} height={90} />
      </div>

      {/* ══════════════════════════════════════════════════════════
          SECTION 3 — DAILY PICK (preserved, restyled)
      ══════════════════════════════════════════════════════════ */}
      {wotd && (() => {
        const devicePath = wotd.deviceType === "IPHONE" ? "iphone" : wotd.deviceType === "ANDROID" ? "android" : "pc";
        const wotdUrl = getPublicUrl(wotd.r2Key);
        const wotdHref = `/${devicePath}/${wotd.slug}`;
        const todayStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
        return (
          <section className="dt-daily">
            <div className="dt-daily__inner">
              <div className="dt-daily__text">
                <p className="dt-daily__eyebrow">
                  <span className="dt-daily__dot" />
                  Tonight&rsquo;s Offering · {todayStr}
                </p>
                <h2 className="dt-daily__title">{wotd.title}</h2>
                {wotd.description && <p className="dt-daily__desc">{wotd.description}</p>}
                {wotd.tags.length > 0 && (
                  <div className="dt-daily__tags">
                    {wotd.tags.slice(0, 4).map(t => (
                      <span key={t} className="dt-daily__tag">#{t}</span>
                    ))}
                  </div>
                )}
                <Link href={wotdHref} className="dt-btn dt-btn--enter dt-btn--sm">
                  <span>Claim This Wallpaper →</span>
                </Link>
              </div>
              <Link href={wotdHref} className="dt-daily__img-frame" aria-label={wotd.title}>
                <div className="dt-daily__img-wrap">
                  <Image src={wotdUrl} alt={wotd.title} fill priority unoptimized className="object-cover" sizes="380px" />
                </div>
                <div className="dt-daily__img-corners" aria-hidden="true">
                  <span /><span /><span /><span />
                </div>
                {wotd.deviceType && (
                  <span className="dt-daily__badge">{wotd.deviceType.charAt(0) + wotd.deviceType.slice(1).toLowerCase()}</span>
                )}
              </Link>
            </div>
          </section>
        );
      })()}

      {/* ══════════════════════════════════════════════════════════
          SECTION 4 — PC / DESKTOP LANDSCAPE
          Full 16:9 desktop wallpaper in a monitor mockup
      ══════════════════════════════════════════════════════════ */}
      <section className="dt-desktop">
        <div className="dt-section-head dt-section-head--center">
          <span className="dt-eyebrow">The Town Square</span>
          <h2 className="dt-section-title">Desktop Nightmare</h2>
          <p className="dt-section-sub">
            Your work environment deserves to be unsettling.
          </p>
        </div>

        <div className="dt-monitor-wrap">
          <div className="dt-monitor">
            {/* Monitor bezel */}
            <div className="dt-monitor__bezel">
              {/* Camera dot */}
              <span className="dt-monitor__cam" />
              {/* Screen with 16:9 image */}
              <div className="dt-monitor__screen">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/monster-flower-offering-pc.webp"
                  alt="Monster Flower Offering — PC wallpaper 16:9"
                  className="dt-monitor__img"
                />
                <div className="dt-monitor__scanlines" aria-hidden="true" />
                <div className="dt-monitor__glitch" aria-hidden="true" />
              </div>
            </div>
            {/* Stand */}
            <div className="dt-monitor__neck" />
            <div className="dt-monitor__foot" />
          </div>

          {/* Floating label cards */}
          <div className="dt-monitor__tag dt-monitor__tag--tl">
            <span>16 : 9</span>
            <span>Full HD</span>
          </div>
          <div className="dt-monitor__tag dt-monitor__tag--tr">
            <span>PC</span>
            <span>Desktop</span>
          </div>
        </div>

        <div className="dt-desktop__cta-row">
          <Link href="/pc" className="dt-btn dt-btn--enter">Browse PC Wallpapers →</Link>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 5 — CHOOSE YOUR OBSESSION (collections)
      ══════════════════════════════════════════════════════════ */}
      <section className="dt-obsessions">
        <div className="dt-section-head">
          <span className="dt-eyebrow">Districts of Dead Town</span>
          <h2 className="dt-section-title">What Haunts You?</h2>
        </div>

        {obsessions.length > 0 ? (
          <div className="dt-obs-grid">
            {obsessions.map((obs, i) => {
              const thumb = obs.thumbnail ? `${r2Base}/${obs.thumbnail}` : null;
              return (
                <Link
                  key={obs.id}
                  href={`/shop/${obs.slug}`}
                  className="dt-obs-card"
                  style={{ "--delay": `${i * 0.07}s` } as React.CSSProperties}
                >
                  <div className="dt-obs-card__bg">
                    {thumb ? (
                      <Image
                        src={thumb}
                        alt={obs.title}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="(max-width:600px) 50vw, (max-width:1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="dt-obs-card__placeholder">
                        <span className="dt-obs-card__icon">{obs.icon ?? "🖤"}</span>
                      </div>
                    )}
                    <div className="dt-obs-card__veil" />
                  </div>
                  {/* Glitch stripe */}
                  <div className="dt-obs-card__glitch" aria-hidden="true" />
                  {/* Blood drip on hover */}
                  <div className="dt-obs-card__drip" aria-hidden="true" />
                  <div className="dt-obs-card__body">
                    <span className="dt-obs-card__tag">{obs.tag ?? "Collection"}</span>
                    <h3 className="dt-obs-card__title">{obs.title}</h3>
                    <span className="dt-obs-card__count">{obs._count.images} wallpapers</span>
                  </div>
                  <div className="dt-obs-card__glow" aria-hidden="true" />
                  {/* Corner bones */}
                  <span className="dt-obs-card__corner dt-obs-card__corner--tl">†</span>
                  <span className="dt-obs-card__corner dt-obs-card__corner--br">†</span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="dt-coming-soon">
            <div className="dt-coming-soon__sigil">✦ ☽ ✦</div>
            <div className="dt-coming-soon__bar" />
            <h2 className="dt-coming-soon__title">The Districts Are Being Built</h2>
            <p className="dt-coming-soon__sub">
              Upload images from the admin panel to summon these dark territories.
            </p>
          </div>
        )}

        <div className="dt-obsessions__footer">
          <Link href="/collections" className="dt-btn dt-btn--ghost">All Districts →</Link>
        </div>
      </section>

      <div className="hw-ad-row">
        <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} width={728} height={90} />
      </div>

      {/* ══════════════════════════════════════════════════════════
          SECTION 6 — MANIFESTO / DEAD TOWN LORE
      ══════════════════════════════════════════════════════════ */}
      <section className="dt-manifesto">
        <div className="dt-manifesto__gutter" aria-hidden="true">
          <span className="dt-manifesto__rune">☩</span>
          <span className="dt-manifesto__line" />
          <span className="dt-manifesto__rune">☩</span>
        </div>

        <div className="dt-manifesto__content">
          <span className="dt-eyebrow">The Dead Town Creed</span>

          <blockquote className="dt-manifesto__quote">
            Some people want bright &amp; simple.<br />
            <em className="dt-manifesto__em">You&rsquo;re not one of them.</em>
          </blockquote>

          <p className="dt-manifesto__body">
            You arrived here because something in you gravitates toward the strange —
            the shadowed corners, the art that lingers long after you close the tab,
            the wallpaper that makes your friends ask: <em>why?</em>
          </p>
          <p className="dt-manifesto__body">
            Dead Town is built for you. Every image is full HD. Every download is free.
            No account. No email. No gatekeeping. Just the darkness you crave.
          </p>

          <div className="dt-manifesto__ctas">
            <Link href="/shop" className="dt-btn dt-btn--enter">
              <span>Enter the Collection →</span>
            </Link>
            <Link href="/about" className="dt-btn dt-btn--ghost dt-btn--sm">Our Story</Link>
          </div>
        </div>
      </section>

      <RecentlyViewed />

      {/* Bottom drip */}
      <div className="dt-drip-bar dt-drip-bar--bottom" aria-hidden="true">
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className="dt-drip dt-drip--up" style={{ "--di": i } as React.CSSProperties} />
        ))}
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org", "@type": "ItemList",
          name: "Dead Town — Haunted Wallpapers Collections",
          url: SITE_URL, numberOfItems: obsessions.length,
          itemListElement: obsessions.map((o, i) => ({
            "@type": "ListItem", position: i + 1,
            url: `${SITE_URL}/shop/${o.slug}`, name: o.title,
          })),
        })
      }} />
    </>
  );
}