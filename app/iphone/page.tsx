// app/iphone/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import { getRankedTags } from "@/lib/tags";
import TagCloud from "@/components/TagCloud";
import AdSlot from "@/components/AdSlot";
import Pagination from "@/components/Pagination";
import Breadcrumbs from "@/components/Breadcrumbs";
import DeviceImageCard from "@/components/DeviceImageCard";

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
    ? `Trending Dark #${tag} Wallpapers for iPhone${pageLabel} | HAUNTED WALLPAPERS`
    : `Free Dark iPhone Wallpapers HD${pageLabel} | HAUNTED WALLPAPERS`;

  const description = tag
    ? `Browse free HD dark fantasy iPhone wallpapers tagged #${tag}. Download instantly, no account required.`
    : "Free HD dark fantasy wallpapers for iPhone. Portrait 9:16 optimised. New drops daily. No account required.";

  const canonical = tag ? `${siteUrl}/iphone?tag=${tag}` : `${siteUrl}/iphone`;

  return {
    title,
    description,
    keywords: ["iphone wallpaper", "dark wallpaper iphone", "HD iphone wallpaper", "free iphone wallpaper", tag ?? "dark", "dark fantasy"].filter(Boolean),
    openGraph: { title, description, url: canonical, siteName: "HAUNTED WALLPAPERS", type: "website" },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical },
  };
}

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
      select: { id: true, slug: true, title: true, r2Key: true, viewCount: true, tags: true, isAdult: true },
      take: PAGE_SIZE,
      skip,
    }),
    db.image.count({ where }),
    getRankedTags("IPHONE").then(t => t.slice(0, 10)),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const baseUrl    = tag ? `/iphone?tag=${encodeURIComponent(tag)}` : "/iphone";

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>

      <Breadcrumbs items={[
        { label: "Home",    href: "/"       },
        { label: "iPhone", href: "/iphone" },
        ...(tag ? [{ label: `#${tag}` }] : []),
      ]} />

      <section className="max-w-7xl mx-auto px-6 md:px-[60px] pt-10 pb-8">
        <span className="font-mono text-[0.6rem] tracking-[0.25em] uppercase text-[#c0001a] block mb-3">
          Free iPhone Wallpapers
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
          Portrait 9:16 · HD resolution · Instant download · No account required
        </p>

        {!tag && (
          <div className="device-page-intro">
            <p>
              Every wallpaper in this collection is designed specifically for iPhone screens —
              portrait 9:16 format, optimised for the Super Retina XDR display found on iPhone 12
              through iPhone 16. Images are generated at HD resolution and downsampled cleanly,
              so you get maximum sharpness without jagged edges or compression artefacts.
            </p>
            <p>
              All wallpapers are free to download. No account required, no watermarks, no paywalls.
              Tap any image to view it full-size and download directly to your Photos library.
              New collections drop regularly.
            </p>
            <div className="device-page-guide-link">
              <span>New to setting wallpapers?</span>
              <a href="/blog/the-dark-aesthetic-a-complete-guide-to-customizing-your-devices">Read our wallpaper guide →</a>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {images.map((img, idx) => (
                <>
                  <DeviceImageCard
                    key={img.id}
                    href={`/iphone/${img.slug}`}
                    src={getPublicUrl(img.r2Key)}
                    alt={`${img.title} — free dark iPhone wallpaper HD`}
                    title={img.title}
                    tags={img.tags}
                    isAdult={img.isAdult}
                    priority={idx < 10}
                    aspectRatio="9/16"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                  />
                  {idx === 9 && (
                    <div className="col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-5 my-2">
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
            name: tag ? `Dark #${tag} iPhone Wallpapers | Haunted Wallpapers` : "Free Dark iPhone Wallpapers HD | Haunted Wallpapers",
            url: tag ? `${process.env.NEXT_PUBLIC_SITE_URL}/iphone?tag=${tag}` : `${process.env.NEXT_PUBLIC_SITE_URL}/iphone`,
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