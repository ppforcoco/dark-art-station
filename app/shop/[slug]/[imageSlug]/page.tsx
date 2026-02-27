import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { getPublicUrl, getSignedDownloadUrl } from "@/lib/r2";
import AdSlot from "@/components/AdSlot";

interface PageProps {
  params: Promise<{ slug: string; imageSlug: string }>;
}

// ─── SEO ─────────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, imageSlug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

  const image = await db.image.findUnique({
    where: { slug: imageSlug },
    select: {
      title: true,
      description: true,
      r2Key: true,
      collection: { select: { title: true, category: true, slug: true } },
    },
  });

  if (!image || image.collection.slug !== slug) return { title: "Not Found | VOIDCANVAS" };

  const ogImage = getPublicUrl(image.r2Key);

  return {
    title: `${image.title} — ${image.collection.title} | VOIDCANVAS`,
    description: image.description ?? `${image.title} from the ${image.collection.title} collection. Dark fantasy art for download.`,
    keywords: [
      image.collection.category,
      image.title,
      image.collection.title,
      "dark wallpaper",
      "occult art",
      "AI art",
      "desktop wallpaper",
    ],
    openGraph: {
      title: `${image.title} | VOIDCANVAS`,
      description: image.description ?? `Dark fantasy art: ${image.title}`,
      url: `${siteUrl}/shop/${slug}/${imageSlug}`,
      siteName: "VOIDCANVAS",
      images: [{ url: ogImage, width: 1200, height: 630, alt: image.title }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${image.title} | VOIDCANVAS`,
      description: image.description ?? `Dark fantasy art: ${image.title}`,
      images: [ogImage],
    },
    alternates: { canonical: `${siteUrl}/shop/${slug}/${imageSlug}` },
  };
}

export async function generateStaticParams() {
  const images = await db.image.findMany({
    select: { slug: true, collection: { select: { slug: true } } },
  });
  return images.map((img) => ({
    slug: img.collection.slug,
    imageSlug: img.slug,
  }));
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ImagePage({ params }: PageProps) {
  const { slug, imageSlug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

  // Fetch image with collection context + siblings for navigation
  const image = await db.image.findUnique({
    where: { slug: imageSlug },
    include: {
      collection: {
        select: {
          id: true,
          slug: true,
          title: true,
          category: true,
          price: true,
          isFree: true,
          images: {
            orderBy: { sortOrder: "asc" },
            select: { slug: true, title: true, r2Key: true },
          },
        },
      },
    },
  });

  // Guard: image must exist AND belong to the correct collection slug
  if (!image || image.collection.slug !== slug) notFound();

  // Increment view count — fire and forget
  db.image.update({
    where: { id: image.id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {});

  const thumbUrl  = getPublicUrl(image.r2Key);
  const signedUrl = await getSignedDownloadUrl(image.highResKey);

  // Sibling navigation
  const siblings  = image.collection.images;
  const currentIdx = siblings.findIndex((s) => s.slug === imageSlug);
  const prevImage  = currentIdx > 0 ? siblings[currentIdx - 1] : null;
  const nextImage  = currentIdx < siblings.length - 1 ? siblings[currentIdx + 1] : null;

  return (
    <main className="min-h-screen bg-[#050505] text-white">

      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 md:px-[60px] pt-8 pb-4">
        <nav className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-[#4a445a] flex items-center gap-2">
          <Link href="/shop" className="hover:text-[#c9a84c] transition-colors">Shop</Link>
          <span>/</span>
          <Link href={`/shop/${slug}`} className="hover:text-[#c9a84c] transition-colors">
            {image.collection.title}
          </Link>
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
          <div className="relative aspect-[3/4] overflow-hidden border border-[rgba(139,0,0,0.3)] bg-[#0a0a0a]">
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
                href={`/shop/${slug}`}
                className="font-mono text-[0.6rem] tracking-[0.25em] uppercase text-[#8b0000] hover:text-[#c0001a] transition-colors"
              >
                ← {image.collection.title}
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

            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-[#4a445a] border border-[#2a2535] px-3 py-1">
                {image.collection.category}
              </span>
              <span className="font-mono text-[0.55rem] tracking-[0.1em] text-[#4a445a]">
                {image.viewCount} views
              </span>
            </div>

            {/* Download CTA */}
            <div className="flex flex-col gap-3 mt-2">
              <span className="font-display text-2xl font-bold text-[#c9a84c]">
                {image.collection.isFree ? "FREE" : `$${image.collection.price.toFixed(2)}`}
              </span>
              <a
                href={signedUrl}
                download
                className="font-mono text-[0.7rem] tracking-[0.2em] uppercase bg-[#8b0000] hover:bg-[#a80000] text-white px-8 py-3 transition-colors duration-200 border border-[#8b0000] text-center"
              >
                {image.collection.isFree ? "Download Free (High-Res)" : "Download High-Res"}
              </a>
              <p className="font-mono text-[0.5rem] tracking-[0.1em] text-[#4a445a]">
                PNG format · Link expires in 5 minutes
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
              href={`/shop/${slug}/${prevImage.slug}`}
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
              href={`/shop/${slug}/${nextImage.slug}`}
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
            "@type": "ImageObject",
            name: image.title,
            description: image.description,
            contentUrl: thumbUrl,
            url: `${siteUrl}/shop/${slug}/${imageSlug}`,
            author: { "@type": "Organization", name: "VOIDCANVAS" },
          }),
        }}
      />
    </main>
  );
}