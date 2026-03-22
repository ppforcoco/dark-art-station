import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

export const metadata: Metadata = {
  title: "What Is an AMOLED Wallpaper? | Haunted Wallpapers",
  description: "Understand how AMOLED and OLED screens work, why pure black wallpapers save battery life, and how to choose the best dark wallpaper for your OLED phone.",
  alternates: { canonical: `${SITE_URL}/guides/what-is-amoled-wallpaper` },
  openGraph: {
    title: "What Is an AMOLED Wallpaper? | Haunted Wallpapers",
    description: "How OLED screens work and why dark wallpapers save battery on your phone.",
    url: `${SITE_URL}/guides/what-is-amoled-wallpaper`,
    siteName: "Haunted Wallpapers",
    type: "article",
  },
};

export default function AmoledWallpaperGuidePage() {
  return (
    <main className="static-page">
      <div className="static-page-inner">

        <header className="static-page-header">
          <p className="static-page-label">Tech Explainer</p>
          <h1 className="static-page-title">What Is an<br /><em>AMOLED Wallpaper?</em></h1>
        </header>

        <div className="static-page-body">

          <section className="static-section">
            <h2>AMOLED vs LCD — The Key Difference</h2>
            <p>
              Most modern flagship smartphones use AMOLED or OLED displays rather than
              the older LCD technology. The difference matters a great deal for wallpapers.
              An LCD screen has a backlight that is always on — even when displaying black,
              the backlight shines through a filter that blocks the light. The result is
              a washed-out, grey-black rather than a true black.
            </p>
            <p>
              An AMOLED screen works differently. Each pixel produces its own light. When
              a pixel needs to display black, it simply switches off entirely — producing
              zero light. This means black on an AMOLED display is genuinely black, not a
              dark grey backlit approximation.
            </p>
          </section>

          <section className="static-section">
            <h2>Why This Matters for Wallpapers</h2>
            <p>
              A wallpaper designed for AMOLED screens uses pure black or near-black
              backgrounds to take full advantage of the display technology. The contrast
              between a pitch-black background and a brightly colored subject is more
              dramatic on an AMOLED screen than it could ever be on an LCD. Dark fantasy
              art, gothic imagery, and horror aesthetics all benefit enormously from this
              display characteristic.
            </p>
            <p>
              This is why AMOLED wallpapers have become popular beyond just aesthetics —
              they are the technically correct choice for OLED phone owners.
            </p>
          </section>

          <section className="static-section">
            <h2>Battery Life Benefits</h2>
            <p>
              Because black pixels are off pixels on AMOLED screens, dark wallpapers
              consume less power than bright ones. A pure black wallpaper on an AMOLED
              phone uses significantly less battery than a white or brightly colored one.
              The exact saving depends on the phone model and how much of the screen is
              dark versus bright, but the principle is consistent across all AMOLED
              devices: darker wallpaper equals longer battery life.
            </p>
            <p>
              This effect is especially noticeable when Always-On Display is enabled —
              a feature available on Samsung Galaxy phones and iPhone 14 Pro and later.
              A dark AMOLED wallpaper can reduce always-on power consumption by a
              meaningful amount compared to a light-colored one.
            </p>
          </section>

          <section className="static-section">
            <h2>Which Phones Have AMOLED Screens?</h2>
            <p>
              AMOLED or OLED screens are found in every iPhone from the iPhone X onwards,
              all Samsung Galaxy S and Z series phones, Google Pixel 4 and later, most
              OnePlus flagships from the OnePlus 7 Pro onwards, and the majority of
              Xiaomi and Oppo flagship devices. If you are unsure whether your phone has
              an AMOLED screen, search for your model name followed by "display type."
            </p>
          </section>

          <section className="static-section">
            <h2>Choosing the Right AMOLED Wallpaper</h2>
            <p>
              For maximum visual impact and battery benefit, look for wallpapers where
              the background is true black (hex #000000) or very close to it. All
              wallpapers in the Dark Minimal Horror collection are designed with this
              in mind — near-black backgrounds with high-contrast subjects that look
              extraordinary on OLED screens.
            </p>
            <p>
              The Android collection in particular is optimised for AMOLED displays,
              since Android flagship phones have used AMOLED technology consistently
              longer than iPhones.
            </p>
            <p>
              <Link href="/android">Browse AMOLED-optimised Android wallpapers →</Link>
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}