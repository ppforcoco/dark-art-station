// app/android/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { db, getPageContent } from "@/lib/db";
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
    ? `Dark #${tag} Wallpapers for Android & iPhone${pageLabel} | HAUNTED WALLPAPERS`
    : `Dark Android Wallpapers Free Download (iPhone & Android)${pageLabel} | HAUNTED WALLPAPERS`;

  const description = tag
    ? `Browse free dark fantasy Android and iPhone wallpapers tagged #${tag}. Download instantly, no account required.`
    : "Free dark fantasy wallpapers for Android and iPhone. Portrait 9:16 optimised. New drops daily. No account required.";

  const canonical = tag ? `${siteUrl}/android?tag=${tag}` : `${siteUrl}/android`;

  return {
    title,
    description,
    // ✅ FIX: removed "HD android wallpaper" — replaced with "hd android wallpaper" (accurate)
    keywords: ["android wallpaper", "dark wallpaper android", "hd android wallpaper", "free android wallpaper", tag ?? "dark", "dark fantasy"].filter(Boolean),
    openGraph: { title, description, url: canonical, siteName: "HAUNTED WALLPAPERS", type: "website" },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical },
  };
}

export default async function AndroidPage({ searchParams }: PageProps) {
  const { tag, page: rawPage } = await searchParams;
  const page = Math.max(1, parseInt(rawPage ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const where = {
    collectionId: null,
    isAdult: false, // ✅ FIX: hide adult/mature images from public listing
    deviceType: "ANDROID" as const,
    ...(tag ? { tags: { has: tag } } : {}),
  };

  const [images, total, rankedTags, pageContent] = await Promise.all([
    db.image.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: { id: true, slug: true, title: true, r2Key: true, viewCount: true, tags: true, isAdult: true },
      take: PAGE_SIZE,
      skip,
    }),
    db.image.count({ where }),
    getRankedTags("ANDROID").then(t => t.slice(0, 10)),
    getPageContent("android"),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const baseUrl    = tag ? `/android?tag=${encodeURIComponent(tag)}` : "/android";

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>

      <Breadcrumbs items={[
        { label: "Home",    href: "/"        },
        { label: "Android", href: "/android" },
        ...(tag ? [{ label: `#${tag}` }] : []),
      ]} />

      <section className="max-w-7xl mx-auto px-6 md:px-[60px] pt-10 pb-8">
        <span className="font-mono text-[0.6rem] tracking-[0.25em] uppercase text-[#c0001a] block mb-3">
          Free Android Wallpapers
        </span>
        <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight mb-4">
          {tag ? (
            <>Dark <span className="text-[#c9a84c] italic">#{tag}</span> Wallpapers for Android</>
          ) : (
            <>Free Dark Android <span className="text-[#c9a84c] italic">Wallpapers</span></>
          )}
          {page > 1 && <span className="text-[#4a445a] text-2xl"> — Page {page}</span>}
        </h1>
        <p className="font-body text-[1rem] text-[#8a8099] italic mb-8 max-w-xl">
          Portrait 9:16 · HD resolution · Instant download · No account required
        </p>

        {!tag && (
          <div className="device-page-intro">
            {pageContent?.body
              ? <div dangerouslySetInnerHTML={{ __html: pageContent.body }} />
              : <>
                  <p>
                    All Android wallpapers here are portrait 9:16 format, sized for modern flagship
                    screens including Samsung Galaxy, Google Pixel, OnePlus, and Xiaomi devices.
                    Images are generated at HD resolution — no visible compression.
                    AMOLED-optimised: near-black backgrounds let your OLED screen turn pixels completely
                    off, extending battery life while looking dramatically better than LCD-era wallpapers.
                  </p>
                  <p>
                    Download is instant — tap any image, tap download, and it saves directly to your
                    gallery. Set it from your gallery app or from Settings → Wallpaper. No account,
                    no watermarks, no limits.
                  </p>
                  <div className="device-page-guide-link">
                    <span>Need help setting it up?</span>
                    <a href="/blog/the-dark-aesthetic-a-complete-guide-to-customizing-your-devices">Read our wallpaper guide →</a>
                  </div>
                </>}
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
                    href={`/android/${img.slug}`}
                    src={getPublicUrl(img.r2Key)}
                    alt={`${img.title} — free dark Android wallpaper HD`}
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
            // ✅ FIX: removed "4K" from schema name — replaced with "HD"
            name: tag ? `Dark #${tag} Android Wallpapers | Haunted Wallpapers` : "Free Dark Android Wallpapers HD | Haunted Wallpapers",
            url: tag ? `${process.env.NEXT_PUBLIC_SITE_URL}/android?tag=${tag}` : `${process.env.NEXT_PUBLIC_SITE_URL}/android`,
            numberOfItems: total,
            itemListElement: images.map((img, i) => ({
              "@type": "ListItem",
              position: skip + i + 1,
              url: `${process.env.NEXT_PUBLIC_SITE_URL}/android/${img.slug}`,
              name: img.title,
              image: getPublicUrl(img.r2Key),
            })),
          }),
        }}
      />
    </main>
  );
}