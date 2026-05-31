"use client";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, Search, Shuffle } from "lucide-react";

const NAV_LINKS = [
  { label: "iPhone",        href: "/iphone"     },
  { label: "Android",       href: "/android"    },
  { label: "PC",            href: "/pc"         },
  { label: "Matching Sets", href: "/sets"       },
  { label: "The Archive",   href: "/obsessions" },
  { label: "Mood",          href: "/mood"       },
  { label: "The Secrets",   href: "/blog"       },
];

export default function Header() {
  const router = useRouter();
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query,      setQuery]      = useState("");
  const [randomSpin, setRandomSpin] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const overlayInputRef = useRef<HTMLInputElement>(null);
  const [liveResults, setLiveResults] = useState<{id:string;title:string;slug:string;r2Key:string;deviceType:string|null;collectionSlug:string|null}[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>|null>(null);
  const scrollYRef = useRef(0);

  // REMOVED: the useEffect that forced data-theme="ghost" on every mount.
  // That caused React hydration error #418 because the server rendered the
  // theme from the inline script in layout.tsx, then the client immediately
  // changed it — server HTML != client render = mismatch.
  // The layout.tsx inline script already sets data-theme from localStorage
  // before first paint, so this effect was both redundant and harmful.

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleRandom = useCallback(async () => {
    if (randomSpin) return;
    setRandomSpin(true);
    setMenuOpen(false);
    const resetTimer = setTimeout(() => setRandomSpin(false), 1500);
    try {
      const controller = new AbortController();
      const apiTimeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`/api/random-wallpaper?t=${Date.now()}`, {
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(apiTimeout);
      const d = res.ok ? await res.json() : null;
      const dest = d?.href ?? (() => {
        const cats = ["iphone", "android", "pc"];
        return "/" + cats[Math.floor(Math.random() * cats.length)];
      })();
      router.push(dest);
    } catch {
      const cats = ["iphone", "android", "pc"];
      router.push("/" + cats[Math.floor(Math.random() * cats.length)]);
    } finally {
      clearTimeout(resetTimer);
      setTimeout(() => setRandomSpin(false), 400);
    }
  }, [router, randomSpin]);

  const closeMenu   = useCallback(() => setMenuOpen(false), []);
  const toggleMenu  = useCallback(() => setMenuOpen(p => !p), []);

  const openSearch = useCallback(() => {
    setSearchOpen(true);
    setMenuOpen(false);
    setTimeout(() => overlayInputRef.current?.focus(), 80);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setQuery("");
    setLiveResults([]);
  }, []);

  const handleLiveSearch = useCallback((val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) { setLiveResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLiveLoading(true);
      try {
        const res = await fetch(`/api/search-live?q=${encodeURIComponent(val.trim())}&limit=6`);
        if (res.ok) { const data = await res.json(); setLiveResults(data.results ?? []); }
      } catch { setLiveResults([]); }
      setLiveLoading(false);
    }, 280);
  }, []);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    closeSearch();
    closeMenu();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }, [query, router, closeSearch, closeMenu]);

  /* Scroll lock — no layout shift */
  useEffect(() => {
    if (menuOpen) {
      scrollYRef.current = window.scrollY;
      document.body.style.setProperty("--hw-scroll-y", `-${scrollYRef.current}px`);
      document.body.classList.add("hw-body-locked");
    } else {
      document.body.classList.remove("hw-body-locked");
      window.scrollTo(0, scrollYRef.current);
    }
    return () => { document.body.classList.remove("hw-body-locked"); };
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
        /* ── SCROLL LOCK ── */
        .hw-body-locked {
          position: fixed !important;
          top: var(--hw-scroll-y, 0) !important;
          left: 0 !important;
          right: 0 !important;
          overflow-y: scroll !important;
          width: 100% !important;
        }

        /* ── GHOST THEME ── */
        [data-theme="ghost"] {
          --ghost-bg:       #0d0d14;
          --ghost-deep:     #18182a;
          --ghost-ash:      #24243a;
          --ghost-smoke:    #60608a;
          --ghost-muted:    #8888aa;
          --ghost-pale:     #d8d8f0;
          --ghost-white:    #f0f0ff;
          --ghost-blood:    #7878d8;
          --ghost-ember:    #9090f0;
          --ghost-text:     #e0e0f8;
          --ghost-border:   rgba(96,96,192,0.15);
          --ghost-nav-bg:   rgba(13,13,20,0.97);
          color-scheme: dark;
        }
        [data-theme="ghost"] body {
          background-color: #0d0d14 !important;
        }

        .hw-nav {
          position: sticky;
          top: 0;
          left: 0;
          right: 0;
          width: 100%;
          z-index: 600;
          box-sizing: border-box;
          background: rgba(13,13,20,0.97);
          border-bottom: 1px solid rgba(96,96,192,0.15);
          overflow: hidden;
        }

        .hw-nav__inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 48px;
          height: 56px;
          width: 100%;
          box-sizing: border-box;
          min-width: 0;
        }

        /* ── LOGO ── */
        .hw-nav__logo {
          font-family: var(--font-cinzel, 'Cinzel Decorative', cursive);
          font-size: 1.15rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #e0e0f8;
          text-decoration: none;
          flex-shrink: 0;
          white-space: nowrap;
          transition: color 0.2s;
        }
        .hw-nav__logo:hover { color: #fff; }
        .hw-nav__logo-accent { color: #9090f0; text-shadow: 0 0 12px rgba(144,144,240,0.5); }
        .hw-nav__logo-short { display: none; }
        .hw-nav__logo-full  { display: inline; }

        /* ── DESKTOP LINKS ── */
        .hw-nav__links {
          display: flex;
          align-items: center;
          gap: 24px;
          list-style: none;
          margin: 0;
          padding: 0;
          flex: 1;
          justify-content: center;
          min-width: 0;
          overflow: hidden;
        }
        .hw-nav__link {
          font-family: var(--font-space, 'Space Mono', monospace);
          font-size: 0.75rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #aaaacc;
          text-decoration: none;
          white-space: nowrap;
          transition: color 0.2s;
          flex-shrink: 0;
        }
        .hw-nav__link:hover { color: #f0f0ff; }
        .hw-nav__link--sets { color: rgba(192,0,26,0.8) !important; }
        .hw-nav__link--sets:hover { color: #c0001a !important; }

        /* ── ACTIONS ── */
        .hw-nav__actions {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }
        .hw-nav__icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: none;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          color: #aaaacc;
          transition: color 0.2s;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          flex-shrink: 0;
        }
        .hw-nav__icon-btn:hover { color: #f0f0ff; }
        .hw-nav__icon-btn--spin svg { animation: hw-spin 0.7s linear; }
        @keyframes hw-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        /* ── HAMBURGER ── */
        .hw-nav__hamburger {
          display: none;
          width: 40px;
          height: 40px;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          color: #aaaacc;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          flex-shrink: 0;
        }
        .hw-nav__hamburger:active { color: #f0f0ff; }

        /* ── DRIP ── */
        .hw-nav__drip {
          position: absolute;
          bottom: -16px;
          left: 0;
          width: 100%;
          height: 18px;
          pointer-events: none;
          display: flex;
          overflow: hidden;
        }
        .hw-nav__drip-drop {
          display: inline-block;
          width: 3px;
          background: #7878d8;
          border-radius: 0 0 3px 3px;
          margin-left: calc(var(--di, 0) * 12%);
          animation: hw-drip 2s ease-in-out calc(var(--di, 0) * 0.35s) infinite alternate;
          opacity: 0.6;
        }
        @keyframes hw-drip {
          from { height: 3px; }
          to   { height: 12px; }
        }

        /* ── SEARCH OVERLAY ── */
        .hw-search-overlay {
          position: fixed;
          inset: 0;
          z-index: 900;
          background: rgba(13,13,20,0.93);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          box-sizing: border-box;
        }
        .hw-search-wrap {
          width: 100%;
          max-width: 540px;
          display: flex;
          flex-direction: column;
        }
        .hw-search-form {
          display: flex;
          gap: 8px;
          background: #18182a;
          border: 1px solid rgba(144,144,184,0.3);
          border-radius: 10px;
          padding: 12px 14px;
          align-items: center;
          box-sizing: border-box;
          width: 100%;
        }
        .hw-search-input {
          flex: 1;
          min-width: 0;
          background: none;
          border: none;
          outline: none;
          font-family: var(--font-space, 'Space Mono', monospace);
          font-size: 0.85rem;
          color: #f0f0ff;
          letter-spacing: 0.04em;
        }
        .hw-search-input::placeholder { color: #60608a; }
        .hw-search-submit {
          background: #7878d8;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 7px 14px;
          cursor: pointer;
          font-family: var(--font-space, monospace);
          font-size: 0.65rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .hw-search-close-btn {
          background: none;
          border: none;
          color: #aaaacc;
          cursor: pointer;
          font-size: 1rem;
          padding: 4px;
          flex-shrink: 0;
          line-height: 1;
        }
        .hw-search-close-btn:hover { color: #f0f0ff; }
        .hw-live-results {
          background: #18182a;
          border: 1px solid rgba(144,144,184,0.2);
          border-top: none;
          border-radius: 0 0 10px 10px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .hw-live-loading {
          padding: 10px 14px;
          font-family: var(--font-space, monospace);
          font-size: 0.65rem;
          color: #60608a;
          letter-spacing: 0.08em;
        }
        .hw-live-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          text-decoration: none;
          border-top: 1px solid rgba(144,144,184,0.07);
          transition: background 0.12s;
        }
        .hw-live-item:hover { background: rgba(144,144,184,0.07); }
        .hw-live-thumb {
          width: 32px;
          height: 56px;
          border-radius: 4px;
          overflow: hidden;
          flex-shrink: 0;
        }
        .hw-live-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .hw-live-title {
          font-family: var(--font-space, monospace);
          font-size: 0.68rem;
          color: #f0f0ff;
          letter-spacing: 0.03em;
          line-height: 1.3;
        }
        .hw-live-see-all {
          display: block;
          padding: 8px 14px;
          font-family: var(--font-space, monospace);
          font-size: 0.58rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #c0001a;
          text-decoration: none;
          text-align: right;
          border-top: 1px solid rgba(144,144,184,0.1);
        }

        /* ── BACKDROP ── */
        .hw-menu-backdrop {
          position: fixed;
          inset: 0;
          z-index: 698;
          background: rgba(0,0,0,0.65);
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
          touch-action: none;
        }

        /* ── MOBILE MENU PANEL ── */
        .hw-menu-panel {
          position: fixed;
          top: 0;
          left: 0;
          width: min(280px, 82vw);
          height: 100dvh;
          z-index: 699;
          background: #0d0d14;
          border-right: 1px solid rgba(120,120,216,0.18);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
          box-sizing: border-box;
          transform: translateX(-100%);
          visibility: hidden;
          transition: transform 0.26s cubic-bezier(0.4,0,0.2,1),
                      visibility 0s linear 0.26s;
          padding-bottom: max(80px, calc(64px + env(safe-area-inset-bottom, 0px)));
        }
        .hw-menu-panel--open {
          transform: translateX(0);
          visibility: visible;
          transition: transform 0.26s cubic-bezier(0.4,0,0.2,1),
                      visibility 0s linear 0s;
        }

        .hw-menu-panel__top {
          height: 56px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          padding: 0 20px;
          border-bottom: 1px solid rgba(120,120,216,0.1);
          font-family: var(--font-cinzel, cursive);
          font-size: 0.9rem;
          font-weight: 700;
          color: #e0e0f8;
          letter-spacing: 0.07em;
        }
        .hw-menu-panel__top-accent { color: #9090f0; }

        .hw-menu-panel__nav {
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .hw-menu-panel__link {
          display: flex;
          align-items: center;
          height: 50px;
          padding: 0 24px;
          font-family: var(--font-cinzel, cursive);
          font-size: 0.72rem;
          font-weight: 400;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #d8d8f0;
          text-decoration: none;
          background: none;
          border: none;
          border-bottom: 1px solid rgba(144,144,184,0.07);
          cursor: pointer;
          width: 100%;
          text-align: left;
          box-sizing: border-box;
          white-space: nowrap;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          transition: color 0.12s, background 0.12s;
        }
        .hw-menu-panel__link:active,
        .hw-menu-panel__link:hover {
          color: #fff;
          background: rgba(144,144,184,0.08);
        }
        .hw-menu-panel__link--sets { color: rgba(192,0,26,0.85) !important; }
        .hw-menu-panel__link--sets:hover,
        .hw-menu-panel__link--sets:active { color: #c0001a !important; }

        /* ── BOTTOM NAV ── */
        .hw-bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 650;
          background: rgba(10,10,18,0.97);
          border-top: 1px solid rgba(120,120,216,0.18);
          padding-bottom: env(safe-area-inset-bottom, 6px);
          flex-direction: row;
          align-items: stretch;
          justify-content: space-around;
          overflow: hidden;
          box-sizing: border-box;
        }
        .hw-bottom-nav__item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          flex: 1;
          min-width: 0;
          padding: 8px 2px;
          text-decoration: none;
          color: rgba(190,185,220,0.92);
          font-family: var(--font-space, monospace);
          font-size: 0.42rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: none;
          border: none;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          min-height: 44px;
          box-sizing: border-box;
          transition: color 0.1s;
          overflow: hidden;
        }
        .hw-bottom-nav__item:active { color: #fff; }
        .hw-bottom-nav__icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .hw-bottom-nav__spin .hw-bottom-nav__icon {
          animation: hw-spin 0.7s linear;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 1100px) {
          .hw-nav__inner { padding: 0 28px; }
          .hw-nav__links { gap: 16px; }
          .hw-nav__link  { font-size: 0.7rem; }
        }
        @media (max-width: 900px) {
          .hw-nav__inner   { padding: 0 16px; }
          .hw-nav__links   { display: none; }
          .hw-nav__hamburger { display: flex; }
        }
        @media (max-width: 420px) {
          .hw-nav__inner        { padding: 0 12px; gap: 0; }
          .hw-nav__logo-full    { display: none; }
          .hw-nav__logo-short   { display: inline; }
          .hw-nav__logo         { font-size: 1rem; }
          .hw-nav__icon-btn     { width: 32px; height: 32px; }
          .hw-nav__hamburger    { width: 36px; height: 36px; }
        }
        @supports (padding-left: env(safe-area-inset-left)) {
          .hw-nav__inner {
            padding-left:  max(16px, env(safe-area-inset-left));
            padding-right: max(16px, env(safe-area-inset-right));
          }
          @media (max-width: 420px) {
            .hw-nav__inner {
              padding-left:  max(12px, env(safe-area-inset-left));
              padding-right: max(12px, env(safe-area-inset-right));
            }
          }
        }
        @media (max-width: 900px) {
          .hw-bottom-nav { display: flex; }
          body { padding-bottom: calc(58px + env(safe-area-inset-bottom, 0px)) !important; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav className={`hw-nav${scrolled ? " hw-nav--scrolled" : ""}`} role="navigation" aria-label="Main navigation">
        <div className="hw-nav__inner">
          <Link href="/" prefetch={false} className="hw-nav__logo" onClick={closeMenu}>
            <span className="hw-nav__logo-full">
              HAUNTED<span className="hw-nav__logo-accent">WALLPAPERS</span>
            </span>
            <span className="hw-nav__logo-short">
              H<span className="hw-nav__logo-accent">W</span>
            </span>
          </Link>

          <div className="hw-nav__links">
            {NAV_LINKS.map(l => (
              <Link
                key={l.href}
                href={l.href}
                prefetch={false}
                className={`hw-nav__link${l.href === "/sets" ? " hw-nav__link--sets" : ""}`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hw-nav__actions">
            <button type="button" className="hw-nav__icon-btn" onClick={openSearch} aria-label="Search">
              <Search size={17} />
            </button>
            <button
              type="button"
              className={`hw-nav__icon-btn${randomSpin ? " hw-nav__icon-btn--spin" : ""}`}
              onClick={handleRandom}
              aria-label="Random wallpaper"
            >
              <Shuffle size={17} />
            </button>
            <button
              type="button"
              className="hw-nav__hamburger"
              onClick={toggleMenu}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="hw-menu-panel"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        <div className="hw-nav__drip" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="hw-nav__drip-drop" style={{ "--di": i } as React.CSSProperties} />
          ))}
        </div>
      </nav>

      {/* ── SEARCH OVERLAY ── */}
      {searchOpen && (
        <div className="hw-search-overlay" onClick={closeSearch} role="dialog" aria-modal="true" aria-label="Search wallpapers">
          <div className="hw-search-wrap" onClick={e => e.stopPropagation()}>
            <form className="hw-search-form" onSubmit={handleSearch}>
              <input
                ref={overlayInputRef}
                className="hw-search-input"
                value={query}
                onChange={e => handleLiveSearch(e.target.value)}
                placeholder="Search wallpapers…"
                autoComplete="off"
              />
              <button type="submit" className="hw-search-submit">Search</button>
              <button type="button" className="hw-search-close-btn" onClick={closeSearch} aria-label="Close search">✕</button>
            </form>
            {(liveResults.length > 0 || liveLoading) && (
              <div className="hw-live-results">
                {liveLoading && <div className="hw-live-loading">Searching…</div>}
                {liveResults.map(img => {
                  const href = img.collectionSlug
                    ? `/shop/${img.collectionSlug}/${img.slug}`
                    : img.deviceType
                      ? `/${img.deviceType.toLowerCase()}/${img.slug}`
                      : `/search?q=${encodeURIComponent(query)}`;
                  return (
                    <Link key={img.id} href={href} prefetch={false} className="hw-live-item" onClick={closeSearch}>
                      <div className="hw-live-thumb">
                        <img
                          src={`https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/${img.r2Key}`}
                          alt={img.title}
                          loading="lazy"
                          width="32"
                          height="56"
                        />
                      </div>
                      <span className="hw-live-title">{img.title}</span>
                    </Link>
                  );
                })}
                {!liveLoading && liveResults.length > 0 && (
                  <Link href={`/search?q=${encodeURIComponent(query)}`} prefetch={false} className="hw-live-see-all" onClick={closeSearch}>
                    See all results →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {menuOpen && <div className="hw-menu-backdrop" onClick={closeMenu} aria-hidden="true" />}

      <div
        id="hw-menu-panel"
        className={`hw-menu-panel${menuOpen ? " hw-menu-panel--open" : ""}`}
        aria-hidden={!menuOpen}
        role="dialog"
        aria-label="Site navigation"
        aria-modal="true"
      >
        <div className="hw-menu-panel__top">
          HAUNTED<span className="hw-menu-panel__top-accent">WALLPAPERS</span>
        </div>
        <nav className="hw-menu-panel__nav" aria-label="Mobile navigation">
          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              prefetch={false}
              className={`hw-menu-panel__link${l.href === "/sets" ? " hw-menu-panel__link--sets" : ""}`}
              onClick={closeMenu}
              tabIndex={menuOpen ? 0 : -1}
            >
              {l.label}
            </Link>
          ))}
          <button className="hw-menu-panel__link" onClick={handleRandom} tabIndex={menuOpen ? 0 : -1} type="button">
            Random Wallpaper
          </button>
          <Link href="/favorites" prefetch={false} className="hw-menu-panel__link" onClick={closeMenu} tabIndex={menuOpen ? 0 : -1}>
            Saved Wallpapers
          </Link>
        </nav>
      </div>

      {/* ── BOTTOM NAV ── */}
      <nav className="hw-bottom-nav" aria-label="Quick navigation">
        <Link href="/iphone" prefetch={false} className="hw-bottom-nav__item" onClick={closeMenu}>
          <svg className="hw-bottom-nav__icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <rect x="7" y="2" width="10" height="20" rx="2" />
            <line x1="12" y1="18" x2="12" y2="18" strokeWidth="2" strokeLinecap="round" />
          </svg>
          iPhone
        </Link>
        <Link href="/android" prefetch={false} className="hw-bottom-nav__item" onClick={closeMenu}>
          <svg className="hw-bottom-nav__icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M6 18V9a6 6 0 0 1 12 0v9" />
            <path d="M4 19h16" />
            <circle cx="9" cy="6" r="0.5" fill="currentColor" />
            <circle cx="15" cy="6" r="0.5" fill="currentColor" />
          </svg>
          Android
        </Link>
        <Link href="/obsessions" prefetch={false} className="hw-bottom-nav__item" onClick={closeMenu}>
          <svg className="hw-bottom-nav__icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="12" cy="9" r="5" />
            <path d="M9 9c0-1.7 1.3-3 3-3" />
            <path d="M6 21c0-3.3 2.7-6 6-6s6 2.7 6 6" />
          </svg>
          Archive
        </Link>
        <Link href="/mood" prefetch={false} className="hw-bottom-nav__item" onClick={closeMenu}>
          <svg className="hw-bottom-nav__icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
          Mood
        </Link>
        <button
          type="button"
          className={`hw-bottom-nav__item${randomSpin ? " hw-bottom-nav__spin" : ""}`}
          onClick={handleRandom}
          aria-label="Random wallpaper"
        >
          <svg className="hw-bottom-nav__icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <polyline points="16 3 21 3 21 8" />
            <line x1="4" y1="20" x2="21" y2="3" />
            <polyline points="21 16 21 21 16 21" />
            <line x1="15" y1="15" x2="21" y2="21" />
          </svg>
          Random
        </button>
        <button type="button" className="hw-bottom-nav__item" onClick={openSearch} aria-label="Search">
          <svg className="hw-bottom-nav__icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Search
        </button>
      </nav>
    </>
  );
}