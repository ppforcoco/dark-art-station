import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — HauntedWallpapers",
  description: "How HauntedWallpapers collects, uses, and protects your data.",
  // robots: noindex intentionally removed — AdSense reviewers must crawl this page
};

const LAST_UPDATED = "21 March 2026";
const SITE_NAME    = "HauntedWallpapers";
const SITE_URL     = "https://hauntedwallpapers.com";
const CONTACT_EMAIL = "hello@hauntedwallpapers.com";

export default function PrivacyPage() {
  return (
    <main className="static-page">
      <div className="static-page-inner">

        <header className="static-page-header">
          <p className="static-page-label">Legal</p>
          <h1 className="static-page-title">Privacy Policy</h1>
          <p className="static-page-meta">Last updated: {LAST_UPDATED}</p>
        </header>

        <div className="static-page-body">

          <section className="static-section">
            <h2>1. Introduction</h2>
            <p>
              Welcome to {SITE_NAME} (&quot;we,&quot; &quot;our,&quot; or
              &quot;us&quot;). This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you visit{" "}
              <a href={SITE_URL}>{SITE_URL}</a> (the &quot;Site&quot;). Please read
              this policy carefully. If you disagree with its terms, please stop
              using the Site.
            </p>
            <p>
              We reserve the right to make changes to this policy at any time. The
              date at the top of this page reflects the most recent revision. Your
              continued use of the Site after any changes constitutes acceptance of
              the updated policy.
            </p>
          </section>

          <section className="static-section">
            <h2>2. Information We Collect</h2>

            <h3>Information You Provide Voluntarily</h3>
            <p>
              We may collect personal information you provide when you:
            </p>
            <ul>
              <li>Subscribe to our newsletter</li>
              <li>Submit a contact form</li>
              <li>Complete a purchase or download</li>
            </ul>
            <p>
              This information may include your name, email address, and any message
              content you choose to send us.
            </p>

            <h3>Information Collected Automatically</h3>
            <p>
              When you visit the Site, certain information is collected automatically
              by our servers and third-party services, including:
            </p>
            <ul>
              <li>IP address (stored as a one-way hash for fraud prevention)</li>
              <li>Browser type and version</li>
              <li>Pages visited and time spent on those pages</li>
              <li>Referring URL</li>
              <li>Device type and operating system</li>
            </ul>
            <p>
              We do not use this information to identify you personally. It is used
              in aggregate to understand how visitors interact with the Site and to
              improve performance.
            </p>
          </section>

          <section className="static-section" id="cookies">
            <h2>3. Cookies &amp; Tracking Technologies</h2>
            <p>
              We use cookies — small text files stored on your device — and similar
              technologies to operate the Site and deliver advertising. Cookies do
              not contain personally identifiable information unless you have
              provided that information to us directly.
            </p>

            <h3>Types of Cookies We Use</h3>
            <ul>
              <li>
                <strong>Essential cookies:</strong> Required for the Site to function
                correctly (e.g. session management, download tracking).
              </li>
              <li>
                <strong>Analytics cookies:</strong> Used to understand traffic
                patterns and page performance. We may use Google Analytics for this
                purpose.
              </li>
              <li>
                <strong>Advertising cookies:</strong> Used by our advertising
                partners to serve relevant ads. See the AdSense section below for
                full details.
              </li>
            </ul>

            <h3>Consent for Advertising Cookies</h3>
            <p>
              When you first visit the Site, a cookie consent banner is displayed.
              Advertising cookies and personalised ads are only activated after you
              click &quot;Accept All.&quot; If you click &quot;Decline,&quot; no
              advertising cookies will be set. You may change your preference at any
              time by clearing your browser cookies and revisiting the Site.
            </p>

            <h3>Managing Cookies</h3>
            <p>
              You can control and/or delete cookies at any time through your browser
              settings. Disabling cookies may affect certain functionality of the
              Site, including the ability to download files. For more information
              about cookies and how to manage them, visit{" "}
              <a
                href="https://www.allaboutcookies.org"
                target="_blank"
                rel="noopener noreferrer"
              >
                allaboutcookies.org
              </a>
              .
            </p>
          </section>

          <section className="static-section" id="adsense">
            <h2>4. Google AdSense &amp; Advertising</h2>
            <p>
              {SITE_NAME} uses Google AdSense, an advertising service provided by
              Google LLC (&quot;Google&quot;), to display advertisements on our Site.
              Google AdSense uses cookies and web beacons to serve ads based on your
              prior visits to this Site or other websites on the internet.
            </p>

            <h3>How Google Uses Your Data</h3>
            <p>
              Google&apos;s use of advertising cookies enables it and its partners
              to serve ads based on your visit to our Site and/or other sites on the
              internet. Google may use the DoubleClick cookie to serve more relevant
              ads across the web and to limit the number of times a particular ad is
              shown to you.
            </p>
            <p>
              You may opt out of personalised advertising by visiting{" "}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google&apos;s Ads Settings
              </a>
              . Alternatively, you can opt out of third-party vendor cookies for
              personalised advertising by visiting{" "}
              <a
                href="https://www.aboutads.info/choices/"
                target="_blank"
                rel="noopener noreferrer"
              >
                aboutads.info
              </a>
              .
            </p>

            <h3>Publisher ID</h3>
            <p>
              Our Google AdSense Publisher ID is{" "}
              <code>ca-pub-4048523199842586</code>. This ID is public information
              used by Google to identify our Site as a publisher.
            </p>

            <h3>No Sale of Personal Data to Advertisers</h3>
            <p>
              We do not sell your personal data to advertisers. Ad targeting is
              managed entirely by Google&apos;s systems based on their own cookie
              and data policies. For full details, see{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google&apos;s Privacy Policy
              </a>
              .
            </p>
          </section>

          <section className="static-section">
            <h2>5. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Operate and maintain the Site</li>
              <li>Process downloads and purchases</li>
              <li>Send newsletters to subscribers who have opted in</li>
              <li>Respond to enquiries submitted through our contact form</li>
              <li>Monitor and analyse usage trends to improve the Site</li>
              <li>Prevent fraudulent downloads and abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
            <p>
              We do not use your information for automated decision-making or
              profiling that produces legal or similarly significant effects.
            </p>
          </section>

          <section className="static-section">
            <h2>6. Sharing of Information</h2>
            <p>
              We do not sell, trade, or rent your personal information to third
              parties. We may share information in the following limited circumstances:
            </p>
            <ul>
              <li>
                <strong>Service providers:</strong> We may share data with trusted
                third-party providers who assist us in operating the Site (e.g.
                hosting, email delivery, analytics). These providers are
                contractually obligated to keep your information confidential.
              </li>
              <li>
                <strong>Legal requirements:</strong> We may disclose your information
                if required to do so by law or in response to valid legal process.
              </li>
              <li>
                <strong>Business transfer:</strong> In the event of a merger,
                acquisition, or sale of assets, user information may be transferred
                as part of that transaction.
              </li>
            </ul>
          </section>

          <section className="static-section">
            <h2>7. Data Retention</h2>
            <p>
              We retain personal information only for as long as necessary to fulfil
              the purposes described in this policy, or as required by law. Email
              addresses collected for newsletters are retained until you unsubscribe.
              Download records are retained for up to 12 months for fraud prevention
              purposes.
            </p>
          </section>

          <section className="static-section">
            <h2>8. Children&apos;s Privacy</h2>
            <p>
              The Site is not directed at children under the age of 13. We do not
              knowingly collect personal information from children under 13. If you
              believe we have inadvertently collected such information, please contact
              us immediately and we will delete it.
            </p>
          </section>

          <section className="static-section">
            <h2>9. Your Rights</h2>
            <p>
              Depending on your location, you may have the following rights regarding
              your personal data:
            </p>
            <ul>
              <li>The right to access the personal data we hold about you</li>
              <li>The right to request correction of inaccurate data</li>
              <li>The right to request deletion of your data</li>
              <li>The right to withdraw consent where processing is based on consent</li>
              <li>The right to lodge a complaint with a supervisory authority</li>
            </ul>
            <p>
              To exercise any of these rights, please contact us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>
          </section>

          <section className="static-section">
            <h2>10. Third-Party Links</h2>
            <p>
              Our Site may contain links to third-party websites. We have no control
              over the content, privacy policies, or practices of those sites and
              accept no responsibility for them. We encourage you to review the
              privacy policy of every site you visit.
            </p>
          </section>

          <section className="static-section">
            <h2>11. Security</h2>
            <p>
              We use reasonable administrative, technical, and physical safeguards to
              protect your information. However, no method of transmission over the
              internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="static-section">
            <h2>12. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <ul>
              <li>
                Email:{" "}
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              </li>
            </ul>
          </section>

        </div>
      </div>
    </main>
  );
}