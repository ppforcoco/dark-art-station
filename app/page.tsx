import type { Metadata } from "next";
import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import Image from "next/image";
import { db, getWallpaperOfTheDay, getPageContent } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import RecentlyViewed from "@/components/RecentlyViewed";
import HorrorFact from "@/components/HorrorFact";
import WallpaperCardGrid from "@/components/WallpaperCardGrid";
import ProtectedImg from "@/components/ProtectedImg";
import ProtectionOverlay from "@/components/ProtectionOverlay";
import PremiumCountdown from "@/components/PremiumCountdown";
import LazySection from "@/components/LazySection";

// REMOVED: export const dynamic = "force-dynamic";
// Now uses ISR — static shell served from CDN edge, revalidates every hour.
// Wrap any truly dynamic slots in <Suspense> below.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";
const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

// ── WOTD cached by date — one image per day, never changes on redeploy ───────
const getCachedWotd = () => {
  const todayKey = new Date().toISOString().slice(0, 10);
  return unstable_cache(
    () => getWallpaperOfTheDay(),
    [`wotd-${todayKey}`],
    { revalidate: 86400 },
  )();
};

// ── Trending cached 1 hour — groupBy is expensive ────────────────────────────
const getCachedTrending = unstable_cache(
  async () => {
    const topDownloads = await db.download.groupBy({
      by: ["imageId"],
      where: { imageId: { not: null } },
      _count: { imageId: true },
      orderBy: { _count: { imageId: "desc" } },
      take: 20,
    });
    const topImageIds = topDownloads.map(d => d.imageId).filter(Boolean) as string[];
    if (topImageIds.length === 0) return [];
    const trendingImages = await db.image.findMany({
      where: { id: { in: topImageIds }, isAdult: false, deviceType: { in: ["IPHONE", "ANDROID"] } },
      select: { id: true, slug: true, title: true, r2Key: true, deviceType: true, tags: true,
        _count: { select: { downloads: true } } },
    });
    return topImageIds
      .map(id => trendingImages.find(img => img.id === id))
      .filter(Boolean)
      .slice(0, 6) as Array<{ id: string; slug: string; title: string; r2Key: string; deviceType: string | null; tags: string[]; _count: { downloads: number } }>;
  },
  ["trending-wallpapers"],
  { revalidate: 3600 },
);

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

// ISR: page revalidates every hour. Static shell ships instantly from CDN.
export const revalidate = 3600;

