// app/page.tsx — HAUNTED TOWN REDESIGN (AdSense-safe, split-hero edition)

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { db, getWallpaperOfTheDay, getPageContent } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import AdSlot from "@/components/AdSlot";
import RecentlyViewed from "@/components/RecentlyViewed";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";
const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

export async function generateMetadata(): Promise<Metadata> {
  const pageContent = await getPageContent("home");
  const desc = pageContent?.metaDesc ??
    "You've arrived in Haunted Town. Free gothic, fantasy & atmospheric wallpapers — HD downloads for iPhone, Android and PC. No sign-up. No email. Just great art.";
  const title = pageContent?.title ??
    "Haunted Wallpapers | Welcome to Haunted Town — Free Gothic & Fantasy Wallpapers";
  return {
    title,
    description: desc,
    metadataBase: new URL(SITE_URL),
    openGraph: {
      title: "Haunted Town | Haunted Wallpapers",
      description: desc,
      url: SITE_URL, siteName: "Haunted Wallpapers", type: "website",
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Haunted Town — Haunted Wallpapers" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Haunted Town | Haunted Wallpapers",
      description: desc,
      images: [OG_IMAGE],
    },
    alternates: { canonical: SITE_URL },
  };
}

export const revalidate = 3600; // Re-check every hour; WOTD itself changes at UTC midnight

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

      {/* ══════════════════════════════════════════════════════════
          SECTION 1 — HERO: SPLIT LAYOUT (text left, phones right)
      ══════════════════════════════════════════════════════════ */}
      <section className="dt-gate dt-gate--collage" style={{ padding: "calc(var(--nav-h, 64px) + 24px) 0 0", minHeight: "unset" }}>

        <div className="dt-gate__crack" aria-hidden="true" />

        {/* ── Responsive split: stacked on mobile/foldable, side-by-side on desktop ── */}
        <div className="hw-hero-split" style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          alignItems: "flex-start",
          width: "100%",
          maxWidth: "100%",
        }}>

          {/* LEFT — Text block */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", padding: "clamp(16px,4vw,48px) clamp(16px,4vw,52px) 24px" }}>
            <span className="dt-gate__eyebrow" style={{ fontSize: "0.75rem", letterSpacing: "0.25em" }}>You have arrived in</span>

            <div className="dt-gate__collection-badge" style={{ marginBottom: "0" }}>
              <span className="dt-gate__collection-num" style={{ fontSize: "clamp(2rem,5vw,3rem)" }}>{fmt(totalImages)}</span>
              <span className="dt-gate__collection-label">wallpapers &amp; growing</span>
            </div>

            <p className="dt-gate__sub" style={{ fontSize: "clamp(0.95rem,2vw,1.1rem)", lineHeight: "1.65", maxWidth: "480px", margin: 0 }}>
              Where every wallpaper has a secret.
            </p>

            {/* Daily vault copy */}
            <p className="hw-hero-vault-text" style={{
              fontSize: "0.8rem",
              lineHeight: "1.75",
              maxWidth: "460px",
              fontStyle: "italic",
              borderLeft: "2px solid #8b0000",
              paddingLeft: "1rem",
              margin: 0,
            }}>
              Every 24 hours, a single vision is pulled from the deepest level of the vault. A unique horror wallpaper surfaced just for tonight. Download this 4K pick before the clock resets and a new nightmare takes its place.
            </p>

            {/* Browse All CTA */}
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <Link href="/iphone" className="dt-btn dt-btn--enter">
                <span>Browse All Wallpapers →</span>
              </Link>
              <Link href="/pc" className="dt-btn dt-btn--ghost">
                <span>PC Wallpapers</span>
              </Link>
            </div>

            {/* Stat cards */}
            <div className="dt-coffin-row dt-coffin-row--compact">
              <div className="dt-coffin">
                <span className="dt-coffin__num">{fmt(totalImages)}</span>
                <span className="dt-coffin__label">The Archive</span>
              </div>
              <div className="dt-coffin dt-coffin--accent">
                <span className="dt-coffin__num">4K</span>
                <span className="dt-coffin__label">Retina Optimized</span>
              </div>
              <div className="dt-coffin">
                <span className="dt-coffin__num">Free</span>
                <span className="dt-coffin__label">Always</span>
              </div>
              <div className="dt-coffin dt-coffin--gold">
                <span className="dt-coffin__num">No Sign‑Up</span>
                <span className="dt-coffin__label">Pure Privacy</span>
              </div>
            </div>
          </div>

          {/* RIGHT — Phone mockups, flush to bottom of section */}
          <div className="hw-hero-phones-wrap">
            <div className="dt-hero-phones" style={{ gap: "clamp(6px,1.2vw,20px)", alignItems: "flex-end", padding: 0 }}>
              {[
                { src: "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/wallpapers/houston-snapback-skeleton.jpeg", alt: "Skeleton", featured: false },
                { src: "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/wallpapers/shadows-have-eyes-android.webp", alt: "Shadow Eyes", featured: false },
                { src: "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/wallpapers/haunted-house-moon.jpeg", alt: "Haunted Moon", featured: true },
                { src: "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/wallpapers/hero-1.jpeg", alt: "Hero Art", featured: false },
                { src: "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/wallpapers/hero-2.jpeg", alt: "Dark Art", featured: false },
              ].map((phone, i) => (
                <div
                  key={i}
                  className={`dt-hero-phone-wrap${phone.featured ? " dt-hero-phone-wrap--featured" : ""}`}
                  style={{
                    "--phone-i": i,
                    transform: phone.featured
                      ? "scale(1.18) translateY(-12px)"
                      : i === 1 || i === 3
                      ? "scale(1.06) translateY(-4px)"
                      : "scale(0.92) translateY(4px)",
                  } as React.CSSProperties}
                >
                  <div className="dt-hero-phone" style={{ width: "clamp(100px,13vw,185px)", height: "clamp(200px,26vw,375px)", borderRadius: "clamp(18px,2vw,30px)" }}>
                    <div className="dt-hero-phone__btn dt-hero-phone__btn--power" aria-hidden="true" />
                    <div className="dt-hero-phone__btn dt-hero-phone__btn--vol1" aria-hidden="true" />
                    <div className="dt-hero-phone__btn dt-hero-phone__btn--vol2" aria-hidden="true" />
                    <div className="dt-hero-phone__screen">
  
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={phone.src}
                        alt={phone.alt}
                        className="dt-hero-phone__img"
                        loading={i < 3 ? "eager" : "lazy"}
                      />
                      <div className="dt-hero-phone__gloss" aria-hidden="true" />
                      {phone.featured && <div className="dt-hero-phone__glow-ring" aria-hidden="true" />}
                    </div>
                    <div className="dt-hero-phone__bar" aria-hidden="true" />
                  </div>

                </div>
              ))}
            </div>
          </div>

        </div>

      </section>

      <style>{`
        /* Desktop: side by side, text left phones right */
        @media (min-width: 860px) {
          .hw-hero-split {
            grid-template-columns: minmax(320px,420px) 1fr !important;
            align-items: flex-end !important;
          }
          .hw-hero-phones-wrap {
            padding-bottom: 0;
          }
        }
        /* Foldable / tablet: generous but not full desktop */
        @media (min-width: 540px) and (max-width: 859px) {
          .hw-hero-split {
            grid-template-columns: 1fr !important;
          }
          .hw-hero-phones-wrap {
            padding: 0 clamp(12px,3vw,32px);
            overflow-x: auto;
          }
          .dt-hero-phones {
            justify-content: flex-start !important;
          }
        }
        /* Small phones */
        @media (max-width: 539px) {
          .hw-hero-split { grid-template-columns: 1fr !important; }
          .hw-hero-phones-wrap { padding: 0 12px; overflow-x: auto; }
          .dt-hero-phones { justify-content: flex-start !important; }
        }
        /* Light theme text fixes */
        [data-theme="light"] .dt-gate__eyebrow { color: #8b0000 !important; }
        [data-theme="light"] .dt-gate__collection-num { color: #1a1410 !important; }
        [data-theme="light"] .dt-gate__collection-label { color: #5a4838 !important; }
        [data-theme="light"] .dt-gate__sub { color: #2a1e10 !important; }
        [data-theme="light"] .hw-hero-vault-text { color: rgba(60,40,20,0.75) !important; }
        [data-theme="light"] .dt-coffin { background: rgba(255,255,255,0.6) !important; border-color: rgba(139,0,0,0.2) !important; }
        [data-theme="light"] .dt-coffin__num { color: #8b0000 !important; }
        [data-theme="light"] .dt-coffin__label { color: rgba(60,40,30,0.6) !important; }
        [data-theme="light"] .dt-btn--ghost { color: #3a2010 !important; border-color: rgba(60,40,20,0.35) !important; }
        [data-theme="light"] .dt-btn--ghost:hover { color: #1a1008 !important; border-color: #1a1008 !important; }
      `}</style>


      <div className="hw-ad-row">
        <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN} width={728} height={90} />
      </div>

      {/* ══════════════════════════════════════════════════════════
          SECTION 2 — DAILY PICK
      ══════════════════════════════════════════════════════════ */}
      {wotd && (() => {
        const devicePath = wotd.deviceType === "IPHONE" ? "iphone" : wotd.deviceType === "ANDROID" ? "android" : "pc";
        const wotdUrl = getPublicUrl(wotd.r2Key);
        const wotdHref = `/${devicePath}/${wotd.slug}`;
        const todayStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
        return (
          <section className="dt-daily">
            {/* Full-bleed background image with dark overlay */}
            <div className="dt-daily__bg" aria-hidden="true">
              <Image src={wotdUrl} alt="" fill priority unoptimized className="object-cover" sizes="100vw"
                style={{ objectPosition: "center top" }} />
              <div className="dt-daily__bg-veil" />
            </div>

            <div className="dt-daily__inner">
              {/* LEFT — tall image card (phone mockup style) */}
              <Link href={wotdHref} className="dt-daily__img-frame" aria-label={wotd.title}>
                <div className="dt-daily__img-wrap">
                  <Image src={wotdUrl} alt={wotd.title} fill priority unoptimized className="object-cover"
                    sizes="(max-width:768px) 80vw, 340px" style={{ objectPosition: "center top" }} />
                </div>
                <div className="dt-daily__img-corners" aria-hidden="true">
                  <span /><span /><span /><span />
                </div>
                {wotd.deviceType && (
                  <span className="dt-daily__badge">{wotd.deviceType.charAt(0) + wotd.deviceType.slice(1).toLowerCase()}</span>
                )}
                <div className="dt-daily__img-hover" aria-hidden="true">
                  <span>View Wallpaper</span>
                </div>
              </Link>

              {/* RIGHT — text block */}
              <div className="dt-daily__text">
                <p className="dt-daily__eyebrow">
                  <span className="dt-daily__dot" />
                  Tonight&rsquo;s Pick · {todayStr}
                </p>
                <h2 className="dt-daily__title">{wotd.title}</h2>
                {wotd.description && (
                  <div className="dt-daily__desc" dangerouslySetInnerHTML={{ __html: wotd.description }} />
                )}
                <div className="dt-daily__actions">
                  <Link href={wotdHref} className="dt-btn dt-btn--enter">
                    <span>Download This Wallpaper →</span>
                  </Link>
                  <Link href={`/${devicePath}`} className="dt-btn dt-btn--ghost dt-btn--sm">
                    <span>Browse {devicePath.charAt(0).toUpperCase() + devicePath.slice(1)} →</span>
                  </Link>
                </div>
              </div>
            </div>

            <style>{`
              .dt-daily {
                position: relative;
                overflow: hidden;
                padding: clamp(48px, 8vw, 96px) clamp(16px, 5vw, 80px);
              }
              .dt-daily__bg {
                position: absolute;
                inset: 0;
                z-index: 0;
              }
              .dt-daily__bg-veil {
                position: absolute;
                inset: 0;
                background: linear-gradient(
                  105deg,
                  rgba(6,4,2,0.97) 0%,
                  rgba(10,4,4,0.88) 40%,
                  rgba(20,6,6,0.65) 70%,
                  rgba(30,8,8,0.45) 100%
                );
                backdrop-filter: blur(0px);
              }
              .dt-daily__inner {
                position: relative;
                z-index: 1;
                display: grid;
                grid-template-columns: clamp(180px, 22vw, 320px) 1fr;
                gap: clamp(24px, 4vw, 72px);
                align-items: center;
                max-width: 1100px;
                margin: 0 auto;
              }
              .dt-daily__img-frame {
                position: relative;
                display: block;
                aspect-ratio: 9 / 16;
                width: 100%;
                border-radius: 20px;
                overflow: hidden;
                border: 1.5px solid rgba(192,0,26,0.35);
                box-shadow:
                  0 0 0 1px rgba(255,34,51,0.08),
                  0 8px 40px rgba(0,0,0,0.7),
                  0 0 60px rgba(192,0,26,0.12);
                flex-shrink: 0;
                text-decoration: none;
                transition: transform 0.3s ease, box-shadow 0.3s ease;
              }
              .dt-daily__img-frame:hover {
                transform: translateY(-4px) scale(1.01);
                box-shadow:
                  0 0 0 1px rgba(255,34,51,0.2),
                  0 16px 60px rgba(0,0,0,0.8),
                  0 0 80px rgba(192,0,26,0.25);
              }
              .dt-daily__img-wrap {
                position: absolute;
                inset: 0;
              }
              .dt-daily__img-hover {
                position: absolute;
                inset: 0;
                background: rgba(192,0,26,0.12);
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.25s ease;
                font-size: 0.85rem;
                letter-spacing: 0.15em;
                text-transform: uppercase;
                color: #fff;
                font-weight: 600;
              }
              .dt-daily__img-frame:hover .dt-daily__img-hover {
                opacity: 1;
              }
              .dt-daily__text {
                display: flex;
                flex-direction: column;
                gap: 1.25rem;
              }
              .dt-daily__title {
                font-size: clamp(1.6rem, 3.5vw, 2.8rem);
                line-height: 1.15;
                margin: 0;
              }
              .dt-daily__desc {
                font-size: clamp(0.9rem, 1.5vw, 1.05rem);
                line-height: 1.7;
                max-width: 540px;
                opacity: 0.85;
              }
              .dt-daily__actions {
                display: flex;
                gap: 0.75rem;
                flex-wrap: wrap;
                align-items: center;
                margin-top: 0.5rem;
              }
              @media (max-width: 680px) {
                .dt-daily__inner {
                  grid-template-columns: 1fr !important;
                }
                .dt-daily__img-frame {
                  max-width: 240px;
                  margin: 0 auto;
                }
                .dt-daily__bg-veil {
                  background: linear-gradient(180deg,rgba(6,4,2,0.92) 0%,rgba(6,4,2,0.82) 100%) !important;
                }
              }
            `}</style>
          </section>
        );
      })()}

      {/* ══════════════════════════════════════════════════════════
          SECTION 3 — MOBILE WALLPAPERS
      ══════════════════════════════════════════════════════════ */}
      <section className="dt-mobile">
        <div className="dt-section-head dt-section-head--center">
          <span className="dt-eyebrow">Pocket-Sized Darkness</span>
          <h2 className="dt-section-title">Mobile Wallpapers</h2>
          <p className="dt-section-sub">
            Your lock screen deserves something worth staring at.
          </p>
        </div>

        {/* Beautiful phone mockup row */}
        <div className="dt-phone-showcase">
          {[
            { src: "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/always-watching-wallpaper.webp", alt: "Always Watching", label: "Always Watching" },
            { src: "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/funny-lockscreen-wallpaper.jpeg", alt: "Funny Lockscreen", label: "Funny Lockscreen" },
            { src: "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/the-watching-estate-nocturnal-hill-wallpaper.webp", alt: "The Watching Estate", label: "The Watching Estate" },
            { src: "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/paper-cut-witch-red-backdrop-staff.jpeg", alt: "Paper Cut Witch", label: "Paper Cut Witch" },
            { src: "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/skeleton-brick-wall-green.jpeg", alt: "Skeleton Brick Wall", label: "Skeleton Brick" },
          ].map((phone, i) => (
            <div
              key={i}
              className={`dt-phone-card${i === 2 ? " dt-phone-card--hero" : ""}`}
              style={{ "--card-i": i } as React.CSSProperties}
            >
              {/* Ambient glow behind phone */}
              <div className="dt-phone-card__aura" aria-hidden="true" />

              {/* Phone shell */}
              <div className="dt-phone-card__shell">
                {/* Left buttons */}
                <div className="dt-phone-card__btn dt-phone-card__btn--vol1" aria-hidden="true" />
                <div className="dt-phone-card__btn dt-phone-card__btn--vol2" aria-hidden="true" />
                {/* Right button */}
                <div className="dt-phone-card__btn dt-phone-card__btn--power" aria-hidden="true" />

                {/* Screen area */}
                <div className="dt-phone-card__screen">
                  {/* Dynamic Island / notch */}
                  <div className="dt-phone-card__island" aria-hidden="true">
                    <span className="dt-phone-card__cam" />
                  </div>

                  {/* Wallpaper image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={phone.src}
                    alt={phone.alt}
                    className="dt-phone-card__img"
                    loading="lazy"
                  />


                  {/* Glass gloss */}
                  <div className="dt-phone-card__gloss" aria-hidden="true" />


                </div>

                {/* Home indicator */}
                <div className="dt-phone-card__indicator" aria-hidden="true" />
              </div>


            </div>
          ))}
        </div>

        <div className="dt-mobile__cta-row">
          <Link href="/iphone" className="dt-btn dt-btn--enter">Browse iPhone Wallpapers →</Link>
          <Link href="/android" className="dt-btn dt-btn--ghost">Android Wallpapers →</Link>
        </div>
      </section>

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
          SECTION 4 — COLLECTIONS
      ══════════════════════════════════════════════════════════ */}
      <section className="dt-obsessions">
        <div className="dt-section-head">
          <span className="dt-eyebrow">Choose Your Obsession</span>
          <h2 className="dt-section-title">What Haunts You?</h2>
        </div>

        {/* Always show the grid — use placeholders for empty collections */}
        <div className="dt-obs-grid">
          {obsessions.map((obs, i) => {
            const thumb = obs.thumbnail ? `${r2Base}/${obs.thumbnail}` : null;
            const hasImages = obs._count.images > 0;
            return (
              <Link
                key={obs.id}
                href={`/shop/${encodeURIComponent(obs.slug)}`}
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
                    <div className="dt-obs-card__placeholder" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "0.5rem" }}>
                      <span className="dt-obs-card__icon" style={{ fontSize: "2.5rem" }}>{obs.icon ?? "🖤"}</span>
                      <span style={{ fontSize: "0.7rem", letterSpacing: "0.15em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>Coming Soon</span>
                    </div>
                  )}
                  <div className="dt-obs-card__veil" />
                </div>
                <div className="dt-obs-card__glitch" aria-hidden="true" />
                <div className="dt-obs-card__drip" aria-hidden="true" />
                <div className="dt-obs-card__body">
                  <h3 className="dt-obs-card__title">{obs.title}</h3>
                  <span className="dt-obs-card__count">
                    {hasImages ? `${obs._count.images} wallpapers` : "Coming soon"}
                  </span>
                </div>
                <div className="dt-obs-card__glow" aria-hidden="true" />
                <span className="dt-obs-card__corner dt-obs-card__corner--tl">†</span>
                <span className="dt-obs-card__corner dt-obs-card__corner--br">†</span>
              </Link>
            );
          })}
        </div>

        <div className="dt-obsessions__footer">
          <Link href="/obsessions" className="dt-btn dt-btn--ghost">All Obsessions →</Link>
        </div>
      </section>

      <div className="hw-ad-row">
        <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} width={728} height={90} />
      </div>

      {/* ══════════════════════════════════════════════════════════
          SECTION 5 — ABOUT / STORY
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
            Some people wake up to sunshine and pastel clouds.<br />
            <em className="dt-manifesto__em">You wake up to a hallway that should not exist.</em>
          </blockquote>

          <p className="dt-manifesto__body">
            You are not here by accident. The algorithm tried to show you bright things.
            You kept scrolling. Something darker. Something quieter. Something that stays.
          </p>
          <p className="dt-manifesto__body">
            You arrived because your phone screen felt empty without a shadow in the corner.
            Because a blank background is just a blank background. But a haunted wallpaper?
            That is a conversation. That is a pause. That is the moment someone borrows your
            phone and says &ldquo;what is that?&rdquo; and you just smile.
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