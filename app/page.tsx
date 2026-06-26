// app/page.tsx — Haunted Wallpapers Homepage

import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import Image from "next/image";
import { db, getWallpaperOfTheDay, getPageContent } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import PremiumCountdown from "@/components/PremiumCountdown";
import StreakBar from "@/components/StreakBar";
import WallpaperCardGridClient from "@/components/WallpaperCardGridClient";
import TonightSlider from "@/components/TonightSlider";
import "./homepage.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";
const OG_IMAGE = `${SITE_URL}/og-image.jpg`;
const CDN      = "https://assets.hauntedwallpapers.com";
const HERO_IMG = `${CDN}/haunted-wallpapers-hero-image.avif`;

// ─── Cached DB queries — all revalidate every 5 minutes ──────────────────────
// Previously these ran fresh on every request, causing ~1.5–2 s of TTFB.
// Now they hit the Next.js data cache and return in <50 ms on warm hits.

const getCachedWotd = () => {
  const todayKey = new Date().toISOString().slice(0, 10);
  return unstable_cache(
    () => getWallpaperOfTheDay(),
    [`wotd-${todayKey}`],
    { revalidate: 86400 },
  )();
};

const getCachedTotalImages = unstable_cache(
  () => db.image.count(),
  ["homepage-total-images"],
  { revalidate: 300 },
);

const getCachedNewThisWeek = unstable_cache(
  () => db.image.findMany({
    where: {
      isAdult: false,
      tags: { has: "badge-new" },
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      NOT: { tags: { has: "badge-premium" } },
    },
    orderBy: { createdAt: "desc" },
    take: 16,
    select: { id: true, slug: true, title: true, r2Key: true, deviceType: true, tags: true },
  }),
  ["homepage-new-this-week"],
  { revalidate: 300 },
);

const getCachedPremiumThisWeek = unstable_cache(
  () => db.image.findMany({
    where: { tags: { has: "badge-premium" }, isAdult: false },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: { id: true, slug: true, title: true, r2Key: true, deviceType: true, tags: true, updatedAt: true },
  }),
  ["homepage-premium-this-week"],
  { revalidate: 300 },
);

const getCachedPageContent = unstable_cache(
  () => getPageContent("home"),
  ["homepage-page-content"],
  { revalidate: 3600 },
);

export async function generateMetadata(): Promise<Metadata> {
  const pageContent = await getCachedPageContent();
  const desc = pageContent?.metaDesc ??
    "Free dark fantasy wallpapers for iPhone and Android. Gothic, horror, cosmic art — no sign-up, always free.";
  const title = pageContent?.title ??
    "Haunted Wallpapers | Free Dark Fantasy & Horror Wallpapers";
  return {
    title,
    description: desc,
    metadataBase: new URL(SITE_URL),
    openGraph: {
      title, description: desc, url: SITE_URL,
      siteName: "Haunted Wallpapers", type: "website",
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Haunted Wallpapers" }],
    },
    twitter: { card: "summary_large_image", title, description: desc, images: [OG_IMAGE] },
    alternates: { canonical: SITE_URL },
  };
}

export const revalidate = 3600;

const WORLDS = [
  { key: "red",    label: "Crimson", sub: "Dark & Fire",     dot: "#e0001f", glow: "rgba(192,0,26,0.5)",   border: "rgba(192,0,26,0.4)"    },
  { key: "purple", label: "Void",    sub: "Cosmic & mystic", dot: "#7c3aed", glow: "rgba(124,58,237,0.5)", border: "rgba(147,51,234,0.4)"  },
  { key: "green",  label: "Haunted", sub: "Forest & dark",   dot: "#16a34a", glow: "rgba(22,163,74,0.5)",  border: "rgba(34,197,94,0.35)"  },
  { key: "blue",   label: "Deep",    sub: "Ice & electric",  dot: "#1d4ed8", glow: "rgba(29,78,216,0.5)",  border: "rgba(59,130,246,0.35)" },
  { key: "black",  label: "Shadow",  sub: "AMOLED void",     dot: "#1a1a1a", glow: "rgba(100,100,100,0.3)", border: "rgba(255,255,255,0.15)" },
] as const;


