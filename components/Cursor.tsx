"use client";

import { useEffect, useRef } from "react";

// ── Inject cursor:none at MODULE EVALUATION TIME ────────────────────────────
// This runs when the JS bundle is parsed, before React renders anything.
// It's the earliest possible moment — before even useEffect or useLayoutEffect.
// Result: native cursor is hidden before the first frame, zero flash.
if (typeof window !== "undefined" && !document.getElementById("hw-cur-none")) {
  const s = document.createElement("style");
  s.id = "hw-cur-none";
  s.textContent =
    "@media(pointer:fine){html,body,*,*::before,*::after," +
    "a,button,[role=button],input,select,textarea,label," +
    "[tabindex],summary{cursor:none!important}}";
  // appendChild: doesn't trigger a style recalculation (unlike prepend)
  document.head.appendChild(s);
}

// ── TrustedTypes helper ────────────────────────────────────────────────────
let _hwPolicy: TrustedTypePolicy | null = null;
function trustedHtml(html: string): string | TrustedHTML {
  if (typeof window === "undefined") return html;
  if (!window.trustedTypes?.createPolicy) return html;
  if (!_hwPolicy) {
    try {
      _hwPolicy = window.trustedTypes.createPolicy("hw-cur", {
        createHTML: (s: string) => s,
      });
    } catch {
      /* already registered */
    }
  }
  return _hwPolicy ? _hwPolicy.createHTML(html) : html;
}

// ── Assets ─────────────────────────────────────────────────────────────────
const HAND_URL =
  "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/extras/Red_horror_mouse_hand_icon.webp";

const DAGGER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="64" viewBox="0 0 32 64" fill="none">
  <polygon points="16,0 20,44 16,50 12,44" fill="#c0001a" filter="url(#glow)"/>
  <polygon points="16,0 18,38 16,44" fill="#ff4455" opacity="0.6"/>
  <rect x="4" y="44" width="24" height="5" rx="2" fill="#8b0010"/>
  <rect x="5" y="44.5" width="22" height="2" rx="1" fill="#c0001a" opacity="0.5"/>
  <rect x="12" y="49" width="8" height="12" rx="2" fill="#6b0010"/>
  <line x1="12" y1="52" x2="20" y2="52" stroke="#8b0010" stroke-width="1"/>
  <line x1="12" y1="55" x2="20" y2="55" stroke="#8b0010" stroke-width="1"/>
  <line x1="12" y1="58" x2="20" y2="58" stroke="#8b0010" stroke-width="1"/>
  <ellipse cx="16" cy="62" rx="5" ry="2.5" fill="#8b0010"/>
  <defs><filter id="glow" x="-40%" y="-10%" width="180%" height="120%">
    <feGaussianBlur stdDeviation="1.5" result="blur"/>
    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter></defs>
</svg>`;

const DAGGER_SCROLL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="64" viewBox="0 0 32 64" fill="none">
  <polygon points="16,0 20,44 16,50 12,44" fill="#8b0010" filter="url(#gs)"/>
  <polygon points="16,0 18,38 16,44" fill="#c0001a" opacity="0.5"/>
  <rect x="4" y="44" width="24" height="5" rx="2" fill="#5a000a"/>
  <rect x="12" y="49" width="8" height="12" rx="2" fill="#3d0007"/>
  <line x1="12" y1="52" x2="20" y2="52" stroke="#5a000a" stroke-width="1"/>
  <line x1="12" y1="55" x2="20" y2="55" stroke="#5a000a" stroke-width="1"/>
  <line x1="12" y1="58" x2="20" y2="58" stroke="#5a000a" stroke-width="1"/>
  <ellipse cx="16" cy="62" rx="5" ry="2.5" fill="#5a000a"/>
  <defs><filter id="gs" x="-40%" y="-10%" width="180%" height="120%">
    <feGaussianBlur stdDeviation="1" result="blur"/>
    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter></defs>
</svg>`;

const HAND_HTML = `<img src="${HAND_URL}" width="64" height="64" alt="" draggable="false" style="display:block;pointer-events:none;user-select:none;">`;

type CursorState = "default" | "hand";

