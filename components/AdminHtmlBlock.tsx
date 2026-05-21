"use client";

import { useEffect, useRef } from "react";

/**
 * AdminHtmlBlock
 *
 * Renders admin-provided HTML inside a sandboxed iframe that:
 * - Auto-sizes to content height
 * - Injects responsive viewport + fluid base styles so HTML looks good on
 *   all screen sizes (mobile small, desktop large)
 */
export default function AdminHtmlBlock({ html }: { html: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument;
    if (!doc) return;

    const baseStyles = `
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        html, body {
          background: #0c0b14;
          color: #e8e4dc;
          margin: 0;
          padding: 0;
          width: 100%;
          overflow-x: hidden;
        }
        * {
          box-sizing: border-box;
          max-width: 100%;
        }
        img, video, iframe, svg {
          max-width: 100%;
          height: auto;
        }
        /* Fluid typography — small on mobile, larger on desktop */
        body {
          font-size: clamp(0.82rem, 2.2vw, 1rem);
          line-height: 1.7;
        }
        h1 { font-size: clamp(1.4rem, 4vw, 2.6rem); }
        h2 { font-size: clamp(1.2rem, 3vw, 2rem); }
        h3 { font-size: clamp(1rem, 2.5vw, 1.5rem); }
        h4, h5, h6 { font-size: clamp(0.9rem, 2vw, 1.2rem); }
        p, li, span, a { font-size: clamp(0.82rem, 2.2vw, 1rem); }
        /* Tables — scroll horizontally on mobile instead of breaking layout */
        table {
          width: 100%;
          border-collapse: collapse;
          display: block;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        /* Grids/flex — stack on mobile */
        @media (max-width: 520px) {
          [style*="display:grid"], [style*="display: grid"] {
            grid-template-columns: 1fr !important;
          }
          [style*="display:flex"], [style*="display: flex"] {
            flex-wrap: wrap !important;
          }
        }
      </style>
    `;

    doc.open();
    doc.write(baseStyles + html);
    doc.close();

    const resize = () => {
      try {
        const h = doc.documentElement.scrollHeight || doc.body?.scrollHeight || 400;
        iframe.style.height = h + "px";
      } catch {
        iframe.style.height = "400px";
      }
    };

    iframe.onload = resize;
    setTimeout(resize, 200);
    setTimeout(resize, 800);
    setTimeout(resize, 1500); // extra pass for slow-loading fonts/images
  }, [html]);

  return (
    <iframe
      ref={iframeRef}
      style={{
        width: "100%",
        height: "400px",
        border: "none",
        display: "block",
        marginBottom: "32px",
        backgroundColor: "var(--bg-primary, #0c0b14)",
        colorScheme: "dark",
      }}
      sandbox="allow-scripts allow-same-origin"
      title="Collection description"
    />
  );
}