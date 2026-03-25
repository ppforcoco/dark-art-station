// app/pc/page.tsx
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

export const revalidate = 60;

const PAGE_SIZE = 24;

interface PageProps {
  searchParams: Promise<{ tag?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { tag, page: rawPage } = await searchParams;
  const page      = Math.max(1, parseInt(rawPage ?? "1", 10) || 1);
  const pageLabel = page > 1 ? ` — Page ${page}` : "";
  const siteUrl   = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

  const title = tag
    ? `Trending Dark #${tag} Desktop Wallpapers for PC${pageLabel} | HAUNTED WALLPAPERS`
    : `Free Dark Desktop Wallpapers 4K${pageLabel} | HAUNTED WALLPAPERS`;

  const description = tag
    ? `Browse free 4K dark fantasy Android wallpapers tagged #${tag}. Download instantly, no account required.`
    : "Free 4K dark fantasy wallpapers for PC. Portrait 9:16 optimised. New drops daily. No account required.";

  const canonical = tag ? `${siteUrl}/pc?tag=${tag}` : `${siteUrl}/pc`;

  return {
    title,
    description,
    keywords: ["pc wallpaper", "desktop wallpaper dark", "4k desktop wallpaper", "free pc wallpaper", "16:9 wallpaper", tag ?? "dark", "dark fantasy"].filter(Boolean),
    openGraph: { title, description, url: canonical, siteName: "HAUNTED WALLPAPERS", type: "website" },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical },
  };
}

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
    getRankedTags("PC").then(t => t.slice(0, 10)),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const baseUrl    = tag ? `/pc?tag=${encodeURIComponent(tag)}` : "/pc";

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>

      <Breadcrumbs items={[
        { label: "Home",    href: "/"        },
        { label: "PC",   href: "/pc" },
        ...(tag ? [{ label: `#${tag}` }] : []),
      ]} />

      <section className="max-w-7xl mx-auto px-6 md:px-[60px] pt-10 pb-8">
        <span className="font-mono text-[0.6rem] tracking-[0.25em] uppercase text-[#c0001a] block mb-3">
          Free PC Wallpapers
        </span>
        <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight mb-4">
          {tag ? (
            <>Dark <span className="text-[#c9a84c] italic">#{tag}</span> Desktop Wallpapers for PC</>
          ) : (
            <>Free Dark PC <span className="text-[#c9a84c] italic">Wallpapers</span></>
          )}
          {page > 1 && <span className="text-[#4a445a] text-2xl"> — Page {page}</span>}
        </h1>
        <p className="font-body text-[1rem] text-[#8a8099] italic mb-8 max-w-xl">
          Landscape 16:9 · 4K resolution · Instant download · No account required
        </p>

        {!tag && (
          <div className="device-page-intro">
            <p>
              PC and desktop wallpapers here are landscape 16:9 format, native 4K resolution
              (3840×2160). They are designed for modern monitors including 1080p, 1440p, and 4K
              displays, as well as ultrawide setups. The dark backgrounds work particularly well
              on IPS and OLED monitors where deep blacks add to the atmosphere.
            </p>
            <p>
              On Windows, right-click your desktop → Personalise → Background to apply any image.
              On Mac, go to System Settings → Wallpaper and drag your downloaded file in.
              Multi-monitor setups are supported — you can set a different wallpaper on each display.
              Everything is free, instant, and requires no account.
            </p>
            <div className="device-page-guide-link">
              <span>Want a step-by-step walkthrough?</span>
              <a href="/blog/best-4k-wallpapers-for-pc-desktop-dark-theme">Read our PC wallpaper guide →</a>
            </div>
          </div>
        )}

        <Suspense fallback={null}>
          <TagCloud tags={rankedTags} />
        </Suspense>
      </section>

      <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN} width={728} height={90} />

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
              {images.map((img, idx) => (
                <>
                  <Link
                    key={img.id}
                    href={`/pc/${img.slug}`}
                    className="group relative overflow-hidden bg-[#0a0a0a] border border-[#2a2535] hover:border-[rgba(192,0,26,0.6)] transition-colors duration-300"
                    style={{ aspectRatio: "16/9" }}
                  >
                    <Image
                      src={getPublicUrl(img.r2Key)}
                      alt={`${img.title} — free dark PC desktop wallpaper 4K`}
                      fill
                      loading={idx < 6 ? "eager" : "lazy"}
                      priority={idx < 6}
                      unoptimized
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
                  {idx === 5 && (
                    <div className="col-span-1 sm:col-span-2 lg:col-span-3 my-2">
                      <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN} width={728} height={90} />
                    </div>
                  )}
                </>
              ))}
            </div>
            <Pagination currentPage={page} totalPages={totalPages} baseUrl={baseUrl} />
          </>
        )}
      </section>

      <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} width={728} height={90} className="mt-8" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: tag ? `Dark #${tag} PC Wallpapers | Haunted Wallpapers` : "Free Dark Desktop Wallpapers 4K | Haunted Wallpapers",
            url: tag ? `${process.env.NEXT_PUBLIC_SITE_URL}/pc?tag=${tag}` : `${process.env.NEXT_PUBLIC_SITE_URL}/pc`,
            numberOfItems: total,
            itemListElement: images.map((img, i) => ({
              "@type": "ListItem",
              position: skip + i + 1,
              url: `${process.env.NEXT_PUBLIC_SITE_URL}/pc/${img.slug}`,
              name: img.title,
              image: getPublicUrl(img.r2Key),
            })),
          }),
        }}
      />
    </main>
  );
}