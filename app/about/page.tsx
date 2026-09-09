import type { Metadata } from "next";
import { getPageContent } from "@/lib/db";
import Breadcrumbs from "@/components/Breadcrumbs";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About — MR4K Walls",
  description:
    "Two siblings who got tired of boring default phone backgrounds and started " +
    "generating better ones with AI. No paywalls, no subscriptions — just wallpapers.",
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
          <h1 className="static-page-title">About <em>Us</em></h1>
        </header>

        <div className="static-page-body">

          <section className="static-section">
            <h2>You Actually Clicked the &ldquo;About Us&rdquo; Page?</h2>
            <p>
              Let&rsquo;s be honest, you probably misclicked while looking for a
              picture of a monkey wearing sunglasses. But since you are here, we
              might as well tell you what is going on.
            </p>
          </section>

          <section className="static-section">
            <h2>Why We Built This</h2>
            <p>
              We are a brother and sister team. We didn&rsquo;t build this site
              because of some deep, magical calling. We built it because we
              looked at the default backgrounds that come with a thousand-dollar
              phone and wanted to cry. A picture of a blurry leaf? A plain blue
              square? <strong>Absolute garbage.</strong> You pay way too much
              money for your phone, tablet, and PC for them to look that boring.
            </p>
          </section>

          <section className="static-section">
            <h2>How We Make Them</h2>
            <p>
              We use AI to generate every single image on this site. We type
              crazy, funny, and wild ideas into a computer, make the machine
              sweat, and then we handpick only the absolute best results. We do
              all the heavy lifting and sorting so you don&rsquo;t have to look
              at trash.
            </p>
          </section>

          <section className="static-section">
            <h2>Why Choose Us? (What&rsquo;s in it for you)</h2>
            <p>
              Because you stare at your screen a hundred times a day. Every time
              it lights up, it should make you laugh, feel like a total boss, or
              heavily confuse whoever is sitting next to you on the bus.
            </p>
            <p>
              We don&rsquo;t hide our stuff behind annoying paywalls or sneaky
              monthly subscriptions. The site is paid for by ads. That means you
              get to grab exactly what you want, totally for free, without
              whipping out your credit card.
            </p>
          </section>

          <section className="static-section">
            <h2>Real People, Real Talk</h2>
            <p>
              We are just two normal people making fun stuff for your devices.
              No massive corporate team, no robots running customer service. If
              a page breaks, you have a question, or you just want to tell us a
              joke, hit up our{" "}
              <a href="/contact">Contact page</a>.
            </p>
            <p>
              Otherwise, stop reading this boring page and go find a wallpaper
              that matches your ridiculous vibe.
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