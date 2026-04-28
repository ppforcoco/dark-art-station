// components/Footer.tsx
"use client";

import Link from "next/link";
import type { JSX } from "react";

export default function Footer(): JSX.Element {
  return (
    <footer className="site-footer">
      <div className="footer-grid">

        {/* ── Brand ── */}
        <div className="footer-col footer-col--brand">
          <Link href="/" className="nav-logo">
            HAUNTED<span className="logo-red">WALLPAPERS</span>
          </Link>
          <p className="footer-brand-desc">
            Premium dark art for those who feel the difference. Original. Bold. AI-crafted for iPhone, Android, and every screen you carry. Some wallpapers just decorate. These ones wait. No explanations. No echoes. Just mystery in 4K. Download what should not be this quiet.
          </p>
        </div>

        {/* ── Company ── */}
        <div className="footer-col">
          <h4 className="footer-col-title">Company</h4>
          <ul>
            <li><Link href="/obsessions">Collections</Link></li>
            <li><Link href="/mood">Mood Wallpapers</Link></li>
            <li><Link href="/favorites">♥ Saved Wallpapers</Link></li>
            <li><Link href="/blog">Blog &amp; Guides</Link></li>
            <li><Link href="/tools">Free Tools</Link></li>
          </ul>
        </div>

        {/* ── Legal ── */}
        <div className="footer-col">
          <h4 className="footer-col-title">Legal</h4>
          <ul>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/licensing">Licensing &amp; Usage</Link></li>
            <li><Link href="/dmca">DMCA &amp; Copyright</Link></li>
          </ul>
        </div>

      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-left">
          <span className="footer-copy">
            © {new Date().getFullYear()} HauntedWallpapers. All rights reserved. New visions arrive each night. You keep what finds you.
          </span>
          <span className="footer-ai-disclosure">
            All artwork on this site is AI-generated using diffusion model pipelines.
          </span>
        </div>
        <div className="footer-bottom-right">
          <button
            className="footer-report-btn"
            onClick={() => window.dispatchEvent(new CustomEvent("open-feedback"))}
            aria-label="Report a problem"
          >
            <span aria-hidden="true">⚑</span> Report Issue
          </button>
        </div>
      </div>

      <style>{`
        .footer-bottom-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .footer-ai-disclosure {
          font-family: var(--font-space), monospace;
          font-size: 0.55rem;
          letter-spacing: 0.08em;
          color: #4a445a;
          line-height: 1.5;
        }
        [data-theme="fog"] .footer-ai-disclosure {
          color: #9a9288;
        }
      `}</style>
    </footer>
  );
}