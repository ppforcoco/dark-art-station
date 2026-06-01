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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";
const OG_IMAGE = `${SITE_URL}/og-image.jpg`;
const CDN      = "https://assets.hauntedwallpapers.com";
const HERO_IMG = `${CDN}/extras/the-haunted-wallpapers-hero-section-image-mobile-dark-wallpapers-thumbnail.avif`;

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

const WIDE_SLUGS = new Set(["the-defiant-manifesto", "defiant-manifesto"]);

export default async function Home() {
  let wotd:            Awaited<ReturnType<typeof getWallpaperOfTheDay>> = null;
  let totalImages      = 0;
  let obsessions:      Array<{ id: string; slug: string; title: string; thumbnail: string; tag: string | null; icon: string | null; bgClass: string | null; _count: { images: number } }> = [];
  let newThisWeek:     Array<{ id: string; slug: string; title: string; r2Key: string; deviceType: string | null; tags: string[] }> = [];
  let premiumThisWeek: Array<{ id: string; slug: string; title: string; r2Key: string; deviceType: string | null; tags: string[]; updatedAt: Date | null }> = [];

  try {
    [[wotd, totalImages], obsessions, newThisWeek, premiumThisWeek] = await Promise.all([
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
      db.image.findMany({
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
      db.image.findMany({
        where: { tags: { has: "badge-premium" }, isAdult: false },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: { id: true, slug: true, title: true, r2Key: true, deviceType: true, tags: true, updatedAt: true },
      }),
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

  const newItems = newThisWeek.map((img) => ({
    id: img.id, slug: img.slug, title: img.title,
    src: getPublicUrl(img.r2Key),
    devicePath: img.deviceType === "IPHONE" ? "iphone" : img.deviceType === "ANDROID" ? "android" : "pc",
    isLocked: false,
    updatedAt: null,
  }));

  return (
    <>
      <style>{`
        .hp { background:#070510; min-height:100vh; color:#e8e4f0 }

        /* ═══════════════════════════════════════════════════════════════════
           HERO
        ═══════════════════════════════════════════════════════════════════ */

        .hp-hero {
          position: relative;
          width: 100%;
          background: #000000;
          overflow: hidden;
        }

        .hp-hero-vignette {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 2;
          background:
            linear-gradient(to right,  #000000 0%, transparent 30%, transparent 70%, #000000 100%),
            linear-gradient(to bottom, #000000 0%, transparent 18%, transparent 72%, #000000 100%);
        }

        /* ── Mobile layout ──────────────────────────────────────────── */
        .hp-hero-img-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 16/9;
          overflow: hidden;
        }

        .hp-hero-img {
          position: absolute; top: 0; left: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: center top;
        }

        .hp-hero-body {
          position: relative;
          z-index: 3;
          padding: clamp(20px,5vw,36px) clamp(20px,5vw,36px) clamp(24px,5vw,40px);
          display: flex; flex-direction: column;
          gap: clamp(10px,2vw,14px);
        }

        /* ── Desktop layout ─────────────────────────────────────────── */
        @media (min-width: 768px) {
          .hp-hero {
            display: grid;
            grid-template-columns: 1fr 1fr;
            align-items: center;
            min-height: 420px;
            max-height: 520px;
          }

          .hp-hero-body {
            padding: clamp(32px,4vw,56px) clamp(32px,5vw,72px);
            order: 1;
          }

          .hp-hero-img-wrap {
            order: 2;
            aspect-ratio: unset;
            height: 100%;
            min-height: 420px;
            max-height: 520px;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            padding: 0 clamp(48px, 8vw, 120px) 0 0;
          }

          .hp-hero-img {
            position: static !important;
            width: auto !important;
            height: 100% !important;
            max-height: 480px;
            object-fit: contain;
            object-position: left center;
          }
        }

        .hp-eyebrow {
          font-family: monospace;
          font-size: clamp(.58rem, .85vw, .7rem);
          letter-spacing: .28em; text-transform: uppercase;
          color: #c0001a; margin: 0;
        }
        .hp-hero-tagline {
          font-family: var(--font-cormorant, Georgia, serif);
          font-style: italic;
          font-size: clamp(1.1rem, 2.4vw, 1.55rem);
          color: #d8d0ee; line-height: 1.45; margin: 0;
        }
        .hp-hero-stat {
          display: flex; align-items: center;
          gap: clamp(16px,3vw,32px); flex-wrap: wrap;
        }
        .hp-hero-num {
          font-family: var(--font-cinzel, Georgia, serif);
          font-size: clamp(1.3rem, 3vw, 2rem);
          font-weight: 900; color: #f0ecff;
        }
        .hp-hero-numlabel {
          font-family: monospace;
          font-size: clamp(.46rem,.56vw,.54rem);
          letter-spacing: .2em; text-transform: uppercase;
          color: #7a6e98; display: block; margin-top: 2px;
        }
        .hp-hero-cta { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 4px; }

        /* BUTTONS */
        .hp-btn-red {
          font-family: monospace; font-size: clamp(.62rem,.78vw,.74rem);
          letter-spacing: .15em; text-transform: uppercase; color: #f0ecff;
          background: #b8001a; border: 1px solid #b8001a;
          padding: 12px 24px; text-decoration: none;
          display: inline-flex; align-items: center;
        }
        .hp-btn-red:hover { background: #8f0013 }
        .hp-btn-ghost {
          font-family: monospace; font-size: clamp(.62rem,.78vw,.74rem);
          letter-spacing: .15em; text-transform: uppercase; color: #c9a84c;
          background: transparent; border: 1px solid rgba(201,168,76,.3);
          padding: 12px 24px; text-decoration: none;
          display: inline-flex; align-items: center;
        }
        .hp-btn-ghost:hover { border-color: #c9a84c }

        /* SECTION SHELL */
        .hp-section { padding: clamp(28px,4vw,48px) clamp(16px,5vw,48px) }
        .hp-section-head {
          margin-bottom: clamp(16px,2.5vw,24px);
          display: flex; align-items: flex-end;
          justify-content: space-between; gap: 12px;
        }
        @media(max-width:540px){ .hp-section-head { flex-direction:column; align-items:flex-start } }
        .hp-section-eye {
          font-family: monospace; font-size: clamp(.52rem,.65vw,.62rem);
          letter-spacing: .28em; text-transform: uppercase; margin: 0 0 5px;
        }
        .hp-section-title {
          font-family: var(--font-cinzel, Georgia, serif);
          font-size: clamp(1.05rem,2.2vw,1.5rem);
          font-weight: 900; color: #f0ecff; margin: 0;
        }
        .hp-section-sub {
          font-family: var(--font-cormorant, Georgia, serif); font-style: italic;
          font-size: clamp(.88rem,1.3vw,1rem); color: #9e94b8; margin: 5px 0 0;
        }
        .hp-see-all {
          font-family: monospace; font-size: clamp(.5rem,.62vw,.58rem);
          letter-spacing: .16em; text-transform: uppercase;
          color: #d4b85c; text-decoration: none;
          border-bottom: 1px solid rgba(201,168,76,.4);
          padding-bottom: 2px; white-space: nowrap; flex-shrink: 0;
        }
        .hp-see-all:hover { border-color: #c9a84c }

        .hp-new     { background: #06050e }
        .hp-premium { background: #080710 }

        /* ═══════════════════════════════════════════════════════════════════
           NEW THIS WEEK — mobile: horizontal scroll slider
                           desktop: grid (unchanged)
        ═══════════════════════════════════════════════════════════════════ */

        /* Mobile slider: horizontally scrollable row */
        .hp-new-slider {
          display: flex;
          gap: clamp(6px,1.2vw,10px);
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          /* hide scrollbar */
          scrollbar-width: none;
          -ms-overflow-style: none;
          /* bleed to edges on mobile */
          margin: 0 calc(-1 * clamp(16px,5vw,48px));
          padding: 0 clamp(16px,5vw,48px) 12px;
        }
        .hp-new-slider::-webkit-scrollbar { display: none }

        .hp-new-slider .hp-scard {
          flex: 0 0 clamp(110px, 42vw, 150px);
          scroll-snap-align: start;
        }

        /* On desktop, revert to grid */
        @media (min-width: 768px) {
          .hp-new-slider {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
            gap: 7px;
            overflow-x: visible;
            scroll-snap-type: unset;
            margin: 0;
            padding: 0;
          }
          .hp-new-slider .hp-scard {
            flex: unset;
          }
        }

        /* CARD (shared by new + collections) */
        .hp-scard {
          display: flex; flex-direction: column; text-decoration: none;
          border: 1px solid rgba(255,255,255,.07); background: #0a0818; overflow: hidden;
        }
        .hp-scard-thumb { position:relative; aspect-ratio:9/16; overflow:hidden; background:#0d0b18 }
        .hp-scard-thumb--wide { aspect-ratio:16/9 }
        .hp-scard-info { padding:5px 7px 7px; display:flex; flex-direction:column; gap:2px }
        .hp-scard-badge {
          font-family:monospace; font-size:clamp(.44rem,.54vw,.52rem);
          letter-spacing:.16em; text-transform:uppercase; margin-bottom:1px;
        }
        .hp-scard-title {
          font-family:var(--font-cormorant,Georgia,serif);
          font-size:clamp(.84rem,.98vw,.94rem); color:#ddd8f0; font-weight:600; line-height:1.25;
        }

        /* WORLDS */
        .hp-worlds {
          padding: clamp(24px,3.5vw,44px) clamp(16px,5vw,48px);
          background: #050410; border-bottom: 1px solid rgba(255,255,255,.04);
        }
        .hp-worlds-head { text-align:center; margin-bottom:clamp(16px,2.5vw,26px) }
        .hp-worlds-title {
          font-family:var(--font-cinzel,Georgia,serif);
          font-size:clamp(.95rem,2.2vw,1.5rem); font-weight:900; color:#f0ecff; margin:0 0 6px;
        }
        .hp-worlds-sub {
          font-family:monospace; font-size:clamp(.5rem,.6vw,.58rem);
          letter-spacing:.26em; text-transform:uppercase; color:#ef0014; margin:0 0 4px;
        }
        .hp-worlds-grid {
          display:grid; grid-template-columns:repeat(5,1fr);
          gap:clamp(4px,.8vw,8px); max-width:560px; margin:0 auto;
        }
        @media(min-width:768px){ .hp-worlds-grid { max-width:440px; gap:5px } }
        .hp-world-card {
          display:flex; flex-direction:column; align-items:center;
          justify-content:center; gap:5px;
          padding:clamp(8px,1.5vw,14px) 4px;
          border:1px solid var(--wb); background:rgba(0,0,0,.35); text-decoration:none;
        }
        .hp-world-card:hover { background:rgba(0,0,0,.55); border-color:var(--wg) }
        .hp-world-orb {
          display:block; width:clamp(14px,2vw,22px); height:clamp(14px,2vw,22px);
          border-radius:50%; background:var(--wd); box-shadow:0 0 9px var(--wg); flex-shrink:0;
        }
        .hp-world-label {
          font-family:var(--font-cinzel,Georgia,serif);
          font-size:clamp(.48rem,.65vw,.58rem); font-weight:700; color:#f0ecff; text-align:center;
        }
        .hp-world-sub {
          font-family:monospace; font-size:clamp(.32rem,.42vw,.4rem);
          letter-spacing:.1em; text-transform:uppercase;
          color:rgba(255,255,255,.55); text-align:center; display:none;
        }
        @media(min-width:480px){ .hp-world-sub { display:block } }

        /* WOTD */
        .hp-wotd {
          padding:clamp(24px,4vw,44px) clamp(16px,5vw,48px);
          background:#07050e;
          border-top:1px solid rgba(224,0,31,.1);
          border-bottom:1px solid rgba(224,0,31,.1);
        }
        .hp-wotd-rule { display:flex; align-items:center; gap:1rem; margin-bottom:clamp(14px,3vw,24px) }
        .hp-wotd-rule-line { flex:1; height:1px; background:linear-gradient(90deg,transparent,rgba(224,0,31,.3),transparent) }
        .hp-wotd-label {
          font-family:monospace; font-size:clamp(.54rem,.65vw,.62rem);
          letter-spacing:.22em; text-transform:uppercase; color:#ef0014; white-space:nowrap;
        }
        .hp-wotd-body {
          display:flex; align-items:center; gap:clamp(20px,4vw,48px);
          max-width:680px; margin:0 auto; flex-direction:column;
        }
        @media(min-width:560px){ .hp-wotd-body { flex-direction:row; align-items:flex-start } }
        .hp-wotd-img {
          position:relative; width:clamp(100px,22vw,160px); aspect-ratio:9/16;
          flex-shrink:0; border-radius:12px; overflow:hidden;
          border:1px solid rgba(224,0,31,.3); display:block; text-decoration:none;
        }
        @media(min-width:768px){ .hp-wotd-img { width:clamp(90px,11vw,130px) } }
        .hp-wotd-corners { position:absolute; inset:0; pointer-events:none }
        .hp-wotd-corners span { position:absolute; width:12px; height:12px; border-color:rgba(224,0,31,.5); border-style:solid }
        .hp-wotd-corners span:nth-child(1){ top:7px;left:7px;border-width:1px 0 0 1px }
        .hp-wotd-corners span:nth-child(2){ top:7px;right:7px;border-width:1px 1px 0 0 }
        .hp-wotd-corners span:nth-child(3){ bottom:7px;left:7px;border-width:0 0 1px 1px }
        .hp-wotd-corners span:nth-child(4){ bottom:7px;right:7px;border-width:0 1px 1px 0 }
        .hp-wotd-info { flex:1; display:flex; flex-direction:column; gap:10px; text-align:left }
        .hp-wotd-title {
          font-family:var(--font-cinzel,Georgia,serif);
          font-size:clamp(.95rem,2.2vw,1.5rem); font-weight:700; color:#f0e8d8; margin:0; line-height:1.25;
        }
        .hp-wotd-note {
          font-family:var(--font-cormorant,Georgia,serif); font-style:italic;
          font-size:clamp(.88rem,1.3vw,1rem); color:#9e94b8; margin:0; line-height:1.6;
        }

        /* COLLECTIONS */
        .hp-cols { padding:clamp(28px,4vw,48px) clamp(16px,5vw,48px); background:#060410 }
        .hp-cols-grid {
          display:grid;
          grid-template-columns:repeat(auto-fill,minmax(clamp(90px,18vw,130px),1fr));
          gap:clamp(5px,1vw,10px); max-width:1100px; margin:0 auto;
        }
        @media(min-width:768px){
          .hp-cols-grid { grid-template-columns:repeat(auto-fill,minmax(90px,1fr)); gap:7px }
        }
        .hp-col-card {
          display:flex; flex-direction:column; text-decoration:none; overflow:hidden;
          border:1px solid rgba(255,255,255,.06); background:#0a0818;
        }
        .hp-col-card:hover { border-color:rgba(201,168,76,.35) }
        .hp-col-thumb { position:relative; aspect-ratio:9/16; overflow:hidden; background:#0d0b18 }
        .hp-col-thumb--wide { aspect-ratio:16/9 }
        .hp-col-info { padding:6px 8px 8px; display:flex; flex-direction:column; gap:2px }
        .hp-col-cat {
          font-family:monospace; font-size:clamp(.65rem,.75vw,.72rem);
          letter-spacing:.2em; text-transform:uppercase; color:#ff4d5a;
        }
        .hp-col-title {
          font-family:var(--font-cormorant,Georgia,serif);
          font-size:clamp(.84rem,.98vw,.94rem); color:#e8e4f0; font-weight:600; line-height:1.2;
        }
        .hp-col-count {
          font-family:monospace; font-size:clamp(.6rem,.7vw,.65rem);
          letter-spacing:.13em; text-transform:uppercase; color:rgba(255,255,255,.55);
        }
      `}</style>

      <div className="hp">

        {/* ══ HERO ════════════════════════════════════════════════════════ */}
        <section className="hp-hero">

          <div className="hp-hero-vignette" aria-hidden="true" />

          {/* LEFT: text content */}
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

          {/* RIGHT: image */}
          <div className="hp-hero-img-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={HERO_IMG}
              alt=""
              aria-hidden="true"
              className="hp-hero-img"
              fetchPriority="low"
              decoding="async"
              loading="lazy"
              width="1600"
              height="900"
            />
          </div>

        </section>

        <StreakBar />

        {/* ══ NEW THIS WEEK ════════════════════════════════════════════════ */}
        {newThisWeek.length > 0 && (
          <section className="hp-section hp-new">
            <div className="hp-section-head">
              <div>
                <p className="hp-section-eye" style={{ color:"#4caf50" }}>Fresh From The Vault</p>
                <h2 className="hp-section-title">New This Week</h2>
                <p className="hp-section-sub">Just surfaced — gone in 48 hrs.</p>
              </div>
            </div>

            {/* Mobile: horizontal scroll slider / Desktop: grid */}
            <div className="hp-new-slider">
              {newThisWeek.map((img, i) => {
                const devicePath = img.deviceType === "IPHONE" ? "iphone"
                  : img.deviceType === "ANDROID" ? "android" : "pc";
                const isWide = devicePath === "pc";
                return (
                  <Link key={img.id} prefetch={false} href={`/${devicePath}/${img.slug}`} className="hp-scard">
                    <div className={`hp-scard-thumb${isWide ? " hp-scard-thumb--wide" : ""}`}>
                      <Image
                        src={getPublicUrl(img.r2Key)} alt={img.title} fill
                        loading={i < 4 ? "eager" : "lazy"} priority={i < 2} unoptimized
                        sizes="(max-width:767px) 44vw, 100px"
                        style={{ objectFit:"cover", objectPosition:"center top" }}
                      />
                    </div>
                    <div className="hp-scard-info">
                      <span className="hp-scard-badge" style={{ color:"#4caf50" }}>New</span>
                      <span className="hp-scard-title">{img.title}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
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
                  <p className="hp-wotd-note">One vision pulled daily from the vault. Download before the clock resets.</p>
                  <Link href={wotdHref} className="hp-btn-red" style={{ alignSelf:"flex-start" }}>
                    Download Free →
                  </Link>
                </div>
              </div>
            </section>
          );
        })()}

        {/* ══ COLLECTIONS ════════════════════════════════════════════════ */}
        {obsessions.length > 0 && (
          <section className="hp-cols">
            <div className="hp-section-head" style={{ marginBottom:"clamp(16px,2.5vw,24px)" }}>
              <div>
                <p className="hp-section-eye" style={{ color:"#c9a84c" }}>Curated Sets</p>
                <h2 className="hp-section-title">Collections</h2>
              </div>
              <Link prefetch={false} href="/obsessions" className="hp-see-all">View all →</Link>
            </div>
            <div className="hp-cols-grid">
              {obsessions.filter((obs) => WIDE_SLUGS.has(obs.slug)).map((obs) => (
                <Link
                  key={obs.id} prefetch={false}
                  href={`/obsessions/${encodeURIComponent(obs.slug)}`}
                  className="hp-col-card"
                >
                  {obs.thumbnail && (
                    <div className="hp-col-thumb hp-col-thumb--wide">
                      <Image
                        src={getPublicUrl(obs.thumbnail)} alt={obs.title}
                        fill unoptimized loading="lazy"
                        sizes="(max-width:767px) 42vw, 130px"
                        style={{ objectFit:"cover", objectPosition:"center top" }}
                      />
                    </div>
                  )}
                  <div className="hp-col-info">
                    {obs.tag && <span className="hp-col-cat">{obs.tag}</span>}
                    <span className="hp-col-title">{obs.title}</span>
                    {obs._count.images > 0 && (
                      <span className="hp-col-count">{obs._count.images} wallpapers</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context":"https://schema.org","@type":"ItemList",
          name:"Haunted Wallpapers Collections",
          url:SITE_URL, numberOfItems:obsessions.length,
          itemListElement:obsessions.map((o,i) => ({
            "@type":"ListItem",position:i+1,
            url:`${SITE_URL}/obsessions/${o.slug}`,name:o.title,
          })),
        })
      }} />
    </>
  );
}