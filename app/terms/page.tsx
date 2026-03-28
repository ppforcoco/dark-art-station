import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — HauntedWallpapers",
  description:
    "Terms of Service for HauntedWallpapers. Rules governing your use of the Site, " +
    "downloads, advertising, and your rights as a visitor.",
  robots: { index: true, follow: true },
};

const LAST_UPDATED  = "21 March 2026";
const SITE_NAME     = "HauntedWallpapers";
const SITE_URL      = "https://hauntedwallpapers.com";
const CONTACT_EMAIL = "hello@hauntedwallpapers.com";

export default function TermsPage() {
  return (
    <main className="static-page">
      <div className="static-page-inner">

        <header className="static-page-header">
          <p className="static-page-label">Legal</p>
          <h1 className="static-page-title">Terms of<br /><em>Service</em></h1>
          <p className="static-page-meta">Last updated: {LAST_UPDATED}</p>
        </header>

        <div className="static-page-body">

          <section className="static-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using {SITE_NAME} at{" "}
              <a href={SITE_URL}>{SITE_URL}</a> (the &quot;Site&quot;), you agree
              to be bound by these Terms of Service (&quot;Terms&quot;). If you do
              not agree to these Terms, please do not use the Site.
            </p>
            <p>
              We reserve the right to modify these Terms at any time. Changes take
              effect immediately upon posting. Your continued use of the Site after
              any modification constitutes your acceptance of the revised Terms. The
              date at the top of this page reflects the most recent update.
            </p>
          </section>

          <section className="static-section">
            <h2>2. Description of the Site</h2>
            <p>
              {SITE_NAME} is a digital art platform that offers dark fantasy, horror,
              gothic, and street-style wallpapers for personal download. Images are
              created using AI generation tools and curated by our team. The Site is
              free to use and supported by advertising revenue.
            </p>
          </section>

          <section className="static-section">
            <h2>3. Permitted Use</h2>
            <p>You may use the Site and download images for personal,
              non-commercial purposes only. Permitted uses include:</p>
            <ul>
              <li>Viewing and browsing artwork on the Site</li>
              <li>Downloading images to use as wallpapers on your personal devices</li>
              <li>Sharing images on personal social media with credit to {SITE_NAME}</li>
              <li>Printing images for your own private, non-commercial display</li>
            </ul>
          </section>

          <section className="static-section">
            <h2>4. Prohibited Use</h2>
            <p>You agree NOT to:</p>
            <ul>
              <li>Use the Site for any unlawful purpose</li>
              <li>Resell, redistribute, or sublicense any image downloaded from the Site</li>
              <li>Use images in any commercial product, service, or advertisement without a separate commercial licence</li>
              <li>Use automated tools, bots, or scrapers to bulk-download content</li>
              <li>Attempt to circumvent any download limits, access controls, or security features</li>
              <li>Upload our artwork to stock photo sites, AI training datasets, or any redistribution platform</li>
              <li>Claim our artwork as your own original creation</li>
              <li>Remove, alter, or obscure any watermark, credit, or attribution</li>
              <li>Interfere with or disrupt the integrity or performance of the Site</li>
            </ul>
          </section>

          <section className="static-section">
            <h2>5. Intellectual Property</h2>
            <p>
              All artwork, graphics, text, logos, and other content on the Site are
              the intellectual property of {SITE_NAME} unless otherwise stated. All
              rights are reserved. Nothing on this Site transfers ownership of any
              intellectual property to you.
            </p>
            <p>
              Downloading an image grants you a limited, non-exclusive,
              non-transferable personal use licence as described in our{" "}
              <a href="/licensing">Licensing &amp; Terms of Use</a> page. This
              licence does not include any right to sublicense, distribute, or use
              the image commercially.
            </p>
          </section>

          <section className="static-section">
            <h2>6. Advertising</h2>
            <p>
              The Site displays advertisements via Google AdSense to fund its
              operation and keep content free. By using the Site, you acknowledge
              that advertisements may be displayed alongside content. We do not
              endorse any advertiser or their products.
            </p>
            <p>
              Advertising cookies are only placed after you provide consent
              via our cookie banner. See our{" "}
              <a href="/privacy#adsense">Privacy Policy — Advertising section</a> for
              full details.
            </p>
          </section>

          <section className="static-section">
            <h2>7. User-Submitted Content</h2>
            <p>
              If you submit content to the Site — including through contact forms or
              newsletter sign-ups — you grant us a non-exclusive, royalty-free
              licence to use that content for the purposes of operating and improving
              the Site. You represent that you have the right to submit such content
              and that it does not violate any third-party rights.
            </p>
          </section>

          <section className="static-section">
            <h2>8. Third-Party Links</h2>
            <p>
              The Site may contain links to third-party websites. These links are
              provided for your convenience only. We have no control over the content
              of those sites and accept no responsibility for them or for any loss or
              damage that may arise from your use of them.
            </p>
          </section>

          <section className="static-section">
            <h2>9. Disclaimer of Warranties</h2>
            <p>
              The Site and all content are provided &quot;as is&quot; and &quot;as
              available&quot; without any warranties of any kind, express or implied,
              including but not limited to warranties of merchantability, fitness for
              a particular purpose, or non-infringement.
            </p>
            <p>
              We do not warrant that the Site will be uninterrupted, error-free, or
              free of viruses or other harmful components. We do not warrant the
              accuracy, completeness, or usefulness of any content on the Site.
            </p>
          </section>

          <section className="static-section">
            <h2>10. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by applicable law, {SITE_NAME} shall
              not be liable for any indirect, incidental, special, consequential, or
              punitive damages arising out of or related to your use of, or inability
              to use, the Site or its content — even if we have been advised of the
              possibility of such damages.
            </p>
            <p>
              Our total liability to you for any claim arising out of these Terms or
              your use of the Site shall not exceed the amount you paid to us, if
              any, in the twelve months preceding the claim.
            </p>
          </section>

          <section className="static-section">
            <h2>11. Governing Law</h2>
            <p>
              These Terms are governed by and construed in accordance with applicable
              law. Any disputes arising out of or related to these Terms or the Site
              shall be resolved through good-faith negotiation in the first instance.
            </p>
          </section>

          <section className="static-section">
            <h2>12. Contact</h2>
            <p>
              If you have any questions about these Terms, please contact us:
            </p>
            <ul>
              <li>
                Email:{" "}
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              </li>
              <li>
                Contact form:{" "}
                <a href="/contact">hauntedwallpapers.com/contact</a>
              </li>
            </ul>
          </section>

        </div>
      </div>
    </main>
  );
}