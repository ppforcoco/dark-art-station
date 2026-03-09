'use client';

import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, ShoppingCart, Search } from "lucide-react";

const NAV_LINKS = [
  { label: "iPhone",      href: "/iphone"      },
  { label: "Android",     href: "/android"     },
  { label: "PC",          href: "/pc"          },
  { label: "Collections", href: "/collections" },
];

export default function Header() {
  const router = useRouter();
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query,      setQuery]      = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const closeMenu   = useCallback(() => setMenuOpen(false), []);
  const toggleMenu  = useCallback(() => setMenuOpen(prev => !prev), []);

  const openSearch  = useCallback(() => {
    setSearchOpen(true);
    // focus after paint
    setTimeout(() => searchInputRef.current?.focus(), 50);
  }, []);
  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setQuery("");
  }, []);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    closeSearch();
    closeMenu();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }, [query, router, closeSearch, closeMenu]);

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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { closeMenu(); closeSearch(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeMenu, closeSearch]);

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

        {/* ── Desktop Right Cluster ── */}
        <div className="nav-right-cluster">
          {/* Search bar — expands on click */}
          <div className={`nav-search-wrap${searchOpen ? " nav-search-open" : ""}`}>
            <form onSubmit={handleSearch} className="nav-search-form">
              <button
                type="button"
                className="nav-search-icon-btn"
                onClick={searchOpen ? closeSearch : openSearch}
                aria-label={searchOpen ? "Close search" : "Open search"}
              >
                {searchOpen
                  ? <X size={16} strokeWidth={1.5} />
                  : <Search size={16} strokeWidth={1.5} />}
              </button>
              <input
                ref={searchInputRef}
                type="text"
                className="nav-search-input"
                placeholder="Search wallpapers…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                aria-label="Search"
              />
            </form>
          </div>

          <button className="btn-cart nav-cart-desktop">Cart (0)</button>
        </div>

        {/* ── Mobile Controls ── */}
        <div className="nav-mobile-controls">
          <button
            className="btn-hamburger btn-search-mobile"
            onClick={openSearch}
            aria-label="Search"
          >
            <Search size={18} strokeWidth={1.5} />
          </button>
          <button
            className="btn-hamburger"
            onClick={toggleMenu}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
          </button>
        </div>
      </nav>

      {/* ── Full-screen Search Overlay (mobile + desktop fallback) ── */}
      {searchOpen && (
        <div className="search-overlay" role="dialog" aria-label="Search">
          <div className="search-overlay-backdrop" onClick={closeSearch} />
          <div className="search-overlay-panel">
            <p className="search-overlay-label">THE ORACLE&apos;S EYE</p>
            <form onSubmit={handleSearch} className="search-overlay-form">
              <Search size={20} strokeWidth={1.2} className="search-overlay-icon" />
              <input
                ref={searchInputRef}
                type="text"
                className="search-overlay-input"
                placeholder="Search by theme, colour, device…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                autoFocus
              />
              {query && (
                <button type="button" className="search-overlay-clear" onClick={() => setQuery("")}>
                  <X size={16} strokeWidth={1.5} />
                </button>
              )}
            </form>
            <button type="button" className="search-overlay-close" onClick={closeSearch}>
              <X size={20} strokeWidth={1.5} /> Close
            </button>
          </div>
        </div>
      )}

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