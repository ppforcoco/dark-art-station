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
  const page      = Math.max(1, parseInt(rawPage ?? "1", 10) || 1);
  const pageLabel = page > 1 ? ` — Page ${page}` : "";
  const siteUrl   = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

  const title = tag
    ? `Trending Dark #${tag} Desktop Wallpapers for PC${pageLabel} | HAUNTED WALLPAPERS`
    : `Free Dark PC Desktop Wallpapers 4K${pageLabel} | HAUNTED WALLPAPERS`;

  const description = tag
    ? `Browse free 4K dark fantasy PC desktop wallpapers tagged #${tag}. Download instantly, no account required.`
    : "Free 4K dark fantasy & occult wallpapers for PC. Landscape 16:9 optimised. New drops daily. No account required.";

  const canonical = tag ? `${siteUrl}/pc?tag=${tag}` : `${siteUrl}/pc`;

  return {
    title,
    description,
    keywords: ["pc wallpaper", "desktop wallpaper dark", "4k desktop wallpaper", "free pc wallpaper", "16:9 wallpaper", tag ?? "occult", "dark fantasy"].filter(Boolean),
    openGraph: { title, description, url: canonical, siteName: "HAUNTED WALLPAPERS", type: "website" },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PcPage({ searchParams }: PageProps) {
  const { tag, page: rawPage } = await searchParams;
  const page = Math.max(1, parseInt(rawPage ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const where = {
    collectionId: null,
    deviceType: "PC" as const,
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
    getRankedTags("PC"),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const baseUrl    = tag ? `/pc?tag=${encodeURIComponent(tag)}` : "/pc";

  return (
    <main className="min-h-screen bg-[#050505] text-white">

      {/* ── Header ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-[60px] pt-16 pb-8">
        <Breadcrumbs items={[
          { label: "Home", href: "/"    },
          { label: "PC",   href: "/pc"  },
          ...(tag ? [{ label: `#${tag}` }] : []),
        ]} />
        <span className="font-mono text-[0.6rem] tracking-[0.25em] uppercase text-[#c0001a] block mb-3">
          The Sanctum — PC Desktop
        </span>
        <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight mb-4">
          {tag ? (
            <>Dark <span className="text-[#c9a84c] italic">#{tag}</span> Desktop Wallpapers</>
          ) : (
            <>Free Dark Desktop <span className="text-[#c9a84c] italic">Wallpapers</span></>
          )}
          {page > 1 && <span className="text-[#4a445a] text-2xl"> — Page {page}</span>}
        </h1>
        <p className="font-body text-[1rem] text-[#8a8099] italic mb-8 max-w-xl">
          Landscape 16:9 · 4K resolution · Instant download · No account required
        </p>
        <Suspense fallback={null}>
          <TagCloud tags={rankedTags} />
        </Suspense>
      </section>

      {/* ── Top Ad ── */}
      <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN} width={728} height={90} />

      {/* ── Grid — landscape 16:9 ── */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((img) => (
                <Link
                  key={img.id}
                  href={`/pc/${img.slug}`}
                  className="group relative aspect-landscape overflow-hidden bg-[#0a0a0a] border border-[#2a2535] hover:border-[rgba(192,0,26,0.6)] transition-colors duration-300"
                >
                  <Image
                    src={getPublicUrl(img.r2Key)}
                    alt={img.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(5,5,5,0.92)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div>
                      <p className="font-body italic text-[0.9rem] text-white leading-tight">{img.title}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {img.tags.slice(0, 4).map((t) => (
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
    </main>
  );
}