"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset?: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
    console.error("[GLOBAL ERROR]", error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Something Went Wrong | Haunted Wallpapers</title>
        <style dangerouslySetInnerHTML={{ __html: `
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          html, body { background: #070710; min-height: 100vh; font-family: Georgia, serif; color: #d4cde8; }
          .ge-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 40px 24px; text-align: center; background: #070710; }
          .ge-inner { max-width: 540px; display: flex; flex-direction: column; align-items: center; gap: 20px; }
          .ge-sigil { font-size: 1.4rem; letter-spacing: 0.5em; color: rgba(192,0,26,0.4); }
          .ge-logo { font-family: Georgia, serif; font-size: 0.7rem; letter-spacing: 0.4em; text-transform: uppercase; color: #c0001a; text-decoration: none; }
          .ge-logo span { color: #4a445a; }
          .ge-code { font-family: monospace; font-size: 0.62rem; letter-spacing: 0.4em; text-transform: uppercase; color: #c0001a; border: 1px solid rgba(192,0,26,0.3); padding: 6px 18px; }
          .ge-title { font-size: clamp(1.6rem, 5vw, 2.6rem); font-weight: 700; color: #d4cde8; line-height: 1.2; }
          .ge-desc { font-style: italic; font-size: 1rem; color: #6a6080; line-height: 1.7; max-width: 400px; }
          .ge-digest { font-family: monospace; font-size: 0.5rem; letter-spacing: 0.1em; color: #2a2535; background: #0e0c18; padding: 6px 14px; border: 1px solid #1a1727; }
          .ge-actions { display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; margin-top: 8px; }
          .ge-btn-primary { font-family: monospace; font-size: 0.62rem; letter-spacing: 0.18em; text-transform: uppercase; color: #f0ecff; background: #c0001a; border: 1px solid #c0001a; padding: 14px 28px; cursor: pointer; transition: background 0.2s; }
          .ge-btn-primary:hover { background: #a00016; }
          .ge-btn-secondary { font-family: monospace; font-size: 0.62rem; letter-spacing: 0.18em; text-transform: uppercase; color: #c9a84c; background: transparent; border: 1px solid rgba(201,168,76,0.4); padding: 14px 28px; text-decoration: none; display: inline-flex; align-items: center; transition: background 0.2s, border-color 0.2s; }
          .ge-btn-secondary:hover { background: rgba(201,168,76,0.1); border-color: #c9a84c; }
        ` }} />
      </head>
      <body>
        <div className="ge-page">
          <div className="ge-inner">
            <a href="/" className="ge-logo">HAUNTED<span>WALLPAPERS</span></a>
            <div className="ge-sigil" aria-hidden="true">⚠ ✦ ⚠</div>
            <span className="ge-code">500</span>
            <h1 className="ge-title">Something Went Wrong</h1>
            <p className="ge-desc">
              An unexpected error occurred. You can try again or head back to the homepage.
            </p>
            {error.digest && (
              <p className="ge-digest">Error ID: {error.digest}</p>
            )}
            <div className="ge-actions">
              {reset && (
                <button onClick={reset} className="ge-btn-primary">Try Again</button>
              )}
              <a href="/" className="ge-btn-secondary">← Back to Home</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}