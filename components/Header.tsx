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
  { label: "Collections",   href: "/collections" },
  { label: "Live Wallpapers", href: "/live-wallpapers" },
  { label: "Tools",          href: "/tools"          },
  { label: "Avatars",        href: "/avatars"       },
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
                    ? `/collections/${img.collectionSlug}/${img.slug}`
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
          <Link href="/tools" prefetch={false} className="hw-menu-panel__link" onClick={closeMenu} tabIndex={menuOpen ? 0 : -1}>
            🛠 Tools
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
        <Link href="/collections" prefetch={false} className="hw-bottom-nav__item" onClick={closeMenu}>
          <svg className="hw-bottom-nav__icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="12" cy="9" r="5" />
            <path d="M9 9c0-1.7 1.3-3 3-3" />
            <path d="M6 21c0-3.3 2.7-6 6-6s6 2.7 6 6" />
          </svg>
          Collections
        </Link>
        <Link href="/live-wallpapers" prefetch={false} className="hw-bottom-nav__item" onClick={closeMenu}>
          <svg className="hw-bottom-nav__icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M10 9l5 3-5 3z" fill="currentColor" stroke="none" />
          </svg>
          Live
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