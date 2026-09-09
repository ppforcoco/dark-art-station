// app/page.tsx — MR4K Walls Homepage

import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { db, getPageContent } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import TonightSlider from "@/components/TonightSlider";
import NewsletterForm from "@/components/NewsletterForm";
import "./homepage.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mr4kwalls.com";
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
    "Dark fantasy wallpapers for iPhone and Android. Gothic, horror, cosmic art.";
  const title = pageContent?.title ??
    "MR4K Walls | Dark Fantasy & Horror Wallpapers";
  return {
    title,
    description: desc,
    metadataBase: new URL(SITE_URL),
    openGraph: {
      title, description: desc, url: SITE_URL,
      siteName: "MR4K Walls", type: "website",
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "MR4K Walls" }],
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

  // Three wallpapers shown across the hero phone mockups — pulled from the
  // same "Tonight's Haunting" query so they're always real, current uploads.
  const featuredItems = newItems.slice(0, 3);

  return (
    <>

      <div className="hp">

        {/* ══ MARQUEE STRIP ═══════════════════════════════════════════════ */}
        <div className="hp-marquee" aria-hidden="true">
          <div className="hp-marquee-track">
            <span>NEW DROPS EVERY WEEK ✦ 4K ONLY, NO CAP ✦ MR4K NEVER SLEEPS ✦</span>
          </div>
        </div>

        {/* ══ HERO ═════════════════════════════════════════════════════════ */}
        <section className="hp-hero">
          <div className="hp-hero-grid">
            <div className="hp-hero-body">
              <p className="hp-hero-seo-title">MR4K Walls</p>
              <h1 className="hp-hero-headline display">
                Your screen
                <br />
                deserves
                <br />
                <span className="hp-hero-accent">some drip.</span>
              </h1>
              <p className="hp-hero-sub">Premium 4K wallpapers for every screen.</p>
              <p className="hp-hero-stat-line">
                {fmt(totalImages)} wallpapers &middot; 4K quality &middot; zero cap
              </p>
              <div className="hp-hero-ctas">
                <Link prefetch={false} href="/all" className="hp-btn-primary">
                  Raid the collection
                </Link>
                <Link prefetch={false} href="#tonight-haunting" className="hp-btn-big">
                  See what&rsquo;s hitting
                </Link>
              </div>
            </div>

            {/* ── Three tilted phone mockups showing real Tonight's Haunting wallpapers ── */}
            {featuredItems.length > 0 && (
              <div className="hero-visual hero-visual--trio">
                <div className="glow" />
                {featuredItems.map((item, i) => (
                  <div className={`phone-frame phone-frame--${i}`} key={item.id}>
                    <svg className="bone-corner tl" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="14" cy="14" r="6" /><circle cx="50" cy="50" r="6" /><path d="M18 18 46 46" />
                    </svg>
                    <div className="notch" />
                    <div className="screen">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        className="wallpaper-art"
                        src={item.src}
                        alt={item.title}
                        loading={i === 0 ? "eager" : "lazy"}
                      />
                    </div>
                    <svg className="bone-corner br" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="14" cy="14" r="6" /><circle cx="50" cy="50" r="6" /><path d="M18 18 46 46" />
                    </svg>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>


        {/* ══ FRESH FROM THE TOWN ══════════════════════════════════════════ */}
        {newThisWeek.length > 0 && (
          <section className="hp-section hp-new" id="tonight-haunting">
            <div className="hp-section-head">
              <div>
                <p className="hp-section-eye" style={{ color:"#4ade80" }}>Fresh Drip Alert</p>
                <h2 className="hp-section-title">This Week&rsquo;s Heat</h2>
                <p className="hp-section-sub">New uploads just clocked in. You&rsquo;re welcome.</p>
              </div>
            </div>

            <TonightSlider items={newItems} />
          </section>
        )}

        {/* ══ NEWSLETTER ══════════════════════════════════════════════════ */}
        <section className="hp-newsletter">
          <h2>Get the drip (by email)</h2>
          <p>New drops, first dibs. Zero life advice.</p>
          <NewsletterForm />
        </section>

      </div>
    </>
  );
}