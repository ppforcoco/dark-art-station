import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db, getRelatedImages } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import DeviceMockup from "@/components/DeviceMockup";
import RelatedWallpapers from "@/components/RelatedWallpapers";
import DownloadButton from "@/components/DownloadButton";
import RecentlyViewed from "@/components/RecentlyViewed";
import SocialShare from "@/components/SocialShare";
import PageTracker from "@/components/PageTracker";
import FavoriteButton from "@/components/FavoriteButton";
import { shouldCountPageView } from "@/lib/analytics-filter";
import PreviewButton from "@/components/PreviewButton";
import WallpaperTips from "@/components/WallpaperTips";
import KeyboardNav from "@/components/KeyboardNav";
import Breadcrumbs from "@/components/Breadcrumbs";
import PremiumCountdown from "@/components/PremiumCountdown";

export const dynamicParams = true;
export const revalidate = 3600;

// ── Premium lock: 24h on / 24h off cycle anchored to Jan 1 2025 00:00 UTC ──
// MUST match PremiumCountdown.tsx, iphone/page.tsx, android/page.tsx exactly.
const EPOCH_MS  = Date.UTC(2025, 0, 1, 0, 0, 0);
const CYCLE_MS  = 48 * 60 * 60 * 1000;
const UNLOCK_MS = 24 * 60 * 60 * 1000;

function isCurrentlyLocked(): boolean {
  const pos = (Date.now() - EPOCH_MS) % CYCLE_MS;
  return pos >= UNLOCK_MS;
}

interface PageProps {
  params: Promise<{ imageSlug: string }>;
}

