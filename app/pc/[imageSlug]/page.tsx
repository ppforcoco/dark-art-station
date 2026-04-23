// app/pc/[imageSlug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db, getRelatedImages } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import AdSlot from "@/components/AdSlot";
import DeviceMockup from "@/components/DeviceMockup";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedWallpapers from "@/components/RelatedWallpapers";
import DownloadButton from "@/components/DownloadButton";
import RecentlyViewed from "@/components/RecentlyViewed";
import SocialShare from "@/components/SocialShare";
import PageTracker from "@/components/PageTracker";
import FavoriteButton from "@/components/FavoriteButton";
import { shouldCountPageView } from "@/lib/analytics-filter";

export const dynamicParams = true;
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ imageSlug: string }>;
}

// ── Fallback description generator ──────────────────────────────────────────
function buildFallbackDescription(title: string, tags: string[]): string {
  const tagList = tags.length > 0
    ? tags.slice(0, 5).join(", ")
    : "dark fantasy, atmospheric, gothic";

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
    "so you will not find this artwork duplicated across generic wallpaper repositories. " +
    "Browse the related wallpapers below to discover more pieces that share a similar dark atmosphere and artistic style."
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { imageSlug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";
  const image = await db.image.findUnique({
    where: { slug: imageSlug },
    select: { title: true, description: true, metaDescription: true, r2Key: true, tags: true, deviceType: true },
  });
  if (!image || image.deviceType !== "PC") return { title: "Not Found | HAUNTED WALLPAPERS" };
  const ogImage = getPublicUrl(image.r2Key);
  const tagLine = image.tags.slice(0, 3).map((t) => `#${t}`).join(" ");

  const metaDesc = image.metaDescription
    ?? image.description
    ?? `${image.title} — free dark fantasy PC wallpaper. ${tagLine}. Download instantly, no account required.`;

  // Strip HTML tags for meta description
  const plainMetaDesc = metaDesc.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

  return {
    title: `${image.title} — Free PC Wallpaper | HAUNTED WALLPAPERS`,
    description: plainMetaDesc,
    keywords: ["pc wallpaper", "dark wallpaper pc", "hd pc wallpaper", image.title, ...image.tags],
    openGraph: {
      title: `${image.title} | HAUNTED WALLPAPERS`,
      description: plainMetaDesc,
      url: `${siteUrl}/pc/${imageSlug}`,
      siteName: "HAUNTED WALLPAPERS",
      images: [{ url: ogImage, width: 1920, height: 1080, alt: image.title }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${image.title} | HAUNTED WALLPAPERS`,
      description: plainMetaDesc,
      images: [ogImage],
    },
    alternates: { canonical: `${siteUrl}/pc/${imageSlug}` },
  };
}

export async function generateStaticParams() {
  const images = await db.image.findMany({
    where: { collectionId: null, deviceType: "PC" },
    select: { slug: true },
  });
  return images.map((img) => ({ imageSlug: img.slug }));
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

  // Always show description — real or auto-generated. Supports HTML.
  const displayDescription = image.description ?? buildFallbackDescription(image.title, image.tags);
  const plainDescription = displayDescription.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

  const [siblings, related] = await Promise.all([
    db.image.findMany({
      where: { collectionId: null, deviceType: "PC" },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: { slug: true, title: true, r2Key: true, sortOrder: true },
    }),
    getRelatedImages(image.id, image.tags, 6, "PC"),
  ]);
  const currentIdx = siblings.findIndex((s) => s.slug === imageSlug);
  const prevImage = currentIdx > 0 ? siblings[currentIdx - 1] : null;
  const nextImage = currentIdx < siblings.length - 1 ? siblings[currentIdx + 1] : null;

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>

      <Breadcrumbs items={[
        { label: "Home", href: "/"   },
        { label: "PC",   href: "/pc" },
        { label: image.title },
      ]} />

      <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN} width={728} height={90} />

      {/* ── Main layout: image centered on mobile, side-by-side on md+ ── */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px 24px 40px" }}>
        <div className="pc-detail-grid" style={{ display: "flex", flexDirection: "column", gap: "40px" }}>

          {/* Image — hero size */}
          <div className="pc-detail-image-wrap">
            <DeviceMockup deviceType="PC">
              <div className="relative w-full h-full">
                <Image
                  src={thumbUrl}
                  alt={image.title}
                  fill
                  className="object-cover"
                  priority
                  quality={90}
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 65vw"
                />
              </div>
            </DeviceMockup>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <Link href="/pc" className="font-mono text-[0.6rem] tracking-[0.25em] uppercase text-[#8b0000] hover:text-[#c0001a] transition-colors">
                ← PC Wallpapers
              </Link>
              <h1 className="font-display text-2xl md:text-3xl font-bold mt-3 leading-tight">
                {image.title}
              </h1>
            </div>

            {/* Always rendered — real description or auto-generated fallback. Supports HTML. */}
            <div
              className="font-body text-[1rem] text-[#a89bc0] leading-relaxed description-html"
              dangerouslySetInnerHTML={{ __html: displayDescription }}
            />

            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
              <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-[#4a445a] border border-[#2a2535] px-3 py-1">
                PC · 16:9
              </span>
            </div>

            {/* Download button — primary CTA */}
            <DownloadButton
              href={`/api/download/image/${image.id}`}
              viewCount={image.viewCount}
            />

            {/* Save to favorites */}
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

            {/* Ad unit — below download button for higher viewability score */}
            <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR} width={300} height={250} className="mt-2" />
          </div>
        </div>
      </section>

      {/* Desktop two-column layout via CSS */}
      <style>{`
        .pc-detail-image-wrap {
          display: flex;
          justify-content: center;
        }
        @media (min-width: 768px) {
          .pc-detail-grid { flex-direction: row !important; align-items: flex-start; gap: 56px !important; }
          .pc-detail-image-wrap { flex: 0 0 560px; justify-content: flex-start; }
          .pc-detail-grid > div:last-child { flex: 1; position: sticky; top: 100px; }
        }
        @media (min-width: 1024px) {
          .pc-detail-image-wrap { flex: 0 0 640px; }
        }
        .description-html p { margin-bottom: 0.75rem; }
        .description-html p:last-child { margin-bottom: 0; }
        .description-html a { color: #8b0000; text-decoration: underline; }
        .description-html a:hover { color: #c0001a; }
        .description-html strong, .description-html b { color: #f0ecff; }
        .description-html ul, .description-html ol { padding-left: 1.25rem; margin-bottom: 0.75rem; }
        .description-html li { margin-bottom: 0.25rem; }
      `}</style>

      {/* ── Prev / Next ── */}
      {(prevImage || nextImage) && (
        <nav style={{
          maxWidth: "1280px", margin: "0 auto",
          padding: "48px 24px 40px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          borderTop: "1px solid #1e1b2e",
        }}>
          {prevImage ? (
            <Link href={`/pc/${prevImage.slug}`}
              style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "12px", padding: "10px", border: "1px solid #2a2535", textDecoration: "none" }}
              className="hover:border-[rgba(139,0,0,0.5)] transition-colors">
              <div style={{ position: "relative", flexShrink: 0, width: "86px", height: "48px", overflow: "hidden", borderRadius: "4px" }}>
                <Image src={getPublicUrl(prevImage.r2Key)} alt={prevImage.title} fill className="object-cover" unoptimized sizes="86px" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
                <span className="font-mono text-[0.5rem] tracking-[0.2em] uppercase text-[#4a445a]">← Previous</span>
                <span className="font-body italic text-[0.75rem] text-[#f0ecff]"
                  style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                  {prevImage.title}
                </span>
              </div>
            </Link>
          ) : <div />}

          {nextImage ? (
            <Link href={`/pc/${nextImage.slug}`}
              style={{ display: "flex", flexDirection: "row-reverse", alignItems: "center", gap: "12px", padding: "10px", border: "1px solid #2a2535", textDecoration: "none" }}
              className="hover:border-[rgba(139,0,0,0.5)] transition-colors">
              <div style={{ position: "relative", flexShrink: 0, width: "86px", height: "48px", overflow: "hidden", borderRadius: "4px" }}>
                <Image src={getPublicUrl(nextImage.r2Key)} alt={nextImage.title} fill className="object-cover" unoptimized sizes="86px" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0, textAlign: "right" }}>
                <span className="font-mono text-[0.5rem] tracking-[0.2em] uppercase text-[#4a445a]">Next →</span>
                <span className="font-body italic text-[0.75rem] text-[#f0ecff]"
                  style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                  {nextImage.title}
                </span>
              </div>
            </Link>
          ) : <div />}
        </nav>
      )}

      <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} width={728} height={90} />

      <RelatedWallpapers images={related} heading="More Dark Art You'll Like" landscape />
      <PageTracker item={{
        slug: image.slug,
        title: image.title,
        thumb: thumbUrl,
        href: `/pc/${imageSlug}`,
      }} />
      <SocialShare
        title={image.title}
        imageUrl={thumbUrl}
        pageUrl={`${siteUrl}/pc/${imageSlug}`}
      />
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