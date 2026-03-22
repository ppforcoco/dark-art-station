import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

export const metadata: Metadata = {
  title: "How to Set a Wallpaper on Android | Haunted Wallpapers",
  description: "How to set a custom wallpaper on Samsung Galaxy, Google Pixel, OnePlus, and other Android phones. Includes tips for AMOLED screens and lock screen wallpapers.",
  alternates: { canonical: `${SITE_URL}/guides/how-to-set-wallpaper-android` },
  openGraph: {
    title: "How to Set a Wallpaper on Android | Haunted Wallpapers",
    description: "Step-by-step guide for Samsung, Pixel, OnePlus and all Android phones.",
    url: `${SITE_URL}/guides/how-to-set-wallpaper-android`,
    siteName: "Haunted Wallpapers",
    type: "article",
  },
};

export default function AndroidWallpaperGuidePage() {
  return (
    <main className="static-page">
      <div className="static-page-inner">

        <header className="static-page-header">
          <p className="static-page-label">Android Guide</p>
          <h1 className="static-page-title">How to Set a<br /><em>Wallpaper on Android</em></h1>
        </header>

        <div className="static-page-body">

          <section className="static-section">
            <h2>Before You Start</h2>
            <p>
              Download the wallpaper from the wallpaper page — it will save to your
              gallery automatically. All Android wallpapers on this site are portrait
              9:16 format at a minimum of 1080×1920 pixels, which fits every modern
              Android flagship including Samsung Galaxy, Google Pixel, OnePlus, and
              Xiaomi devices. No account required, no watermarks.
            </p>
          </section>

          <section className="static-section">
            <h2>Method 1 — From Your Gallery App</h2>
            <p>
              This is the simplest method and works on every Android phone. Open your
              Gallery or Photos app and find the wallpaper you just downloaded — it will
              be in your Downloads or Recents folder. Tap the image to open it, then tap
              the three-dot menu or the share icon and select Set as Wallpaper or Use as
              Wallpaper. Choose whether to set it as Home Screen, Lock Screen, or Both.
            </p>
          </section>

          <section className="static-section">
            <h2>Method 2 — From Settings</h2>
            <p>
              Long press on an empty area of your home screen and tap Wallpapers or
              Wallpaper &amp; Style. Tap My Photos or Gallery and select the downloaded
              image. Adjust the crop if needed and confirm. This method gives you more
              precise crop control on Samsung and OnePlus devices.
            </p>
          </section>

          <section className="static-section">
            <h2>Samsung Galaxy Specific Steps</h2>
            <p>
              On Samsung phones, long press the home screen and tap Wallpapers and
              Themes. Tap Gallery in the top tab to use your own photos. Select the
              image, set the crop, and choose Home Screen, Lock Screen, or Home and Lock
              Screens. Samsung also supports separate wallpapers for lock and home screens
              which is useful for layering different dark aesthetics.
            </p>
          </section>

          <section className="static-section">
            <h2>Google Pixel Specific Steps</h2>
            <p>
              On Pixel phones, long press the home screen and tap Wallpaper &amp; style.
              Tap My photos at the top. Find the downloaded image in your gallery and
              select it. Pixel OS will let you preview both home and lock screen views
              before confirming. The Pixel also supports cinematic wallpapers — imported
              photos do not use this feature but look excellent as static wallpapers.
            </p>
          </section>

          <section className="static-section">
            <h2>AMOLED Screen Tips</h2>
            <p>
              If your phone has an AMOLED or Super AMOLED display — which includes all
              Samsung flagships and most Pixel phones — dark wallpapers have an extra
              advantage. Pure black areas in the image cause those pixels to switch off
              completely, resulting in deeper blacks and reduced battery drain. Our dark
              wallpapers are designed with AMOLED screens in mind.
            </p>
            <p>
              To maximise the effect, enable Dark Mode in your phone settings and use
              an adaptive brightness setting. This lets the deep blacks in your wallpaper
              contrast sharply with the bright areas of your apps.
            </p>
          </section>

          <section className="static-section">
            <h2>Browse Android Wallpapers</h2>
            <p>
              All wallpapers in the Android collection are portrait 9:16 and sized for
              modern flagship screens.{" "}
              <Link href="/android">Browse the full Android wallpaper collection →</Link>
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}