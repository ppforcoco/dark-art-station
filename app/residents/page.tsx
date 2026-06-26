// app/residents/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import Breadcrumbs from "@/components/Breadcrumbs";

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

export const metadata: Metadata = {
  title: "The Residents | Characters of Haunted Wallpapers",
  description: "Meet the residents of the haunted town. They do not remember arriving. They only remember the fog, the flicker, the feeling of being watched from every window.",
  openGraph: {
    title: "The Residents | Characters of Haunted Wallpapers",
    description: "They do not remember arriving. They only remember the fog.",
    url: `${SITE_URL}/residents`,
    siteName: "Haunted Wallpapers",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Residents | Characters of Haunted Wallpapers",
    description: "They do not remember arriving. They only remember the fog.",
  },
  alternates: { canonical: `${SITE_URL}/residents` },
};

export default async function ResidentsPage() {
  const residents = await db.resident.findMany({
    where: { isPublished: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: { slug: true, name: true, tagline: true, portraitKey: true },
  });

  return (
    <>
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Residents" },
      ]} />

      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px clamp(16px, 5vw, 60px) 80px" }}>

        {/* Hero */}
        <div style={{ marginBottom: "64px", borderLeft: "3px solid #9d4edd", paddingLeft: "28px" }}>
          <p style={{ fontFamily: "var(--font-space, monospace)", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#9d4edd", marginBottom: "14px" }}>
            Characters of the Town
          </p>
          <h1 style={{ fontFamily: "var(--font-cinzel, serif)", fontSize: "clamp(2.4rem, 6vw, 4rem)", color: "rgba(232,228,220,0.95)", lineHeight: 1.1, marginBottom: "20px" }}>
            The Residents
          </h1>
          <p style={{ fontFamily: "var(--font-space, monospace)", fontSize: "0.65rem", letterSpacing: "0.12em", color: "rgba(232,228,220,0.35)" }}>
            {residents.length} known residents · more emerge each night
          </p>
        </div>

        {/* Grid */}
        {residents.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ fontFamily: "var(--font-space, monospace)", fontSize: "0.8rem", color: "rgba(232,228,220,0.3)", letterSpacing: "0.15em" }}>
              The town is still forming its residents…
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "24px", marginBottom: "80px" }}>
            {residents.map((r) => (
              <Link
                key={r.slug}
                href={`/residents/${r.slug}`}
                style={{ display: "block", textDecoration: "none" }}
              >
                <div style={{ aspectRatio: "9/16", overflow: "hidden", background: "#0a0812", border: "1px solid rgba(157,78,221,0.2)", marginBottom: "12px", position: "relative" }}>
                  <style>{`
                    .res-img-${r.slug.replace(/-/g, "_")} { transition: transform 0.4s ease; }
                    .res-img-${r.slug.replace(/-/g, "_")}:hover { transform: scale(1.04); }
                  `}</style>
                  {r.portraitKey ? (
                    <img
                      src={getPublicUrl(r.portraitKey)}
                      alt={r.name}
                      loading="lazy"
                      decoding="async"
                      className={`res-img-${r.slug.replace(/-/g, "_")}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "rgba(157,78,221,0.25)", fontSize: "3rem" }}>👤</span>
                    </div>
                  )}
                  {/* Gradient overlay */}
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(5,3,12,0.85) 0%, transparent 50%)" }} />
                  {/* Name on card */}
                  <div style={{ position: "absolute", bottom: "14px", left: "14px", right: "14px" }}>
                    <p style={{ fontFamily: "var(--font-cinzel, serif)", fontSize: "0.85rem", color: "rgba(232,228,220,0.95)", lineHeight: 1.3, marginBottom: "4px" }}>{r.name}</p>
                    <p style={{ fontFamily: "var(--font-space, monospace)", fontSize: "0.55rem", color: "rgba(157,78,221,0.8)", letterSpacing: "0.08em", textTransform: "uppercase", lineHeight: 1.5 }}>{r.tagline}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Lore block */}
        <div style={{ maxWidth: "780px", borderLeft: "3px solid rgba(157,78,221,0.4)", paddingLeft: "32px", margin: "0 auto 80px" }}>
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
                color: i === 0
                  ? "rgba(232,228,220,0.85)"
                  : "rgba(232,228,220,0.6)",
                fontSize: i === 0 ? "1.05rem" : "0.92rem",
                lineHeight: 1.85,
                fontStyle: i === 0 ? "italic" : "normal",
                fontFamily: i === 0 ? "var(--font-cinzel, serif)" : "inherit",
              }}>
                {para}
              </p>
            ))}
          </div>
        </div>

      </main>
    </>
  );
}