import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — HauntedWallpapers",
  description:
    "The story behind HauntedWallpapers — an AI art studio obsessed with darkness, " +
    "atmosphere, and the beauty that lives at the edge of the unknown.",
};

export default function AboutPage() {
  return (
    <main className="static-page">
      <div className="static-page-inner">

        <header className="static-page-header">
          <p className="static-page-label">Our Story</p>
          <h1 className="static-page-title">The Art Factory<br /><em>at the Edge of the Dark</em></h1>
        </header>

        <div className="static-page-body">

          <section className="static-section">
            <h2>What Is HauntedWallpapers?</h2>
            <p>
              HauntedWallpapers is an independent digital art studio specialising in
              dark, atmospheric, and occult-inspired wallpapers for every screen — from
              the phone in your pocket to the monitor on your desk.
            </p>
            <p>
              Every image is crafted using advanced AI generation pipelines,
              hand-curated and post-processed to ensure each piece feels intentional,
              not accidental. We do not sell photographs. We do not sell clip art. We
              build worlds — then we shrink them down to fit your screen.
            </p>
          </section>

          <section className="static-section">
            <h2>The AI Art Factory</h2>
            <p>
              We use a combination of modern diffusion models, custom-trained style
              embeddings, and iterative curation to generate art that sits in a space
              between illustration and imagination. Prompts are developed over dozens
              of iterations. Images that don&apos;t reach our quality bar are
              discarded. Only the ones that genuinely unsettle us — in the best
              possible way — make it to the site.
            </p>
            <p>
              The result is a library of thousands of wallpapers spanning skulls,
              dark goddesses, tarot archetypes, cyberpunk decay, cosmic horror, and
              everything that lives in the shadows between those genres.
            </p>
          </section>

          <section className="static-section">
            <h2>Who Is This For?</h2>
            <p>
              For the person who has never related to bright, cheerful phone themes.
              For the desktop user who wants their setup to feel like a statement.
              For the art lover who wants something original on their screen every
              morning. For anyone who has ever felt more at home in the dark.
            </p>
            <p>
              Most of our library is completely free. Our belief is that great dark
              art should be accessible to everyone — not locked behind a paywall.
              Premium bundles exist for those who want full-resolution packs and
              exclusive drops, but you will never be forced to pay to enjoy this place.
            </p>
          </section>

          <section className="static-section">
            <h2>The Mission</h2>
            <p>
              To build the largest, highest-quality library of dark art wallpapers on
              the internet — and to keep it free for the people who need it most.
            </p>
            <p>
              We are funded entirely by advertising revenue and optional premium
              purchases. No subscriptions. No tracking walls. No dark patterns.
            </p>
          </section>

          <section className="static-section">
            <h2>Contact &amp; Community</h2>
            <p>
              We are a small, independent operation. If you have questions, requests,
              or want to report an issue, visit our{" "}
              <a href="/contact">Contact page</a>. For licensing questions, see our{" "}
              <a href="/licensing">Licensing &amp; Terms</a>.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}