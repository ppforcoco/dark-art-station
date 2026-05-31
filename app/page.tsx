// app/page.tsx — Haunted Wallpapers Homepage (clean rebuild)
import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import Image from "next/image";
import { db, getWallpaperOfTheDay, getPageContent } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import WallpaperCardGrid from "@/components/WallpaperCardGrid";
import PremiumCountdown from "@/components/PremiumCountdown";

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
      title,
      description: desc,
      url: SITE_URL,
      siteName: "Haunted Wallpapers",
      type: "website",
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Haunted Wallpapers" }],
    },
    twitter: { card: "summary_large_image", title, description: desc, images: [OG_IMAGE] },
    alternates: { canonical: SITE_URL },
  };
}

export const revalidate = 3600;

// ── World config ──────────────────────────────────────────────────────────────
const WORLDS = [
  { key: "red",    label: "Crimson", sub: "Dark & Fire",     dot: "#e0001f", glow: "rgba(192,0,26,0.5)",  border: "rgba(192,0,26,0.4)"   },
  { key: "purple", label: "Void",    sub: "Cosmic & mystic", dot: "#7c3aed", glow: "rgba(124,58,237,0.5)", border: "rgba(147,51,234,0.4)" },
  { key: "green",  label: "Haunted", sub: "Forest & dark",   dot: "#16a34a", glow: "rgba(22,163,74,0.5)", border: "rgba(34,197,94,0.35)" },
  { key: "blue",   label: "Deep",    sub: "Ice & electric",  dot: "#1d4ed8", glow: "rgba(29,78,216,0.5)", border: "rgba(59,130,246,0.35)" },
  { key: "black",  label: "Shadow",  sub: "AMOLED void",     dot: "#1a1a1a", glow: "rgba(100,100,100,0.3)", border: "rgba(255,255,255,0.15)" },
] as const;

