import type { Metadata } from "next";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

export const metadata: Metadata = {
  title: "Wallpaper Guides & Tips | Haunted Wallpapers",
  description: "Learn how to set wallpapers on iPhone and Android, discover the best dark wallpapers, understand AMOLED displays, and explore dark fantasy art styles.",
  alternates: { canonical: `${SITE_URL}/guides` },
  openGraph: {
    title: "Wallpaper Guides & Tips | Haunted Wallpapers",
    description: "How-to guides, tips, and explainers for dark wallpaper enthusiasts.",
    url: `${SITE_URL}/guides`,
    siteName: "Haunted Wallpapers",
    type: "website",
  },
};

const GUIDES = [
  {
    slug:    "how-to-set-wallpaper-iphone",
    title:   "How to Set a Wallpaper on iPhone",
    desc:    "Step-by-step guide to setting a custom wallpaper on any iPhone model, including lock screen and home screen tips.",
    label:   "iPhone",
  },
  {
    slug:    "how-to-set-wallpaper-android",
    title:   "How to Set a Wallpaper on Android",
    desc:    "How to apply a wallpaper on Samsung, Google Pixel, OnePlus, and other Android devices — from your gallery or directly from a download.",
    label:   "Android",
  },
  {
    slug:    "best-dark-wallpapers-iphone",
    title:   "Best Dark Wallpapers for iPhone",
    desc:    "A curated guide to the best dark, gothic, and horror-aesthetic wallpapers optimised for the iPhone Super Retina XDR display.",
    label:   "Guide",
  },
  {
    slug:    "what-is-amoled-wallpaper",
    title:   "What Is an AMOLED Wallpaper?",
    desc:    "Understand how AMOLED screens work, why pure black wallpapers save battery, and how to choose the right dark wallpaper for your OLED phone.",
    label:   "Explainer",
  },
  {
    slug:    "dark-fantasy-art-styles-explained",
    title:   "Dark Fantasy Art Styles Explained",
    desc:    "From gothic horror to dark surrealism — a breakdown of the visual styles behind Haunted Wallpapers art, and how to find your aesthetic.",
    label:   "Art",
  },
];

export default function GuidesPage() {
  return (
    <main className="static-page">
      <div className="static-page-inner">

        <header className="static-page-header">
          <p className="static-page-label">Knowledge Base</p>
          <h1 className="static-page-title">Guides &amp;<br /><em>Tips</em></h1>
          <p className="static-page-meta">
            Everything you need to make the most of dark wallpapers on any device.
          </p>
        </header>

        <div className="static-page-body">
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {GUIDES.map((g) => (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                style={{
                  display: "block",
                  padding: "20px 24px",
                  border: "1px solid #2a2535",
                  textDecoration: "none",
                  transition: "border-color 0.2s",
                }}
                className="hover:border-[rgba(192,0,26,0.5)]"
              >
                <span style={{
                  fontFamily: "var(--font-space)",
                  fontSize: "0.55rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#c0001a",
                  display: "block",
                  marginBottom: "6px",
                }}>
                  {g.label}
                </span>
                <span style={{
                  fontFamily: "var(--font-cinzel)",
                  fontSize: "1rem",
                  color: "#f0ecff",
                  display: "block",
                  marginBottom: "6px",
                }}>
                  {g.title}
                </span>
                <span style={{
                  fontFamily: "var(--font-cormorant)",
                  fontStyle: "italic",
                  fontSize: "0.95rem",
                  color: "#8a8099",
                  display: "block",
                }}>
                  {g.desc}
                </span>
              </Link>
            ))}
          </div>
        </div>

      </div>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px 60px" }}>
        <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} width={728} height={90} />
      </div>
    </main>
  );
}