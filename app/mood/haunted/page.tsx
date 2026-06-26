// app/mood/haunted/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import Breadcrumbs from "@/components/Breadcrumbs";

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

export const metadata: Metadata = {
  title: "Haunted Wallpapers | Ghostly & Paranormal Aesthetic Backgrounds",
  description: "Get lost in the static with our Haunted Wallpaper collection. A mix of ghostly figures, abandoned mansions, and cursed digital art. Perfect for fans of horror aesthetics and liminal spaces.",
  keywords: ["haunted wallpaper", "liminal space", "ghost aesthetic", "horror wallpaper", "paranormal art", "abandoned places", "analog horror", "ghostly aesthetic", "eerie backgrounds"],
  openGraph: {
    title: "Haunted Wallpapers | Ghostly & Paranormal Aesthetic Backgrounds",
    description: "Ghostly figures, abandoned mansions, and cursed digital art. Perfect for fans of horror aesthetics and liminal spaces.",
    url: `${SITE_URL}/mood/haunted`,
    siteName: "Haunted Wallpapers",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Haunted Wallpapers | Ghostly & Paranormal Aesthetic Backgrounds",
    description: "Ghostly figures, abandoned mansions, and cursed digital art. Perfect for fans of horror aesthetics and liminal spaces.",
  },
  alternates: { canonical: `${SITE_URL}/mood/haunted` },
};

export default async function MoodHauntedPage() {
  const images = await db.image.findMany({
    where: {
      isAdult: false,
      tags: { hasSome: ["haunted", "ghost", "spirit", "gothic", "horror", "paranormal", "Victorian", "abandoned", "specter", "wraith", "apparition", "creepy"] },
    },
    orderBy: [{ viewCount: "desc" }, { createdAt: "desc" }],
    take: 48,
    select: { id: true, slug: true, title: true, r2Key: true, deviceType: true },
  });

  return (
    <>
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Mood", href: "/mood" },
        { label: "Haunted" },
      ]} />

      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px clamp(16px, 5vw, 60px) 80px" }}>

        {/* Hero */}
        <div style={{ marginBottom: "48px", borderLeft: "3px solid #d4a847", paddingLeft: "24px" }}>
          <p style={{ fontFamily: "var(--font-space, monospace)", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#d4a847", marginBottom: "12px" }}>
            Mood / Haunted
          </p>
          <h1 style={{ fontFamily: "var(--font-cinzel, serif)", fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "rgba(232,228,220,0.95)", lineHeight: 1.15, marginBottom: "16px" }}>
            There is a Ghost in the Machine.
          </h1>
          <p style={{ fontFamily: "var(--font-space, monospace)", fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(232,228,220,0.35)" }}>
            {images.length} wallpapers for those who feel it too
          </p>
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px", marginBottom: "80px" }}>
          {images.map((img) => (
            <Link key={img.id} href={`/wallpaper/${img.slug}`} style={{ display: "block", textDecoration: "none" }}>
              <div style={{ aspectRatio: img.deviceType === "PC" ? "16/9" : "9/16", overflow: "hidden", background: "#0a0812" }}>
                <img
                  src={getPublicUrl(img.r2Key)}
                  alt={img.title}
                  loading="lazy"
                  decoding="async"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.3s ease" }}
                  onMouseOver={e => (e.currentTarget.style.transform = "scale(1.04)")}
                  onMouseOut={e => (e.currentTarget.style.transform = "scale(1)")}
                />
              </div>
              <p style={{ fontFamily: "var(--font-space, monospace)", fontSize: "0.6rem", color: "rgba(232,228,220,0.45)", marginTop: "6px", letterSpacing: "0.04em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {img.title}
              </p>
            </Link>
          ))}
        </div>

        {/* SEO Description */}
        <div dangerouslySetInnerHTML={{ __html: `
          <div style="border:1px solid rgba(212,168,71,0.25);background:rgba(212,168,71,0.04);padding:32px 36px;max-width:780px;line-height:1.9;">
            <p style="font-family:var(--font-space,monospace);font-size:0.6rem;letter-spacing:0.2em;text-transform:uppercase;color:#d4a847;margin-bottom:20px;">About This Collection</p>
            <p style="color:rgba(232,228,220,0.8);font-size:0.95rem;margin-bottom:16px;">This collection is haunted. Not by jump scares, but by the profound melancholy of empty halls and forgotten memories. We specialize in liminal horror — the feeling of being stuck in a space that is almost familiar, but not quite right.</p>
            <p style="color:rgba(232,228,220,0.8);font-size:0.95rem;margin-bottom:16px;">From the fog rolling over a crumbling Victorian manor to the grainy texture of 90s analog horror, these wallpapers are designed to bring a chill to your screen. The sepia tones, the white noise, and the blurred edges create a wearable ghost story. If you are a fan of the occult, the paranormal, or just need a background that tells a story of sorrow, these eerie backgrounds are for you.</p>
            <p style="font-family:var(--font-space,monospace);font-size:0.65rem;letter-spacing:0.12em;color:rgba(232,228,220,0.3);margin-top:20px;">Haunted wallpaper &nbsp;·&nbsp; liminal space &nbsp;·&nbsp; ghost aesthetic &nbsp;·&nbsp; horror wallpaper &nbsp;·&nbsp; paranormal art &nbsp;·&nbsp; abandoned places &nbsp;·&nbsp; analog horror</p>
          </div>
        ` }} />

      </main>
    </>
  );
}