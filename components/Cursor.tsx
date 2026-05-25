"use client";
import { useEffect, useRef } from "react";

// ─── Trusted Types helper ────────────────────────────────────────────────────
let _hwPolicy: TrustedTypePolicy | null = null;
function trustedHtml(html: string): string | TrustedHTML {
  if (typeof window === "undefined") return html;
  if (!window.trustedTypes?.createPolicy) return html;
  if (!_hwPolicy) {
    try {
      _hwPolicy = window.trustedTypes.createPolicy("hw-cur", { createHTML: (s: string) => s });
    } catch { /* already registered */ }
  }
  return _hwPolicy ? _hwPolicy.createHTML(html) : html;
}

// ─── Assets ───────────────────────────────────────────────────────────────────
const HAND_URL   = "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/extras/Red_horror_mouse_hand_icon.webp";
const CURSOR_URL = "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/extras/haunted-wallpapers-cursor-icon.webp";

// ─── Default dagger SVG ───────────────────────────────────────────────────────
const DAGGER_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="64" viewBox="0 0 32 64" fill="none">
  <polygon points="16,0 20,44 16,50 12,44" fill="#c0001a" filter="url(#glow)"/>
  <polygon points="16,0 18,38 16,44" fill="#ff4455" opacity="0.6"/>
  <rect x="4" y="44" width="24" height="5" rx="2" fill="#8b0010"/>
  <rect x="5" y="44.5" width="22" height="2" rx="1" fill="#c0001a" opacity="0.5"/>
  <rect x="12" y="49" width="8" height="12" rx="2" fill="#6b0010"/>
  <line x1="12" y1="52" x2="20" y2="52" stroke="#8b0010" stroke-width="1"/>
  <line x1="12" y1="55" x2="20" y2="55" stroke="#8b0010" stroke-width="1"/>
  <line x1="12" y1="58" x2="20" y2="58" stroke="#8b0010" stroke-width="1"/>
  <ellipse cx="16" cy="62" rx="5" ry="2.5" fill="#8b0010"/>
  <ellipse cx="16" cy="61.5" rx="4" ry="1.5" fill="#c0001a" opacity="0.4"/>
  <defs>
    <filter id="glow" x="-40%" y="-10%" width="180%" height="120%">
      <feGaussianBlur stdDeviation="1.5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
</svg>`;

// ─── Scrolling dagger (dimmed) ────────────────────────────────────────────────
const DAGGER_SCROLL_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="64" viewBox="0 0 32 64" fill="none">
  <polygon points="16,0 20,44 16,50 12,44" fill="#8b0010" filter="url(#glowscroll)"/>
  <polygon points="16,0 18,38 16,44" fill="#c0001a" opacity="0.5"/>
  <rect x="4" y="44" width="24" height="5" rx="2" fill="#5a000a"/>
  <rect x="12" y="49" width="8" height="12" rx="2" fill="#3d0007"/>
  <line x1="12" y1="52" x2="20" y2="52" stroke="#5a000a" stroke-width="1"/>
  <line x1="12" y1="55" x2="20" y2="55" stroke="#5a000a" stroke-width="1"/>
  <line x1="12" y1="58" x2="20" y2="58" stroke="#5a000a" stroke-width="1"/>
  <ellipse cx="16" cy="62" rx="5" ry="2.5" fill="#5a000a"/>
  <defs>
    <filter id="glowscroll" x="-40%" y="-10%" width="180%" height="120%">
      <feGaussianBlur stdDeviation="1" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
</svg>`;

const HAND_HTML   = `<img src="${HAND_URL}"   width="64" height="64" alt="" draggable="false" style="display:block;pointer-events:none;user-select:none;">`;
const CURSOR_HTML = `<img src="${CURSOR_URL}" width="48" height="48" alt="" draggable="false" style="display:block;pointer-events:none;user-select:none;">`;

// ─── State types ──────────────────────────────────────────────────────────────
// "default"    → dagger (normal movement, scrolling)
// "hand"       → red horror hand (hovering a link / <a>)
// "cursor-btn" → haunted cursor webp (hovering a button / interactive control)
type CursorState = "default" | "hand" | "cursor-btn";

// Selectors — order matters: button check runs first inside onOver
const LINK_SEL = "a, [role='link']";
const BTN_SEL  = [
  "button",
  "input",
  "select",
  "textarea",
  "label",
  "[role='button']",
  "[role='checkbox']",
  "[role='switch']",
  ".download-btn",
  ".hw-glow-btn-wrap",
  ".social-btn",
  ".reaction-btn",
  ".more-strip-link",
  ".hw2-obs-card",
  ".cat-card",
  ".mosaic-card",
  ".coll-card",
  ".product-card",
].join(", ");

