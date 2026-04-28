import type { Metadata } from "next";
import AdSlot from "@/components/AdSlot";
import { getPageContent } from "@/lib/db";

export const metadata: Metadata = {
  title: "FAQ — HauntedWallpapers",
  description:
    "Answers to common questions about downloading, file formats, device " +
    "compatibility, and how HauntedWallpapers works.",
  robots: { index: true, follow: true },
};

const FAQS: { q: string; a: React.ReactNode; text: string }[] = [
  {
    q: "Are the wallpapers really free?",
    text: "Yes. Every wallpaper on HauntedWallpapers is completely free to download with no account required. Simply browse, tap any image, and hit the Download button — no sign-up, no payment.",
    a: (
      <>
        Yes. Every wallpaper on HauntedWallpapers is completely free to download
        with no account required. Simply browse, tap any image, and hit the
        Download button — no sign-up, no payment.
      </>
    ),
  },
  {
    q: "How do I set a wallpaper on iPhone?",
    text: "Download the image, open the Photos app and locate it, tap the Share icon, then tap Use as Wallpaper. Choose Home Screen, Lock Screen, or both, adjust positioning, and tap Set.",
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
    text: "Download the image — it saves to Downloads or Gallery. Long-press an empty area of your home screen, select Wallpapers, tap My Photos or Gallery, select the downloaded image, and choose Home screen, Lock screen, or both. On Samsung, open the image in Gallery and tap the three-dot menu then Set as wallpaper.",
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
    text: "Windows: right-click the desktop, select Personalise, then Background, then Browse, and select your downloaded image. Mac: go to System Settings, then Wallpaper, then Add Photo, and select your downloaded image.",
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
    text: "All wallpapers are provided as high-quality JPEG files — compatible with every device including iPhone, Android, PC, Mac, and tablet. No special apps or converters are needed.",
    a: (
      <>
        All wallpapers are provided as high-quality <strong>JPEG</strong> files —
        the standard format compatible with every device (iPhone, Android, PC,
        Mac, tablet). JPEG gives excellent visual quality at a small file size,
        making downloads fast. No special apps or converters are needed.
      </>
    ),
  },
  {
    q: "Can I use these wallpapers commercially?",
    text: "No — downloads are licensed for personal use only. Commercial use requires a separate licence. See the Licensing and Terms page for full details or contact us to discuss a commercial licence.",
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
    text: "Try disabling any ad-blocker temporarily, try a different browser like Chrome or Firefox, check your device's available storage, and if the issue persists use the contact form with the image name.",
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
    text: "Yes. Every image is created using AI generation tools guided by our own prompts and creative direction. Each image is individually reviewed and curated — we discard the vast majority of outputs.",
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
    text: "Advertising is how we keep the site free. HauntedWallpapers uses Google AdSense to display relevant ads that fund server costs, storage, and content curation.",
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
    text: "We aim to release new collections and standalone images on a regular basis. Check back often or follow us on Pinterest to stay up to date with new drops.",
    a: (
      <>
        We aim to release new collections and standalone images on a regular
        basis. Check back often or follow us on{" "}
        <a href="https://www.pinterest.com/TheFreemiumWallpapers/" target="_blank" rel="noopener noreferrer">
          Pinterest
        </a>{" "}
        to stay up to date with new drops.
      </>
    ),
  },
];

export default async function FaqPage() {
  const pageContent = await getPageContent("faq");
  return (
    <main className="static-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map(({ q, a: _a, text }) => ({
              "@type": "Question",
              name: q,
              acceptedAnswer: {
                "@type": "Answer",
                text,
              },
            })),
          }),
        }}
      />
      <div className="static-page-inner">
        <header className="static-page-header">
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
          {pageContent?.body && (
            <section className="static-section" style={{ marginTop: "40px" }}>
              <div dangerouslySetInnerHTML={{ __html: pageContent.body }} />
            </section>
          )}
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