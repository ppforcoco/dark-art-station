// app/page.tsx — Haunted Wallpapers Homepage

import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { db, getPageContent } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import TonightSlider from "@/components/TonightSlider";
import NewsletterForm from "@/components/NewsletterForm";
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

        {/* ══ HERO ═════════════════════════════════════════════════════════ */}
        <section className="hp-hero">
          <div className="hp-hero-grid">
            <div className="hp-hero-body">
              <h1 className="hp-hero-headline display">
                Your screen
                <br />
                deserves
                <br />
                <span className="hp-hero-accent">nightmares.</span>
              </h1>
              <p className="hp-hero-sub">
                Hand-picked dark art wallpapers, free to download, updated daily.
              </p>
              <p className="hp-hero-stat-line">
                {fmt(totalImages)} wallpapers &middot; 4K quality &middot; always free
              </p>
              <div className="hp-hero-ctas">
                <Link prefetch={false} href="/all" className="hp-btn-primary">
                  Browse the collection
                </Link>
                <Link prefetch={false} href="#tonight-haunting" className="hp-btn-big">
                  See what&rsquo;s trending
                </Link>
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
          <section className="hp-section hp-new" id="tonight-haunting">
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
          <NewsletterForm />
        </section>

      </div>
    </>
  );
}