// ── Fallback description generator ──────────────────────────────────────────
function buildFallbackDescription(title: string, tags: string[]): string {
  const tagList = tags.length > 0 ? tags.slice(0, 5).join(", ") : "dark fantasy, atmospheric, gothic";
  const firstTag = tags[0] ?? "dark fantasy";
  const secondTag = tags[1] ?? "atmospheric";
  return (
    title + " is a free high-resolution Android wallpaper from the Haunted Wallpapers dark art collection. " +
    "Formatted in a native 9:16 portrait aspect ratio, this piece is optimised for Android phones and fills your " +
    "lock screen and home screen with immersive dark art built around themes of " + tagList + ". " +
    "The image looks stunning on AMOLED and OLED Android displays, where true blacks create exceptional contrast. " +
    "Whether you are drawn to " + firstTag + " aesthetics or simply want a " + secondTag + " backdrop, " +
    "this wallpaper delivers bold, original artwork at no cost. " +
    "No account or sign-up is required — tap download and the full-resolution file is yours instantly. " +
    "Every image in our Android collection is produced exclusively for Haunted Wallpapers, " +
    "so you will not find this artwork duplicated across generic wallpaper repositories. " +
    "Scroll down to explore related wallpapers with a similar dark atmosphere and artistic style."
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { imageSlug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";
  const image = await db.image.findUnique({
    where: { slug: imageSlug },
    select: { title: true, description: true, metaDescription: true, r2Key: true, tags: true, isAdult: true, deviceType: true },
  });
  if (!image || image.deviceType !== "ANDROID") return { title: "Not Found | HAUNTED WALLPAPERS" };
  const ogImage = getPublicUrl(image.r2Key);
  const tagLine = image.tags.slice(0, 3).map((t) => `#${t}`).join(" ");

  const metaDesc = image.metaDescription
    ?? image.description
    ?? `${image.title} — free high-res dark fantasy Android wallpaper. ${tagLine}. Download instantly, no account required.`;

  return {
    title: `${image.title} — Free Android Wallpaper | HAUNTED WALLPAPERS`,
    description: metaDesc,
    keywords: ["android wallpaper", "dark wallpaper android", "hd android wallpaper", image.title, ...image.tags],
    openGraph: {
      title: `${image.title} | HAUNTED WALLPAPERS`,
      description: image.metaDescription ?? image.description ?? `Free HD Android wallpaper: ${image.title}`,
      url: `${siteUrl}/android/${imageSlug}`,
      siteName: "HAUNTED WALLPAPERS",
      images: [{ url: ogImage, width: 1080, height: 1920, alt: image.title }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${image.title} | HAUNTED WALLPAPERS`,
      description: image.metaDescription ?? image.description ?? `Free HD Android wallpaper: ${image.title}`,
      images: [ogImage],
    },
    alternates: { canonical: `${siteUrl}/android/${imageSlug}` },
    ...(image.isAdult ? { robots: { index: false, follow: false, nosnippet: true } } : {}),
  };
}

export async function generateStaticParams() {
  const images = await db.image.findMany({
    where: { collectionId: null, deviceType: "ANDROID" },
    select: { slug: true },
  });
  return images.map((img) => ({ imageSlug: img.slug }));
}

export default async function AndroidImagePage({ params }: PageProps) {
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

  if (!image || image.deviceType !== "ANDROID") notFound();

  // ── PREMIUM LOCK GATE ────────────────────────────────────────────────────
  // If this wallpaper is tagged premium AND the cycle is currently locked,
  // show the vault gate instead of the full page. No redirect needed — render
  // inline so the URL stays the same and users can bookmark/refresh when unlocked.
  const isPremium = image.tags.includes("badge-premium");
  const isLocked  = isCurrentlyLocked();

  if (isPremium && isLocked) {
    return <PremiumVaultGate devicePath="android" />;
  }
  // ── END LOCK GATE ────────────────────────────────────────────────────────

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
      where: { collectionId: null, deviceType: "ANDROID" },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: { slug: true, title: true, r2Key: true, sortOrder: true },
    }),
    getRelatedImages(image.id, image.tags, 6, "ANDROID"),
  ]);
  const currentIdx = siblings.findIndex((s) => s.slug === imageSlug);
  const prevImage = currentIdx > 0 ? siblings[currentIdx - 1] : null;
  const nextImage = currentIdx < siblings.length - 1 ? siblings[currentIdx + 1] : null;

  const nextImageSrc = nextImage ? getPublicUrl(nextImage.r2Key) : null;

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <WallpaperTips mode="banner" />

      {/* ── Breadcrumb ── */}
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Android Wallpapers", href: "/android" },
        { label: image.title },
      ]} />

      {nextImageSrc && (
        <link rel="preload" as="image" href={nextImageSrc} />
      )}

      {/* ── Prev / Next — TOP ── */}
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
            <Link href={`/android/${prevImage.slug}`}
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
            <Link href={`/android/${nextImage.slug}`}
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

      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px 24px 40px" }}>
        <div className="android-detail-grid" style={{ display: "flex", flexDirection: "column", gap: "40px" }}>

          {/* Image — hero size */}
          <div className="android-detail-image-wrap">
            <DeviceMockup deviceType="ANDROID">
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
                  href:   `/android/${imageSlug}`,
                  device: "android",
                }}
              />
              <span className="detail-fav-label">Save to Favorites</span>
            </div>
          </div>
        </div>
      </section>

      {/* Desktop two-column layout via CSS */}
      <style>{`
        .android-detail-image-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        @media (min-width: 768px) {
          .android-detail-grid { flex-direction: row !important; align-items: flex-start; gap: 56px !important; }
          .android-detail-image-wrap { flex: 0 0 420px; justify-content: flex-start; }
          .android-detail-grid > div:last-child { flex: 1; position: sticky; top: 100px; }
        }
        @media (min-width: 1024px) {
          .android-detail-image-wrap { flex: 0 0 480px; }
        }
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
      `}</style>

      <RelatedWallpapers images={related} heading="More Dark Art You'll Like" />
      <PageTracker item={{
        slug: image.slug,
        title: image.title,
        thumb: thumbUrl,
        href: `/android/${imageSlug}`,
      }} />
      <SocialShare
        title={image.title}
        imageUrl={thumbUrl}
        pageUrl={`${siteUrl}/android/${imageSlug}`}
      />
      <RecentlyViewed currentSlug={image.slug} />
      <KeyboardNav
        prevHref={prevImage ? `/android/${prevImage.slug}` : null}
        nextHref={nextImage ? `/android/${nextImage.slug}` : null}
      />

      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "@id": `${siteUrl}/android/${imageSlug}#product`,
          name: image.title,
          description: plainDescription,
          url: `${siteUrl}/android/${imageSlug}`,
          brand: { "@type": "Brand", name: "HAUNTED WALLPAPERS", url: siteUrl },
          category: "Digital Products > Wallpapers > Android",
          image: [{ "@type": "ImageObject", url: thumbUrl, contentUrl: thumbUrl, caption: image.title }],
          additionalProperty: [
            { "@type": "PropertyValue", name: "Format", value: "JPEG (HD High Resolution)" },
            { "@type": "PropertyValue", name: "Device", value: "Android" },
            { "@type": "PropertyValue", name: "Aspect Ratio", value: "9:16 Portrait" },
            { "@type": "PropertyValue", name: "Instant Download", value: "Yes" },
          ],
          offers: {
            "@type": "Offer",
            url: `${siteUrl}/android/${imageSlug}`,
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
      {/* ── GIANT NEXT WALLPAPER BUTTON ── */}
      {nextImage && (
        <div style={{
          padding: "24px 16px 40px",
          maxWidth: "600px",
          margin: "0 auto",
        }}>
          <Link
            href={`/android/${nextImage.slug}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              padding: "20px 24px",
              background: "linear-gradient(135deg, rgba(139,0,0,0.3) 0%, rgba(80,0,0,0.45) 100%)",
              border: "1px solid rgba(192,0,26,0.5)",
              borderRadius: "6px",
              textDecoration: "none",
              boxShadow: "0 0 32px rgba(192,0,26,0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
              transition: "all 0.2s ease",
              minHeight: "80px",
              WebkitTapHighlightColor: "transparent",
            }}
            prefetch={true}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, minWidth: 0 }}>
              <span style={{
                fontFamily: "var(--font-space), monospace",
                fontSize: "0.55rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(192,80,80,0.8)",
              }}>
                Next Wallpaper
              </span>
              <span style={{
                fontFamily: "var(--font-cinzel, serif)",
                fontSize: "clamp(0.85rem, 2.5vw, 1rem)",
                color: "#f0e8e8",
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {nextImage.title}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
              <div style={{
                position: "relative",
                width: "44px",
                height: "78px",
                borderRadius: "4px",
                overflow: "hidden",
                border: "1px solid rgba(192,0,26,0.3)",
                flexShrink: 0,
              }}>
                <Image
                  src={getPublicUrl(nextImage.r2Key)}
                  alt={nextImage.title}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="44px"
                />
              </div>
              <span style={{
                fontSize: "2rem",
                color: "#c0001a",
                lineHeight: 1,
                filter: "drop-shadow(0 0 8px rgba(192,0,26,0.6))",
              }}>→</span>
            </div>
          </Link>
        </div>
      )}

          </main>
  );
}

// ── Server-rendered vault gate — no client JS needed ─────────────────────────
function PremiumVaultGate({ devicePath }: { devicePath: string }) {
  const nextImageSrc = nextImage ? getPublicUrl(nextImage.r2Key) : null;

  return (
    <main style={{
      minHeight: "100vh",
      backgroundColor: "var(--bg-primary, #07050f)",
      color: "var(--text-primary, #e8e4f8)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 24px",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background glow */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,168,76,0.06) 0%, transparent 70%)",
      }} />

      {/* Corner runes */}
      {(["tl","tr","bl","br"] as const).map((pos) => (
        <span key={pos} style={{
          position: "absolute",
          top: pos.startsWith("t") ? "20px" : undefined,
          bottom: pos.startsWith("b") ? "20px" : undefined,
          left: pos.endsWith("l") ? "20px" : undefined,
          right: pos.endsWith("r") ? "20px" : undefined,
          fontFamily: "var(--font-cinzel, serif)",
          fontSize: "1.1rem",
          color: "rgba(201,168,76,0.2)",
        }}>†</span>
      ))}

      {/* Lock */}
      <div style={{ fontSize: "56px", marginBottom: "24px" }}>🔒</div>

      {/* Eyebrow */}
      <span style={{
        fontFamily: "var(--font-space, monospace)",
        fontSize: "0.6rem",
        letterSpacing: "0.28em",
        textTransform: "uppercase",
        color: "rgba(201,168,76,0.55)",
        marginBottom: "12px",
        display: "block",
      }}>Back In The Vault</span>

      {/* Heading */}
      <h1 style={{
        fontFamily: "var(--font-cinzel, serif)",
        fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
        fontWeight: 700,
        color: "#f0e8d8",
        margin: "0 0 16px",
        lineHeight: 1.1,
        maxWidth: "560px",
      }}>
        This Wallpaper Is Sealed
      </h1>

      <p style={{
        fontFamily: "var(--font-space, monospace)",
        fontSize: "0.82rem",
        color: "rgba(200,180,140,0.55)",
        maxWidth: "400px",
        lineHeight: 1.75,
        margin: "0 0 32px",
      }}>
        Premium wallpapers are available for 24 hours, then sealed away for 24 hours.
        Check back when the vault reopens.
      </p>

      {/* Live countdown — client component */}
      <div style={{ marginBottom: "36px" }}>
        <PremiumCountdown isLocked={true} />
      </div>

      {/* Divider */}
      <div style={{
        width: "100%", maxWidth: "320px", height: "1px",
        background: "linear-gradient(to right, transparent, rgba(201,168,76,0.2), transparent)",
        marginBottom: "32px",
      }} />

      {/* Back link */}
      <Link
        href={`/${devicePath}`}
        style={{
          fontFamily: "var(--font-space, monospace)",
          fontSize: "0.72rem",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "#e8e4f8",
          textDecoration: "none",
          border: "1px solid rgba(192,0,26,0.4)",
          padding: "13px 28px",
          background: "rgba(192,0,26,0.06)",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        ← Browse Free Wallpapers
      </Link>

      <style>{`
        @keyframes premCountPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
      {/* ── GIANT NEXT WALLPAPER BUTTON ── */}
      {nextImage && (
        <div style={{
          padding: "24px 16px 40px",
          maxWidth: "600px",
          margin: "0 auto",
        }}>
          <Link
            href={`/android/${nextImage.slug}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              padding: "20px 24px",
              background: "linear-gradient(135deg, rgba(139,0,0,0.3) 0%, rgba(80,0,0,0.45) 100%)",
              border: "1px solid rgba(192,0,26,0.5)",
              borderRadius: "6px",
              textDecoration: "none",
              boxShadow: "0 0 32px rgba(192,0,26,0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
              transition: "all 0.2s ease",
              minHeight: "80px",
              WebkitTapHighlightColor: "transparent",
            }}
            prefetch={true}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, minWidth: 0 }}>
              <span style={{
                fontFamily: "var(--font-space), monospace",
                fontSize: "0.55rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(192,80,80,0.8)",
              }}>
                Next Wallpaper
              </span>
              <span style={{
                fontFamily: "var(--font-cinzel, serif)",
                fontSize: "clamp(0.85rem, 2.5vw, 1rem)",
                color: "#f0e8e8",
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {nextImage.title}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
              <div style={{
                position: "relative",
                width: "44px",
                height: "78px",
                borderRadius: "4px",
                overflow: "hidden",
                border: "1px solid rgba(192,0,26,0.3)",
                flexShrink: 0,
              }}>
                <Image
                  src={getPublicUrl(nextImage.r2Key)}
                  alt={nextImage.title}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="44px"
                />
              </div>
              <span style={{
                fontSize: "2rem",
                color: "#c0001a",
                lineHeight: 1,
                filter: "drop-shadow(0 0 8px rgba(192,0,26,0.6))",
              }}>→</span>
            </div>
          </Link>
        </div>
      )}

          </main>
  );
}