import Link from "next/link";

const NAV_LINKS = [
  { label: "iPhone",      href: "/iphone"      },
  { label: "Android",     href: "/android"     },
  { label: "PC",          href: "/pc"          },
  { label: "Collections", href: "/collections" },
];

export default function Header() {
  return (
    <nav className="site-nav">
      <Link href="/" className="nav-logo">
        HAUNTED<span className="logo-red">WALLPAPERS</span>
      </Link>

      <ul className="nav-links">
        {NAV_LINKS.map(({ label, href }) => (
          <li key={label}>
            <Link href={href}>{label}</Link>
          </li>
        ))}
      </ul>

      <button className="btn-cart">Cart (0)</button>
    </nav>
  );
}