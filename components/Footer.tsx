// components/Footer.tsx
import Link from "next/link";

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://instagram.com/hauntedwallpapers" },
  { label: "Pinterest", href: "https://pinterest.com/hauntedwallpapers" },
  // Uncomment when profiles are live:
  // { label: "TikTok",    href: "https://tiktok.com/@hauntedwallpapers" },
  // { label: "ArtStation",href: "https://artstation.com/hauntedwallpapers" },
];

export default function Footer() {
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
          </ul>
        </div>

        {/* ── Popular ── */}
        <div className="footer-col">
          <h4 className="footer-col-title">Popular</h4>
          <ul>
            <li><Link href="/shop/dark-humor-wallpaper-collection">Dark Humor</Link></li>
            <li><Link href="/shop/incognito-mode-collection">Incognito Mode</Link></li>
            <li><Link href="/shop/dark-fantasy-art">Dark Fantasy</Link></li>
            <li><Link href="/shop/skull-peeking-collection">Skull Peeking</Link></li>
            <li><Link href="/shop/horror-movie-posters">Horror Posters</Link></li>
            <li><Link href="/shop/dark-minimal-horror">Dark Minimal</Link></li>
          </ul>
        </div>

        {/* ── Company ── */}
        <div className="footer-col">
          <h4 className="footer-col-title">Company</h4>
          <ul>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/guides">Guides &amp; Tips</Link></li>
            <li><Link href="/licensing">Licensing</Link></li>
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
            <li><Link href="/privacy#cookies">Cookie Policy</Link></li>
            <li><Link href="/privacy#adsense">Advertising</Link></li>
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