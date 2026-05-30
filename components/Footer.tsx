// components/Footer.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import type { JSX } from "react";

export default function Footer(): JSX.Element {
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => { setYear(new Date().getFullYear()); }, []);

  return (
    <footer className="site-footer hw-footer-slim">
      <div className="hw-footer-cols">

        <div className="hw-footer-col">
          <h3 className="hw-footer-col-title">Browse</h3>
          <ul className="hw-footer-list">
            <li><Link href="/all"        prefetch={false}>All Wallpapers</Link></li>
            <li><Link href="/obsessions" prefetch={false}>The Archive</Link></li>
            <li><Link href="/mood"       prefetch={false}>Mood Wallpapers</Link></li>
            <li><Link href="/favorites"  prefetch={false}>♥ Saved</Link></li>
            <li><Link href="/blog"       prefetch={false}>The Secrets</Link></li>
            <li><Link href="/tools"      prefetch={false}>Free Tools</Link></li>
          </ul>
        </div>

        <div className="hw-footer-col">
          <h3 className="hw-footer-col-title">Legal</h3>
          <ul className="hw-footer-list">
            <li><Link href="/about"     prefetch={false}>About</Link></li>
            <li><Link href="/contact"   prefetch={false}>Contact</Link></li>
            <li><Link href="/faq"       prefetch={false}>FAQ</Link></li>
            <li><Link href="/privacy"   prefetch={false}>Privacy</Link></li>
            <li><Link href="/licensing" prefetch={false}>Licensing</Link></li>
            <li><Link href="/dmca"      prefetch={false}>DMCA</Link></li>
          </ul>
        </div>

      </div>

      <div className="hw-footer-bottom">
        <div className="hw-footer-bottom-left">
          <span className="hw-footer-copy">
            © {year ?? ""} HauntedWallpapers. All rights reserved.
          </span>
          <span className="hw-footer-disclosure">
            All artwork is AI-generated using diffusion model pipelines.
          </span>
        </div>
        <button
          className="footer-report-btn"
          onClick={() => window.dispatchEvent(new CustomEvent("open-feedback"))}
          aria-label="Report a problem"
        >
          <span aria-hidden="true">⚑</span> Report Issue
        </button>
      </div>

      <style>{`
        /* ── Slim footer overrides ─────────────────────────── */
        .hw-footer-slim {
          padding: 20px 32px 16px !important;
        }
        @media (max-width: 639px) {
          .hw-footer-slim {
            padding: 16px 16px 12px !important;
          }
          body:not(.sticky-ad-dismissed) .hw-footer-slim {
            padding-bottom: calc(58px + 12px + env(safe-area-inset-bottom)) !important;
          }
        }

        .hw-footer-cols {
          display: flex;
          flex-direction: row;
          gap: 40px;
          margin-bottom: 14px;
          flex-wrap: wrap;
        }

        .hw-footer-col {
          min-width: 0;
        }

        .hw-footer-col-title {
          font-family: var(--font-space), monospace;
          font-size: 0.55rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #c0b8d8;
          margin: 0 0 8px;
        }

        .hw-footer-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          gap: 2px 14px;
        }

        .hw-footer-list li { margin: 0; }

        .hw-footer-list a {
          font-family: var(--font-cormorant), Georgia, serif;
          font-size: 0.88rem;
          font-style: italic;
          color: #7a7490;
          text-decoration: none;
          transition: color 0.2s;
          white-space: nowrap;
        }
        .hw-footer-list a:hover { color: #d4cde8; }

        /* ── Bottom bar ── */
        .hw-footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 12px;
          border-top: 1px solid #2a2535;
          gap: 12px;
          flex-wrap: wrap;
        }

        .hw-footer-bottom-left {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .hw-footer-copy {
          font-family: var(--font-space), monospace;
          font-size: 0.55rem;
          letter-spacing: 0.08em;
          color: #a09aaf;
        }

        .hw-footer-disclosure {
          font-family: var(--font-space), monospace;
          font-size: 0.5rem;
          letter-spacing: 0.06em;
          color: #8a8099;
          line-height: 1.4;
        }

        [data-theme="fog"] .hw-footer-copy      { color: #6a6070 !important; }
        [data-theme="fog"] .hw-footer-disclosure { color: #9a9288 !important; }
        [data-theme="fog"] .hw-footer-list a     { color: #7a7060 !important; }
        [data-theme="fog"] .hw-footer-col-title  { color: #5a5060 !important; }

        @media (max-width: 480px) {
          .hw-footer-cols    { gap: 20px; }
          .hw-footer-list    { gap: 2px 10px; }
          .hw-footer-list a  { font-size: 0.82rem; }
        }
      `}</style>
    </footer>
  );
}