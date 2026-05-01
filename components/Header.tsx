"use client";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, Search, Shuffle } from "lucide-react";

const NAV_LINKS = [
  { label: "iPhone",        href: "/iphone"     },
  { label: "Android",       href: "/android"    },
  { label: "PC",            href: "/pc"         },
  { label: "Collections",   href: "/obsessions" },
  { label: "Mood",          href: "/mood"       },
  { label: "Blog & Guides", href: "/blog"       },
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

  /* Always ghost theme */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "ghost");
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleRandom = useCallback(async () => {
    setRandomSpin(true);
    try {
      const res = await fetch("/api/random-wallpaper");
      if (res.ok) { const d = await res.json(); if (d?.href) { router.push(d.href); } }
      else { const cats = ["iphone","android","pc"]; router.push(`/${cats[Math.floor(Math.random()*cats.length)]}`); }
    } catch { const cats = ["iphone","android","pc"]; router.push(`/${cats[Math.floor(Math.random()*cats.length)]}`); }
    setTimeout(() => setRandomSpin(false), 700);
    setMenuOpen(false);
  }, [router]);

  const toggleMenu  = useCallback(() => setMenuOpen(p => !p), []);
  const closeMenu   = useCallback(() => setMenuOpen(false), []);
  const openSearch  = useCallback(() => { setSearchOpen(true); setMenuOpen(false); setTimeout(() => overlayInputRef.current?.focus(), 80); }, []);

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

  const closeSearchFull = useCallback(() => {
    setSearchOpen(false); setQuery(""); setLiveResults([]);
  }, []);
  const closeSearch = closeSearchFull;
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
      if (e.key === "Escape") { closeMenu(); closeSearch(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeMenu, closeSearch]);

  return (
    <>
      <style>{`
        /* ── Google Fonts import ── */
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Space+Mono:wght@400;700&display=swap');

        /* ── GHOST THEME — charcoal blue-black, cool whites ── */
        [data-theme="ghost"] {
          --bg-primary:#0d0d14;
          --bg-secondary:#12121c;
          --void:#0d0d14;
          --black:#12121c;
          --deep:#18182a;
          --ash:#24243a;
          --smoke:#60608a;
          --ghost:#9090b8;
          --pale:#d8d8f0;
          --white:#f0f0ff;
          --crimson:#6060c0;
          --blood:#7878d8;
          --ember:#9090f0;
          --gold:#a0a0e0;
          --text-primary:#e0e0f8;
          --text-muted:#8888aa;
          --border-dim:#20203a;
          --nav-bg:rgba(13,13,20,0.96);
          color-scheme: dark;
        }
        [data-theme="ghost"] body { background-color:#0d0d14!important; }
        [data-theme="ghost"] .site-nav {
          background: rgba(13,13,20,0.96)!important;
          border-bottom: 1px solid rgba(96,96,192,0.15)!important;
        }
        [data-theme="ghost"] .logo-red { color:#9090f0!important; text-shadow:0 0 14px rgba(144,144,240,0.5)!important; }
        [data-theme="ghost"] .nav-logo { color:#e0e0f8!important; }
        [data-theme="ghost"] .nav-links a { color:#8888aa!important; }
        [data-theme="ghost"] .nav-links a:hover { color:#e0e0f8!important; }
        [data-theme="ghost"] .mobile-menu-panel { background:rgba(13,13,20,0.99)!important; }
        [data-theme="ghost"] .breadcrumb-link    { color:#8888a0!important; }
        [data-theme="ghost"] .breadcrumb-current { color:#f8f8ff!important; }
        [data-theme="ghost"] .breadcrumb-sep     { color:#3a3a44!important; }
        [data-theme="ghost"] ::-webkit-scrollbar-thumb { background:#7878d8!important; }

        /* ── NAV BASE ── */
        .site-nav {
          position: fixed;
          top: var(--topbar-total, 0px);
          width: 100%;
          z-index: 600;
          padding: 18px 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(139,0,0,0.2);
          background: var(--nav-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          transition: background 0.3s ease, padding 0.3s ease;
        }
        .hw2-nav-enhanced--scrolled {
          padding-top: 12px;
          padding-bottom: 12px;
        }

        /* ── LOGO ── */
        .nav-logo {
          font-family: var(--font-cinzel), 'Cinzel Decorative', cursive;
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #c9a84c;
          text-decoration: none;
          transition: color 0.2s;
          flex-shrink: 0;
        }
        .nav-logo:hover { color: #f0ecff; }
        .logo-red { color: #c0001a; }
        .logo-compact { display: none; }
        .logo-full    { display: inline; }

        /* ── DESKTOP NAV LINKS ── */
        .nav-links {
          display: flex;
          gap: 32px;
          list-style: none;
          margin: 0;
          padding: 0;
          align-items: center;
        }
        .nav-links a,
        .hw2-nav__link {
          font-family: var(--font-space), 'Space Mono', monospace;
          font-size: 0.82rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ghost, #9090b8);
          text-decoration: none;
          transition: color 0.2s;
          white-space: nowrap;
        }
        .nav-links a:hover,
        .hw2-nav__link:hover { color: var(--white, #f0f0ff); }

        /* ── NAV ACTIONS ── */
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .hw-nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--ghost, #9090b8);
          padding: 6px;
          border-radius: 6px;
          transition: color 0.2s;
        }
        .hw-nav-icon:hover { color: var(--white, #f0f0ff); }
        .hw-nav-icon.spinning { animation: spin 0.7s linear; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        /* ── MOBILE HAMBURGER ── */
        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--ghost, #9090b8);
          padding: 6px;
          border-radius: 6px;
          transition: color 0.2s;
        }

        /* ── BREADCRUMBS ── */
        .breadcrumbs {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0;
          list-style: none;
          overflow: visible;
          max-width: 100%;
        }
        .breadcrumb-item {
          display: flex;
          align-items: center;
          min-width: 0;
          flex-shrink: 1;
        }
        .breadcrumb-link {
          font-family: var(--font-space), 'Space Mono', monospace;
          font-size: 0.58rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ghost);
          text-decoration: none;
          transition: color 0.2s;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .breadcrumb-link:hover { color: var(--blood); }
        .breadcrumb-sep {
          font-family: var(--font-space), 'Space Mono', monospace;
          font-size: 0.55rem;
          color: var(--ash);
          margin: 0 6px;
        }
        .breadcrumb-current {
          font-family: var(--font-space), 'Space Mono', monospace;
          font-size: 0.58rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--pale);
          opacity: 0.85;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ── BLOOD DRIP ── */
        .hw2-nav__drip {
          position: absolute;
          bottom: -18px;
          left: 0;
          width: 100%;
          height: 20px;
          pointer-events: none;
          display: flex;
          gap: 0;
        }
        .hw2-nav__drip-drop {
          display: inline-block;
          width: 4px;
          background: #7878d8;
          border-radius: 0 0 4px 4px;
          margin-left: calc(var(--di, 0) * 12.5%);
          animation: drip 2s ease-in-out calc(var(--di, 0) * 0.3s) infinite alternate;
          opacity: 0.7;
        }
        @keyframes drip {
          from { height: 4px; }
          to   { height: 14px; }
        }

        /* ── SEARCH OVERLAY ── */
        .hw2-search-overlay {
          position: fixed;
          inset: 0;
          z-index: 900;
          background: rgba(13,13,20,0.92);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .hw2-search-form {
          display: flex;
          gap: 10px;
          background: var(--deep, #18182a);
          border: 1px solid rgba(144,144,184,0.3);
          border-radius: 12px;
          padding: 14px 16px;
          width: 100%;
          max-width: 560px;
          align-items: center;
        }
        .hw2-search-input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          font-family: var(--font-space), 'Space Mono', monospace;
          font-size: 0.85rem;
          color: var(--white, #f0f0ff);
          letter-spacing: 0.05em;
        }
        .hw2-search-input::placeholder { color: var(--smoke, #60608a); }
        .hw2-search-btn {
          background: var(--blood, #7878d8);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 8px 16px;
          cursor: pointer;
          font-family: var(--font-space), 'Space Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          transition: opacity 0.2s;
        }
        .hw2-search-btn:hover { opacity: 0.85; }
        .hw2-search-close {
          background: none;
          border: none;
          color: var(--ghost, #9090b8);
          cursor: pointer;
          font-size: 1rem;
          padding: 4px 8px;
          transition: color 0.2s;
        }
        .hw2-search-close:hover { color: var(--white, #f0f0ff); }

        /* Live search wrapper */
        .hw2-search-wrap {
          width: 100%;
          max-width: 560px;
          display: flex;
          flex-direction: column;
        }
        .hw2-search-form {
          max-width: 100%;
        }
        .hw2-live-results {
          background: var(--deep, #18182a);
          border: 1px solid rgba(144,144,184,0.2);
          border-top: none;
          border-radius: 0 0 12px 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .hw2-live-loading {
          padding: 12px 16px;
          font-family: var(--font-space), monospace;
          font-size: 0.7rem;
          color: var(--smoke, #60608a);
          letter-spacing: 0.08em;
        }
        .hw2-live-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 14px;
          text-decoration: none;
          transition: background 0.15s;
          border-top: 1px solid rgba(144,144,184,0.08);
        }
        .hw2-live-item:hover { background: rgba(144,144,184,0.07); }
        .hw2-live-thumb {
          width: 36px;
          height: 64px;
          border-radius: 4px;
          overflow: hidden;
          flex-shrink: 0;
        }
        .hw2-live-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .hw2-live-title {
          font-family: var(--font-space), monospace;
          font-size: 0.72rem;
          color: var(--white, #f0f0ff);
          letter-spacing: 0.03em;
          line-height: 1.3;
        }
        .hw2-live-see-all {
          display: block;
          padding: 10px 16px;
          font-family: var(--font-space), monospace;
          font-size: 0.6rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #c0001a;
          text-decoration: none;
          text-align: right;
          border-top: 1px solid rgba(144,144,184,0.1);
        }
        .hw2-live-see-all:hover { color: #ff0022; }

        /* ── MOBILE MENU BACKDROP ── */
        .mobile-menu-backdrop {
          position: fixed;
          inset: 0;
          z-index: 698;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
        }

        /* ── MOBILE MENU PANEL ── */
        .mobile-menu-panel {
          position: fixed;
          top: 0;
          left: 0;
          width: min(320px, 85vw);
          height: 100dvh;
          z-index: 699;
          background: rgba(13,13,20,0.99);
          border-right: 1px solid rgba(120,120,216,0.15);
          transform: translateX(-100%);
          transition: transform 0.32s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          padding-bottom: env(safe-area-inset-bottom, 20px);
        }
        .mobile-menu-panel--open { transform: translateX(0); }

        .mobile-menu-topbar {
          height: 60px;
          flex-shrink: 0;
        }

        /* ── MOBILE NAV LINKS ── */
        .mobile-menu-nav {
          display: flex;
          flex-direction: column;
          padding: 8px 0;
          flex: 1;
        }
        .mobile-menu-link,
        .hw2-mobile-link {
          display: flex;
          align-items: center;
          padding: 15px 28px;
          font-family: var(--font-cinzel), 'Cinzel Decorative', cursive;
          font-size: 0.78rem;
          font-weight: 400;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--pale, #d8d8f0);
          text-decoration: none;
          background: none;
          border: none;
          border-bottom: 1px solid rgba(144,144,184,0.08);
          cursor: pointer;
          width: 100%;
          text-align: left;
          transition: color 0.2s, background 0.2s;
          animation: slideInLink 0.35s ease calc(var(--mi, 0) * 0.05s) both;
        }
        @keyframes slideInLink {
          from { opacity: 0; transform: translateX(-16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .mobile-menu-link:hover,
        .hw2-mobile-link:hover {
          color: var(--white, #f0f0ff);
          background: rgba(144,144,184,0.06);
        }

        /* ── RESPONSIVE BREAKPOINTS ── */
        @media (max-width: 1024px) {
          .site-nav { padding: 16px 32px; }
          .nav-links { gap: 20px; }
        }
        @media (max-width: 860px) {
          .site-nav { padding: 14px 20px; }
          .nav-links { display: none; }
          .mobile-menu-btn { display: flex; }
          .logo-full { display: inline; }
        }
        @media (max-width: 480px) {
          .site-nav { padding: 12px 16px; }
          .logo-compact { display: inline; font-size: 1.25rem; }
          .logo-full    { display: none; }
          .nav-logo { font-size: 1rem; }
          .breadcrumb-link { max-width: 110px; }
          .breadcrumb-current { max-width: 180px; }
          .breadcrumb-sep { margin: 0 4px; }
        }
        @supports (padding-left: env(safe-area-inset-left)) {
          .site-nav {
            padding-left: max(16px, env(safe-area-inset-left));
            padding-right: max(16px, env(safe-area-inset-right));
          }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav className={`site-nav hw2-nav-enhanced${scrolled ? " hw2-nav-enhanced--scrolled" : ""}`} style={{position:"relative"}}>
        {/* Blood drip */}
        <div className="hw2-nav__drip" aria-hidden="true">
          {Array.from({length:8}).map((_,i) => (
            <span key={i} className="hw2-nav__drip-drop" style={{"--di":i} as React.CSSProperties}/>
          ))}
        </div>

        <Link href="/" className="nav-logo" onClick={closeMenu} style={{touchAction:"manipulation"}}>
          <span className="logo-full">HAUNTED<span className="logo-red">WALLPAPERS</span></span>
          <span className="logo-compact">H<span className="logo-red">W</span></span>
        </Link>

        <div className="nav-links">
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} className="hw2-nav__link">{l.label}</Link>
          ))}
        </div>

        <div className="nav-actions">
          {/* Search */}
          <button type="button" className="hw-nav-icon" onClick={openSearch} aria-label="Search">
            <Search size={18}/>
          </button>
          {/* Random */}
          <button
            type="button"
            className={`hw-nav-icon${randomSpin?" spinning":""}`}
            onClick={handleRandom}
            title="Random Wallpaper"
            aria-label="Random wallpaper"
            style={{touchAction:"manipulation"}}
          >
            <Shuffle size={18}/>
          </button>
          {/* Hamburger — mobile only */}
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={toggleMenu}
            aria-label={menuOpen?"Close menu":"Open menu"}
            aria-expanded={menuOpen}
            style={{touchAction:"manipulation"}}
          >
            {menuOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>
      </nav>

      {/* ── SEARCH OVERLAY ── */}
      {searchOpen && (
        <div className="hw2-search-overlay" onClick={closeSearchFull}>
          <div className="hw2-search-wrap" onClick={e=>e.stopPropagation()}>
            <form className="hw2-search-form" onSubmit={handleSearch}>
              <input
                ref={overlayInputRef}
                className="hw2-search-input"
                value={query}
                onChange={e=>handleLiveSearch(e.target.value)}
                placeholder="Search wallpapers…"
                autoComplete="off"
              />
              <button type="submit" className="hw2-search-btn">Search</button>
              <button type="button" className="hw2-search-close" onClick={closeSearchFull} aria-label="Close">✕</button>
            </form>
            {(liveResults.length > 0 || liveLoading) && (
              <div className="hw2-live-results">
                {liveLoading && <div className="hw2-live-loading">Searching…</div>}
                {liveResults.map(img => {
                  const href = img.collectionSlug
                    ? `/shop/${img.collectionSlug}/${img.slug}`
                    : img.deviceType
                      ? `/${img.deviceType.toLowerCase()}/${img.slug}`
                      : `/search?q=${encodeURIComponent(query)}`;
                  return (
                    <Link key={img.id} href={href} className="hw2-live-item" onClick={closeSearchFull}>
                      <div className="hw2-live-thumb">
                        <img src={`https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/${img.r2Key}`} alt={img.title} />
                      </div>
                      <span className="hw2-live-title">{img.title}</span>
                    </Link>
                  );
                })}
                {!liveLoading && liveResults.length > 0 && (
                  <Link href={`/search?q=${encodeURIComponent(query)}`} className="hw2-live-see-all" onClick={closeSearchFull}>
                    See all results →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MOBILE MENU ── */}
      {menuOpen && <div className="mobile-menu-backdrop" onClick={closeMenu} aria-hidden="true"/>}
      <div className={`mobile-menu-panel${menuOpen?" mobile-menu-panel--open":""}`} aria-hidden={!menuOpen}>
        <div className="mobile-menu-topbar"/>
        <nav className="mobile-menu-nav">
          {NAV_LINKS.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              className="mobile-menu-link hw2-mobile-link"
              style={{"--mi": i} as React.CSSProperties}
              onClick={closeMenu}
            >
              {l.label}
            </Link>
          ))}
          <button
            className="mobile-menu-link hw2-mobile-link"
            style={{"--mi":NAV_LINKS.length} as React.CSSProperties}
            onClick={handleRandom}
          >
            ⚡ Random Wallpaper
          </button>
          <Link
            href="/favorites"
            className="mobile-menu-link hw2-mobile-link"
            style={{"--mi":NAV_LINKS.length+1} as React.CSSProperties}
            onClick={closeMenu}
          >
            ♥ Saved Wallpapers
          </Link>
        </nav>
      </div>
    </>
  );
}