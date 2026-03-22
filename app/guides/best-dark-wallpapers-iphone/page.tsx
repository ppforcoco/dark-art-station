import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

export const metadata: Metadata = {
  title: "Best Dark Wallpapers for iPhone 2026 | Haunted Wallpapers",
  description: "A curated guide to the best dark, gothic, horror, and aesthetic wallpapers for iPhone. Includes collections for OLED screens, minimalist dark art, and dark fantasy.",
  alternates: { canonical: `${SITE_URL}/guides/best-dark-wallpapers-iphone` },
  openGraph: {
    title: "Best Dark Wallpapers for iPhone 2026 | Haunted Wallpapers",
    description: "The best dark and gothic wallpapers for iPhone, curated by aesthetic.",
    url: `${SITE_URL}/guides/best-dark-wallpapers-iphone`,
    siteName: "Haunted Wallpapers",
    type: "article",
  },
};

export default function BestDarkWallpapersIphonePage() {
  return (
    <main className="static-page">
      <div className="static-page-inner">

        <header className="static-page-header">
          <p className="static-page-label">Curation Guide</p>
          <h1 className="static-page-title">Best Dark<br /><em>Wallpapers for iPhone</em></h1>
        </header>

        <div className="static-page-body">

          <section className="static-section">
            <h2>Why Dark Wallpapers Look Better on iPhone</h2>
            <p>
              Every iPhone from the iPhone X onwards uses an OLED or Super Retina XDR
              display. On these screens, a black pixel is a pixel that is literally turned
              off — it produces no light at all. This means a dark wallpaper does not just
              look darker, it looks more dramatic, with genuine blacks that LCD screens
              cannot reproduce. Dark wallpapers also reduce battery drain when Always-On
              display is enabled on iPhone 14 Pro and later.
            </p>
          </section>

          <section className="static-section">
            <h2>Dark Fantasy and Horror</h2>
            <p>
              The dark fantasy and horror category covers everything from gothic castles
              and skeletal figures to cosmic horror and creature art. These wallpapers
              suit people who want their phone screen to feel like a piece of original
              digital art rather than a generic aesthetic image. Collections like
              Dark Fantasy Art and Dark Minimal Horror are designed specifically for
              iPhone proportions with key subjects centred for the lock screen.
            </p>
            <p>
              <Link href="/shop/dark-fantasy-art">Browse Dark Fantasy Art →</Link>
            </p>
          </section>

          <section className="static-section">
            <h2>Dark Humor and Attitude</h2>
            <p>
              If you want your wallpaper to say something, the dark humor collections
              feature bold typography, skeleton characters, and imagery that leans into
              attitude rather than pure aesthetics. The Incognito Mode collection and
              Dark Humor collection are among the most downloaded on the site.
            </p>
            <p>
              <Link href="/shop/dark-humor-wallpaper-collection">Browse Dark Humor →</Link>
            </p>
          </section>

          <section className="static-section">
            <h2>Dark Minimal and Abstract</h2>
            <p>
              Minimal dark wallpapers — deep blacks with subtle textures, single-color
              gradients, or sparse geometric compositions — work particularly well on
              iPhones because they let the clock and widgets remain visible without
              competing for attention. The Dark Minimal Horror collection balances impact
              with restraint.
            </p>
            <p>
              <Link href="/shop/dark-minimal-horror">Browse Dark Minimal →</Link>
            </p>
          </section>

          <section className="static-section">
            <h2>Tarot and Gothic Art</h2>
            <p>
              Gothic and tarot-influenced wallpapers are among the most visually
              distinctive in the dark aesthetic space. The Skeleton Card Collection draws
              on tarot imagery for intricate, frame-worthy wallpapers that look as though
              they belong in a collector's archive rather than a phone grid.
            </p>
            <p>
              <Link href="/shop/skeleton-card-collection">Browse Tarot & Gothic →</Link>
            </p>
          </section>

          <section className="static-section">
            <h2>How to Choose the Right Dark Wallpaper</h2>
            <p>
              For the lock screen, choose wallpapers with the main subject in the upper
              half of the image — the clock sits over the lower portion on most iPhone
              lock screens. For the home screen, simpler or more abstract compositions
              work better since app icons sit on top of the image. Our device mockup
              preview on each wallpaper page shows you exactly how it will look before
              you download.
            </p>
          </section>

          <section className="static-section">
            <h2>Browse All iPhone Wallpapers</h2>
            <p>
              Every wallpaper in the iPhone section is portrait 9:16, free to download,
              and sized for the latest iPhone displays.{" "}
              <Link href="/iphone">See the full collection →</Link>
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}