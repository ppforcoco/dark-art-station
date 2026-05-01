// app/page.tsx — HAUNTED TOWN REDESIGN (AdSense-safe, split-hero edition)

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { db, getWallpaperOfTheDay, getPageContent } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import RecentlyViewed from "@/components/RecentlyViewed";
import HorrorFact from "@/components/HorrorFact";

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

export const revalidate = 60; // 60s cache — new collections/WOTD appear quickly

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
      _count: { select: { images: { where: { deviceType: "IPHONE" } } } },
    },
  });


  // Badge sections — New This Week + Premium This Week
  const ONE_WEEK_AGO = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [newThisWeek, premiumThisWeek] = await Promise.all([
    db.image.findMany({
      where: {
        tags: { has: "badge-new" },
        isAdult: false,
        createdAt: { gte: ONE_WEEK_AGO },
      },
      orderBy: { updatedAt: "desc" },
      take: 6,
      select: { id: true, slug: true, title: true, r2Key: true, deviceType: true, tags: true },
    }),
    db.image.findMany({
      where: {
        tags: { has: "badge-premium" },
        isAdult: false,
        createdAt: { gte: ONE_WEEK_AGO },
      },
      orderBy: { updatedAt: "desc" },
      take: 6,
      select: { id: true, slug: true, title: true, r2Key: true, deviceType: true, tags: true },
    }),
  ]);

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
      <section className="dt-gate dt-gate--collage hw-hero-gate-override" style={{ padding: "0", minHeight: "unset", marginTop: "calc(-1 * (var(--topbar-total, 72px) + var(--nav-h, 88px)))" }}>

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
          <div className="hw-hero-phones-wrap" style={{ marginTop: "0", overflow: "visible", paddingTop: "20px", paddingBottom: "16px" }}>
            <div className="dt-hero-phones" style={{ gap: "clamp(6px,1.2vw,20px)", alignItems: "flex-end", padding: "0 8px" }}>
              {[
                { src: "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/pin/gorilla-iphone-wallpaper.jpeg", alt: "Gorilla", featured: false },
                { src: "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/wallpapers/shadows-have-eyes-android.webp", alt: "Shadow Eyes", featured: false },
                { src: "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/pin/sinister-cat-shadow.jpeg", alt: "Sinister Cat", featured: true },
                { src: "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/pin/girl-doll.jpeg", alt: "Girl Doll", featured: false },
                { src: "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/wallpapers/hero-2.jpeg", alt: "Dark Art", featured: false },
              ].map((phone, i) => (
                <div
                  key={i}
                  className={`dt-hero-phone-wrap${phone.featured ? " dt-hero-phone-wrap--featured" : ""}`}
                  style={{
                    "--phone-i": i,
                    transform: phone.featured
                      ? "scale(1.06)"
                      : i === 1 || i === 3
                      ? "scale(1.0)"
                      : "scale(0.94)",
                    transformOrigin: "bottom center",
                  } as React.CSSProperties}
                >
                  <div className="dt-hero-phone" style={{ width: "clamp(90px,11vw,165px)", height: "clamp(180px,22vw,340px)", borderRadius: "clamp(16px,2vw,28px)" }}>
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
        /* Hero: cancel content-wrapper offset, add back nav height + small gap */
        .hw-hero-gate-override {
          padding-top: calc(var(--topbar-total, 72px) + var(--nav-h, 88px) + 16px) !important;
          padding-bottom: 0 !important;
          overflow: visible !important;
        }
        @media (max-width: 1279px) {
          .hw-hero-gate-override {
            padding-top: calc(var(--topbar-total, 72px) + var(--nav-h-mob, 84px) + 16px) !important;
          }
        }
        /* Desktop: side by side, text left phones right */
        @media (min-width: 860px) {
          .hw-hero-split {
            grid-template-columns: minmax(320px,420px) 1fr !important;
            align-items: flex-end !important;
          }
          .hw-hero-phones-wrap {
            overflow: visible !important;
            padding-top: 24px !important;
            padding-bottom: 0 !important;
          }
        }
        /* Foldable / tablet: generous but not full desktop */
        @media (min-width: 540px) and (max-width: 859px) {
          .hw-hero-split {
            grid-template-columns: 1fr !important;
          }
          .hw-hero-phones-wrap {
            padding: 16px clamp(12px,3vw,32px) 0 !important;
            overflow-x: auto !important;
            overflow-y: visible !important;
          }
          .dt-hero-phones {
            justify-content: flex-start !important;
          }
        }
        /* Small phones */
        @media (max-width: 539px) {
          .hw-hero-split { grid-template-columns: 1fr !important; }
          .hw-hero-phones-wrap {
            padding: 16px 12px 0 !important;
            overflow-x: auto !important;
            overflow-y: visible !important;
          }
          .dt-hero-phones { justify-content: flex-start !important; }
        }
      `}</style>


      {/* ══════════════════════════════════════════════════════════
          SECTION — NEW THIS WEEK
      ══════════════════════════════════════════════════════════ */}
      {newThisWeek.length > 0 && (
        <section style={{ padding: "clamp(32px,5vw,64px) clamp(16px,5vw,72px)", background: "#07050f", position: "relative", overflow: "hidden" }}>
          {/* Background glow */}
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(76,175,80,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

          <div className="dt-section-head dt-section-head--center" style={{ marginBottom: "clamp(24px,4vw,40px)" }}>
            <span className="dt-eyebrow" style={{ color: "#4caf50" }}>✨ Fresh From The Vault</span>
            <h2 className="dt-section-title">New This Week</h2>
            <p className="dt-section-sub" style={{ maxWidth: "480px", margin: "0 auto" }}>
              Just surfaced. These disappear from this section in 48 hours.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "clamp(12px,2vw,24px)", maxWidth: "1100px", margin: "0 auto" }}>
            {newThisWeek.map((img) => {
              const devicePath = img.deviceType === "IPHONE" ? "iphone" : img.deviceType === "ANDROID" ? "android" : "pc";
              const imgUrl = getPublicUrl(img.r2Key);
              return (
                <Link key={img.id} href={`/${devicePath}/${img.slug}`} style={{ textDecoration: "none", display: "block" }}>
                  <div style={{ position: "relative", borderRadius: "20px", overflow: "hidden", background: "#0d0b14", boxShadow: "0 0 0 1px rgba(76,175,80,0.25), 0 8px 32px rgba(0,0,0,0.6)", transition: "transform 0.2s, box-shadow 0.2s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 0 1px rgba(76,175,80,0.5), 0 16px 48px rgba(0,0,0,0.8)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 0 1px rgba(76,175,80,0.25), 0 8px 32px rgba(0,0,0,0.6)"; }}>

                    {/* Phone mockup shell */}
                    <div style={{ position: "relative", aspectRatio: "9/16", background: "#111" }}>
                      {/* Phone buttons */}
                      <div style={{ position: "absolute", left: "-3px", top: "25%", width: "3px", height: "20px", background: "#222", borderRadius: "2px 0 0 2px" }} />
                      <div style={{ position: "absolute", left: "-3px", top: "38%", width: "3px", height: "20px", background: "#222", borderRadius: "2px 0 0 2px" }} />
                      <div style={{ position: "absolute", right: "-3px", top: "30%", width: "3px", height: "28px", background: "#222", borderRadius: "0 2px 2px 0" }} />

                      {/* Dynamic island */}
                      <div style={{ position: "absolute", top: "6px", left: "50%", transform: "translateX(-50%)", width: "36px", height: "10px", background: "#000", borderRadius: "6px", zIndex: 3 }} />

                      {/* Image */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imgUrl} alt={img.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", borderRadius: "20px" }} loading="lazy" />

                      {/* Glass gloss */}
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%)", borderRadius: "20px", pointerEvents: "none" }} />

                      {/* NEW badge */}
                      <div style={{ position: "absolute", top: "18px", left: "8px", background: "rgba(76,175,80,0.15)", border: "1px solid #4caf50", color: "#4caf50", fontSize: "0.5rem", fontFamily: "monospace", padding: "2px 6px", letterSpacing: "0.1em" }}>✨ NEW</div>

                      {/* Home indicator */}
                      <div style={{ position: "absolute", bottom: "6px", left: "50%", transform: "translateX(-50%)", width: "40px", height: "3px", background: "rgba(255,255,255,0.3)", borderRadius: "2px" }} />
                    </div>

                    {/* Title */}
                    <div style={{ padding: "10px 10px 12px", background: "#0d0b14" }}>
                      <p style={{ color: "#e8e4f8", fontSize: "0.7rem", fontFamily: "monospace", margin: 0, lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>{img.title}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div style={{ textAlign: "center", marginTop: "clamp(20px,3vw,32px)" }}>
            <Link href="/iphone" className="dt-btn dt-btn--ghost" style={{ borderColor: "rgba(76,175,80,0.4)", color: "#4caf50" }}>See All Wallpapers →</Link>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          SECTION — PREMIUM THIS WEEK
      ══════════════════════════════════════════════════════════ */}
      {premiumThisWeek.length > 0 && (
        <section style={{ padding: "clamp(32px,5vw,64px) clamp(16px,5vw,72px)", background: "#0a0810", position: "relative", overflow: "hidden" }}>
          {/* Background gold glow */}
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(201,168,76,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

          <div className="dt-section-head dt-section-head--center" style={{ marginBottom: "clamp(24px,4vw,40px)" }}>
            <span className="dt-eyebrow" style={{ color: "#c9a84c" }}>⭐ Hand-Picked Excellence</span>
            <h2 className="dt-section-title">Premium This Week</h2>
            <p className="dt-section-sub" style={{ maxWidth: "480px", margin: "0 auto" }}>
              The finest pieces from the archive. Here for 48 hours, then back in the vault.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "clamp(12px,2vw,24px)", maxWidth: "1100px", margin: "0 auto" }}>
            {premiumThisWeek.map((img) => {
              const devicePath = img.deviceType === "IPHONE" ? "iphone" : img.deviceType === "ANDROID" ? "android" : "pc";
              const imgUrl = getPublicUrl(img.r2Key);
              return (
                <Link key={img.id} href={`/${devicePath}/${img.slug}`} style={{ textDecoration: "none", display: "block" }}>
                  <div style={{ position: "relative", borderRadius: "20px", overflow: "hidden", background: "#0d0b14", boxShadow: "0 0 0 1px rgba(201,168,76,0.25), 0 8px 32px rgba(0,0,0,0.6)", transition: "transform 0.2s, box-shadow 0.2s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 0 1px rgba(201,168,76,0.5), 0 16px 48px rgba(0,0,0,0.8)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 0 1px rgba(201,168,76,0.25), 0 8px 32px rgba(0,0,0,0.6)"; }}>

                    {/* Phone mockup shell */}
                    <div style={{ position: "relative", aspectRatio: "9/16", background: "#111" }}>
                      {/* Phone buttons */}
                      <div style={{ position: "absolute", left: "-3px", top: "25%", width: "3px", height: "20px", background: "#222", borderRadius: "2px 0 0 2px" }} />
                      <div style={{ position: "absolute", left: "-3px", top: "38%", width: "3px", height: "20px", background: "#222", borderRadius: "2px 0 0 2px" }} />
                      <div style={{ position: "absolute", right: "-3px", top: "30%", width: "3px", height: "28px", background: "#222", borderRadius: "0 2px 2px 0" }} />

                      {/* Dynamic island */}
                      <div style={{ position: "absolute", top: "6px", left: "50%", transform: "translateX(-50%)", width: "36px", height: "10px", background: "#000", borderRadius: "6px", zIndex: 3 }} />

                      {/* Image */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imgUrl} alt={img.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", borderRadius: "20px" }} loading="lazy" />

                      {/* Glass gloss */}
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%)", borderRadius: "20px", pointerEvents: "none" }} />

                      {/* PREMIUM badge */}
                      <div style={{ position: "absolute", top: "18px", left: "8px", background: "rgba(201,168,76,0.15)", border: "1px solid #c9a84c", color: "#c9a84c", fontSize: "0.5rem", fontFamily: "monospace", padding: "2px 6px", letterSpacing: "0.1em" }}>⭐ PREMIUM</div>

                      {/* Gold shimmer overlay */}
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(201,168,76,0.04) 0%, transparent 60%)", borderRadius: "20px", pointerEvents: "none" }} />

                      {/* Home indicator */}
                      <div style={{ position: "absolute", bottom: "6px", left: "50%", transform: "translateX(-50%)", width: "40px", height: "3px", background: "rgba(255,255,255,0.3)", borderRadius: "2px" }} />
                    </div>

                    {/* Title */}
                    <div style={{ padding: "10px 10px 12px", background: "#0d0b14", borderTop: "1px solid rgba(201,168,76,0.1)" }}>
                      <p style={{ color: "#c9a84c", fontSize: "0.7rem", fontFamily: "monospace", margin: 0, lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>{img.title}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div style={{ textAlign: "center", marginTop: "clamp(20px,3vw,32px)" }}>
            <Link href="/iphone" className="dt-btn dt-btn--ghost" style={{ borderColor: "rgba(201,168,76,0.4)", color: "#c9a84c" }}>Browse All Wallpapers →</Link>
          </div>
        </section>
      )}

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
                <Link href={`/${devicePath}`} className="wotd-btn-ghost">
                  Browse {devicePath.charAt(0).toUpperCase() + devicePath.slice(1)} →
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
            const thumb = obs.thumbnail ? (obs.thumbnail.startsWith('http') ? obs.thumbnail : `${r2Base}/${obs.thumbnail}`) : null;
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

      <HorrorFact />

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