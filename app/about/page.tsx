import type { Metadata } from "next";
import { getPageContent } from "@/lib/db";
import Breadcrumbs from "@/components/Breadcrumbs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About — HauntedWallpapers",
  description:
    "Two siblings raised on horror stories, graveyard houses, and jungle spirits. " +
    "HauntedWallpapers is not a studio — it's an obsession. The story behind the dark art.",
};

export default async function AboutPage() {
  const pageContent = await getPageContent("about");
  return (
    <main className="static-page">
      <div className="static-page-inner">

        <Breadcrumbs items={[
          { label: "Home", href: "/" },
          { label: "About" },
        ]} />

        <header className="static-page-header">
          <h1 className="static-page-title">Born in the Dark,<br /><em>Built for the Dark</em></h1>
        </header>

        <div className="static-page-body">

          <section className="static-section">
            <h2>We Are Not a Studio. We Are Obsessed.</h2>
            <p>
              HauntedWallpapers was built by two siblings — a brother and sister —
              who have loved horror since before they understood why. We grew up
              talking about ghosts, watching horror movies back to back, and
              genuinely never being scared. Not detached — <em>obsessed</em>.
              The dark was never something to run from. It was something to run
              <em> toward</em>.
            </p>
            <p>
              This site is the result of that obsession. Every wallpaper on here
              was curated by people who actually feel something when they look at
              dark art — not by an algorithm chasing clicks.
            </p>
          </section>

          <section className="static-section">
            <h2>Where It Comes From</h2>
            <p>
              Our father used to walk kilometres through the jungle at night. He
              described a presence that would follow him — not physical, nothing
              you could touch, but undeniably <em>there</em>. He&apos;d arrive home
              and the entity would stay, crying through the night, keeping him from
              sleep. He told us these stories like they were ordinary. They were not.
            </p>
          </section>

          <section className="static-section">
            <h2>What We Create</h2>
            <p>
              HauntedWallpapers is an independent wallpaper project created by two siblings who love horror, dark fantasy, and atmospheric artwork. Every image is
              crafted using AI generation pipelines — diffusion models, custom-trained
              style embeddings, iterative curation — shaped by people who have a
              genuine sense of what dark art should <em>feel</em> like.
            </p>
            <p>
              Our collection includes dark fantasy, gothic, cyberpunk, horror, street art, and atmospheric wallpapers for iPhone, Android, tablets, laptops, and desktop computers. Thousands of wallpapers are available to download for free.
            </p>
          </section>

          <section className="static-section">
            <h2>Who This Is For</h2>
            <p>
              For the person who never related to bright, cheerful phone themes.
              For whoever has a desktop that should feel like a statement, not a
              screensaver. For the art lover who wants something that actually
              unsettles them — in the best possible way — every morning. For anyone
              who has always felt more at home in the dark.
            </p>
            <p>
              We are funded by advertising. No paywalls. No subscriptions.
              No dark patterns. We believe great wallpapers should be accessible to everyone.
            </p>
          </section>

          <section className="static-section">
            <h2>Contact &amp; Community</h2>
            <p>
              Small team. Real people. If you have questions, requests, or something
              to report — visit our{" "}
              <a href="/contact">Contact page</a>. For licensing questions, see{" "}
              <a href="/licensing">Licensing &amp; Terms</a>.
            </p>
          </section>

          {pageContent?.body && (
            <section className="static-section">
              <div dangerouslySetInnerHTML={{ __html: pageContent.body }} />
            </section>
          )}

        </div>
      </div>
    </main>
  );
}