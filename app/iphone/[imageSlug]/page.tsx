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
import WallpaperReactions from "@/components/WallpaperReactions";
import RecentlyViewed from "@/components/RecentlyViewed";
import SocialShare from "@/components/SocialShare";
import PageTracker from "@/components/PageTracker";
import FavoriteButton from "@/components/FavoriteButton";
import PreviewButton from "@/components/PreviewButton";
import WallpaperTips from "@/components/WallpaperTips";
import KeyboardNav from "@/components/KeyboardNav";
import Breadcrumbs from "@/components/Breadcrumbs";
import PremiumLockedGateClient from "@/components/PremiumLockedGate";
import BirthdayComments from "@/components/BirthdayComments";
import SummonRandomTag from "@/components/SummonRandomTag";


export const dynamic = "force-dynamic";

// ─── Premium cycle constants (server-side, no flash) ────────────────────────
const EPOCH_MS  = Date.UTC(2025, 0, 1, 0, 0, 0);
const CYCLE_MS  = 48 * 60 * 60 * 1000;
const UNLOCK_MS = 24 * 60 * 60 * 1000;
function isPremiumLocked(): boolean {
  const pos = (Date.now() - EPOCH_MS) % CYCLE_MS;
  return pos >= UNLOCK_MS;
}

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

  const plainDesc = image.description
    ? image.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 200)
    : null;

  const tagLine = image.tags.slice(0, 3).map((t) => `#${t}`).join(" ");
  const fallbackDesc = `${image.title} — free high-res dark fantasy iPhone wallpaper. ${tagLine}. Download instantly, no account required.`;
  const metaDesc = plainDesc ?? fallbackDesc;
  const ogImage = "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/og/haunted-wallpapers-dark-4k-for-iphone-and-adnroid.webp";

  return {
    metadataBase: new URL(siteUrl),
    title: `${image.title} — Free iPhone Wallpaper | HAUNTED WALLPAPERS`,
    description: metaDesc,
    keywords: ["iphone wallpaper", "dark wallpaper iphone", "hd iphone wallpaper", image.title, ...image.tags],
    openGraph: {
      title: `${image.title} | HAUNTED WALLPAPERS`,
      description: metaDesc,
      url: `${siteUrl}/iphone/${imageSlug}`,
      siteName: "HAUNTED WALLPAPERS",
      images: [{ url: ogImage, width: 1200, height: 630, alt: image.title }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${image.title} | HAUNTED WALLPAPERS`,
      description: metaDesc,
      images: [ogImage],
    },
    alternates: { canonical: `${siteUrl}/iphone/${imageSlug}` },
    ...(image.isAdult ? { robots: { index: false, follow: false, nosnippet: true } } : {}),
  };
}

export async function generateStaticParams() {
  return [];
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
      commentsEnabled: true,
      _count: { select: { downloads: true } },
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
  const displayDescription = image.description ?? buildFallbackDescription(image.title, image.tags);
  const plainDescription = displayDescription.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

  const [siblings, related] = await Promise.all([
    db.image.findMany({
      where: { collectionId: null, deviceType: "IPHONE" },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: { slug: true, title: true, r2Key: true, sortOrder: true, tags: true },
    }),
    getRelatedImages(image.id, image.tags, 6, "IPHONE"),
  ]);
  const currentIdx = siblings.findIndex((s) => s.slug === imageSlug);
  const prevImage = currentIdx > 0 ? siblings[currentIdx - 1] : null;
  const nextImage = currentIdx < siblings.length - 1 ? siblings[currentIdx + 1] : null;

  // Tag-sorted strip: siblings sharing most tags with current image appear first
  const imageTags = new Set(image.tags);
  const tagSortedStrip = siblings
    .filter((s) => s.slug !== imageSlug)
    .sort((a, b) => {
      const aScore = (a.tags as string[]).filter((t) => imageTags.has(t)).length;
      const bScore = (b.tags as string[]).filter((t) => imageTags.has(t)).length;
      return bScore - aScore;
    })
    .slice(0, 4);

  if (image.tags.includes("badge-premium") && isPremiumLocked()) {
    return (
      <PremiumLockedGateClient tags={image.tags} devicePath="iphone">
        <span />
      </PremiumLockedGateClient>
    );
  }

  const nextImageSrc = nextImage ? getPublicUrl(nextImage.r2Key) : null;

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)", colorScheme: "dark" }}>
      <WallpaperTips mode="banner" />

      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "iPhone Wallpapers", href: "/iphone" },
        { label: image.title },
      ]} />

            {/* ── More Dark Art — small strip at top ── */}
      {tagSortedStrip.length > 0 && (
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "10px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: "6px", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-space, monospace)", fontSize: "0.45rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", whiteSpace: "nowrap", marginRight: "4px" }}>More ▸</span>
          {tagSortedStrip.map((img) => (
            <Link key={img.slug} href={`/iphone/${img.slug}`} className="more-strip-link">
              <div className="more-strip-thumb" style={{ position: "relative", width: "44px", height: "78px", overflow: "hidden", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.08)" }}>
                <Image src={getPublicUrl(img.r2Key)} alt={img.title} fill className="object-cover" unoptimized sizes="44px" />
              </div>
            </Link>
          ))}
        </div>
      )}
      <KeyboardNav
        prevHref={prevImage ? `/iphone/${prevImage.slug}` : null}
        nextHref={nextImage ? `/iphone/${nextImage.slug}` : null}
        showHint
        prevImage={prevImage ? { href: `/iphone/${prevImage.slug}`, title: prevImage.title, thumb: getPublicUrl(prevImage.r2Key) } : null}
        nextImage={nextImage ? { href: `/iphone/${nextImage.slug}`, title: nextImage.title, thumb: getPublicUrl(nextImage.r2Key) } : null}
      />

      {nextImageSrc && (
        <link rel="preload" as="image" href={nextImageSrc} />
      )}

      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px 24px 40px" }}>
        <div className="iphone-detail-grid" style={{ display: "flex", flexDirection: "column", gap: "40px" }}>

          <div className="iphone-detail-image-wrap">
            <DeviceMockup deviceType="IPHONE">
              <div className="relative w-full h-full">
                <Image src={thumbUrl} alt={image.title} fill className="object-cover" priority fetchPriority="high" quality={85} sizes="(max-width: 768px) 100vw, 480px" />
              </div>
            </DeviceMockup>
            <div style={{ marginTop: "16px", width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
              <WallpaperReactions imageId={image.id} />
              <div className="hw-glow-btn-wrap hw-glow-btn-wrap--download">
                <DownloadButton
                  href={`/api/download/image/${image.id}`}
                  downloadCount={image._count.downloads}
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
              {/* FOMO Badges — badge-new removed */}
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
                      <span key={tag} style={{ background: b.bg, border: `1px solid ${b.color}`, color: b.color, fontSize: "0.65rem", fontFamily: "monospace", padding: "3px 10px", letterSpacing: "0.08em" }}>
                        {b.label}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Share buttons — prominent, above description ── */}
            <SocialShare
              title={image.title}
              imageUrl={thumbUrl}
              pageUrl={`${siteUrl}/iphone/${imageSlug}`}
            />

            {/* ── Tag Strip ── */}
            {image.tags.filter((t: string) => !t.startsWith("badge-")).length > 0 && (
              <div style={{ padding: "14px 0 4px" }}>
                <p style={{ fontFamily: "var(--font-space, monospace)", fontSize: "0.55rem", letterSpacing: "0.28em", textTransform: "uppercase" as const, color: "rgba(224,224,224,0.3)", margin: "0 0 10px" }}>
                  Choose Your Next Obsession
                </p>
                <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "8px" }}>
                  {image.tags.filter((t: string) => !t.startsWith("badge-")).map((tag: string) => (
                    <a key={tag} href={`/iphone?tag=${encodeURIComponent(tag)}`}
                      style={{ display: "inline-block", padding: "5px 12px", borderRadius: "2px", fontFamily: "var(--font-space, monospace)", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase" as const, textDecoration: "none", color: "rgba(224,224,224,0.7)", border: "1px solid rgba(224,224,224,0.12)", background: "rgba(255,255,255,0.03)" }}>
                      #{tag}
                    </a>
                  ))}
                  <SummonRandomTag tags={image.tags.filter((t: string) => !t.startsWith("badge-"))} device="iphone" />
                </div>
              </div>
            )}

            {/* Always rendered — real description or auto-generated fallback */}
            <div
              className="font-body text-[1rem] leading-relaxed description-html"
              style={{ color: "var(--text-muted)", colorScheme: "dark" }}
              dangerouslySetInnerHTML={{ __html: displayDescription }}
            />

            {/* ── Comments — only when enabled in admin ── */}
            {image.commentsEnabled && (
              <BirthdayComments imageId={image.id} imageTitle={image.title} />
            )}

            

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
          </div>
        </div>
      </section>

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
        .description-html { color-scheme: dark; }
        .description-html p { margin-bottom: 0.75rem; }
        .description-html p:last-child { margin-bottom: 0; }
        .description-html a { color: #8b0000; text-decoration: underline; }
        .description-html a:hover { color: #c0001a; }
        .description-html strong, .description-html b { color: #f0ecff; }
        .description-html ul, .description-html ol { padding-left: 1.25rem; margin-bottom: 0.75rem; }
        .description-html li { margin-bottom: 0.25rem; }
        .hw-glow-btn-wrap--download {
          animation: hwDlGlowPulse 2.8s ease-in-out infinite;
          border-radius: 2px;
        }
        @keyframes hwDlGlowPulse {
          0%, 100% { box-shadow: 0 0 12px rgba(192,0,26,0.35), 0 0 28px rgba(192,0,26,0.15); }
          50%       { box-shadow: 0 0 22px rgba(192,0,26,0.65), 0 0 50px rgba(192,0,26,0.28); }
        }
        .hw-glow-btn-wrap--preview {
          border-radius: 2px;
          box-shadow: 0 0 10px rgba(201,168,76,0.2), 0 0 22px rgba(201,168,76,0.08);
          transition: box-shadow 0.3s ease;
        }
        .hw-glow-btn-wrap--preview:hover {
          box-shadow: 0 0 18px rgba(201,168,76,0.45), 0 0 38px rgba(201,168,76,0.2);
        }
        /* Social share inline prominence */
        .social-share {
          border: 1px solid rgba(192,0,26,0.25);
          border-radius: 6px;
          padding: 12px 14px;
          background: rgba(192,0,26,0.04);
        }
        .social-share-label {
          font-family: var(--font-space, monospace);
          font-size: 0.55rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 8px;
        }
        .social-share-btns {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .social-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 4px;
          font-size: 0.72rem;
          font-family: var(--font-space, monospace);
          letter-spacing: 0.06em;
          text-decoration: none;
          border: 1px solid var(--border-dim, rgba(255,255,255,0.1));
          color: var(--text-primary);
          background: transparent;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          white-space: nowrap;
        }
        .social-btn svg { width: 14px; height: 14px; fill: currentColor; flex-shrink: 0; }
        .social-btn:hover { border-color: rgba(255,255,255,0.25); background: rgba(255,255,255,0.04); }
        .social-btn--native { border-color: rgba(192,0,26,0.4); color: #f0e8e8; }
        .social-btn--native:hover { background: rgba(192,0,26,0.1); }
        .social-btn--pinterest { color: #e60023; border-color: rgba(230,0,35,0.3); }
        .social-btn--x { color: var(--text-primary); }
        .social-btn--whatsapp { color: #25d366; border-color: rgba(37,211,102,0.3); }
      `}</style>

      <PageTracker item={{
        slug: image.slug,
        title: image.title,
        thumb: thumbUrl,
        href: `/iphone/${imageSlug}`,
      }} />
      <RecentlyViewed currentSlug={image.slug} />

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