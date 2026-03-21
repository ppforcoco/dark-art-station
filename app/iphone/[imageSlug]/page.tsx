// app/iphone/[imageSlug]/page.tsx
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

export const dynamicParams = true;

interface PageProps {
  params: Promise<{ imageSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { imageSlug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";
  const image = await db.image.findUnique({
    where: { slug: imageSlug },
    select: { title: true, description: true, r2Key: true, tags: true, deviceType: true },
  });
  if (!image || image.deviceType !== "IPHONE") return { title: "Not Found | HAUNTED WALLPAPERS" };
  const ogImage = getPublicUrl(image.r2Key);
  const tagLine = image.tags.slice(0, 3).map((t) => `#${t}`).join(" ");
  return {
    title: `${image.title} — Free iPhone Wallpaper | HAUNTED WALLPAPERS`,
    description: image.description ?? `${image.title} — free 4K dark fantasy iPhone wallpaper. ${tagLine}. Download instantly, no account required.`,
    keywords: ["iphone wallpaper", "dark wallpaper iphone", "4k iphone wallpaper", image.title, ...image.tags],
    openGraph: {
      title: `${image.title} | HAUNTED WALLPAPERS`,
      description: image.description ?? `Free 4K iPhone wallpaper: ${image.title}`,
      url: `${siteUrl}/iphone/${imageSlug}`,
      siteName: "HAUNTED WALLPAPERS",
      images: [{ url: ogImage, width: 1200, height: 630, alt: image.title }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${image.title} | HAUNTED WALLPAPERS`,
      description: image.description ?? `Free 4K iPhone wallpaper: ${image.title}`,
      images: [ogImage],
    },
    alternates: { canonical: `${siteUrl}/iphone/${imageSlug}` },
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

  db.image.update({
    where: { id: image.id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {});

  const thumbUrl = getPublicUrl(image.r2Key);

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

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>

      <Breadcrumbs items={[
        { label: "Home",   href: "/"       },
        { label: "iPhone", href: "/iphone" },
        { label: image.title },
      ]} />

      <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN} width={728} height={90} />

      {/* ── Main layout: stacks on mobile, side-by-side on md+ ── */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

          <DeviceMockup deviceType="IPHONE">
            <div className="relative w-full h-full">
              <Image src={thumbUrl} alt={image.title} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 65vw" />
            </div>
          </DeviceMockup>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <Link href="/iphone" className="font-mono text-[0.6rem] tracking-[0.25em] uppercase text-[#8b0000] hover:text-[#c0001a] transition-colors">
                ← iPhone Wallpapers
              </Link>
              <h1 className="font-display text-2xl md:text-3xl font-bold mt-3 leading-tight">
                {image.title}
              </h1>
            </div>

            {image.description && (
              <p className="font-body text-[1rem] text-[#a89bc0] leading-relaxed">{image.description}</p>
            )}

            {image.tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {image.tags.map((tag) => (
                  <Link key={tag} href={`/iphone?tag=${tag}`}
                    className="font-mono text-[0.55rem] tracking-[0.15em] uppercase border border-[#2a2535] px-3 py-1 text-[#8a8099] hover:border-[#c0001a] hover:text-[#f0ecff] transition-colors">
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
              <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-[#4a445a] border border-[#2a2535] px-3 py-1">
                iPhone · 9:16
              </span>
            </div>

            {/* Download button — primary CTA, highest on the panel */}
            <DownloadButton
              href={`/api/download/image/${image.id}`}
              viewCount={image.viewCount}
            />

            {/* Ad unit — below download button for higher viewability score */}
            <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR} width={300} height={250} className="mt-2" />
          </div>
        </div>
      </section>

      {/* Desktop two-column layout via CSS */}
      <style>{`
        @media (min-width: 768px) {
          .iphone-detail-grid { flex-direction: row !important; align-items: flex-start; }
          .iphone-detail-grid > *:first-child { flex: 1; }
          .iphone-detail-grid > *:last-child { width: 360px; flex-shrink: 0; position: sticky; top: 100px; }
        }
      `}</style>

      {/* ── Prev / Next — clean grid on mobile ── */}
      {(prevImage || nextImage) && (
        <nav style={{
          maxWidth: "1280px", margin: "0 auto",
          padding: "0 24px 40px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
        }}>
          {prevImage ? (
            <Link href={`/iphone/${prevImage.slug}`}
              style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "16px", border: "1px solid #2a2535", textDecoration: "none" }}
              className="hover:border-[rgba(139,0,0,0.5)] transition-colors">
              <span className="font-mono text-[0.5rem] tracking-[0.2em] uppercase text-[#4a445a]">← Previous</span>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ position: "relative", width: "48px", height: "48px", flexShrink: 0, overflow: "hidden" }}>
                  <Image src={getPublicUrl(prevImage.r2Key)} alt={prevImage.title} fill className="object-cover" sizes="48px" />
                </div>
                <span className="font-body italic text-[0.8rem] text-[#f0ecff]"
                  style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                  {prevImage.title}
                </span>
              </div>
            </Link>
          ) : <div />}

          {nextImage ? (
            <Link href={`/iphone/${nextImage.slug}`}
              style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "16px", border: "1px solid #2a2535", textDecoration: "none", textAlign: "right" }}
              className="hover:border-[rgba(139,0,0,0.5)] transition-colors">
              <span className="font-mono text-[0.5rem] tracking-[0.2em] uppercase text-[#4a445a]">Next →</span>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "flex-end" }}>
                <span className="font-body italic text-[0.8rem] text-[#f0ecff]"
                  style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                  {nextImage.title}
                </span>
                <div style={{ position: "relative", width: "48px", height: "48px", flexShrink: 0, overflow: "hidden" }}>
                  <Image src={getPublicUrl(nextImage.r2Key)} alt={nextImage.title} fill className="object-cover" sizes="48px" />
                </div>
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
        href: `/iphone/${imageSlug}`,
      }} />
      <SocialShare
        title={image.title}
        imageUrl={thumbUrl}
        pageUrl={`${siteUrl}/iphone/${imageSlug}`}
      />
      <RecentlyViewed />

      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "@id": `${siteUrl}/iphone/${imageSlug}#product`,
          name: image.title,
          description: image.description ?? `${image.title} — free 4K dark fantasy iPhone wallpaper.`,
          url: `${siteUrl}/iphone/${imageSlug}`,
          brand: { "@type": "Brand", name: "HAUNTED WALLPAPERS", url: siteUrl },
          category: "Digital Products > Wallpapers > iPhone",
          image: [{ "@type": "ImageObject", url: thumbUrl, contentUrl: thumbUrl, caption: image.title }],
          additionalProperty: [
            { "@type": "PropertyValue", name: "Format", value: "JPEG (4K High Resolution)" },
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