// Slugs that should always render as 16:9
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
        take: 8,
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

  return (
    <>
      <style>{`
        /* ── Kill heavy animations site-wide on homepage ── */
        .hp *{animation:none!important;transition:none!important}
        .hp a:hover,.hp button:hover{transition:color .15s,border-color .15s,background .15s,opacity .15s,transform .15s!important}

        /* ── Root ── */
        .hp{background:#070510;min-height:100vh;color:#e8e4f0}

        /* ── HERO ── */
        .hp-hero{
          position:relative;
          width:100%;
          aspect-ratio:16/9;
          max-height:320px;
          display:flex;align-items:flex-end;
          overflow:hidden;
          background:#000;
        }
        @media(min-width:640px){
          .hp-hero{aspect-ratio:unset;height:200px;max-height:200px}
        }
        .hp-hero-img{
          position:absolute;inset:0;width:100%;height:100%;
          object-fit:contain;object-position:center top;
          display:block;
        }
        .hp-hero-veil{
          position:absolute;inset:0;
          background:linear-gradient(to bottom,rgba(7,5,16,.05) 0%,rgba(7,5,16,.45) 45%,rgba(7,5,16,.97) 100%);
        }
        .hp-hero-body{
          position:relative;z-index:1;
          padding:clamp(16px,4vw,36px) clamp(16px,5vw,48px) clamp(20px,4vw,36px);
          max-width:720px;
          display:flex;flex-direction:column;gap:10px;
        }
        .hp-eyebrow{
          font-family:monospace;
          font-size:clamp(.5rem,.85vw,.62rem);
          letter-spacing:.32em;text-transform:uppercase;
          color:#c0001a;margin:0;
        }
        .hp-hero-tagline{
          font-family:var(--font-cormorant,Georgia,serif);
          font-style:italic;
          font-size:clamp(.95rem,2vw,1.15rem);
          color:#b8acd4;line-height:1.5;margin:0;
          max-width:520px;
        }
        .hp-hero-stat{
          display:flex;align-items:center;gap:clamp(10px,2.5vw,20px);flex-wrap:wrap;
        }
        .hp-hero-num{
          font-family:var(--font-cinzel,serif);
          font-size:clamp(1rem,2.5vw,1.4rem);
          font-weight:900;color:#f0ecff;
        }
        .hp-hero-numlabel{
          font-family:monospace;font-size:.5rem;
          letter-spacing:.22em;text-transform:uppercase;
          color:#6a5e88;display:block;margin-top:1px;
        }
        .hp-hero-cta{
          display:flex;gap:10px;flex-wrap:wrap;margin-top:4px;
        }
        .hp-btn-red{
          font-family:monospace;font-size:.6rem;letter-spacing:.16em;
          text-transform:uppercase;color:#f0ecff;
          background:#c0001a;border:1px solid #c0001a;
          padding:11px 22px;text-decoration:none;
          display:inline-flex;align-items:center;
        }
        .hp-btn-red:hover{background:#9a0014}
        .hp-btn-ghost{
          font-family:monospace;font-size:.6rem;letter-spacing:.16em;
          text-transform:uppercase;color:#c9a84c;
          background:transparent;border:1px solid rgba(201,168,76,.35);
          padding:11px 22px;text-decoration:none;
          display:inline-flex;align-items:center;
        }
        .hp-btn-ghost:hover{border-color:#c9a84c}

        /* ── WORLDS ── */
        .hp-worlds{
          padding:clamp(28px,4vw,48px) clamp(16px,5vw,48px);
          background:#050410;
          border-bottom:1px solid rgba(255,255,255,.05);
        }
        .hp-worlds-head{text-align:center;margin-bottom:clamp(20px,3vw,30px)}
        .hp-worlds-title{
          font-family:var(--font-cinzel,serif);
          font-size:clamp(1rem,2.5vw,1.7rem);
          font-weight:900;color:#f0ecff;margin:0 0 8px;
        }
        .hp-worlds-sub{
          font-family:monospace;font-size:.55rem;letter-spacing:.28em;
          text-transform:uppercase;color:#ff1a35;margin:0 0 6px;
        }
        .hp-worlds-grid{
          display:grid;
          grid-template-columns:repeat(5,1fr);
          gap:clamp(8px,1.5vw,14px);
          max-width:900px;margin:0 auto;
        }
        @media(max-width:640px){.hp-worlds-grid{grid-template-columns:repeat(5,1fr);gap:6px}}
        .hp-world-card{
          display:flex;flex-direction:column;align-items:center;
          justify-content:center;gap:8px;
          padding:clamp(14px,2.5vw,22px) 8px;
          border:1px solid var(--wb);background:rgba(0,0,0,.4);
          text-decoration:none;position:relative;overflow:hidden;
        }
        .hp-world-card:hover{background:rgba(0,0,0,.6);border-color:var(--wg);transform:translateY(-3px)}
        .hp-world-orb{
          display:block;
          width:clamp(26px,3.5vw,40px);height:clamp(26px,3.5vw,40px);
          border-radius:50%;background:var(--wd);
          box-shadow:0 0 16px var(--wg);
          flex-shrink:0;
        }
        .hp-world-label{
          font-family:var(--font-cinzel,serif);
          font-size:clamp(.58rem,.85vw,.75rem);
          font-weight:700;color:var(--wt);
          text-align:center;
        }
        .hp-world-sub{
          font-family:monospace;font-size:clamp(.4rem,.55vw,.48rem);
          letter-spacing:.1em;text-transform:uppercase;
          color:rgba(255,255,255,.4);text-align:center;
          display:none;
        }
        @media(min-width:480px){.hp-world-sub{display:block}}

        /* ── SECTION SHELL ── */
        .hp-section{
          padding:clamp(28px,4vw,48px) clamp(16px,5vw,48px);
        }
        .hp-section-head{
          margin-bottom:clamp(18px,3vw,28px);
          display:flex;align-items:flex-end;justify-content:space-between;gap:12px;
        }
        @media(max-width:540px){.hp-section-head{flex-direction:column;align-items:flex-start}}
        .hp-section-eye{
          font-family:monospace;font-size:.55rem;letter-spacing:.3em;
          text-transform:uppercase;margin:0 0 6px;
        }
        .hp-section-title{
          font-family:var(--font-cinzel,serif);
          font-size:clamp(1rem,2.2vw,1.6rem);
          font-weight:900;color:#f0ecff;margin:0;
        }
        .hp-section-sub{
          font-family:var(--font-cormorant,Georgia,serif);font-style:italic;
          font-size:clamp(.85rem,1.4vw,.98rem);color:#9a8fb0;margin:6px 0 0;
        }
        .hp-see-all{
          font-family:monospace;font-size:.52rem;letter-spacing:.18em;
          text-transform:uppercase;color:#c9a84c;text-decoration:none;
          border-bottom:1px solid rgba(201,168,76,.3);padding-bottom:2px;
          white-space:nowrap;flex-shrink:0;
        }
        .hp-see-all:hover{border-color:#c9a84c}

        /* ── NEW / PREMIUM sections ── */
        .hp-new{background:#06050e}
        .hp-premium{background:#080710}

        /* ── WOTD ── */
        .hp-wotd{
          padding:clamp(24px,4vw,44px) clamp(16px,5vw,48px);
          background:#07050e;
          border-top:1px solid rgba(224,0,31,.12);
          border-bottom:1px solid rgba(224,0,31,.12);
        }
        .hp-wotd-rule{
          display:flex;align-items:center;gap:1rem;
          margin-bottom:clamp(14px,3vw,24px);
        }
        .hp-wotd-rule-line{flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(224,0,31,.4),transparent)}
        .hp-wotd-label{
          font-family:monospace;font-size:.58rem;letter-spacing:.24em;
          text-transform:uppercase;color:#e0001f;white-space:nowrap;
        }
        .hp-wotd-body{
          display:flex;align-items:center;gap:clamp(20px,4vw,48px);
          max-width:700px;margin:0 auto;
          flex-direction:column;
        }
        @media(min-width:560px){.hp-wotd-body{flex-direction:row;align-items:flex-start}}
        .hp-wotd-img{
          position:relative;
          width:clamp(110px,25vw,180px);
          aspect-ratio:9/16;
          flex-shrink:0;
          border-radius:14px;overflow:hidden;
          border:1px solid rgba(224,0,31,.35);
          display:block;text-decoration:none;
        }
        .hp-wotd-corners{position:absolute;inset:0;pointer-events:none}
        .hp-wotd-corners span{position:absolute;width:14px;height:14px;border-color:rgba(224,0,31,.6);border-style:solid}
        .hp-wotd-corners span:nth-child(1){top:8px;left:8px;border-width:1.5px 0 0 1.5px}
        .hp-wotd-corners span:nth-child(2){top:8px;right:8px;border-width:1.5px 1.5px 0 0}
        .hp-wotd-corners span:nth-child(3){bottom:8px;left:8px;border-width:0 0 1.5px 1.5px}
        .hp-wotd-corners span:nth-child(4){bottom:8px;right:8px;border-width:0 1.5px 1.5px 0}
        .hp-wotd-device{
          position:absolute;top:10px;left:10px;
          font-family:monospace;font-size:.48rem;letter-spacing:.16em;text-transform:uppercase;
          color:#e0001f;background:rgba(0,0,0,.75);
          border:1px solid rgba(224,0,31,.4);padding:2px 7px;border-radius:2px;
        }
        .hp-wotd-info{flex:1;display:flex;flex-direction:column;gap:12px;text-align:left}
        .hp-wotd-title{
          font-family:var(--font-cinzel,serif);
          font-size:clamp(.95rem,2.2vw,1.5rem);
          font-weight:700;color:#f0e8d8;margin:0;line-height:1.2;
        }
        .hp-wotd-note{
          font-family:var(--font-cormorant,Georgia,serif);font-style:italic;
          font-size:clamp(.85rem,1.4vw,.98rem);color:#9a8fb0;margin:0;line-height:1.6;
        }

        /* ── COLLECTIONS (obsessions) ── */
        .hp-cols{
          padding:clamp(28px,4vw,48px) clamp(16px,5vw,48px);
          background:#060410;
        }
        .hp-cols-grid{
          display:grid;
          grid-template-columns:repeat(auto-fill,minmax(clamp(100px,20vw,140px),1fr));
          gap:clamp(6px,1.2vw,12px);
          max-width:1100px;margin:0 auto;
        }
        .hp-col-card{
          display:flex;flex-direction:column;
          text-decoration:none;overflow:hidden;
          border:1px solid rgba(255,255,255,.07);
          background:#0a0818;
          position:relative;
        }
        .hp-col-card:hover{border-color:rgba(201,168,76,.4);transform:translateY(-2px)}
        /* 9:16 portrait for mobile/iPhone collections */
        .hp-col-thumb{position:relative;aspect-ratio:9/16;overflow:hidden;background:#111}
        /* 16:9 landscape for PC/kit/wide collections */
        .hp-col-thumb--wide{aspect-ratio:16/9}
        .hp-col-info{padding:8px 10px 10px;display:flex;flex-direction:column;gap:3px}
        .hp-col-cat{
          font-family:monospace;font-size:.44rem;letter-spacing:.22em;
          text-transform:uppercase;color:#c0001a;
        }
        .hp-col-title{
          font-family:var(--font-cormorant,Georgia,serif);
          font-size:.85rem;color:#f0ecff;font-weight:600;line-height:1.25;
        }
        .hp-col-count{
          font-family:monospace;font-size:.44rem;letter-spacing:.15em;
          text-transform:uppercase;color:rgba(255,255,255,.35);
        }

        /* ── CTA strip ── */
        .hp-cta{
          padding:clamp(36px,5vw,64px) clamp(16px,5vw,48px);
          text-align:center;background:#060410;
          border-top:1px solid rgba(255,255,255,.05);
        }
        .hp-cta-title{
          font-family:var(--font-cinzel,serif);
          font-size:clamp(1rem,3vw,2rem);
          font-weight:900;color:#f0ecff;margin:0 0 12px;
        }
        .hp-cta-sub{
          font-family:var(--font-cormorant,Georgia,serif);font-style:italic;
          font-size:clamp(.88rem,1.6vw,1rem);color:#9a8fb0;
          max-width:420px;margin:0 auto 22px;line-height:1.6;
        }
      `}</style>

      <div className="hp">

        {/* ════════════════════════════════════════════
            HERO — compact, starts from very top of image
        ════════════════════════════════════════════ */}
        <section className="hp-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_IMG}
            alt=""
            aria-hidden="true"
            className="hp-hero-img"
            fetchPriority="high"
            decoding="sync"
            loading="eager"
          />
          <div className="hp-hero-veil" />
          <div className="hp-hero-body">
            <h1 style={{
              position: "absolute", width: "1px", height: "1px", padding: 0,
              margin: "-1px", overflow: "hidden", clip: "rect(0,0,0,0)",
              whiteSpace: "nowrap", border: 0,
            }}>
              Haunted Wallpapers — Free Dark Fantasy &amp; Horror Wallpapers
            </h1>
            <p className="hp-eyebrow">New drops added every day</p>
            <p className="hp-hero-tagline">You&rsquo;ve arrived in Haunted Town — where every wallpaper has a secret</p>
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

        {/* ════════════════════════════════════════════
            NEW THIS WEEK
        ════════════════════════════════════════════ */}
        {newThisWeek.length > 0 && (
          <section className="hp-section hp-new">
            <div className="hp-section-head">
              <div>
                <p className="hp-section-eye" style={{ color: "#4caf50" }}>Fresh From The Vault</p>
                <h2 className="hp-section-title">New This Week</h2>
                <p className="hp-section-sub">Just surfaced. Disappear from here in 48 hrs.</p>
              </div>
              <Link prefetch={false} href="/all" className="hp-see-all">See all →</Link>
            </div>
            <WallpaperCardGrid
              accentRgb="76,175,80"
              badge="NEW"
              badgeColor="#4caf50"
              items={newThisWeek.map(img => ({
                id: img.id, slug: img.slug, title: img.title,
                src: getPublicUrl(img.r2Key),
                devicePath: img.deviceType === "IPHONE" ? "iphone" : img.deviceType === "ANDROID" ? "android" : "pc",
              }))}
            />
          </section>
        )}

        {/* ════════════════════════════════════════════
            COLOR WORLDS
        ════════════════════════════════════════════ */}
        <section className="hp-worlds">
          <div className="hp-worlds-head">
            <p className="hp-worlds-sub">Enter by Color</p>
            <h2 className="hp-worlds-title">Explore the Worlds</h2>
          </div>
          <div className="hp-worlds-grid">
            {WORLDS.map((w) => (
              <Link
                key={w.key}
                href={`/world/${w.key}`}
                prefetch={false}
                className="hp-world-card"
                style={{
                  "--wd": w.dot,
                  "--wg": w.glow,
                  "--wb": w.border,
                  "--wt": "#f0ecff",
                } as React.CSSProperties}
                aria-label={`Enter ${w.label} world`}
              >
                <span className="hp-world-orb" aria-hidden="true" />
                <span className="hp-world-label">{w.label}</span>
                <span className="hp-world-sub">{w.sub}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════
            PREMIUM THIS WEEK — moved after Worlds
        ════════════════════════════════════════════ */}
        {premiumThisWeek.length > 0 && (
          <section className="hp-section hp-premium">
            <div className="hp-section-head">
              <div>
                <p className="hp-section-eye" style={{ color: "#c9a84c" }}>Hand-Picked Excellence</p>
                <h2 className="hp-section-title">Premium This Week</h2>
                <p className="hp-section-sub">Surfaces for 24 hrs, then sealed away.</p>
              </div>
              <Link prefetch={false} href="/all" className="hp-see-all">Browse →</Link>
            </div>
            <div style={{ marginBottom: "clamp(14px,2.5vw,22px)" }}>
              <PremiumCountdown updatedAt={countdownDate} />
            </div>
            <WallpaperCardGrid
              accentRgb="201,168,76"
              badge="PREMIUM"
              badgeColor="#c9a84c"
              items={premiumItems}
            />
          </section>
        )}

        {/* ════════════════════════════════════════════
            WALLPAPER OF THE DAY
        ════════════════════════════════════════════ */}
        {wotd && (() => {
          const devicePath = wotd.deviceType === "IPHONE" ? "iphone" : wotd.deviceType === "ANDROID" ? "android" : "pc";
          const wotdUrl    = getPublicUrl(wotd.r2Key);
          const wotdHref   = `/${devicePath}/${wotd.slug}`;
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
                    sizes="(max-width:560px) 28vw, 200px"
                    style={{ objectFit: "cover", objectPosition: "center top" }}
                  />
                  <div className="hp-wotd-corners" aria-hidden="true">
                    <span /><span /><span /><span />
                  </div>
                  {wotd.deviceType && (
                    <span className="hp-wotd-device">
                      {wotd.deviceType.charAt(0) + wotd.deviceType.slice(1).toLowerCase()}
                    </span>
                  )}
                </Link>
                <div className="hp-wotd-info">
                  <p className="hp-section-eye" style={{ color: "#e0001f", margin: 0 }}>Wallpaper of the Day</p>
                  <h2 className="hp-wotd-title">{wotd.title}</h2>
                  <p className="hp-wotd-note">
                    One vision pulled daily from the vault. Download before the clock resets.
                  </p>
                  <Link href={wotdHref} className="hp-btn-red" style={{ alignSelf: "flex-start" }}>
                    Download Free →
                  </Link>
                </div>
              </div>
            </section>
          );
        })()}

        {/* ════════════════════════════════════════════
            COLLECTIONS (obsessions)
            — Defiant Manifesto forced 16:9 by slug
            — "View all obsessions" link
        ════════════════════════════════════════════ */}
        {obsessions.length > 0 && (
          <section className="hp-cols">
            <div className="hp-section-head" style={{ marginBottom: "clamp(18px,3vw,28px)" }}>
              <div>
                <p className="hp-section-eye" style={{ color: "#c9a84c" }}>Curated Sets</p>
                <h2 className="hp-section-title">Collections</h2>
              </div>
              <Link prefetch={false} href="/obsessions" className="hp-see-all">View all obsessions →</Link>
            </div>
            <div className="hp-cols-grid">
              {obsessions.map((obs) => {
                return (
                  <Link
                    key={obs.id}
                    prefetch={false}
                    href={`/obsessions/${encodeURIComponent(obs.slug)}`}
                    className="hp-col-card"
                  >
                    {obs.thumbnail && WIDE_SLUGS.has(obs.slug) && (
                      <div className="hp-col-thumb hp-col-thumb--wide">
                        <Image
                          src={getPublicUrl(obs.thumbnail)}
                          alt={obs.title}
                          fill
                          unoptimized
                          loading="lazy"
                          sizes="(max-width:640px) 44vw, (max-width:1024px) 22vw, 160px"
                          style={{ objectFit: "cover", objectPosition: "center top" }}
                        />
                      </div>
                    )}
                    <div className="hp-col-info">
                      {obs.tag && <span className="hp-col-cat">{obs.tag}</span>}
                      <span className="hp-col-title">{obs.title}</span>
                      {obs._count.images > 0 && (
                        <span className="hp-col-count">{obs._count.images} iPhone wallpapers</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ════════════════════════════════════════════
            CTA
        ════════════════════════════════════════════ */}
        <section className="hp-cta">
          <h2 className="hp-cta-title">New art drops every day</h2>
          <p className="hp-cta-sub">Dark fantasy, gothic horror, cosmic art. All free. No account.</p>
          <Link prefetch={false} href="/all" className="hp-btn-red">Browse Everything →</Link>
        </section>

      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org", "@type": "ItemList",
          name: "Haunted Wallpapers Collections",
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