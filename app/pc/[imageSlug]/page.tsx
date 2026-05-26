// app/pc/[imageSlug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import DeviceMockup from "@/components/DeviceMockup";
import DownloadButton from "@/components/DownloadButton";
import RecentlyViewed from "@/components/RecentlyViewed";
import SocialShare from "@/components/SocialShare";
import PageTracker from "@/components/PageTracker";
import FavoriteButton from "@/components/FavoriteButton";
import { shouldCountPageView } from "@/lib/analytics-filter";
import WallpaperTips from "@/components/WallpaperTips";
import KeyboardNav from "@/components/KeyboardNav";
import Breadcrumbs from "@/components/Breadcrumbs";

export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ imageSlug: string }>;
}

function buildFallbackDescription(title: string, tags: string[]): string {
  const tagList = tags.length > 0 ? tags.slice(0, 5).join(", ") : "dark fantasy, atmospheric, gothic";
  const firstTag = tags[0] ?? "dark fantasy";
  const secondTag = tags[1] ?? "atmospheric";
  return (
    title + " is a free high-resolution PC wallpaper from the Haunted Wallpapers dark art collection. " +
    "Crafted for desktop and widescreen monitors, this piece immerses your screen in themes of " + tagList + ". " +
    "Formatted at a native 16:9 aspect ratio, it fits seamlessly across 1080p, 1440p, and 4K displays without cropping or distortion. " +
    "Whether you gravitate toward " + firstTag + " aesthetics or simply want a " + secondTag + " backdrop that stands out, " +
    "this wallpaper delivers moody, original artwork at no cost. " +
    "No account or sign-up is required — click download and the full-resolution file is yours instantly. " +
    "Every image in our PC collection is produced exclusively for Haunted Wallpapers, " +
    "so you will not find this artwork duplicated across generic wallpaper repositories."
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { imageSlug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";
  const image = await db.image.findUnique({
    where: { slug: imageSlug },
    select: { title: true, description: true, metaDescription: true, r2Key: true, tags: true, isAdult: true, deviceType: true },
  });
  if (!image || image.deviceType !== "PC") return { title: "Not Found | HAUNTED WALLPAPERS" };
  const tagLine = image.tags.slice(0, 3).map((t) => `#${t}`).join(" ");
  const plainDesc = (image.metaDescription ?? image.description ?? "")
    .replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 200);
  const metaDesc = plainDesc || `${image.title} — free dark fantasy PC wallpaper. ${tagLine}. Download instantly, no account required.`;
  const plainMetaDesc = metaDesc.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const ogImage = "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/og/og-image-for-desktop-and%3Dpc-wallpaper.webp";
  return {
    metadataBase: new URL(siteUrl),
    title: `${image.title} — Free PC Wallpaper | HAUNTED WALLPAPERS`,
    description: plainMetaDesc,
    keywords: ["pc wallpaper", "dark wallpaper pc", "hd pc wallpaper", image.title, ...image.tags],
    openGraph: {
      title: `${image.title} | HAUNTED WALLPAPERS`,
      description: plainMetaDesc,
      url: `${siteUrl}/pc/${imageSlug}`,
      siteName: "HAUNTED WALLPAPERS",
      images: [{ url: ogImage, width: 1200, height: 630, alt: image.title }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${image.title} | HAUNTED WALLPAPERS`,
      description: plainMetaDesc,
      images: [ogImage],
    },
    alternates: { canonical: `${siteUrl}/pc/${imageSlug}` },
    ...(image.isAdult ? { robots: { index: false, follow: false, nosnippet: true } } : {}),
  };
}

export async function generateStaticParams() {
  return [];
}

export default async function PcImagePage({ params }: PageProps) {
  const { imageSlug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

  const image = await db.image.findUnique({
    where: { slug: imageSlug },
    select: {
      id: true, slug: true, title: true, description: true,
      r2Key: true, highResKey: true, tags: true,
      viewCount: true, sortOrder: true, deviceType: true,
      _count: { select: { downloads: true } },
    },
  });

  if (!image || image.deviceType !== "PC") notFound();

  if (await shouldCountPageView()) {
    db.image.update({
      where: { id: image.id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {});
  }

  const thumbUrl = getPublicUrl(image.r2Key);
  const displayDescription = image.description ?? buildFallbackDescription(image.title, image.tags);
  const plainDescription = displayDescription.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

  const siblings = await db.image.findMany({
    where: { collectionId: null, deviceType: "PC" },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: { slug: true, title: true, r2Key: true, sortOrder: true },
  });

  const currentIdx = siblings.findIndex((s) => s.slug === imageSlug);
  const prevImage = currentIdx > 0 ? siblings[currentIdx - 1] : null;
  const nextImage = currentIdx < siblings.length - 1 ? siblings[currentIdx + 1] : null;
  const nextImageSrc = nextImage ? getPublicUrl(nextImage.r2Key) : null;

  const stripImages = siblings
    .slice(Math.max(0, currentIdx - 2), currentIdx)
    .concat(siblings.slice(currentIdx + 1, currentIdx + 5))
    .slice(0, 4);

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)", colorScheme: "dark" }}>
      <WallpaperTips mode="banner" />

      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "PC Wallpapers", href: "/pc" },
        { label: image.title },
      ]} />

      {nextImageSrc && <link rel="preload" as="image" href={nextImageSrc} />}

      {/* ── More Dark Art — small thumbnail strip ── */}
      {stripImages.length > 0 && (
        <div style={{
          maxWidth: "1280px", margin: "0 auto", padding: "10px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", gap: "6px", alignItems: "center",
        }}>
          <span style={{
            fontFamily: "var(--font-space, monospace)", fontSize: "0.45rem",
            letterSpacing: "0.2em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.2)", whiteSpace: "nowrap", marginRight: "4px",
          }}>More ▸</span>
          {stripImages.map((img) => (
            <Link key={img.slug} href={`/pc/${img.slug}`} className="more-strip-link">
              <div className="more-strip-thumb" style={{
                position: "relative", width: "78px", height: "50px",
                overflow: "hidden", borderRadius: "4px",
                border: "1px solid rgba(255,255,255,0.08)",
              }}>
                <Image
                  src={getPublicUrl(img.r2Key)}
                  alt={img.title}
                  fill
                  className="object-cover"
                  unoptimized
                  sizes="78px"
                />
              </div>
            </Link>
          ))}
        </div>
      )}
      <KeyboardNav
        prevHref={prevImage ? `/pc/${prevImage.slug}` : null}
        nextHref={nextImage ? `/pc/${nextImage.slug}` : null}
        showHint
        prevImage={prevImage ? { href: `/pc/${prevImage.slug}`, title: prevImage.title, thumb: getPublicUrl(prevImage.r2Key) } : null}
        nextImage={nextImage ? { href: `/pc/${nextImage.slug}`, title: nextImage.title, thumb: getPublicUrl(nextImage.r2Key) } : null}
      />

      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px 24px 40px" }}>
        <div className="pc-detail-grid" style={{ display: "flex", flexDirection: "column", gap: "40px" }}>

          {/* ── Image column ── */}
          <div className="pc-detail-image-wrap">
            <DeviceMockup deviceType="PC">
              <div className="relative w-full h-full" style={{ background: "#050505" }}>
                <Image
                  src={thumbUrl}
                  alt={image.title}
                  fill
                  className="object-contain"
                  priority
                  fetchPriority="high"
                  quality={85}
                  sizes="(max-width: 768px) 100vw, 860px"
                />
              </div>
            </DeviceMockup>

            <div style={{ marginTop: "16px", width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div className="hw-glow-btn-wrap hw-glow-btn-wrap--download">
                <DownloadButton
                  href={`/api/download/image/${image.id}`}
                  downloadCount={image._count.downloads}
                />
              </div>
            </div>
          </div>

          {/* ── Info column ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <h1 style={{
                fontFamily: "var(--font-cinzel, serif)",
                fontSize: "clamp(1.5rem, 3vw, 2.4rem)",
                fontWeight: 700,
                lineHeight: 1.15,
                letterSpacing: "0.04em",
                marginTop: "0.75rem",
                color: "var(--text-primary)",
              }}>
                {image.title}
              </h1>

              {image.tags.filter((t: string) => t.startsWith("badge-")).length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px", marginBottom: "4px" }}>
                  {image.tags.filter((t: string) => t.startsWith("badge-")).map((tag: string) => {
                    const badgeMap: Record<string, { label: string; color: string; bg: string }> = {
                      "badge-premium":   { label: "⭐ Premium",   color: "#c9a84c", bg: "rgba(201,168,76,0.15)" },
                      "badge-trending":  { label: "🔥 Trending",  color: "#ff6b35", bg: "rgba(255,107,53,0.15)" },
                      "badge-hot":       { label: "💀 Hot",        color: "#e040fb", bg: "rgba(224,64,251,0.15)" },
                      "badge-exclusive": { label: "🌙 Exclusive",  color: "#42a5f5", bg: "rgba(66,165,245,0.15)" },
                      "badge-limited":   { label: "⏳ Limited",    color: "#ff5252", bg: "rgba(255,82,82,0.15)" },
                    };
                    const b = badgeMap[tag];
                    if (!b) return null;
                    return (
                      <span key={tag} style={{
                        background: b.bg, border: `1px solid ${b.color}`, color: b.color,
                        fontSize: "0.65rem", fontFamily: "monospace", padding: "3px 10px", letterSpacing: "0.08em",
                      }}>
                        {b.label}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            <SocialShare title={image.title} imageUrl={thumbUrl} pageUrl={`${siteUrl}/pc/${imageSlug}`} />

            <div
              className="font-body text-[1rem] leading-relaxed description-html"
              style={{ color: "var(--text-muted)", colorScheme: "dark" }}
              dangerouslySetInnerHTML={{ __html: displayDescription }}
            />

            <div className="detail-fav-row">
              <FavoriteButton
                size="md"
                className="detail-fav-inline"
                item={{
                  slug:   image.slug,
                  title:  image.title,
                  thumb:  thumbUrl,
                  href:   `/pc/${imageSlug}`,
                  device: "pc",
                }}
              />
              <span className="detail-fav-label">Save to Favorites</span>
            </div>
          </div>

        </div>
      </section>

      <style>{`
        .pc-detail-image-wrap { display: flex; flex-direction: column; align-items: center; }
        @media (min-width: 768px) {
          .pc-detail-grid { flex-direction: row !important; align-items: flex-start; gap: 56px !important; }
          .pc-detail-image-wrap { flex: 0 0 560px; justify-content: flex-start; }
          .pc-detail-grid > div:last-child { flex: 1; position: sticky; top: 100px; }
        }
        @media (min-width: 1024px) { .pc-detail-image-wrap { flex: 0 0 640px; } }
        .description-html { color-scheme: dark; }
        .description-html p { margin-bottom: 0.75rem; }
        .description-html p:last-child { margin-bottom: 0; }
        .description-html a { color: #8b0000; text-decoration: underline; }
        .description-html a:hover { color: #c0001a; }
        .description-html strong, .description-html b { color: #f0ecff; }
        .description-html ul, .description-html ol { padding-left: 1.25rem; margin-bottom: 0.75rem; }
        .description-html li { margin-bottom: 0.25rem; }
        .hw-glow-btn-wrap--download { animation: hwDlGlowPulse 2.8s ease-in-out infinite; border-radius: 2px; }
        @keyframes hwDlGlowPulse {
          0%, 100% { box-shadow: 0 0 12px rgba(192,0,26,0.35), 0 0 28px rgba(192,0,26,0.15); }
          50%       { box-shadow: 0 0 22px rgba(192,0,26,0.65), 0 0 50px rgba(192,0,26,0.28); }
        }
        .social-share { border: 1px solid rgba(192,0,26,0.25); border-radius: 6px; padding: 12px 14px; background: rgba(192,0,26,0.04); }
        .social-share-label { font-family: var(--font-space, monospace); font-size: 0.55rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px; }
        .social-share-btns { display: flex; flex-wrap: wrap; gap: 8px; }
        .social-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 4px; font-size: 0.72rem; font-family: var(--font-space, monospace); letter-spacing: 0.06em; text-decoration: none; border: 1px solid var(--border-dim, rgba(255,255,255,0.1)); color: var(--text-primary); background: transparent; cursor: pointer; transition: border-color 0.2s, background 0.2s; white-space: nowrap; }
        .social-btn svg { width: 14px; height: 14px; fill: currentColor; flex-shrink: 0; }
        .social-btn:hover { border-color: rgba(255,255,255,0.25); background: rgba(255,255,255,0.04); }
        .social-btn--native { border-color: rgba(192,0,26,0.4); color: #f0e8e8; }
        .social-btn--native:hover { background: rgba(192,0,26,0.1); }
        .social-btn--pinterest { color: #e60023; border-color: rgba(230,0,35,0.3); }
        .social-btn--x { color: var(--text-primary); }
        .social-btn--whatsapp { color: #25d366; border-color: rgba(37,211,102,0.3); }
      `}</style>

      <PageTracker item={{ slug: image.slug, title: image.title, thumb: thumbUrl, href: `/pc/${imageSlug}` }} />
      <RecentlyViewed currentSlug={image.slug} />

      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "@id": `${siteUrl}/pc/${imageSlug}#product`,
          name: image.title,
          description: plainDescription,
          url: `${siteUrl}/pc/${imageSlug}`,
          brand: { "@type": "Brand", name: "HAUNTED WALLPAPERS", url: siteUrl },
          category: "Digital Products > Wallpapers > PC",
          image: [{ "@type": "ImageObject", url: thumbUrl, contentUrl: thumbUrl, caption: image.title }],
          additionalProperty: [
            { "@type": "PropertyValue", name: "Format", value: "JPEG (High Resolution)" },
            { "@type": "PropertyValue", name: "Device", value: "PC" },
            { "@type": "PropertyValue", name: "Aspect Ratio", value: "16:9 Landscape" },
            { "@type": "PropertyValue", name: "Instant Download", value: "Yes" },
          ],
          offers: {
            "@type": "Offer",
            url: `${siteUrl}/pc/${imageSlug}`,
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