const LINK_SEL = "a, [role='link']";
const BTN_SEL =
  "button,input,select,textarea,label,[role='button'],[role='checkbox']," +
  "[role='switch'],.download-btn,.hw-glow-btn-wrap,.social-btn,.reaction-btn," +
  ".more-strip-link,.hw2-obs-card,.cat-card,.mosaic-card,.coll-card,.product-card";

// ── Component ───────────────────────────────────────────────────────────────
export default function Cursor() {
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run on pointer:fine (desktop with mouse)
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = elRef.current;
    if (!el) return;

    // Preload hand image so it's ready instantly
    const img = new window.Image();
    img.src = HAND_URL;

    el.style.display = "block";
    el.innerHTML = trustedHtml(DAGGER_SVG) as string;

    let mx = -300, my = -300;
    let visible = false;
    let state: CursorState = "default";
    let isScrolling = false;
    let rafId = 0, rafRunning = false;
    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    let scrollTimer: ReturnType<typeof setTimeout> | null = null;

    const startRaf = () => {
      if (rafRunning) return;
      rafRunning = true;
      rafId = requestAnimationFrame(tick);
    };
    const stopRaf = () => {
      rafRunning = false;
      cancelAnimationFrame(rafId);
    };

    const tick = () => {
      if (!rafRunning) return;
      let ox = 0, oy = 0, rot = "-45deg";
      if (state === "hand") {
        ox = -18; oy = -6; rot = "0deg";
      } else if (isScrolling) {
        ox = -16; oy = 0; rot = "-20deg";
      } else {
        ox = -16; oy = 0; rot = "-45deg";
      }
      el.style.transform = `translate(${mx + ox}px,${my + oy}px) rotate(${rot})`;
      rafId = requestAnimationFrame(tick);
    };

    const applyState = (next: CursorState) => {
      if (next === state && !isScrolling) return;
      state = next;
      if (next === "hand") {
        el.style.width = "64px";
        el.style.height = "64px";
        el.innerHTML = trustedHtml(HAND_HTML) as string;
        el.style.filter =
          "drop-shadow(0 0 10px rgba(192,0,26,0.85)) drop-shadow(0 0 22px rgba(192,0,26,0.4))";
      } else {
        el.style.width = "32px";
        el.style.height = "64px";
        el.innerHTML = trustedHtml(
          isScrolling ? DAGGER_SCROLL_SVG : DAGGER_SVG
        ) as string;
        el.style.filter = isScrolling
          ? "drop-shadow(0 0 3px rgba(139,0,16,0.5))"
          : "drop-shadow(0 0 4px rgba(192,0,26,0.7))";
      }
    };

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!visible) {
        visible = true;
        el.style.opacity = "1";
      }
      startRaf();
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(stopRaf, 3000);
    };

    const onOver = (e: MouseEvent) => {
      if (isScrolling) return;
      const t = e.target as Element;
      if (t?.closest(LINK_SEL) && !t?.closest(BTN_SEL)) {
        applyState("hand");
      } else {
        applyState("default");
      }
    };

    const onScroll = () => {
      isScrolling = true;
      applyState("default");
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        isScrolling = false;
        const h = document.elementFromPoint(mx, my);
        if (h?.closest(LINK_SEL) && !h?.closest(BTN_SEL)) {
          applyState("hand");
        } else {
          applyState("default");
        }
      }, 180);
    };

    const hide = () => {
      el.style.opacity = "0";
      visible = false;
      stopRaf();
    };
    const show = () => {
      if (visible) el.style.opacity = "1";
    };

    document.addEventListener("mousemove",   onMove,   { passive: true });
    document.addEventListener("mouseover",   onOver,   { passive: true });
    document.addEventListener("mouseleave",  hide);
    document.addEventListener("mouseenter",  show);
    document.addEventListener("scroll",      onScroll, { passive: true });
    document.addEventListener("contextmenu", hide);
    window.addEventListener("blur", hide);

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
      window.removeEventListener("blur", hide);
    };
  }, []);

  return (
    <div
      ref={elRef}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: "" }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "32px",
        height: "64px",
        pointerEvents: "none",
        zIndex: 999999,
        opacity: 0,
        display: "none",
        filter: "drop-shadow(0 0 4px rgba(192,0,26,0.7))",
        transition: "opacity 0.15s",
        willChange: "transform",
        transformOrigin: "top left",
      }}
    />
  );
}