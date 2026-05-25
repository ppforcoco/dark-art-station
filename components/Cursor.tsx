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
function trustedSvg(svg: string): string | TrustedHTML {
  const policy = getSvgPolicy();
  return policy ? policy.createHTML(svg) : svg;
}

// ─── Default: dagger SVG ──────────────────────────────────────────────────────
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
</svg>
`;

// ─── Hover: red hand image via <img> tag ─────────────────────────────────────
const HAND_URL = "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/extras/haunted-wallpapers-cursor-icon.webp";
const HAND_IMG_HTML = `<img src="${HAND_URL}" width="48" height="48" alt="" style="display:block;pointer-events:none;" />`;

export default function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const el = cursorRef.current;
    if (!el) return;

    // Preload the hand image so first hover is instant
    const preload = new Image();
    preload.src = HAND_URL;

    const styleId = "hw-cursor-none-override";
    if (!document.getElementById(styleId)) {
      const s = document.createElement("style");
      s.id = styleId;
      s.textContent = "*, *::before, *::after { cursor: none !important; }";
      document.head.prepend(s);
    }

    el.style.display = "block";

    let mouseX = 0, mouseY = 0;
    let initialised = false;
    let isHover = false;
    let rafId = 0, rafRunning = false;
    let idleTimer: ReturnType<typeof setTimeout> | null = null;

    const startRaf = () => { if (rafRunning) return; rafRunning = true; rafId = requestAnimationFrame(loop); };
    const stopRaf  = () => { rafRunning = false; cancelAnimationFrame(rafId); };

    const loop = () => {
      if (!rafRunning) return;
      // Dagger: tip at pointer. Hand: offset so finger points at pointer
      const offsetX = isHover ? -8 : -16;
      const offsetY = isHover ? -4 : 0;
      const angle = isHover ? "0deg" : "-45deg";
      el.style.transform = `translate(${mouseX + offsetX}px, ${mouseY + offsetY}px) rotate(${angle})`;
      rafId = requestAnimationFrame(loop);
    };

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!initialised) { initialised = true; el.style.opacity = "1"; }
      startRaf();
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(stopRaf, 2000);
    };

    const onOver = (e: MouseEvent) => {
      const wasHover = isHover;
      isHover = !!(e.target as Element)?.closest(
        "a,button,[data-hover],input,select,textarea,.hw2-obs-card,.cat-card,.mosaic-card,.coll-card,.product-card,.download-btn"
      );
      if (isHover === wasHover) return;

      if (isHover) {
        el.style.width  = "48px";
        el.style.height = "48px";
        el.innerHTML = HAND_IMG_HTML;
        el.style.filter = "drop-shadow(0 0 8px rgba(192,0,26,0.6))";
      } else {
        el.style.width  = "32px";
        el.style.height = "64px";
        el.innerHTML = trustedSvg(DAGGER_SVG) as string;
        el.style.filter = "drop-shadow(0 0 4px rgba(192,0,26,0.7))";
      }
    };

    const onBlur        = () => { el.style.opacity = "0"; initialised = false; stopRaf(); };
    const onLeave       = () => { el.style.opacity = "0"; stopRaf(); };
    const onEnter       = () => { if (initialised) el.style.opacity = "1"; };
    const onContextMenu = () => { el.style.opacity = "0"; initialised = false; stopRaf(); };

    window.addEventListener("blur",          onBlur);
    document.addEventListener("mousemove",   onMove,       { passive: true });
    document.addEventListener("mouseover",   onOver,       { passive: true });
    document.addEventListener("mouseleave",  onLeave);
    document.addEventListener("mouseenter",  onEnter);
    document.addEventListener("contextmenu", onContextMenu);

    return () => {
      stopRaf();
      if (idleTimer) clearTimeout(idleTimer);
      window.removeEventListener("blur",          onBlur);
      document.removeEventListener("mousemove",   onMove);
      document.removeEventListener("mouseover",   onOver);
      document.removeEventListener("mouseleave",  onLeave);
      document.removeEventListener("mouseenter",  onEnter);
      document.removeEventListener("contextmenu", onContextMenu);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
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
        transition: "width 0.12s ease, height 0.12s ease, filter 0.12s, opacity 0.2s",
        willChange: "transform",
        transformOrigin: "top left",
      }}
    />
  );
}