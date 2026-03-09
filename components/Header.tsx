'use client';

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Menu, X, ShoppingCart } from "lucide-react";

const NAV_LINKS = [
  { label: "iPhone",      href: "/iphone"      },
  { label: "Android",     href: "/android"     },
  { label: "PC",          href: "/pc"          },
  { label: "Collections", href: "/collections" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const toggleMenu = useCallback(() => setMenuOpen(prev => !prev), []);

  // Lock scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeMenu(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeMenu]);

  return (
    <>
      <nav className="site-nav">
        <Link href="/" className="nav-logo" onClick={closeMenu}>
          HAUNTED<span className="logo-red">WALLPAPERS</span>
        </Link>

        {/* ── Desktop Nav ── */}
        <ul className="nav-links">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}>
              <Link href={href}>{label}</Link>
            </li>
          ))}
        </ul>

        {/* ── Desktop Cart ── */}
        <button className="btn-cart nav-cart-desktop">Cart (0)</button>

        {/* ── Mobile Hamburger ── */}
        <button
          className="btn-hamburger"
          onClick={toggleMenu}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
        </button>
      </nav>

      {/* ── Mobile Overlay Menu ── */}
      <div
        className={`mobile-menu-overlay${menuOpen ? " mobile-menu-open" : ""}`}
        aria-hidden={!menuOpen}
      >
        {/* Backdrop */}
        <div className="mobile-menu-backdrop" onClick={closeMenu} />

        {/* Panel */}
        <div className="mobile-menu-panel">
          {/* Decorative top bar */}
          <div className="mobile-menu-topbar" />

          {/* Links */}
          <nav className="mobile-menu-nav">
            {NAV_LINKS.map(({ label, href }, i) => (
              <Link
                key={label}
                href={href}
                className="mobile-menu-link"
                style={{ animationDelay: menuOpen ? `${0.08 + i * 0.07}s` : "0s" }}
                onClick={closeMenu}
              >
                <span className="mobile-link-index">0{i + 1}</span>
                <span className="mobile-link-label">{label}</span>
                <span className="mobile-link-arrow">→</span>
              </Link>
            ))}
          </nav>

          {/* Divider */}
          <div className="mobile-menu-divider" />

          {/* Cart CTA */}
          <button className="btn-cart mobile-menu-cart" onClick={closeMenu}>
            <ShoppingCart size={14} strokeWidth={1.5} />
            Cart (0)
          </button>

          {/* Brand watermark */}
          <p className="mobile-menu-watermark">
            HAUNTED<span>WALLPAPERS</span>
          </p>
        </div>
      </div>
    </>
  );
}