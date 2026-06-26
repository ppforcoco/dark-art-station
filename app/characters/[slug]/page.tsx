// app/characters/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import Image from "next/image";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import DownloadButton from "@/components/DownloadButton";
import PreviewButton from "@/components/PreviewButton";
import FavoriteButton from "@/components/FavoriteButton";
import SocialShare from "@/components/SocialShare";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageTracker from "@/components/PageTracker";
import RecentlyViewed from "@/components/RecentlyViewed";
import WallpaperReactions from "@/components/WallpaperReactions";
import PremiumLockedGateClient from "@/components/PremiumLockedGate";

export const dynamicParams = true;
export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function getCachedImage(slug: string) {
  return unstable_cache(
    async () => {
      try {
        return await db.image.findFirst({
          where: { slug },
          select: {
            id: true, slug: true, title: true, description: true,
            r2Key: true, highResKey: true, tags: true,
            viewCount: true, deviceType: true,
            commentsEnabled: true, isAdult: true,
            _count: { select: { downloads: true } },
          },
        });
      } catch {
        return null;
      }
    },
    [`character-image-${slug}`],
    { revalidate: 60 },
  )();
}

// Safe resident fetch — returns null if table missing or record not found.
async function safeGetResident(slug: string) {
  try {
    return await db.resident.findUnique({
      where: { slug, isPublished: true },
      select: { name: true, slug: true },
    });
  } catch {
    return null;
  }
}

