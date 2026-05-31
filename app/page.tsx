import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import Image from "next/image";
import { db, getWallpaperOfTheDay, getPageContent } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import RecentlyViewed from "@/components/RecentlyViewed";
import WallpaperCardGrid from "@/components/WallpaperCardGrid";
import ProtectedImg from "@/components/ProtectedImg";
import ProtectionOverlay from "@/components/ProtectionOverlay";
import PremiumCountdown from "@/components/PremiumCountdown";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";
const OG_IMAGE = `${SITE_URL}/og-image.jpg`;
const CDN = "https://assets.hauntedwallpapers.com";

const getCachedWotd = () => {
  const todayKey = new Date().toISOString().slice(0, 10);
  return unstable_cache(
    () => getWallpaperOfTheDay(),
    [`wotd-${todayKey}`],
    { revalidate: 86400 },
  )();
};

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

export const revalidate = 3600;

export default async function Home() {
  let wotd:            Awaited<ReturnType<typeof getWallpaperOfTheDay>> = null;
  let totalImages      = 0;
  let obsessions:      Array<{ id: string; slug: string; title: string; thumbnail: string; tag: string | null; icon: string | null; bgClass: string | null; _count: { images: number } }> = [];
  let newThisWeek:     Array<{ id: string; slug: string; title: string; r2Key: string; deviceType: string | null; tags: string[] }> = [];
  let premiumThisWeek: Array<{ id: string; slug: string; title: string; r2Key: string; deviceType: string | null; tags: string[]; updatedAt: Date | null }> = [];

  try {
    [
      [wotd, totalImages],
      obsessions,
      [newThisWeek, premiumThisWeek],
    ] = await Promise.all([
      Promise.all([getCachedWotd(), db.image.count()]),
      db.collection.findMany({
        orderBy: [{ featured: "desc" }, { createdAt: "asc" }],
        where: { isAdult: false },
        take: 10,
        select: {
          id: true, slug: true, title: true, thumbnail: true,
          tag: true, icon: true, bgClass: true,
          _count: { select: { images: { where: { deviceType: "IPHONE" } } } },
        },
      }),
      Promise.all([
        db.image.findMany({
          where: {
            isAdult: false,
            tags: { has: "badge-new" },
            createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            NOT: { tags: { has: "badge-premium" } },
          },
          orderBy: { createdAt: "desc" },
          take: 6,
          select: { id: true, slug: true, title: true, r2Key: true, deviceType: true, tags: true },
        }),
        db.image.findMany({
          where: { tags: { has: "badge-premium" }, isAdult: false },
          orderBy: { createdAt: "desc" },
          take: 6,
          select: { id: true, slug: true, title: true, r2Key: true, deviceType: true, tags: true, updatedAt: true },
        }),
      ]),
    ]);
  } catch (err) {
    console.error("[home/page] DB error:", err);
  }

  function fmt(n: number) {
    if (n >= 1000) return `${Math.floor(n / 100) / 10}K+`;
    return `${Math.floor(n / 50) * 50}+`;
  }

  const countdownDate = new Date(Date.UTC(2025, 0, 1)).toISOString();

  const premiumItems = premiumThisWeek.map((img) => {
    const devicePath = img.deviceType === "IPHONE" ? "iphone" : img.deviceType === "ANDROID" ? "android" : "pc";
    return {
      id: img.id, slug: img.slug,
      title: img.title,
      src: getPublicUrl(img.r2Key),
      devicePath,
      isLocked: img.tags?.includes("badge-premium") ?? false,
      href: undefined,
      updatedAt: img.updatedAt ? new Date(img.updatedAt).toISOString() : null,
    };
  });

  return (
    <>
      {/* ── GLOBAL: kill every animation/glow/bounce/particle outside header ── */}
      <style>{`
        /* ─── NUCLEAR ANIMATION KILL — everything except header ─── */
        body *:not(header):not(header *) {
          animation: none !important;
          transition: none !important;
        }
        /* Restore safe hover transitions only on interactive elements */
        body a:not(header a):hover,
        body button:not(header button):hover {
          transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease, opacity 0.2s ease !important;
        }
        /* Kill all glows, box-shadows on non-header */
        body *:not(header):not(header *) {
          box-shadow: none !important;
          text-shadow: none !important;
        }
        /* Kill particles */
        .wotd-particle,
        .hw-new-particle,
        .dt-fog,
        .dt-gate__crack,
        .hw-nav__drip,
        .wotd-img-frame__eye,
        .wotd-img-frame__scanlines,
        .dt-obs-card__glitch,
        .dt-obs-card__drip,
        .dt-obs-card__glow,
        .hw-new-particles {
          display: none !important;
        }
        /* Kill scroll fade — everything visible immediately */
        .hw-fade-up {
          opacity: 1 !important;
          transform: none !important;
          transition: none !important;
        }
        /* Kill kit card premium badge glow */
        .hw-kit-card__premium { animation: none !important; }

        /* ─── COLOR WORLD DOTS ─── */
        #hw-color-worlds button {
          transition: transform 0.18s ease, box-shadow 0.18s ease !important;
        }
        #hw-color-worlds button:hover {
          transform: scale(1.2) !important;
        }

        /* ─── HERO layout ─── */
        .hw-hero-gate-override {
          padding-top: 8px !important;
          padding-bottom: 0 !important;
          overflow: visible !important;
          background: #000 !important;
        }
        .hw-hero-split { display: grid; grid-template-columns: 1fr; background: #000; }

        /* Mobile: show hero image — small thumbnail, no LCP penalty */
        .hw-hero-img {
          display: block;
          width: 100%;
          height: 180px;
          object-fit: cover;
          object-position: center top;
          pointer-events: none;
          user-select: none;
          -webkit-user-select: none;
          -webkit-user-drag: none;
          mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
          -webkit-mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
        }

        @media (min-width: 860px) {
          .hw-hero-split {
            grid-template-columns: 420px 1fr !important;
            align-items: stretch !important;
            min-height: 580px;
          }
          .hw-hero-img {
            width: 100%;
            height: 100%;
            mask-image: linear-gradient(to right, transparent 0%, black 12%);
            -webkit-mask-image: linear-gradient(to right, transparent 0%, black 12%);
          }
        }

        @media (max-width: 859px) { .hw-hero-vault-text { display: none !important; } }

        /* ─── DEFIANT MANIFESTO ─── */
        .hw-defiant-wrap {
          position: relative; width: 100%; overflow: hidden;
          border: 1px solid rgba(224,0,31,0.5); background: #080510;
          aspect-ratio: 16/9; max-width: 900px;
        }
        @media (max-width: 640px) {
          .hw-defiant-wrap  { aspect-ratio: unset; height: 130px; max-width: unset; }
          .hw-defiant-title { font-size: clamp(0.8rem,5vw,1.1rem) !important; }
          .hw-defiant-body  { display: none !important; }
        }

        /* ─── OBSESSION GRID ─── */
        @media (max-width: 767px) {
          .hw-desktop-section-mobile-hidden { display: none !important; }
          .dt-obs-grid { grid-template-columns: repeat(4,1fr) !important; gap: 4px !important; }
          .dt-obs-card__title { font-size: 0.44rem !important; padding: 3px 4px !important; letter-spacing: 0.03em !important; }
        }
        @media (min-width: 768px) and (max-width: 1199px) {
          .dt-obs-grid { grid-template-columns: repeat(7,1fr) !important; gap: 5px !important; }
          .dt-obs-card__title { font-size: 0.42rem !important; padding: 3px 4px !important; }
        }
        @media (min-width: 1200px) {
          .dt-obs-grid { grid-template-columns: repeat(10,1fr) !important; gap: 6px !important; }
          .dt-obs-card__title { font-size: 0.44rem !important; padding: 3px 5px !important; }
        }

        /* ─── KIT CARDS — no animation, clean hover only ─── */
        .hw-kit-card--anim {
          opacity: 1 !important;
          transform: none !important;
          animation: none !important;
        }
        .hw-kit-card:hover {
          border-color: rgba(var(--kit-accent,224,0,31),0.5) !important;
          transform: translateY(-2px) !important;
          transition: border-color 0.2s ease, transform 0.2s ease !important;
        }
        .hw-kit-card__thumb::after { display: none !important; }
        .hw-kit-card::before { display: none !important; }
        .hw-kit-card__img { transition: none !important; }

        /* ─── WOTD — static, no eye pulse, no particles ─── */
        .wotd-section::before { display: none !important; }
        .wotd-img-frame__corners span { border-color: rgba(224,0,31,0.5); }
        .wotd-img-frame:hover { transform: translateY(-3px) !important; transition: transform 0.2s ease !important; }
        .wotd-color-dot:hover { transform: scale(1.3) !important; transition: transform 0.2s ease !important; }

        /* ─── RecentlyViewed — no animation ─── */
        [class*="recently"] *, [class*="RecentlyViewed"] *, .hw-recently-viewed * {
          animation: none !important;
          transition: none !important;
        }
      `}</style>



      {/* ══════════════════════════════════════════════════════════
          HERO — renders immediately
      ══════════════════════════════════════════════════════════ */}
      <section className="dt-gate dt-gate--collage hw-hero-gate-override" style={{ padding: "0", minHeight: "unset", background: "#000" }}>
        <div className="hw-hero-split" style={{
          display: "grid", gridTemplateColumns: "1fr",
          alignItems: "center", width: "100%", maxWidth: "100%", overflow: "visible",
          background: "#000",
        }}>
          {/* LEFT — text */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", padding: "20px 24px 20px", background: "#000" }}>
            <span className="dt-gate__eyebrow" style={{ fontSize: "0.75rem", letterSpacing: "0.25em" }}>You have arrived in</span>

            <h1 style={{
              position: "absolute", width: "1px", height: "1px", padding: 0,
              margin: "-1px", overflow: "hidden", clip: "rect(0,0,0,0)",
              whiteSpace: "nowrap", border: 0,
            }}>
              Haunted Wallpapers — Free Dark Fantasy &amp; Horror Wallpapers for iPhone, Android and PC
            </h1>

            <div className="dt-gate__collection-badge" style={{ marginBottom: "0" }}>
              <span className="dt-gate__collection-num" style={{ fontSize: "clamp(2rem,5vw,3rem)" }}>{fmt(totalImages)}</span>
              <span className="dt-gate__collection-label">wallpapers &amp; growing</span>
            </div>

            <p className="dt-gate__sub" style={{ fontSize: "clamp(0.95rem,2vw,1.1rem)", lineHeight: "1.65", maxWidth: "480px", margin: 0 }}>
              Where every wallpaper has a secret.
            </p>

            <p className="hw-hero-vault-text" style={{
              fontSize: "1.05rem", lineHeight: "1.75", maxWidth: "460px",
              fontStyle: "italic", borderLeft: "2px solid #8b0000", paddingLeft: "1rem", margin: 0,
            }}>
              Every 24 hours, a single vision is pulled from the deepest level of the vault. A unique horror wallpaper surfaced just for tonight. Download this 4K pick before the clock resets and a new nightmare takes its place.
            </p>

            <p style={{
              fontFamily: "var(--font-space, monospace)", fontSize: "0.65rem",
              letterSpacing: "0.22em", textTransform: "uppercase", color: "#e0001f",
              margin: 0, display: "flex", alignItems: "center", gap: "10px",
            }}>
              <span style={{
                display: "inline-block", width: "6px", height: "6px", borderRadius: "50%",
                background: "#e0001f", flexShrink: 0,
              }} />
              New drops added every day
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <Link prefetch={false} href="/all" className="dt-btn dt-btn--enter" style={{ alignSelf: "flex-start" }}>
                <span>Browse All Wallpapers →</span>
              </Link>
              <span style={{
                fontFamily: "var(--font-space, monospace)", fontSize: "0.52rem",
                letterSpacing: "0.18em", textTransform: "uppercase",
                color: "rgba(224,224,248,0.55)", paddingLeft: "2px",
              }}>
                Start Scrolling — If You Dare
              </span>
            </div>

            {/* ── COLOR WORLD — navigate to dedicated world page ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
              <span style={{
                fontFamily: "var(--font-space, monospace)", fontSize: "0.56rem",
                letterSpacing: "0.24em", textTransform: "uppercase",
                color: "rgba(200,180,255,0.75)",
              }}>Enter a World</span>
              <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                {[
                  { bg: "#e0001f", world: "red",    label: "Crimson", bd: "#e0001f" },
                  { bg: "#7c3aed", world: "purple", label: "Void",    bd: "#7c3aed" },
                  { bg: "#16a34a", world: "green",  label: "Haunted", bd: "#16a34a" },
                  { bg: "#1d4ed8", world: "blue",   label: "Deep",    bd: "#1d4ed8" },
                  { bg: "#1a1a1a", world: "black",  label: "Shadow",  bd: "rgba(255,255,255,0.3)" },
                ].map(({ bg, world, label, bd }) => (
                  <a
                    key={world}
                    href={`/world/${world}`}
                    aria-label={`Enter ${label} world`}
                    title={label}
                    style={{
                      width: "30px", height: "30px", borderRadius: "50%",
                      background: bg,
                      border: `2px solid ${bd}`,
                      flexShrink: 0,
                      display: "inline-block",
                      textDecoration: "none",
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="dt-coffin-row dt-coffin-row--compact">
              <div className="dt-coffin"><span className="dt-coffin__num">{fmt(totalImages)}</span><span className="dt-coffin__label">The Archive</span></div>
              <div className="dt-coffin dt-coffin--accent"><span className="dt-coffin__num">4K</span><span className="dt-coffin__label">Retina Optimized</span></div>
              <div className="dt-coffin"><span className="dt-coffin__num">Free</span><span className="dt-coffin__label">Always</span></div>
              <div className="dt-coffin dt-coffin--gold"><span className="dt-coffin__num">No Sign‑Up</span><span className="dt-coffin__label">Pure Privacy</span></div>
            </div>
          </div>

          {/* HERO IMAGE — desktop only, hidden on mobile to kill empty-block LCP */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${CDN}/extras/the-haunted-wallpapers-hero-section-image-mobile-dark-wallpapers-thumbnail.avif`}
            alt="Haunted Wallpapers Hero"
            className="hw-hero-img"
            loading="eager"
            fetchPriority="high"
            decoding="sync"
            width="1200"
            height="800"
          />
        </div>
      </section>

      {/* NEW THIS WEEK */}
      {newThisWeek.length > 0 && (
        
          <section style={{ padding: "clamp(32px,5vw,64px) clamp(16px,5vw,72px)", background: "#07050f", position: "relative" }}>
            <div className="dt-section-head dt-section-head--center" style={{ marginBottom: "clamp(24px,4vw,40px)" }}>
              <span className="dt-eyebrow" style={{ color: "#4caf50" }}>Fresh From The Vault</span>
              <h2 className="dt-section-title">New This Week</h2>
              <p className="dt-section-sub" style={{ maxWidth: "480px", margin: "0 auto" }}>
                Just surfaced. These disappear from this section in 48 hours.
              </p>
            </div>
            <WallpaperCardGrid
              accentRgb="76,175,80" badge="NEW" badgeColor="#4caf50"
              items={newThisWeek.map(img => ({
                id: img.id, slug: img.slug, title: img.title,
                src: getPublicUrl(img.r2Key),
                devicePath: img.deviceType === "IPHONE" ? "iphone" : img.deviceType === "ANDROID" ? "android" : "pc",
              }))}
            />
          </section>
        
      )}

      {/* PREMIUM THIS WEEK */}
      {premiumThisWeek.length > 0 && (
        
          <section style={{ padding: "clamp(32px,5vw,64px) clamp(16px,5vw,72px)", background: "#0a0810", position: "relative" }}>
            <div className="dt-section-head dt-section-head--center" style={{ marginBottom: "clamp(24px,4vw,40px)" }}>
              <span className="dt-eyebrow" style={{ color: "#c9a84c" }}>Hand-Picked Excellence</span>
              <h2 className="dt-section-title">Premium This Week</h2>
              <p className="dt-section-sub" style={{ maxWidth: "480px", margin: "0 auto" }}>
                The finest pieces from the archive. Surfaces for 24 hours, then sealed away.
              </p>
              <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center" }}>
                <PremiumCountdown updatedAt={countdownDate} />
              </div>
            </div>
            <WallpaperCardGrid
              accentRgb="201,168,76" badge="PREMIUM" badgeColor="#c9a84c"
              items={premiumItems}
            />
          </section>
        
      )}

      {/* WOTD */}
      {wotd && (() => {
        const devicePath = wotd.deviceType === "IPHONE" ? "iphone" : wotd.deviceType === "ANDROID" ? "android" : "pc";
        const wotdUrl    = getPublicUrl(wotd.r2Key);
        const wotdHref   = `/${devicePath}/${wotd.slug}`;
        return (
          
            <section className="wotd-section" style={{ position: "relative", padding: "clamp(24px,4vw,48px) clamp(16px,5vw,72px)", background: "#080508" }}>
              <div className="wotd-header" style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "clamp(12px,2vw,24px)", maxWidth: "1100px", marginLeft: "auto", marginRight: "auto" }}>
                <span style={{ flex: 1, height: "1px", background: "linear-gradient(90deg,transparent,rgba(224,0,31,0.5),transparent)" }} />
                <span style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.72rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#e0001f", fontFamily: "var(--font-space,monospace)" }}>
                  <span style={{ display: "inline-block", width: "5px", height: "5px", borderRadius: "50%", background: "#e0001f" }} />
                  Tonight&rsquo;s Pick
                  <span style={{ display: "inline-block", width: "5px", height: "5px", borderRadius: "50%", background: "#e0001f" }} />
                </span>
                <span style={{ flex: 1, height: "1px", background: "linear-gradient(90deg,transparent,rgba(224,0,31,0.5),transparent)" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
                <Link prefetch={false} href={wotdHref} className="wotd-img-frame" aria-label={wotd.title} style={{ position: "relative", display: "block", aspectRatio: "9/16", width: "clamp(160px,22vw,280px)", borderRadius: "16px", overflow: "hidden", border: "1.5px solid rgba(224,0,31,0.4)", textDecoration: "none" }}>
                  <div style={{ position: "absolute", inset: 0 }}>
                    <Image src={wotdUrl} alt={wotd.title} fill loading="lazy" className="object-cover"
                      unoptimized sizes="(max-width:480px) 38vw,(max-width:768px) 40vw,280px"
                      style={{ objectPosition: "center top" }} />
                  </div>
                  <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }} className="wotd-img-frame__corners" aria-hidden="true"><span /><span /><span /><span /></div>
                  {wotd.deviceType && (
                    <span style={{ position: "absolute", top: "12px", left: "12px", fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", padding: "3px 8px", background: "rgba(0,0,0,0.75)", border: "1px solid rgba(224,0,31,0.4)", color: "#e0001f", borderRadius: "2px", fontFamily: "var(--font-space,monospace)" }}>
                      {wotd.deviceType.charAt(0) + wotd.deviceType.slice(1).toLowerCase()}
                    </span>
                  )}
                </Link>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", textAlign: "center" }}>
                <h2 style={{ fontSize: "clamp(1.2rem,2.2vw,1.9rem)", lineHeight: 1.12, margin: 0, color: "#f0e8d8", fontFamily: "var(--font-cinzel,serif)", letterSpacing: "0.02em" }}>{wotd.title}</h2>
              </div>
              <style>{`
                .wotd-img-frame__corners{position:absolute;inset:0;pointer-events:none}
                .wotd-img-frame__corners span{position:absolute;width:16px;height:16px;border-color:rgba(224,0,31,0.6);border-style:solid}
                .wotd-img-frame__corners span:nth-child(1){top:8px;left:8px;border-width:1.5px 0 0 1.5px}
                .wotd-img-frame__corners span:nth-child(2){top:8px;right:8px;border-width:1.5px 1.5px 0 0}
                .wotd-img-frame__corners span:nth-child(3){bottom:8px;left:8px;border-width:0 0 1.5px 1.5px}
                .wotd-img-frame__corners span:nth-child(4){bottom:8px;right:8px;border-width:0 1.5px 1.5px 0}
                @media(max-width:680px){
                  .wotd-img-frame{width:clamp(100px,38vw,150px) !important}
                }
              `}</style>
            </section>
          
        );
      })()}

      {/* ── MOBILE WALLPAPERS — hidden ── */}
      <div style={{ display: "none" }} aria-hidden="true">
        
          <section className="dt-mobile">
            <div className="dt-section-head dt-section-head--center">
              <span className="dt-eyebrow">Pocket-Sized Darkness</span>
              <h2 className="dt-section-title">Mobile Wallpapers</h2>
              <p className="dt-section-sub">Your lock screen deserves something worth staring at.</p>
            </div>
            <div className="dt-phone-showcase">
              {[
                { src: `${CDN}/12/always-watching-wallpaper.webp`,                                               alt: "Always Watching",  label: "Always Watching"  },
                { src: `${CDN}/12/funny-lockscreen-wallpaper.webp`,                                              alt: "Funny Lockscreen",  label: "Funny Lockscreen" },
                { src: `${CDN}/12/vampire-man-and-woman-couple-dance-under-the-moon-wallpaper.webp`,             alt: "Vampire Couple",    label: "Vampire Dance"    },
                { src: `${CDN}/12/paper-cut-witch-red-backdrop-staff.webp`,                                      alt: "Paper Cut Witch",   label: "Paper Cut Witch"  },
                { src: `${CDN}/12/hip-hop-haunted-skeleton-phone-wallpaper.webp`,                                alt: "Hip Hop Skeleton",  label: "Hip Hop Skeleton" },
              ].map((phone, i) => (
                <div key={i} className={`dt-phone-card${i === 2 ? " dt-phone-card--hero" : ""}`} style={{ "--card-i": i } as React.CSSProperties}>
                  <div className="dt-phone-card__aura" aria-hidden="true" />
                  <div className="dt-phone-card__shell">
                    <div className="dt-phone-card__btn dt-phone-card__btn--vol1" aria-hidden="true" />
                    <div className="dt-phone-card__btn dt-phone-card__btn--vol2" aria-hidden="true" />
                    <div className="dt-phone-card__btn dt-phone-card__btn--power" aria-hidden="true" />
                    <div className="dt-phone-card__screen">
                      <div className="dt-phone-card__island" aria-hidden="true"><span className="dt-phone-card__cam" /></div>
                      <ProtectedImg src={phone.src} alt={phone.alt} className="dt-phone-card__img" loading="lazy" />
                      <ProtectionOverlay />
                      <div className="dt-phone-card__gloss" aria-hidden="true" />
                    </div>
                    <div className="dt-phone-card__indicator" aria-hidden="true" />
                  </div>
                </div>
              ))}
            </div>
            <div className="dt-mobile__cta-row">
              <Link prefetch={false} href="/iphone" className="dt-btn dt-btn--enter">Browse iPhone Wallpapers →</Link>
              <Link prefetch={false} href="/android" className="dt-btn dt-btn--ghost">Android Wallpapers →</Link>
            </div>
          </section>
        
      </div>

      {/* ── DESKTOP WALLPAPERS — hidden ── */}
      <div style={{ display: "none" }} aria-hidden="true">
        
          <section className="dt-desktop">
            <div className="dt-section-head dt-section-head--center">
              <span className="dt-eyebrow">The Haunted Square</span>
              <h2 className="dt-section-title">Desktop Wallpapers</h2>
              <p className="dt-section-sub">Your workspace, transformed with stunning atmospheric art.</p>
            </div>
            <div className="dt-monitor-wrap">
              <div className="dt-monitor">
                <div className="dt-monitor__bezel">
                  <span className="dt-monitor__cam" />
                  <div className="dt-monitor__screen">
                    <ProtectedImg src={`${CDN}/monster-flower-offering-pc.webp`} alt="Monster Flower Offering — PC wallpaper 16:9" className="dt-monitor__img" />
                    <ProtectionOverlay />
                    <div className="dt-monitor__scanlines" aria-hidden="true" />
                    <div className="dt-monitor__glitch" aria-hidden="true" />
                  </div>
                </div>
                <div className="dt-monitor__neck" />
                <div className="dt-monitor__foot" />
              </div>
              <div className="dt-monitor__tag dt-monitor__tag--tl"><span>16 : 9</span><span>Full HD</span></div>
              <div className="dt-monitor__tag dt-monitor__tag--tr"><span>PC</span><span>Desktop</span></div>
            </div>
            <div className="dt-desktop__cta-row">
              <Link prefetch={false} href="/pc" className="dt-btn dt-btn--enter">Browse PC Wallpapers →</Link>
            </div>
          </section>
        
      </div>

      {/* MATCHING KITS */}
      
        <section style={{ padding: "clamp(40px,6vw,72px) clamp(16px,5vw,72px)", background: "#07050f", position: "relative" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative" }}>
            <div style={{ marginBottom: "clamp(24px,4vw,40px)" }}>
              <span style={{ display: "block", fontFamily: "var(--font-space,monospace)", fontSize: "0.58rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "#e0001f", marginBottom: "10px" }}>Full Digital Identity</span>
              <h2 style={{ fontFamily: "var(--font-cinzel,serif)", fontSize: "clamp(1.4rem,3vw,2.2rem)", fontWeight: 700, color: "#f0e8d8", margin: "0 0 10px", letterSpacing: "0.04em" }}>Matching Setup Kits</h2>
              <p style={{ fontFamily: "var(--font-cormorant,serif)", fontSize: "clamp(0.95rem,1.5vw,1.1rem)", lineHeight: 1.65, color: "rgba(224,224,248,0.6)", margin: 0, maxWidth: "520px" }}>One dark aesthetic across every screen. Phone, watch, desktop, and avatar — unified.</p>
            </div>
            <div className="hw-kits-row3">
              {[
                { href: "/sets/ghost-pitch",          num: "03", title: "The Ghost Pitch",      sub: "Dark Soccer Setup Kit",   tag: "Sports", img: `${CDN}/12/sets_The%20Ghost%20Pitch_%20A%20Matching%20Dark%20Soccer%20Setup%20Kit_Haunted_soccer_stadium_midnight_soccer-kit.webp`,                                                                                                     alt: "Ghost Pitch haunted soccer stadium dark horror matching wallpaper set",                                                     accent: "232,124,30" },
                { href: "/sets/cyberpunk-gaming-hero", num: "05", title: "Cyberpunk Gaming Hero", sub: "Neon Horror Gaming Kit",  tag: "Gaming", img: `${CDN}/sets/Cyberpunk%20Gaming%20Hero%20Matching%20Wallpaper%20Set/terminal-paradox-cyber-neon-phantom-pointing-homescreen-mobile-thumbnail-cover.webp`,                                                                          alt: "Terminal Paradox 4K cyberpunk gaming hero — OLED neon horror matching wallpaper set for PC phone and smartwatch",           accent: "139,92,246", premium: true },
                { href: "/sets/crimson-sovereign",    num: "04", title: "The Crimson Sovereign", sub: "Dark Fantasy Gaming Kit", tag: "Gaming", img: `${CDN}/sets/The%20Crimson%20Sovereign%20%7C%20Dark%20Fantasy%20Gaming%20Character%20Matching%20Setup%20Kit/ark-fantasy-gaming-character-4k-wallpaper-pc-setup-aesthetic.webp`,                                                      alt: "Crimson Sovereign dark fantasy gaming character 4K wallpaper PC setup aesthetic",                                           accent: "224,0,31",  premium: true },
              ].map((kit, i) => (
                <a key={kit.href} href={kit.href} className="hw-kit-card hw-kit-card--sm hw-kit-card--anim" style={{ "--kit-accent": kit.accent, "--kit-i": i } as React.CSSProperties}>
                  <div className="hw-kit-card__thumb">
                    <Image src={kit.img} alt={kit.alt} fill loading="lazy" unoptimized sizes="(max-width:540px) 54vw,(max-width:1024px) 33vw,360px" style={{ objectFit: "cover" }} className="hw-kit-card__img" />
                    <div className="hw-kit-card__overlay" />
                    <span className="hw-kit-card__num">Kit {kit.num}</span>
                    {(kit as { premium?: boolean }).premium && <span className="hw-kit-card__premium">Premium</span>}
                    {(kit as { tag?: string }).tag && <span className="hw-kit-card__tag">{(kit as { tag?: string }).tag}</span>}
                  </div>
                  <div className="hw-kit-card__body">
                    <p className="hw-kit-card__sub">{kit.sub}</p>
                    <h3 className="hw-kit-card__title">{kit.title}</h3>
                    <span className="hw-kit-card__cta">View Kit →</span>
                  </div>
                </a>
              ))}
            </div>
            <div style={{ marginTop: "clamp(20px,3vw,32px)", textAlign: "center" }}>
              <a href="/sets" style={{ fontFamily: "var(--font-space,monospace)", fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(224,224,248,0.75)", textDecoration: "none" }}>Browse All Kits →</a>
            </div>
          </div>
          <style>{`
            .hw-kits-row3{display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(10px,1.8vw,18px)}
            @media(max-width:900px) and (min-width:541px){.hw-kits-row3{grid-template-columns:repeat(2,1fr)}}
            @media(max-width:540px){
              .hw-kits-row3{display:flex;flex-direction:row;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;gap:10px;padding-bottom:10px;scrollbar-width:none}
              .hw-kits-row3::-webkit-scrollbar{display:none}
              .hw-kits-row3 .hw-kit-card{flex:0 0 54vw;max-width:220px;scroll-snap-align:start}
              .hw-kit-card__body{padding:10px 10px 12px !important;gap:4px !important}
              .hw-kit-card__title{font-size:0.8rem !important}
              .hw-kit-card__sub,.hw-kit-card__cta{font-size:0.46rem !important}
            }
            .hw-kit-card--sm .hw-kit-card__title{font-size:clamp(0.85rem,1.5vw,1.05rem)}
            .hw-kit-card__tag{position:absolute;bottom:10px;right:10px;font-family:var(--font-space,monospace);font-size:0.5rem;letter-spacing:0.16em;text-transform:uppercase;color:#fff;background:rgba(0,0,0,0.8);border:1px solid rgba(255,255,255,0.3);padding:4px 10px;border-radius:2px;font-weight:700}
            .hw-kit-card{display:flex;flex-direction:column;text-decoration:none;color:inherit;border:1px solid rgba(var(--kit-accent,224,0,31),0.18);background:rgba(255,255,255,0.02);overflow:hidden;cursor:pointer;position:relative}
            .hw-kit-card__thumb{position:relative;aspect-ratio:16/9;overflow:hidden;background:#08060e}
            .hw-kit-card__img{width:100%;height:100%;object-fit:cover;display:block}
            .hw-kit-card__overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(7,5,15,0.85) 0%,transparent 55%);pointer-events:none}
            .hw-kit-card__num{position:absolute;top:10px;left:12px;font-family:var(--font-space,monospace);font-size:0.5rem;letter-spacing:0.2em;text-transform:uppercase;color:rgb(var(--kit-accent,224,0,31));background:rgba(0,0,0,0.7);border:1px solid rgba(var(--kit-accent,224,0,31),0.4);padding:2px 8px;border-radius:2px}
            .hw-kit-card__premium{position:absolute;top:10px;right:10px;font-family:var(--font-space,monospace);font-size:0.46rem;letter-spacing:0.16em;text-transform:uppercase;color:#ff6a00;background:rgba(255,106,0,0.12);border:1px solid rgba(255,106,0,0.42);padding:2px 7px;border-radius:2px;font-weight:700}
            .hw-kit-card__body{padding:clamp(14px,2vw,20px);display:flex;flex-direction:column;gap:8px;background:rgba(0,0,0,0.6);border-top:1px solid rgba(var(--kit-accent,224,0,31),0.25)}
            .hw-kit-card__sub{font-family:var(--font-space,monospace);font-size:0.52rem;letter-spacing:0.18em;text-transform:uppercase;color:rgb(var(--kit-accent,224,0,31));margin:0}
            .hw-kit-card__title{font-family:var(--font-cinzel,serif);font-size:clamp(1rem,1.5vw,1.2rem);font-weight:700;color:#f0e8d8;margin:0;letter-spacing:0.04em}
            .hw-kit-card__cta{font-family:var(--font-space,monospace);font-size:0.58rem;letter-spacing:0.14em;text-transform:uppercase;color:rgb(var(--kit-accent,224,0,31));display:flex;align-items:center;gap:6px}
          `}</style>
        </section>
      

      {/* COLLECTIONS */}
      
        <section className="dt-obsessions">
          {obsessions.some(o => o.slug === "the-defiant-manifesto") && (() => {
            const defiant = obsessions.find(o => o.slug === "the-defiant-manifesto")!;
            return (
              <div style={{ marginBottom: "2px" }}>
                <Link prefetch={false} href={`/obsessions/${encodeURIComponent(defiant.slug)}`}
                  style={{ display: "block", position: "relative", textDecoration: "none", overflow: "hidden" }}>
                  <div className="hw-defiant-wrap">
                    <Image
                      unoptimized
                      src={`${CDN}/extras/the-defiant-crew-team-members-collection.webp`}
                      alt="The Defiant Manifesto — Crew Collection"
                      fill loading="lazy" className="object-cover"
                      sizes="(max-width:640px) 200px, 800px"
                      style={{ objectFit: "cover", objectPosition: "center center" }}
                      quality={50}
                    />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.97) 0%,rgba(0,0,0,0.75) 40%,rgba(0,0,0,0.2) 70%,transparent 100%)", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", top: "12px", right: "12px" }}>
                      <span style={{ fontFamily: "var(--font-space,monospace)", fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#ff6a00", background: "rgba(255,106,0,0.12)", border: "1px solid rgba(255,106,0,0.5)", padding: "3px 8px", borderRadius: "2px", fontWeight: 700 }}>⚡ Limited</span>
                    </div>
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "clamp(14px,3vw,40px)" }}>
                      <span style={{ display: "block", fontFamily: "var(--font-space,monospace)", fontSize: "0.52rem", letterSpacing: "0.26em", textTransform: "uppercase", color: "#e0001f", marginBottom: "8px" }}>Featured Collection</span>
                      <h3 className="hw-defiant-title" style={{ fontFamily: "var(--font-cinzel,serif)", fontSize: "clamp(1.3rem,4vw,3rem)", fontWeight: 700, color: "#f0e8d8", margin: "0 0 8px", letterSpacing: "0.04em", lineHeight: 1.1 }}>
                        {defiant.title}
                      </h3>
                      <p className="hw-defiant-body" style={{ fontFamily: "var(--font-cormorant,serif)", fontSize: "clamp(0.82rem,1.4vw,1rem)", color: "rgba(224,224,248,0.6)", margin: "0 0 14px", maxWidth: "500px", lineHeight: 1.55 }}>
                        The art they tried to ban. The skeleton that went viral on every platform — then got rejected. Now it lives here.
                      </p>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-space,monospace)", fontSize: "0.58rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#fff", background: "#e0001f", padding: "8px 16px", borderRadius: "2px" }}>
                        Enter The Vault →
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })()}

          <div className="dt-obs-grid">
            {obsessions.filter(o => o.slug !== "the-defiant-manifesto").map((obs, i) => (
              <Link prefetch={false} key={obs.id} href={`/obsessions/${encodeURIComponent(obs.slug)}`}
                className="dt-obs-card" style={{ "--delay": `${i * 0.07}s` } as React.CSSProperties}>
                <div className="dt-obs-card__bg"><div className="dt-obs-card__veil" /></div>
                <div className="dt-obs-card__body"><h3 className="dt-obs-card__title">{obs.title}</h3></div>
                <span className="dt-obs-card__corner dt-obs-card__corner--tl">†</span>
                <span className="dt-obs-card__corner dt-obs-card__corner--br">†</span>
              </Link>
            ))}
          </div>

          <div className="dt-obsessions__footer">
            <Link prefetch={false} href="/obsessions" className="dt-btn dt-btn--ghost">All Obsessions →</Link>
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
            url: `${SITE_URL}/obsessions/${o.slug}`, name: o.title,
          })),
        })
      }} />
    </>
  );
}