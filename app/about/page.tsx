import type { Metadata } from "next";
import AdSlot from "@/components/AdSlot";
import { getPageContent } from "@/lib/db";

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
            <p>
              Our aunt&apos;s house sat on the edge of a graveyard. She told us
              about the abandoned hospital nearby — the strange sounds that came
              from empty corridors at hours when no one should be there.
            </p>
            <p>
              And then there was the witch. She was sitting in a wheelchair on a
              rooftop. Hair covering her face, head tilted down, completely still.
              The kind of image that burns itself into you at a young age and never
              fully leaves. You don&apos;t forget something like that.
            </p>
            <p>
              We didn&apos;t grow up reading about horror. We grew up <em>inside</em> it.
              That&apos;s the difference.
            </p>
          </section>

          <section className="static-section">
            <h2>What We Build</h2>
            <p>
              HauntedWallpapers is an independent dark art studio. Every image is
              crafted using AI generation pipelines — diffusion models, custom-trained
              style embeddings, iterative curation — shaped by people who have a
              genuine sense of what dark art should <em>feel</em> like. Not just
              look like. Feel like.
            </p>
            <p>
              We cover dark fantasy, horror aesthetics, street art, cyberpunk decay,
              cosmic dread, gothic atmosphere, and everything living in the shadows
              between those genres. iPhone, Android, PC — every screen. Thousands
              of wallpapers. All free.
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
              No dark patterns. Great dark art should be free.
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
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px 60px" }}>
        <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} width={728} height={90} />
      </div>
    </main>
  );
}