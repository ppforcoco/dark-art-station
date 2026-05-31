// app/android/[imageSlug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import DeviceMockup from "@/components/DeviceMockup";
import DownloadButton from "@/components/DownloadButton";
import WallpaperReactions from "@/components/WallpaperReactions";
import RecentlyViewed from "@/components/RecentlyViewed";
import SocialShare from "@/components/SocialShare";
import PageTracker from "@/components/PageTracker";
import FavoriteButton from "@/components/FavoriteButton";
import PreviewButton from "@/components/PreviewButton";
import Breadcrumbs from "@/components/Breadcrumbs";
import PremiumCountdown from "@/components/PremiumCountdown";
import PremiumLockedGateClient from "@/components/PremiumLockedGate";
import BirthdayComments from "@/components/BirthdayComments";
import SummonRandomTag from "@/components/SummonRandomTag";

export const dynamicParams = true;
export const revalidate = 3600;

// Premium lock is handled entirely client-side by PremiumLockedGateClient
// to avoid React hydration mismatch (error #418).

interface PageProps {
  params: Promise<{ imageSlug: string }>;
}

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
  const tagLine = image.tags.slice(0, 3).map((t) => `#${t}`).join(" ");
  const plainDesc = (image.metaDescription ?? image.description ?? "")
    .replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 200);
  const metaDesc = plainDesc || `${image.title} — free high-res dark fantasy Android wallpaper. ${tagLine}. Download instantly, no account required.`;
  const ogImage = getPublicUrl(image.r2Key);
  return {
    metadataBase: new URL(siteUrl),
    title: `${image.title} — Free Android Wallpaper | HAUNTED WALLPAPERS`,
    description: metaDesc,
    keywords: ["android wallpaper", "dark wallpaper android", "hd android wallpaper", image.title, ...image.tags],
    openGraph: {
      title: `${image.title} | HAUNTED WALLPAPERS`,
      description: metaDesc,
      url: `${siteUrl}/android/${imageSlug}`,
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
    alternates: { canonical: `${siteUrl}/android/${imageSlug}` },
    ...(image.isAdult ? { robots: { index: false, follow: false, nosnippet: true } } : {}),
  };
}

export async function generateStaticParams() {
  return [];
}

