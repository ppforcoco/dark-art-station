import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db, getRelatedImages } from "@/lib/db";
import { shouldCountPageView } from "@/lib/analytics-filter";
import { getPublicUrl } from "@/lib/r2";
import DeviceMockup from "@/components/DeviceMockup";
import RelatedWallpapers from "@/components/RelatedWallpapers";
import DownloadButton from "@/components/DownloadButton";
import RecentlyViewed from "@/components/RecentlyViewed";
import SocialShare from "@/components/SocialShare";
import PageTracker from "@/components/PageTracker";
import FavoriteButton from "@/components/FavoriteButton";
import PreviewButton from "@/components/PreviewButton";
import WallpaperTips from "@/components/WallpaperTips";
import KeyboardNav from "@/components/KeyboardNav";
import Breadcrumbs from "@/components/Breadcrumbs";
import PremiumLockedGateClient from "@/components/PremiumLockedGate";

// ─── Premium cycle constants (server-side, no flash) ────────────────────────
const EPOCH_MS  = Date.UTC(2025, 0, 1, 0, 0, 0); // Jan 1 2025 00:00 UTC
const CYCLE_MS  = 48 * 60 * 60 * 1000;            // 48h full cycle
const UNLOCK_MS = 24 * 60 * 60 * 1000;            // first 24h = unlocked
function isPremiumLocked(): boolean {
  const pos = (Date.now() - EPOCH_MS) % CYCLE_MS;
  return pos >= UNLOCK_MS;
}

export const dynamicParams = true;
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ imageSlug: string }>;
}


