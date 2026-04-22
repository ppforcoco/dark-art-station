// app/page.tsx — HAUNTED TOWN REDESIGN (AdSense-safe, split-hero edition)

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { db, getWallpaperOfTheDay } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import AdSlot from "@/components/AdSlot";
import RecentlyViewed from "@/components/RecentlyViewed";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";
const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

export const metadata: Metadata = {
  title: "Haunted Wallpapers | Welcome to Haunted Town — Free Gothic & Fantasy Wallpapers",
  description:
    "You've arrived in Haunted Town. Free gothic, fantasy & atmospheric wallpapers — HD downloads for iPhone, Android and PC. No sign-up. No email. Just great art.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "Haunted Town | Haunted Wallpapers",
    description: "Gothic fantasy wallpapers. HD. Free. Always.",
    url: SITE_URL, siteName: "Haunted Wallpapers", type: "website",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Haunted Town — Haunted Wallpapers" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Haunted Town | Haunted Wallpapers",
    description: "Gothic fantasy wallpapers. HD. Free.",
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
      {/* ── ATMOSPHERIC FOG OVERLAY ── */}
      <div className="dt-fog" aria-hidden="true">
        <div className="dt-fog__layer dt-fog__layer--1" />
        <div className="dt-fog__layer dt-fog__layer--2" />
        <div className="dt-fog__layer dt-fog__layer--3" />
      </div>

      {/* ── DECORATIVE TOP BORDER ── */}
      <div className="dt-drip-bar" aria-hidden="true">
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className="dt-drip" style={{ "--di": i } as React.CSSProperties} />
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════
          SECTION 1 — HERO: 2-COLUMN SPLIT (compact)
      ══════════════════════════════════════════════════════════ */}
      <section className="dt-gate dt-gate--split dt-gate--compact">

        <div className="dt-gate__crack" aria-hidden="true" />

        {/* ── LEFT: Title block ── */}
        <div className="dt-gate__left">
          <span className="dt-gate__eyebrow">You have arrived in</span>
          <h1 className="dt-gate__title">
            <span className="dt-gate__title-dead">HAUNTED</span>
            <span className="dt-gate__title-town">TOWN</span>
          </h1>
          <p className="dt-gate__sub">
            Where atmosphere hangs like fog and every image
            is a window into something extraordinary.
          </p>
          <div className="dt-gate__collection-badge">
            <span className="dt-gate__collection-num">{fmt(totalImages)}</span>
            <span className="dt-gate__collection-label">wallpapers &amp; growing</span>
          </div>

          {/* Stat cards — no emojis */}
          <div className="dt-coffin-row dt-coffin-row--compact">
            <div className="dt-coffin">
              <span className="dt-coffin__num">{fmt(totalImages)}</span>
              <span className="dt-coffin__label">Wallpapers</span>
            </div>
            <div className="dt-coffin dt-coffin--accent">
              <span className="dt-coffin__num">4K</span>
              <span className="dt-coffin__label">HD Quality</span>
            </div>
            <div className="dt-coffin">
              <span className="dt-coffin__num">Free</span>
              <span className="dt-coffin__label">Always</span>
            </div>
            <div className="dt-coffin dt-coffin--gold">
              <span className="dt-coffin__num">No</span>
              <span className="dt-coffin__label">Sign-up</span>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="dt-gate__ctas">
            <Link href="/shop" className="dt-btn dt-btn--enter">
              <span>Browse Collection</span>
            </Link>
            <Link href="/iphone" className="dt-btn dt-btn--ghost">
              <span>Mobile Wallpapers</span>
            </Link>
          </div>
        </div>

        {/* ── RIGHT: Hero image strip ── */}
        <div className="dt-gate__right">
          <div className="dt-hero-images">

            <div className="dt-hero-img-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/wallpapers/hero-1.jpeg"
                alt="Haunted Hero 1"
                className="dt-hero-img"
                loading="eager"
              />
            </div>

            <div className="dt-hero-img-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/wallpapers/houston-snapback-skeleton.jpeg"
                alt="Houston Snapback Skeleton"
                className="dt-hero-img dt-hero-img--featured"
                loading="eager"
              />
            </div>

            <div className="dt-hero-img-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/wallpapers/shadows-have-eyes-android.webp"
                alt="Shadows Have Eyes"
                className="dt-hero-img"
                loading="eager"
              />
            </div>

            <div className="dt-hero-img-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/wallpapers/haunted-house-moon.jpeg"
                alt="Haunted House Moon"
                className="dt-hero-img"
                loading="eager"
              />
            </div>

            <div className="dt-hero-img-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/wallpapers/hero-2.jpeg"
                alt="Haunted Hero 2"
                className="dt-hero-img"
                loading="eager"
              />
            </div>

          </div>
        </div>

      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 2 — MOBILE WALLPAPERS (5 phones)
      ══════════════════════════════════════════════════════════ */}
      <section className="dt-phones">
        <div className="dt-section-head">
          <span className="dt-eyebrow">Your Screen, Transformed</span>
          <h2 className="dt-section-title">Mobile Wallpapers</h2>
          <p className="dt-section-sub">
            Every lock screen is a portal. Choose yours wisely.
          </p>
        </div>

        <div className="dt-phone-row">

          <div className="dt-phone-wrap dt-phone-wrap--left">
            <div className="dt-phone">
              <div className="dt-phone__shell">
                <div className="dt-phone__notch">
                  <span className="dt-phone__speaker" />
                  <span className="dt-phone__cam" />
                </div>
                <div className="dt-phone__screen">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/always-watching-wallpaper.webp"
                    alt="Always Watching"
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
              <span className="dt-phone-label__name">Always Watching</span>
              <span className="dt-phone-label__tag">iPhone · 9:16</span>
            </div>
          </div>

          <div className="dt-phone-wrap">
            <div className="dt-phone">
              <div className="dt-phone__shell">
                <div className="dt-phone__notch">
                  <span className="dt-phone__speaker" />
                  <span className="dt-phone__cam" />
                </div>
                <div className="dt-phone__screen">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/paper-cut-witch-red-backdrop-staff.jpeg"
                    alt="Paper Cut Witch"
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
              <span className="dt-phone-label__name">Paper Cut Witch</span>
              <span className="dt-phone-label__tag">Android · 9:16</span>
            </div>
          </div>

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
                    alt="The Lookout"
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
            </div>
          </div>

          <div className="dt-phone-wrap">
            <div className="dt-phone">
              <div className="dt-phone__shell">
                <div className="dt-phone__notch">
                  <span className="dt-phone__speaker" />
                  <span className="dt-phone__cam" />
                </div>
                <div className="dt-phone__screen">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/wallpapers/hero-3.jpeg"
                    alt="Hero 3"
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
              <span className="dt-phone-label__name">Haunted Vista</span>
              <span className="dt-phone-label__tag">iPhone · 9:16</span>
            </div>
          </div>

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
                    alt="Bone Wall"
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
          SECTION 3 — DAILY PICK
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
                  Tonight&rsquo;s Pick · {todayStr}
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
                  <span>Download This Wallpaper →</span>
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
          SECTION 4 — PC / DESKTOP
      ══════════════════════════════════════════════════════════ */}
      <section className="dt-desktop">
        <div className="dt-section-head dt-section-head--center">
          <span className="dt-eyebrow">The Haunted Square</span>
          <h2 className="dt-section-title">Desktop Wallpapers</h2>
          <p className="dt-section-sub">
            Your workspace, transformed with stunning atmospheric art.
          </p>
        </div>

        <div className="dt-monitor-wrap">
          <div className="dt-monitor">
            <div className="dt-monitor__bezel">
              <span className="dt-monitor__cam" />
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
            <div className="dt-monitor__neck" />
            <div className="dt-monitor__foot" />
          </div>
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
          SECTION 5 — COLLECTIONS
      ══════════════════════════════════════════════════════════ */}
      <section className="dt-obsessions">
        <div className="dt-section-head">
          <span className="dt-eyebrow">Neighbourhoods of Haunted Town</span>
          <h2 className="dt-section-title">What Calls to You?</h2>
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
                  <div className="dt-obs-card__glitch" aria-hidden="true" />
                  <div className="dt-obs-card__drip" aria-hidden="true" />
                  <div className="dt-obs-card__body">
                    <span className="dt-obs-card__tag">{obs.tag ?? "Collection"}</span>
                    <h3 className="dt-obs-card__title">{obs.title}</h3>
                    <span className="dt-obs-card__count">{obs._count.images} wallpapers</span>
                  </div>
                  <div className="dt-obs-card__glow" aria-hidden="true" />
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
              Upload images from the admin panel to populate these atmospheric territories.
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
          SECTION 6 — ABOUT / STORY
      ══════════════════════════════════════════════════════════ */}
      <section className="dt-manifesto">
        <div className="dt-manifesto__gutter" aria-hidden="true">
          <span className="dt-manifesto__rune">☩</span>
          <span className="dt-manifesto__line" />
          <span className="dt-manifesto__rune">☩</span>
        </div>

        <div className="dt-manifesto__content">
          <span className="dt-eyebrow">The Haunted Town Story</span>

          <blockquote className="dt-manifesto__quote">
            Some people want bright &amp; simple.<br />
            <em className="dt-manifesto__em">You&rsquo;re not one of them.</em>
          </blockquote>

          <p className="dt-manifesto__body">
            You arrived here because something in you gravitates toward the extraordinary —
            the atmospheric corners, the art that lingers long after you close the tab,
            the wallpaper that makes your friends ask: <em>where did you get that?</em>
          </p>
          <p className="dt-manifesto__body">
            Haunted Town is built for you. Every image is full HD. Every download is free.
            No account. No email. No gatekeeping. Just the aesthetic you love.
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

      {/* Bottom decorative border */}
      <div className="dt-drip-bar dt-drip-bar--bottom" aria-hidden="true">
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className="dt-drip dt-drip--up" style={{ "--di": i } as React.CSSProperties} />
        ))}
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org", "@type": "ItemList",
          name: "Haunted Town — Haunted Wallpapers Collections",
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