import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

export const metadata: Metadata = {
  title: "How to Set a Wallpaper on iPhone | Haunted Wallpapers",
  description: "Step-by-step guide to setting a custom wallpaper on any iPhone. How to set your lock screen, home screen, and use iOS depth effects with dark wallpapers.",
  alternates: { canonical: `${SITE_URL}/guides/how-to-set-wallpaper-iphone` },
  openGraph: {
    title: "How to Set a Wallpaper on iPhone | Haunted Wallpapers",
    description: "Step-by-step guide to setting a custom wallpaper on any iPhone model.",
    url: `${SITE_URL}/guides/how-to-set-wallpaper-iphone`,
    siteName: "Haunted Wallpapers",
    type: "article",
  },
};

export default function IphoneWallpaperGuidePage() {
  return (
    <main className="static-page">
      <div className="static-page-inner">

        <header className="static-page-header">
          <p className="static-page-label">iPhone Guide</p>
          <h1 className="static-page-title">How to Set a<br /><em>Wallpaper on iPhone</em></h1>
        </header>

        <div className="static-page-body">

          <section className="static-section">
            <h2>What You Need</h2>
            <p>
              Any iPhone running iOS 14 or later. All wallpapers on Haunted Wallpapers are
              portrait format at 9:16 ratio, optimised for iPhone screens from iPhone 12
              through iPhone 16 Pro Max. Download the image first — it will save to your
              Photos library automatically.
            </p>
          </section>

          <section className="static-section">
            <h2>Step 1 — Download the Wallpaper</h2>
            <p>
              Open the wallpaper page and tap the Download Free button. The image saves
              directly to your Photos library in full resolution. No account is required
              and there are no watermarks on downloaded files.
            </p>
          </section>

          <section className="static-section">
            <h2>Step 2 — Open Settings</h2>
            <p>
              On your iPhone, open the Settings app and scroll down to Wallpaper. Tap Add
              New Wallpaper. This opens the wallpaper picker where you can choose from
              your Photos library.
            </p>
          </section>

          <section className="static-section">
            <h2>Step 3 — Choose Your Photo</h2>
            <p>
              Tap the Photos option in the top section of the wallpaper picker. Find the
              image you downloaded — it will be in your Recents album or All Photos. Tap
              it to open the preview.
            </p>
          </section>

          <section className="static-section">
            <h2>Step 4 — Adjust and Set</h2>
            <p>
              In the preview, pinch to zoom or drag to reposition the image. Most dark
              wallpapers from this site are already sized perfectly for iPhone, so minimal
              adjustment is needed. When you are happy with the framing, tap Add at the
              top right.
            </p>
            <p>
              iOS will ask whether to set it as your Lock Screen, Home Screen, or both.
              For dark wallpapers we recommend setting both — it creates a consistent
              moody look whether your phone is locked or in use.
            </p>
          </section>

          <section className="static-section">
            <h2>iPhone 14 and Later — Depth Effect</h2>
            <p>
              On iPhone 14, 15, and 16 models, iOS can apply a depth effect to wallpapers
              where the clock appears layered behind elements in the image. This works best
              with images that have a clear subject in the upper half. You can toggle the
              depth effect on or off in the wallpaper customisation screen — look for the
              three-dot menu at the bottom right of the lock screen preview.
            </p>
          </section>

          <section className="static-section">
            <h2>Tips for Dark Wallpapers</h2>
            <p>
              Dark wallpapers look best when your phone's display brightness is set to auto
              or medium. On OLED iPhones (iPhone X and later), truly black pixels in the
              wallpaper are displayed as pure black — the pixels are literally turned off —
              which makes dark wallpapers look deeper and more vivid than on LCD screens.
            </p>
            <p>
              If text on your lock screen is hard to read against a dark wallpaper, go to
              Settings → Accessibility → Display and Text Size and enable Increase Contrast.
            </p>
          </section>

          <section className="static-section">
            <h2>Browse iPhone Wallpapers</h2>
            <p>
              All wallpapers in the iPhone collection are portrait 9:16 format and sized
              for the latest iPhone screens.{" "}
              <Link href="/iphone">Browse the full iPhone wallpaper collection →</Link>
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}