// ── Fallback description generator ──────────────────────────────────────────
function buildFallbackDescription(title: string, tags: string[]): string {
  const tagList = tags.length > 0 ? tags.slice(0, 5).join(", ") : "dark fantasy, atmospheric, gothic";
  const firstTag = tags[0] ?? "dark fantasy";
  const secondTag = tags[1] ?? "atmospheric";
  return (
    title + " is a free high-resolution iPhone wallpaper from the Haunted Wallpapers dark art collection. " +
    "Optimised for iPhone screens in a native 9:16 portrait aspect ratio, this piece fills your lock screen and home screen " +
    "with immersive artwork rooted in themes of " + tagList + ". " +
    "The image renders crisply on all modern iPhone models including the iPhone 15, 14, and 13 series, " +
    "with deep blacks that look especially striking on OLED displays. " +
    "Whether you are drawn to " + firstTag + " aesthetics or simply want a " + secondTag + " backdrop that reflects your taste, " +
    "this wallpaper delivers bold, original dark art at no cost. " +
    "No account or sign-up is required — tap download and the full-resolution file is yours instantly. " +
    "Every image in our iPhone collection is produced exclusively for Haunted Wallpapers, " +
    "so you will not find this artwork duplicated across generic wallpaper repositories. " +
    "Scroll down to explore related wallpapers with a similar dark atmosphere and artistic style."
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { imageSlug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";
  const image = await db.image.findUnique({
    where: { slug: imageSlug },
    select: { title: true, description: true, r2Key: true, tags: true, isAdult: true, deviceType: true },
  });
  if (!image || image.deviceType !== "IPHONE") return { title: "Not Found | HAUNTED WALLPAPERS" };
  const ogImage = getPublicUrl(image.r2Key);
  const tagLine = image.tags.slice(0, 3).map((t) => `#${t}`).join(" ");
  return {
    title: `${image.title} — Free iPhone Wallpaper | HAUNTED WALLPAPERS`,
    description: image.description ?? `${image.title} — free high-res dark fantasy iPhone wallpaper. ${tagLine}. Download instantly, no account required.`,
    keywords: ["iphone wallpaper", "dark wallpaper iphone", "hd iphone wallpaper", image.title, ...image.tags],
    openGraph: {
      title: `${image.title} | HAUNTED WALLPAPERS`,
      description: image.description ?? `Free HD iPhone wallpaper: ${image.title}`,
      url: `${siteUrl}/iphone/${imageSlug}`,
      siteName: "HAUNTED WALLPAPERS",
      images: [{ url: ogImage, width: 1080, height: 1920, alt: image.title }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${image.title} | HAUNTED WALLPAPERS`,
      description: image.description ?? `Free HD iPhone wallpaper: ${image.title}`,
      images: [ogImage],
    },
    alternates: { canonical: `${siteUrl}/iphone/${imageSlug}` },
    ...(image.isAdult ? { robots: { index: false, follow: false, nosnippet: true } } : {}),
  };
}

export async function generateStaticParams() {
  const images = await db.image.findMany({
    where: { collectionId: null, deviceType: "IPHONE" },
    select: { slug: true },
  });
  return images.map((img) => ({ imageSlug: img.slug }));
}

export default async function IphoneImagePage({ params }: PageProps) {
  const { imageSlug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

  const image = await db.image.findUnique({
    where: { slug: imageSlug },
    select: {
      id: true, slug: true, title: true, description: true,
      r2Key: true, highResKey: true, tags: true,
      viewCount: true, sortOrder: true, deviceType: true,
    },
  });

  if (!image || image.deviceType !== "IPHONE") notFound();

  if (await shouldCountPageView()) {
    db.image.update({
      where: { id: image.id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {});
  }

  const thumbUrl = getPublicUrl(image.r2Key);

  // Always show description — real or auto-generated
  const displayDescription = image.description ?? buildFallbackDescription(image.title, image.tags);
  const plainDescription = displayDescription.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

  const [siblings, related] = await Promise.all([
    db.image.findMany({
      where: { collectionId: null, deviceType: "IPHONE" },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: { slug: true, title: true, r2Key: true, sortOrder: true },
    }),
    getRelatedImages(image.id, image.tags, 6, "IPHONE"),
  ]);
  const currentIdx = siblings.findIndex((s) => s.slug === imageSlug);
  const prevImage = currentIdx > 0 ? siblings[currentIdx - 1] : null;
  const nextImage = currentIdx < siblings.length - 1 ? siblings[currentIdx + 1] : null;

  // ── Server-side premium lock check — full gate, zero flash ─────────────
  if (image.tags.includes("badge-premium") && isPremiumLocked()) {
    return (
      <PremiumLockedGateClient tags={image.tags} devicePath="iphone">
        <span />
      </PremiumLockedGateClient>
    );
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <WallpaperTips mode="banner" />

      {/* ── Breadcrumb ── */}
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "iPhone Wallpapers", href: "/iphone" },
        { label: image.title },
      ]} />

      {/* ── Prev / Next — TOP, visible immediately ── */}
      {(prevImage || nextImage) && (
        <nav style={{
          maxWidth: "1280px", margin: "0 auto",
          padding: "16px 24px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          borderBottom: "1px solid var(--border-dim)",
        }}>
          {prevImage ? (
            <Link href={`/iphone/${prevImage.slug}`}
              style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "12px", padding: "10px", border: "1px solid var(--border-dim)", textDecoration: "none" }}
              className="hover:border-[rgba(139,0,0,0.5)] transition-colors">
              <div style={{ position: "relative", flexShrink: 0, width: "48px", height: "86px", overflow: "hidden", borderRadius: "4px" }}>
                <Image src={getPublicUrl(prevImage.r2Key)} alt={prevImage.title} fill className="object-cover" unoptimized sizes="48px" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
                <span className="font-mono text-[0.5rem] tracking-[0.2em] uppercase" style={{ color: "var(--text-muted)" }}>← Previous</span>
                <span className="font-body italic text-[0.75rem]"
                  style={{ color: "var(--text-primary)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                  {prevImage.title}
                </span>
              </div>
            </Link>
          ) : <div />}

          {nextImage ? (
            <Link href={`/iphone/${nextImage.slug}`}
              style={{ display: "flex", flexDirection: "row-reverse", alignItems: "center", gap: "12px", padding: "10px", border: "1px solid var(--border-dim)", textDecoration: "none" }}
              className="hover:border-[rgba(139,0,0,0.5)] transition-colors">
              <div style={{ position: "relative", flexShrink: 0, width: "48px", height: "86px", overflow: "hidden", borderRadius: "4px" }}>
                <Image src={getPublicUrl(nextImage.r2Key)} alt={nextImage.title} fill className="object-cover" unoptimized sizes="48px" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0, textAlign: "right" }}>
                <span className="font-mono text-[0.5rem] tracking-[0.2em] uppercase" style={{ color: "var(--text-muted)" }}>Next →</span>
                <span className="font-body italic text-[0.75rem]"
                  style={{ color: "var(--text-primary)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                  {nextImage.title}
                </span>
              </div>
            </Link>
          ) : <div />}
        </nav>
      )}

      {/* ── Main layout: image centered on mobile, side-by-side on md+ ── */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px 24px 40px" }}>
        <div className="iphone-detail-grid" style={{ display: "flex", flexDirection: "column", gap: "40px" }}>

          {/* Image — hero size */}
          <div className="iphone-detail-image-wrap">
            <DeviceMockup deviceType="IPHONE">
              <div className="relative w-full h-full">
                <Image src={thumbUrl} alt={image.title} fill className="object-cover" priority quality={90} unoptimized sizes="(max-width: 768px) 100vw, 65vw" />
              </div>
            </DeviceMockup>
            {/* ↓ Download + Preview buttons — glowing CTA below device */}
            <div style={{ marginTop: "16px", width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div className="hw-glow-btn-wrap hw-glow-btn-wrap--download">
                <DownloadButton
                  href={`/api/download/image/${image.id}`}
                  viewCount={image.viewCount}
                />
              </div>
              <div className="hw-glow-btn-wrap hw-glow-btn-wrap--preview">
                <PreviewButton src={thumbUrl} title={image.title} />
              </div>
            </div>
          </div>


          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold mt-3 leading-tight">
                {image.title}
              </h1>
              {/* FOMO Badges */}
              {image.tags.filter((t: string) => t.startsWith("badge-")).length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px", marginBottom: "4px" }}>
                  {image.tags.filter((t: string) => t.startsWith("badge-")).map((tag: string) => {
                    const badgeMap: Record<string, { label: string; color: string; bg: string }> = {
                      "badge-premium":   { label: "⭐ Premium",   color: "#c9a84c", bg: "rgba(201,168,76,0.15)" },
                      "badge-trending":  { label: "🔥 Trending",  color: "#ff6b35", bg: "rgba(255,107,53,0.15)" },
                      "badge-new":       { label: "✨ New",        color: "#4caf50", bg: "rgba(76,175,80,0.15)" },
                      "badge-hot":       { label: "💀 Hot",        color: "#e040fb", bg: "rgba(224,64,251,0.15)" },
                      "badge-exclusive": { label: "🌙 Exclusive",  color: "#42a5f5", bg: "rgba(66,165,245,0.15)" },
                      "badge-limited":   { label: "⏳ Limited",    color: "#ff5252", bg: "rgba(255,82,82,0.15)" },
                    };
                    const b = badgeMap[tag];
                    if (!b) return null;
                    return (
                      <span key={tag} style={{ background: b.bg, border: `1px solid ${b.color}`, color: b.color, fontSize: "0.65rem", fontFamily: "monospace", padding: "3px 10px", letterSpacing: "0.08em" }}>
                        {b.label}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Always rendered — real description or auto-generated fallback */}
            <div className="font-body text-[1rem] leading-relaxed description-html" style={{ color: "var(--text-muted)" }} dangerouslySetInnerHTML={{ __html: displayDescription }} />

            {/* Save to favorites */}
            <div className="detail-fav-row">
              <FavoriteButton
                size="md"
                className="detail-fav-inline"
                item={{
                  slug:   image.slug,
                  title:  image.title,
                  thumb:  thumbUrl,
                  href:   `/iphone/${imageSlug}`,
                  device: "iphone",
                }}
              />
              <span className="detail-fav-label">Save to Favorites</span>
            </div>

            {/* Ad unit — below download button for higher viewability score */}
          </div>
        </div>
      </section>

      {/* Desktop two-column layout via CSS */}
      <style>{`
                .iphone-detail-image-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        @media (min-width: 768px) {
          .iphone-detail-grid { flex-direction: row !important; align-items: flex-start; gap: 56px !important; }
          
                  .iphone-detail-image-wrap { flex: 0 0 420px; justify-content: flex-start; }
          .iphone-detail-grid > div:last-child { flex: 1; position: sticky; top: 100px; }
        }
        @media (min-width: 1024px) {
                  .iphone-detail-image-wrap { flex: 0 0 480px; }
        }
        /* ── Glowing Download 4K button ── */
        .hw-glow-btn-wrap--download {
          animation: hwDlGlowPulse 2.8s ease-in-out infinite;
          border-radius: 2px;
        }
        @keyframes hwDlGlowPulse {
          0%, 100% { box-shadow: 0 0 12px rgba(192,0,26,0.35), 0 0 28px rgba(192,0,26,0.15); }
          50%       { box-shadow: 0 0 22px rgba(192,0,26,0.65), 0 0 50px rgba(192,0,26,0.28); }
        }
        /* ── Glowing Lock Screen Preview button ── */
        .hw-glow-btn-wrap--preview {
          border-radius: 2px;
          box-shadow: 0 0 10px rgba(201,168,76,0.2), 0 0 22px rgba(201,168,76,0.08);
          transition: box-shadow 0.3s ease;
        }
        .hw-glow-btn-wrap--preview:hover {
          box-shadow: 0 0 18px rgba(201,168,76,0.45), 0 0 38px rgba(201,168,76,0.2);
        }
      `}</style>

      <RelatedWallpapers images={related} heading="More Dark Art You'll Like" />
      <PageTracker item={{
        slug: image.slug,
        title: image.title,
        thumb: thumbUrl,
        href: `/iphone/${imageSlug}`,
      }} />
      <SocialShare
        title={image.title}
        imageUrl={thumbUrl}
        pageUrl={`${siteUrl}/iphone/${imageSlug}`}
      />
      <RecentlyViewed currentSlug={image.slug} />
      <KeyboardNav
        prevHref={prevImage ? `/iphone/${prevImage.slug}` : null}
        nextHref={nextImage ? `/iphone/${nextImage.slug}` : null}
      />

      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "@id": `${siteUrl}/iphone/${imageSlug}#product`,
          name: image.title,
          description: plainDescription,
          url: `${siteUrl}/iphone/${imageSlug}`,
          brand: { "@type": "Brand", name: "HAUNTED WALLPAPERS", url: siteUrl },
          category: "Digital Products > Wallpapers > iPhone",
          image: [{ "@type": "ImageObject", url: thumbUrl, contentUrl: thumbUrl, caption: image.title }],
          additionalProperty: [
            { "@type": "PropertyValue", name: "Format", value: "JPEG (HD High Resolution)" },
            { "@type": "PropertyValue", name: "Device", value: "iPhone" },
            { "@type": "PropertyValue", name: "Aspect Ratio", value: "9:16 Portrait" },
            { "@type": "PropertyValue", name: "Instant Download", value: "Yes" },
          ],
          offers: {
            "@type": "Offer",
            url: `${siteUrl}/iphone/${imageSlug}`,
            price: "0.00",
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
            seller: { "@type": "Organization", name: "HAUNTED WALLPAPERS", url: siteUrl },
          },
          potentialAction: {
            "@type": "DownloadAction",
            target: `${siteUrl}/api/download/image/${image.id}`,
          },
        })
      }} />
    </main>
  );
}