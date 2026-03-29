// components/Footer.tsx
"use client";

import Link from "next/link";
import type { JSX } from "react";

const SOCIAL_LINKS = [
  { label: "Pinterest", href: "https://www.pinterest.com/TheFreemiumWallpapers/" },
];

function PinterestIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" style={{ flexShrink: 0 }} aria-hidden="true">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
    </svg>
  );
}

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
            Premium dark art for those who appreciate bold, original aesthetics.
            AI-generated wallpapers for iPhone, Android &amp; PC.
          </p>
        </div>

        {/* ── Collections ── */}
        <div className="footer-col">
          <h4 className="footer-col-title">Collections</h4>
          <ul>
            <li><Link href="/iphone">iPhone Wallpapers</Link></li>
            <li><Link href="/android">Android Wallpapers</Link></li>
            <li><Link href="/pc">PC &amp; Desktop</Link></li>
            <li><Link href="/collections">All Collections</Link></li>
            <li><Link href="/favorites">My Favorites ♡</Link></li>
          </ul>
        </div>

        {/* ── Explore ── */}
        <div className="footer-col">
          <h4 className="footer-col-title">Explore</h4>
          <ul>
            <li><Link href="/shop/dark-fantasy-art">Dark Fantasy</Link></li>
            <li><Link href="/shop/horror-movie-posters">Horror Posters</Link></li>
            <li><Link href="/shop/dark-minimal-horror">Dark Minimal</Link></li>
            <li><Link href="/shop/dark-humor-wallpaper-collection">Dark Humor</Link></li>
            <li><Link href="/gacha">Destiny Draw 🔮</Link></li>
          </ul>
        </div>

        {/* ── Seasonal Themes ── */}
        <div className="footer-col">
          <h4 className="footer-col-title">Seasonal</h4>
          <ul>
            <li><Link href="/halloween">🎃 Halloween</Link></li>
            <li><Link href="/dark-valentine">🖤 Dark Valentine</Link></li>
            <li><Link href="/day-of-the-dead">💀 Day of the Dead</Link></li>
            <li><Link href="/blood-moon">🌑 Crimson Moon</Link></li>
          </ul>
        </div>

        {/* ── Company ── */}
        <div className="footer-col">
          <h4 className="footer-col-title">Company</h4>
          <ul>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/blog">Blog &amp; Guides</Link></li>
            <li><Link href="/tools">Free Tools</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>

        {/* ── Legal ── */}
        <div className="footer-col">
          <h4 className="footer-col-title">Legal</h4>
          <ul>
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/terms">Terms of Service</Link></li>
            <li><Link href="/licensing">Licensing &amp; Usage</Link></li>
            <li><Link href="/dmca">DMCA &amp; Copyright</Link></li>
          </ul>
        </div>

      </div>

      <div className="footer-bottom">
        <span className="footer-copy">
          © {new Date().getFullYear()} HauntedWallpapers. All rights reserved.
          Visions collected daily.
        </span>

        <div className="footer-bottom-right">
          {/* ── Social Links ── */}
          <div className="footer-socials">
            <span className="footer-socials-label">Social</span>
            {SOCIAL_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="social-link social-link--pinterest"
                target="_blank"
                rel="noopener noreferrer"
              >
                <PinterestIcon />
                {label}
              </a>
            ))}
          </div>

          {/* ── Report Issue ── */}
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