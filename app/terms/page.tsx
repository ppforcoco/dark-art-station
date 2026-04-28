import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Licensing & Terms of Use — HauntedWallpapers",
  description:
    "Understand your rights when downloading art from HauntedWallpapers. " +
    "Personal use is always free. Commercial use requires a licence.",
  robots: { index: true, follow: true },
};

const LAST_UPDATED   = "20 March 2026";
const CONTACT_EMAIL  = "hello@hauntedwallpapers.com";

export default function LicensingPage() {
  return (
    <main className="static-page">
      <div className="static-page-inner">

        <header className="static-page-header">
          <p className="static-page-label">Legal</p>
          <h1 className="static-page-title">Licensing &amp;<br /><em>Terms of Use</em></h1>
          <p className="static-page-meta">Last updated: {LAST_UPDATED}</p>
        </header>

        <div className="static-page-body">

          <section className="static-section">
            <h2>Overview</h2>
            <p>
              All artwork available on HauntedWallpapers is created by us using
              AI generation tools. Unless otherwise stated, all images are our
              intellectual property. By downloading any image from this Site, you
              agree to the terms below.
            </p>
          </section>

          <section className="static-section">
            <h2>Personal Use Licence — Free</h2>
            <p>
              Every image on HauntedWallpapers may be downloaded and used for
              personal, non-commercial purposes at no cost. This includes:
            </p>
            <ul>
              <li>Setting an image as a wallpaper on your personal device(s)</li>
              <li>Printing an image for your own private display (not for sale)</li>
              <li>Sharing images on personal social media with credit to
                HauntedWallpapers</li>
            </ul>
            <p>
              Personal use means use solely for your own enjoyment, with no direct
              or indirect financial gain.
            </p>
          </section>

          <section className="static-section">
            <h2>What Is Not Permitted</h2>
            <p>
              The following uses are <strong>not permitted</strong> without a
              separate commercial licence:
            </p>
            <ul>
              <li>Selling or reselling our images (as prints, merchandise,
                NFTs, or any other format)</li>
              <li>Using our images in paid products, apps, or services</li>
              <li>Using our images in advertising or promotional material
                for a business</li>
              <li>Removing or obscuring any watermark or attribution</li>
              <li>Claiming our artwork as your own original creation</li>
              <li>Uploading our images to stock photo or AI training datasets</li>
            </ul>
          </section>

          <section className="static-section">
            <h2>Commercial Licence</h2>
            <p>
              If you wish to use our artwork for commercial purposes — including
              product mockups, brand assets, merchandise, or editorial use — please
              contact us to discuss a commercial licence.
            </p>
            <p>
              Commercial licences are granted on a per-image or per-collection
              basis. Pricing is determined by intended use, distribution scale,
              and exclusivity.
            </p>
            <p>
              Contact:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </p>
          </section>

          <section className="static-section">
            <h2>Premium Downloads</h2>
            <p>
              Some images and collections are available as paid &quot;Premium&quot;
              downloads. Purchasing a premium download grants you an extended
              personal licence, which includes:
            </p>
            <ul>
              <li>Access to the highest available resolution file</li>
              <li>Use across all of your personal devices</li>
              <li>Use in personal print-on-demand items (for personal use only,
                not for resale)</li>
            </ul>
            <p>
              Premium downloads do not grant commercial rights unless a separate
              commercial licence has been purchased.
            </p>
          </section>

          <section className="static-section">
            <h2>Attribution</h2>
            <p>
              Attribution is not required for personal use but is always
              appreciated. If you share our work publicly, please credit
              &quot;HauntedWallpapers.com&quot; in your post or description.
            </p>
          </section>

          <section className="static-section">
            <h2>Disclaimer</h2>
            <p>
              All artwork is provided &quot;as is&quot; without warranty of any
              kind. We make no guarantees regarding the fitness of any image for
              a particular purpose. We are not liable for any damages arising from
              the use or inability to use our images.
            </p>
          </section>

          <section className="static-section">
            <h2>Changes to These Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued
              use of the Site following any changes constitutes acceptance of
              the revised terms. The date at the top of this page reflects the
              most recent update.
            </p>
          </section>

          <section className="static-section">
            <h2>Questions?</h2>
            <p>
              If you have any questions about licensing, please reach out at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}