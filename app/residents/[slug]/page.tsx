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

      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 clamp(16px, 5vw, 60px) 80px" }}>

        {/* Hero — portrait + identity */}
        <div style={{
          display: "grid",
          gridTemplateColumns: portraitUrl ? "clamp(180px, 28vw, 340px) 1fr" : "1fr",
          gap: "clamp(24px, 5vw, 60px)",
          alignItems: "flex-end",
          marginBottom: "64px",
          paddingTop: "40px",
        }}>
          {/* Portrait */}
          {portraitUrl && (
            <div style={{ aspectRatio: "9/16", overflow: "hidden", background: "#0a0812", border: "1px solid rgba(157,78,221,0.2)", position: "relative" }}>
              <img
                src={portraitUrl}
                alt={resident.name}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                loading="eager"
                decoding="async"
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 60%, rgba(5,3,12,0.5) 100%)" }} />
            </div>
          )}

          {/* Identity */}
          <div style={{ paddingBottom: "8px" }}>
            <p style={{ fontFamily: "var(--font-space, monospace)", fontSize: "0.6rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "#9d4edd", marginBottom: "16px" }}>
              Resident of the Haunted Town
            </p>
            <h1 style={{ fontFamily: "var(--font-cinzel, serif)", fontSize: "clamp(2.2rem, 5vw, 3.8rem)", color: "rgba(232,228,220,0.97)", lineHeight: 1.1, marginBottom: "20px" }}>
              {resident.name}
            </h1>
            <p style={{ fontFamily: "var(--font-space, monospace)", fontSize: "clamp(0.78rem, 1.5vw, 0.95rem)", color: "rgba(157,78,221,0.85)", letterSpacing: "0.08em", lineHeight: 1.7, marginBottom: "32px", maxWidth: "520px" }}>
              {resident.tagline}
            </p>

            {/* Story */}
            {resident.story && (
              <div
                style={{ maxWidth: "580px", color: "rgba(232,228,220,0.72)", lineHeight: 1.9, fontSize: "0.92rem" }}
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "14px" }}>
              <style>{`
                .res-wp-img { transition: transform 0.3s ease; }
                .res-wp-img:hover { transform: scale(1.04); }
              `}</style>
              {wallpapers.map((img) => (
                <Link key={img.id} href={`/wallpaper/${img.slug}`} style={{ display: "block", textDecoration: "none" }}>
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

        {/* Lore footer */}
        <div style={{ borderTop: "1px solid rgba(157,78,221,0.15)", paddingTop: "48px", maxWidth: "780px" }}>
          <p style={{ fontFamily: "var(--font-space, monospace)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#9d4edd", marginBottom: "24px" }}>
            About This Place
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {[
              "The haunted town does not have citizens. It has residents.",
              "They do not remember arriving. They only remember the fog, the flicker, the feeling of being watched from every window. Some came looking for the town. Some stumbled upon it. Some were called. All of them stayed.",
              "The residents are not a community in the usual sense. They do not gather. They do not speak. They exist in the spaces between — in the static of old screens, in the reflection of empty glass, in the silence that follows a sound that was never made.",
              "This page is for them. For the ones who feel like they have always belonged to the haunted town. For the ones who have never left, even when they tried.",
            ].map((para, i) => (
              <p key={i} style={{
                color: i === 0 ? "rgba(232,228,220,0.85)" : "rgba(232,228,220,0.55)",
                fontSize: i === 0 ? "1rem" : "0.88rem",
                lineHeight: 1.85,
                fontStyle: i === 0 ? "italic" : "normal",
                fontFamily: i === 0 ? "var(--font-cinzel, serif)" : "inherit",
              }}>
                {para}
              </p>
            ))}
          </div>
          <div style={{ marginTop: "40px" }}>
            <Link href="/residents" style={{ fontFamily: "var(--font-space, monospace)", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(157,78,221,0.7)", textDecoration: "none", border: "1px solid rgba(157,78,221,0.25)", padding: "10px 20px" }}>
              ← All Residents
            </Link>
          </div>
        </div>

      </main>
    </>
  );
}