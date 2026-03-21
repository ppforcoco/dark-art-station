// components/Header.tsx
'use client';

import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, Search } from "lucide-react";

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

  const overlayInputRef = useRef<HTMLInputElement>(null);
  const closeMenu    = useCallback(() => setMenuOpen(false), []);
  const toggleMenu   = useCallback(() => setMenuOpen(p => !p), []);
  const openSearch   = useCallback(() => {
    setSearchOpen(true);
    setMenuOpen(false);
    setTimeout(() => overlayInputRef.current?.focus(), 80);
  }, []);
  const closeSearch  = useCallback(() => { setSearchOpen(false); setQuery(""); }, []);
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    closeSearch(); closeMenu();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }, [query, router, closeSearch, closeMenu]);

  useEffect(() => {
    if (menuOpen) {
      const y = window.scrollY;
      document.body.style.overflow  = "hidden";
      document.body.style.position  = "fixed";
      document.body.style.top       = `-${y}px`;
      document.body.style.width     = "100%";
    } else {
      const y = document.body.style.top;
      document.body.style.overflow  = "";
      document.body.style.position  = "";
      document.body.style.top       = "";
      document.body.style.width     = "";
      if (y) window.scrollTo(0, parseInt(y || "0", 10) * -1);
    }
    return () => {
      document.body.style.overflow  = "";
      document.body.style.position  = "";
      document.body.style.top       = "";
      document.body.style.width     = "";
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
      <style>{`
        .hw-nav-icon {
          display: flex; align-items: center; justify-content: center;
          width: 36px; height: 36px;
          background: transparent;
          border: 1px solid rgba(139,0,0,0.3);
          color: #8a8099;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
          flex-shrink: 0;
        }
        @media (pointer: coarse) { .hw-nav-icon { width: 44px; height: 44px; } }
        .hw-nav-icon:hover { border-color: #c0001a; color: #c0001a; }

        .hw-search-overlay {
          position: fixed; inset: 0; z-index: 700;
          display: flex; flex-direction: column;
          align-items: center; justify-content: flex-start;
          padding-top: clamp(80px, 13vh, 130px);
        }
        @media (max-width: 767px) {
          .hw-search-overlay { padding-top: max(72px, calc(env(safe-area-inset-top, 0px) + 64px)); }
        }
        .hw-search-backdrop {
          position: absolute; inset: 0;
          background: rgba(4,3,12,0.94);
          backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
        }
        .hw-search-panel {
          position: relative; z-index: 1;
          width: min(700px, calc(100vw - 32px));
          display: flex; flex-direction: column; gap: 0;
          animation: hw-search-in 0.28s cubic-bezier(0.22,1,0.36,1);
        }
        @keyframes hw-search-in {
          from { opacity: 0; transform: translateY(-22px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .hw-search-eyebrow {
          font-family: var(--font-space, monospace);
          font-size: 0.52rem; letter-spacing: 0.38em; text-transform: uppercase;
          color: #c0001a; text-align: center; margin-bottom: 18px;
          display: flex; align-items: center; gap: 14px;
        }
        .hw-search-eyebrow::before, .hw-search-eyebrow::after {
          content: ""; flex: 1; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(192,0,26,0.45), transparent);
        }
        .hw-search-form-box {
          display: flex; align-items: stretch;
          border: 1px solid rgba(192,0,26,0.45);
          background: rgba(8,6,18,0.98);
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .hw-search-form-box:focus-within {
          border-color: rgba(192,0,26,0.85);
          box-shadow: 0 0 0 1px rgba(192,0,26,0.22), 0 14px 50px rgba(192,0,26,0.1);
        }
        .hw-search-icon-wrap {
          display: flex; align-items: center; justify-content: center;
          padding: 0 20px; color: rgba(192,0,26,0.7); flex-shrink: 0;
        }
        .hw-search-big-input {
          flex: 1; background: transparent; border: none; outline: none;
          color: #f0ecff; caret-color: #c0001a;
          font-family: var(--font-cormorant, serif);
          font-size: clamp(1.3rem, 3.5vw, 1.9rem); font-style: italic;
          padding: 22px 0; letter-spacing: 0.02em;
        }
        .hw-search-big-input::placeholder { color: rgba(90,80,110,0.5); font-style: italic; }
        .hw-search-clear {
          display: flex; align-items: center; justify-content: center;
          padding: 0 14px; background: transparent; border: none;
          color: #4a445a; cursor: pointer; flex-shrink: 0; transition: color 0.15s;
        }
        .hw-search-clear:hover { color: #c0001a; }
        .hw-search-submit {
          background: #c0001a; border: none; color: #f0ecff;
          padding: 0 26px; flex-shrink: 0;
          font-family: var(--font-space, monospace);
          font-size: 0.6rem; letter-spacing: 0.16em; text-transform: uppercase;
          cursor: pointer; transition: background 0.2s;
          display: flex; align-items: center;
        }
        .hw-search-submit:hover { background: #a80016; }
        .hw-search-close-row { display: flex; justify-content: center; margin-top: 22px; }
        .hw-search-close-btn {
          background: transparent; border: none; color: #2a2540; cursor: pointer;
          font-family: var(--font-space, monospace);
          font-size: 0.54rem; letter-spacing: 0.18em; text-transform: uppercase;
          display: flex; align-items: center; gap: 7px; transition: color 0.2s;
        }
        .hw-search-close-btn:hover { color: #6a6480; }
      `}</style>

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
          <button type="button" className="hw-nav-icon" onClick={openSearch} aria-label="Search" style={{ touchAction: "manipulation" }}>
            <Search size={15} strokeWidth={1.5} />
          </button>
        </div>

        <div className="nav-mobile-controls">
          <button type="button" className="btn-hamburger btn-search-mobile" onClick={openSearch} aria-label="Search" style={{ touchAction: "manipulation" }}>
            <Search size={18} strokeWidth={1.5} />
          </button>
          <button className="btn-hamburger" onClick={toggleMenu} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} style={{ touchAction: "manipulation" }}>
            {menuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
          </button>
        </div>
      </nav>

      {searchOpen && (
        <div className="hw-search-overlay" role="dialog" aria-label="Search">
          <div className="hw-search-backdrop" onClick={closeSearch} />
          <div className="hw-search-panel">
            <p className="hw-search-eyebrow">The Oracle&apos;s Eye</p>
            <form onSubmit={handleSearch}>
              <div className="hw-search-form-box">
                <span className="hw-search-icon-wrap"><Search size={20} strokeWidth={1.2} /></span>
                <input ref={overlayInputRef} type="text" className="hw-search-big-input"
                  placeholder="Search by theme, colour, device…" value={query}
                  onChange={e => setQuery(e.target.value)} inputMode="search"
                  enterKeyHint="search" autoComplete="off" autoCorrect="off"
                  autoCapitalize="none" spellCheck={false} />
                {query && (
                  <button type="button" className="hw-search-clear" onClick={() => setQuery("")}>
                    <X size={16} strokeWidth={1.5} />
                  </button>
                )}
                <button type="submit" className="hw-search-submit">Search</button>
              </div>
            </form>
            <div className="hw-search-close-row">
              <button type="button" className="hw-search-close-btn" onClick={closeSearch}>
                <X size={11} strokeWidth={1.5} /> ESC to close
              </button>
            </div>
          </div>
        </div>
      )}

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
          <p className="mobile-menu-watermark" style={{ marginTop: "20px" }}>HAUNTED<span>WALLPAPERS</span></p>
        </div>
      </div>
    </>
  );
}