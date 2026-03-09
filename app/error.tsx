'use client';
// app/error.tsx
// Shown when an unhandled runtime error occurs in a route segment.
// MUST be a Client Component (Next.js requirement for error boundaries).

import { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
  error:  Error & { digest?: string };
  reset:  () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to your error tracking service here if you add one later
    console.error("[SANCTUM ERROR]", error);
  }, [error]);

  return (
    <main className="error-page">
      <div className="error-inner">

        <div className="error-sigil" aria-hidden="true">⚠ ✦ ⚠</div>

        <span className="error-code">500</span>
        <h1 className="error-title">A Rift in the Ritual</h1>
        <p className="error-desc">
          Something fractured in the abyss. The dark forces are working to seal the wound.
          You may try again, or retreat to safer ground.
        </p>

        {error.digest && (
          <p className="error-digest">Rift signature: {error.digest}</p>
        )}

        <div className="error-actions">
          <button onClick={reset} className="error-btn-primary">Try Again</button>
          <Link href="/" className="error-btn-secondary">Return to the Sanctum</Link>
        </div>

      </div>
    </main>
  );
}