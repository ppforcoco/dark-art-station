import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Contact — HauntedWallpapers",
  description:
    "Get in touch with HauntedWallpapers. Questions, licensing " +
    "enquiries, custom orders, and technical support.",
  robots: { index: true, follow: true },
};

const CONTACT_EMAIL = "hello@hauntedwallpapers.com";

export default function ContactPage() {
  return (
    <main className="static-page">
      <div className="static-page-inner static-page-inner--narrow">

        <Breadcrumbs items={[
          { label: "Home", href: "/" },
          { label: "Contact" },
        ]} />

        <header className="static-page-header">
          <h1 className="static-page-title">Contact<br /><em>Us</em></h1>
        </header>

        <div className="static-page-body">

          <section className="static-section">
            <h2>What We Can Help With</h2>
            <ul>
              <li>Technical issues with downloads or file formats</li>
              <li>Commercial, editorial, and licensing enquiries</li>
              <li>Custom commission requests</li>
              <li>Press and collaboration proposals</li>
              <li>Reporting a broken page or missing file</li>
              <li>Privacy and data requests (GDPR / CCPA)</li>
            </ul>
            <p>
              For common questions about downloads, licensing, and wallpapers, please visit our{" "}
              <a href="/faq">FAQ page</a>.
            </p>
          </section>

          <section className="static-section">
            <h2>Get in Touch</h2>
            <p>
              Email us directly at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
              We respond within 1–3 business days.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}