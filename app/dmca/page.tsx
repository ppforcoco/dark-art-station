import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "DMCA & Copyright — HauntedWallpapers",
  description:
    "DMCA takedown policy for HauntedWallpapers. How to report copyright " +
    "infringement and what happens when we receive a valid notice.",
  robots: { index: true, follow: true },
};

const CONTACT_EMAIL  = "hello@hauntedwallpapers.com";
const LAST_UPDATED   = "23 March 2026";
const SITE_NAME      = "HauntedWallpapers";

export default function DmcaPage() {
  return (
    <main className="static-page">
      <div className="static-page-inner">

        <Breadcrumbs items={[
          { label: "Home", href: "/" },
          { label: "DMCA & Copyright" },
        ]} />

        <header className="static-page-header">
          <h1 className="static-page-title">DMCA &amp;<br /><em>Copyright Policy</em></h1>
          <p className="static-page-meta">Last updated: {LAST_UPDATED}</p>
        </header>

        <div className="static-page-body">

          <section className="static-section">
            <h2>1. Our Commitment</h2>
            <p>
              {SITE_NAME} respects the intellectual property rights of others and
              expects users of our site to do the same. We respond promptly to
              notices of alleged copyright infringement that comply with the Digital
              Millennium Copyright Act (DMCA) and other applicable intellectual
              property laws.
            </p>
            <p>
              All images on HauntedWallpapers are reviewed before publication. If
              you believe any content on this site infringes your copyright or other
              intellectual property rights, please notify us using the process below.
            </p>
          </section>

          <section className="static-section">
            <h2>2. How to File a DMCA Takedown Notice</h2>
            <p>
              If you believe that content on our site infringes your copyright,
              please send a written notice to{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> with the
              subject line <strong>DMCA Takedown Request</strong> and include all
              of the following:
            </p>
            <ol>
              <li>
                Your full legal name and contact information (address, phone number,
                and email address).
              </li>
              <li>
                A description of the copyrighted work you claim has been infringed,
                or if multiple works are covered, a representative list.
              </li>
              <li>
                A description of the material that you claim is infringing and where
                it is located on our site (URL or sufficient detail to locate it).
              </li>
              <li>
                A statement that you have a good faith belief that the use of the
                material is not authorised by the copyright owner, its agent, or the
                law.
              </li>
              <li>
                A statement made under penalty of perjury that the information in your
                notice is accurate and that you are the copyright owner or authorised
                to act on behalf of the owner.
              </li>
              <li>
                Your physical or electronic signature.
              </li>
            </ol>
          </section>

          <section className="static-section">
            <h2>3. What Happens After We Receive a Notice</h2>
            <p>
              Upon receiving a valid DMCA takedown notice, we will:
            </p>
            <ul>
              <li>Review the notice for completeness and validity.</li>
              <li>Remove or disable access to the allegedly infringing content promptly if the notice is valid.</li>
            </ul>
            <p>
              We review all valid DMCA notices as promptly as possible.
            </p>
          </section>

          <section className="static-section">
            <h2>4. Counter-Notice</h2>
            <p>
              If you believe that content was removed as a result of mistake or
              misidentification, you may submit a counter-notice to{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> with:
            </p>
            <ol>
              <li>Your contact information.</li>
              <li>Identification of the removed material and its location before removal.</li>
              <li>
                A statement under penalty of perjury that you have a good faith belief
                the material was removed as a result of mistake or misidentification.
              </li>
              <li>
                A statement that you consent to the jurisdiction of the Federal
                District Court for your judicial district, or if outside the United
                States, any judicial district in which we may be found.
              </li>
              <li>Your physical or electronic signature.</li>
            </ol>
          </section>

        </div>
      </div>
    </main>
  );
}