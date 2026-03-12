// app/[eventSlug]/page.tsx
// Dynamic seasonal/event landing pages.
// Route matches any slug — guard list (KNOWN_EVENTS) prevents wild-card
// conflicts with real routes like /shop, /iphone, /about, etc.
//
// URL examples:
//   /halloween   → tag: "halloween"
//   /dark        → tag: "dark"
//   /skeleton    → tag: "skeleton"
//   /goddess     → tag: "goddess"
//   /demon       → tag: "demon"
//
// To add a new season: add an entry to KNOWN_EVENTS. That's all.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getSeasonalImages } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import AdSlot from "@/components/AdSlot";

// ─── Known events registry ────────────────────────────────────────────────────
// slug → display config. Only slugs listed here are served; everything else 404s.

interface EventConfig {
  tag:         string;   // the DB tag to query
  title:       string;   // <h1>
  metaTitle:   string;   // <title> tag
  description: string;   // meta description + subheading
  eyebrow:     string;   // small label above title
}

const KNOWN_EVENTS: Record<string, EventConfig> = {
  halloween: {
    tag:         "halloween",
    title:       "Halloween Wallpapers",
    metaTitle:   "Best Free 4K Halloween Wallpapers 2026 | Haunted Wallpapers",
    description: "Free dark Halloween wallpapers for iPhone, Android & PC. Skulls, demons, witches and occult imagery — 4K resolution, instant download.",
    eyebrow:     "Ritual Season",
  },
  dark: {
    tag:         "dark",
    title:       "Dark & Gothic Wallpapers",
    metaTitle:   "Dark & Gothic Wallpapers 4K | Haunted Wallpapers",
    description: "Abyss-dark wallpapers for every device. Gothic aesthetics, shadow art, and void imagery.",
    eyebrow:     "The Abyss",
  },
  skeleton: {
    tag:         "skeleton",
    title:       "Skeleton Art Wallpapers",
    metaTitle:   "Free Skeleton Wallpapers 4K | Haunted Wallpapers",
    description: "Memento mori dark art wallpapers. Skulls, skeletons, and bone imagery for every screen.",
    eyebrow:     "Memento Mori",
  },
  goddess: {
    tag:         "goddess",
    title:       "Goddess & Divine Wallpapers",
    metaTitle:   "Dark Goddess Wallpapers 4K | Haunted Wallpapers",
    description: "Powerful divine feminine dark fantasy wallpapers. Dark goddesses, celestial queens, and mythic archetypes.",
    eyebrow:     "The Divine Feminine",
  },
  demon: {
    tag:         "demon",
    title:       "Demon & Occult Wallpapers",
    metaTitle:   "Demon & Occult Wallpapers 4K | Haunted Wallpapers",
    description: "Dark demonic and occult wallpapers. Summoned entities, sigils, and infernal aesthetic for every device.",
    eyebrow:     "The Infernal",
  },
};

// ─── Metadata ─────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ eventSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { eventSlug } = await params;
  const event = KNOWN_EVENTS[eventSlug];
  if (!event) return { title: "Not Found | Haunted Wallpapers" };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

  return {
    title:       event.metaTitle,
    description: event.description,
    keywords:    [event.tag, "dark wallpaper", "4k wallpaper", "free wallpaper", "occult art", "haunted wallpapers"],
    openGraph: {
      title:       event.metaTitle,
      description: event.description,
      url:         `${siteUrl}/${eventSlug}`,
      siteName:    "Haunted Wallpapers",
      type:        "website",
    },
    twitter: {
      card:        "summary_large_image",
      title:       event.metaTitle,
      description: event.description,
    },
    alternates: { canonical: `${siteUrl}/${eventSlug}` },
  };
}

export function generateStaticParams() {
  return Object.keys(KNOWN_EVENTS).map((slug) => ({ eventSlug: slug }));
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function EventPage({ params }: PageProps) {
  const { eventSlug } = await params;
  const event = KNOWN_EVENTS[eventSlug];
  if (!event) notFound();

  const images = await getSeasonalImages(event.tag, 48);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

  return (
    <main className="seasonal-page">

      {/* ── Hero Header ── */}
      <section className="seasonal-hero">
        <span className="seasonal-tag-badge">#{event.tag}</span>
        <h1 className="seasonal-title">{event.title}</h1>
        <p className="seasonal-desc">{event.description}</p>
        <p className="seasonal-count">{images.length} works summoned</p>
      </section>

      {/* ── Top Ad ── */}
      <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN} width={728} height={90} />

      {/* ── Image Grid ── */}
      <div className="seasonal-grid-wrap">
        {images.length > 0 ? (
          <div className="seasonal-grid">
            {images.map((img) => {
              const href = img.collectionSlug
                ? `/shop/${img.collectionSlug}/${img.slug}`
                : img.deviceType
                  ? `/${img.deviceType.toLowerCase()}/${img.slug}`
                  : `/shop`;

              return (
                <Link key={img.id} href={href} className="seasonal-card">
                  <div className="seasonal-card-inner">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getPublicUrl(img.r2Key)}
                      alt={img.title}
                      loading="lazy"
                    />
                  </div>
                  <div className="seasonal-card-info">
                    <span className="seasonal-card-title">{img.title}</span>
                    <span className="seasonal-card-link-label">View & Download →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="seasonal-empty">
            <p className="seasonal-empty-msg">
              The {event.title.toLowerCase()} are gathering…
            </p>
            <p style={{ fontFamily: "var(--font-space)", fontSize: "0.6rem",
              letterSpacing: "0.15em", color: "#3a2535", textTransform: "uppercase",
              marginBottom: "24px" }}>
              No images tagged yet. Check back soon.
            </p>
            <Link href="/shop" className="section-link">Browse All Collections →</Link>
          </div>
        )}
      </div>

      {/* ── Footer Ad ── */}
      <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} width={728} height={90} />

      {/* ── JSON-LD CollectionPage ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context":       "https://schema.org",
            "@type":          "CollectionPage",
            name:             event.title,
            description:      event.description,
            url:              `${siteUrl}/${eventSlug}`,
            numberOfItems:    images.length,
            provider: { "@type": "Organization", name: "Haunted Wallpapers", url: siteUrl },
          }),
        }}
      />
    </main>
  );
}