function PremiumVaultGate({ devicePath }: { devicePath: string }) {
  return (
    <main style={{
      minHeight: "100vh",
      backgroundColor: "var(--bg-primary, #07050f)",
      color: "var(--text-primary, #e8e4f8)",
      colorScheme: "dark",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "40px 24px", textAlign: "center",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,168,76,0.06) 0%, transparent 70%)",
      }} />
      {(["tl", "tr", "bl", "br"] as const).map((pos) => (
        <span key={pos} style={{
          position: "absolute",
          top: pos.startsWith("t") ? "20px" : undefined,
          bottom: pos.startsWith("b") ? "20px" : undefined,
          left: pos.endsWith("l") ? "20px" : undefined,
          right: pos.endsWith("r") ? "20px" : undefined,
          fontFamily: "var(--font-cinzel, serif)", fontSize: "1.1rem", color: "rgba(201,168,76,0.2)",
        }}>†</span>
      ))}
      <div style={{ fontSize: "56px", marginBottom: "24px" }}>🔒</div>
      <span style={{ fontFamily: "var(--font-space, monospace)", fontSize: "0.6rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(201,168,76,0.55)", marginBottom: "12px", display: "block" }}>Back In The Vault</span>
      <h1 style={{ fontFamily: "var(--font-cinzel, serif)", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, color: "#f0e8d8", margin: "0 0 16px", lineHeight: 1.1, maxWidth: "560px" }}>This Wallpaper Is Sealed</h1>
      <p style={{ fontFamily: "var(--font-space, monospace)", fontSize: "0.82rem", color: "rgba(200,180,140,0.55)", maxWidth: "400px", lineHeight: 1.75, margin: "0 0 32px" }}>
        Premium wallpapers are available for 24 hours, then sealed away for 24 hours. Check back when the vault reopens.
      </p>
      <div style={{ marginBottom: "36px" }}>
        <PremiumCountdown isLocked={true} />
      </div>
      <div style={{ width: "100%", maxWidth: "320px", height: "1px", background: "linear-gradient(to right, transparent, rgba(201,168,76,0.2), transparent)", marginBottom: "32px" }} />
      <Link href={`/${devicePath}`} style={{ fontFamily: "var(--font-space, monospace)", fontSize: "0.72rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#e8e4f8", textDecoration: "none", border: "1px solid rgba(192,0,26,0.4)", padding: "13px 28px", background: "rgba(192,0,26,0.06)", display: "inline-flex", alignItems: "center", gap: "8px" }}>← Browse Free Wallpapers</Link>
      <style>{`@keyframes premCountPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
    </main>
  );
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
      commentsEnabled: true,
      _count: { select: { downloads: true } },
    },
  });

  if (!image || image.deviceType !== "ANDROID") notFound();

  const isPremium = image.tags.includes("badge-premium");
  void isPremium; // lock is handled client-side by PremiumLockedGateClient

  const thumbUrl = getPublicUrl(image.r2Key);
  const displayDescription = image.description ?? buildFallbackDescription(image.title, image.tags);
  const plainDescription = displayDescription.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

  // ── Only fetch prev/next slugs + tag strip ──────────────────────────────
  const [prevSibling, nextSibling, tagSortedStrip] = await Promise.all([
    db.image.findFirst({
      where: {
        collectionId: null, deviceType: "ANDROID",
        OR: [
          { sortOrder: { lt: image.sortOrder } },
          { sortOrder: image.sortOrder, id: { lt: image.id } },
        ],
      },
      orderBy: [{ sortOrder: "desc" }, { id: "desc" }],
      select: { slug: true, title: true },
    }),
    db.image.findFirst({
      where: {
        collectionId: null, deviceType: "ANDROID",
        OR: [
          { sortOrder: { gt: image.sortOrder } },
          { sortOrder: image.sortOrder, id: { gt: image.id } },
        ],
      },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      select: { slug: true, title: true },
    }),
    db.image.findMany({
      where: {
        collectionId: null, deviceType: "ANDROID",
        slug: { not: imageSlug },
        tags: { hasSome: image.tags.slice(0, 3) },
      },
      orderBy: [{ sortOrder: "asc" }],
      take: 4,
      select: { slug: true, title: true, r2Key: true },
    }),
  ]);

  const prevImage = prevSibling;
  const nextImage = nextSibling;

  return (
    <PremiumLockedGateClient tags={image.tags} devicePath="android">
    <main className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)", colorScheme: "dark" }}>

      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Android Wallpapers", href: "/android" },
        { label: image.title },
      ]} />

      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "16px 16px 32px" }} className="hw-detail-section">
        <div className="android-detail-grid" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

          {/* ── MAIN IMAGE with overlaid Prev/Next arrows ── */}
          <div className="android-detail-image-wrap">
            <div style={{ position: "relative", width: "100%" }}>
              <DeviceMockup deviceType="ANDROID">
                <div className="relative w-full h-full">
                  <Image
                    src={thumbUrl}
                    alt={image.title}
                    fill
                    unoptimized
                    className="object-cover"
                    priority
                    fetchPriority="high"
                    sizes="(max-width: 480px) 280px, (max-width: 768px) 340px, 480px"
                  />
                </div>
              </DeviceMockup>

              {/* ── PREV/NEXT ARROWS — overlaid on the image ── */}
              {prevImage && (
                <Link
                  href={`/android/${prevImage.slug}`}
                  prefetch={true}
                  className="hw-img-arrow hw-img-arrow--prev"
                  aria-label={`Previous: ${prevImage.title}`}
                  title={prevImage.title}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </Link>
              )}
              {nextImage && (
                <Link
                  href={`/android/${nextImage.slug}`}
                  prefetch={true}
                  className="hw-img-arrow hw-img-arrow--next"
                  aria-label={`Next: ${nextImage.title}`}
                  title={nextImage.title}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              )}
            </div>

            <div style={{ marginTop: "12px", width: "100%", display: "flex", flexDirection: "column", gap: "8px" }}>
              <WallpaperReactions imageId={image.id} />
              <div className="hw-glow-btn-wrap hw-glow-btn-wrap--download">
                <DownloadButton href={`/api/download/image/${image.id}`} slug={image.slug} downloadCount={image._count.downloads} />
              </div>
              <div className="hw-glow-btn-wrap hw-glow-btn-wrap--preview">
                <PreviewButton src={thumbUrl} title={image.title} />
              </div>

              {/* ── Save to Favorites (mobile) ── */}
              <div className="detail-fav-row hw-mobile-fav">
                <FavoriteButton size="md" className="detail-fav-inline" item={{ slug: image.slug, title: image.title, thumb: thumbUrl, href: `/android/${imageSlug}`, device: "android" }} />
              </div>

              {/* ── More You'll Like strip (mobile) ── */}
              {tagSortedStrip.length > 0 && (
                <div className="hw-more-strip--mobile" style={{ flexDirection: "column", gap: "6px" }}>
                  <span className="hw-more-strip__label">More ▸</span>
                  <div className="hw-more-strip__thumbs">
                    {tagSortedStrip.map((img) => (
                      <Link key={img.slug} href={`/android/${img.slug}`} className="more-strip-link">
                        <div className="hw-more-strip__thumb" style={{ position: "relative" }}>
                          <Image src={getPublicUrl(img.r2Key)} alt={img.title} fill className="object-cover" loading="lazy" sizes="44px" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <h1 className="font-display hw-detail-title font-bold mt-2 leading-tight">{image.title}</h1>
              {image.tags.filter((t: string) => t.startsWith("badge-")).length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px", marginBottom: "4px" }}>
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
                    return <span key={tag} style={{ background: b.bg, border: `1px solid ${b.color}`, color: b.color, fontSize: "0.65rem", fontFamily: "monospace", padding: "3px 10px", letterSpacing: "0.08em" }}>{b.label}</span>;
                  })}
                </div>
              )}
            </div>

            <SocialShare title={image.title} imageUrl={thumbUrl} pageUrl={`${siteUrl}/android/${imageSlug}`} />

            {image.tags.filter((t: string) => !t.startsWith("badge-")).length > 0 && (
              <div style={{ padding: "10px 0 4px" }}>
                <p style={{ fontFamily: "var(--font-space, monospace)", fontSize: "0.55rem", letterSpacing: "0.28em", textTransform: "uppercase" as const, color: "rgba(224,224,224,0.3)", margin: "0 0 8px" }}>Choose Your Next Obsession</p>
                <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "6px" }}>
                  {image.tags.filter((t: string) => !t.startsWith("badge-")).map((tag: string) => (
                    <a key={tag} href={`/android?tag=${encodeURIComponent(tag)}`}
                      style={{ display: "inline-block", padding: "4px 10px", borderRadius: "2px", fontFamily: "var(--font-space, monospace)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase" as const, textDecoration: "none", color: "rgba(224,224,224,0.7)", border: "1px solid rgba(224,224,224,0.12)", background: "rgba(255,255,255,0.03)" }}>
                      #{tag}
                    </a>
                  ))}
                  <SummonRandomTag tags={image.tags.filter((t: string) => !t.startsWith("badge-"))} device="android" />
                </div>
              </div>
            )}

            <div className="font-body hw-detail-desc leading-relaxed description-html" style={{ color: "var(--text-muted)", colorScheme: "dark" }} dangerouslySetInnerHTML={{ __html: displayDescription }} />

            {image.commentsEnabled && (
              <div style={{ marginTop: "1rem" }}>
                <BirthdayComments imageId={image.id} imageTitle={image.title} />
              </div>
            )}

            {/* ── Save to Favorites (desktop) ── */}
            <div className="detail-fav-row hw-desktop-fav">
              <FavoriteButton size="md" className="detail-fav-inline" item={{ slug: image.slug, title: image.title, thumb: thumbUrl, href: `/android/${imageSlug}`, device: "android" }} />
            </div>


          </div>
        </div>
      </section>

      {/* ── RecentlyViewed — ONLY loads when user scrolls to bottom ── */}
      <RecentlyViewed currentSlug={image.slug} />

      <style>{`
        /* ── Mobile detail scaling ── */
        .hw-detail-section {
          padding: 12px 12px 28px !important;
        }
        .hw-detail-title {
          font-size: 1.25rem;
        }
        .hw-detail-desc {
          font-size: 0.82rem;
        }
        @media (min-width: 768px) {
          .hw-detail-section {
            padding: 24px 24px 40px !important;
          }
          .hw-detail-title {
            font-size: 1.5rem;
          }
          .hw-detail-desc {
            font-size: 1rem;
          }
        }
        @media (min-width: 1024px) {
          .hw-detail-title {
            font-size: 1.875rem;
          }
        }

        /* ─────────────────────────────────────────────────────────────────
           PREV / NEXT ARROWS — overlaid directly on the main image
        ───────────────────────────────────────────────────────────────── */
        .hw-img-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 64px;
          background: rgba(0, 0, 0, 0.52);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: rgba(255, 255, 255, 0.85);
          text-decoration: none;
          border-radius: 4px;
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
          cursor: pointer;
        }
        .hw-img-arrow:hover {
          background: rgba(139, 0, 0, 0.72);
          border-color: rgba(192, 0, 26, 0.6);
          color: #fff;
        }
        .hw-img-arrow svg {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }
        .hw-img-arrow--prev {
          left: -18px;
        }
        .hw-img-arrow--next {
          right: -18px;
        }
        @media (max-width: 480px) {
          .hw-img-arrow--prev {
            left: 6px;
          }
          .hw-img-arrow--next {
            right: 6px;
          }
          .hw-img-arrow {
            width: 32px;
            height: 54px;
            background: rgba(0, 0, 0, 0.6);
          }
        }
        @media (min-width: 768px) {
          .hw-img-arrow--prev {
            left: -22px;
          }
          .hw-img-arrow--next {
            right: -22px;
          }
          .hw-img-arrow {
            width: 40px;
            height: 72px;
          }
          .hw-img-arrow svg {
            width: 22px;
            height: 22px;
          }
        }

        /* ── More strip ── */
        .hw-more-strip {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 0 0;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .hw-more-strip__label {
          font-family: var(--font-space, monospace);
          font-size: 0.45rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
          white-space: nowrap;
          margin-right: 2px;
        }
        .hw-more-strip__thumbs {
          display: flex;
          gap: 5px;
          align-items: center;
        }
        .hw-more-strip__thumb {
          width: 36px;
          height: 64px;
          overflow: hidden;
          border-radius: 4px;
          border: 1px solid rgba(255,255,255,0.08);
        }
        @media (min-width: 768px) {
          .hw-more-strip__thumb {
            width: 44px;
            height: 78px;
          }
        }
        /* Show/hide more strip by device */
        .hw-more-strip--mobile {
          display: flex;
        }
        .hw-more-strip--desktop {
          display: none;
        }
        @media (min-width: 768px) {
          .hw-more-strip--mobile {
            display: none;
          }
          .hw-more-strip--desktop {
            display: flex;
          }
        }

        /* ── Fav button show/hide ── */
        .hw-mobile-fav {
          display: flex;
        }
        .hw-desktop-fav {
          display: none;
        }
        @media (min-width: 768px) {
          .hw-mobile-fav {
            display: none;
          }
          .hw-desktop-fav {
            display: flex;
          }
        }

        /* ── Image wrap ── */
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

        /* ── Description ── */
        .description-html { color-scheme: dark; }
        .description-html p { margin-bottom: 0.75rem; }
        .description-html p:last-child { margin-bottom: 0; }
        .description-html a { color: #8b0000; text-decoration: underline; }
        .description-html a:hover { color: #c0001a; }
        .description-html strong, .description-html b { color: #f0ecff; }
        .description-html ul, .description-html ol { padding-left: 1.25rem; margin-bottom: 0.75rem; }
        .description-html li { margin-bottom: 0.25rem; }

        /* ── Download button glow — desktop only ── */
        @media (min-width: 768px) {
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
            box-shadow: 0 0 14px rgba(201,168,76,0.25), 0 0 30px rgba(201,168,76,0.1), inset 0 0 0 1px rgba(201,168,76,0.2);
            transition: box-shadow 0.3s ease, transform 0.2s ease;
          }
          .hw-glow-btn-wrap--preview:hover {
            box-shadow: 0 0 22px rgba(201,168,76,0.5), 0 0 50px rgba(201,168,76,0.22), inset 0 0 0 1px rgba(201,168,76,0.45);
            transform: translateY(-1px);
          }
        }

        /* ── Social share ── */
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
        .social-share-btns { display: flex; flex-wrap: wrap; gap: 8px; }
        .social-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 14px; border-radius: 4px;
          font-size: 0.72rem; font-family: var(--font-space, monospace);
          letter-spacing: 0.06em; text-decoration: none;
          border: 1px solid var(--border-dim, rgba(255,255,255,0.1));
          color: var(--text-primary); background: transparent; cursor: pointer;
          transition: border-color 0.2s, background 0.2s; white-space: nowrap;
        }
        .social-btn svg { width: 14px; height: 14px; fill: currentColor; flex-shrink: 0; }
        .social-btn:hover { border-color: rgba(255,255,255,0.25); background: rgba(255,255,255,0.04); }
        .social-btn--native { border-color: rgba(192,0,26,0.4); color: #f0e8e8; }
        .social-btn--native:hover { background: rgba(192,0,26,0.1); }
        .social-btn--pinterest { color: #e60023; border-color: rgba(230,0,35,0.3); }
        .social-btn--x { color: var(--text-primary); }
        .social-btn--whatsapp { color: #25d366; border-color: rgba(37,211,102,0.3); }

        /* ── Recently Viewed — tiny on mobile, loads on scroll ── */
        .recently-viewed-section {
          font-size: 0.7rem !important;
        }
        .recently-viewed-section .rv-thumb,
        .recently-viewed-thumb {
          width: 36px !important;
          height: 64px !important;
        }
        .recently-viewed-section .rv-title,
        .recently-viewed-title {
          display: none !important;
        }
        @media (min-width: 768px) {
          .recently-viewed-section {
            font-size: 1rem !important;
          }
          .recently-viewed-section .rv-thumb,
          .recently-viewed-thumb {
            width: 60px !important;
            height: 106px !important;
          }
          .recently-viewed-section .rv-title,
          .recently-viewed-title {
            display: block !important;
          }
        }
      `}</style>

      <PageTracker item={{ slug: image.slug, title: image.title, thumb: thumbUrl, href: `/android/${imageSlug}` }} />

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
            price: "0.00", priceCurrency: "USD",
            availability: "https://schema.org/InStock",
            seller: { "@type": "Organization", name: "HAUNTED WALLPAPERS", url: siteUrl },
          },
          potentialAction: { "@type": "DownloadAction", target: `${siteUrl}/api/download/image/${image.id}` },
        })
      }} />
    </main>
  </PremiumLockedGateClient>
  );
}