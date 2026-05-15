// app/page.tsx — HAUNTED TOWN REDESIGN (AdSense-safe, split-hero edition)

import type { Metadata } from "next";
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";
const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

// ── WOTD cached by date — one image per day, never changes on redeploy ───────
// The cache key includes today's UTC date so it auto-busts at midnight.
// revalidate = 86400 means Next.js won't even try to rebuild this for 24h.
const getCachedWotd = () => {
  const todayKey = new Date().toISOString().slice(0, 10); // "2026-05-11"
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

export const revalidate = 3600; // page rebuilds hourly — new badges appear within 1 hour

export default async function Home() {
  // ── Wrap ALL db calls in try/catch so a DB hiccup never produces a 500 ──
  // Each section gracefully degrades to empty/null instead of crashing the page.
  let wotd:           Awaited<ReturnType<typeof getWallpaperOfTheDay>> = null;
  let totalImages     = 0;
  let obsessions:     Array<{ id: string; slug: string; title: string; thumbnail: string; tag: string | null; icon: string | null; bgClass: string | null; _count: { images: number } }> = [];
  let newThisWeek:    Array<{ id: string; slug: string; title: string; r2Key: string; deviceType: string | null; tags: string[] }> = [];
  let premiumThisWeek: Array<{ id: string; slug: string; title: string; r2Key: string; deviceType: string | null; tags: string[]; updatedAt: Date | null }> = [];
  let trendingThisWeek: Array<{ id: string; slug: string; title: string; r2Key: string; deviceType: string | null; tags: string[]; _count: { downloads: number } }> = [];

  try {
    [wotd, totalImages] = await Promise.all([
      getCachedWotd(),  // stable all day — won't change on redeploy
      db.image.count(),
    ]);
  } catch (err) {
    console.error("[home/page] DB error (wotd/count):", err);
  }

  try {
    obsessions = await db.collection.findMany({
      orderBy: [{ featured: "desc" }, { createdAt: "asc" }],
      where: { isAdult: false },
      take: 10,
      select: {
        id: true, slug: true, title: true, thumbnail: true,
        tag: true, icon: true, bgClass: true,
        _count: { select: { images: { where: { deviceType: "IPHONE" } } } },
      },
    });
  } catch (err) {
    console.error("[home/page] DB error (obsessions):", err);
  }

  try {
    // Badge sections — New This Week + Premium This Week
    [newThisWeek, premiumThisWeek] = await Promise.all([
      db.image.findMany({
        where: { tags: { has: "badge-new" }, isAdult: false },
        orderBy: { updatedAt: "desc" },
        take: 6,
        select: { id: true, slug: true, title: true, r2Key: true, deviceType: true, tags: true },
      }),
      db.image.findMany({
        where: { tags: { has: "badge-premium" }, isAdult: false },
        orderBy: { updatedAt: "desc" },
        take: 6,
        select: { id: true, slug: true, title: true, r2Key: true, deviceType: true, tags: true, updatedAt: true },
      }),
    ]);
  } catch (err) {
    console.error("[home/page] DB error (badges):", err);
  }

  try {
    trendingThisWeek = await getCachedTrending();
  } catch (err) {
    console.error("[home/page] DB error (trending):", err);
  }

  function fmt(n: number) {
    if (n >= 1000) return `${Math.floor(n / 100) / 10}K+`;
    return `${Math.floor(n / 50) * 50}+`;
  }

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
      <section className="dt-gate dt-gate--collage hw-hero-gate-override" style={{ padding: "0", minHeight: "unset" }}>

        <div className="dt-gate__crack" aria-hidden="true" />

        {/* ── Responsive split: stacked on mobile/foldable, side-by-side on desktop ── */}
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

            <div className="dt-gate__collection-badge" style={{ marginBottom: "0" }}>
              <span className="dt-gate__collection-num" style={{ fontSize: "clamp(2rem,5vw,3rem)" }}>{fmt(totalImages)}</span>
              <span className="dt-gate__collection-label">wallpapers &amp; growing</span>
            </div>

            <p className="dt-gate__sub" style={{ fontSize: "clamp(0.95rem,2vw,1.1rem)", lineHeight: "1.65", maxWidth: "480px", margin: 0 }}>
              Where every wallpaper has a secret.
            </p>

            {/* Daily vault copy */}
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

          {/* RIGHT — Phone mockups */}
          <div className="hw-hero-phones-wrap" style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 16px",
            overflow: "visible",
            gap: "10px",
          }}>
              {[
                { src: "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/pin/gorilla-iphone-wallpaper.jpeg", alt: "Gorilla", featured: false },
                { src: "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/wallpapers/shadows-have-eyes-android.webp", alt: "Shadow Eyes", featured: false },
                { src: "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/pin/sinister-cat-shadow.jpeg", alt: "Sinister Cat", featured: true },
                { src: "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/pin/girl-doll.jpeg", alt: "Girl Doll", featured: false },
                { src: "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/wallpapers/hero-2.jpeg", alt: "Dark Art", featured: false },
              ].map((phone, i) => {
                const w = phone.featured ? "240px" : "170px";
                const h = phone.featured ? "520px" : "368px";
                const br = phone.featured ? "42px" : "30px";
                return (
                  <div key={i} style={{ flexShrink: 0, filter: phone.featured ? "drop-shadow(0 0 28px rgba(139,0,0,0.55))" : "none" }}>
                    <div style={{
                      width: w, height: h, borderRadius: br,
                      background: "#080810",
                      border: phone.featured ? "2px solid rgba(139,0,0,0.85)" : "1.5px solid rgba(255,255,255,0.1)",
                      position: "relative", overflow: "hidden",
                      boxShadow: phone.featured ? "0 24px 64px rgba(0,0,0,0.85), 0 0 0 3px rgba(139,0,0,0.25)" : "0 10px 36px rgba(0,0,0,0.65)",
                    }}>
                      {/* side buttons */}
                      <div style={{ position: "absolute", right: "-3px", top: "22%", width: "3px", height: "26px", background: "#1a1a2e", borderRadius: "0 2px 2px 0" }} />
                      <div style={{ position: "absolute", left: "-3px", top: "19%", width: "3px", height: "16px", background: "#1a1a2e", borderRadius: "2px 0 0 2px" }} />
                      <div style={{ position: "absolute", left: "-3px", top: "30%", width: "3px", height: "16px", background: "#1a1a2e", borderRadius: "2px 0 0 2px" }} />
                      {/* dynamic island */}
                      <div style={{ position: "absolute", top: "7px", left: "50%", transform: "translateX(-50%)", width: "32%", height: "9px", background: "#000", borderRadius: "6px", zIndex: 4 }} />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <ProtectedImg src={phone.src} alt={phone.alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading={i < 3 ? "eager" : "lazy"} />
                      {/* Protection overlay */}
                      <ProtectionOverlay />
                      {/* gloss */}
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 42%)", pointerEvents: "none" }} />
                      {/* home bar */}
                      <div style={{ position: "absolute", bottom: "6px", left: "50%", transform: "translateX(-50%)", width: "33%", height: "3px", background: "rgba(255,255,255,0.22)", borderRadius: "2px" }} />
                    </div>
                  </div>
                );
              })}
          </div>

        </div>

      </section>

      <style>{`
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
          }
        }
        @media (max-width: 539px) {
          .hw-hero-split { grid-template-columns: 1fr !important; }
          .hw-hero-phones-wrap {
            padding: 12px 12px 16px !important;
            overflow-x: auto !important;
            justify-content: flex-start !important;
          }
        }
      `}</style>


      <div className="hw-ad-row">
      </div>


      {/* ══════════════════════════════════════════════════════════
          SECTION — NEW THIS WEEK
      ══════════════════════════════════════════════════════════ */}
      {newThisWeek.length > 0 && (
        <section style={{ padding: "clamp(32px,5vw,64px) clamp(16px,5vw,72px)", background: "#07050f", position: "relative", overflow: "hidden" }}>
          {/* Background glow */}
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
      )}

      {/* ══════════════════════════════════════════════════════════
          SECTION — PREMIUM THIS WEEK
      ══════════════════════════════════════════════════════════ */}
      {premiumThisWeek.length > 0 && (() => {
        // EPOCH_MS clock — matches PremiumCountdown.tsx and IphoneImageGrid.tsx exactly
        const EPOCH_MS  = Date.UTC(2025, 0, 1, 0, 0, 0); // Jan 1 2025 00:00 UTC
        const CYCLE_MS  = 48 * 60 * 60 * 1000;            // 48-hour full cycle
        const UNLOCK_MS = 24 * 60 * 60 * 1000;            // first 24h = unlocked
        const pos = (Date.now() - EPOCH_MS) % CYCLE_MS;
        // UNLOCKED = first 24h of each 48h cycle, LOCKED = second 24h
        const isLockedGlobal = pos >= UNLOCK_MS;

        const premiumItems = premiumThisWeek.map((img) => {
          const devicePath = img.deviceType === "IPHONE" ? "iphone" : img.deviceType === "ANDROID" ? "android" : "pc";
          return {
            id: img.id,
            slug: img.slug,
            // LOCKED → hide title ("Sealed Away"), UNLOCKED → show real title
            title: isLockedGlobal ? "Sealed Away" : img.title,
            src: getPublicUrl(img.r2Key),
            devicePath,
            isLocked: isLockedGlobal,
            // LOCKED → href points to vault page so clicking goes nowhere useful
            href: isLockedGlobal ? "#" : undefined,
            updatedAt: img.updatedAt ? new Date(img.updatedAt).toISOString() : null,
          };
        });

        // Section copy flips based on lock state
        const sectionEyebrow = isLockedGlobal ? "Back In The Vault"       : "Hand-Picked Excellence";
        const sectionTitle   = isLockedGlobal ? "Premium — Locked"         : "Premium This Week";
        const sectionSub     = isLockedGlobal
          ? "These pieces are sealed away. Check back when the vault reopens."
          : "The finest pieces from the archive. Surfaces for 24 hours, then sealed away.";

        const countdownDate = new Date().toISOString(); // PremiumCountdown uses fixed weekly clock

        return (
        <section style={{ padding: "clamp(32px,5vw,64px) clamp(16px,5vw,72px)", background: "#0a0810", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(201,168,76,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

          <div className="dt-section-head dt-section-head--center" style={{ marginBottom: "clamp(24px,4vw,40px)" }}>
            <span className="dt-eyebrow" style={{ color: isLockedGlobal ? "#6b6b7a" : "#c9a84c" }}>
              {sectionEyebrow}
            </span>
            <h2 className="dt-section-title">{sectionTitle}</h2>
            <p className="dt-section-sub" style={{ maxWidth: "480px", margin: "0 auto" }}>
              {sectionSub}
            </p>
            {/* Countdown always shown — text inside switches automatically (GONE IN / BACK IN) */}
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
        );
      })()}

      {/* ══════════════════════════════════════════════════════════
          SECTION 2 — DAILY PICK
      ══════════════════════════════════════════════════════════ */}
      {wotd && (() => {
        const devicePath = wotd.deviceType === "IPHONE" ? "iphone" : wotd.deviceType === "ANDROID" ? "android" : "pc";
        const wotdUrl = getPublicUrl(wotd.r2Key);
        const wotdHref = `/${devicePath}/${wotd.slug}`;
        const todayStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
        return (
          <section className="wotd-section">

            {/* ── Atmospheric particles (CSS only, no emoji) ── */}
            <div className="wotd-particles" aria-hidden="true">
              {Array.from({ length: 18 }).map((_, i) => (
                <span key={i} className="wotd-particle" style={{ "--pi": i } as React.CSSProperties} />
              ))}
            </div>

            {/* ── Section header ── */}
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

            {/* ── Phone mockup — top, centered ── */}
            <div className="wotd-top-frame">
              <Link href={wotdHref} className="wotd-img-frame" aria-label={wotd.title}>
                <div className="wotd-img-frame__wrap">
                  <Image src={wotdUrl} alt={wotd.title} fill priority unoptimized className="object-cover"
                    sizes="(max-width:768px) 80vw, 320px" style={{ objectPosition: "center top" }} />
                </div>
                {/* scan line overlay */}
                <div className="wotd-img-frame__scanlines" aria-hidden="true" />
                {/* corner brackets */}
                <div className="wotd-img-frame__corners" aria-hidden="true">
                  <span /><span /><span /><span />
                </div>
                {wotd.deviceType && (
                  <span className="wotd-img-frame__badge">{wotd.deviceType.charAt(0) + wotd.deviceType.slice(1).toLowerCase()}</span>
                )}
                <div className="wotd-img-frame__hover" aria-hidden="true">
                  <span className="wotd-img-frame__hover-text">View Wallpaper</span>
                </div>
                {/* pulsing red eye at bottom */}
                <div className="wotd-img-frame__eye" aria-hidden="true" />
              </Link>
            </div>

            {/* ── Title + actions below ── */}
            <div className="wotd-below">
              <h2 className="wotd-title">{wotd.title}</h2>
              <div className="wotd-actions">
                <Link href={wotdHref} className="wotd-btn-primary">
                  Download This Wallpaper →
                </Link>
              </div>
            </div>

            <style>{`
              /* ── WOTD SECTION SHELL ─────────────────────────────────── */
              .wotd-section {
                position: relative;
                padding: clamp(24px,4vw,48px) clamp(16px,5vw,72px);
                background: #080508;
                overflow: hidden;
              }

              /* Subtle radial red glow in background */
              .wotd-section::before {
                content: '';
                position: absolute;
                inset: 0;
                background:
                  radial-gradient(ellipse 70% 50% at 50% 100%, rgba(192,0,26,0.12) 0%, transparent 65%),
                  radial-gradient(ellipse 40% 30% at 20% 30%, rgba(80,0,10,0.15) 0%, transparent 60%);
                pointer-events: none;
              }

              /* ── PARTICLES (small floating ash specks, CSS only) ──── */
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
                background: rgba(192,0,26,0.4);
                left: calc(var(--pi, 0) * 5.8% + 2%);
                bottom: -10px;
                animation: wotdFloat calc(6s + var(--pi, 0) * 0.7s) ease-in infinite;
                animation-delay: calc(var(--pi, 0) * 0.4s);
                opacity: 0;
              }
              .wotd-particle:nth-child(odd) {
                background: rgba(150,100,50,0.3);
                width: 1.5px; height: 1.5px;
              }
              @keyframes wotdFloat {
                0%   { transform: translateY(0) translateX(0); opacity: 0; }
                10%  { opacity: 0.6; }
                80%  { opacity: 0.3; }
                100% { transform: translateY(-100vh) translateX(calc(sin(var(--pi, 0)) * 40px)); opacity: 0; }
              }

              /* ── SECTION HEADER ─────────────────────────────────────── */
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
                background: linear-gradient(90deg, transparent, rgba(192,0,26,0.5), transparent);
              }
              .wotd-header__center { flex-shrink: 0; }
              .wotd-eyebrow {
                display: flex;
                align-items: center;
                gap: 0.6rem;
                font-size: 0.72rem;
                letter-spacing: 0.22em;
                text-transform: uppercase;
                color: #c0001a;
                font-family: var(--font-space, monospace);
              }
              .wotd-eyebrow__dot {
                display: inline-block;
                width: 5px; height: 5px;
                border-radius: 50%;
                background: #c0001a;
                animation: wotdPulse 2.4s ease-in-out infinite;
              }
              @keyframes wotdPulse {
                0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(192,0,26,0.6); }
                50%       { opacity: 0.6; box-shadow: 0 0 0 5px rgba(192,0,26,0); }
              }

              /* ── CENTERED LAYOUT ─────────────────────────────────────── */
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

              /* ── THE HORROR BOX (kept for reference, unused) ─────────── */
              .wotd-box {
                position: relative;
                max-width: 1100px;
                margin: 0 auto;
                background: linear-gradient(135deg, #0e0608 0%, #110709 50%, #0a0406 100%);
                border: 1px solid rgba(192,0,26,0.3);
                border-radius: 4px;
                overflow: hidden;
                box-shadow:
                  0 0 0 1px rgba(192,0,26,0.08),
                  0 0 40px rgba(192,0,26,0.08),
                  0 20px 80px rgba(0,0,0,0.8),
                  inset 0 0 80px rgba(192,0,26,0.03);
              }

              /* Animated border glow — sweeps around the box */
              .wotd-box__border-glow {
                position: absolute;
                inset: -1px;
                border-radius: 4px;
                background: transparent;
                border: 1px solid transparent;
                background-clip: padding-box;
                pointer-events: none;
                z-index: 0;
              }
              .wotd-box::after {
                content: '';
                position: absolute;
                inset: 0;
                border-radius: 4px;
                padding: 1px;
                background: linear-gradient(
                  var(--wotd-angle, 0deg),
                  transparent 30%,
                  rgba(192,0,26,0.6) 50%,
                  transparent 70%
                );
                -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                -webkit-mask-composite: xor;
                mask-composite: exclude;
                animation: wotdBorderSpin 6s linear infinite;
                pointer-events: none;
              }
              @keyframes wotdBorderSpin {
                0%   { --wotd-angle: 0deg; }
                100% { --wotd-angle: 360deg; }
              }

              /* Corner runes */
              .wotd-box__rune {
                position: absolute;
                font-size: 0.9rem;
                color: rgba(192,0,26,0.5);
                line-height: 1;
                animation: wotdRuneFlicker 4s ease-in-out infinite;
                z-index: 2;
              }
              .wotd-box__rune--tl { top: 10px; left: 14px; animation-delay: 0s; }
              .wotd-box__rune--tr { top: 10px; right: 14px; animation-delay: 1.1s; }
              .wotd-box__rune--bl { bottom: 10px; left: 14px; animation-delay: 2.2s; }
              .wotd-box__rune--br { bottom: 10px; right: 14px; animation-delay: 0.6s; }
              @keyframes wotdRuneFlicker {
                0%, 90%, 100% { opacity: 0.5; }
                92%           { opacity: 0.1; }
                94%           { opacity: 0.5; }
                96%           { opacity: 0.15; }
                98%           { opacity: 0.5; }
              }

              /* Blood drip from top */
              .wotd-box__drip {
                position: absolute;
                top: 0; left: 0; right: 0;
                height: 40px;
                pointer-events: none;
                z-index: 1;
                display: flex;
                justify-content: space-around;
                align-items: flex-start;
                padding: 0 10%;
              }
              .wotd-box__drip-drop {
                display: block;
                width: clamp(2px, 0.3vw, 4px);
                background: linear-gradient(to bottom, #c0001a, rgba(100,0,10,0.2));
                border-radius: 0 0 50% 50%;
                animation: wotdDrip calc(3s + var(--di, 0) * 0.8s) ease-in infinite;
                animation-delay: calc(var(--di, 0) * 0.5s);
                transform-origin: top center;
                height: 0;
              }
              @keyframes wotdDrip {
                0%   { height: 0; opacity: 0; }
                15%  { height: clamp(8px,2vw,24px); opacity: 0.9; }
                60%  { height: clamp(8px,2vw,24px); opacity: 0.6; }
                100% { height: clamp(4px,1vw,14px); opacity: 0; }
              }

              /* ── BOX INNER GRID ──────────────────────────────────────── */
              .wotd-box__inner {
                position: relative;
                z-index: 1;
                display: grid;
                grid-template-columns: clamp(120px, 14vw, 200px) 1fr;
                gap: clamp(16px, 3vw, 40px);
                align-items: center;
                padding: clamp(20px, 3vw, 40px) clamp(20px, 4vw, 48px);
              }

              /* ── IMAGE FRAME ─────────────────────────────────────────── */
              .wotd-img-frame {
                position: relative;
                display: block;
                aspect-ratio: 9 / 16;
                width: 100%;
                border-radius: 16px;
                overflow: hidden;
                border: 1.5px solid rgba(192,0,26,0.4);
                box-shadow:
                  0 0 0 1px rgba(255,34,51,0.06),
                  0 8px 40px rgba(0,0,0,0.8),
                  0 0 60px rgba(192,0,26,0.15);
                text-decoration: none;
                transition: transform 0.35s ease, box-shadow 0.35s ease;
                flex-shrink: 0;
              }
              .wotd-img-frame:hover {
                transform: translateY(-6px) scale(1.015);
                box-shadow:
                  0 0 0 1px rgba(255,34,51,0.18),
                  0 20px 70px rgba(0,0,0,0.9),
                  0 0 90px rgba(192,0,26,0.28);
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
                border-color: rgba(192,0,26,0.7);
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
                border: 1px solid rgba(192,0,26,0.4);
                color: #c0001a;
                border-radius: 2px;
                font-family: var(--font-space, monospace);
              }
              .wotd-img-frame__hover {
                position: absolute;
                inset: 0;
                background: rgba(192,0,26,0.15);
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
              /* pulsing red eye glow at bottom of frame */
              .wotd-img-frame__eye {
                position: absolute;
                bottom: 0; left: 50%;
                transform: translateX(-50%);
                width: 60%; height: 2px;
                background: rgba(192,0,26,0.7);
                box-shadow: 0 0 18px 6px rgba(192,0,26,0.4);
                animation: wotdEyePulse 3s ease-in-out infinite;
                border-radius: 50%;
              }
              @keyframes wotdEyePulse {
                0%, 100% { opacity: 0.5; width: 40%; }
                50%       { opacity: 1;   width: 70%; box-shadow: 0 0 28px 10px rgba(192,0,26,0.5); }
              }

              /* ── TITLE ──────────────────────────────────────────────── */
              .wotd-title {
                font-size: clamp(1.2rem, 2.2vw, 1.9rem);
                line-height: 1.12;
                margin: 0;
                color: #f0e8d8;
                font-family: var(--font-cinzel, serif);
                text-shadow: 0 2px 20px rgba(192,0,26,0.2);
                letter-spacing: 0.02em;
              }
              /* Creep bar removed */

              /* ── BUTTONS ─────────────────────────────────────────────── */
              .wotd-actions {
                display: flex;
                gap: 0.75rem;
                flex-wrap: wrap;
                align-items: center;
              }
              .wotd-btn-primary {
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.75rem 1.5rem;
                background: #c0001a;
                color: #fff;
                border: 1px solid #c0001a;
                border-radius: 2px;
                font-size: 0.8rem;
                letter-spacing: 0.12em;
                text-transform: uppercase;
                text-decoration: none;
                font-family: var(--font-space, monospace);
                transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
                position: relative;
                overflow: hidden;
              }
              .wotd-btn-primary::before {
                content: '';
                position: absolute;
                inset: 0;
                background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%);
                transform: translateX(-100%);
                transition: transform 0.4s ease;
              }
              .wotd-btn-primary:hover::before { transform: translateX(100%); }
              .wotd-btn-primary:hover {
                background: #a0001a;
                box-shadow: 0 0 24px rgba(192,0,26,0.5);
                transform: translateY(-1px);
              }
              .wotd-btn-ghost {
                display: inline-flex;
                align-items: center;
                padding: 0.75rem 1.25rem;
                background: transparent;
                color: rgba(200,180,140,0.8);
                border: 1px solid rgba(200,170,110,0.25);
                border-radius: 2px;
                font-size: 0.8rem;
                letter-spacing: 0.1em;
                text-transform: uppercase;
                text-decoration: none;
                font-family: var(--font-space, monospace);
                transition: color 0.2s, border-color 0.2s, background 0.2s;
              }
              .wotd-btn-ghost:hover {
                color: #f0e8d8;
                border-color: rgba(200,170,110,0.5);
                background: rgba(200,170,110,0.05);
              }

              /* ── RESPONSIVE ──────────────────────────────────────────── */
              @media (max-width: 680px) {
                .wotd-top-frame .wotd-img-frame {
                  width: clamp(140px, 50vw, 200px);
                }
                .wotd-title { font-size: clamp(1.1rem, 4vw, 1.5rem); }
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
                  <ProtectedImg
                    src={phone.src}
                    alt={phone.alt}
                    className="dt-phone-card__img"
                    loading="lazy"
                  />
                  {/* Protection overlay */}
                  <ProtectionOverlay />

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
                <ProtectedImg
                  src="https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/monster-flower-offering-pc.webp"
                  alt="Monster Flower Offering — PC wallpaper 16:9"
                  className="dt-monitor__img"
                />
                {/* Protection overlay */}
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


      {/* ══════════════════════════════════════════════════════════
          SECTION — MATCHING SETS
      ══════════════════════════════════════════════════════════ */}
      <section style={{
        padding: "clamp(32px,5vw,64px) clamp(16px,5vw,72px)",
        background: "#08060f",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(192,0,26,0.07) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />

        <div className="dt-section-head dt-section-head--center" style={{ marginBottom: "clamp(28px,4vw,44px)", position: "relative" }}>
          <span className="dt-eyebrow" style={{ color: "#c0001a" }}>Full Digital Identity</span>
          <h2 className="dt-section-title">Premium Matching Horror Setup Kits</h2>
          <p className="dt-section-sub" style={{ maxWidth: "620px", margin: "0 auto" }}>
            Own the aesthetic across every device. Download professional 4K horror wallpaper kits curated for iPhone, Android, and PC. One dark vision, perfectly optimized for every screen you carry.
          </p>
        </div>

        <div style={{ maxWidth: "1000px", margin: "0 auto", position: "relative" }}>
          <Link href="/sets/haunted-anime-student" style={{ textDecoration: "none", display: "block" }}>
            <div className="hw-sets-card">
              {/* Collage: PC + Phone + Watch */}
              <div className="hw-sets-collage">
                {/* Desktop 16:9 */}
                <div className="hw-sets-desktop">
                  <span className="hw-sets-device-label">Desktop 16:9</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/sets/The%20Cursed%20Student%3A%20A%20Matching%20Dark%20Anime%20Horror%20Kit/cursed-student-dark-anime-4k-desktop-background.webp"
                    alt="Cursed Student dark anime 4K desktop background psychological horror"
                    className="hw-sets-desktop__img"
                    loading="lazy"
                  />
                  <div className="hw-sets-scanlines" aria-hidden="true" />
                </div>

                {/* Phone 9:16 */}
                <div className="hw-sets-phone">
                  <span className="hw-sets-device-label">Lockscreen 9:16</span>
                  <div className="hw-sets-phone__shell">
                    <div className="hw-sets-phone__island" aria-hidden="true" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/sets/The%20Cursed%20Student%3A%20A%20Matching%20Dark%20Anime%20Horror%20Kit/cursed-student-dark-anime-horror-wallpaper-mobile.webp"
                      alt="Cursed Student dark anime horror mobile lockscreen wallpaper"
                      className="hw-sets-phone__img"
                      loading="lazy"
                    />
                    <div className="hw-sets-phone__gloss" aria-hidden="true" />
                    <div className="hw-sets-phone__bar" aria-hidden="true" />
                  </div>
                </div>

                {/* Watch 1:1 */}
                <div className="hw-sets-watch">
                  <span className="hw-sets-device-label">Watch 1:1</span>
                  <div className="hw-sets-watch__shell">
                    <div className="hw-sets-watch__crown" aria-hidden="true" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/sets/The%20Cursed%20Student%3A%20A%20Matching%20Dark%20Anime%20Horror%20Kit/haunted-anime-boy-red-eyes-smartwatch-wallpaper.webp"
                      alt="Haunted anime boy red eyes smartwatch wallpaper Apple Watch"
                      className="hw-sets-watch__img"
                      loading="lazy"
                    />
                    <div className="hw-sets-watch__gloss" aria-hidden="true" />
                  </div>
                </div>
              </div>

              {/* Text */}
              <div className="hw-sets-info">
                <span className="hw-sets-info__tag">Set No. 01</span>
                <h3 className="hw-sets-info__title">The Cursed Student</h3>
                <p className="hw-sets-info__sub">A Matching Dark Anime Horror Kit</p>
                <p className="hw-sets-info__desc">
                  A psychological horror anime aesthetic for every screen you own. Three phases of possession unified across your phone lock screen, home screen, smartwatch face, desktop background, and profile picture.
                </p>
                <div className="hw-sets-info__devices">
                  {["Phone Lockscreen", "Home Screen", "Smartwatch", "Desktop", "Avatar"].map(d => (
                    <span key={d} className="hw-sets-info__chip">{d}</span>
                  ))}
                </div>
                <a href="/sets/haunted-anime-student" className="hw-sets-cta-btn">
                  ↓ Download Free 4K Kit
                </a>
                <p className="hw-sets-info__oled-note">Includes 5 matching 4K files optimized for OLED and Retina displays.</p>
              </div>
            </div>
          </Link>

          {/* ── Beautiful Animated Device Mockups ── */}
          <div className="hw-sets-mockups-row" aria-label="Device mockup preview">
            {/* Desktop mockup */}
            <div className="hw-sets-mockup hw-sets-mockup--desktop">
              <div className="hw-sets-mockup__label">Desktop · 16:9</div>
              <div className="hw-sets-mockup__shell hw-sets-mockup__shell--desktop">
                <div className="hw-sets-mockup__desktop-bar">
                  <span className="hw-sets-mockup__dot" style={{ background: "#ff5f57" }} />
                  <span className="hw-sets-mockup__dot" style={{ background: "#febc2e" }} />
                  <span className="hw-sets-mockup__dot" style={{ background: "#28c840" }} />
                </div>
                <div className="hw-sets-mockup__screen">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/sets/The%20Cursed%20Student%3A%20A%20Matching%20Dark%20Anime%20Horror%20Kit/cursed-student-dark-anime-4k-desktop-background.webp"
                    alt="Cursed Student dark anime 4K desktop wallpaper"
                    className="hw-sets-mockup__img"
                    loading="lazy"
                  />
                  <div className="hw-sets-mockup__scanlines" aria-hidden="true" />
                  <div className="hw-sets-mockup__glow-overlay" aria-hidden="true" />
                </div>
                <div className="hw-sets-mockup__desktop-stand" aria-hidden="true" />
                <div className="hw-sets-mockup__desktop-base" aria-hidden="true" />
              </div>
            </div>

            {/* iPhone mockup */}
            <div className="hw-sets-mockup hw-sets-mockup--phone">
              <div className="hw-sets-mockup__label">iPhone · 9:16</div>
              <div className="hw-sets-mockup__shell hw-sets-mockup__shell--phone">
                <div className="hw-sets-mockup__phone-btn hw-sets-mockup__phone-btn--vol1" aria-hidden="true" />
                <div className="hw-sets-mockup__phone-btn hw-sets-mockup__phone-btn--vol2" aria-hidden="true" />
                <div className="hw-sets-mockup__phone-btn hw-sets-mockup__phone-btn--pwr" aria-hidden="true" />
                <div className="hw-sets-mockup__island" aria-hidden="true" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/sets/The%20Cursed%20Student%3A%20A%20Matching%20Dark%20Anime%20Horror%20Kit/cursed-student-dark-anime-horror-wallpaper-mobile.webp"
                  alt="Cursed Student dark anime iPhone lockscreen wallpaper 9:16"
                  className="hw-sets-mockup__img hw-sets-mockup__img--full"
                  loading="lazy"
                />
                <div className="hw-sets-mockup__gloss" aria-hidden="true" />
                <div className="hw-sets-mockup__home-bar" aria-hidden="true" />
              </div>
            </div>

            {/* Apple Watch mockup */}
            <div className="hw-sets-mockup hw-sets-mockup--watch">
              <div className="hw-sets-mockup__label">Watch · 1:1</div>
              <div className="hw-sets-mockup__shell hw-sets-mockup__shell--watch">
                <div className="hw-sets-mockup__watch-crown" aria-hidden="true" />
                <div className="hw-sets-mockup__watch-btn" aria-hidden="true" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/sets/The%20Cursed%20Student%3A%20A%20Matching%20Dark%20Anime%20Horror%20Kit/haunted-anime-boy-red-eyes-smartwatch-wallpaper.webp"
                  alt="Haunted anime boy red eyes Apple Watch wallpaper 1:1"
                  className="hw-sets-mockup__img hw-sets-mockup__img--full"
                  loading="lazy"
                />
                <div className="hw-sets-mockup__gloss" aria-hidden="true" />
                <div className="hw-sets-mockup__watch-strap-top" aria-hidden="true" />
                <div className="hw-sets-mockup__watch-strap-bot" aria-hidden="true" />
              </div>
            </div>
          </div>

          {/* ── Set No. 02 — The Whispering Woods ── */}
          <Link href="/sets/whispering-woods" style={{ textDecoration: "none", display: "block", marginTop: "clamp(24px,3vw,40px)" }}>
            <div className="hw-sets-card">
              {/* Collage: PC + Phone + Watch */}
              <div className="hw-sets-collage">
                {/* Desktop 16:9 */}
                <div className="hw-sets-desktop">
                  <span className="hw-sets-device-label">Desktop 16:9</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/sets/The%20Whispering%20Woods%3A%20A%20Matching%20Dark%20Nature%20Setup%20Kit/whispering-woods-foggy-horror-forest-4k-deskto.webp"
                    alt="Whispering Woods foggy horror forest 4K desktop background"
                    className="hw-sets-desktop__img"
                    loading="lazy"
                  />
                  <div className="hw-sets-scanlines" aria-hidden="true" />
                </div>
                {/* Phone 9:16 */}
                <div className="hw-sets-phone">
                  <span className="hw-sets-device-label">Lockscreen 9:16</span>
                  <div className="hw-sets-phone__shell">
                    <div className="hw-sets-phone__island" aria-hidden="true" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/sets/The%20Whispering%20Woods%3A%20A%20Matching%20Dark%20Nature%20Setup%20Kit/dark-forest-cabin-horror-aesthetic-iphone-wallpaper.webp"
                      alt="Dark forest cabin horror aesthetic iPhone lockscreen wallpaper"
                      className="hw-sets-phone__img"
                      loading="lazy"
                    />
                    <div className="hw-sets-phone__gloss" aria-hidden="true" />
                    <div className="hw-sets-phone__bar" aria-hidden="true" />
                  </div>
                </div>
                {/* Watch 1:1 */}
                <div className="hw-sets-watch">
                  <span className="hw-sets-device-label">Watch 1:1</span>
                  <div className="hw-sets-watch__shell">
                    <div className="hw-sets-watch__crown" aria-hidden="true" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/sets/The%20Whispering%20Woods%3A%20A%20Matching%20Dark%20Nature%20Setup%20Kit/yellow-glowing-eyes-mist-smartwatch-wallpaper.webp"
                      alt="Yellow glowing eyes mist horror smartwatch wallpaper Apple Watch"
                      className="hw-sets-watch__img"
                      loading="lazy"
                    />
                    <div className="hw-sets-watch__gloss" aria-hidden="true" />
                  </div>
                </div>
              </div>
              {/* Text */}
              <div className="hw-sets-info">
                <span className="hw-sets-info__tag">Set No. 02</span>
                <h3 className="hw-sets-info__title">The Whispering Woods</h3>
                <p className="hw-sets-info__sub">A Matching Dark Nature Horror Kit</p>
                <p className="hw-sets-info__desc">
                  A dark forest horror aesthetic for every screen you own. Three phases of a forest that never sleeps — unified across your phone lockscreen, home screen, smartwatch face, and desktop.
                </p>
                <div className="hw-sets-info__devices">
                  {["Phone Lockscreen", "Home Screen", "Smartwatch", "Desktop", "Avatar"].map(d => (
                    <span key={d} className="hw-sets-info__chip">{d}</span>
                  ))}
                </div>
                <a href="/sets/whispering-woods" className="hw-sets-cta-btn">
                  ↓ Download Free 4K Kit
                </a>
                <p className="hw-sets-info__oled-note">Includes 5 matching 4K files optimized for OLED and Retina displays.</p>
              </div>
            </div>
          </Link>

          <div style={{ textAlign: "center", marginTop: "24px", position: "relative" }}>
            <Link href="/sets" style={{
              fontFamily: "var(--font-space, monospace)",
              fontSize: "0.62rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#60608a",
              textDecoration: "none",
            }}>
              Browse All Matching Sets →
            </Link>
          </div>
        </div>

        <style>{`
          .hw-sets-card {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: clamp(20px,3vw,48px);
            background: rgba(255,255,255,0.02);
            border: 1px solid rgba(192,0,26,0.22);
            padding: clamp(20px,3vw,36px);
            position: relative;
            overflow: hidden;
            transition: border-color 0.3s ease, box-shadow 0.3s ease;
            cursor: pointer;
          }
          .hw-sets-card:hover {
            border-color: rgba(192,0,26,0.48);
            box-shadow: 0 0 60px rgba(192,0,26,0.07);
          }
          .hw-sets-card::before {
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(ellipse 50% 60% at 0% 100%, rgba(192,0,26,0.04), transparent);
            pointer-events: none;
          }
          .hw-sets-collage {
            display: grid;
            grid-template-columns: 1fr 88px 68px;
            gap: 10px;
            align-items: end;
          }
          .hw-sets-device-label {
            display: block;
            font-family: var(--font-space, monospace);
            font-size: 0.48rem;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: rgba(255,255,255,0.35);
            margin-bottom: 6px;
          }
          .hw-sets-desktop { grid-column: 1; grid-row: 1 / 3; position: relative; }
          .hw-sets-desktop__img {
            width: 100%;
            aspect-ratio: 16/9;
            object-fit: cover;
            display: block;
            border-radius: 3px;
            border: 1.5px solid rgba(192,0,26,0.3);
            box-shadow: 0 8px 32px rgba(0,0,0,0.7);
            transition: transform 0.5s ease;
          }
          .hw-sets-card:hover .hw-sets-desktop__img { transform: scale(1.02); }
          .hw-sets-scanlines {
            position: absolute; inset: 0;
            background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 4px);
            pointer-events: none;
            border-radius: 3px;
          }
          .hw-sets-phone { grid-column: 2; grid-row: 1 / 3; }
          .hw-sets-phone__shell {
            position: relative;
            width: 100%;
            aspect-ratio: 9/16;
            border-radius: 14px;
            overflow: hidden;
            border: 1.5px solid rgba(192,0,26,0.35);
            background: #080810;
            box-shadow: 0 0 28px rgba(192,0,26,0.12), 0 8px 32px rgba(0,0,0,0.75);
          }
          .hw-sets-phone__island {
            position: absolute;
            top: 5px; left: 50%;
            transform: translateX(-50%);
            width: 36%; height: 7px;
            background: #000;
            border-radius: 4px;
            z-index: 3;
          }
          .hw-sets-phone__img { width: 100%; height: 100%; object-fit: cover; display: block; }
          .hw-sets-phone__gloss {
            position: absolute; inset: 0;
            background: linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 40%);
            pointer-events: none;
          }
          .hw-sets-phone__bar {
            position: absolute;
            bottom: 5px; left: 50%;
            transform: translateX(-50%);
            width: 33%; height: 2px;
            background: rgba(255,255,255,0.22);
            border-radius: 2px;
          }
          .hw-sets-watch { grid-column: 3; grid-row: 2; align-self: end; }
          .hw-sets-watch__shell {
            position: relative;
            width: 100%;
            aspect-ratio: 1/1;
            border-radius: 30% / 26%;
            overflow: hidden;
            border: 1.5px solid rgba(192,0,26,0.28);
            background: #080810;
            box-shadow: 0 0 20px rgba(192,0,26,0.1), 0 5px 20px rgba(0,0,0,0.7);
          }
          .hw-sets-watch__crown {
            position: absolute;
            right: -5px; top: 42%;
            width: 5px; height: 14px;
            background: #181828;
            border-radius: 0 2px 2px 0;
          }
          .hw-sets-watch__img { width: 100%; height: 100%; object-fit: cover; display: block; }
          .hw-sets-watch__gloss {
            position: absolute; inset: 0;
            background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 45%);
            pointer-events: none;
          }
          .hw-sets-info {
            display: flex;
            flex-direction: column;
            gap: 12px;
            justify-content: center;
          }
          .hw-sets-info__tag {
            font-family: var(--font-space, monospace);
            font-size: 0.54rem;
            letter-spacing: 0.26em;
            text-transform: uppercase;
            color: #c0001a;
          }
          .hw-sets-info__title {
            font-family: var(--font-cinzel, serif);
            font-size: clamp(1.3rem,2.5vw,1.9rem);
            font-weight: 700;
            color: #f0e8d8;
            margin: 0;
            letter-spacing: 0.04em;
            line-height: 1.1;
          }
          .hw-sets-info__sub {
            font-family: var(--font-space, monospace);
            font-size: 0.58rem;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            color: rgba(192,0,26,0.75);
            margin: 0;
          }
          .hw-sets-info__desc {
            font-family: var(--font-cormorant, serif);
            font-size: clamp(0.95rem,1.4vw,1.05rem);
            line-height: 1.7;
            color: rgba(224,224,248,0.6);
            margin: 0;
          }
          .hw-sets-info__devices { display: flex; flex-wrap: wrap; gap: 7px; }
          .hw-sets-info__chip {
            font-family: var(--font-space, monospace);
            font-size: 0.52rem;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: rgba(192,0,26,0.85);
            border: 1px solid rgba(192,0,26,0.3);
            padding: 3px 9px;
            background: rgba(192,0,26,0.05);
            border-radius: 2px;
          }
          .hw-sets-info__cta {
            display: inline-block;
            font-family: var(--font-space, monospace);
            font-size: 0.68rem;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: #c0001a;
            margin-top: 4px;
            transition: letter-spacing 0.2s ease;
          }
          .hw-sets-card:hover .hw-sets-info__cta { letter-spacing: 0.22em; }

          @media (max-width: 680px) {
            .hw-sets-card { grid-template-columns: 1fr; }
            .hw-sets-collage { grid-template-columns: 1fr 90px 70px; }
          }
          @media (max-width: 400px) {
            .hw-sets-collage { grid-template-columns: 1fr 70px; }
            .hw-sets-watch { display: none; }
          }

          /* ── Red CTA Button ── */
          .hw-sets-cta-btn {
            display: inline-flex; align-items: center; justify-content: center;
            padding: 14px 28px; background: #c0001a; color: #fff !important;
            border: none; border-radius: 3px; font-family: var(--font-space, monospace);
            font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase;
            text-decoration: none !important; font-weight: 700;
            box-shadow: 0 0 28px rgba(192,0,26,0.45), 0 4px 16px rgba(0,0,0,0.5);
            transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
            cursor: pointer; margin-top: 4px; position: relative; overflow: hidden;
          }
          .hw-sets-cta-btn::before {
            content: ''; position: absolute; inset: 0;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
            transform: translateX(-100%); transition: transform 0.4s ease;
          }
          .hw-sets-cta-btn:hover::before { transform: translateX(100%); }
          .hw-sets-cta-btn:hover {
            background: #a0001a;
            box-shadow: 0 0 40px rgba(192,0,26,0.65), 0 4px 20px rgba(0,0,0,0.6);
            transform: translateY(-2px);
          }
          .hw-sets-info__oled-note {
            font-family: var(--font-space, monospace); font-size: 0.54rem;
            letter-spacing: 0.12em; color: rgba(192,0,26,0.65);
            margin: 4px 0 0; line-height: 1.5;
          }
          /* ══ DEVICE MOCKUPS ROW ══ */
          .hw-sets-mockups-row {
            display: flex; gap: clamp(20px,3vw,40px); align-items: flex-end;
            justify-content: center; margin-top: clamp(36px,5vw,56px);
            padding: clamp(20px,3vw,32px); background: rgba(0,0,0,0.25);
            border: 1px solid rgba(20,20,35,0.8); border-radius: 8px;
          }
          .hw-sets-mockup { display: flex; flex-direction: column; align-items: center; gap: 12px; }
          .hw-sets-mockup__label {
            font-family: var(--font-space, monospace); font-size: 0.52rem;
            letter-spacing: 0.22em; text-transform: uppercase; color: rgba(255,255,255,0.4);
          }
          .hw-sets-mockup--desktop { flex: 1; max-width: 520px; min-width: 220px; }
          .hw-sets-mockup__shell--desktop {
            width: 100%; border-radius: 10px 10px 4px 4px; background: #0a0a14;
            border: 2px solid #0f0f1e;
            animation: hw-glow-desktop 4s ease-in-out infinite;
            box-shadow: 0 0 0 3px #0a0a14, 0 0 0 5px rgba(20,20,40,0.9), 0 0 60px rgba(0,0,0,0.5);
          }
          @keyframes hw-glow-desktop {
            0%,100% { box-shadow: 0 0 0 3px #0a0a14, 0 0 0 5px rgba(20,20,40,0.9), 0 0 60px rgba(0,0,0,0.5); }
            50%      { box-shadow: 0 0 0 3px #0a0a14, 0 0 0 5px rgba(20,20,40,0.9), 0 0 60px rgba(0,0,0,0.5), 0 0 80px rgba(10,0,40,0.18); }
          }
          .hw-sets-mockup__desktop-bar {
            height: 22px; background: #111120; border-radius: 8px 8px 0 0;
            display: flex; align-items: center; padding: 0 10px; gap: 5px;
          }
          .hw-sets-mockup__dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; }
          .hw-sets-mockup__screen { position: relative; width: 100%; aspect-ratio: 16/9; overflow: hidden; background: #080810; }
          .hw-sets-mockup__img { width: 100%; height: 100%; object-fit: cover; display: block; }
          .hw-sets-mockup__img--full { position: absolute; inset: 0; }
          .hw-sets-mockup__scanlines {
            position: absolute; inset: 0;
            background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px);
            pointer-events: none;
          }
          .hw-sets-mockup__glow-overlay {
            position: absolute; inset: 0;
            background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 40%);
            pointer-events: none;
          }
          .hw-sets-mockup__desktop-stand { width: 18%; height: 14px; margin: 0 auto; background: #111120; border-radius: 0 0 3px 3px; }
          .hw-sets-mockup__desktop-base { width: 35%; height: 6px; margin: 0 auto; background: #111120; border-radius: 3px; }
          .hw-sets-mockup--phone { width: clamp(90px,12vw,140px); flex-shrink: 0; }
          .hw-sets-mockup__shell--phone {
            position: relative; width: 100%; aspect-ratio: 9/16;
            border-radius: clamp(18px,3vw,28px); overflow: hidden; background: #080810;
            border: 2px solid #0f0f1e;
            animation: hw-glow-phone 4s ease-in-out infinite 1s;
            box-shadow: 0 0 0 3px #0a0a14, 0 0 0 5px rgba(20,20,40,0.9), 0 16px 60px rgba(0,0,0,0.65);
          }
          @keyframes hw-glow-phone {
            0%,100% { box-shadow: 0 0 0 3px #0a0a14, 0 0 0 5px rgba(20,20,40,0.9), 0 16px 60px rgba(0,0,0,0.65); }
            50%      { box-shadow: 0 0 0 3px #0a0a14, 0 0 0 5px rgba(20,20,40,0.9), 0 16px 60px rgba(0,0,0,0.65), 0 0 50px rgba(10,0,40,0.2); }
          }
          .hw-sets-mockup__phone-btn { position: absolute; background: #111120; border-radius: 2px; }
          .hw-sets-mockup__phone-btn--vol1 { left: -3px; top: 22%; width: 3px; height: 14%; }
          .hw-sets-mockup__phone-btn--vol2 { left: -3px; top: 38%; width: 3px; height: 14%; }
          .hw-sets-mockup__phone-btn--pwr  { right: -3px; top: 30%; width: 3px; height: 18%; }
          .hw-sets-mockup__island { position: absolute; top: 6px; left: 50%; transform: translateX(-50%); width: 35%; height: 8px; background: #000; border-radius: 5px; z-index: 4; }
          .hw-sets-mockup__gloss { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 40%); pointer-events: none; z-index: 3; }
          .hw-sets-mockup__home-bar { position: absolute; bottom: 5px; left: 50%; transform: translateX(-50%); width: 33%; height: 3px; background: rgba(255,255,255,0.2); border-radius: 2px; z-index: 3; }
          .hw-sets-mockup--watch { width: clamp(70px,9vw,110px); flex-shrink: 0; }
          .hw-sets-mockup__shell--watch {
            position: relative; width: 100%; aspect-ratio: 1/1;
            border-radius: 32% / 28%; overflow: hidden; background: #080810;
            border: 2px solid #0f0f1e;
            animation: hw-glow-watch 4s ease-in-out infinite 2s;
            box-shadow: 0 0 0 3px #0a0a14, 0 0 0 5px rgba(20,20,40,0.9), 0 8px 32px rgba(0,0,0,0.7);
          }
          @keyframes hw-glow-watch {
            0%,100% { box-shadow: 0 0 0 3px #0a0a14, 0 0 0 5px rgba(20,20,40,0.9), 0 8px 32px rgba(0,0,0,0.7); }
            50%      { box-shadow: 0 0 0 3px #0a0a14, 0 0 0 5px rgba(20,20,40,0.9), 0 8px 32px rgba(0,0,0,0.7), 0 0 40px rgba(10,0,40,0.18); }
          }
          .hw-sets-mockup__watch-crown { position: absolute; right: -5px; top: 38%; width: 5px; height: 22%; background: #111120; border-radius: 0 3px 3px 0; z-index: 5; }
          .hw-sets-mockup__watch-btn { position: absolute; right: -5px; top: 62%; width: 5px; height: 12%; background: #111120; border-radius: 0 2px 2px 0; z-index: 5; }
          .hw-sets-mockup__watch-strap-top { position: absolute; top: -22px; left: 10%; right: 10%; height: 24px; background: #0d0d1a; border-radius: 4px 4px 0 0; z-index: -1; }
          .hw-sets-mockup__watch-strap-bot { position: absolute; bottom: -22px; left: 10%; right: 10%; height: 24px; background: #0d0d1a; border-radius: 0 0 4px 4px; z-index: -1; }
          @media (max-width: 680px) {
            .hw-sets-mockups-row { flex-direction: column; align-items: center; gap: 28px; }
            .hw-sets-mockup--desktop { width: 100%; max-width: 380px; }
            .hw-sets-mockup--phone { width: 120px; }
            .hw-sets-mockup--watch { width: 90px; }
          }
        `}</style>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION — THE HAUNTED WALLPAPERS MISSION
      ══════════════════════════════════════════════════════════ */}
      <section style={{
        padding: "clamp(48px,7vw,96px) clamp(16px,5vw,72px)",
        background: "linear-gradient(180deg, #07050d 0%, #0a0612 100%)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(192,0,26,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative" }}>
          <div className="dt-section-head dt-section-head--center" style={{ marginBottom: "clamp(24px,4vw,40px)" }}>
            <span className="dt-eyebrow" style={{ color: "#c0001a" }}>Our Purpose</span>
            <h2 className="dt-section-title">The Haunted Wallpapers Mission</h2>
          </div>
          <div style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(192,0,26,0.2)", padding: "clamp(28px,4vw,56px)", position: "relative" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, transparent, rgba(192,0,26,0.6), transparent)" }} />
            <p style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: "clamp(1.05rem,1.8vw,1.2rem)", lineHeight: 1.85, color: "rgba(224,224,248,0.72)", margin: 0 }}>
              At Haunted Wallpapers, we believe your digital setup should be an extension of your soul.
              We don&apos;t just &ldquo;dump&rdquo; images. Every wallpaper is manually curated and tested on real devices
              to ensure perfect crops for iPhone, Samsung, and Desktop. Our unique &ldquo;Matching Set&rdquo; philosophy
              ensures your watch, phone, and PC tell one cohesive story. Built for horror fans, by horror fans.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION — TRENDING THIS WEEK
      ══════════════════════════════════════════════════════════ */}
      {trendingThisWeek.length > 0 && (
        <section style={{ padding: "clamp(32px,5vw,64px) clamp(16px,5vw,72px)", background: "#060410", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(192,0,26,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

          <div className="dt-section-head dt-section-head--center" style={{ marginBottom: "clamp(24px,4vw,40px)" }}>
            <span className="dt-eyebrow" style={{ color: "#c0453a" }}>🔥 Most Downloaded</span>
            <h2 className="dt-section-title">Most Downloaded</h2>
            <p className="dt-section-sub" style={{ maxWidth: "480px", margin: "0 auto" }}>
              The most downloaded wallpapers of all time.
            </p>
          </div>

          <WallpaperCardGrid
            accentRgb="192,0,26"
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
      )}

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
            const thumb = obs.thumbnail ? (obs.thumbnail.startsWith('http') ? obs.thumbnail : `${r2Base}/${obs.thumbnail}`) : null;
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

      <HorrorFact />

      <div className="hw-ad-row">
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