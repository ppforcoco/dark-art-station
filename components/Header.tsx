// components/Header.tsx
'use client';

import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, Search, Shuffle, Compass } from "lucide-react";

const NAV_LINKS = [
  { label: "iPhone",      href: "/iphone"      },
  { label: "Android",     href: "/android"     },
  { label: "PC",          href: "/pc"          },
  { label: "Collections", href: "/collections" },
];

// Quick-suggestion tags shown in the search overlay
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

  const searchInputRef = useRef<HTMLInputElement>(null);
  const closeMenu   = useCallback(() => setMenuOpen(false), []);
  const toggleMenu  = useCallback(() => setMenuOpen(prev => !prev), []);
  const openSearch  = useCallback(() => {
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  }, []);
  const closeSearch = useCallback(() => { setSearchOpen(false); setQuery(""); }, []);
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

  const handleRandom = useCallback(async () => {
    try {
      const res = await fetch("/api/random-wallpaper");
      if (!res.ok) return;
      const img = await res.json();
      const device = img.deviceType === "IPHONE" ? "iphone"
                   : img.deviceType === "ANDROID" ? "android" : "pc";
      router.push(`/${device}/${img.slug}`);
    } catch {}
  }, [router]);

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
          {/* Search */}
          <button type="button" className="nav-icon-btn" title="Search wallpapers"
            onClick={openSearch} aria-label="Search wallpapers"
            style={{ touchAction: "manipulation" }}>
            <Search size={16} strokeWidth={1.5} />
            <span className="nav-icon-label">Search</span>
          </button>

          {/* Explore / Seasonal */}
          <Link href="/collections" className="nav-icon-btn" title="Explore Collections"
            aria-label="Explore collections" style={{ touchAction: "manipulation" }}>
            <Compass size={16} strokeWidth={1.5} />
            <span className="nav-icon-label">Explore</span>
          </Link>

          {/* Random wallpaper */}
          <button type="button" className="nav-icon-btn" title="Surprise me — random wallpaper"
            onClick={handleRandom} aria-label="Random wallpaper"
            style={{ touchAction: "manipulation" }}>
            <Shuffle size={16} strokeWidth={1.5} />
            <span className="nav-icon-label">Random</span>
          </button>

          {/* Theme toggle */}
          <button type="button" className="nav-icon-btn btn-theme-toggle"
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            style={{ touchAction: "manipulation" }}>
            <span style={{ fontSize: "1rem", lineHeight: 1 }}>{theme === "dark" ? "☀" : "☽"}</span>
            <span className="nav-icon-label">{theme === "dark" ? "Light" : "Dark"}</span>
          </button>
        </div>

        {/* Mobile controls */}
        <div className="nav-mobile-controls">
          <button type="button" className="btn-hamburger btn-theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            style={{ touchAction: "manipulation" }}>
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

      {/* ── Search overlay with live suggestions ── */}
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
              <button type="submit" className="search-overlay-submit">Search</button>
            </form>

            {/* Live suggestion pills — always shown */}
            <div className="search-overlay-suggestions">
              <span className="search-overlay-suggestions-label">Popular themes</span>
              <div className="search-overlay-pills">
                {SEARCH_SUGGESTIONS
                  .filter(s => !query || s.includes(query.toLowerCase()))
                  .map(tag => (
                    <button
                      key={tag}
                      type="button"
                      className="search-overlay-pill"
                      onClick={() => handleSuggestion(tag)}
                    >
                      {tag}
                    </button>
                  ))}
              </div>
            </div>

            <div className="search-overlay-footer">
              <button type="button" className="search-overlay-random" onClick={() => { closeSearch(); handleRandom(); }}>
                <Shuffle size={14} strokeWidth={1.5} /> Surprise me
              </button>
              <button type="button" className="search-overlay-close" onClick={closeSearch}>
                <X size={16} strokeWidth={1.5} /> Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile slide-out menu ── */}
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
          <button type="button" className="mobile-random-btn" onClick={() => { closeMenu(); handleRandom(); }}>
            <Shuffle size={14} strokeWidth={1.5} /> Random Wallpaper
          </button>
          <p className="mobile-menu-watermark">HAUNTED<span>WALLPAPERS</span></p>
        </div>
      </div>
    </>
  );
}