// components/Header.tsx
'use client';

import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, Search, Skull, Shuffle } from "lucide-react";

const NAV_LINKS = [
  { label: "iPhone",      href: "/iphone"      },
  { label: "Android",     href: "/android"     },
  { label: "PC",          href: "/pc"          },
  { label: "Collections", href: "/collections" },
];

type Theme = "dark" | "blood" | "light" | "ghost" | "ember";

const DARK_ROUTES = [
  "/halloween", "/dark-valentine", "/blood-moon",
  "/day-of-the-dead", "/iphone", "/android", "/pc",
];

const CURSOR_STYLES = [
  { id: "default", emoji: "⬡", label: "Ring"   },
  { id: "skull",   emoji: "💀", label: "Skull"  },
  { id: "flame",   emoji: "🔥", label: "Flame"  },
  { id: "ghost",   emoji: "👻", label: "Ghost"  },
  { id: "dagger",  emoji: "🗡",  label: "Dagger" },
];

export default function Header() {
  const router = useRouter();
  const [menuOpen,        setMenuOpen]        = useState(false);
  const [searchOpen,      setSearchOpen]      = useState(false);
  const [query,           setQuery]           = useState("");
  const [theme,           setTheme]           = useState<Theme>("dark");
  const [themeMenuOpen,   setThemeMenuOpen]   = useState(false);
  const [cursorMenuOpen,  setCursorMenuOpen]  = useState(false);
  const [cursorStyle,     setCursorStyle]     = useState("default");
  const [randomSpin,      setRandomSpin]      = useState(false);

  const applyTheme = useCallback((t: Theme) => {
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem("hw-theme", t); } catch {}
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("hw-theme") as Theme | null;
      const valid: Theme[] = ["dark", "blood", "light", "ghost", "ember"];
      if (saved && valid.includes(saved)) {
        setTheme(saved);
        document.documentElement.setAttribute("data-theme", saved);
      }
    } catch {}
  }, []);

  const setThemeAndClose = useCallback((t: Theme) => {
    setTheme(t);
    applyTheme(t);
    setThemeMenuOpen(false);
  }, [applyTheme]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("hw-cursor") ?? "default";
      setCursorStyle(saved);
      document.documentElement.setAttribute("data-cursor", saved);
    } catch {}
  }, []);

  const applyCursor = useCallback((id: string) => {
    setCursorStyle(id);
    document.documentElement.setAttribute("data-cursor", id);
    try { localStorage.setItem("hw-cursor", id); } catch {}
    setCursorMenuOpen(false);
  }, []);

  const handleDarkRoute = useCallback(() => {
    const idx = Math.floor(Date.now() / 86400000) % DARK_ROUTES.length;
    router.push(DARK_ROUTES[idx]);
    setMenuOpen(false);
  }, [router]);

  const handleRandom = useCallback(async () => {
    setRandomSpin(true);
    try {
      const res = await fetch("/api/random-wallpaper");
      if (res.ok) {
        const data = await res.json();
        if (data?.href) { router.push(data.href); }
      } else {
        const cats = ["iphone", "android", "pc"];
        router.push(`/${cats[Math.floor(Math.random() * cats.length)]}`);
      }
    } catch {
      const cats = ["iphone", "android", "pc"];
      router.push(`/${cats[Math.floor(Math.random() * cats.length)]}`);
    }
    setTimeout(() => setRandomSpin(false), 700);
    setMenuOpen(false);
  }, [router]);

  const overlayInputRef = useRef<HTMLInputElement>(null);
  const closeMenu    = useCallback(() => setMenuOpen(false), []);
  const toggleMenu   = useCallback(() => {
    setMenuOpen(p => !p);
    setThemeMenuOpen(false);
    setCursorMenuOpen(false);
  }, []);
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
      if (e.key === "Escape") {
        closeMenu(); closeSearch();
        setThemeMenuOpen(false); setCursorMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeMenu, closeSearch]);

  const themeIcon  = theme === "dark" ? "☽" : theme === "blood" ? "🩸" : theme === "ghost" ? "👻" : theme === "ember" ? "🔥" : "☀";
  const themeLabel = theme === "dark" ? "Dark" : theme === "blood" ? "Blood" : theme === "ghost" ? "Ghost" : theme === "ember" ? "Ember" : "Light";
  const cursorEmoji = CURSOR_STYLES.find(c => c.id === cursorStyle)?.emoji ?? "⬡";

  return (
    <>
      <style>{`
        [data-theme="blood"] {
          --bg-primary:   #080000;
          --bg-secondary: #100000;
          --void:         #080000;
          --black:        #100000;
          --deep:         #160000;
          --ash:          #280808;
          --smoke:        #622020;
          --ghost:        #aa5858;
          --pale:         #ffd0d0;
          --white:        #fff0f0;
          --crimson:      #7a0000;
          --blood:        #cc0000;
          --ember:        #ff2200;
          --gold:         #ff6060;
          --text-primary: #ffe4e4;
          --text-muted:   #b07878;
          --border-dim:   #340808;
          --nav-bg:       rgba(8,0,0,0.96);
        }
        [data-theme="blood"] body                  { background-color: #080000 !important; }
        [data-theme="blood"] .site-nav             { border-bottom-color: rgba(192,0,0,0.35) !important; }
        [data-theme="blood"] .nav-logo             { color: #ff5555 !important; }
        [data-theme="blood"] .logo-red             { color: #ff0000 !important; text-shadow: 0 0 18px rgba(255,0,0,0.65) !important; }
        [data-theme="blood"] .nav-links a          { color: #aa5858 !important; }
        [data-theme="blood"] .nav-links a:hover    { color: #fff0f0 !important; }
        [data-theme="blood"] .btn-primary          { background: #cc0000 !important; }
        [data-theme="blood"] .btn-primary::before  { background: #ff2200 !important; }
        [data-theme="blood"] .btn-secondary        { border-color: #622020 !important; color: #ffd0d0 !important; }
        [data-theme="blood"] .btn-secondary:hover  { border-color: #cc0000 !important; color: #fff0f0 !important; background: rgba(192,0,0,0.08) !important; }
        [data-theme="blood"] .hero-section         { background: radial-gradient(ellipse at 65% 0%, #380000 0%, #080000 65%) !important; }
        [data-theme="blood"] .hero-title .t-red    { color: #ff2200 !important; text-shadow: 0 0 28px rgba(255,34,0,0.55) !important; }
        [data-theme="blood"] .hero-title .t-gold   { color: #ff7070 !important; }
        [data-theme="blood"] .hero-eyebrow         { color: #cc0000 !important; }
        [data-theme="blood"] .eyebrow-line         { background: #cc0000 !important; }
        [data-theme="blood"] .section-eyebrow      { color: #cc0000 !important; }
        [data-theme="blood"] .stat-num             { color: #ff7070 !important; }
        [data-theme="blood"] .hero-stats           { border-top-color: #340808 !important; }
        [data-theme="blood"] .marquee-section      { background: #100000 !important; border-color: rgba(192,0,0,0.28) !important; }
        [data-theme="blood"] .marquee-dot          { color: #cc0000 !important; }
        [data-theme="blood"] .wotd-section         { background: #080000 !important; border-color: rgba(192,0,0,0.22) !important; }
        [data-theme="blood"] .wotd-eyebrow         { color: #cc0000 !important; }
        [data-theme="blood"] .wotd-title           { color: #fff0f0 !important; }
        [data-theme="blood"] .wotd-tag             { border-color: rgba(255,80,80,0.3) !important; color: #ff7070 !important; }
        [data-theme="blood"] .wotd-cta             { border-color: #cc0000 !important; color: #ffd0d0 !important; }
        [data-theme="blood"] .wotd-cta:hover       { background: #cc0000 !important; color: #fff0f0 !important; }
        [data-theme="blood"] .section-title        { color: #fff0f0 !important; }
        [data-theme="blood"] .section-link         { color: #aa5858 !important; border-color: #622020 !important; }
        [data-theme="blood"] .section-link:hover   { color: #fff0f0 !important; border-color: #fff0f0 !important; }
        [data-theme="blood"] .cat-tag              { color: #cc0000 !important; border-color: rgba(192,0,0,0.4) !important; }
        [data-theme="blood"] .products-bg          { background: #100000 !important; }
        [data-theme="blood"] .manifesto-section    { background: #080000 !important; border-color: #340808 !important; }
        [data-theme="blood"] .manifesto-quote      { color: #fff0f0 !important; }
        [data-theme="blood"] .manifesto-quote .em  { color: #ff7070 !important; }
        [data-theme="blood"] .manifesto-vert-label { color: #cc0000 !important; }
        [data-theme="blood"] .newsletter-section   { background: #100000 !important; }
        [data-theme="blood"] .newsletter-title     { color: #fff0f0 !important; }
        [data-theme="blood"] .nl-input             { background: #280808 !important; border-color: #622020 !important; color: #fff0f0 !important; }
        [data-theme="blood"] .nl-input::placeholder{ color: #622020 !important; }
        [data-theme="blood"] .nl-btn               { background: #cc0000 !important; border-color: #cc0000 !important; }
        [data-theme="blood"] .nl-btn:hover         { background: #ff2200 !important; border-color: #ff2200 !important; }
        [data-theme="blood"] .site-footer          { background: #100000 !important; border-color: #340808 !important; }
        [data-theme="blood"] .footer-bottom        { border-color: #340808 !important; }
        [data-theme="blood"] .mobile-menu-panel    { background: rgba(8,0,0,0.98) !important; border-color: rgba(192,0,0,0.25) !important; }
        [data-theme="blood"] .mobile-menu-topbar   { background: linear-gradient(90deg, transparent, #cc0000 40%, #ff2200 60%, transparent) !important; }
        [data-theme="blood"] .search-overlay-backdrop { background: rgba(8,0,0,0.93) !important; }
        [data-theme="blood"] ::-webkit-scrollbar-track { background: #080000 !important; }
        [data-theme="blood"] ::-webkit-scrollbar-thumb { background: #cc0000 !important; }
        [data-theme="blood"] .hw-nav-icon          { border-color: rgba(192,0,0,0.3) !important; color: #aa5858 !important; }
        [data-theme="blood"] .hw-nav-icon:hover    { border-color: #cc0000 !important; color: #cc0000 !important; }
        [data-theme="blood"] .hw-dropdown          { background: #160000 !important; border-color: rgba(192,0,0,0.45) !important; }
        [data-theme="blood"] .hw-dropdown-item:hover { background: rgba(192,0,0,0.18) !important; }
        [data-theme="blood"] .hw-dropdown-item.hw-active { color: #cc0000 !important; }
        [data-theme="blood"] .hw-dropdown-btn      { border-color: rgba(192,0,0,0.3) !important; color: #aa5858 !important; }
        [data-theme="blood"] .hw-dropdown-btn:hover { border-color: #cc0000 !important; color: #cc0000 !important; }
        [data-theme="blood"] .search-hint-btn      { background: rgba(192,0,0,0.1) !important; border-color: rgba(192,0,0,0.25) !important; color: #aa5858 !important; }
        [data-theme="blood"] .search-hint-btn:hover { background: rgba(192,0,0,0.22) !important; color: #fff0f0 !important; border-color: rgba(192,0,0,0.55) !important; }
        [data-theme="blood"] .hw-search-eyebrow    { color: #cc0000 !important; }
        [data-theme="blood"] .hw-search-form-box   { border-color: rgba(192,0,0,0.5) !important; background: rgba(10,0,0,0.97) !important; }
        [data-theme="blood"] .hw-search-form-box:focus-within { border-color: rgba(192,0,0,0.9) !important; box-shadow: 0 0 0 1px rgba(192,0,0,0.25), 0 12px 48px rgba(192,0,0,0.12) !important; }
        [data-theme="blood"] .hw-search-icon-wrap  { color: rgba(192,0,0,0.8) !important; }
        [data-theme="blood"] .hw-search-big-input  { color: #fff0f0 !important; caret-color: #cc0000 !important; }
        [data-theme="blood"] .hw-search-submit     { background: #cc0000 !important; }
        [data-theme="blood"] .hw-search-submit:hover { background: #a80000 !important; }
        [data-theme="blood"] .mobile-theme-pill.active { border-color: #cc0000 !important; color: #cc0000 !important; background: rgba(192,0,0,0.12) !important; }
        [data-theme="blood"] .mobile-cursor-pill.active { border-color: #cc0000 !important; background: rgba(192,0,0,0.12) !important; }
        [data-theme="blood"] .dark-quote-bar       { background: #100000 !important; border-color: rgba(192,0,0,0.25) !important; }
        [data-theme="blood"] .dqb-text             { color: #ffd0d0 !important; }

        [data-cursor="skull"]  * { cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ctext y='26' font-size='22'%3E%F0%9F%92%80%3C/text%3E%3C/svg%3E") 16 16, auto !important; }
        [data-cursor="skull"]    { cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ctext y='26' font-size='22'%3E%F0%9F%92%80%3C/text%3E%3C/svg%3E") 16 16, auto !important; }
        [data-cursor="flame"]  * { cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ctext y='26' font-size='22'%3E%F0%9F%94%A5%3C/text%3E%3C/svg%3E") 16 8,  auto !important; }
        [data-cursor="flame"]    { cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ctext y='26' font-size='22'%3E%F0%9F%94%A5%3C/text%3E%3C/svg%3E") 16 8,  auto !important; }
        [data-cursor="ghost"]  * { cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ctext y='26' font-size='22'%3E%F0%9F%91%BB%3C/text%3E%3C/svg%3E") 16 16, auto !important; }
        [data-cursor="ghost"]    { cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ctext y='26' font-size='22'%3E%F0%9F%91%BB%3C/text%3E%3C/svg%3E") 16 16, auto !important; }
        [data-cursor="dagger"] * { cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ctext y='26' font-size='22'%3E%F0%9F%97%A1%3C/text%3E%3C/svg%3E") 8  8,  auto !important; }
        [data-cursor="dagger"]   { cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ctext y='26' font-size='22'%3E%F0%9F%97%A1%3C/text%3E%3C/svg%3E") 8  8,  auto !important; }

        .hw-nav-icon {
          display: flex; align-items: center; justify-content: center;
          width: 36px; height: 36px;
          background: transparent;
          border: 1px solid rgba(139,0,0,0.3);
          color: #8a8099;
          cursor: none;
          transition: border-color 0.2s, color 0.2s;
          flex-shrink: 0;
        }
        @media (pointer: coarse) { .hw-nav-icon { cursor: pointer; width: 44px; height: 44px; } }
        .hw-nav-icon:hover { border-color: #c0001a; color: #c0001a; }
        .hw-nav-icon.spinning svg { animation: hw-spin 0.65s cubic-bezier(0.4,0,0.2,1); }
        @keyframes hw-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .hw-dropdown-wrap { position: relative; }
        .hw-dropdown-btn {
          display: flex; align-items: center; gap: 6px;
          height: 36px; padding: 0 12px;
          background: transparent;
          border: 1px solid rgba(139,0,0,0.3);
          color: #8a8099;
          font-family: var(--font-space, monospace);
          font-size: 0.62rem; letter-spacing: 0.12em; text-transform: uppercase;
          cursor: none; white-space: nowrap;
          transition: border-color 0.2s, color 0.2s;
        }
        @media (pointer: coarse) { .hw-dropdown-btn { cursor: pointer; height: 44px; } }
        .hw-dropdown-btn:hover { border-color: #c0001a; color: #c0001a; }
        .hw-dropdown {
          position: absolute; top: calc(100% + 6px); right: 0;
          min-width: 148px;
          background: #0e0c18;
          border: 1px solid rgba(192,0,26,0.4);
          box-shadow: 0 12px 48px rgba(0,0,0,0.75);
          z-index: 800;
          animation: hw-drop-in 0.17s cubic-bezier(0.22,1,0.36,1);
        }
        @keyframes hw-drop-in {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .hw-dropdown-item {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 10px 14px;
          background: transparent; border: none;
          color: #6a6480;
          font-family: var(--font-space, monospace);
          font-size: 0.6rem; letter-spacing: 0.12em; text-transform: uppercase;
          cursor: none; text-align: left;
          transition: background 0.13s, color 0.13s;
        }
        @media (pointer: coarse) { .hw-dropdown-item { cursor: pointer; padding: 13px 14px; } }
        .hw-dropdown-item:hover { background: rgba(192,0,26,0.14); color: #f0ecff; }
        .hw-dropdown-item.hw-active { color: #c0001a; }
        .hw-dropdown-item .hw-dot { font-size: 0.95rem; line-height: 1; flex-shrink: 0; }

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
        .hw-search-hints {
          display: flex; gap: 8px; flex-wrap: wrap;
          margin-top: 16px; padding: 0 1px;
        }
        .search-hint-btn {
          background: rgba(192,0,26,0.08); border: 1px solid rgba(192,0,26,0.2);
          color: #6a6080; padding: 6px 14px;
          font-family: var(--font-space, monospace);
          font-size: 0.56rem; letter-spacing: 0.12em; text-transform: uppercase;
          cursor: pointer; transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        .search-hint-btn:hover { background: rgba(192,0,26,0.2); color: #f0ecff; border-color: rgba(192,0,26,0.55); }
        .hw-search-close-row { display: flex; justify-content: center; margin-top: 22px; }
        .hw-search-close-btn {
          background: transparent; border: none; color: #2a2540; cursor: pointer;
          font-family: var(--font-space, monospace);
          font-size: 0.54rem; letter-spacing: 0.18em; text-transform: uppercase;
          display: flex; align-items: center; gap: 7px; transition: color 0.2s;
        }
        .hw-search-close-btn:hover { color: #6a6480; }

        .mobile-action-strip { display: flex; flex-direction: column; gap: 8px; padding: 0 0 4px; }
        .mobile-action-btn {
          display: flex; align-items: center; gap: 12px;
          width: 100%; padding: 12px 16px;
          background: rgba(192,0,26,0.06); border: 1px solid rgba(192,0,26,0.18);
          color: #8a8099; font-family: var(--font-space, monospace);
          font-size: 0.6rem; letter-spacing: 0.14em; text-transform: uppercase;
          cursor: pointer; text-align: left;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
          touch-action: manipulation; min-height: 44px;
        }
        .mobile-action-btn:hover, .mobile-action-btn:active { background: rgba(192,0,26,0.14); color: #f0ecff; border-color: rgba(192,0,26,0.4); }
        .mobile-theme-row { display: flex; gap: 5px; padding: 0 0 4px; flex-wrap: wrap; }
        .mobile-theme-pill {
          flex: 1; min-width: calc(33% - 4px); padding: 9px 3px; background: transparent;
          border: 1px solid rgba(139,0,0,0.25); color: #4a445a;
          font-family: var(--font-space, monospace);
          font-size: 0.5rem; letter-spacing: 0.08em; text-transform: uppercase;
          cursor: pointer; text-align: center;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
          touch-action: manipulation; min-height: 38px;
        }
        .mobile-theme-pill.active { border-color: #c0001a; color: #c0001a; background: rgba(192,0,26,0.12); }
        .mobile-cursor-row { display: flex; gap: 6px; }
        .mobile-cursor-pill {
          flex: 1; padding: 10px 4px; background: transparent;
          border: 1px solid rgba(139,0,0,0.2); color: #4a445a;
          font-size: 0.85rem; cursor: pointer; text-align: center;
          transition: background 0.15s, border-color 0.15s;
          touch-action: manipulation; min-height: 40px;
          display: flex; align-items: center; justify-content: center;
        }
        .mobile-cursor-pill.active { border-color: #c0001a; background: rgba(192,0,26,0.12); }
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
          <button type="button" className="hw-nav-icon" onClick={handleDarkRoute} title="Dark Route of the Day" aria-label="Dark route" style={{ touchAction: "manipulation" }}>
            <Skull size={14} strokeWidth={1.5} />
          </button>
          <button type="button" className={`hw-nav-icon${randomSpin ? " spinning" : ""}`} onClick={handleRandom} title="Random Wallpaper" aria-label="Random wallpaper" style={{ touchAction: "manipulation" }}>
            <Shuffle size={14} strokeWidth={1.5} />
          </button>

          <div className="hw-dropdown-wrap">
            <button type="button" className="hw-dropdown-btn" onClick={() => { setCursorMenuOpen(p => !p); setThemeMenuOpen(false); }} aria-label="Change cursor" style={{ touchAction: "manipulation" }}>
              <span style={{ fontSize: "0.85rem", lineHeight: 1 }}>{cursorEmoji}</span>
              <span>Cursor</span>
            </button>
            {cursorMenuOpen && (
              <div className="hw-dropdown">
                {CURSOR_STYLES.map(c => (
                  <button key={c.id} type="button" className={`hw-dropdown-item${cursorStyle === c.id ? " hw-active" : ""}`} onClick={() => applyCursor(c.id)}>
                    <span className="hw-dot">{c.emoji}</span><span>{c.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="hw-dropdown-wrap">
            <button type="button" className="hw-dropdown-btn" onClick={() => { setThemeMenuOpen(p => !p); setCursorMenuOpen(false); }} aria-label="Change theme" style={{ touchAction: "manipulation" }}>
              <span style={{ fontSize: "0.85rem", lineHeight: 1 }}>{themeIcon}</span>
              <span>{themeLabel}</span>
            </button>
            {themeMenuOpen && (
              <div className="hw-dropdown">
                <button type="button" className={`hw-dropdown-item${theme === "dark"  ? " hw-active" : ""}`} onClick={() => setThemeAndClose("dark")}>
                  <span className="hw-dot">☽</span><span>Dark</span>
                </button>
                <button type="button" className={`hw-dropdown-item${theme === "blood" ? " hw-active" : ""}`} onClick={() => setThemeAndClose("blood")}>
                  <span className="hw-dot">🩸</span><span>Blood Red</span>
                </button>
                <button type="button" className={`hw-dropdown-item${theme === "light" ? " hw-active" : ""}`} onClick={() => setThemeAndClose("light")}>
                  <span className="hw-dot">☀</span><span>Light</span>
                </button>
                <button type="button" className={`hw-dropdown-item${theme === "ghost" ? " hw-active" : ""}`} onClick={() => setThemeAndClose("ghost")}>
                  <span className="hw-dot">👻</span><span>Ghost</span>
                </button>
                <button type="button" className={`hw-dropdown-item${theme === "ember" ? " hw-active" : ""}`} onClick={() => setThemeAndClose("ember")}>
                  <span className="hw-dot">🔥</span><span>Ember</span>
                </button>
              </div>
            )}
          </div>
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
            <div className="hw-search-hints">
              {["Skull", "Dark Fantasy", "Tarot", "Blood Moon", "Demon", "Gothic", "Witch", "Vampire"].map(hint => (
                <button key={hint} type="button" className="search-hint-btn"
                  onClick={() => { setQuery(hint); router.push(`/search?q=${encodeURIComponent(hint)}`); closeSearch(); }}>
                  {hint}
                </button>
              ))}
            </div>
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
          <div className="mobile-action-strip">
            <button type="button" className="mobile-action-btn" onClick={handleDarkRoute}>
              <Skull size={13} strokeWidth={1.5} /> Dark Route of the Day
            </button>
            <button type="button" className="mobile-action-btn" onClick={handleRandom}>
              <Shuffle size={13} strokeWidth={1.5} /> Summon Random Wallpaper
            </button>
          </div>
          <div className="mobile-theme-row" style={{ marginTop: "12px" }}>
            {(["dark", "blood", "light", "ghost", "ember"] as Theme[]).map(t => (
              <button key={t} type="button" className={`mobile-theme-pill${theme === t ? " active" : ""}`} onClick={() => setThemeAndClose(t)}>
                {t === "dark" ? "☽ Dark" : t === "blood" ? "🩸 Blood" : t === "ghost" ? "👻 Ghost" : t === "ember" ? "🔥 Ember" : "☀ Light"}
              </button>
            ))}
          </div>
          <div className="mobile-cursor-row" style={{ marginTop: "8px" }}>
            {CURSOR_STYLES.map(c => (
              <button key={c.id} type="button" className={`mobile-cursor-pill${cursorStyle === c.id ? " active" : ""}`} onClick={() => applyCursor(c.id)} title={c.label}>
                {c.emoji}
              </button>
            ))}
          </div>
          <p className="mobile-menu-watermark" style={{ marginTop: "20px" }}>HAUNTED<span>WALLPAPERS</span></p>
        </div>
      </div>
    </>
  );
}