// app/top-100-horror-wallpapers/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import Breadcrumbs from "@/components/Breadcrumbs";

export const revalidate = 3600;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

export const metadata: Metadata = {
  title: "Top 100 Horror Wallpapers | The Haunted Town Static Collection | Haunted Wallpapers",
  description: "100 horror wallpapers from the haunted town. Abandoned rooms, empty streets, flickering static, and faces that shouldn't exist. Scary backgrounds for those who dare to look.",
  keywords: ["horror wallpaper", "scary backgrounds", "haunted town aesthetic", "creepy wallpaper", "analog horror art", "liminal space backgrounds", "psychological horror", "ghostly wallpaper", "spooky 4K", "scary phone wallpaper"],
  openGraph: {
    title: "Top 100 Horror Wallpapers | The Haunted Town Static Collection",
    description: "100 horror wallpapers. Abandoned rooms, flickering static, and faces that shouldn't exist. For those who dare to look.",
    url: `${SITE_URL}/top-100-horror-wallpapers`,
    siteName: "Haunted Wallpapers",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Top 100 Horror Wallpapers | Haunted Town Static", description: "Abandoned rooms, flickering static, and faces that shouldn't exist. Scary 4K backgrounds." },
  alternates: { canonical: `${SITE_URL}/top-100-horror-wallpapers` },
};

export default async function Top100HorrorPage() {
  const images = await db.image.findMany({
    where: {
      isAdult: false,
      OR: [
        { tags: { hasSome: ["horror", "ghost", "creepy", "paranormal", "scary", "analog", "liminal", "haunted", "skull", "death", "sinister", "violent", "unsettling", "disturbing", "reaper"] } },
        { title: { contains: "horror", mode: "insensitive" } },
        { title: { contains: "ghost", mode: "insensitive" } },
        { title: { contains: "creepy", mode: "insensitive" } },
        { title: { contains: "skull", mode: "insensitive" } },
        { title: { contains: "haunted", mode: "insensitive" } },
        { description: { contains: "horror", mode: "insensitive" } },
        { description: { contains: "creepy", mode: "insensitive" } },
      ],
    },
    orderBy: [{ viewCount: "desc" }, { createdAt: "desc" }],
    take: 100,
    select: { id: true, slug: true, title: true, description: true, r2Key: true, deviceType: true, collection: { select: { slug: true } } },
  });

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Top 100 Horror Wallpapers" }]} />
      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px clamp(16px,5vw,60px) 80px" }}>

        {/* Hero */}
        <div style={{ marginBottom: "48px", borderLeft: "3px solid #c0001a", paddingLeft: "24px" }}>
          <p style={{ fontFamily: "var(--font-space,monospace)", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#c0001a", marginBottom: "12px" }}>The Haunted Town Static Collection</p>
          <h1 style={{ fontFamily: "var(--font-cinzel,serif)", fontSize: "clamp(1.8rem,4vw,3rem)", color: "rgba(232,228,220,0.95)", lineHeight: 1.15, marginBottom: "16px" }}>
            Top 100 Horror Wallpapers
          </h1>
          <p style={{ fontFamily: "var(--font-cormorant,serif)", fontSize: "1.1rem", fontStyle: "italic", color: "rgba(232,228,220,0.55)", marginBottom: "16px", maxWidth: "600px" }}>
            You Can Hear It Before You See It.
          </p>
          <p style={{ fontFamily: "var(--font-space,monospace)", fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(232,228,220,0.3)" }}>
            {images.length} wallpapers · Analog horror · Liminal spaces · Free 4K
          </p>
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "16px", marginBottom: "48px" }}>
          {images.map((img) => {
            const shortDesc = img.description ? img.description.replace(/<[^>]*>/g, "").slice(0, 72).trim() : null;
            const href = img.deviceType
              ? `/${img.deviceType.toLowerCase()}/${img.slug}`
              : img.collection?.slug
                ? `/shop/${img.collection.slug}/${img.slug}`
                : "/obsessions";
            return (
              <Link key={img.id} href={href} style={{ display: "block", textDecoration: "none" }}>
                <div style={{ aspectRatio: img.deviceType === "PC" ? "16/9" : "9/16", overflow: "hidden", background: "#0a0812" }}>
                  <img src={getPublicUrl(img.r2Key)} alt={img.title} loading="lazy" decoding="async"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.3s ease" }} />
                </div>
                <p style={{ fontFamily: "var(--font-space,monospace)", fontSize: "0.58rem", color: "rgba(232,228,220,0.6)", marginTop: "5px", letterSpacing: "0.03em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{img.title}</p>
                {shortDesc && <p style={{ fontFamily: "var(--font-space,monospace)", fontSize: "0.52rem", color: "rgba(232,228,220,0.3)", marginTop: "2px", letterSpacing: "0.02em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{shortDesc}</p>}
              </Link>
            );
          })}
        </div>

        {/* Intro */}
        <div style={{ maxWidth: "720px", marginBottom: "48px", borderLeft: "1px solid rgba(192,0,26,0.2)", paddingLeft: "20px" }}>
          <p style={{ color: "rgba(232,228,220,0.7)", fontSize: "0.9rem", lineHeight: 1.9, marginBottom: "12px" }}>
            The static. That low, crackling hum that sits just beneath the silence. It is the sound the haunted town makes when it breathes. And when you press your screen, when you set one of these wallpapers as your background, that static bleeds through.
          </p>
          <p style={{ color: "rgba(232,228,220,0.7)", fontSize: "0.9rem", lineHeight: 1.9 }}>
            Our Top 100 Horror Wallpapers are pulled from the haunted town's forgotten frequencies. The atmosphere is thick. The colors are drained — washed-out grays, sickly yellows, and deep, swallowing blacks. There is a rawness to every piece, a sense that something is just out of frame, just beyond reach.
          </p>
        </div>

        {/* SEO Description */}
        <div style={{ maxWidth: "780px", marginBottom: "60px" }}>
          <div style={{ borderLeft: "3px solid rgba(192,0,26,0.25)", paddingLeft: "24px", marginBottom: "40px" }}>
            <p style={{ fontFamily: "var(--font-space,monospace)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(192,0,26,0.5)", marginBottom: "20px" }}>About This Collection</p>
            <p style={{ color: "rgba(232,228,220,0.8)", fontSize: "0.95rem", lineHeight: 1.9, marginBottom: "16px" }}>
              This collection carries the grain of old tapes. The distortion of analog noise. The feeling of being watched from an empty room. Every image holds a story of isolation, of quiet terror, of the things that live in empty places.
            </p>
            <p style={{ color: "rgba(232,228,220,0.8)", fontSize: "0.95rem", lineHeight: 1.9, marginBottom: "16px" }}>
              These are for the ones who find comfort in the cold. For the ones who stare into the dark and wait for it to stare back. For the ones who know that the haunted town is not a place — it is a feeling.
            </p>
            <p style={{ fontFamily: "var(--font-space,monospace)", fontSize: "0.6rem", letterSpacing: "0.12em", color: "rgba(232,228,220,0.25)", marginTop: "24px" }}>
              horror wallpaper · scary backgrounds · haunted town aesthetic · creepy wallpaper · analog horror · liminal space · psychological horror · ghostly wallpaper · spooky 4K
            </p>
          </div>

          {/* FAQ */}
          <div>
            <p style={{ fontFamily: "var(--font-space,monospace)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(192,0,26,0.4)", marginBottom: "24px" }}>Frequently Asked</p>
            {[
              { q: "What is the Haunted Town aesthetic?", a: "It is the feeling of walking through an empty town where everything is slightly wrong — flickering lights, fog that moves against the wind, and the constant sense of being watched from every window. It sits between horror and melancholy, between the supernatural and the deeply human fear of empty places." },
              { q: "What is analog horror?", a: "Analog horror is a subgenre of horror that mimics the aesthetic of old VHS tapes, grainy security footage, and distorted television signals. It creates dread through visual degradation — the static, the color bleed, the sense that something has been recorded that was never meant to be seen." },
              { q: "What is a liminal space?", a: "A liminal space is a location that exists between two states — like an empty shopping mall at 3am, a school hallway in summer, or an airport terminal at midnight. These spaces feel deeply wrong because they are built for people but emptied of them. The haunted town is a liminal space." },
              { q: "Can I use these for my videos?", a: "These wallpapers are for personal background use. For commercial use in videos, streams, or projects, please contact us through the site. Every image is original art — no third-party copyright issues." },
            ].map(({ q, a }) => (
              <div key={q} style={{ borderTop: "1px solid rgba(192,0,26,0.08)", paddingTop: "20px", marginBottom: "20px" }}>
                <p style={{ fontFamily: "var(--font-cinzel,serif)", fontSize: "0.85rem", color: "rgba(232,228,220,0.85)", marginBottom: "10px" }}>{q}</p>
                <p style={{ fontFamily: "var(--font-space,monospace)", fontSize: "0.72rem", color: "rgba(232,228,220,0.45)", lineHeight: 1.8 }}>{a}</p>
              </div>
            ))}
          </div>

          {/* Cross-links */}
          <div style={{ borderTop: "1px solid rgba(192,0,26,0.08)", paddingTop: "32px", marginTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <p style={{ fontFamily: "var(--font-space,monospace)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(192,0,26,0.3)", marginBottom: "8px" }}>Explore More</p>
            <Link href="/top-100-dark-fantasy-wallpapers" style={{ color: "rgba(201,168,76,0.8)", fontFamily: "var(--font-space,monospace)", fontSize: "0.75rem", textDecoration: "none", letterSpacing: "0.05em" }}>
              → Top 100 Dark Fantasy Wallpapers — If you prefer your nightmares with a side of magic.
            </Link>
            <Link href="/top-100-amoled-wallpapers" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-space,monospace)", fontSize: "0.75rem", textDecoration: "none", letterSpacing: "0.05em" }}>
              → Top 100 AMOLED Wallpapers — Black Shadow World. The void behind the horror.
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}