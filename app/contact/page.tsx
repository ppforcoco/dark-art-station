import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";

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

        <header className="static-page-header">
          <p className="static-page-label">Reach Out</p>
          <h1 className="static-page-title">Contact<br /><em>Us</em></h1>
          <p className="static-page-meta">
            We read every message. Response time is typically 1–3 business days.
          </p>
        </header>

        <div className="static-page-body">

          <section className="static-section">
            <h2>What We Can Help With</h2>
            <ul>
              <li>Technical issues with downloads or file formats</li>
              <li>Commercial and editorial licensing enquiries</li>
              <li>Custom commission requests</li>
              <li>Press and collaboration proposals</li>
              <li>Reporting a broken page or missing file</li>
              <li>Privacy and data requests (GDPR / CCPA)</li>
            </ul>
            <p>
              For answers to common questions, check our{" "}
              <a href="/faq">FAQ page</a> first — it may save you the wait.
            </p>
          </section>

          <section className="static-section">
            <h2>Send Us a Message</h2>
            <p style={{ marginBottom: "24px" }}>
              Fill in the form below or email us directly at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
              We respond within 1–3 business days.
            </p>
            <ContactForm />
          </section>

        </div>
      </div>
    </main>
  );
}