export default async function Home() {
  let wotd:            Awaited<ReturnType<typeof getWallpaperOfTheDay>> = null;
  let totalImages      = 0;
  let newThisWeek:     Array<{ id: string; slug: string; title: string; r2Key: string; deviceType: string | null; tags: string[] }> = [];
  let premiumThisWeek: Array<{ id: string; slug: string; title: string; r2Key: string; deviceType: string | null; tags: string[]; updatedAt: Date | null }> = [];

  try {
    [wotd, totalImages, newThisWeek, premiumThisWeek] = await Promise.all([
      getCachedWotd(),
      getCachedTotalImages(),
      getCachedNewThisWeek(),
      getCachedPremiumThisWeek(),
    ]);
  } catch (err) {
    console.error("[home/page] DB error:", err);
  }

  function fmt(n: number) {
    if (n >= 1000) return `${Math.floor(n / 100) / 10}K+`;
    return `${Math.floor(n / 50) * 50}+`;
  }

  const countdownDate = new Date(Date.UTC(2025, 0, 1)).toISOString();

  const premiumItems = premiumThisWeek.map((img) => ({
    id: img.id, slug: img.slug, title: img.title,
    src: getPublicUrl(img.r2Key),
    devicePath: img.deviceType === "IPHONE" ? "iphone" : img.deviceType === "ANDROID" ? "android" : "pc",
    isLocked: img.tags?.includes("badge-premium") ?? false,
    updatedAt: img.updatedAt ? new Date(img.updatedAt).toISOString() : null,
  }));

  const newItems = newThisWeek.map((img) => {
    const devicePath = img.deviceType === "IPHONE" ? "iphone" : img.deviceType === "ANDROID" ? "android" : "pc";
    return {
      id: img.id, slug: img.slug, title: img.title,
      src: getPublicUrl(img.r2Key),
      devicePath, isWide: devicePath === "pc",
      isNew: true, isLocked: false, updatedAt: null,
    };
  });

  return (
    <>

      <div className="hp">

        {/* ══ HERO ════════════════════════════════════════════════════════ */}
        <section className="hp-hero">

          {/* Full-bleed background image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_IMG}
            alt=""
            aria-hidden="true"
            className="hp-hero-img"
            fetchPriority="high"
            decoding="async"
            loading="eager"
            width="1672"
            height="941"
          />

          {/* Gradient vignette so text is legible over the image */}
          <div className="hp-hero-vignette" aria-hidden="true" />

          {/* Text overlay — bottom-left anchored */}
          <div className="hp-hero-body">
            <p className="hp-eyebrow">New drops every day</p>
            <h1 className="hp-hero-tagline">
              You&rsquo;ve arrived in Haunted Town —<br />where every wallpaper has a secret
            </h1>
            <div className="hp-hero-stat">
              <div>
                <span className="hp-hero-num">{fmt(totalImages)}</span>
                <span className="hp-hero-numlabel">Wallpapers</span>
              </div>
              <div>
                <span className="hp-hero-num">4K</span>
                <span className="hp-hero-numlabel">Quality</span>
              </div>
              <div>
                <span className="hp-hero-num">Free</span>
                <span className="hp-hero-numlabel">Always</span>
              </div>
            </div>
            <div className="hp-hero-cta">
              <Link prefetch={false} href="/all" className="hp-btn-red">Browse All →</Link>
              <Link prefetch={false} href="/iphone" className="hp-btn-ghost">iPhone</Link>
              <Link prefetch={false} href="/android" className="hp-btn-ghost">Android</Link>
            </div>
          </div>

        </section>

        <StreakBar />

        {/* ══ FRESH FROM THE TOWN ══════════════════════════════════════════ */}
        {newThisWeek.length > 0 && (
          <section className="hp-section hp-new">
            <div className="hp-section-head">
              <div>
                <p className="hp-section-eye" style={{ color:"#4caf50" }}>Fresh From The Town</p>
                <h2 className="hp-section-title">Tonight&rsquo;s Haunting</h2>
                <p className="hp-section-sub">New uploads just entered Haunted Town.</p>
              </div>
            </div>

            <TonightSlider items={newItems} />
          </section>
        )}

        {/* ══ COLOR WORLDS ════════════════════════════════════════════════ */}
        <section className="hp-worlds">
          <div className="hp-worlds-head">
            <p className="hp-worlds-sub">Enter by Color</p>
            <h2 className="hp-worlds-title">Explore the Worlds</h2>
          </div>
          <div className="hp-worlds-grid">
            {WORLDS.map((w) => (
              <Link
                key={w.key} href={`/world/${w.key}`} prefetch={false}
                className="hp-world-card"
                style={{ "--wd":w.dot,"--wg":w.glow,"--wb":w.border,"--wt":"#f0ecff" } as React.CSSProperties}
                aria-label={`Enter ${w.label} world`}
              >
                <span className="hp-world-orb" aria-hidden="true" />
                <span className="hp-world-label">{w.label}</span>
                <span className="hp-world-sub">{w.sub}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ══ PREMIUM THIS WEEK ════════════════════════════════════════════ */}
        {premiumThisWeek.length > 0 && (
          <section className="hp-section hp-premium">
            <div className="hp-section-head">
              <div>
                <p className="hp-section-eye" style={{ color:"#c9a84c" }}>Hand-Picked Excellence</p>
                <h2 className="hp-section-title">Premium This Week</h2>
                <p className="hp-section-sub">Surfaces for 24 hrs, then sealed away.</p>
              </div>
            </div>
            <div style={{ marginBottom:"clamp(12px,2vw,20px)" }}>
              <PremiumCountdown updatedAt={countdownDate} />
            </div>
            <WallpaperCardGridClient
              accentRgb="201,168,76" badge="PREMIUM" badgeColor="#c9a84c"
              items={premiumItems}
            />
          </section>
        )}

        {/* ══ WALLPAPER OF THE DAY ════════════════════════════════════════ */}
        {wotd && (() => {
          const devicePath = wotd.deviceType === "IPHONE" ? "iphone"
            : wotd.deviceType === "ANDROID" ? "android" : "pc";
          const wotdUrl  = getPublicUrl(wotd.r2Key);
          const wotdHref = `/${devicePath}/${wotd.slug}`;
          return (
            <section className="hp-wotd">
              <div className="hp-wotd-rule">
                <span className="hp-wotd-rule-line" />
                <span className="hp-wotd-label">Tonight&rsquo;s Pick</span>
                <span className="hp-wotd-rule-line" />
              </div>
              <div className="hp-wotd-body">
                <Link href={wotdHref} className="hp-wotd-img" aria-label={wotd.title}>
                  <Image
                    src={wotdUrl} alt={wotd.title} fill loading="lazy" unoptimized
                    sizes="(max-width:767px) 26vw, 130px"
                    style={{ objectFit:"cover", objectPosition:"center top" }}
                  />
                  <div className="hp-wotd-corners" aria-hidden="true">
                    <span /><span /><span /><span />
                  </div>
                </Link>
                <div className="hp-wotd-info">
                  <p className="hp-section-eye" style={{ color:"#ef0014", margin:0 }}>Wallpaper of the Day</p>
                  <h2 className="hp-wotd-title">{wotd.title}</h2>
                  <p className="hp-wotd-note">One secret pulled daily from the town. Download before it disappears.</p>
                  <Link href={wotdHref} className="hp-btn-red" style={{ alignSelf:"flex-start" }}>
                    Download Free →
                  </Link>
                </div>
              </div>
            </section>
          );
        })()}

        {/* ══ TOP 100 COLLECTIONS ════════════════════════════════════════ */}
        <section className="hp-top100">
          <div className="hp-section-head">
            <div>
              <p className="hp-section-eye" style={{ color:"#ef0014" }}>Curated Collections</p>
              <h2 className="hp-section-title">Top 100 Wallpapers</h2>
              <p className="hp-section-sub">Hand-picked collections, ranked and ready.</p>
            </div>
          </div>
          <div className="hp-top100-grid">
            <Link href="/top-100-amoled-wallpapers" prefetch={false} className="hp-top100-card hp-top100-card--amoled">
              <span className="hp-top100-num">100</span>
              <span className="hp-top100-name">AMOLED Wallpapers</span>
              <span className="hp-top100-quote">Pure black. Zero grey. The screen disappears.</span>
              <span className="hp-top100-arrow">→</span>
            </Link>
            <Link href="/top-100-horror-wallpapers" prefetch={false} className="hp-top100-card hp-top100-card--horror">
              <span className="hp-top100-num">100</span>
              <span className="hp-top100-name">Horror Wallpapers</span>
              <span className="hp-top100-quote">The dark is not empty. It is full of things that know your name.</span>
              <span className="hp-top100-arrow">→</span>
            </Link>
            <Link href="/top-100-dark-fantasy-wallpapers" prefetch={false} className="hp-top100-card hp-top100-card--fantasy">
              <span className="hp-top100-num">100</span>
              <span className="hp-top100-name">Dark Fantasy Wallpapers</span>
              <span className="hp-top100-quote">Magic leaves scars. These are the marks.</span>
              <span className="hp-top100-arrow">→</span>
            </Link>
          </div>
        </section>

        {/* ══ MOOD ════════════════════════════════════════════════════════ */}
        <section className="hp-mood">
          <div className="hp-section-head">
            <div>
              <p className="hp-section-eye" style={{ color:"#9b72cf" }}>Browse by Feeling</p>
              <h2 className="hp-section-title">Mood Wallpapers</h2>
              <p className="hp-section-sub">Some silences are heavier than others. This is one of them.</p>
            </div>
          </div>
          <div className="hp-mood-grid">
            <Link href="/mood/3am" prefetch={false} className="hp-mood-card hp-mood-card--3am">
              <span className="hp-mood-icon">🌑</span>
              <span className="hp-mood-label">3AM</span>
              <span className="hp-mood-sub">When sleep won&rsquo;t come</span>
            </Link>
            <Link href="/mood/villain" prefetch={false} className="hp-mood-card hp-mood-card--villain">
              <span className="hp-mood-icon">🩸</span>
              <span className="hp-mood-label">Villain</span>
              <span className="hp-mood-sub">For your dark arc era</span>
            </Link>
            <Link href="/mood/haunted" prefetch={false} className="hp-mood-card hp-mood-card--haunted">
              <span className="hp-mood-icon">👁</span>
              <span className="hp-mood-label">Haunted</span>
              <span className="hp-mood-sub">Something follows you</span>
            </Link>
            <Link href="/mood/quiet" prefetch={false} className="hp-mood-card hp-mood-card--quiet">
              <span className="hp-mood-icon">🌫</span>
              <span className="hp-mood-label">Quiet</span>
              <span className="hp-mood-sub">For the ones who observe</span>
            </Link>
            <Link href="/mood" prefetch={false} className="hp-mood-card hp-mood-card--all">
              <span className="hp-mood-icon">✦</span>
              <span className="hp-mood-label">All Moods</span>
              <span className="hp-mood-sub">Browse everything</span>
            </Link>
          </div>
        </section>

      </div>
    </>
  );
}