import type { Metadata } from "next";
import AdSlot from "@/components/AdSlot";

export const metadata: Metadata = {
  title: "FAQ — HauntedWallpapers",
  description:
    "Answers to common questions about downloading, file formats, device " +
    "compatibility, and how HauntedWallpapers works.",
  robots: { index: true, follow: true },
};

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "Are the wallpapers really free?",
    a: (
      <>
        Yes. The vast majority of our library is completely free to download with
        no account required. Some collections are marked <strong>Premium</strong> —
        these require a one-time purchase for the full-resolution bundle. Free
        versions of premium images are often still available at standard resolution.
      </>
    ),
  },
  {
    q: "What resolution are the wallpapers?",
    a: (
      <>
        Standard downloads are provided at a resolution suitable for the intended
        device (e.g. 1170×2532 for iPhone 14, 1440×3200 for flagship Android
        devices, and 3840×2160 for 4K desktop). Premium bundles include the
        highest available resolution, often 4K or above, generated natively by
        our AI pipeline.
      </>
    ),
  },
  {
    q: "How do I set a wallpaper on iPhone?",
    a: (
      <>
        <ol>
          <li>Download the image by tapping the download button.</li>
          <li>Open the <strong>Photos</strong> app and locate the image.</li>
          <li>Tap the <strong>Share</strong> icon (box with arrow), then tap{" "}
            <strong>Use as Wallpaper</strong>.</li>
          <li>Choose <strong>Home Screen</strong>, <strong>Lock Screen</strong>,
            or both.</li>
          <li>Adjust positioning and tap <strong>Set</strong>.</li>
        </ol>
      </>
    ),
  },
  {
    q: "How do I set a wallpaper on Android?",
    a: (
      <>
        <ol>
          <li>Download the image from the Site — it will save to your
            Downloads or Gallery.</li>
          <li>Long-press on an empty area of your home screen.</li>
          <li>Select <strong>Wallpapers</strong> or <strong>Wallpaper &amp;
            style</strong> (varies by manufacturer).</li>
          <li>Tap <strong>My photos</strong> or <strong>Gallery</strong> and
            select the downloaded image.</li>
          <li>Choose to apply to the Home screen, Lock screen, or both.</li>
        </ol>
        <p>
          On Samsung devices, you can also open the image in Gallery and tap the
          three-dot menu → <strong>Set as wallpaper</strong>.
        </p>
      </>
    ),
  },
  {
    q: "How do I set a wallpaper on PC or Mac?",
    a: (
      <>
        <p><strong>Windows:</strong> Right-click the desktop → Personalise →
          Background → Browse → select your downloaded image.</p>
        <p><strong>Mac:</strong> System Settings → Wallpaper → Add Photo →
          select your downloaded image. For a multi-monitor setup, you can
          assign different wallpapers to each display.</p>
      </>
    ),
  },
  {
    q: "What file format are the downloads?",
    a: (
      <>
        Most images are provided as high-quality <strong>JPEG</strong> files.
        Some premium bundles include <strong>PNG</strong> or{" "}
        <strong>WebP</strong> variants for lossless quality. ZIP bundles contain
        all variants for a given collection.
      </>
    ),
  },
  {
    q: "Can I use these wallpapers commercially?",
    a: (
      <>
        No — downloads from HauntedWallpapers are licensed for personal use only.
        Commercial use (merchandise, resale, advertising, etc.) requires a
        separate licence. See our{" "}
        <a href="/licensing">Licensing &amp; Terms</a> page for full details, or{" "}
        <a href="/contact">contact us</a> to discuss a commercial licence.
      </>
    ),
  },
  {
    q: "My download isn't working. What do I do?",
    a: (
      <>
        Try the following steps:
        <ol>
          <li>Disable any browser ad-blocker or pop-up blocker temporarily —
            these can sometimes interfere with download links.</li>
          <li>Try a different browser (Chrome or Firefox tend to be most
            reliable).</li>
          <li>Check your device&apos;s available storage — downloads will fail
            silently if there is insufficient space.</li>
          <li>If the issue persists, use our{" "}
            <a href="/contact">contact form</a> and include the image name —
            we will resolve it promptly.</li>
        </ol>
      </>
    ),
  },
  {
    q: "Are these images AI-generated?",
    a: (
      <>
        Yes. Every image on HauntedWallpapers is created using AI generation
        tools, guided by our own prompts and creative direction. Each image is
        individually reviewed and curated — we discard the vast majority of
        outputs. What you see on the Site represents a small fraction of what
        was generated.
      </>
    ),
  },
  {
    q: "Why do I see advertisements on the Site?",
    a: (
      <>
        Advertising is how we keep the site free. HauntedWallpapers uses Google
        AdSense to display relevant ads. These ads fund server costs, storage,
        and the time spent curating and generating new art. You can opt out of
        personalised ads via{" "}
        <a
          href="https://www.google.com/settings/ads"
          target="_blank"
          rel="noopener noreferrer"
        >
          Google&apos;s Ad Settings
        </a>
        . For more detail, see our{" "}
        <a href="/privacy#adsense">Privacy Policy — Advertising section</a>.
      </>
    ),
  },
  {
    q: "How often is new art added?",
    a: (
      <>
        We aim to release new collections and standalone images on a regular
        basis. Subscribe to our newsletter at the bottom of the home page to be
        notified of new drops as soon as they go live.
      </>
    ),
  },
];

export default function FaqPage() {
  return (
    <main className="static-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map(({ q, a }) => ({
              "@type": "Question",
              name: q,
              acceptedAnswer: {
                "@type": "Answer",
                text: typeof a === "string" ? a : q,
              },
            })),
          }),
        }}
      />
      <div className="static-page-inner">

        <header className="static-page-header">
          <p className="static-page-label">Help</p>
          <h1 className="static-page-title">
            Frequently<br /><em>Asked Questions</em>
          </h1>
        </header>

        <div className="static-page-body">
          <section className="faq-list">
            {FAQS.map(({ q, a }, i) => (
              <details key={i} className="faq-item">
                <summary className="faq-question">
                  <span>{q}</span>
                  <span className="faq-chevron" aria-hidden>+</span>
                </summary>
                <div className="faq-answer">{a}</div>
              </details>
            ))}
          </section>

          <section className="static-section" style={{ marginTop: "60px" }}>
            <h2>Still need help?</h2>
            <p>
              If your question isn&apos;t answered above, reach out via our{" "}
              <a href="/contact">contact page</a> and we will get back to you
              within 1–3 business days.
            </p>
          </section>
        </div>
      </div>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px 60px" }}>
        <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} width={728} height={90} />
      </div>
    </main>
  );
}