import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Refund Policy — MR4K Walls",
  description: "Our refund policy for digital wallpaper pack downloads.",
};

const LAST_UPDATED = "12 September 2026";
const SITE_NAME     = "MR4K Walls";
const CONTACT_EMAIL = "hello@mr4kwalls.com";

export default function RefundPolicyPage() {
  return (
    <main className="static-page">
      <div className="static-page-inner">

        <Breadcrumbs items={[
          { label: "Home", href: "/" },
          { label: "Refund Policy" },
        ]} />

        <header className="static-page-header">
          <h1 className="static-page-title">Refund Policy</h1>
          <p className="static-page-meta">Last updated: {LAST_UPDATED}</p>
        </header>
        <div className="static-page-body">
          <section className="static-section">
            <h2>1. Digital Products — All Sales Are Final</h2>
            <p>Everything sold by {SITE_NAME} is a digital download — a wallpaper pack, bundle, or file delivered instantly to you after checkout. Because the file is available to you immediately and can be copied indefinitely, we&apos;re unable to offer refunds once a download link has been issued, including for change of mind or accidental purchase. All sales are final.</p>
          </section>
          <section className="static-section" id="corrupted-missing">
            <h2>2. Corrupted, Missing, or Incorrect Files</h2>
            <p>We stand behind the quality of every pack. If your download link doesn&apos;t work, the file is corrupted, or you received the wrong content, we&apos;ll fix it or replace it — no questions asked.</p>
            <p>To request help:</p>
            <ul>
              <li>Email us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> within <strong>14 days</strong> of purchase</li>
              <li>Describe the issue (broken link, missing files, wrong pack, etc.)</li>
              <li>Include your order number if available</li>
            </ul>
            <p>Once we&apos;ve confirmed the issue, we&apos;ll send a working download link right away.</p>
          </section>
          <section className="static-section">
            <h2>3. Duplicate Purchases</h2>
            <p>If you were accidentally charged twice for the same order, contact us within 14 days and we&apos;ll refund the duplicate charge.</p>
          </section>
          <section className="static-section">
            <h2>4. Requests After 14 Days</h2>
            <p>We&apos;re unable to offer fixes or refunds for issues reported more than 14 days after purchase, so please check your download as soon as you receive it and reach out promptly if there&apos;s a problem.</p>
          </section>
          <section className="static-section">
            <h2>5. Contact Us</h2>
            <p>Questions about this policy or an order? Email us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we&apos;ll be happy to help.</p>
          </section>
        </div>

      </div>
    </main>
  );
}