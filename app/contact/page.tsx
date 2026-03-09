import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — HauntedWallpapers",
  description:
    "Get in touch with the HauntedWallpapers team. Questions, licensing " +
    "enquiries, custom orders, and technical support.",
  robots: { index: true, follow: true },
};

const CONTACT_EMAIL = "hello@hauntedwallpapers.com";

// Contact form is a client component to handle state —
// the outer page stays a server component for metadata.
import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <main className="static-page">
      <div className="static-page-inner static-page-inner--narrow">

        <header className="static-page-header">
          <p className="static-page-label">Reach Out</p>
          <h1 className="static-page-title">Contact<br /><em>the Studio</em></h1>
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
              <li>Privacy and data requests</li>
            </ul>
            <p>
              For answers to common questions, check our{" "}
              <a href="/faq">FAQ page</a> first — it may save you the wait.
            </p>
          </section>

          <section className="static-section">
            <h2>Direct Email</h2>
            <p>
              Prefer to write directly?{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </p>
          </section>

          <section className="static-section">
            <h2>Send a Message</h2>
            {/* ContactForm is a 'use client' component */}
            <ContactForm />
          </section>

        </div>
      </div>
    </main>
  );
}