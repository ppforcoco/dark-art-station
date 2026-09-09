// components/Footer.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import type { JSX } from "react";

export default function Footer(): JSX.Element {
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => { setYear(new Date().getFullYear()); }, []);

  return (
    <footer className="site-footer">
      <div className="footer-grid">

        {/* ── Brand ── */}
        <div className="footer-col footer-col--brand">
          <Link href="/" prefetch={false} className="nav-logo">
            MR4K<span className="logo-red">WALLS</span>
          </Link>
          <p className="footer-brand-desc">
            Premium wallpapers for people with main-character energy. Original. Bold. AI-crafted for iPhone, Android, and every screen you own.
          </p>
        </div>

        {/* ── Company ── */}
        <div className="footer-col">
          <h3 className="footer-col-title">Company</h3>
          <ul>
            <li><Link href="/shop"            prefetch={false}>🛒 Shop</Link></li>
            <li><Link href="/collections"   prefetch={false}>Collections</Link></li>
            <li><Link href="/live-wallpapers" prefetch={false}>🎬 Live Wallpapers</Link></li>
            <li><Link href="/favorites"       prefetch={false}>♥ Your Stash</Link></li>
            <li><Link href="/blog"            prefetch={false}>The Lowdown</Link></li>
            <li><Link href="/tools"           prefetch={false}>Tools</Link></li>
          </ul>
        </div>

        {/* ── Legal ── */}
        <div className="footer-col">
          <h3 className="footer-col-title">Legal</h3>
          <ul>
            <li><Link href="/about"     prefetch={false}>About</Link></li>
            <li><Link href="/contact"   prefetch={false}>Contact</Link></li>
            <li><Link href="/faq"       prefetch={false}>FAQ</Link></li>
            <li><Link href="/privacy"       prefetch={false}>Privacy Policy</Link></li>
            <li><Link href="/refund-policy" prefetch={false}>Refund Policy</Link></li>
            <li><Link href="/licensing"     prefetch={false}>Licensing &amp; Usage</Link></li>
            <li><Link href="/dmca"      prefetch={false}>DMCA &amp; Copyright</Link></li>
          </ul>
        </div>

      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-left">
          <span className="footer-copy">
            © {year ?? ""} MR4K Walls. All rights reserved. New drops land every week.
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
    </footer>
  );
}