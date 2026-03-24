import type { Metadata } from "next";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

export const metadata: Metadata = {
  title: "Best Dark Wallpapers for Halloween 2025 | Haunted Wallpapers",
  description:
    "Discover the best dark and Halloween wallpapers for iPhone and Android. Haunted mansions, gothic skulls, horror art, and more — all free to download.",
  alternates: { canonical: `${SITE_URL}/guides/best-dark-wallpapers-for-halloween` },
  openGraph: {
    title: "Best Dark Wallpapers for Halloween 2025 | Haunted Wallpapers",
    description:
      "Free dark Halloween wallpapers for iPhone and Android. Gothic skulls, haunted mansions, horror art, and more.",
    url: `${SITE_URL}/guides/best-dark-wallpapers-for-halloween`,
    siteName: "Haunted Wallpapers",
    type: "article",
    images: [
      {
        url: "https://images.unsplash.com/photo-1509557965875-b88c97052f0e?w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Dark Halloween wallpaper — candles and gothic fog",
      },
    ],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Best Dark Wallpapers for Halloween 2025",
  description:
    "A curated guide to the best dark Halloween wallpapers for iPhone and Android — haunted mansions, gothic skulls, horror art, and more.",
  image: "https://images.unsplash.com/photo-1509557965875-b88c97052f0e?w=1200&q=80",
  datePublished: "2025-09-01T00:00:00Z",
  dateModified: "2025-10-01T00:00:00Z",
  author: { "@type": "Organization", name: "Haunted Wallpapers" },
  publisher: {
    "@type": "Organization",
    name: "Haunted Wallpapers",
    logo: { "@type": "ImageObject", url: `${SITE_URL}/og-image.jpg` },
  },
  mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/guides/best-dark-wallpapers-for-halloween` },
};

export default function HalloweenWallpapersGuide() {
  return (
    <main className="static-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="static-page-inner">

        {/* Hero */}
        <header className="static-page-header">
          <p className="static-page-label">Halloween Guide · 2025</p>
          <h1 className="static-page-title">
            Best Dark Wallpapers<br /><em>for Halloween</em>
          </h1>
          <p className="static-page-meta">
            Gothic skulls, haunted mansions, candle-lit horror, and pure darkness —
            the ultimate collection of free Halloween wallpapers for iPhone and Android.
          </p>
        </header>

        {/* Hero image */}
        <div style={{ marginBottom: "40px", borderRadius: "4px", overflow: "hidden" }}>
          <img
            src="https://images.unsplash.com/photo-1509557965875-b88c97052f0e?w=1200&q=80"
            alt="Dark Halloween atmosphere — candles, fog, and gothic shadows"
            style={{ width: "100%", height: "420px", objectFit: "cover", display: "block" }}
            loading="eager"
          />
          <p style={{ fontSize: "0.7rem", color: "#6b6480", padding: "6px 0", fontFamily: "var(--font-space)", letterSpacing: "0.1em" }}>
            Dark gothic atmosphere — the essence of Halloween wallpaper art
          </p>
        </div>

        {/* AdSense — top */}
        <div style={{ marginBottom: "40px" }}>
          <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN} width={728} height={90} />
        </div>

        {/* Table of Contents */}
        <div className="static-page-body">
          <div style={{
            border: "1px solid #2a2535",
            padding: "24px",
            marginBottom: "40px",
            background: "rgba(192,0,26,0.04)",
          }}>
            <p style={{
              fontFamily: "var(--font-space)",
              fontSize: "0.55rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#c0001a",
              marginBottom: "12px",
            }}>
              In This Guide
            </p>
            <ol style={{ paddingLeft: "20px", margin: 0, lineHeight: "2.2" }}>
              <li><a href="#gothic-skulls" style={{ color: "#c0a0ff", textDecoration: "none" }}>Gothic Skull Wallpapers</a></li>
              <li><a href="#haunted-mansions" style={{ color: "#c0a0ff", textDecoration: "none" }}>Haunted Mansion &amp; Fog</a></li>
              <li><a href="#dark-forest" style={{ color: "#c0a0ff", textDecoration: "none" }}>Dark Forest &amp; Nature Horror</a></li>
              <li><a href="#horror-art" style={{ color: "#c0a0ff", textDecoration: "none" }}>Horror Illustration Art</a></li>
              <li><a href="#how-to-set" style={{ color: "#c0a0ff", textDecoration: "none" }}>How to Set on iPhone &amp; Android</a></li>
            </ol>
          </div>

          {/* SECTION 1 */}
          <section className="static-section" id="gothic-skulls">
            <h2>1. Gothic Skull Wallpapers</h2>
            <p>
              The skull is the ultimate Halloween symbol — and in dark digital art, it transforms
              into something far beyond a cliché. Gothic skull wallpapers combine ornate Victorian
              detail with deep shadows, candlelight, and floral decay. On an OLED iPhone screen,
              the contrast between the illuminated bone and the pure black background is genuinely
              breathtaking.
            </p>

            {/* Skull image */}
            <div style={{ margin: "24px 0", borderRadius: "4px", overflow: "hidden" }}>
              <img
                src="https://images.unsplash.com/photo-1602513445106-53ba2ac9ee39?w=900&q=80"
                alt="Gothic skull with dark atmospheric lighting — Halloween wallpaper"
                style={{ width: "100%", height: "320px", objectFit: "cover", display: "block" }}
                loading="lazy"
              />
              <p style={{ fontSize: "0.7rem", color: "#6b6480", padding: "6px 0", fontFamily: "var(--font-space)", letterSpacing: "0.1em" }}>
                Gothic skull art — perfect for OLED displays with true black contrast
              </p>
            </div>

            <p>
              Our skull collections span multiple moods: clean and minimal for those who prefer
              something subtle, ornate and baroque for maximalists, and glitch-corrupted skull
              art for a modern horror aesthetic. All images are cropped and optimised for both
              iPhone portrait and Android portrait ratios.
            </p>
            <p>
              <strong>Best pick for iPhone:</strong> Look for skull wallpapers where 80%+ of the
              image is deep black or shadow. This leverages OLED pixel-off technology for maximum
              contrast and minimal battery drain.
            </p>
            <p>
              <Link href="/shop/dark-fantasy-art" style={{ color: "#c0001a" }}>
                Browse Dark Fantasy Art Collection →
              </Link>
            </p>
          </section>

          {/* SECTION 2 */}
          <section className="static-section" id="haunted-mansions">
            <h2>2. Haunted Mansion &amp; Fog Wallpapers</h2>
            <p>
              There is nothing quite like a Victorian mansion silhouetted against a full moon,
              surrounded by rolling fog, to set the Halloween mood on your phone lock screen.
              These wallpapers evoke classic horror cinema — the kind of image that makes
              you look twice every time you unlock your device.
            </p>

            {/* Mansion image */}
            <div style={{ margin: "24px 0", borderRadius: "4px", overflow: "hidden" }}>
              <img
                src="https://images.unsplash.com/photo-1570868023-f5e65394ee93?w=900&q=80"
                alt="Haunted mansion in fog at night — dark Halloween wallpaper"
                style={{ width: "100%", height: "320px", objectFit: "cover", display: "block" }}
                loading="lazy"
              />
              <p style={{ fontSize: "0.7rem", color: "#6b6480", padding: "6px 0", fontFamily: "var(--font-space)", letterSpacing: "0.1em" }}>
                Haunted mansion silhouette — a classic Halloween wallpaper aesthetic
              </p>
            </div>

            <p>
              Architecture horror is a surprisingly powerful wallpaper aesthetic. Unlike character
              or creature art, an imposing building creates a sense of scale — you feel small
              looking at it, which is exactly the feeling that good horror is built on.
            </p>
            <p>
              For Android users with always-on displays, a fog-heavy wallpaper with a central
              illuminated subject (like a lit mansion window) works especially well because the
              always-on display shows just enough to intrigue without draining the battery.
            </p>
          </section>

          {/* Mid AdSense */}
          <div style={{ margin: "40px 0" }}>
            <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR} width={728} height={90} />
          </div>

          {/* SECTION 3 */}
          <section className="static-section" id="dark-forest">
            <h2>3. Dark Forest &amp; Nature Horror</h2>
            <p>
              The dark forest is one of the most primal Halloween images. There is something
              deeply unsettling about trees that seem to reach toward you, paths that disappear
              into impenetrable shadow, and moonlight that illuminates just enough to make
              you aware of what you cannot see.
            </p>

            {/* Forest image */}
            <div style={{ margin: "24px 0", borderRadius: "4px", overflow: "hidden" }}>
              <img
                src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=900&q=80"
                alt="Dark foggy forest at night — horror nature wallpaper for phone"
                style={{ width: "100%", height: "340px", objectFit: "cover", display: "block" }}
                loading="lazy"
              />
              <p style={{ fontSize: "0.7rem", color: "#6b6480", padding: "6px 0", fontFamily: "var(--font-space)", letterSpacing: "0.1em" }}>
                Dark forest in fog — nature horror at its most atmospheric
              </p>
            </div>

            <p>
              Nature horror wallpapers have a cinematic quality that works particularly well as
              a home screen background on Android, where the grid of app icons sits over the
              image. A dark forest creates natural depth behind your icons, making your home
              screen feel like a portal into another world rather than just a grid of shortcuts.
            </p>
            <p>
              <strong>Tip:</strong> Pair a dark forest wallpaper with a minimal icon pack on
              Android to get the full horror-movie aesthetic. On iPhone, use it as your lock
              screen with a blur-depth widget overlay for best effect.
            </p>
          </section>

          {/* SECTION 4 */}
          <section className="static-section" id="horror-art">
            <h2>4. Horror Illustration Art</h2>
            <p>
              Beyond photography and 3D renders, illustrated horror art brings a unique quality
              to Halloween wallpapers. The hand-crafted feel of illustration — even when generated
              digitally — adds warmth and detail that purely procedural art cannot replicate.
              You see the texture, the brushstroke, the decision behind every shadow.
            </p>

            {/* Horror art image */}
            <div style={{ margin: "24px 0", borderRadius: "4px", overflow: "hidden" }}>
              <img
                src="https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?w=900&q=80"
                alt="Dark horror illustration art — Halloween wallpaper aesthetic"
                style={{ width: "100%", height: "320px", objectFit: "cover", display: "block" }}
                loading="lazy"
              />
              <p style={{ fontSize: "0.7rem", color: "#6b6480", padding: "6px 0", fontFamily: "var(--font-space)", letterSpacing: "0.1em" }}>
                Horror illustration — where artistry meets the macabre
              </p>
            </div>

            <p>
              Our horror illustration collection covers a range of styles: ink-wash Japanese
              horror, European gothic engraving, comic book splatter, and painterly dark fantasy.
              Each image is original AI art created specifically for wallpaper use at 4K resolution,
              so it looks sharp on every screen from the oldest Android to the latest iPhone Pro Max.
            </p>
            <p>
              Horror illustration wallpapers also perform extremely well as tablet wallpapers,
              since the extra screen real estate lets you appreciate the detail that would be
              cramped on a phone screen.
            </p>
          </section>

          {/* SECTION 5 — How to set wallpaper */}
          <section className="static-section" id="how-to-set">
            <h2>5. How to Set a Halloween Wallpaper</h2>
            <p>
              Once you have downloaded your Halloween wallpaper, setting it correctly takes
              about 30 seconds. The process differs slightly between iPhone and Android.
            </p>

            {/* Two columns comparison */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              margin: "24px 0",
            }}>
              {/* iPhone card */}
              <div style={{ border: "1px solid #2a2535", padding: "20px" }}>
                <p style={{
                  fontFamily: "var(--font-space)",
                  fontSize: "0.55rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#c0001a",
                  marginBottom: "12px",
                }}>
                  iPhone
                </p>
                <ol style={{ paddingLeft: "18px", lineHeight: "2", margin: 0, fontSize: "0.9rem" }}>
                  <li>Download image to Photos</li>
                  <li>Open Settings → Wallpaper</li>
                  <li>Tap "Add New Wallpaper"</li>
                  <li>Select Photos</li>
                  <li>Choose your image</li>
                  <li>Tap "Add" to set both screens</li>
                </ol>
                <p style={{ marginTop: "12px" }}>
                  <Link href="/guides/how-to-set-wallpaper-iphone" style={{ color: "#c0001a", fontSize: "0.85rem" }}>
                    Full iPhone guide →
                  </Link>
                </p>
              </div>

              {/* Android card */}
              <div style={{ border: "1px solid #2a2535", padding: "20px" }}>
                <p style={{
                  fontFamily: "var(--font-space)",
                  fontSize: "0.55rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#c0001a",
                  marginBottom: "12px",
                }}>
                  Android
                </p>
                <ol style={{ paddingLeft: "18px", lineHeight: "2", margin: 0, fontSize: "0.9rem" }}>
                  <li>Download image to Gallery</li>
                  <li>Long-press your home screen</li>
                  <li>Tap "Wallpapers"</li>
                  <li>Tap "My photos"</li>
                  <li>Select your image</li>
                  <li>Set for Lock screen or Home screen</li>
                </ol>
                <p style={{ marginTop: "12px" }}>
                  <Link href="/guides/how-to-set-wallpaper-android" style={{ color: "#c0001a", fontSize: "0.85rem" }}>
                    Full Android guide →
                  </Link>
                </p>
              </div>
            </div>
          </section>

          {/* Closing CTA */}
          <section className="static-section">
            <h2>Browse the Full Halloween Collection</h2>
            <p>
              All wallpapers on Haunted Wallpapers are free to download at full resolution.
              No watermarks, no sign-up required. Browse by device type to find images
              sized specifically for your screen.
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "16px" }}>
              <Link href="/iphone" style={{
                display: "inline-block",
                padding: "12px 24px",
                border: "1px solid #c0001a",
                color: "#c0001a",
                textDecoration: "none",
                fontFamily: "var(--font-space)",
                fontSize: "0.7rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}>
                iPhone Wallpapers
              </Link>
              <Link href="/android" style={{
                display: "inline-block",
                padding: "12px 24px",
                border: "1px solid #2a2535",
                color: "#f0ecff",
                textDecoration: "none",
                fontFamily: "var(--font-space)",
                fontSize: "0.7rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}>
                Android Wallpapers
              </Link>
              <Link href="/pc" style={{
                display: "inline-block",
                padding: "12px 24px",
                border: "1px solid #2a2535",
                color: "#f0ecff",
                textDecoration: "none",
                fontFamily: "var(--font-space)",
                fontSize: "0.7rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}>
                PC Wallpapers
              </Link>
            </div>
          </section>

        </div>{/* end static-page-body */}
      </div>

      {/* Footer ad */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px 60px" }}>
        <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} width={728} height={90} />
      </div>
    </main>
  );
}