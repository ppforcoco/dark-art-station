// app/mood/3am/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import Breadcrumbs from "@/components/Breadcrumbs";

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

export const metadata: Metadata = {
  title: "3AM Aesthetic Wallpapers | The Haunting Hour Digital Art",
  description: "Download haunting 3AM aesthetic wallpapers for your phone. Dark digital art for the sleepless, the doomscrollers, and those who hear the 3am whispers. Unique glitch and gothic horror vibes.",
  keywords: ["3am aesthetic", "dark wallpaper", "insomnia wallpaper", "glitch art", "neon goth", "digital artifacts", "3am wallpaper", "doomscrolling wallpaper", "3am vibes"],
  openGraph: {
    title: "3AM Aesthetic Wallpapers | The Haunting Hour Digital Art",
    description: "Download haunting 3AM aesthetic wallpapers for your phone. Dark digital art for the sleepless, the doomscrollers, and those who hear the 3am whispers.",
    url: `${SITE_URL}/mood/3am`,
    siteName: "Haunted Wallpapers",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "3AM Aesthetic Wallpapers | The Haunting Hour Digital Art",
    description: "Dark digital art for the sleepless, the doomscrollers, and those who hear the 3am whispers.",
  },
  alternates: { canonical: `${SITE_URL}/mood/3am` },
};

export default async function Mood3amPage() {
  const images = await db.image.findMany({
    where: {
      isAdult: false,
        isAvatar: false,
      tags: { hasSome: ["glitch", "glitching", "neon", "cyberpunk", "dark", "night", "moody", "insomnia", "3am", "void", "atmospheric"] },
    },
    orderBy: [{ viewCount: "desc" }, { createdAt: "desc" }],
    take: 48,
    select: { id: true, slug: true, title: true, r2Key: true, deviceType: true, collection: { select: { slug: true } } },
  });

  return (
    <>
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Mood", href: "/mood" },
        { label: "3AM" },
      ]} />

      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px clamp(16px, 5vw, 60px) 80px" }}>

        <style>{`
          .mood-img { transition: transform 0.3s ease; }
          .mood-img:hover { transform: scale(1.04); }
        `}</style>
        {/* Hero */}
        <div style={{ marginBottom: "48px", borderLeft: "3px solid #00d4aa", paddingLeft: "24px" }}>
          <p style={{ fontFamily: "var(--font-space, monospace)", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#00d4aa", marginBottom: "12px" }}>
            Mood / 3AM
          </p>
          <h1 style={{ fontFamily: "var(--font-cinzel, serif)", fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "rgba(232,228,220,0.95)", lineHeight: 1.15, marginBottom: "16px" }}>
            The Witching Hour Static.
          </h1>
          <p style={{ fontFamily: "var(--font-space, monospace)", fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(232,228,220,0.35)" }}>
            {images.length} wallpapers for the sleepless
          </p>
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px", marginBottom: "80px" }}>
          {images.map((img) => {
            const href = img.deviceType
              ? `/${img.deviceType.toLowerCase()}/${img.slug}`
              : img.collection?.slug
                ? `/shop/${img.collection.slug}/${img.slug}`
                : "/obsessions";
            return (
            <Link key={img.id} href={href} style={{ display: "block", textDecoration: "none" }}>
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
            );
          })}
        </div>

        {/* SEO Description */}
        <div dangerouslySetInnerHTML={{ __html: `
          <div style="border:1px solid rgba(0,212,170,0.25);background:rgba(0,212,170,0.04);padding:32px 36px;max-width:780px;line-height:1.9;">
            <p style="font-family:var(--font-space,monospace);font-size:0.6rem;letter-spacing:0.2em;text-transform:uppercase;color:#00d4aa;margin-bottom:20px;">About This Collection</p>
            <p style="color:rgba(232,228,220,0.8);font-size:0.95rem;margin-bottom:16px;">It is always 3 AM in here. This collection is not just a wallpaper; it is the visual representation of the static that fills your head when the world is asleep. For the nocturnal souls who scroll when the rest of the world is silent, these designs capture the eerie glow of a phone screen in a dark room.</p>
            <p style="color:rgba(232,228,220,0.8);font-size:0.95rem;margin-bottom:16px;">We blend glitch art with shadowy textures to create digital artifacts that feel alive. The colors are cold — deep violets, electric neons, and absolute black — designed to save your battery while draining your sanity. These are high-contrast, 4K wallpapers for the restless. Whether you are chasing a hyperpop aesthetic or a dark grunge look, the 3 AM hour binds us all.</p>
            <p style="font-family:var(--font-space,monospace);font-size:0.65rem;letter-spacing:0.12em;color:rgba(232,228,220,0.3);margin-top:20px;">3am aesthetic &nbsp;·&nbsp; dark wallpaper &nbsp;·&nbsp; insomnia wallpaper &nbsp;·&nbsp; glitch art &nbsp;·&nbsp; neon goth &nbsp;·&nbsp; digital artifacts</p>
          </div>
        ` }} />

      </main>
    </>
  );
}