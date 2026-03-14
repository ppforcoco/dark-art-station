// app/iphone/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import { getRankedTags } from "@/lib/tags";
import TagCloud from "@/components/TagCloud";
import AdSlot from "@/components/AdSlot";
import Pagination from "@/components/Pagination";
import Breadcrumbs from "@/components/Breadcrumbs";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

interface PageProps {
  searchParams: Promise<{ tag?: string; page?: string }>;
}

// ─── SEO ─────────────────────────────────────────────────────────────────────

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { tag, page: rawPage } = await searchParams;
  const page    = Math.max(1, parseInt(rawPage ?? "1", 10) || 1);
  const pageLabel = page > 1 ? ` — Page ${page}` : "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

  const title = tag
    ? `Trending Dark #${tag} Wallpapers for iPhone${pageLabel} | HAUNTED WALLPAPERS`
    : `Free Dark iPhone Wallpapers 4K${pageLabel} | HAUNTED WALLPAPERS`;

  const description = tag
    ? `Browse free 4K dark fantasy iPhone wallpapers tagged #${tag}. Download instantly, no account required.`
    : "Free 4K dark fantasy & occult wallpapers for iPhone. Portrait 9:16 optimised. New drops daily. No account required.";

  const canonical = tag ? `${siteUrl}/iphone?tag=${tag}` : `${siteUrl}/iphone`;

  return {
    title,
    description,
    keywords: ["iphone wallpaper", "dark wallpaper iphone", "4k iphone wallpaper", "free iphone wallpaper", tag ?? "occult", "dark fantasy"].filter(Boolean),
    openGraph: { title, description, url: canonical, siteName: "HAUNTED WALLPAPERS", type: "website" },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function IphonePage({ searchParams }: PageProps) {
  const { tag, page: rawPage } = await searchParams;
  const page = Math.max(1, parseInt(rawPage ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const where = {
    collectionId: null,
    deviceType: "IPHONE" as const,
    ...(tag ? { tags: { has: tag } } : {}),
  };

  const [images, total, rankedTags] = await Promise.all([
    db.image.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: { id: true, slug: true, title: true, r2Key: true, viewCount: true, tags: true },
      take: PAGE_SIZE,
      skip,
    }),
    db.image.count({ where }),
    getRankedTags("IPHONE"),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const baseUrl    = tag ? `/iphone?tag=${encodeURIComponent(tag)}` : "/iphone";

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>

      {/* ── Breadcrumb path bar ── */}
      <Breadcrumbs items={[
        { label: "Home",   href: "/"       },
        { label: "iPhone", href: "/iphone" },
        ...(tag ? [{ label: `#${tag}` }] : []),
      ]} />

      {/* ── Header ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-[60px] pt-10 pb-8">
        <span className="font-mono text-[0.6rem] tracking-[0.25em] uppercase text-[#c0001a] block mb-3">
          The Sanctum — iPhone
        </span>
        <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight mb-4">
          {tag ? (
            <>Dark <span className="text-[#c9a84c] italic">#{tag}</span> Wallpapers for iPhone</>
          ) : (
            <>Free Dark iPhone <span className="text-[#c9a84c] italic">Wallpapers</span></>
          )}
          {page > 1 && <span className="text-[#4a445a] text-2xl"> — Page {page}</span>}
        </h1>
        <p className="font-body text-[1rem] text-[#8a8099] italic mb-8 max-w-xl">
          Portrait 9:16 · 4K resolution · Instant download · No account required
        </p>
        <Suspense fallback={null}>
          <TagCloud tags={rankedTags} />
        </Suspense>
      </section>

      {/* ── Top Ad ── */}
      <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN} width={728} height={90} />

      {/* ── Grid ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-[60px] py-10">
        {images.length === 0 ? (
          <p className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-[#4a445a] py-20 text-center">
            No wallpapers found{tag ? ` for #${tag}` : ""}. More dropping soon.
          </p>
        ) : (
          <>
            <p className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-[#4a445a] mb-6">
              — {total} wallpapers · page {page} of {totalPages}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {images.map((img) => (
                <Link
                  key={img.id}
                  href={`/iphone/${img.slug}`}
                  className="group relative overflow-hidden bg-[#0a0a0a] border border-[#2a2535] hover:border-[rgba(192,0,26,0.6)] transition-colors duration-300"
                  style={{ aspectRatio: "9/16" }}
                >
                  <Image
                    src={getPublicUrl(img.r2Key)}
                    alt={img.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(5,5,5,0.92)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <div>
                      <p className="font-body italic text-[0.85rem] text-white leading-tight">{img.title}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {img.tags.slice(0, 3).map((t) => (
                          <span key={t} className="font-mono text-[0.45rem] tracking-[0.1em] text-[#c9a84c]">#{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <Pagination currentPage={page} totalPages={totalPages} baseUrl={baseUrl} />
          </>
        )}
      </section>

      {/* ── Footer Ad ── */}
      <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} width={728} height={90} className="mt-8" />

      {/* ── ItemList JSON-LD ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: tag
              ? `Dark #${tag} iPhone Wallpapers | Haunted Wallpapers`
              : "Free Dark iPhone Wallpapers 4K | Haunted Wallpapers",
            url: tag
              ? `${process.env.NEXT_PUBLIC_SITE_URL}/iphone?tag=${tag}`
              : `${process.env.NEXT_PUBLIC_SITE_URL}/iphone`,
            numberOfItems: total,
            itemListElement: images.map((img, i) => ({
              "@type": "ListItem",
              position: skip + i + 1,
              url: `${process.env.NEXT_PUBLIC_SITE_URL}/iphone/${img.slug}`,
              name: img.title,
              image: getPublicUrl(img.r2Key),
            })),
          }),
        }}
      />
    </main>
  );
}