export default async function Home() {
  let wotd:           Awaited<ReturnType<typeof getWallpaperOfTheDay>> = null;
  let totalImages     = 0;
  let obsessions:     Array<{ id: string; slug: string; title: string; thumbnail: string; tag: string | null; icon: string | null; bgClass: string | null; _count: { images: number } }> = [];
  let newThisWeek:    Array<{ id: string; slug: string; title: string; r2Key: string; deviceType: string | null; tags: string[] }> = [];
  let premiumThisWeek: Array<{ id: string; slug: string; title: string; r2Key: string; deviceType: string | null; tags: string[]; updatedAt: Date | null }> = [];
  let trendingThisWeek: Array<{ id: string; slug: string; title: string; r2Key: string; deviceType: string | null; tags: string[]; _count: { downloads: number } }> = [];

  // ── All DB queries fired in parallel — single round-trip to the DB ──────────
  try {
    [
      [wotd, totalImages],
      obsessions,
      [newThisWeek, premiumThisWeek],
      trendingThisWeek,
    ] = await Promise.all([
      Promise.all([
        getCachedWotd(),
        db.image.count(),
      ]),
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
      getCachedTrending(),
    ]);
  } catch (err) {
    console.error("[home/page] DB error:", err);
  }

  function fmt(n: number) {
    if (n >= 1000) return `${Math.floor(n / 100) / 10}K+`;
    return `${Math.floor(n / 50) * 50}+`;
  }

  const r2Base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";

  // Hero phone data
  const heroPhones = [
    { src: "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/haunted-cat-grin-dark-iphone-android.webp",              alt: "Creepy Cat",     featured: false, edgePhone: true  },
    { src: "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/wallpapers/shadows-have-eyes-android.webp",             alt: "Shadow Eyes",    featured: false, edgePhone: false },
    { src: "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/new/dark-horror-man-cosplay-makeup-idea.webp",          alt: "Horror Cosplay", featured: true,  edgePhone: false },
    { src: "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/new/gothic-crimson-rose-dark-art-wallpaper.webp",       alt: "Gothic Rose",    featured: false, edgePhone: false },
    { src: "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/new/skeleton-drinking-haunted-energy-drink-art.webp",   alt: "Skeleton Art",   featured: false, edgePhone: true  },
  ];

  // ── Pre-compute premium section data so it can be passed into LazySection ──
  const EPOCH_MS  = Date.UTC(2025, 0, 1, 0, 0, 0);
  const CYCLE_MS  = 48 * 60 * 60 * 1000;
  const UNLOCK_MS = 24 * 60 * 60 * 1000;
  const pos = (Date.now() - EPOCH_MS) % CYCLE_MS;
  const isLockedGlobal = pos >= UNLOCK_MS;
  const countdownDate = new Date().toISOString();

  const premiumItems = premiumThisWeek.map((img) => {
    const devicePath = img.deviceType === "IPHONE" ? "iphone" : img.deviceType === "ANDROID" ? "android" : "pc";
    return {
      id: img.id,
      slug: img.slug,
      title: isLockedGlobal ? "Sealed Away" : img.title,
      src: getPublicUrl(img.r2Key),
      devicePath,
      isLocked: isLockedGlobal,
      href: isLockedGlobal ? "#" : undefined,
      updatedAt: img.updatedAt ? new Date(img.updatedAt).toISOString() : null,
    };
  });

  return (
    <>
      {/*
        WOTD PRELOAD REMOVED — was causing "preloaded but not used within a few seconds"
        browser warning because Next.js Image generates its own srcset and the preload
        href (/_next/image?url=...&w=640) never matched the actual src the browser picked.
        The WOTD Image tag below already has priority + fetchPriority="high" which is
        sufficient. Removing the mismatched preload eliminates the console warning and
        prevents wasted bandwidth on the wrong size.
      */}

      {/* ── ATMOSPHERIC FOG OVERLAY ── */}
      <div className="dt-fog" aria-hidden="true">
        <div className="dt-fog__layer dt-fog__layer--1" />
        <div className="dt-fog__layer dt-fog__layer--2" />
        <div className="dt-fog__layer dt-fog__layer--3" />
      </div>

      {/* ══════════════════════════════════════════════════════════
          SECTION 1 — HERO: renders immediately (above the fold).
          NO LazySection wrapper here — this is the LCP target.
      ══════════════════════════════════════════════════════════ */}
      <section className="dt-gate dt-gate--collage hw-hero-gate-override" style={{ padding: "0", minHeight: "unset" }}>

        <div className="dt-gate__crack" aria-hidden="true" />

        <div className="hw-hero-split" style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          alignItems: "center",
          width: "100%",
          maxWidth: "100%",
          overflow: "visible",
        }}>

          {/* LEFT — Text block */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", padding: "20px 24px 20px" }}>
            <span className="dt-gate__eyebrow" style={{ fontSize: "0.75rem", letterSpacing: "0.25em" }}>You have arrived in</span>

            {/* H1: SEO skeleton — visually hidden but present for Lighthouse/Google */}
            <h1 style={{
              position: "absolute",
              width: "1px",
              height: "1px",
              padding: 0,
              margin: "-1px",
              overflow: "hidden",
              clip: "rect(0,0,0,0)",
              whiteSpace: "nowrap",
              border: 0,
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
              fontSize: "1.05rem",
              lineHeight: "1.75",
              maxWidth: "460px",
              fontStyle: "italic",
              borderLeft: "2px solid #8b0000",
              paddingLeft: "1rem",
              margin: 0,
            }}>
              Every 24 hours, a single vision is pulled from the deepest level of the vault. A unique horror wallpaper surfaced just for tonight. Download this 4K pick before the clock resets and a new nightmare takes its place.
            </p>

            <p style={{
              fontFamily: "var(--font-space, monospace)",
              fontSize: "0.65rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#e0001f",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}>
              <span style={{
                display: "inline-block",
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#e0001f",
                boxShadow: "0 0 8px rgba(224,0,31,0.8)",
                animation: "hw-hero-pulse 2.4s ease-in-out infinite",
                flexShrink: 0,
              }} />
              New drops added every day
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <Link href="/all" className="dt-btn dt-btn--enter" style={{ alignSelf: "flex-start" }}>
                <span>Browse All Wallpapers →</span>
              </Link>
              <span style={{
                fontFamily: "var(--font-space, monospace)",
                fontSize: "0.52rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(224,224,248,0.3)",
                paddingLeft: "2px",
              }}>
                Start Scrolling — If You Dare
              </span>
            </div>

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

          {/* RIGHT — Phone mockups
              FIX: All 5 phones now visible on mobile via horizontal scroll.
              edgePhone phones are hidden ONLY on very small screens (<400px).
              On 400px+ all 5 phones scroll horizontally with scroll-snap.
              Desktop still shows all 5 inline without scroll.
          */}
          <div className="hw-hero-phones-wrap" style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 16px",
            overflow: "visible",
            gap: "10px",
          }}>
            {heroPhones.map((phone, i) => {
              const w = phone.featured ? "240px" : "170px";
              const h = phone.featured ? "520px" : "368px";
              const br = phone.featured ? "42px" : "30px";
              return (
                <div
                  key={i}
                  className={phone.edgePhone ? "hw-hero-phone-edge" : undefined}
                  style={{ flexShrink: 0, filter: phone.featured ? "drop-shadow(0 0 28px rgba(139,0,0,0.55))" : "none" }}
                >
                  <div
                    className="hw-hero-phone-shell"
                    style={{
                      ["--phone-w" as string]: w,
                      ["--phone-h" as string]: h,
                      ["--phone-br" as string]: br,
                      width: w, height: h, borderRadius: br,
                      background: "#080810",
                      border: phone.featured ? "2px solid rgba(139,0,0,0.85)" : "1.5px solid rgba(255,255,255,0.1)",
                      position: "relative", overflow: "hidden",
                      boxShadow: phone.featured ? "0 24px 64px rgba(0,0,0,0.85), 0 0 0 3px rgba(139,0,0,0.25)" : "0 10px 36px rgba(0,0,0,0.65)",
                    }}>
                    <div style={{ position: "absolute", right: "-3px", top: "22%", width: "3px", height: "26px", background: "#1a1a2e", borderRadius: "0 2px 2px 0" }} />
                    <div style={{ position: "absolute", left: "-3px", top: "19%", width: "3px", height: "16px", background: "#1a1a2e", borderRadius: "2px 0 0 2px" }} />
                    <div style={{ position: "absolute", left: "-3px", top: "30%", width: "3px", height: "16px", background: "#1a1a2e", borderRadius: "2px 0 0 2px" }} />
                    <div style={{ position: "absolute", top: "7px", left: "50%", transform: "translateX(-50%)", width: "32%", height: "9px", background: "#000", borderRadius: "6px", zIndex: 4 }} />
                    {phone.featured ? (
                      <Image
                        src={phone.src}
                        alt={phone.alt}
                        fill
                        priority={false}
                        fetchPriority="low"
                        sizes="(max-width: 539px) 70px, (max-width: 640px) 120px, 240px"
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <ProtectedImg
                        src={phone.src}
                        alt={phone.alt}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        loading="lazy"
                        // @ts-expect-error fetchpriority not in React img types
                        fetchpriority="low"
                      />
                    )}
                    <ProtectionOverlay />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 42%)", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", bottom: "6px", left: "50%", transform: "translateX(-50%)", width: "33%", height: "3px", background: "rgba(255,255,255,0.22)", borderRadius: "2px" }} />
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </section>

      <style>{`
        @keyframes hw-hero-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
        .hw-hero-gate-override {
          padding-top: 8px !important;
          padding-bottom: 0 !important;
          overflow: visible !important;
        }
        @media (min-width: 860px) {
          .hw-hero-split {
            grid-template-columns: 380px 1fr !important;
            align-items: center !important;
            height: 560px !important;
          }
          .hw-hero-phones-wrap {
            height: 560px !important;
            overflow: visible !important;
            align-items: center !important;
            justify-content: center !important;
          }
        }
        @media (min-width: 540px) and (max-width: 859px) {
          .hw-hero-split { grid-template-columns: 1fr !important; }
          .hw-hero-phones-wrap {
            padding: 16px clamp(12px,3vw,32px) 16px !important;
            overflow-x: auto !important;
            justify-content: flex-start !important;
            scroll-snap-type: x mandatory !important;
            -webkit-overflow-scrolling: touch !important;
            scrollbar-width: none !important;
          }
          .hw-hero-phones-wrap::-webkit-scrollbar { display: none; }
          .hw-hero-phones-wrap > div { scroll-snap-align: center; }
        }

        /* MOBILE: All 5 phones visible in horizontal scroll row */
        @media (max-width: 539px) {
          .hw-hero-split { grid-template-columns: 1fr !important; }
          .hw-hero-phones-wrap {
            padding: 8px 12px 12px !important;
            overflow-x: auto !important;
            justify-content: flex-start !important;
            gap: 6px !important;
            scroll-snap-type: x mandatory !important;
            -webkit-overflow-scrolling: touch !important;
            scrollbar-width: none !important;
          }
          .hw-hero-phones-wrap::-webkit-scrollbar { display: none; }
          .hw-hero-phones-wrap > div { scroll-snap-align: center; }

          /* All phones show on mobile — NO hide for edgePhone on 400px+ */
          .hw-hero-phone-edge {
            display: flex !important;
          }

          /* Non-featured phones: compact */
          .hw-hero-phone-shell {
            width: 90px !important;
            height: 195px !important;
            border-radius: 14px !important;
          }
          /* Featured (middle) phone slightly bigger */
          .hw-hero-phones-wrap > div:nth-child(3) .hw-hero-phone-shell {
            width: 116px !important;
            height: 252px !important;
            border-radius: 18px !important;
          }
        }

        /* Very tiny screens (<360px): hide edge phones to avoid overflow */
        @media (max-width: 359px) {
          .hw-hero-phone-edge {
            display: none !important;
          }
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════════
          SECTION — NEW THIS WEEK
      ══════════════════════════════════════════════════════════ */}
      {newThisWeek.length > 0 && (
        <LazySection
          skeletonVariant="cards"
          minHeight="480px"
          rootMargin="200px 0px"
        >
          <section style={{ padding: "clamp(32px,5vw,64px) clamp(16px,5vw,72px)", background: "#07050f", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(76,175,80,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

            <div className="dt-section-head dt-section-head--center" style={{ marginBottom: "clamp(24px,4vw,40px)" }}>
              <span className="dt-eyebrow" style={{ color: "#4caf50" }}>Fresh From The Vault</span>
              <h2 className="dt-section-title">New This Week</h2>
              <p className="dt-section-sub" style={{ maxWidth: "480px", margin: "0 auto" }}>
                Just surfaced. These disappear from this section in 48 hours.
              </p>
            </div>

            <WallpaperCardGrid
              accentRgb="76,175,80"
              badge="NEW"
              badgeColor="#4caf50"
              items={newThisWeek.map((img) => ({
                id: img.id,
                slug: img.slug,
                title: img.title,
                src: getPublicUrl(img.r2Key),
                devicePath: img.deviceType === "IPHONE" ? "iphone" : img.deviceType === "ANDROID" ? "android" : "pc",
              }))}
            />
          </section>
        </LazySection>
      )}

      {/* ══════════════════════════════════════════════════════════
          SECTION — PREMIUM THIS WEEK
      ══════════════════════════════════════════════════════════ */}
      {premiumThisWeek.length > 0 && (
        <LazySection
          skeletonVariant="cards"
          minHeight="480px"
          rootMargin="200px 0px"
        >
          <section style={{ padding: "clamp(32px,5vw,64px) clamp(16px,5vw,72px)", background: "#0a0810", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(201,168,76,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

            <div className="dt-section-head dt-section-head--center" style={{ marginBottom: "clamp(24px,4vw,40px)" }}>
              <span className="dt-eyebrow" style={{ color: isLockedGlobal ? "#6b6b7a" : "#c9a84c" }}>
                {isLockedGlobal ? "Back In The Vault" : "Hand-Picked Excellence"}
              </span>
              <h2 className="dt-section-title">{isLockedGlobal ? "Premium — Locked" : "Premium This Week"}</h2>
              <p className="dt-section-sub" style={{ maxWidth: "480px", margin: "0 auto" }}>
                {isLockedGlobal
                  ? "These pieces are sealed away. Check back when the vault reopens."
                  : "The finest pieces from the archive. Surfaces for 24 hours, then sealed away."}
              </p>
              <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center" }}>
                <PremiumCountdown updatedAt={countdownDate} />
              </div>
            </div>

            <WallpaperCardGrid
              accentRgb="201,168,76"
              badge="PREMIUM"
              badgeColor="#c9a84c"
              items={premiumItems}
            />
          </section>
        </LazySection>
      )}

      {/* ══════════════════════════════════════════════════════════
          SECTION 2 — DAILY PICK (WOTD)
          FIX: Removed mismatched <link rel="preload"> from <head>.
          The Image tag below has priority + fetchPriority="high" which
          is the correct way to prioritize Next.js optimized images.
      ══════════════════════════════════════════════════════════ */}
      {wotd && (() => {
        const devicePath = wotd.deviceType === "IPHONE" ? "iphone" : wotd.deviceType === "ANDROID" ? "android" : "pc";
        const wotdUrl = getPublicUrl(wotd.r2Key);
        const wotdHref = `/${devicePath}/${wotd.slug}`;
        const todayStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
        return (
          <LazySection
            skeletonVariant="wotd"
            minHeight="560px"
            rootMargin="200px 0px"
          >
            <section className="wotd-section">

              <div className="wotd-particles" aria-hidden="true">
                {Array.from({ length: 18 }).map((_, i) => (
                  <span key={i} className="wotd-particle" style={{ "--pi": i } as React.CSSProperties} />
                ))}
              </div>

              <div className="wotd-header">
                <span className="wotd-header__rule" aria-hidden="true" />
                <div className="wotd-header__center">
                  <span className="wotd-eyebrow">
                    <span className="wotd-eyebrow__dot" />
                    Tonight&rsquo;s Pick &middot; {todayStr}
                    <span className="wotd-eyebrow__dot" />
                  </span>
                </div>
                <span className="wotd-header__rule" aria-hidden="true" />
              </div>

              <div className="wotd-top-frame">
                <Link href={wotdHref} className="wotd-img-frame" aria-label={wotd.title}>
                  <div className="wotd-img-frame__wrap">
                    {/* No priority here — this is inside LazySection so it only mounts on scroll.
                        Marking it priority would be contradictory and waste bandwidth. */}
                    <Image src={wotdUrl} alt={wotd.title} fill loading="lazy" className="object-cover"
                      sizes="(max-width:480px) 90vw, (max-width:768px) 60vw, 320px" style={{ objectPosition: "center top" }} />
                  </div>
                  <div className="wotd-img-frame__scanlines" aria-hidden="true" />
                  <div className="wotd-img-frame__corners" aria-hidden="true">
                    <span /><span /><span /><span />
                  </div>
                  {wotd.deviceType && (
                    <span className="wotd-img-frame__badge">{wotd.deviceType.charAt(0) + wotd.deviceType.slice(1).toLowerCase()}</span>
                  )}
                  <div className="wotd-img-frame__hover" aria-hidden="true">
                    <span className="wotd-img-frame__hover-text">View Wallpaper</span>
                  </div>
                  <div className="wotd-img-frame__eye" aria-hidden="true" />
                </Link>
              </div>

              <div className="wotd-below">
                <h2 className="wotd-title">{wotd.title}</h2>
              </div>

              {/* ── Color Filter Dots ─────────────────────────────────────── */}
              <div className="wotd-color-filter" aria-label="Filter by color">
                <span className="wotd-color-filter__label">Filter by Color</span>
                <div className="wotd-color-filter__dots">
                  {[
                    { color: "#e0001f", tag: "red",    label: "Red",    glow: "rgba(224,0,31,0.6)"   },
                    { color: "#9333ea", tag: "purple",  label: "Purple", glow: "rgba(147,51,234,0.6)" },
                    { color: "#22c55e", tag: "green",   label: "Green",  glow: "rgba(34,197,94,0.6)"  },
                    { color: "#111111", tag: "black",   label: "Black",  glow: "rgba(180,180,180,0.4)", border: "rgba(255,255,255,0.2)" },
                  ].map(({ color, tag, label, glow, border }) => (
                    <a
                      key={tag}
                      href={`/search?q=${encodeURIComponent(tag)}`}
                      className="wotd-color-dot"
                      aria-label={label}
                      title={label}
                      style={{
                        "--dot-color": color,
                        "--dot-glow":  glow,
                        "--dot-border": border ?? color,
                        background: color,
                      } as React.CSSProperties}
                    />
                  ))}
                </div>
              </div>

              <style>{`
                .wotd-section {
                  position: relative;
                  padding: clamp(24px,4vw,48px) clamp(16px,5vw,72px);
                  background: #080508;
                  overflow: hidden;
                }
                .wotd-section::before {
                  content: '';
                  position: absolute;
                  inset: 0;
                  background:
                    radial-gradient(ellipse 70% 50% at 50% 100%, rgba(224,0,31,0.12) 0%, transparent 65%),
                    radial-gradient(ellipse 40% 30% at 20% 30%, rgba(80,0,10,0.15) 0%, transparent 60%);
                  pointer-events: none;
                }
                .wotd-particles {
                  position: absolute;
                  inset: 0;
                  pointer-events: none;
                  overflow: hidden;
                }
                .wotd-particle {
                  position: absolute;
                  display: block;
                  width: 2px;
                  height: 2px;
                  border-radius: 50%;
                  background: rgba(224,0,31,0.4);
                  left: calc(var(--pi, 0) * 5.8% + 2%);
                  bottom: -10px;
                  will-change: transform, opacity;
                  animation: wotdFloat calc(6s + var(--pi, 0) * 0.7s) ease-in infinite;
                  animation-delay: calc(var(--pi, 0) * 0.4s);
                  opacity: 0;
                }
                .wotd-particle:nth-child(odd) {
                  background: rgba(150,100,50,0.3);
                  width: 1.5px; height: 1.5px;
                }
                @keyframes wotdFloat {
                  0%   { transform: translate3d(0, 0, 0);    opacity: 0; }
                  10%  { opacity: 0.6; }
                  80%  { opacity: 0.3; }
                  100% { transform: translate3d(calc((var(--pi, 0) - 9) * 4px), -100vh, 0); opacity: 0; }
                }
                .wotd-header {
                  display: flex;
                  align-items: center;
                  gap: 1.25rem;
                  margin-bottom: clamp(12px, 2vw, 24px);
                  max-width: 1100px;
                  margin-left: auto;
                  margin-right: auto;
                }
                .wotd-header__rule {
                  flex: 1;
                  height: 1px;
                  background: linear-gradient(90deg, transparent, rgba(224,0,31,0.5), transparent);
                }
                .wotd-header__center { flex-shrink: 0; }
                .wotd-eyebrow {
                  display: flex;
                  align-items: center;
                  gap: 0.6rem;
                  font-size: 0.72rem;
                  letter-spacing: 0.22em;
                  text-transform: uppercase;
                  color: #e0001f;
                  font-family: var(--font-space, monospace);
                }
                .wotd-eyebrow__dot {
                  display: inline-block;
                  width: 5px; height: 5px;
                  border-radius: 50%;
                  background: #e0001f;
                  will-change: opacity;
                  animation: wotdPulse 2.4s ease-in-out infinite;
                  transition: box-shadow 0.3s ease, transform 0.3s ease;
                }
                @keyframes wotdPulse {
                  0%, 100% { opacity: 1; }
                  50%       { opacity: 0.6; }
                }
                .wotd-eyebrow:hover .wotd-eyebrow__dot {
                  box-shadow: 0 0 12px 4px rgba(224,0,31,0.9), 0 0 24px rgba(224,0,31,0.4);
                  transform: scale(1.8);
                  animation: none;
                }
                .wotd-color-filter {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  gap: 10px;
                  margin-top: 22px;
                }
                .wotd-color-filter__label {
                  font-family: var(--font-space, monospace);
                  font-size: 0.55rem;
                  letter-spacing: 0.28em;
                  text-transform: uppercase;
                  color: rgba(224,224,224,0.28);
                }
                .wotd-color-filter__dots {
                  display: flex;
                  gap: 16px;
                  align-items: center;
                }
                .wotd-color-dot {
                  display: block;
                  width: 15px;
                  height: 15px;
                  border-radius: 50%;
                  border: 1.5px solid var(--dot-border, var(--dot-color));
                  transition: box-shadow 0.22s ease, transform 0.22s ease;
                }
                .wotd-color-dot:hover {
                  transform: scale(1.5);
                  box-shadow:
                    0 0 12px 4px var(--dot-glow),
                    0 0 28px var(--dot-glow);
                }
                .wotd-top-frame {
                  display: flex;
                  justify-content: center;
                  margin-bottom: 1.5rem;
                }
                .wotd-top-frame .wotd-img-frame {
                  width: clamp(160px, 22vw, 280px);
                }
                .wotd-below {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  gap: 1rem;
                  text-align: center;
                }
                .wotd-img-frame {
                  position: relative;
                  display: block;
                  aspect-ratio: 9 / 16;
                  width: 100%;
                  border-radius: 16px;
                  overflow: hidden;
                  border: 1.5px solid rgba(224,0,31,0.4);
                  box-shadow:
                    0 0 0 1px rgba(255,34,51,0.06),
                    0 8px 40px rgba(0,0,0,0.8),
                    0 0 60px rgba(224,0,31,0.15);
                  text-decoration: none;
                  transition: transform 0.35s ease, box-shadow 0.35s ease;
                  flex-shrink: 0;
                }
                .wotd-img-frame:hover {
                  transform: translateY(-6px) scale(1.015);
                  box-shadow:
                    0 0 0 1px rgba(255,34,51,0.18),
                    0 20px 70px rgba(0,0,0,0.9),
                    0 0 90px rgba(224,0,31,0.28);
                }
                .wotd-img-frame__wrap { position: absolute; inset: 0; }
                .wotd-img-frame__scanlines {
                  position: absolute;
                  inset: 0;
                  background: repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 3px,
                    rgba(0,0,0,0.06) 3px,
                    rgba(0,0,0,0.06) 4px
                  );
                  pointer-events: none;
                }
                .wotd-img-frame__corners {
                  position: absolute;
                  inset: 0;
                  pointer-events: none;
                }
                .wotd-img-frame__corners span {
                  position: absolute;
                  width: 16px; height: 16px;
                  border-color: rgba(224,0,31,0.7);
                  border-style: solid;
                }
                .wotd-img-frame__corners span:nth-child(1) { top: 8px; left: 8px; border-width: 1.5px 0 0 1.5px; }
                .wotd-img-frame__corners span:nth-child(2) { top: 8px; right: 8px; border-width: 1.5px 1.5px 0 0; }
                .wotd-img-frame__corners span:nth-child(3) { bottom: 8px; left: 8px; border-width: 0 0 1.5px 1.5px; }
                .wotd-img-frame__corners span:nth-child(4) { bottom: 8px; right: 8px; border-width: 0 1.5px 1.5px 0; }
                .wotd-img-frame__badge {
                  position: absolute;
                  top: 12px; left: 12px;
                  font-size: 0.6rem;
                  letter-spacing: 0.18em;
                  text-transform: uppercase;
                  padding: 3px 8px;
                  background: rgba(0,0,0,0.75);
                  border: 1px solid rgba(224,0,31,0.4);
                  color: #e0001f;
                  border-radius: 2px;
                  font-family: var(--font-space, monospace);
                }
                .wotd-img-frame__hover {
                  position: absolute;
                  inset: 0;
                  background: rgba(224,0,31,0.15);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  opacity: 0;
                  transition: opacity 0.25s ease;
                  backdrop-filter: blur(2px);
                }
                .wotd-img-frame:hover .wotd-img-frame__hover { opacity: 1; }
                .wotd-img-frame__hover-text {
                  font-size: 0.8rem;
                  letter-spacing: 0.2em;
                  text-transform: uppercase;
                  color: #fff;
                  font-family: var(--font-space, monospace);
                  padding: 8px 16px;
                  border: 1px solid rgba(255,255,255,0.3);
                  border-radius: 2px;
                }
                .wotd-img-frame__eye {
                  position: absolute;
                  bottom: 0; left: 50%;
                  transform: translateX(-50%);
                  width: 70%; height: 2px;
                  background: rgba(224,0,31,0.7);
                  box-shadow: 0 0 18px 6px rgba(224,0,31,0.4);
                  will-change: transform, opacity;
                  animation: wotdEyePulse 3s ease-in-out infinite;
                  border-radius: 50%;
                  transform-origin: center;
                }
                @keyframes wotdEyePulse {
                  0%, 100% { opacity: 0.5; transform: translateX(-50%) scaleX(0.57); }
                  50%       { opacity: 1;   transform: translateX(-50%) scaleX(1); }
                }
                .wotd-title {
                  font-size: clamp(1.2rem, 2.2vw, 1.9rem);
                  line-height: 1.12;
                  margin: 0;
                  color: #f0e8d8;
                  font-family: var(--font-cinzel, serif);
                  text-shadow: 0 2px 20px rgba(224,0,31,0.2);
                  letter-spacing: 0.02em;
                }
                @media (max-width: 680px) {
                  .wotd-top-frame .wotd-img-frame {
                    width: clamp(140px, 50vw, 200px);
                  }
                  .wotd-title { font-size: clamp(1.1rem, 4vw, 1.5rem); }
                }
              `}</style>
            </section>
          </LazySection>
        );
      })()}

      {/* ══════════════════════════════════════════════════════════
          SECTION 3 — MOBILE WALLPAPERS
      ══════════════════════════════════════════════════════════ */}
      <LazySection
        skeletonVariant="default"
        minHeight="520px"
        rootMargin="200px 0px"
      >
        <section className="dt-mobile">
          <div className="dt-section-head dt-section-head--center">
            <span className="dt-eyebrow">Pocket-Sized Darkness</span>
            <h2 className="dt-section-title">Mobile Wallpapers</h2>
            <p className="dt-section-sub">
              Your lock screen deserves something worth staring at.
            </p>
          </div>

          <div className="dt-phone-showcase">
            {[
              { src: "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/12/always-watching-wallpaper.webp", alt: "Always Watching", label: "Always Watching" },
              { src: "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/12/funny-lockscreen-wallpaper.webp", alt: "Funny Lockscreen", label: "Funny Lockscreen" },
              { src: "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/12/vampire-man-and-woman-couple-dance-under-the-moon-wallpaper.webp", alt: "Vampire Couple Dance", label: "Vampire Dance" },
              { src: "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/12/paper-cut-witch-red-backdrop-staff.webp", alt: "Paper Cut Witch", label: "Paper Cut Witch" },
              { src: "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/12/hip-hop-haunted-skeleton-phone-wallpaper.webp", alt: "Hip Hop Skeleton", label: "Hip Hop Skeleton" },
            ].map((phone, i) => (
              <div
                key={i}
                className={`dt-phone-card${i === 2 ? " dt-phone-card--hero" : ""}`}
                style={{ "--card-i": i } as React.CSSProperties}
              >
                <div className="dt-phone-card__aura" aria-hidden="true" />
                <div className="dt-phone-card__shell">
                  <div className="dt-phone-card__btn dt-phone-card__btn--vol1" aria-hidden="true" />
                  <div className="dt-phone-card__btn dt-phone-card__btn--vol2" aria-hidden="true" />
                  <div className="dt-phone-card__btn dt-phone-card__btn--power" aria-hidden="true" />
                  <div className="dt-phone-card__screen">
                    <div className="dt-phone-card__island" aria-hidden="true">
                      <span className="dt-phone-card__cam" />
                    </div>
                    <ProtectedImg
                      src={phone.src}
                      alt={phone.alt}
                      className="dt-phone-card__img"
                      loading="lazy"
                    />
                    <ProtectionOverlay />
                    <div className="dt-phone-card__gloss" aria-hidden="true" />
                  </div>
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
      </LazySection>

      {/* ══════════════════════════════════════════════════════════
          SECTION 4 — PC / DESKTOP
          MOBILE-PERF: hidden on mobile via CSS (saves ~200KB image).
      ══════════════════════════════════════════════════════════ */}
      <LazySection
        skeletonVariant="default"
        minHeight="440px"
        rootMargin="200px 0px"
        className="hw-desktop-section-mobile-hidden"
      >
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
                  <ProtectedImg
                    src="https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/monster-flower-offering-pc.webp"
                    alt="Monster Flower Offering — PC wallpaper 16:9"
                    className="dt-monitor__img"
                  />
                  <ProtectionOverlay />
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
      </LazySection>

      <style>{`
        @media (max-width: 767px) {
          .hw-desktop-section-mobile-hidden {
            display: none !important;
          }
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════════
          SECTION — MATCHING KITS
      ══════════════════════════════════════════════════════════ */}
      <LazySection
        skeletonVariant="kits"
        minHeight="440px"
        rootMargin="200px 0px"
      >
        <section style={{ padding: "clamp(40px,6vw,72px) clamp(16px,5vw,72px)", background: "#07050f", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(224,0,31,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative" }}>

            <div style={{ marginBottom: "clamp(24px,4vw,40px)" }}>
              <span style={{ display: "block", fontFamily: "var(--font-space, monospace)", fontSize: "0.58rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "#e0001f", marginBottom: "10px" }}>
                Full Digital Identity
              </span>
              <h2 style={{ fontFamily: "var(--font-cinzel, serif)", fontSize: "clamp(1.4rem,3vw,2.2rem)", fontWeight: 700, color: "#f0e8d8", margin: "0 0 10px", letterSpacing: "0.04em" }}>
                Matching Setup Kits
              </h2>
              <p style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: "clamp(0.95rem,1.5vw,1.1rem)", lineHeight: 1.65, color: "rgba(224,224,248,0.6)", margin: 0, maxWidth: "520px" }}>
                One dark aesthetic across every screen. Phone, watch, desktop, and avatar — unified.
              </p>
            </div>

            <div className="hw-kits-row3">
              {[
                {
                  href: "/sets/ghost-pitch",
                  num: "03",
                  title: "The Ghost Pitch",
                  sub: "Dark Soccer Setup Kit",
                  tag: "Sports",
                  img: "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/12/sets_The%20Ghost%20Pitch_%20A%20Matching%20Dark%20Soccer%20Setup%20Kit_Haunted_soccer_stadium_midnight_soccer-kit.webp",
                  alt: "Ghost Pitch haunted soccer stadium dark horror matching wallpaper set",
                  accent: "232,124,30",
                },
                {
                  href: "/sets/cyberpunk-gaming-hero",
                  num: "05",
                  title: "Cyberpunk Gaming Hero",
                  sub: "Neon Horror Gaming Kit",
                  tag: "Gaming",
                  img: "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/sets/Cyberpunk%20Gaming%20Hero%20Matching%20Wallpaper%20Set/terminal-paradox-cyber-neon-phantom-pointing-homescreen-mobile-thumbnail-cover.webp",
                  alt: "Terminal Paradox 4K cyberpunk gaming hero — OLED neon horror matching wallpaper set for PC phone and smartwatch",
                  accent: "139,92,246",
                  premium: true,
                },
                {
                  href: "/sets/crimson-sovereign",
                  num: "04",
                  title: "The Crimson Sovereign",
                  sub: "Dark Fantasy Gaming Kit",
                  tag: "Gaming",
                  img: "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/sets/The%20Crimson%20Sovereign%20%7C%20Dark%20Fantasy%20Gaming%20Character%20Matching%20Setup%20Kit/ark-fantasy-gaming-character-4k-wallpaper-pc-setup-aesthetic.webp",
                  alt: "Crimson Sovereign dark fantasy gaming character 4K wallpaper PC setup aesthetic",
                  accent: "224,0,31",
                  premium: true,
                },
              ].map((kit) => (
                <a key={kit.href} href={kit.href} className="hw-kit-card hw-kit-card--sm" style={{ "--kit-accent": kit.accent } as React.CSSProperties}>
                  <div className="hw-kit-card__thumb">
                    <Image src={kit.img} alt={kit.alt} fill sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 360px" style={{ objectFit: "cover" }} className="hw-kit-card__img" />
                    <div className="hw-kit-card__overlay" />
                    <span className="hw-kit-card__num">Kit {kit.num}</span>
                    {(kit as { premium?: boolean }).premium && (
                      <span className="hw-kit-card__premium">Premium</span>
                    )}
                    {(kit as { tag?: string }).tag && (
                      <span className="hw-kit-card__tag">{(kit as { tag?: string }).tag}</span>
                    )}
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
              <a href="/sets" style={{ fontFamily: "var(--font-space, monospace)", fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(224,224,248,0.45)", textDecoration: "none", transition: "color 0.2s" }}>
                Browse All Kits →
              </a>
            </div>
            <p style={{
              display: "none",
              fontFamily: "var(--font-space, monospace)",
              fontSize: "0.52rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(224,224,248,0.3)",
              textAlign: "center",
              marginTop: "6px",
            }} className="hw-kits-swipe-hint">
              ← Swipe to see all kits →
            </p>
          </div>

          <style>{`
            .hw-kits-row3 {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: clamp(10px,1.8vw,18px);
            }
            @media (max-width: 900px) and (min-width: 541px) {
              .hw-kits-row3 { grid-template-columns: repeat(2, 1fr); }
            }
            @media (max-width: 540px) {
              .hw-kits-row3 {
                display: flex;
                flex-direction: row;
                overflow-x: auto;
                scroll-snap-type: x mandatory;
                -webkit-overflow-scrolling: touch;
                gap: 12px;
                padding-bottom: 12px;
                scrollbar-width: none;
              }
              .hw-kits-row3::-webkit-scrollbar { display: none; }
              .hw-kits-row3 .hw-kit-card {
                flex: 0 0 78vw;
                max-width: 300px;
                scroll-snap-align: start;
              }
            }
            .hw-kit-card--sm .hw-kit-card__title { font-size: clamp(0.85rem,1.5vw,1.05rem); }
            .hw-kit-card__tag {
              position: absolute;
              bottom: 10px; right: 10px;
              font-family: var(--font-space, monospace);
              font-size: 0.5rem;
              letter-spacing: 0.16em;
              text-transform: uppercase;
              color: #fff;
              background: rgba(0,0,0,0.8);
              border: 1px solid rgba(255,255,255,0.3);
              padding: 4px 10px;
              border-radius: 2px;
              font-weight: 700;
            }
            .hw-kit-card {
              display: flex;
              flex-direction: column;
              text-decoration: none;
              color: inherit;
              border: 1px solid rgba(var(--kit-accent, 224,0,31), 0.18);
              background: rgba(255,255,255,0.02);
              overflow: hidden;
              transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
              cursor: pointer;
            }
            .hw-kit-card:hover {
              border-color: rgba(var(--kit-accent, 224,0,31), 0.5);
              box-shadow: 0 0 40px rgba(var(--kit-accent, 224,0,31), 0.1);
              transform: translateY(-4px);
            }
            .hw-kit-card__thumb {
              position: relative;
              aspect-ratio: 16/9;
              overflow: hidden;
              background: #08060e;
            }
            .hw-kit-card__img {
              width: 100%; height: 100%; object-fit: cover; display: block;
              transition: transform 0.55s ease;
            }
            .hw-kit-card:hover .hw-kit-card__img { transform: scale(1.05); }
            .hw-kit-card__overlay {
              position: absolute; inset: 0;
              background: linear-gradient(to top, rgba(7,5,15,0.85) 0%, transparent 55%);
              pointer-events: none;
            }
            .hw-kit-card__num {
              position: absolute; top: 10px; left: 12px;
              font-family: var(--font-space, monospace); font-size: 0.5rem;
              letter-spacing: 0.2em; text-transform: uppercase;
              color: rgb(var(--kit-accent, 224,0,31));
              background: rgba(0,0,0,0.7);
              border: 1px solid rgba(var(--kit-accent, 224,0,31), 0.4);
              padding: 2px 8px; border-radius: 2px;
            }
            .hw-kit-card__premium {
              position: absolute; top: 10px; right: 10px;
              font-family: var(--font-space, monospace); font-size: 0.46rem;
              letter-spacing: 0.16em; text-transform: uppercase;
              color: #ff6a00;
              background: linear-gradient(135deg, rgba(255,106,0,0.14) 0%, rgba(224,0,31,0.14) 100%);
              border: 1px solid rgba(255,106,0,0.42);
              padding: 2px 7px; border-radius: 2px; font-weight: 700;
              animation: hw-kit-premium-glow 3s ease-in-out infinite;
            }
            @keyframes hw-kit-premium-glow {
              0%,100% { box-shadow: 0 0 10px rgba(255,106,0,0.15); }
              50% { box-shadow: 0 0 20px rgba(255,106,0,0.3), 0 0 36px rgba(224,0,31,0.12); }
            }
            .hw-kit-card__body {
              padding: clamp(14px,2vw,20px);
              display: flex; flex-direction: column; gap: 8px;
              background: rgba(0,0,0,0.6);
              border-top: 1px solid rgba(var(--kit-accent, 224,0,31), 0.25);
            }
            .hw-kit-card__sub {
              font-family: var(--font-space, monospace); font-size: 0.52rem;
              letter-spacing: 0.18em; text-transform: uppercase;
              color: rgb(var(--kit-accent, 224,0,31)); margin: 0;
            }
            .hw-kit-card__title {
              font-family: var(--font-cinzel, serif); font-size: clamp(1rem,1.5vw,1.2rem);
              font-weight: 700; color: #f0e8d8; margin: 0; letter-spacing: 0.04em;
            }
            .hw-kit-card__cta {
              font-family: var(--font-space, monospace); font-size: 0.58rem;
              letter-spacing: 0.14em; text-transform: uppercase;
              color: rgb(var(--kit-accent, 224,0,31));
              transition: letter-spacing 0.2s ease;
              display: flex; align-items: center; gap: 6px;
            }
            .hw-kit-card:hover .hw-kit-card__cta { letter-spacing: 0.22em; }
            @media (max-width: 540px) {
              .hw-kits-swipe-hint { display: block !important; }
            }
          `}</style>
        </section>
      </LazySection>

      {/* ══════════════════════════════════════════════════════════
          SECTION — TRENDING THIS WEEK
      ══════════════════════════════════════════════════════════ */}
      {trendingThisWeek.length > 0 && (
        <LazySection
          skeletonVariant="cards"
          minHeight="480px"
          rootMargin="200px 0px"
        >
          <section style={{ padding: "clamp(32px,5vw,64px) clamp(16px,5vw,72px)", background: "#060410", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(224,0,31,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

            <div className="dt-section-head dt-section-head--center" style={{ marginBottom: "clamp(24px,4vw,40px)" }}>
              <span className="dt-eyebrow" style={{ color: "#c0453a" }}>🔥 Most Downloaded</span>
              <h2 className="dt-section-title">Most Downloaded</h2>
              <p className="dt-section-sub" style={{ maxWidth: "480px", margin: "0 auto" }}>
                The most downloaded wallpapers of all time.
              </p>
            </div>

            <WallpaperCardGrid
              accentRgb="224,0,31"
              badge="🔥"
              badgeColor="#c0453a"
              items={trendingThisWeek.map((img) => ({
                id: img.id,
                slug: img.slug,
                title: img.title,
                src: getPublicUrl(img.r2Key),
                devicePath: img.deviceType === "IPHONE" ? "iphone" : img.deviceType === "ANDROID" ? "android" : "pc",
                downloadCount: img._count.downloads,
              }))}
            />
          </section>
        </LazySection>
      )}

      {/* ══════════════════════════════════════════════════════════
          SECTION 4 — COLLECTIONS ("What Haunts You?")
      ══════════════════════════════════════════════════════════ */}
      <LazySection
        skeletonVariant="tall"
        minHeight="600px"
        rootMargin="200px 0px"
      >
        <section className="dt-obsessions">
          <div className="dt-section-head">

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              flexWrap: "wrap",
              marginBottom: "0.5rem",
            }}>
              <span className="dt-eyebrow" style={{ margin: 0 }}>The Ones We Hid From The Feed</span>
              <span style={{
                fontFamily: "var(--font-space, monospace)",
                fontSize: "0.55rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#7a0000",
                border: "1px solid #7a0000",
                padding: "2px 8px",
                borderRadius: "2px",
                whiteSpace: "nowrap",
                background: "#ffffff",
                fontWeight: 700,
              }}>
                Not in New · Not in Trending · Not in Premium
              </span>
            </div>

            <h2 className="dt-section-title">What Haunts You?</h2>

            <p className="dt-section-sub" style={{ maxWidth: "560px", marginTop: "0.5rem" }}>
              These collections never surface in New, Trending, or Premium.
              The only way in is through here — choose your obsession.
            </p>

          </div>

          {/* ── FEATURED: THE DEFIANT MANIFESTO ── */}
          {obsessions.some(o => o.slug === "the-defiant-manifesto") && (() => {
            const defiant = obsessions.find(o => o.slug === "the-defiant-manifesto")!;
            return (
              <div style={{ marginBottom: "2px" }}>
                <Link
                  href={`/obsessions/${encodeURIComponent(defiant.slug)}`}
                  style={{ display: "block", position: "relative", textDecoration: "none", overflow: "hidden" }}
                >
                  <div style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "16/9",
                    overflow: "hidden",
                    border: "1px solid rgba(224,0,31,0.5)",
                    background: "#080510",
                  }}>
                    <Image
                      src="https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/extras/the-defiant-crew-team-members-collection.webp"
                      alt="The Defiant Manifesto — Crew Collection"
                      fill
                      loading="lazy"
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
                      style={{ objectFit: "cover", objectPosition: "center center", transition: "transform 0.6s ease" }}
                    />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.75) 40%, rgba(0,0,0,0.2) 70%, transparent 100%)", pointerEvents: "none" }} />
                    <div style={{
                      position: "absolute", top: "16px", right: "16px",
                      display: "flex", alignItems: "center", gap: "6px",
                    }}>
                      <span style={{
                        fontFamily: "var(--font-space, monospace)",
                        fontSize: "0.55rem",
                        letterSpacing: "0.22em",
                        textTransform: "uppercase",
                        color: "#ff6a00",
                        background: "linear-gradient(135deg, rgba(255,106,0,0.18), rgba(224,0,31,0.18))",
                        border: "1px solid rgba(255,106,0,0.5)",
                        padding: "4px 10px",
                        borderRadius: "2px",
                        fontWeight: 700,
                      }}>
                        ⚡ Limited
                      </span>
                    </div>
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "clamp(20px,4vw,40px)" }}>
                      <span style={{
                        display: "block",
                        fontFamily: "var(--font-space, monospace)",
                        fontSize: "0.58rem",
                        letterSpacing: "0.28em",
                        textTransform: "uppercase",
                        color: "#e0001f",
                        marginBottom: "10px",
                      }}>
                        Featured Collection
                      </span>
                      <h3 style={{
                        fontFamily: "var(--font-cinzel, serif)",
                        fontSize: "clamp(1.6rem, 4vw, 3rem)",
                        fontWeight: 700,
                        color: "#f0e8d8",
                        margin: "0 0 10px",
                        letterSpacing: "0.04em",
                        lineHeight: 1.1,
                        textShadow: "0 2px 30px rgba(224,0,31,0.4)",
                      }}>
                        {defiant.title}
                      </h3>
                      <p style={{
                        fontFamily: "var(--font-cormorant, serif)",
                        fontSize: "clamp(0.9rem, 1.5vw, 1.05rem)",
                        color: "rgba(224,224,248,0.65)",
                        margin: "0 0 18px",
                        maxWidth: "520px",
                        lineHeight: 1.6,
                      }}>
                        The art they tried to ban. The skeleton that went viral on every platform — then got rejected. Now it lives here.
                      </p>
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        fontFamily: "var(--font-space, monospace)",
                        fontSize: "0.62rem",
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: "#fff",
                        background: "#e0001f",
                        padding: "10px 20px",
                        borderRadius: "2px",
                      }}>
                        Enter The Vault →
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })()}

          <div className="dt-obs-grid">
            {obsessions.filter(o => o.slug !== "the-defiant-manifesto").map((obs, i) => {
              const thumb = obs.thumbnail ? (obs.thumbnail.startsWith('http') ? obs.thumbnail : `${r2Base}/${obs.thumbnail}`) : null;
              return (
                <Link
                  key={obs.id}
                  href={`/obsessions/${encodeURIComponent(obs.slug)}`}
                  className="dt-obs-card"
                  style={{ "--delay": `${i * 0.07}s` } as React.CSSProperties}
                >
                  <div className="dt-obs-card__bg">
                    {thumb ? (
                      <Image
                        src={thumb}
                        alt={obs.title}
                        fill
                        loading="lazy"
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
      </LazySection>

      <HorrorFact />

      {/* ══════════════════════════════════════════════════════════
          SECTION 5 — ABOUT / STORY
      ══════════════════════════════════════════════════════════ */}
      <LazySection
        skeletonVariant="default"
        minHeight="320px"
        rootMargin="200px 0px"
      >
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
              <Link href="/obsessions" className="dt-btn dt-btn--enter">
                <span>Browse Freemium Packs →</span>
              </Link>
              <Link href="/about" className="dt-btn dt-btn--ghost dt-btn--sm">Our Story</Link>
            </div>
          </div>
        </section>
      </LazySection>

      <RecentlyViewed />

      {/* ══════════════════════════════════════════════════════════
          SECTION — THE HAUNTED WALLPAPERS MISSION
      ══════════════════════════════════════════════════════════ */}
      <LazySection
        skeletonVariant="default"
        minHeight="280px"
        rootMargin="200px 0px"
      >
        <section style={{
          padding: "clamp(48px,7vw,80px) clamp(16px,5vw,72px)",
          background: "linear-gradient(180deg, #07050d 0%, #0a0612 100%)",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(224,0,31,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative" }}>
            <div className="dt-section-head dt-section-head--center" style={{ marginBottom: "clamp(20px,3vw,32px)" }}>
              <span className="dt-eyebrow" style={{ color: "#e0001f" }}>Our Purpose</span>
              <h2 className="dt-section-title">The Haunted Wallpapers Mission</h2>
            </div>
            <div style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(224,0,31,0.2)", padding: "clamp(24px,3.5vw,48px)", position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, transparent, rgba(224,0,31,0.6), transparent)" }} />
              <p style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: "clamp(1.05rem,1.8vw,1.2rem)", lineHeight: 1.85, color: "rgba(224,224,248,0.72)", margin: 0 }}>
                At Haunted Wallpapers, we believe your digital setup should be an extension of your soul.
                We don&apos;t just &ldquo;dump&rdquo; images. Every wallpaper is manually curated and tested on real devices
                to ensure perfect crops for iPhone, Samsung, and Desktop. Our unique &ldquo;Matching Set&rdquo; philosophy
                ensures your watch, phone, and PC tell one cohesive story. Built for horror fans, by horror fans.
              </p>
            </div>
          </div>
        </section>
      </LazySection>

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