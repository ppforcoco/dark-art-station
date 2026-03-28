// components/Footer.tsx
import Link from "next/link";
import type { JSX } from "react";

const SOCIAL_LINKS = [
  { label: "Pinterest", href: "https://www.pinterest.com/TheFreemiumWallpapers/" },
];

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
        <div className="footer-socials">
          {SOCIAL_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="social-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}