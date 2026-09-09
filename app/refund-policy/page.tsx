import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Refund Policy — MR4K Walls",
  description: "Our refund and replacement policy for custom print-on-demand orders.",
};

const LAST_UPDATED = "6 September 2026";
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
            <h2>1. All Sales Are Final</h2>
            <p>Every item sold by {SITE_NAME} is custom printed on demand specifically for you when you place your order. Because production begins immediately and each piece is made to order, we are unable to accept returns or offer refunds for change of mind, incorrect size selection, or similar reasons. All sales are final.</p>
          </section>
          <section className="static-section" id="damaged-defective">
            <h2>2. Damaged, Misprinted, or Defective Items</h2>
            <p>We stand behind the quality of every print. If your item arrives damaged, misprinted, or defective, we will send you a free replacement — no questions asked.</p>
            <p>To request a replacement:</p>
            <ul>
              <li>Email us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> within <strong>14 days</strong> of delivery</li>
              <li>Include a clear photo of the damaged, misprinted, or defective item</li>
              <li>Include your order number if available</li>
            </ul>
            <p>Once we&apos;ve reviewed your photo, we will send out a free replacement right away. There is no need to return the original item unless we ask you to.</p>
          </section>
          <section className="static-section">
            <h2>3. Requests After 14 Days</h2>
            <p>We&apos;re unable to offer replacements for damage or defect claims submitted more than 14 days after delivery, so please check your item as soon as it arrives and reach out promptly if there&apos;s a problem.</p>
          </section>
          <section className="static-section">
            <h2>4. Contact Us</h2>
            <p>Questions about this policy or an order? Email us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we&apos;ll be happy to help.</p>
          </section>
        </div>

      </div>
    </main>
  );
}