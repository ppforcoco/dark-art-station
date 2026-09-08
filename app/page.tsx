// app/page.tsx — Haunted Wallpapers Homepage

import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { db, getPageContent } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import TonightSlider from "@/components/TonightSlider";
import "./homepage.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";
const CDN      = "https://assets.hauntedwallpapers.com";
const OG_IMAGE = `${CDN}/haunted-wallpapers-hero-image.avif`;

// ─── Cached DB queries — all revalidate every 5 minutes ──────────────────────

const getCachedTotalImages = unstable_cache(
  () => db.image.count(),
  ["homepage-total-images"],
  { revalidate: 300 },
);

const getCachedNewThisWeek = unstable_cache(
  () => db.image.findMany({
    where: {
      isAdult: false,
      isAvatar: false,
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

export default async function Home() {
  let totalImages = 0;
  let newThisWeek: Array<{ id: string; slug: string; title: string; r2Key: string; deviceType: string | null; tags: string[] }> = [];

  try {
    [totalImages, newThisWeek] = await Promise.all([
      getCachedTotalImages(),
      getCachedNewThisWeek(),
    ]);
  } catch (err) {
    console.error("[home/page] DB error:", err);
  }

  function fmt(n: number) {
    if (n >= 1000) return `${Math.floor(n / 100) / 10}K+`;
    return `${Math.floor(n / 50) * 50}+`;
  }

  const newItems = newThisWeek.map((img) => {
    const devicePath = img.deviceType === "IPHONE" ? "iphone" : img.deviceType === "ANDROID" ? "android" : "pc";
    return {
      id: img.id, slug: img.slug, title: img.title,
      src: getPublicUrl(img.r2Key),
      devicePath, isWide: devicePath === "pc",
      isNew: true, isLocked: false, updatedAt: null,
    };
  });

  // Featured wallpaper shown inside the hero phone mockup — first "Tonight's
  // Haunting" item, so the mockup always reflects a real, current upload.
  const featured = newItems[0];

  return (
    <>

      <div className="hp">

        {/* ══ MARQUEE STRIP ═══════════════════════════════════════════════ */}
        <div className="hp-marquee" aria-hidden="true">
          <div className="hp-marquee-track">
            <span>NEW DROPS EVERY NIGHT ✦ 4K QUALITY, ALWAYS FREE ✦ HAUNTED TOWN NEVER SLEEPS ✦</span>
            <span>NEW DROPS EVERY NIGHT ✦ 4K QUALITY, ALWAYS FREE ✦ HAUNTED TOWN NEVER SLEEPS ✦</span>
          </div>
        </div>

        {/* ══ HERO (compact) ═══════════════════════════════════════════════ */}
        <section
          className="hp-hero"
          style={{
            minHeight: "auto",
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div
            className="hp-hero-inner-flex"
            style={{ maxWidth: "760px" }}
          >
            <div className="hp-hero-body" style={{ maxWidth: "420px" }}>
              <p className="hp-eyebrow" style={{ marginBottom: "4px" }}>
                New drops every day
              </p>
              <h1
                className="hp-hero-tagline"
                style={{ marginBottom: "10px" }}
              >
                You&rsquo;ve arrived in Haunted Town — where every wallpaper has a secret
              </h1>
              <div
                className="hp-hero-stat"
                style={{ gap: "16px", marginBottom: "12px" }}
              >
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
              <div className="hp-hero-cta" style={{ gap: "8px" }}>
                <Link prefetch={false} href="/all" className="hp-btn-red" style={{ padding: "6px 14px" }}>Browse All →</Link>
                <Link prefetch={false} href="/cool-wallpapers" className="hp-btn-ghost" style={{ padding: "6px 14px" }}>Beyond Haunted Town</Link>
                <Link prefetch={false} href="/residents" className="hp-btn-ghost" style={{ padding: "6px 14px" }}>Residents</Link>
              </div>
            </div>

            {/* ── Tilted phone mockup showing a real Tonight's Haunting wallpaper ── */}
            {featured && (
              <div className="hero-visual">
                <div className="glow" />
                <div className="phone-frame">
                  <svg className="bone-corner tl" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="14" cy="14" r="6" /><circle cx="50" cy="50" r="6" /><path d="M18 18 46 46" />
                  </svg>
                  <div className="notch" />
                  <div className="screen">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="wallpaper-art"
                      src={featured.src}
                      alt={featured.title}
                      loading="eager"
                    />
                  </div>
                  <div className="lockscreen-ui">
                    <div className="time">9:41</div>
                    <div className="date">Fri, Oct 31</div>
                  </div>
                  <svg className="bone-corner br" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="14" cy="14" r="6" /><circle cx="50" cy="50" r="6" /><path d="M18 18 46 46" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </section>


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

        {/* ══ NEWSLETTER ══════════════════════════════════════════════════ */}
        <section className="hp-newsletter">
          <h2>Get haunted (by email)</h2>
          <p>New drops, first look. Zero life advice.</p>
          <form
            className="hp-newsletter-form"
            onSubmit={(e) => e.preventDefault()}
          >
            <label htmlFor="hp-newsletter-email" style={{ position: "absolute", left: "-9999px" }}>
              Email address
            </label>
            <input
              id="hp-newsletter-email"
              type="email"
              placeholder="your@email.com"
              required
            />
            <button type="submit">Sign up</button>
          </form>
        </section>

      </div>
    </>
  );
}