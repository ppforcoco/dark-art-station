// app/mood/quiet/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import Breadcrumbs from "@/components/Breadcrumbs";

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

export const metadata: Metadata = {
  title: "Quiet Aesthetic Wallpapers | Soft Gloom & Melancholic Digital Art",
  description: "Breathe in the silence with Quiet aesthetic wallpapers. Subdued tones, melancholic scenes, and soft gloom art for those who prefer the stillness. Aesthetic backgrounds for loners.",
  keywords: ["quiet wallpaper", "soft gloom", "melancholic aesthetic", "sad art", "muted wallpaper", "depression aesthetic", "loner wallpaper", "minimalist dark", "quiet aesthetic wallpaper"],
  openGraph: {
    title: "Quiet Aesthetic Wallpapers | Soft Gloom & Melancholic Digital Art",
    description: "Subdued tones, melancholic scenes, and soft gloom art for those who prefer the stillness.",
    url: `${SITE_URL}/mood/quiet`,
    siteName: "Haunted Wallpapers",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quiet Aesthetic Wallpapers | Soft Gloom & Melancholic Digital Art",
    description: "Subdued tones, melancholic scenes, and soft gloom art for those who prefer the stillness.",
  },
  alternates: { canonical: `${SITE_URL}/mood/quiet` },
};

export default async function MoodQuietPage() {
  const images = await db.image.findMany({
    where: {
      isAdult: false,
        isAvatar: false,
      tags: { hasSome: ["quiet", "minimal", "minimalist", "melancholy", "sad", "lonely", "fog", "mist", "rain", "calm", "silhouette", "moon", "isolated"] },
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
        { label: "Quiet" },
      ]} />

      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px clamp(16px, 5vw, 60px) 80px" }}>

        <style>{`
          .mood-img { transition: transform 0.3s ease; }
          .mood-img:hover { transform: scale(1.04); }
        `}</style>
        {/* Hero */}
        <div style={{ marginBottom: "48px", borderLeft: "3px solid #8888bb", paddingLeft: "24px" }}>
          <p style={{ fontFamily: "var(--font-space, monospace)", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#8888bb", marginBottom: "12px" }}>
            Mood / Quiet
          </p>
          <h1 style={{ fontFamily: "var(--font-cinzel, serif)", fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "rgba(232,228,220,0.95)", lineHeight: 1.15, marginBottom: "16px" }}>
            The Sound of Silence.
          </h1>
          <p style={{ fontFamily: "var(--font-space, monospace)", fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(232,228,220,0.35)" }}>
            {images.length} wallpapers for those who need the stillness
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
                  className="mood-img" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}                />
              </div>
              <p style={{ fontFamily: "var(--font-space, monospace)", fontSize: "0.6rem", color: "rgba(232,228,220,0.45)", marginTop: "6px", letterSpacing: "0.04em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {img.title}
              </p>
            </Link>
          ))}
        </div>

        {/* SEO Description */}
        <div dangerouslySetInnerHTML={{ __html: `
          <div style="border:1px solid rgba(136,136,187,0.25);background:rgba(136,136,187,0.04);padding:32px 36px;max-width:780px;line-height:1.9;">
            <p style="font-family:var(--font-space,monospace);font-size:0.6rem;letter-spacing:0.2em;text-transform:uppercase;color:#8888bb;margin-bottom:20px;">About This Collection</p>
            <p style="color:rgba(232,228,220,0.8);font-size:0.95rem;margin-bottom:16px;">Not every dark wallpaper needs to scream. Sometimes, the most haunting aesthetic is the one that barely whispers. This is the Quiet page — a collection dedicated to the soft gloom, the subtle sadness, and the beauty of isolation.</p>
            <p style="color:rgba(232,228,220,0.8);font-size:0.95rem;margin-bottom:16px;">We use muted palettes: foggy grays, washed-out blues, and misty greens. The imagery often features solitary figures, empty rain-soaked streets, and windows looking out into nothing. These backgrounds are for the introverts, the daydreamers, and those who find comfort in a melancholic atmosphere. It is the perfect aesthetic for a Sunday morning rainstorm. High-quality, minimalist, and deeply emotional.</p>
            <p style="font-family:var(--font-space,monospace);font-size:0.65rem;letter-spacing:0.12em;color:rgba(232,228,220,0.3);margin-top:20px;">Quiet wallpaper &nbsp;·&nbsp; soft gloom &nbsp;·&nbsp; melancholic aesthetic &nbsp;·&nbsp; sad art &nbsp;·&nbsp; muted wallpaper &nbsp;·&nbsp; loner wallpaper &nbsp;·&nbsp; minimalist dark</p>
          </div>
        ` }} />

      </main>
    </>
  );
}