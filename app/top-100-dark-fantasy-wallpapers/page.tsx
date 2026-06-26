// app/top-100-dark-fantasy-wallpapers/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import Breadcrumbs from "@/components/Breadcrumbs";

export const revalidate = 3600;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

export const metadata: Metadata = {
  title: "Top 100 Dark Fantasy Wallpapers | The Haunted Town Collection | Haunted Wallpapers",
  description: "100 dark fantasy wallpapers from the haunted town. Forgotten kingdoms, cursed forests, and ruins swallowed by fog. 4K backgrounds for the shadow-born.",
  keywords: ["dark fantasy wallpaper", "gothic fantasy", "haunted town aesthetic", "cursed kingdom art", "dark magic backgrounds", "ruined castle wallpaper", "4K fantasy art", "dark fantasy background", "gothic wallpaper", "cursed forest wallpaper"],
  openGraph: {
    title: "Top 100 Dark Fantasy Wallpapers | The Haunted Town Collection",
    description: "100 dark fantasy wallpapers. Forgotten kingdoms, cursed forests, ruins swallowed by fog. 4K backgrounds for the shadow-born.",
    url: `${SITE_URL}/top-100-dark-fantasy-wallpapers`,
    siteName: "Haunted Wallpapers",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Top 100 Dark Fantasy Wallpapers | Haunted Town Collection", description: "Forgotten kingdoms, cursed forests, and ruins swallowed by fog. 4K backgrounds for the shadow-born." },
  alternates: { canonical: `${SITE_URL}/top-100-dark-fantasy-wallpapers` },
};

export default async function Top100DarkFantasyPage() {
  const images = await db.image.findMany({
    where: {
      isAdult: false,
      OR: [
        { tags: { hasSome: ["dark-fantasy", "gothic", "cursed", "ruins", "fog", "castle", "haunted", "demon", "dragon", "mythic", "fantasy", "warrior", "witch", "eldritch", "ancient"] } },
        { title: { contains: "fantasy", mode: "insensitive" } },
        { title: { contains: "gothic", mode: "insensitive" } },
        { title: { contains: "cursed", mode: "insensitive" } },
        { title: { contains: "ruins", mode: "insensitive" } },
        { title: { contains: "dark", mode: "insensitive" } },
        { description: { contains: "dark fantasy", mode: "insensitive" } },
        { description: { contains: "gothic", mode: "insensitive" } },
      ],
    },
    orderBy: [{ viewCount: "desc" }, { createdAt: "desc" }],
    take: 100,
    select: { id: true, slug: true, title: true, description: true, r2Key: true, deviceType: true },
  });

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Top 100 Dark Fantasy Wallpapers" }]} />
      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px clamp(16px,5vw,60px) 80px" }}>

        {/* Hero */}
        <div style={{ marginBottom: "48px", borderLeft: "3px solid #c9a84c", paddingLeft: "24px" }}>
          <p style={{ fontFamily: "var(--font-space,monospace)", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#c9a84c", marginBottom: "12px" }}>The Haunted Town Collection</p>
          <h1 style={{ fontFamily: "var(--font-cinzel,serif)", fontSize: "clamp(1.8rem,4vw,3rem)", color: "rgba(232,228,220,0.95)", lineHeight: 1.15, marginBottom: "16px" }}>
            Top 100 Dark Fantasy Wallpapers
          </h1>
          <p style={{ fontFamily: "var(--font-cormorant,serif)", fontSize: "1.1rem", fontStyle: "italic", color: "rgba(232,228,220,0.55)", marginBottom: "16px", maxWidth: "600px" }}>
            The Town That Doesn't Appear on Any Map.
          </p>
          <p style={{ fontFamily: "var(--font-space,monospace)", fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(232,228,220,0.3)" }}>
            {images.length} wallpapers · Forgotten kingdoms · Cursed forests · Free 4K
          </p>
        </div>

        {/* Intro */}
        <div style={{ maxWidth: "720px", marginBottom: "48px", borderLeft: "1px solid rgba(201,168,76,0.2)", paddingLeft: "20px" }}>
          <p style={{ color: "rgba(232,228,220,0.7)", fontSize: "0.9rem", lineHeight: 1.9, marginBottom: "12px" }}>
            Drive long enough down a road that doesn't feel right — where the trees lean in too close and the fog sits too still — and you will find it. The haunted town. No signs announce it. No lights guide the way. It just... appears. And once seen, it stays with you.
          </p>
          <p style={{ color: "rgba(232,228,220,0.7)", fontSize: "0.9rem", lineHeight: 1.9 }}>
            That is the feeling behind our Top 100 Dark Fantasy Wallpapers. Every piece comes from that place between worlds — where the air is heavy with forgotten things, where the light never quite reaches the ground, and where the silence has weight.
          </p>
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "16px", marginBottom: "80px" }}>
          {images.map((img) => {
            const shortDesc = img.description ? img.description.replace(/<[^>]*>/g, "").slice(0, 72).trim() : null;
            return (
              <Link key={img.id} href={`/wallpaper/${img.slug}`} style={{ display: "block", textDecoration: "none" }}>
                <div style={{ aspectRatio: img.deviceType === "PC" ? "16/9" : "9/16", overflow: "hidden", background: "#0a0812" }}>
                  <img src={getPublicUrl(img.r2Key)} alt={img.title} loading="lazy" decoding="async"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.3s ease" }}
                </div>
                <p style={{ fontFamily: "var(--font-space,monospace)", fontSize: "0.58rem", color: "rgba(232,228,220,0.6)", marginTop: "5px", letterSpacing: "0.03em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{img.title}</p>
                {shortDesc && <p style={{ fontFamily: "var(--font-space,monospace)", fontSize: "0.52rem", color: "rgba(232,228,220,0.3)", marginTop: "2px", letterSpacing: "0.02em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{shortDesc}</p>}
              </Link>
            );
          })}
        </div>

        {/* SEO Description */}
        <div style={{ maxWidth: "780px", marginBottom: "60px" }}>
          <div style={{ borderLeft: "3px solid rgba(201,168,76,0.25)", paddingLeft: "24px", marginBottom: "40px" }}>
            <p style={{ fontFamily: "var(--font-space,monospace)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(201,168,76,0.5)", marginBottom: "20px" }}>About This Collection</p>
            <p style={{ color: "rgba(232,228,220,0.8)", fontSize: "0.95rem", lineHeight: 1.9, marginBottom: "16px" }}>
              This collection holds 100 pieces of the darkest digital art. The palette runs deep — indigos, bruised purples, ash-grays, and the faint glow of dying embers. There is a rawness here. A roughness. These are not polished and pretty. They are weathered and worn, like stones pulled from a ruin.
            </p>
            <p style={{ color: "rgba(232,228,220,0.8)", fontSize: "0.95rem", lineHeight: 1.9, marginBottom: "16px" }}>
              These wallpapers are for the dreamers who prefer their fantasies heavy with atmosphere. For the writers, the gamers, the artists, and the lonely ones who find beauty in decay. Let the haunted town bleed through your screen.
            </p>
            <p style={{ fontFamily: "var(--font-space,monospace)", fontSize: "0.6rem", letterSpacing: "0.12em", color: "rgba(232,228,220,0.25)", marginTop: "24px" }}>
              dark fantasy wallpaper · gothic fantasy · haunted town aesthetic · cursed kingdom art · dark magic backgrounds · ruined castle wallpaper · 4K fantasy art
            </p>
          </div>

          {/* FAQ */}
          <div>
            <p style={{ fontFamily: "var(--font-space,monospace)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(201,168,76,0.4)", marginBottom: "24px" }}>Frequently Asked</p>
            {[
              { q: "What makes Dark Fantasy different from regular fantasy?", a: "Dark fantasy blends the magic and wonder of fantasy with the dread and terror of horror. Think haunted towns, cursed bloodlines, and heroes who are just as broken as the worlds they try to save. Where regular fantasy reaches for light, dark fantasy reaches for the shadows behind it." },
              { q: "Are these wallpapers free?", a: "Yes. All 100 wallpapers are free for personal use as device backgrounds. Every image is original AI-crafted dark art — no watermarks, no copyright issues, no account required." },
              { q: "What is the Haunted Town aesthetic?", a: "The Haunted Town is a place that doesn't appear on any map. It is the feeling of a road that bends wrong, a fog that sits too still, a town that appears only when you're already lost. The aesthetic combines gothic architecture, dark atmosphere, and the heavy silence of forgotten places." },
              { q: "What resolution are these wallpapers?", a: "All wallpapers are available in 4K resolution. Portrait wallpapers (9:16) are optimised for iPhone and Android screens. Landscape wallpapers (16:9) are optimised for PC, Mac, and desktop use." },
            ].map(({ q, a }) => (
              <div key={q} style={{ borderTop: "1px solid rgba(201,168,76,0.08)", paddingTop: "20px", marginBottom: "20px" }}>
                <p style={{ fontFamily: "var(--font-cinzel,serif)", fontSize: "0.85rem", color: "rgba(232,228,220,0.85)", marginBottom: "10px" }}>{q}</p>
                <p style={{ fontFamily: "var(--font-space,monospace)", fontSize: "0.72rem", color: "rgba(232,228,220,0.45)", lineHeight: 1.8 }}>{a}</p>
              </div>
            ))}
          </div>

          {/* Cross-links */}
          <div style={{ borderTop: "1px solid rgba(201,168,76,0.08)", paddingTop: "32px", marginTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <p style={{ fontFamily: "var(--font-space,monospace)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(201,168,76,0.3)", marginBottom: "8px" }}>Explore More</p>
            <Link href="/top-100-horror-wallpapers" style={{ color: "rgba(192,0,26,0.8)", fontFamily: "var(--font-space,monospace)", fontSize: "0.75rem", textDecoration: "none", letterSpacing: "0.05em" }}>
              → Top 100 Horror Wallpapers — The haunted town has a basement, too.
            </Link>
            <Link href="/top-100-amoled-wallpapers" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-space,monospace)", fontSize: "0.75rem", textDecoration: "none", letterSpacing: "0.05em" }}>
              → Top 100 AMOLED Wallpapers — Black Shadow World. Where light goes to disappear.
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}