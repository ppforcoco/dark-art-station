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
            HAUNTED<span className="logo-red">WALLPAPERS</span>
          </Link>
          <p className="footer-brand-desc">
            Premium dark art for those who feel the difference. Original. Bold. AI-crafted for iPhone, Android, and every screen you carry.
          </p>
        </div>

        {/* ── Company ── */}
        <div className="footer-col">
          <h3 className="footer-col-title">Company</h3>
          <ul>
            <li><Link href="/all"             prefetch={false}>All Wallpapers</Link></li>
            <li><Link href="/obsessions"      prefetch={false}>The Archive</Link></li>
            <li><Link href="/live-wallpapers" prefetch={false}>🎬 Live Wallpapers</Link></li>
            <li><Link href="/mood"            prefetch={false}>Mood Wallpapers</Link></li>
            <li><Link href="/favorites"       prefetch={false}>♥ Saved Wallpapers</Link></li>
            <li><Link href="/blog"            prefetch={false}>The Secrets</Link></li>
            <li><Link href="/tools"           prefetch={false}>Free Tools</Link></li>
          </ul>
        </div>

        {/* ── Legal ── */}
        <div className="footer-col">
          <h3 className="footer-col-title">Legal</h3>
          <ul>
            <li><Link href="/about"     prefetch={false}>About</Link></li>
            <li><Link href="/contact"   prefetch={false}>Contact</Link></li>
            <li><Link href="/faq"       prefetch={false}>FAQ</Link></li>
            <li><Link href="/privacy"   prefetch={false}>Privacy Policy</Link></li>
            <li><Link href="/licensing" prefetch={false}>Licensing &amp; Usage</Link></li>
            <li><Link href="/dmca"      prefetch={false}>DMCA &amp; Copyright</Link></li>
          </ul>
        </div>

      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-left">
          <span className="footer-copy">
            © {year ?? ""} HauntedWallpapers. All rights reserved. New visions arrive each night.
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