// Safe related wallpapers fetch — returns [] on any DB error.
async function safeGetRelated(residentTag: string, currentSlug: string) {
  try {
    return await db.image.findMany({
      where: {
        tags: { has: residentTag },
        slug: { not: currentSlug },
      },
      orderBy: [{ viewCount: "desc" }],
      take: 8,
      select: { id: true, slug: true, title: true, r2Key: true, deviceType: true },
    });
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const image = await getCachedImage(slug);
  if (!image) return { title: "Not Found | Haunted Wallpapers" };

  // Characters route is for resident-tagged images only
  const residentTag = image.tags.find((t) => t.startsWith("resident:"));
  if (!residentTag) return { title: "Not Found | Haunted Wallpapers" };

  const ogImage = getPublicUrl(image.r2Key);
  const desc = image.description
    ? image.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 200)
    : `${image.title} — free dark art wallpaper from Haunted Wallpapers.`;

  return {
    title: `${image.title} | Haunted Wallpapers`,
    description: desc,
    openGraph: {
      title: `${image.title} | Haunted Wallpapers`,
      description: desc,
      url: `${SITE_URL}/characters/${slug}`,
      siteName: "Haunted Wallpapers",
      images: [{ url: ogImage, width: 1200, height: 630, alt: image.title }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${image.title} | Haunted Wallpapers`,
      description: desc,
      images: [ogImage],
    },
    alternates: { canonical: `${SITE_URL}/characters/${slug}` },
    ...(image.isAdult ? { robots: { index: false, follow: false } } : {}),
  };
}

export async function generateStaticParams() {
  return [];
}

export default async function CharacterWallpaperPage({ params }: PageProps) {
  const { slug } = await params;

  const image = await getCachedImage(slug);
  if (!image) notFound();

  // Characters route is for resident-tagged images only
  const residentTag = image!.tags.find((t) => t.startsWith("resident:"));
  if (!residentTag) notFound();

  const residentSlug = residentTag.replace("resident:", "");

  // Both calls are wrapped in try/catch — won't throw even if Resident table missing
  const [resident, relatedWallpapers] = await Promise.all([
    safeGetResident(residentSlug),
    safeGetRelated(residentTag, slug),
  ]);

  const thumbUrl = getPublicUrl(image!.r2Key);
  // null deviceType = treat as portrait (phone wallpaper)
  const isPortrait = image!.deviceType !== "PC";
  const displayDescription = image!.description ?? `${image!.title} — free dark art wallpaper from Haunted Wallpapers.`;

  return (
    <PremiumLockedGateClient tags={image!.tags} devicePath="characters">
      <main style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)", colorScheme: "dark", minHeight: "100vh" }}>

        <Breadcrumbs items={[
          { label: "Home", href: "/" },
          { label: "Residents", href: "/residents" },
          ...(resident ? [{ label: resident.name, href: `/residents/${resident.slug}` }] : []),
          { label: image!.title },
        ]} />

        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "16px 16px 48px" }}>
          <div className="char-grid">

            {/* ── Image ── */}
            <div className="char-image-wrap">
              <div style={{ position: "relative", width: "100%", aspectRatio: isPortrait ? "9/16" : "16/9", overflow: "hidden", background: "#0a0812", borderRadius: "4px" }}>
                <Image
                  src={thumbUrl}
                  alt={image!.title}
                  fill
                  unoptimized
                  className="object-cover"
                  loading="eager"
                  sizes="(max-width: 768px) 100vw, 480px"
                />
              </div>

              {/* Actions */}
              <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <DownloadButton href={`/api/download/image/${image!.id}`} slug={image!.slug} downloadCount={0} />
                <PreviewButton src={thumbUrl} title={image!.title} />
                <FavoriteButton
                  size="md"
                  className="detail-fav-inline"
                  item={{ slug: image!.slug, title: image!.title, thumb: thumbUrl, href: `/characters/${slug}`, device: "iphone" }}
                />
                <WallpaperReactions imageId={image!.id} />
              </div>
            </div>

            {/* ── Info ── */}
            <div className="char-info">
              <h1 style={{ fontFamily: "var(--font-cinzel, serif)", fontSize: "clamp(1.4rem, 4vw, 2.4rem)", lineHeight: 1.15, marginBottom: "12px", color: "rgba(232,228,220,0.97)" }}>
                {image!.title}
              </h1>

              {/* Resident link */}
              {resident && (
                <a href={`/residents/${resident.slug}`} style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-space, monospace)", fontSize: "0.62rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#9d4edd", textDecoration: "none", marginBottom: "20px" }}>
                  👤 {resident.name}
                </a>
              )}

              <SocialShare title={image!.title} imageUrl={thumbUrl} pageUrl={`${SITE_URL}/characters/${slug}`} />

              {/* Tags */}
              {image!.tags.filter((t) => !t.startsWith("badge-") && !t.startsWith("resident:")).length > 0 && (
                <div style={{ padding: "12px 0" }}>
                  <p style={{ fontFamily: "var(--font-space, monospace)", fontSize: "0.55rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(224,224,224,0.3)", marginBottom: "8px" }}>
                    Tags
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {image!.tags.filter((t) => !t.startsWith("badge-") && !t.startsWith("resident:")).map((tag) => (
                      <span key={tag} style={{ display: "inline-block", padding: "4px 10px", fontFamily: "var(--font-space, monospace)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(224,224,224,0.6)", border: "1px solid rgba(224,224,224,0.1)", background: "rgba(255,255,255,0.03)" }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div
                className="description-html"
                style={{ color: "var(--text-muted)", lineHeight: 1.85, fontSize: "clamp(0.82rem, 1.5vw, 0.95rem)", marginTop: "8px" }}
                dangerouslySetInnerHTML={{ __html: displayDescription }}
              />
            </div>
          </div>

          {/* ── More from this resident ── */}
          {relatedWallpapers.length > 0 && (
            <div style={{ marginTop: "64px" }}>
              <p style={{ fontFamily: "var(--font-space, monospace)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#9d4edd", marginBottom: "20px" }}>
                More from {resident?.name ?? "this resident"}
              </p>
              <div className="char-related-grid">
                {relatedWallpapers.map((img) => (
                  <a key={img.id} href={`/characters/${img.slug}`} style={{ display: "block", textDecoration: "none" }}>
                    <div style={{ aspectRatio: img.deviceType === "PC" ? "16/9" : "9/16", overflow: "hidden", background: "#0a0812", borderRadius: "3px" }}>
                      <img
                        src={getPublicUrl(img.r2Key)}
                        alt={img.title}
                        loading="lazy"
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.3s ease" }}
                        onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
                        onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                      />
                    </div>
                    <p style={{ fontFamily: "var(--font-space, monospace)", fontSize: "0.56rem", color: "rgba(232,228,220,0.35)", marginTop: "5px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {img.title}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          )}
        </section>

        <RecentlyViewed currentSlug={image!.slug} />

        <style>{`
          .char-grid {
            display: flex;
            flex-direction: column;
            gap: 24px;
          }
          @media (min-width: 768px) {
            .char-grid {
              flex-direction: row;
              align-items: flex-start;
              gap: 48px;
            }
            .char-image-wrap {
              flex: 0 0 360px;
            }
            .char-info {
              flex: 1;
              position: sticky;
              top: 100px;
            }
          }
          @media (min-width: 1024px) {
            .char-image-wrap { flex: 0 0 440px; }
          }
          .char-related-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
            gap: 10px;
          }
          @media (min-width: 640px) {
            .char-related-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 14px; }
          }
          .description-html p { margin-bottom: 0.75rem; }
          .description-html p:last-child { margin-bottom: 0; }
          .description-html strong, .description-html b { color: #f0ecff; }
        `}</style>

        <PageTracker item={{ slug: image!.slug, title: image!.title, thumb: thumbUrl, href: `/characters/${slug}` }} />
      </main>
    </PremiumLockedGateClient>
  );
}