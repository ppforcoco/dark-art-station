import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db, getRelatedImages } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import AdSlot from "@/components/AdSlot";
import DeviceMockup from "@/components/DeviceMockup";

import RelatedWallpapers from "@/components/RelatedWallpapers";
import DownloadButton from "@/components/DownloadButton";
import RecentlyViewed from "@/components/RecentlyViewed";
import SocialShare from "@/components/SocialShare";
import PageTracker from "@/components/PageTracker";
import FavoriteButton from "@/components/FavoriteButton";
import { shouldCountPageView } from "@/lib/analytics-filter";
import PreviewButton from "@/components/PreviewButton";

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
    select: { title: true, description: true, metaDescription: true, r2Key: true, tags: true, deviceType: true },
  });
  if (!image || image.deviceType !== "ANDROID") return { title: "Not Found | HAUNTED WALLPAPERS" };
  const ogImage = getPublicUrl(image.r2Key);
  const tagLine = image.tags.slice(0, 3).map((t) => `#${t}`).join(" ");

  // Use dedicated metaDescription if set, otherwise fall back to description snippet
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
    },
  });

  if (!image || image.deviceType !== "ANDROID") notFound();

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
      where: { collectionId: null, deviceType: "ANDROID" },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: { slug: true, title: true, r2Key: true, sortOrder: true },
    }),
    getRelatedImages(image.id, image.tags, 6, "ANDROID"),
  ]);
  const currentIdx = siblings.findIndex((s) => s.slug === imageSlug);
  const prevImage = currentIdx > 0 ? siblings[currentIdx - 1] : null;
  const nextImage = currentIdx < siblings.length - 1 ? siblings[currentIdx + 1] : null;

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>

      <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN} width={728} height={90} />

      {/* ── Main layout: image centered on mobile, side-by-side on md+ ── */}
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
                />
              </div>
              <div className="hw-glow-btn-wrap hw-glow-btn-wrap--preview">
                <PreviewButton src={thumbUrl} title={image.title} />
              </div>
            </div>
          </div>


          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <Link href="/android" className="font-mono text-[0.6rem] tracking-[0.25em] uppercase text-[#8b0000] hover:text-[#c0001a] transition-colors">
                ← Android Wallpapers
              </Link>
              <h1 className="font-display text-2xl md:text-3xl font-bold mt-3 leading-tight">
                {image.title}
              </h1>
            </div>

            {/* Always rendered — real description or auto-generated fallback */}
            <div className="font-body text-[1rem] leading-relaxed description-html" style={{ color: "var(--text-muted)" }} dangerouslySetInnerHTML={{ __html: displayDescription }} />



            {/* Label removed */}



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

            {/* Ad unit — below download button for higher viewability score */}
            <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR} width={300} height={250} className="mt-2" />
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

      {/* ── Prev / Next ── */}
      {(prevImage || nextImage) && (
        <nav style={{
          maxWidth: "1280px", margin: "0 auto",
          padding: "48px 24px 40px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          borderTop: "1px solid var(--border-dim)",
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
                <span className="font-body italic text-[0.75rem]" style={{ color: "var(--text-primary)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
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
                <span className="font-body italic text-[0.75rem]" style={{ color: "var(--text-primary)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                  {nextImage.title}
                </span>
              </div>
            </Link>
          ) : <div />}
        </nav>
      )}

      <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} width={728} height={90} />

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
    </main>
  );
}