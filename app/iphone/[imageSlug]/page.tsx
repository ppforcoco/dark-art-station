import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import AdSlot from "@/components/AdSlot";

// Allow on-demand rendering for slugs not in generateStaticParams
// (handles case where image is added after build without full rebuild)
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ imageSlug: string }>;
}

// ─── SEO ─────────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { imageSlug } = await params;
  if (!imageSlug) return { title: "Not Found | HAUNTED WALLPAPERS" };

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function IphoneImagePage({ params }: PageProps) {
  const { imageSlug } = await params;
  if (!imageSlug) return { title: "Not Found | HAUNTED WALLPAPERS" };

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

  // Increment view count — fire and forget
  db.image.update({
    where: { id: image.id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {});

  const thumbUrl = getPublicUrl(image.r2Key);

  // Prev / Next within same device type, ordered by sortOrder
  const siblings = await db.image.findMany({
    where: { collectionId: null, deviceType: "IPHONE" },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: { slug: true, title: true, r2Key: true, sortOrder: true },
  });
  const currentIdx = siblings.findIndex((s) => s.slug === imageSlug);
  const prevImage  = currentIdx > 0 ? siblings[currentIdx - 1] : null;
  const nextImage  = currentIdx < siblings.length - 1 ? siblings[currentIdx + 1] : null;

  return (
    <main className="min-h-screen bg-[#050505] text-white">

      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 md:px-[60px] pt-8 pb-4">
        <nav className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-[#4a445a] flex items-center gap-2">
          <Link href="/iphone" className="hover:text-[#c9a84c] transition-colors">iPhone Sanctum</Link>
          <span>/</span>
          <span className="text-[#8a8099]">{image.title}</span>
        </nav>
      </div>

      {/* ── Top Ad ──────────────────────────────────────────────────────── */}
      <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN} width={728} height={90} />

      {/* ── Main Image + Details ────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 md:px-[60px] py-10">
        <div className="grid md:grid-cols-[1fr_360px] gap-10 items-start">

          {/* Full image */}
          <div className="relative aspect-portrait max-h-[80vh] overflow-hidden border border-[rgba(139,0,0,0.3)] bg-[#0a0a0a]">
            <Image
              src={thumbUrl}
              alt={image.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 65vw"
            />
          </div>

          {/* Details panel */}
          <div className="flex flex-col gap-6 sticky top-8">
            <div>
              <Link
                href="/iphone"
                className="font-mono text-[0.6rem] tracking-[0.25em] uppercase text-[#8b0000] hover:text-[#c0001a] transition-colors"
              >
                ← iPhone Sanctum
              </Link>
              <h1 className="font-display text-2xl md:text-3xl font-bold mt-3 leading-tight">
                {image.title}
              </h1>
            </div>

            {image.description && (
              <p className="font-body text-[1rem] text-[#a89bc0] leading-relaxed">
                {image.description}
              </p>
            )}

            {/* Tags */}
            {image.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {image.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/iphone?tag=${tag}`}
                    className="font-mono text-[0.55rem] tracking-[0.15em] uppercase border border-[#2a2535] px-3 py-1 text-[#8a8099] hover:border-[#c0001a] hover:text-[#f0ecff] transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-[#4a445a] border border-[#2a2535] px-3 py-1">
                iPhone · 9:16
              </span>
              <span className="font-mono text-[0.55rem] tracking-[0.1em] text-[#4a445a]">
                {image.viewCount} views
              </span>
            </div>

            {/* Download CTA */}
            <div className="flex flex-col gap-3 mt-2">
              <a
                href={`/api/download/image/${image.id}`}
                className="font-mono text-[0.7rem] tracking-[0.2em] uppercase bg-[#8b0000] hover:bg-[#a80000] text-white px-8 py-4 transition-colors duration-200 border border-[#8b0000] text-center"
              >
                ↓ Download 4K Wallpaper (Free)
              </a>
              <p className="font-mono text-[0.5rem] tracking-[0.1em] text-[#4a445a]">
                JPEG · 4K resolution · No account required
              </p>
            </div>

            {/* Sidebar Ad */}
            <AdSlot
              slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR}
              width={300}
              height={250}
              className="mt-4"
            />
          </div>
        </div>
      </section>

      {/* ── Prev / Next Navigation ──────────────────────────────────────── */}
      {(prevImage || nextImage) && (
        <nav className="max-w-7xl mx-auto px-6 md:px-[60px] pb-8 flex items-center justify-between gap-4">
          {prevImage ? (
            <Link
              href={`/iphone/${prevImage.slug}`}
              className="group flex items-center gap-4 border border-[#2a2535] hover:border-[rgba(139,0,0,0.5)] p-4 transition-colors flex-1 max-w-[280px]"
            >
              <div className="relative w-14 h-14 shrink-0 overflow-hidden">
                <Image src={getPublicUrl(prevImage.r2Key)} alt={prevImage.title} fill className="object-cover" sizes="56px" />
              </div>
              <div>
                <span className="font-mono text-[0.5rem] tracking-[0.2em] uppercase text-[#4a445a] block">← Previous</span>
                <span className="font-body italic text-[0.9rem] text-[#f0ecff]">{prevImage.title}</span>
              </div>
            </Link>
          ) : <div />}

          {nextImage && (
            <Link
              href={`/iphone/${nextImage.slug}`}
              className="group flex items-center gap-4 border border-[#2a2535] hover:border-[rgba(139,0,0,0.5)] p-4 transition-colors flex-1 max-w-[280px] justify-end text-right ml-auto"
            >
              <div>
                <span className="font-mono text-[0.5rem] tracking-[0.2em] uppercase text-[#4a445a] block">Next →</span>
                <span className="font-body italic text-[0.9rem] text-[#f0ecff]">{nextImage.title}</span>
              </div>
              <div className="relative w-14 h-14 shrink-0 overflow-hidden">
                <Image src={getPublicUrl(nextImage.r2Key)} alt={nextImage.title} fill className="object-cover" sizes="56px" />
              </div>
            </Link>
          )}
        </nav>
      )}

      {/* ── Footer Ad ───────────────────────────────────────────────────── */}
      <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} width={728} height={90} />

      {/* ── JSON-LD ─────────────────────────────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
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
          }),
        }}
      />
    </main>
  );
}