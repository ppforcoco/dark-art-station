"use client";
import { useEffect, useRef } from "react";

export default function Cursor() {
  const ringRef  = useRef<HTMLDivElement>(null);
  const dotRef   = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const mx = useRef(0);
  const my = useRef(0);
  const tx = useRef(0); // trail lags behind
  const ty = useRef(0);
  const raf = useRef<number>(0);
  const hovering = useRef(false);
  const dragging = useRef(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const ring  = ringRef.current;
    const dot   = dotRef.current;
    const trail = trailRef.current;
    if (!ring || !dot || !trail) return;

    // Hide native cursor everywhere
    const style = document.createElement("style");
    style.id = "cursor-hide-native";
    style.textContent = "html,body,*,*::before,*::after{cursor:none!important}";
    document.head.appendChild(style);

    ring.style.display  = "block";
    dot.style.display   = "block";
    trail.style.display = "block";
    ring.style.opacity  = "0";
    dot.style.opacity   = "0";
    trail.style.opacity = "0";

    const loop = () => {
      // Dot snaps instantly to mouse
      dot.style.left = `${mx.current}px`;
      dot.style.top  = `${my.current}px`;

      // Ring follows with slight lag
      tx.current += (mx.current - tx.current) * 0.18;
      ty.current += (my.current - ty.current) * 0.18;
      ring.style.left  = `${tx.current}px`;
      ring.style.top   = `${ty.current}px`;

      // Trail even lazier
      trail.style.left = `${tx.current}px`;
      trail.style.top  = `${ty.current}px`;

      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);

    const onMove = (e: MouseEvent) => {
      mx.current = e.clientX;
      my.current = e.clientY;
      if (!dragging.current) {
        ring.style.opacity  = "1";
        dot.style.opacity   = "1";
        trail.style.opacity = "1";
      }
    };

    const onOver = (e: MouseEvent) => {
      if (dragging.current) return;
      const el = e.target as Element;
      const isHoverable = !!el?.closest(
        "a, button, [data-hover], input, textarea, select, label, .hw2-obs-card, .cat-card, .mosaic-card, .product-card, .download-btn, .hw-daily__image-wrap"
      );
      hovering.current = isHoverable;

      if (isHoverable) {
        ring.style.transform = "translate(-50%, -50%) scale(2.2)";
        ring.style.borderColor = "#ff2233";
        ring.style.borderWidth = "3px";
        ring.style.background = "rgba(192,0,26,0.08)";
        ring.style.mixBlendMode = "normal";
        dot.style.transform = "translate(-50%, -50%) scale(2)";
        dot.style.background = "#ff2233";
        dot.style.boxShadow = "0 0 12px #ff2233, 0 0 24px rgba(255,34,51,0.5)";
        trail.style.transform = "translate(-50%, -50%) scale(2.8)";
        trail.style.opacity = "0.15";
      } else {
        ring.style.transform = "translate(-50%, -50%) scale(1)";
        ring.style.borderColor = "#c0001a";
        ring.style.borderWidth = "2.5px";
        ring.style.background = "transparent";
        dot.style.transform = "translate(-50%, -50%) scale(1)";
        dot.style.background = "#c0001a";
        dot.style.boxShadow = "0 0 8px rgba(192,0,26,0.8)";
        trail.style.transform = "translate(-50%, -50%) scale(1)";
        trail.style.opacity = "0.25";
      }
    };

    const onLeave = () => {
      ring.style.opacity = "0";
      dot.style.opacity = "0";
      trail.style.opacity = "0";
    };
    const onEnter = () => {
      if (!dragging.current) {
        ring.style.opacity = "1";
        dot.style.opacity = "1";
        trail.style.opacity = "1";
      }
    };
    const onDown = () => {
      dragging.current = true;
      ring.style.opacity = "0";
      dot.style.opacity = "0";
      trail.style.opacity = "0";
    };
    const onUp = () => {
      dragging.current = false;
      ring.style.opacity = "1";
      dot.style.opacity = "1";
    };

    document.addEventListener("mousemove",  onMove,  { passive: true });
    document.addEventListener("mouseover",  onOver,  { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    document.addEventListener("mousedown",  onDown);
    document.addEventListener("mouseup",    onUp);

    return () => {
      document.removeEventListener("mousemove",  onMove);
      document.removeEventListener("mouseover",  onOver);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      document.removeEventListener("mousedown",  onDown);
      document.removeEventListener("mouseup",    onUp);
      cancelAnimationFrame(raf.current);
      document.getElementById("cursor-hide-native")?.remove();
    };
  }, []);

  return (
    <>
      {/* Outer lagging ring */}
      <div
        ref={ringRef}
        style={{
          position:      "fixed",
          pointerEvents: "none",
          zIndex:        9999,
          width:         36,
          height:        36,
          border:        "2.5px solid #c0001a",
          borderRadius:  "50%",
          transform:     "translate(-50%, -50%) scale(1)",
          transition:    "transform 0.12s ease, border-color 0.12s, border-width 0.12s, background 0.12s, opacity 0.15s",
          display:       "none",
          willChange:    "left, top",
          boxShadow:     "0 0 10px rgba(192,0,26,0.4), inset 0 0 6px rgba(192,0,26,0.1)",
        }}
      />
      {/* Centre dot — snaps to mouse */}
      <div
        ref={dotRef}
        style={{
          position:        "fixed",
          pointerEvents:   "none",
          zIndex:          10000,
          width:           10,
          height:          10,
          backgroundColor: "#c0001a",
          borderRadius:    "50%",
          transform:       "translate(-50%, -50%) scale(1)",
          transition:      "transform 0.08s ease, background 0.12s, box-shadow 0.12s, opacity 0.15s",
          display:         "none",
          willChange:      "left, top",
          boxShadow:       "0 0 8px rgba(192,0,26,0.8)",
        }}
      />
      {/* Glow trail */}
      <div
        ref={trailRef}
        style={{
          position:      "fixed",
          pointerEvents: "none",
          zIndex:        9998,
          width:         60,
          height:        60,
          borderRadius:  "50%",
          background:    "radial-gradient(circle, rgba(192,0,26,0.3) 0%, transparent 70%)",
          transform:     "translate(-50%, -50%) scale(1)",
          transition:    "transform 0.2s ease, opacity 0.2s",
          display:       "none",
          willChange:    "left, top",
          opacity:       0.25,
        }}
      />
    </>
  );
}