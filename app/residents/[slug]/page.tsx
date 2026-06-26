// app/residents/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import Breadcrumbs from "@/components/Breadcrumbs";

export const revalidate = 3600;
export const dynamicParams = true;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const resident = await db.resident.findUnique({
    where: { slug, isPublished: true },
    select: { name: true, tagline: true, portraitKey: true },
  });
  if (!resident) return { title: "Not Found | Haunted Wallpapers" };

  const ogImage = resident.portraitKey ? getPublicUrl(resident.portraitKey) : undefined;

  return {
    title: `${resident.name} | Haunted Wallpapers Resident`,
    description: resident.tagline,
    openGraph: {
      title: `${resident.name} | Haunted Wallpapers`,
      description: resident.tagline,
      url: `${SITE_URL}/residents/${slug}`,
      siteName: "Haunted Wallpapers",
      type: "website",
      ...(ogImage ? { images: [{ url: ogImage, width: 1080, height: 1920, alt: resident.name }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${resident.name} | Haunted Wallpapers`,
      description: resident.tagline,
    },
    alternates: { canonical: `${SITE_URL}/residents/${slug}` },
  };
}

export default async function ResidentPage({ params }: PageProps) {
  const { slug } = await params;

  const resident = await db.resident.findUnique({
    where: { slug, isPublished: true },
  });

  if (!resident) notFound();

  // Fetch wallpapers tagged with this resident
  const wallpapers = await db.image.findMany({
    where: {
      isAdult: false,
      tags: { has: `resident:${slug}` },
    },
    orderBy: [{ viewCount: "desc" }, { createdAt: "desc" }],
    take: 48,
    select: { id: true, slug: true, title: true, r2Key: true, deviceType: true },
  });

  const portraitUrl = resident.portraitKey ? getPublicUrl(resident.portraitKey) : null;

  return (
    <>
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Residents", href: "/residents" },
        { label: resident.name },
      ]} />

      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 clamp(16px, 5vw, 60px) 60px" }}>
        <style>{`
          .res-hero { display: grid; grid-template-columns: 1fr; gap: 28px; padding-top: 32px; margin-bottom: 48px; }
          .res-portrait { width: 160px; aspect-ratio: 9/16; overflow: hidden; background: #0a0812; border: 1px solid rgba(157,78,221,0.2); position: relative; margin: 0 auto; }
          .res-identity h1 { font-size: clamp(1.6rem, 6vw, 3.5rem); }
          .res-identity .tagline { font-size: 0.78rem; }
          .res-identity .story { font-size: 0.88rem; }
          @media(min-width: 640px) {
            .res-hero { grid-template-columns: 200px 1fr; align-items: flex-start; gap: 36px; }
            .res-portrait { width: 100%; margin: 0; }
          }
          @media(min-width: 900px) {
            .res-hero { grid-template-columns: clamp(220px, 26vw, 320px) 1fr; gap: clamp(32px, 5vw, 60px); align-items: flex-end; }
            .res-identity h1 { font-size: clamp(2rem, 4vw, 3.5rem); }
            .res-identity .tagline { font-size: 0.9rem; }
            .res-identity .story { font-size: 0.92rem; }
          }
          .res-wp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px; }
          @media(min-width: 640px) { .res-wp-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 14px; } }
          .res-wp-img { transition: transform 0.3s ease; }
          .res-wp-img:hover { transform: scale(1.04); }
        `}</style>

        {/* Hero — portrait + identity */}
        <div className="res-hero">
          {/* Portrait */}
          {portraitUrl && (
            <div className="res-portrait">
              <img
                src={portraitUrl}
                alt={resident.name}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                loading="eager"
                decoding="async"
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 60%, rgba(5,3,12,0.4) 100%)" }} />
            </div>
          )}

          {/* Identity */}
          <div className="res-identity" style={{ paddingBottom: "8px" }}>
            <p style={{ fontFamily: "var(--font-space, monospace)", fontSize: "0.58rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "#9d4edd", marginBottom: "12px" }}>
              Resident of the Haunted Town
            </p>
            <h1 style={{ fontFamily: "var(--font-cinzel, serif)", color: "rgba(232,228,220,0.97)", lineHeight: 1.1, marginBottom: "16px" }}>
              {resident.name}
            </h1>
            <p className="tagline" style={{ fontFamily: "var(--font-space, monospace)", color: "rgba(157,78,221,0.85)", letterSpacing: "0.07em", lineHeight: 1.7, marginBottom: "24px" }}>
              {resident.tagline}
            </p>

            {/* Story */}
            {resident.story && (
              <div
                className="story"
                style={{ color: "rgba(232,228,220,0.72)", lineHeight: 1.9, maxWidth: "560px" }}
                dangerouslySetInnerHTML={{ __html: resident.story }}
              />
            )}
          </div>
        </div>

        {/* Personality */}
        {resident.personality && (
          <div style={{ marginBottom: "64px", borderLeft: "3px solid rgba(157,78,221,0.35)", paddingLeft: "28px", maxWidth: "780px" }}>
            <p style={{ fontFamily: "var(--font-space, monospace)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#9d4edd", marginBottom: "20px" }}>
              Personality
            </p>
            <div
              style={{ color: "rgba(232,228,220,0.65)", lineHeight: 1.85, fontSize: "0.9rem" }}
              dangerouslySetInnerHTML={{ __html: resident.personality }}
            />
          </div>
        )}

        {/* Wallpapers */}
        {wallpapers.length > 0 && (
          <section style={{ marginBottom: "80px" }}>
            <div style={{ marginBottom: "28px" }}>
              <p style={{ fontFamily: "var(--font-space, monospace)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#9d4edd", marginBottom: "10px" }}>
                Their Wallpapers
              </p>
              <p style={{ fontFamily: "var(--font-space, monospace)", fontSize: "0.65rem", color: "rgba(232,228,220,0.35)", letterSpacing: "0.08em" }}>
                {wallpapers.length} wallpapers from {resident.name}&apos;s world
              </p>
            </div>
            <div className="res-wp-grid">
              {wallpapers.map((img) => (
                <Link key={img.id} href={img.deviceType === "PC" ? `/pc/${img.slug}` : `/iphone/${img.slug}`} style={{ display: "block", textDecoration: "none" }}>
                  <div style={{ aspectRatio: img.deviceType === "PC" ? "16/9" : "9/16", overflow: "hidden", background: "#0a0812" }}>
                    <img
                      src={getPublicUrl(img.r2Key)}
                      alt={img.title}
                      loading="lazy"
                      decoding="async"
                      className="res-wp-img"
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  </div>
                  <p style={{ fontFamily: "var(--font-space, monospace)", fontSize: "0.58rem", color: "rgba(232,228,220,0.4)", marginTop: "6px", letterSpacing: "0.04em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {img.title}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}



      </main>
    </>
  );
}