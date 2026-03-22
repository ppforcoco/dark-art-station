import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

export const metadata: Metadata = {
  title: "Dark Fantasy Art Styles Explained | Haunted Wallpapers",
  description: "A breakdown of the visual styles behind dark fantasy wallpaper art — gothic, dark surrealism, horror aesthetics, cosmic dark art, and how to find your aesthetic.",
  alternates: { canonical: `${SITE_URL}/guides/dark-fantasy-art-styles-explained` },
  openGraph: {
    title: "Dark Fantasy Art Styles Explained | Haunted Wallpapers",
    description: "Gothic, dark surrealism, horror, cosmic dark art — find your aesthetic.",
    url: `${SITE_URL}/guides/dark-fantasy-art-styles-explained`,
    siteName: "Haunted Wallpapers",
    type: "article",
  },
};

export default function DarkFantasyArtStylesPage() {
  return (
    <main className="static-page">
      <div className="static-page-inner">

        <header className="static-page-header">
          <p className="static-page-label">Art Guide</p>
          <h1 className="static-page-title">Dark Fantasy<br /><em>Art Styles Explained</em></h1>
        </header>

        <div className="static-page-body">

          <section className="static-section">
            <h2>What Is Dark Fantasy Art?</h2>
            <p>
              Dark fantasy art sits at the intersection of fantasy illustration and horror
              aesthetics. It draws from mythology, folklore, occult imagery, and gothic
              architecture to create images that feel atmospheric, unsettling, and often
              beautiful in a way that mainstream art rarely is. It is a broad category —
              a skeletal figure in baroque armour, a moonlit ruined castle, or a cosmic
              horror floating in deep space can all be dark fantasy art depending on tone
              and execution.
            </p>
            <p>
              As a wallpaper aesthetic, dark fantasy art appeals to people who want their
              screens to feel like a statement — something that reflects a distinct
              sensibility rather than a generic pleasant image.
            </p>
          </section>

          <section className="static-section">
            <h2>Gothic Art</h2>
            <p>
              Gothic art in the digital sense draws from the visual language of medieval
              European architecture and Victorian mourning culture. Pointed arches,
              gargoyles, candlelight, ravens, and skull motifs are recurring elements.
              The color palette tends toward deep purples, crimson reds, and cold stone
              greys. Gothic wallpapers are ornate and detailed — they reward close
              inspection. The Skeleton Card Collection and Tarot-influenced collections
              on this site fall squarely into this tradition.
            </p>
            <p>
              <Link href="/shop/skeleton-card-collection">Browse Gothic Art →</Link>
            </p>
          </section>

          <section className="static-section">
            <h2>Dark Surrealism</h2>
            <p>
              Dark surrealism takes dreamlike or impossible imagery and gives it a sinister
              or melancholic quality. Floating figures in dark voids, landscapes that
              obey impossible physics, creatures that are half-familiar and half-wrong.
              The mood is often reflective rather than frightening — a sense of standing
              at the edge of something vast and unknowable. This style makes for
              particularly compelling phone wallpapers because the unusual composition
              encourages you to look more closely each time you pick up your phone.
            </p>
          </section>

          <section className="static-section">
            <h2>Horror Aesthetics</h2>
            <p>
              Horror aesthetics in art focuses on dread, tension, and the uncanny rather
              than explicit gore. It borrows from horror cinema, creepypasta visual
              culture, and contemporary illustration to create images that produce a
              physical response — unease, adrenaline, or a cold recognition. The best
              horror wallpapers do this through implication rather than shock — a figure
              slightly too tall in a doorway, a face partially visible in a mirror,
              shadows that suggest rather than show.
            </p>
            <p>
              <Link href="/shop/dark-minimal-horror">Browse Horror Art →</Link>
            </p>
          </section>

          <section className="static-section">
            <h2>Cosmic and Occult Dark Art</h2>
            <p>
              Inspired by cosmic horror and dark visual traditions, cosmic dark
              art depicts entities, symbols, and voids at a scale that makes human figures
              seem irrelevant. Deep space, ancient symbols, eldritch creatures, and geometric
              circles are common motifs. The color palette often combines void black with
              spectral purples and greens. This style appeals to people who are drawn to
              the philosophical weight of insignificance — the idea that the universe is
              vast and indifferent, and there is beauty in acknowledging that.
            </p>
          </section>

          <section className="static-section">
            <h2>Dark Humor and Street Art</h2>
            <p>
              Not all dark wallpapers are earnestly atmospheric. Dark humor art uses
              skeleton figures, macabre imagery, and absurdist typography to make
              irreverent statements. Think a skeleton in a hoodie making a rude gesture,
              or a skull holding a coffee cup. This style bridges the gap between dark
              aesthetics and contemporary streetwear culture — it is for people who want
              to express an attitude as much as an aesthetic.
            </p>
            <p>
              <Link href="/shop/dark-humor-wallpaper-collection">Browse Dark Humor →</Link>
            </p>
          </section>

          <section className="static-section">
            <h2>Finding Your Aesthetic</h2>
            <p>
              The easiest way to find your preferred dark art style is to browse by
              collection and pay attention to which images make you want to stop scrolling.
              The collections page groups wallpapers by visual style and theme, making it
              easy to go deep on a specific aesthetic once you have identified what
              resonates with you.
            </p>
            <p>
              <Link href="/collections">Browse All Collections →</Link>
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}