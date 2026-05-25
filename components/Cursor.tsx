"use client";
import { useEffect, useRef } from "react";

// ─── Trusted Types helper ────────────────────────────────────────────────────
let _hwSvgPolicy: TrustedTypePolicy | null = null;
function getSvgPolicy(): TrustedTypePolicy | null {
  if (typeof window === "undefined") return null;
  if (!window.trustedTypes?.createPolicy) return null;
  if (_hwSvgPolicy) return _hwSvgPolicy;
  try {
    _hwSvgPolicy = window.trustedTypes.createPolicy("hw-svg", {
      createHTML: (s: string) => s,
    });
  } catch { /* already registered */ }
  return _hwSvgPolicy;
}
function trustedHtml(html: string): string | TrustedHTML {
  const policy = getSvgPolicy();
  return policy ? policy.createHTML(html) : html;
}

// ─── Cursor images ────────────────────────────────────────────────────────────
// Default: dagger SVG
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

// Scroll state: tilted dagger SVG
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

// Hover: red horror hand
const HAND_URL = "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/extras/Red_horror_mouse_hand_icon.webp";
// Hotspot: fingertip is roughly at top-center of image (~50% x, ~10% y of a 64px image = offset -32px x, -6px y)
const HAND_HTML = `<img src="${HAND_URL}" width="64" height="64" alt="" draggable="false" style="display:block;pointer-events:none;user-select:none;" />`;

// ─── State machine ────────────────────────────────────────────────────────────
type CursorState = "default" | "hover" | "scrolling";

export default function Cursor() {
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const el = elRef.current;
    if (!el) return;

    // Preload hand image
    const img = new window.Image();
    img.src = HAND_URL;

    // Hide native cursor everywhere
    const styleId = "hw-cursor-none";
    if (!document.getElementById(styleId)) {
      const s = document.createElement("style");
      s.id = styleId;
      s.textContent = "*, *::before, *::after { cursor: none !important; }";
      document.head.prepend(s);
    }

    el.style.display = "block";

    let mouseX = 0, mouseY = 0;
    let visible = false;
    let state: CursorState = "default";
    let rafId = 0, rafRunning = false;
    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    let scrollTimer: ReturnType<typeof setTimeout> | null = null;

    // ── RAF loop ──────────────────────────────────────────────────────────────
    const startRaf = () => { if (rafRunning) return; rafRunning = true; rafId = requestAnimationFrame(tick); };
    const stopRaf  = () => { rafRunning = false; cancelAnimationFrame(rafId); };

    const tick = () => {
      if (!rafRunning) return;
      let ox = 0, oy = 0, angle = "-45deg";

      if (state === "hover") {
        // Fingertip hotspot: offset so the pointing finger tip hits the cursor position
        ox = -18; oy = -6; angle = "0deg";
      } else if (state === "scrolling") {
        ox = -16; oy = 0; angle = "-20deg";
      } else {
        ox = -16; oy = 0; angle = "-45deg";
      }

      el.style.transform = `translate(${mouseX + ox}px, ${mouseY + oy}px) rotate(${angle})`;
      rafId = requestAnimationFrame(tick);
    };

    // ── Apply visual state ────────────────────────────────────────────────────
    const applyState = (next: CursorState) => {
      if (next === state) return;
      state = next;

      if (next === "hover") {
        el.style.width = "64px";
        el.style.height = "64px";
        el.innerHTML = trustedHtml(HAND_HTML) as string;
        el.style.filter = "drop-shadow(0 0 10px rgba(192,0,26,0.8)) drop-shadow(0 0 20px rgba(192,0,26,0.4))";
      } else if (next === "scrolling") {
        el.style.width = "32px";
        el.style.height = "64px";
        el.innerHTML = trustedHtml(DAGGER_SCROLL_SVG) as string;
        el.style.filter = "drop-shadow(0 0 3px rgba(139,0,16,0.5))";
      } else {
        el.style.width = "32px";
        el.style.height = "64px";
        el.innerHTML = trustedHtml(DAGGER_SVG) as string;
        el.style.filter = "drop-shadow(0 0 4px rgba(192,0,26,0.7))";
      }
    };

    // ── Mouse move ────────────────────────────────────────────────────────────
    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!visible) {
        visible = true;
        el.style.opacity = "1";
      }
      startRaf();
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(stopRaf, 3000);
    };

    // ── Hover detection ───────────────────────────────────────────────────────
    const HOVER_SELECTOR = "a, button, [data-hover], input, select, textarea, label, [role='button'], .hw2-obs-card, .cat-card, .mosaic-card, .coll-card, .product-card, .download-btn, .more-strip-link";

    const onOver = (e: MouseEvent) => {
      if (state === "scrolling") return; // scroll wins
      const isLink = !!(e.target as Element)?.closest(HOVER_SELECTOR);
      applyState(isLink ? "hover" : "default");
    };

    // ── Scroll detection ──────────────────────────────────────────────────────
    const onScroll = () => {
      applyState("scrolling");
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        // After scroll stops, check if still hovering a link
        const hovered = document.elementFromPoint(mouseX, mouseY);
        const isLink = !!(hovered?.closest(HOVER_SELECTOR));
        applyState(isLink ? "hover" : "default");
      }, 180);
    };

    // ── Visibility ────────────────────────────────────────────────────────────
    const hide = () => { el.style.opacity = "0"; visible = false; stopRaf(); };
    const show = () => { if (visible) el.style.opacity = "1"; };

    window.addEventListener("blur",          hide);
    document.addEventListener("mousemove",   onMove,   { passive: true });
    document.addEventListener("mouseover",   onOver,   { passive: true });
    document.addEventListener("mouseleave",  hide);
    document.addEventListener("mouseenter",  show);
    document.addEventListener("scroll",      onScroll, { passive: true });
    document.addEventListener("contextmenu", hide);

    return () => {
      stopRaf();
      if (idleTimer)  clearTimeout(idleTimer);
      if (scrollTimer) clearTimeout(scrollTimer);
      window.removeEventListener("blur",          hide);
      document.removeEventListener("mousemove",   onMove);
      document.removeEventListener("mouseover",   onOver);
      document.removeEventListener("mouseleave",  hide);
      document.removeEventListener("mouseenter",  show);
      document.removeEventListener("scroll",      onScroll);
      document.removeEventListener("contextmenu", hide);
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
        transition: "width 0.1s ease, height 0.1s ease, filter 0.15s, opacity 0.15s",
        willChange: "transform",
        transformOrigin: "top left",
      }}
    />
  );
}