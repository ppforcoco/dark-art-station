// components/Header.tsx
'use client';

import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, ShoppingCart, Search, Shuffle, Compass } from "lucide-react";

const NAV_LINKS = [
  { label: "iPhone",      href: "/iphone"      },
  { label: "Android",     href: "/android"     },
  { label: "PC",          href: "/pc"          },
  { label: "Collections", href: "/collections" },
];

const SEARCH_SUGGESTIONS = [
  "skull", "dark fantasy", "witch", "vampire", "skeleton",
  "gothic", "demon", "blood moon", "incognito", "tarot",
];

export default function Header() {
  const router = useRouter();
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [query,       setQuery]       = useState("");
  const [theme,       setTheme]       = useState<"dark"|"light">("dark");
  const [cursorOn,    setCursorOn]    = useState(true);

  // ── Theme ────────────────────────────────────────────────────
  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("hw-theme", next); } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("hw-theme") as "dark"|"light"|null;
      if (saved) {
        setTheme(saved);
        document.documentElement.setAttribute("data-theme", saved);
      }
    } catch {}
  }, []);

  // ── Custom Cursor toggle ──────────────────────────────────────
  const toggleCursor = useCallback(() => {
    setCursorOn(prev => {
      const next = !prev;
      document.documentElement.setAttribute("data-cursor", next ? "on" : "off");
      try { localStorage.setItem("hw-cursor", next ? "on" : "off"); } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("hw-cursor");
      if (saved === "off") {
        setCursorOn(false);
        document.documentElement.setAttribute("data-cursor", "off");
      }
    } catch {}
  }, []);

  // ── Search ───────────────────────────────────────────────────
  const searchInputRef = useRef<HTMLInputElement>(null);
  const closeMenu    = useCallback(() => setMenuOpen(false), []);
  const toggleMenu   = useCallback(() => setMenuOpen(prev => !prev), []);
  const openSearch   = useCallback(() => {
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  }, []);
  const closeSearch  = useCallback(() => { setSearchOpen(false); setQuery(""); }, []);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    closeSearch(); closeMenu();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }, [query, router, closeSearch, closeMenu]);

  const handleSuggestion = useCallback((tag: string) => {
    closeSearch(); closeMenu();
    router.push(`/search?q=${encodeURIComponent(tag)}`);
  }, [router, closeSearch, closeMenu]);

  // ── Random ───────────────────────────────────────────────────
  const handleRandom = useCallback(async () => {
    try {
      const res = await fetch("/api/random-wallpaper");
      if (!res.ok) return;
      const img = await res.json();
      if (!img?.slug) return;
      if (img.deviceType === "IPHONE")  { router.push(`/iphone/${img.slug}`);  return; }
      if (img.deviceType === "ANDROID") { router.push(`/android/${img.slug}`); return; }
      if (img.deviceType === "PC")      { router.push(`/pc/${img.slug}`);      return; }
      if (img.collection?.slug)         { router.push(`/shop/${img.collection.slug}/${img.slug}`); return; }
      router.push("/collections");
    } catch {}
  }, [router]);

  // ── Body scroll lock ─────────────────────────────────────────
  useEffect(() => {
    if (menuOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      if (scrollY) window.scrollTo(0, parseInt(scrollY || "0", 10) * -1);
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
      if (e.key === "Escape") { closeMenu(); closeSearch(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeMenu, closeSearch]);

  return (
    <>
      <nav className="site-nav">
        <Link href="/" className="nav-logo" onClick={closeMenu} style={{ touchAction: "manipulation" }}>
          <span className="logo-full">HAUNTED<span className="logo-red">WALLPAPERS</span></span>
          <span className="logo-compact">H<span className="logo-red">W</span></span>
        </Link>

        <ul className="nav-links">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}><Link href={href}>{label}</Link></li>
          ))}
        </ul>

        <div className="nav-right-cluster">
          {/* Search icon */}
          <button type="button" className="nav-icon-btn"
            onClick={searchOpen ? closeSearch : openSearch}
            aria-label={searchOpen ? "Close search" : "Open search"}>
            {searchOpen ? <X size={16} strokeWidth={1.5} /> : <Search size={16} strokeWidth={1.5} />}
          </button>

          {/* Compass / Explore seasonal */}
          <Link href="/collections" className="nav-icon-btn" aria-label="Explore collections">
            <Compass size={16} strokeWidth={1.5} />
          </Link>

          {/* Random / Shuffle */}
          <button type="button" className="nav-icon-btn"
            onClick={handleRandom} aria-label="Random wallpaper">
            <Shuffle size={16} strokeWidth={1.5} />
          </button>

          {/* Cursor toggle — text label like screenshot */}
          <button type="button" className="nav-text-btn" onClick={toggleCursor}
            aria-label="Toggle custom cursor">
            <span className="nav-text-btn-icon">⚙</span>
            <span>CURSOR</span>
          </button>

          {/* Theme toggle — "> DARK" or "> LIGHT" like screenshot */}
          <button type="button" className="nav-text-btn nav-text-btn--theme"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
            <span className="nav-text-btn-arrow">›</span>
            <span>{theme === "dark" ? "DARK" : "LIGHT"}</span>
          </button>
        </div>

        {/* Mobile controls */}
        <div className="nav-mobile-controls">
          <button type="button" className="btn-hamburger" onClick={toggleTheme}
            aria-label="Toggle theme" style={{ touchAction: "manipulation" }}>
            <span style={{ fontSize: "1rem", lineHeight: 1 }}>{theme === "dark" ? "☀" : "☽"}</span>
          </button>
          <button className="btn-hamburger btn-search-mobile" onClick={openSearch}
            aria-label="Search" style={{ touchAction: "manipulation" }}>
            <Search size={18} strokeWidth={1.5} />
          </button>
          <button className="btn-hamburger" onClick={toggleMenu}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen} style={{ touchAction: "manipulation" }}>
            {menuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
          </button>
        </div>
      </nav>

      {/* ── Search overlay ── */}
      {searchOpen && (
        <div className="search-overlay" role="dialog" aria-label="Search">
          <div className="search-overlay-backdrop" onClick={closeSearch} />
          <div className="search-overlay-panel">
            <p className="search-overlay-label">THE ORACLE&apos;S EYE</p>
            <form onSubmit={handleSearch} className="search-overlay-form">
              <Search size={20} strokeWidth={1.2} className="search-overlay-icon" />
              <input ref={searchInputRef} type="text" className="search-overlay-input"
                placeholder="Search by theme, colour, device…" value={query}
                onChange={e => setQuery(e.target.value)} inputMode="search"
                enterKeyHint="search" autoComplete="off" autoCorrect="off"
                autoCapitalize="none" spellCheck={false} />
              {query && (
                <button type="button" className="search-overlay-clear" onClick={() => setQuery("")}>
                  <X size={16} strokeWidth={1.5} />
                </button>
              )}
              <button type="submit" className="search-overlay-submit">SEARCH</button>
            </form>

            <div className="search-overlay-suggestions">
              <span className="search-overlay-sugg-label">Popular themes</span>
              <div className="search-overlay-pills">
                {SEARCH_SUGGESTIONS
                  .filter(s => !query || s.toLowerCase().includes(query.toLowerCase()))
                  .map(tag => (
                    <button key={tag} type="button" className="search-overlay-pill"
                      onClick={() => handleSuggestion(tag)}>
                      {tag}
                    </button>
                  ))}
              </div>
            </div>

            <div className="search-overlay-actions">
              <button type="button" className="search-overlay-random"
                onClick={() => { closeSearch(); handleRandom(); }}>
                <Shuffle size={13} strokeWidth={1.5} /> Surprise me
              </button>
              <button type="button" className="search-overlay-close" onClick={closeSearch}>
                <X size={16} strokeWidth={1.5} /> Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile menu ── */}
      <div className={`mobile-menu-overlay${menuOpen ? " mobile-menu-open" : ""}`} aria-hidden={!menuOpen}>
        <div className="mobile-menu-backdrop" onClick={closeMenu} />
        <div className="mobile-menu-panel">
          <div className="mobile-menu-topbar" />
          <nav className="mobile-menu-nav">
            {NAV_LINKS.map(({ label, href }, i) => (
              <Link key={label} href={href} className="mobile-menu-link"
                style={{ animationDelay: menuOpen ? `${0.08 + i * 0.07}s` : "0s", minHeight: "44px" }}
                onClick={closeMenu}>
                <span className="mobile-link-index">0{i + 1}</span>
                <span className="mobile-link-label">{label}</span>
                <span className="mobile-link-arrow">→</span>
              </Link>
            ))}
          </nav>
          <div className="mobile-menu-divider" />
          <button type="button" className="btn-cart mobile-menu-cart" onClick={closeMenu}>
            <ShoppingCart size={14} strokeWidth={1.5} /> Cart (0)
          </button>
          <p className="mobile-menu-watermark">HAUNTED<span>WALLPAPERS</span></p>
        </div>
      </div>
    </>
  );
}