"use client";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

const NAV_LINKS = [
  { label: "iPhone",      href: "/iphone"      },
  { label: "Android",     href: "/android"     },
  { label: "PC",          href: "/pc"          },
  { label: "Obsessions",  href: "/collections" },
  { label: "Blog",        href: "/blog"        },
];

export default function Header() {
  const router = useRouter();
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const [query,      setQuery]      = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when menu open
  useEffect(() => {
    if (menuOpen) {
      const y = window.scrollY;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${y}px`;
      document.body.style.width = "100%";
    } else {
      const y = document.body.style.top;
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      if (y) window.scrollTo(0, parseInt(y || "0", 10) * -1);
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setMenuOpen(false); setSearchOpen(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openSearch = useCallback(() => {
    setSearchOpen(true);
    setMenuOpen(false);
    setTimeout(() => searchRef.current?.focus(), 60);
  }, []);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setSearchOpen(false);
    setQuery("");
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }, [query, router]);

  const handleRandom = useCallback(async () => {
    try {
      const res = await fetch("/api/random-wallpaper");
      if (res.ok) { const d = await res.json(); if (d?.href) { router.push(d.href); return; } }
    } catch {}
    const cats = ["iphone", "android", "pc"];
    router.push(`/${cats[Math.floor(Math.random() * cats.length)]}`);
    setMenuOpen(false);
  }, [router]);

  return (
    <>
      {/* ── NAV ── */}
      <header className={`hw2-nav${scrolled ? " hw2-nav--scrolled" : ""}`}>
        {/* Blood drip decoration */}
        <div className="hw2-nav__drip" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="hw2-nav__drip-drop" style={{ "--di": i } as React.CSSProperties} />
          ))}
        </div>

        <Link href="/" className="hw2-nav__logo" onClick={() => setMenuOpen(false)}>
          <span className="hw2-nav__logo-haunted">HAUNTED</span>
          <span className="hw2-nav__logo-wall">WALL</span><span className="hw2-nav__logo-papers">PAPERS</span>
        </Link>

        {/* Desktop links */}
        <nav className="hw2-nav__links" aria-label="Main navigation">
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} className="hw2-nav__link">
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hw2-nav__actions">
          <button className="hw2-nav__icon-btn" onClick={openSearch} aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
          <button className="hw2-nav__icon-btn" onClick={handleRandom} aria-label="Random wallpaper" title="Random wallpaper">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/>
              <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>
            </svg>
          </button>
          {/* Hamburger */}
          <button
            className={`hw2-nav__burger${menuOpen ? " hw2-nav__burger--open" : ""}`}
            onClick={() => setMenuOpen(p => !p)}
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      {/* ── SEARCH OVERLAY ── */}
      {searchOpen && (
        <div className="hw2-search-overlay" onClick={() => setSearchOpen(false)}>
          <form className="hw2-search-form" onClick={e => e.stopPropagation()} onSubmit={handleSearch}>
            <input
              ref={searchRef}
              className="hw2-search-input"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search wallpapers…"
              autoComplete="off"
            />
            <button type="submit" className="hw2-search-btn">Search</button>
            <button type="button" className="hw2-search-close" onClick={() => setSearchOpen(false)} aria-label="Close">✕</button>
          </form>
        </div>
      )}

      {/* ── MOBILE MENU ── */}
      <div className={`hw2-mobile-menu${menuOpen ? " hw2-mobile-menu--open" : ""}`} aria-hidden={!menuOpen}>
        <nav className="hw2-mobile-menu__nav">
          {NAV_LINKS.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              className="hw2-mobile-menu__link"
              style={{ "--mi": i } as React.CSSProperties}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <button className="hw2-mobile-menu__link hw2-mobile-menu__link--shuffle" onClick={handleRandom}>
            ⚡ Random Wallpaper
          </button>
        </nav>
        <div className="hw2-mobile-menu__watermark" aria-hidden="true">HAUNTED</div>
      </div>
      {menuOpen && <div className="hw2-mobile-menu__backdrop" onClick={() => setMenuOpen(false)} aria-hidden="true" />}
    </>
  );
}