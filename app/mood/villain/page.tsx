// app/mood/villain/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import Breadcrumbs from "@/components/Breadcrumbs";

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

export const metadata: Metadata = {
  title: "Villain Aesthetic Wallpapers | Embrace Your Dark Feminine & Anti-Hero Arc",
  description: "Unlock your dark side with villain aesthetic wallpapers. High-definition art for the anti-hero. Perfect dark feminine backgrounds for your phone. Download the vengeance.",
  keywords: ["villain wallpaper", "dark feminine aesthetic", "anti-hero", "gothic art", "dark academia villain", "femme fatale", "villain arc", "villain aesthetic wallpaper", "dark feminine wallpaper"],
  openGraph: {
    title: "Villain Aesthetic Wallpapers | Embrace Your Dark Feminine & Anti-Hero Arc",
    description: "Unlock your dark side with villain aesthetic wallpapers. High-definition art for the anti-hero. Perfect dark feminine backgrounds for your phone.",
    url: `${SITE_URL}/mood/villain`,
    siteName: "Haunted Wallpapers",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Villain Aesthetic Wallpapers | Embrace Your Dark Feminine & Anti-Hero Arc",
    description: "Unlock your dark side with villain aesthetic wallpapers. High-definition art for the anti-hero.",
  },
  alternates: { canonical: `${SITE_URL}/mood/villain` },
};

export default async function MoodVillainPage() {
  const images = await db.image.findMany({
    where: {
      isAdult: false,
      tags: { hasSome: ["villain", "sinister", "evil", "dark-fantasy", "powerful", "crimson", "mask", "crown", "gothic", "aggressive", "demon"] },
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
        { label: "Villain" },
      ]} />

      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px clamp(16px, 5vw, 60px) 80px" }}>

        <style>{`
          .mood-img { transition: transform 0.3s ease; }
          .mood-img:hover { transform: scale(1.04); }
        `}</style>
        {/* Hero */}
        <div style={{ marginBottom: "48px", borderLeft: "3px solid #c0001a", paddingLeft: "24px" }}>
          <p style={{ fontFamily: "var(--font-space, monospace)", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#c0001a", marginBottom: "12px" }}>
            Mood / Villain
          </p>
          <h1 style={{ fontFamily: "var(--font-cinzel, serif)", fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "rgba(232,228,220,0.95)", lineHeight: 1.15, marginBottom: "16px" }}>
            Your Villain Arc Starts Here.
          </h1>
          <p style={{ fontFamily: "var(--font-space, monospace)", fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(232,228,220,0.35)" }}>
            {images.length} wallpapers for the anti-hero
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
          <div style="border:1px solid rgba(192,0,26,0.3);background:rgba(192,0,26,0.04);padding:32px 36px;max-width:780px;line-height:1.9;">
            <p style="font-family:var(--font-space,monospace);font-size:0.6rem;letter-spacing:0.2em;text-transform:uppercase;color:#c0001a;margin-bottom:20px;">About This Collection</p>
            <p style="color:rgba(232,228,220,0.8);font-size:0.95rem;margin-bottom:16px;">We are the architects of our own downfall. This page is dedicated to the anti-heroes, the dark femmes fatales, and the morally grey characters who refuse to be the sidekick. Our villain wallpapers are crafted with a haunting elegance — think blood-red silk against shattered glass, or the silhouette of a crown tilted just wrong.</p>
            <p style="color:rgba(232,228,220,0.8);font-size:0.95rem;margin-bottom:16px;">These are not just "evil" wallpapers; they are complex. They feature intricate linework, sharp geometric angles, and portraits that stare right through you. If you are looking to embody the confidence of a character who takes what they want, this aesthetic is your armor. The palette is rich with crimson, obsidian, and deep emerald, ensuring your lock screen exudes power.</p>
            <p style="font-family:var(--font-space,monospace);font-size:0.65rem;letter-spacing:0.12em;color:rgba(232,228,220,0.3);margin-top:20px;">Villain wallpaper &nbsp;·&nbsp; dark feminine aesthetic &nbsp;·&nbsp; anti-hero &nbsp;·&nbsp; gothic art &nbsp;·&nbsp; dark academia villain &nbsp;·&nbsp; femme fatale</p>
          </div>
        ` }} />

      </main>
    </>
  );
}