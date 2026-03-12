import Link from "next/link";

// ── Update these to your real profile URLs when ready ──────────────────────
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
        <div>
          <Link href="/" className="nav-logo">
            HAUNTED<span className="logo-red">WALLPAPERS</span>
          </Link>
          <p className="footer-brand-desc">
            Premium dark art for the damned, the divine, and everyone gloriously
            in between. AI-generated wallpapers and occult designs for iPhone,
            Android &amp; PC.
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
            <li><Link href="/collections?filter=free">Free Downloads</Link></li>
          </ul>
        </div>

        {/* ── Company ── */}
        <div className="footer-col">
          <h4 className="footer-col-title">Company</h4>
          <ul>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/licensing">Licensing &amp; Terms</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>

        {/* ── Seasonal ── */}
        <div className="footer-col">
          <h4 className="footer-col-title">Seasonal</h4>
          <ul>
            <li><Link href="/halloween">Halloween Wallpapers</Link></li>
            <li><Link href="/dark">Dark &amp; Gothic</Link></li>
            <li><Link href="/skeleton">Skeleton Art</Link></li>
            <li><Link href="/goddess">Goddess &amp; Divine</Link></li>
            <li><Link href="/demon">Demon &amp; Occult</Link></li>
          </ul>
        </div>

        {/* ── Legal ── */}
        <div className="footer-col">
          <h4 className="footer-col-title">Legal</h4>
          <ul>
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/licensing">Terms of Use</Link></li>
            <li><Link href="/privacy#cookies">Cookie Policy</Link></li>
            <li><Link href="/privacy#adsense">Advertising</Link></li>
          </ul>
        </div>

      </div>

      <div className="footer-bottom">
        <span className="footer-copy">
          © {new Date().getFullYear()} HauntedWallpapers. All rights reserved.
          Souls collected daily.
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