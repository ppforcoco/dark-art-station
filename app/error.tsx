'use client';
// app/error.tsx
import { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
  error:  Error & { digest?: string };
  reset:  () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    // This sets the title dynamically for crawlers/users
    document.title = "Error | Haunted Wallpapers";
    console.error("[APP ERROR]", error);
  }, [error]);

  return (
    <main className="error-page">
      <div className="error-inner">
        <div className="error-sigil" aria-hidden="true">⚠ ✦ ⚠</div>
        <span className="error-code">500</span>
        <h1 className="error-title">Something Went Wrong</h1>
        <p className="error-desc">
          An unexpected error occurred. You can try again or head back to the homepage.
        </p>
        {error.digest && (
          <p className="error-digest">Error ID: {error.digest}</p>
        )}
        <div className="error-actions">
          <button onClick={reset} className="error-btn-primary">Try Again</button>
          <Link href="/" className="error-btn-secondary">Back to Home</Link>
        </div>
      </div>
    </main>
  );
}