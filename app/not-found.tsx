// app/not-found.tsx
// Shown whenever Next.js can't match a route or notFound() is called.
// No 'use client' needed — this is a Server Component.

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="error-page">
      <div className="error-inner">

        {/* Decorative sigil */}
        <div className="error-sigil" aria-hidden="true">☽ ✦ ☾</div>

        <span className="error-code">404</span>
        <h1 className="error-title">Page Not Found</h1>
        <p className="error-desc">
          This page doesn&apos;t exist or has been moved.
          Head back home to find what you&apos;re looking for.
        </p>

        <div className="error-actions">
          <Link href="/" className="error-btn-primary">Back to Home →</Link>
          <Link href="/shop" className="error-btn-secondary">Browse Collections</Link>
        </div>

      </div>
    </main>
  );
}