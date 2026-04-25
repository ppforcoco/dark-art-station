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

type Theme = "fog" | "ghost";

export default function Header() {
  const router = useRouter();
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [searchOpen,    setSearchOpen]    = useState(false);
  const [query,         setQuery]         = useState("");
  const [theme,         setTheme]         = useState<Theme>("fog");
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
      const valid: Theme[] = ["fog", "ghost"];
      if (saved && valid.includes(saved)) {
        setTheme(saved);
        document.documentElement.setAttribute("data-theme", saved);
      } else {
        // Default to fog
        document.documentElement.setAttribute("data-theme", "fog");
      }
    } catch {
      document.documentElement.setAttribute("data-theme", "fog");
    }
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

  const themeIcon  = theme === "ghost" ? "👻" : "🌫";
  const themeLabel = theme === "ghost" ? "Ghost" : "Fog";

  return (
    <>
      <style>{`
        /* ── FOG THEME — misty warm grey, light mode ── */
        [data-theme="fog"] {
          --bg-primary:#f4f1ea;
          --bg-secondary:#ece8df;
          --void:#f4f1ea;
          --black:#ece8df;
          --deep:#e4dfd4;
          --ash:#d4cfc4;
          --smoke:#9a9490;
          --ghost:#6a6460;
          --pale:#2a2420;
          --white:#0a0908;
          --crimson:#7a1010;
          --blood:#a01818;
          --ember:#c84000;
          --gold:#806028;
          --text-primary:#1a1614;
          --text-muted:#5a5450;
          --border-dim:#cac5bc;
          --nav-bg:rgba(244,241,234,0.97);
          color-scheme: light;
        }
        [data-theme="fog"] body { background-color:#f4f1ea!important; }
        [data-theme="fog"] .site-nav {
          background: rgba(244,241,234,0.97)!important;
          border-bottom: 1px solid rgba(170,160,145,0.35)!important;
          box-shadow: 0 1px 20px rgba(120,110,95,0.10)!important;
        }
        [data-theme="fog"] .nav-logo { color:#1a1614!important; }
        [data-theme="fog"] .logo-red { color:#a01818!important; text-shadow:none!important; }
        [data-theme="fog"] .nav-links a { color:#4a4440!important; }
        [data-theme="fog"] .nav-links a:hover { color:#1a1614!important; }
        [data-theme="fog"] .hw-nav-icon { color:#4a4440!important; }
        [data-theme="fog"] .hw-nav-icon:hover { color:#1a1614!important; }
        [data-theme="fog"] .theme-btn { color:#4a4440!important; border-color:rgba(160,150,135,0.4)!important; }
        [data-theme="fog"] .theme-menu { background:#ece8df!important; border-color:rgba(160,150,135,0.4)!important; box-shadow:0 4px 24px rgba(80,70,60,0.18)!important; }
        [data-theme="fog"] .theme-option { color:#4a4440!important; }
        [data-theme="fog"] .theme-option:hover, [data-theme="fog"] .theme-option--active { background:#ddd8cf!important; color:#1a1614!important; }
        [data-theme="fog"] .hw-hero {
          background: radial-gradient(ellipse at 50% -10%, rgba(180,165,145,0.18) 0%, #f4f1ea 65%)!important;
        }
        [data-theme="fog"] .hw-hero__title-top,
        [data-theme="fog"] .hw-hero__title-mid { color:#1a1614!important; }
        [data-theme="fog"] .hw-hero__sub { color:#6a6460!important; }
        [data-theme="fog"] .hw-hero__stat-num { color:#a01818!important; }
        [data-theme="fog"] .hw-hero__stat-label { color:#6a6460!important; }
        [data-theme="fog"] .section-title { color:#1a1614!important; }
        [data-theme="fog"] .section-eyebrow { color:#a01818!important; }
        [data-theme="fog"] .wotd-title { color:#1a1614!important; }
        [data-theme="fog"] .manifesto-quote { color:#2a2420!important; }
        [data-theme="fog"] .site-footer {
          background:#ece8df!important;
          border-color:rgba(160,150,135,0.35)!important;
          color:#5a5450!important;
        }
        [data-theme="fog"] .site-footer a { color:#6a6460!important; }
        [data-theme="fog"] .site-footer a:hover { color:#1a1614!important; }
        [data-theme="fog"] .mobile-menu-panel {
          background: rgba(244,241,234,0.99)!important;
          border-right: 1px solid rgba(160,150,135,0.3)!important;
        }
        [data-theme="fog"] .mobile-menu-link { color:#3a3430!important; }
        [data-theme="fog"] .mobile-menu-link:hover { color:#1a1614!important; }
        [data-theme="fog"] .mobile-link-index { color:#a01818!important; }
        [data-theme="fog"] .mobile-theme-btn { color:#4a4440!important; border-color:rgba(160,150,135,0.4)!important; }
        [data-theme="fog"] .mobile-theme-btn--active { background:#ddd8cf!important; color:#1a1614!important; border-color:#a01818!important; }
        [data-theme="fog"] .mobile-menu-watermark { color:#9a9490!important; }
        [data-theme="fog"] .card-glow { border-color:rgba(160,140,120,0.3)!important; box-shadow:0 0 10px 2px rgba(140,120,100,0.15)!important; }
        [data-theme="fog"] .hw2-search-overlay { background:rgba(244,241,234,0.95)!important; }
        [data-theme="fog"] .hw2-search-form { background:#ece8df!important; border-color:rgba(160,150,135,0.5)!important; }
        [data-theme="fog"] .hw2-search-input { color:#1a1614!important; background:#f4f1ea!important; }
        [data-theme="fog"] .hw2-search-input::placeholder { color:#9a9490!important; }
        [data-theme="fog"] .hw2-search-btn { background:#a01818!important; color:#f4f1ea!important; }
        [data-theme="fog"] ::-webkit-scrollbar-track { background:#ece8df!important; }
        [data-theme="fog"] ::-webkit-scrollbar-thumb { background:#c0b8ac!important; }
        [data-theme="fog"] ::-webkit-scrollbar-thumb:hover { background:#a01818!important; }
        /* drip hidden in fog — doesn't fit the aesthetic */
        [data-theme="fog"] .hw2-nav__drip { display:none!important; }

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
        [data-theme="ghost"] .section-eyebrow { color:#7878d8!important; }
        [data-theme="ghost"] .hw-hero {
          background: radial-gradient(ellipse at 50% 0%, rgba(96,96,200,0.08) 0%, transparent 70%), #0d0d14!important;
        }
        [data-theme="ghost"] .hw-hero__stat-num { color:#9090f0!important; }
        [data-theme="ghost"] .site-footer { background:#12121c!important; border-color:#20203a!important; }
        [data-theme="ghost"] .mobile-menu-panel { background:rgba(13,13,20,0.99)!important; }
        [data-theme="ghost"] .card-glow { border-color:rgba(100,100,200,0.35)!important; box-shadow:0 0 10px 2px rgba(100,100,220,0.25)!important; }
        [data-theme="ghost"] ::-webkit-scrollbar-thumb { background:#7878d8!important; }
      `}</style>

      {/* ── NAV ── */}
      <nav className={`site-nav hw2-nav-enhanced${scrolled ? " hw2-nav-enhanced--scrolled" : ""}`}>
        {/* Blood drip — only visible in ghost theme */}
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
                  ["fog","🌫","Fog"],
                  ["ghost","👻","Ghost"],
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
          {([["fog","🌫","Fog"],["ghost","👻","Ghost"]] as [Theme,string,string][]).map(([t,icon,label])=>(
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