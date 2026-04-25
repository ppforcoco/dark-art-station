"use client";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, Search, Shuffle } from "lucide-react";

const NAV_LINKS = [
  { label: "iPhone",       href: "/iphone"     },
  { label: "Android",      href: "/android"    },
  { label: "PC",           href: "/pc"         },
  { label: "Collections",  href: "/obsessions" },
  { label: "Mood",         href: "/mood"       },
  { label: "Blog & Guides", href: "/blog"      },
];

type Theme = "dark" | "blood" | "fog" | "ghost";

export default function Header() {
  const router = useRouter();
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [searchOpen,    setSearchOpen]    = useState(false);
  const [query,         setQuery]         = useState("");
  const [theme,         setTheme]         = useState<Theme>("dark");
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [randomSpin,    setRandomSpin]    = useState(false);
  const [scrolled,      setScrolled]      = useState(false);
  const overlayInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const applyTheme = useCallback((t: Theme) => {
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem("hw-theme", t); } catch {}
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("hw-theme") as Theme | null;
      const valid: Theme[] = ["dark", "blood", "fog", "ghost"];
      if (saved && valid.includes(saved)) {
        setTheme(saved);
        document.documentElement.setAttribute("data-theme", saved);
      }
    } catch {}
  }, []);

  const setThemeAndClose = useCallback((t: Theme) => {
    setTheme(t); applyTheme(t); setThemeMenuOpen(false);
  }, [applyTheme]);

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

  const toggleMenu  = useCallback(() => { setMenuOpen(p => !p); setThemeMenuOpen(false); }, []);
  const closeMenu   = useCallback(() => { setMenuOpen(false); setThemeMenuOpen(false); }, []);
  const openSearch  = useCallback(() => { setSearchOpen(true); setMenuOpen(false); setTimeout(() => overlayInputRef.current?.focus(), 80); }, []);
  const closeSearch = useCallback(() => { setSearchOpen(false); setQuery(""); }, []);
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
      if (e.key === "Escape") { closeMenu(); closeSearch(); setThemeMenuOpen(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeMenu, closeSearch]);

  const themeIcon  = theme === "dark" ? "☽" : theme === "blood" ? "🌑" : theme === "ghost" ? "👻" : "🌫";
  const themeLabel = theme === "dark" ? "Dark" : theme === "blood" ? "Crimson" : theme === "ghost" ? "Ghost" : "Fog";

  return (
    <>
      <style>{`
        [data-theme="blood"] {
          --bg-primary:#080000;--bg-secondary:#100000;--void:#080000;--black:#100000;--deep:#160000;--ash:#280808;--smoke:#622020;--ghost:#aa5858;--pale:#ffd0d0;--white:#fff0f0;--crimson:#7a0000;--blood:#cc0000;--ember:#ff2200;--gold:#ff6060;--text-primary:#ffe4e4;--text-muted:#b07878;--border-dim:#340808;--nav-bg:rgba(8,0,0,0.96);
        }
        [data-theme="blood"] body{background-color:#080000!important}
        [data-theme="blood"] .site-nav{border-bottom-color:rgba(192,0,0,.35)!important}
        [data-theme="blood"] .nav-logo{color:#ff5555!important}
        [data-theme="blood"] .logo-red{color:#ff0000!important;text-shadow:0 0 18px rgba(255,0,0,.65)!important}
        [data-theme="blood"] .nav-links a{color:#cc7070!important}
        [data-theme="blood"] .nav-links a:hover{color:#fff0f0!important}
        [data-theme="blood"] .hw-hero{background:radial-gradient(ellipse at 65% 0%,#380000 0%,#080000 65%)!important}
        [data-theme="blood"] .section-title{color:#fff0f0!important}
        [data-theme="blood"] .wotd-title{color:#fff0f0!important}
        [data-theme="blood"] .manifesto-quote{color:#fff0f0!important}
        [data-theme="blood"] .site-footer{background:#100000!important;border-color:#340808!important}
        [data-theme="blood"] .mobile-menu-panel{background:rgba(8,0,0,.98)!important}
        [data-theme="fog"] {
          --bg-primary:#1a1a1f;--bg-secondary:#141418;--text-primary:#d4cfca;--text-muted:#8a8580;--border-dim:#2a2a30;
        }
        [data-theme="fog"] body{background-color:#1a1a1f!important}
        [data-theme="fog"] .hw-hero{background:radial-gradient(ellipse at 50% 0%,rgba(180,160,140,.07) 0%,#1a1a1f 65%)}
        [data-theme="fog"] .hw-hero__title-top,[data-theme="fog"] .hw-hero__title-mid{color:#e8e4de}
        [data-theme="fog"] .hw-hero__sub{color:#8a8580}
        [data-theme="fog"] .hw-hero__stat-num{color:#c0001a}
        [data-theme="fog"] .site-nav{background:rgba(22,22,26,0.97)!important;border-bottom-color:rgba(192,0,26,.2)!important}
        [data-theme="fog"] .site-footer{background:#141418!important;border-color:#2a2a30!important}
        [data-theme="fog"] .mobile-menu-panel{background:rgba(22,22,26,.99)!important}
        [data-theme="ghost"] .hw-hero{background:radial-gradient(ellipse at 50% 0%,rgba(200,220,255,.06) 0%,transparent 70%),#070712}
      `}</style>

      {/* ── NAV ── */}
      <nav className={`site-nav hw2-nav-enhanced${scrolled ? " hw2-nav-enhanced--scrolled" : ""}`}>
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
          <button type="button" className={`hw-nav-icon${randomSpin?" spinning":""}`} onClick={handleRandom} title="Random Wallpaper" aria-label="Random wallpaper" style={{touchAction:"manipulation"}}>
            <Shuffle size={18}/>
          </button>
          {/* Theme switcher */}
          <div className="theme-switcher" style={{position:"relative"}}>
            <button type="button" className="theme-btn" onClick={()=>setThemeMenuOpen(p=>!p)} aria-label="Change theme" aria-expanded={themeMenuOpen}>
              <span style={{fontSize:"1rem"}}>{themeIcon}</span>
              <span className="theme-label">{themeLabel}</span>
            </button>
            {themeMenuOpen && (
              <div className="theme-menu">
                {([
                  ["dark","☽","Dark"],["blood","🌑","Crimson"],
                  ["ghost","👻","Ghost"],["fog","🌫","Fog"],
                ] as [Theme,string,string][]).map(([t,icon,label]) => (
                  <button key={t} type="button" className={`theme-option${theme===t?" theme-option--active":""}`} onClick={()=>setThemeAndClose(t)}>
                    <span>{icon}</span><span>{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Hamburger */}
          <button type="button" className="mobile-menu-btn" onClick={toggleMenu} aria-label={menuOpen?"Close menu":"Open menu"} aria-expanded={menuOpen} style={{touchAction:"manipulation"}}>
            {menuOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>
      </nav>

      {/* ── SEARCH OVERLAY ── */}
      {searchOpen && (
        <div className="hw2-search-overlay" onClick={closeSearch}>
          <form className="hw2-search-form" onClick={e=>e.stopPropagation()} onSubmit={handleSearch}>
            <input ref={overlayInputRef} className="hw2-search-input" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search wallpapers…" autoComplete="off"/>
            <button type="submit" className="hw2-search-btn">Search</button>
            <button type="button" className="hw2-search-close" onClick={closeSearch} aria-label="Close">✕</button>
          </form>
        </div>
      )}

      {/* ── MOBILE MENU ── */}
      {menuOpen && <div className="mobile-menu-backdrop" onClick={closeMenu} aria-hidden="true"/>}
      <div className={`mobile-menu-panel${menuOpen?" mobile-menu-panel--open":""}`} aria-hidden={!menuOpen}>
        <div className="mobile-menu-topbar"/>
        <nav className="mobile-menu-nav">
          {NAV_LINKS.map((l, i) => (
            <Link key={l.href} href={l.href} className="mobile-menu-link hw2-mobile-link"
              style={{"--mi": i} as React.CSSProperties} onClick={closeMenu}>
              {l.label}
            </Link>
          ))}
          <button className="mobile-menu-link hw2-mobile-link" style={{"--mi":NAV_LINKS.length} as React.CSSProperties} onClick={handleRandom}>
            ⚡ Random Wallpaper
          </button>
          <Link href="/favorites" className="mobile-menu-link hw2-mobile-link" style={{"--mi":NAV_LINKS.length+1} as React.CSSProperties} onClick={closeMenu}>
            ♥ Saved Wallpapers
          </Link>
        </nav>
        <div className="mobile-theme-row">
          {([["dark","☽","Dark"],["blood","🌑","Crimson"],["ghost","👻","Ghost"],["fog","🌫","Fog"]] as [Theme,string,string][]).map(([t,icon,label])=>(
            <button key={t} type="button" className={`mobile-theme-btn${theme===t?" mobile-theme-btn--active":""}`} onClick={()=>setThemeAndClose(t)}>
              <span>{icon}</span><span>{label}</span>
            </button>
          ))}
        </div>
        <p className="mobile-menu-watermark" style={{marginTop:"20px"}}>HAUNTED<span>WALLPAPERS</span></p>
      </div>
    </>
  );
}