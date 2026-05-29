"use client";

import { useEffect, useRef } from "react";

// ── Step 1: Hide native cursor at module-eval time ───────────────────────────
if (typeof document !== "undefined") {
  const existing = document.getElementById("hw-cursor-none");
  if (!existing) {
    const s = document.createElement("style");
    s.id = "hw-cursor-none";
    s.textContent = "html { cursor: none !important; } * { cursor: none !important; }";
    const head = document.head || document.documentElement;
    head.insertBefore(s, head.firstChild);
  }
}
// ─────────────────────────────────────────────────────────────────────────────

export default function Cursor() {
  const dotRef   = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot   = dotRef.current;
    const trail = trailRef.current;
    if (!dot || !trail) return;

    // Touch / coarse devices: remove custom cursor, restore native
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    if (isCoarse) {
      dot.style.display   = "none";
      trail.style.display = "none";
      const s = document.getElementById("hw-cursor-none");
      if (s) s.remove();
      return;
    }

    let mouseX = -400, mouseY = -400;
    let trailX = -400, trailY = -400;
    let rafId: number;
    let isPointer = false;

    function onMouseMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Detect hoverable targets
      const target = e.target as Element | null;
      const nowPointer = !!target?.closest(
        'a, button, [role="button"], input, select, textarea, label, [tabindex]'
      );

      if (nowPointer !== isPointer) {
        isPointer = nowPointer;
        dot.style.background = isPointer
          ? "rgba(192,0,26,0.9)"
          : "rgba(255,255,255,0.95)";
        trail.style.borderColor = isPointer
          ? "rgba(192,0,26,0.6)"
          : "rgba(192,0,26,0.35)";
      }

      // Move dot instantly — no transform transition on position
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) scale(${isPointer ? 1.4 : 1})`;
    }

    function tick() {
      trailX += (mouseX - trailX) * 0.1;
      trailY += (mouseY - trailY) * 0.1;
      trail.style.transform = `translate(${trailX}px, ${trailY}px) scale(${isPointer ? 1.5 : 1})`;
      rafId = requestAnimationFrame(tick);
    }

    function onMouseLeave() {
      dot.style.opacity   = "0";
      trail.style.opacity = "0";
    }
    function onMouseEnter() {
      dot.style.opacity   = "1";
      trail.style.opacity = "1";
    }

    window.addEventListener("mousemove",    onMouseMove,  { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove",    onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      {/* Main dot — snaps to mouse instantly, NO transform transition */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position:      "fixed",
          top:           0,
          left:          0,
          width:         "8px",
          height:        "8px",
          borderRadius:  "50%",
          background:    "rgba(255,255,255,0.95)",
          pointerEvents: "none",
          zIndex:        99999,
          marginTop:     "-4px",
          marginLeft:    "-4px",
          willChange:    "transform",
          transform:     "translate(-400px,-400px)",
          // ✅ FIX: Only transition `background` — NOT `transform`
          // Transitioning transform was causing a lag that looked like a second cursor
          transition:    "background 0.15s, opacity 0.2s",
          boxShadow:     "0 0 6px rgba(192,0,26,0.5)",
        }}
      />

      {/* Trailing ring — lerps behind the dot via rAF */}
      <div
        ref={trailRef}
        aria-hidden="true"
        style={{
          position:      "fixed",
          top:           0,
          left:          0,
          width:         "28px",
          height:        "28px",
          borderRadius:  "50%",
          border:        "1.5px solid rgba(192,0,26,0.35)",
          pointerEvents: "none",
          zIndex:        99998,
          marginTop:     "-14px",
          marginLeft:    "-14px",
          willChange:    "transform",
          transform:     "translate(-400px,-400px)",
          transition:    "border-color 0.2s, opacity 0.2s",
        }}
      />
    </>
  );
}