export default function Cursor() {
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Desktop pointer only
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = elRef.current;
    if (!el) return;

    // Preload both raster images so first hover is instant
    [HAND_URL, CURSOR_URL].forEach(url => {
      const img = new window.Image();
      img.src = url;
    });

    // Suppress native cursor globally
    const styleId = "hw-cursor-none";
    if (!document.getElementById(styleId)) {
      const s = document.createElement("style");
      s.id = styleId;
      s.textContent = "*, *::before, *::after { cursor: none !important; }";
      document.head.prepend(s);
    }

    el.style.display = "block";

    let mx = 0, my = 0;
    let visible = false;
    let state: CursorState = "default";
    let isScrolling = false;
    let rafId = 0, rafRunning = false;
    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    let scrollTimer: ReturnType<typeof setTimeout> | null = null;

    // ── RAF position loop ─────────────────────────────────────────────────────
    const startRaf = () => { if (rafRunning) return; rafRunning = true; rafId = requestAnimationFrame(tick); };
    const stopRaf  = () => { rafRunning = false; cancelAnimationFrame(rafId); };

    const tick = () => {
      if (!rafRunning) return;
      let ox = 0, oy = 0, rot = "-45deg";

      if (state === "hand") {
        // Fingertip of the red hand at pointer position
        ox = -18; oy = -6; rot = "0deg";
      } else if (state === "cursor-btn") {
        // Center of haunted cursor at pointer
        ox = -24; oy = -24; rot = "0deg";
      } else if (isScrolling) {
        // Tilted dimmed dagger while scrolling
        ox = -16; oy = 0; rot = "-20deg";
      } else {
        // Normal dagger
        ox = -16; oy = 0; rot = "-45deg";
      }

      el.style.transform = `translate(${mx + ox}px, ${my + oy}px) rotate(${rot})`;
      rafId = requestAnimationFrame(tick);
    };

    // ── Visual state application ──────────────────────────────────────────────
    const applyState = (next: CursorState) => {
      if (next === state && !isScrolling) return;
      state = next;

      if (next === "hand") {
        el.style.width = "64px"; el.style.height = "64px";
        el.innerHTML = trustedHtml(HAND_HTML) as string;
        el.style.filter = "drop-shadow(0 0 10px rgba(192,0,26,0.85)) drop-shadow(0 0 22px rgba(192,0,26,0.4))";
      } else if (next === "cursor-btn") {
        el.style.width = "48px"; el.style.height = "48px";
        el.innerHTML = trustedHtml(CURSOR_HTML) as string;
        el.style.filter = "drop-shadow(0 0 8px rgba(192,0,26,0.7)) drop-shadow(0 0 18px rgba(192,0,26,0.35))";
      } else {
        // default — show scroll variant if currently scrolling
        el.style.width = "32px"; el.style.height = "64px";
        el.innerHTML = trustedHtml(isScrolling ? DAGGER_SCROLL_SVG : DAGGER_SVG) as string;
        el.style.filter = isScrolling
          ? "drop-shadow(0 0 3px rgba(139,0,16,0.5))"
          : "drop-shadow(0 0 4px rgba(192,0,26,0.7))";
      }
    };

    // ── Mouse move ────────────────────────────────────────────────────────────
    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      if (!visible) { visible = true; el.style.opacity = "1"; }
      startRaf();
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(stopRaf, 3000);
    };

    // ── Hover detection ───────────────────────────────────────────────────────
    const onOver = (e: MouseEvent) => {
      if (isScrolling) return; // scroll state wins
      const t = e.target as Element;
      if (t?.closest(BTN_SEL)) {
        applyState("cursor-btn");
      } else if (t?.closest(LINK_SEL)) {
        applyState("hand");
      } else {
        applyState("default");
      }
    };

    // ── Scroll detection ──────────────────────────────────────────────────────
    const onScroll = () => {
      isScrolling = true;
      applyState("default"); // re-renders with scroll dagger
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        isScrolling = false;
        // Re-check what's under the cursor after scroll settles
        const hovered = document.elementFromPoint(mx, my);
        if (hovered?.closest(BTN_SEL)) {
          applyState("cursor-btn");
        } else if (hovered?.closest(LINK_SEL)) {
          applyState("hand");
        } else {
          applyState("default");
        }
      }, 180);
    };

    // ── Visibility ────────────────────────────────────────────────────────────
    const hide = () => { el.style.opacity = "0"; visible = false; stopRaf(); };
    const show = () => { if (visible) el.style.opacity = "1"; };

    document.addEventListener("mousemove",   onMove,   { passive: true });
    document.addEventListener("mouseover",   onOver,   { passive: true });
    document.addEventListener("mouseleave",  hide);
    document.addEventListener("mouseenter",  show);
    document.addEventListener("scroll",      onScroll, { passive: true });
    document.addEventListener("contextmenu", hide);
    window.addEventListener("blur",          hide);

    return () => {
      stopRaf();
      if (idleTimer)   clearTimeout(idleTimer);
      if (scrollTimer) clearTimeout(scrollTimer);
      document.removeEventListener("mousemove",   onMove);
      document.removeEventListener("mouseover",   onOver);
      document.removeEventListener("mouseleave",  hide);
      document.removeEventListener("mouseenter",  show);
      document.removeEventListener("scroll",      onScroll);
      document.removeEventListener("contextmenu", hide);
      window.removeEventListener("blur",          hide);
    };
  }, []);

  return (
    <div
      ref={elRef}
      dangerouslySetInnerHTML={{ __html: DAGGER_SVG }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "32px",
        height: "64px",
        pointerEvents: "none",
        zIndex: 99999,
        opacity: 0,
        display: "none",
        filter: "drop-shadow(0 0 4px rgba(192,0,26,0.7))",
        transition: "width 0.08s ease, height 0.08s ease, filter 0.12s, opacity 0.15s",
        willChange: "transform",
        transformOrigin: "top left",
      }}
    />
  );
}