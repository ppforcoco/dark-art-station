// app/pc/page.tsx
import type { Metadata } from "next";
import { db, getPageContent } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
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
    ? `Dark #${tag} Desktop Wallpapers for PC & iPhone${pageLabel} | HAUNTED WALLPAPERS`
    : `Dark Desktop Wallpapers Free Download (PC & iPhone)${pageLabel} | HAUNTED WALLPAPERS`;

  const description = tag
    ? `Browse free dark fantasy desktop wallpapers tagged #${tag}. Download instantly, no account required.`
    : "Free dark fantasy wallpapers for PC and desktop. Landscape 16:9 optimised. New drops daily. No account required.";

  const canonical = tag ? `${siteUrl}/pc?tag=${tag}` : `${siteUrl}/pc`;

  return {
    title,
    description,
    keywords: ["pc wallpaper", "desktop wallpaper dark", "hd desktop wallpaper", "free pc wallpaper", "16:9 wallpaper", tag ?? "dark", "dark fantasy"].filter(Boolean),
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

  const [images, total, pageContent] = await Promise.all([
    db.image.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: { id: true, slug: true, title: true, r2Key: true, viewCount: true, tags: true, isAdult: true },
      take: PAGE_SIZE,
      skip,
    }),
    db.image.count({ where }),
    getPageContent("pc"),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const baseUrl    = tag ? `/pc?tag=${encodeURIComponent(tag)}` : "/pc";

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>

      <Breadcrumbs items={[
        { label: "Home", href: "/"    },
        { label: "PC",   href: "/pc"  },
        ...(tag ? [{ label: `#${tag}` }] : []),
      ]} />

      <section className="max-w-7xl mx-auto px-6 md:px-[60px] pt-10 pb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight mb-6">
          {tag ? (
            <>Dark <span className="text-[#c9a84c] italic">#{tag}</span> Desktop Wallpapers for PC</>
          ) : (
            <>Free Dark PC <span className="text-[#c9a84c] italic">Wallpapers</span></>
          )}
          {page > 1 && <span className="text-[#4a445a] text-2xl"> — Page {page}</span>}
        </h1>

        {!tag && pageContent?.description && (
          <div
            className="image-description-html prose prose-invert max-w-none text-[var(--text-muted)] leading-relaxed mb-2"
            dangerouslySetInnerHTML={{ __html: pageContent.description }}
          />
        )}
      </section>

      <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN} width={728} height={90} />

      <section className="max-w-7xl mx-auto px-6 md:px-[60px] py-10">
        {images.length === 0 ? (
          <div className="hw-coming-soon">
            <div className="hw-coming-soon__sigil">✦ ☽ ✦</div>
            <div className="hw-coming-soon__bar" />
            <h2 className="hw-coming-soon__title">Coming Soon</h2>
            <p className="hw-coming-soon__sub">
              {tag ? `New wallpapers tagged #${tag} are on their way.` : "Dark art is brewing. Upload images from the admin panel to fill this page."}
            </p>
          </div>
        ) : (
          <>
            <p className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-[#4a445a] mb-6">
              — {total} wallpapers · page {page} of {totalPages}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((img, idx) => (
                <>
                  <DeviceImageCard
                    key={img.id}
                    href={`/pc/${img.slug}`}
                    src={getPublicUrl(img.r2Key)}
                    alt={`${img.title} — free dark PC desktop wallpaper`}
                    title={img.title}
                    tags={img.tags}
                    isAdult={img.isAdult}
                    priority={idx < 6}
                    aspectRatio="16/9"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
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
            name: tag ? `Dark #${tag} PC Wallpapers | Haunted Wallpapers` : "Free Dark Desktop Wallpapers HD | Haunted Wallpapers",
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