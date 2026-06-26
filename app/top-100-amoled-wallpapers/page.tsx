// app/top-100-amoled-wallpapers/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import Breadcrumbs from "@/components/Breadcrumbs";

export const revalidate = 3600;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

export const metadata: Metadata = {
  title: "Top 100 AMOLED Wallpapers | Black Shadow World Collection | Haunted Wallpapers",
  description: "100 pure black AMOLED wallpapers from the Black Shadow World collection. True black backgrounds that save battery, kill the light, and look stunning on any OLED screen. Free 4K download.",
  keywords: ["amoled wallpaper", "black wallpaper", "pure black wallpaper", "oled wallpaper", "dark amoled background", "black shadow wallpaper", "amoled 4k", "true black wallpaper", "amoled phone wallpaper", "black aesthetic wallpaper"],
  openGraph: {
    title: "Top 100 AMOLED Wallpapers | Black Shadow World Collection",
    description: "100 pure black AMOLED wallpapers. True black backgrounds for OLED screens. Free 4K download.",
    url: `${SITE_URL}/top-100-amoled-wallpapers`,
    siteName: "Haunted Wallpapers",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Top 100 AMOLED Wallpapers | Black Shadow World", description: "100 pure black AMOLED wallpapers for OLED screens. Free 4K download." },
  alternates: { canonical: `${SITE_URL}/top-100-amoled-wallpapers` },
};

export default async function Top100AmoledPage() {
  const images = await db.image.findMany({
    where: {
      isAdult: false,
      OR: [
        { tags: { hasSome: ["amoled", "amoled-top100", "black", "shadow", "void", "minimal", "minimalist", "dark"] } },
        { title: { contains: "amoled", mode: "insensitive" } },
        { title: { contains: "black", mode: "insensitive" } },
        { title: { contains: "shadow", mode: "insensitive" } },
        { description: { contains: "amoled", mode: "insensitive" } },
      ],
    },
    orderBy: [{ viewCount: "desc" }, { createdAt: "desc" }],
    take: 100,
    select: { id: true, slug: true, title: true, description: true, r2Key: true, deviceType: true },
  });

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Top 100 AMOLED Wallpapers" }]} />
      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px clamp(16px,5vw,60px) 80px" }}>

        {/* Hero */}
        <div style={{ marginBottom: "48px", borderLeft: "3px solid #ffffff", paddingLeft: "24px" }}>
          <p style={{ fontFamily: "var(--font-space,monospace)", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "12px" }}>Black Shadow World</p>
          <h1 style={{ fontFamily: "var(--font-cinzel,serif)", fontSize: "clamp(1.8rem,4vw,3rem)", color: "rgba(232,228,220,0.95)", lineHeight: 1.15, marginBottom: "16px" }}>
            Top 100 AMOLED Wallpapers
          </h1>
          <p style={{ fontFamily: "var(--font-cormorant,serif)", fontSize: "1.1rem", fontStyle: "italic", color: "rgba(232,228,220,0.55)", marginBottom: "16px", maxWidth: "600px" }}>
            True black. Zero light. Made for screens that earn the darkness.
          </p>
          <p style={{ fontFamily: "var(--font-space,monospace)", fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(232,228,220,0.3)" }}>
            {images.length} wallpapers · Pure black OLED optimised · Free 4K download
          </p>
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "16px", marginBottom: "80px" }}>
          {images.map((img) => {
            const shortDesc = img.description ? img.description.replace(/<[^>]*>/g, "").slice(0, 72).trim() : null;
            return (
              <Link key={img.id} href={`/wallpaper/${img.slug}`} style={{ display: "block", textDecoration: "none" }}>
                <div style={{ aspectRatio: img.deviceType === "PC" ? "16/9" : "9/16", overflow: "hidden", background: "#000" }}>
                  <img src={getPublicUrl(img.r2Key)} alt={img.title} loading="lazy" decoding="async"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.3s ease" }}
                    onMouseOver={e => (e.currentTarget.style.transform = "scale(1.04)")}
                    onMouseOut={e => (e.currentTarget.style.transform = "scale(1)")} />
                </div>
                <p style={{ fontFamily: "var(--font-space,monospace)", fontSize: "0.58rem", color: "rgba(232,228,220,0.6)", marginTop: "5px", letterSpacing: "0.03em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{img.title}</p>
                {shortDesc && <p style={{ fontFamily: "var(--font-space,monospace)", fontSize: "0.52rem", color: "rgba(232,228,220,0.3)", marginTop: "2px", letterSpacing: "0.02em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{shortDesc}</p>}
              </Link>
            );
          })}
        </div>

        {/* SEO Description */}
        <div style={{ maxWidth: "780px", marginBottom: "60px" }}>
          <div style={{ borderLeft: "3px solid rgba(255,255,255,0.15)", paddingLeft: "24px", marginBottom: "40px" }}>
            <p style={{ fontFamily: "var(--font-space,monospace)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: "20px" }}>About This Collection</p>
            <p style={{ color: "rgba(232,228,220,0.8)", fontSize: "0.95rem", lineHeight: 1.9, marginBottom: "16px" }}>
              The Black Shadow World is where light goes to disappear. This collection of 100 AMOLED wallpapers was built for one purpose — to make your OLED screen look like a window into absolute darkness. True black pixels on an OLED display turn completely off, saving battery and producing contrast that no LCD screen can replicate.
            </p>
            <p style={{ color: "rgba(232,228,220,0.8)", fontSize: "0.95rem", lineHeight: 1.9, marginBottom: "16px" }}>
              Every wallpaper in this collection was selected for maximum black coverage — deep voids, shadow-drenched figures, minimal designs that use darkness as the primary element. These are not just dark wallpapers. They are engineered for the AMOLED experience. The skulls that emerge from pitch black. The figures that exist only in silhouette. The geometric shapes that float in the void.
            </p>
            <p style={{ color: "rgba(232,228,220,0.8)", fontSize: "0.95rem", lineHeight: 1.9 }}>
              This is the Black Shadow World. Set one as your wallpaper and watch the edges of your screen disappear.
            </p>
            <p style={{ fontFamily: "var(--font-space,monospace)", fontSize: "0.6rem", letterSpacing: "0.12em", color: "rgba(232,228,220,0.25)", marginTop: "24px" }}>
              amoled wallpaper · black wallpaper · pure black background · oled wallpaper · true black · dark amoled · black shadow · void wallpaper
            </p>
          </div>

          {/* FAQ */}
          <div>
            <p style={{ fontFamily: "var(--font-space,monospace)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: "24px" }}>Frequently Asked</p>
            {[
              { q: "What is an AMOLED wallpaper?", a: "An AMOLED wallpaper is designed specifically for OLED and AMOLED screens, using true black (#000000) as the dominant color. On OLED displays, black pixels are completely turned off — which means zero battery drain and infinite contrast. A true black wallpaper on an AMOLED screen makes the edges of the display disappear entirely." },
              { q: "Do these wallpapers actually save battery?", a: "Yes. On OLED and AMOLED screens, each pixel produces its own light. A black pixel uses zero power. A white pixel uses maximum power. A wallpaper with 80% black coverage can reduce screen battery drain by 40-60% compared to a white or bright wallpaper." },
              { q: "Are these wallpapers free to download?", a: "Yes. All 100 wallpapers in this collection are free for personal use as device backgrounds. Every image is original dark art — no copyright issues, no watermarks." },
              { q: "What screen sizes do these fit?", a: "This collection includes both portrait (9:16) wallpapers for phones and landscape (16:9) wallpapers for desktop and PC. Every image is available in 4K resolution — they scale cleanly to any screen size." },
            ].map(({ q, a }) => (
              <div key={q} style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "20px", marginBottom: "20px" }}>
                <p style={{ fontFamily: "var(--font-cinzel,serif)", fontSize: "0.85rem", color: "rgba(232,228,220,0.85)", marginBottom: "10px" }}>{q}</p>
                <p style={{ fontFamily: "var(--font-space,monospace)", fontSize: "0.72rem", color: "rgba(232,228,220,0.45)", lineHeight: 1.8 }}>{a}</p>
              </div>
            ))}
          </div>

          {/* Cross-links */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "32px", marginTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <p style={{ fontFamily: "var(--font-space,monospace)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: "8px" }}>Explore More</p>
            <Link href="/top-100-dark-fantasy-wallpapers" style={{ color: "rgba(201,168,76,0.8)", fontFamily: "var(--font-space,monospace)", fontSize: "0.75rem", textDecoration: "none", letterSpacing: "0.05em" }}>
              → Top 100 Dark Fantasy Wallpapers — The haunted town has more than shadows.
            </Link>
            <Link href="/top-100-horror-wallpapers" style={{ color: "rgba(192,0,26,0.8)", fontFamily: "var(--font-space,monospace)", fontSize: "0.75rem", textDecoration: "none", letterSpacing: "0.05em" }}>
              → Top 100 Horror Wallpapers — For the ones who stare into the dark.
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}