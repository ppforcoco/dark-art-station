import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <Link href="/" className="nav-logo">
            VOID<span className="logo-red">CANVAS</span>
          </Link>
          <p className="footer-brand-desc">
            Premium dark art for the damned, the divine, and everyone gloriously
            in between. Digital wallpapers, prints, and occult designs.
          </p>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">Collections</h4>
          <ul>
            {["Dark Goddesses","Devils & Demons","Tarot Cards","Skeletons","Dark Humor","Free Downloads"].map(i => (
              <li key={i}><Link href="/shop">{i}</Link></li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">The Vault</h4>
          <ul>
            {["About","Licensing","Bundle Deals","Custom Orders","Affiliates"].map(i => (
              <li key={i}><Link href="#">{i}</Link></li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">Support</h4>
          <ul>
            {["How to Download","Refund Policy","Contact","FAQ","Privacy Policy"].map(i => (
              <li key={i}><Link href="#">{i}</Link></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span className="footer-copy">
          © 2025 VoidCanvas. All rights reserved. Souls collected daily.
        </span>
        <div className="footer-socials">
          {["Instagram","Pinterest","TikTok","ArtStation"].map(s => (
            <Link key={s} href="#" className="social-link">{s}</Link>
          ))}
        </div>
      </div>
    </footer>
  );
}