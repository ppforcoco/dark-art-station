"use client";
import { useEffect, useRef } from "react";

export default function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef  = useRef<HTMLDivElement>(null);
  const mx      = useRef(0);
  const my      = useRef(0);
  const raf     = useRef<number>(0);
  const dragging = useRef(false);

  useEffect(() => {
    // Only on real pointer devices, never on touch screens
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const ring = ringRef.current;
    const dot  = dotRef.current;
    if (!ring || !dot) return;

    // Hide native cursor site-wide
    const style = document.createElement("style");
    style.id = "cursor-hide-native";
    style.textContent = "html,body,*,*::before,*::after{cursor:none!important}";
    document.head.appendChild(style);

    // Show elements
    ring.style.display = "block";
    dot.style.display  = "block";
    ring.style.opacity = "0";
    dot.style.opacity  = "0";

    // rAF loop — runs every frame, always positions from refs (no React state)
    const loop = () => {
      ring.style.left = `${mx.current}px`;
      ring.style.top  = `${my.current}px`;
      dot.style.left  = `${mx.current}px`;
      dot.style.top   = `${my.current}px`;
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);

    const onMove = (e: MouseEvent) => {
      mx.current = e.clientX;
      my.current = e.clientY;
      // Only show cursor if not dragging
      if (!dragging.current) {
        ring.style.opacity = "1";
        dot.style.opacity  = "1";
      }
    };

    const onOver = (e: MouseEvent) => {
      if (dragging.current) return;
      const hovering = !!(e.target as Element)?.closest("a, button, [data-hover]");
      ring.style.transform = `translate(-50%, -50%) scale(${hovering ? 2 : 1})`;
    };

    const onLeave = () => {
      ring.style.opacity = "0";
      dot.style.opacity  = "0";
    };

    const onEnter = () => {
      if (!dragging.current) {
        ring.style.opacity = "1";
        dot.style.opacity  = "1";
      }
    };

    // Hide cursor when mouse button held down (slider drag)
    const onMouseDown = () => {
      dragging.current = true;
      ring.style.opacity = "0";
      dot.style.opacity  = "0";
    };

    // Show cursor when mouse button released
    const onMouseUp = () => {
      dragging.current = false;
      ring.style.opacity = "1";
      dot.style.opacity  = "1";
    };

    document.addEventListener("mousemove",  onMove,     { passive: true });
    document.addEventListener("mouseover",  onOver,     { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    document.addEventListener("mousedown",  onMouseDown);
    document.addEventListener("mouseup",    onMouseUp);

    return () => {
      document.removeEventListener("mousemove",  onMove);
      document.removeEventListener("mouseover",  onOver);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      document.removeEventListener("mousedown",  onMouseDown);
      document.removeEventListener("mouseup",    onMouseUp);
      cancelAnimationFrame(raf.current);
      document.getElementById("cursor-hide-native")?.remove();
    };
  }, []);

  return (
    <>
      {/* Ring — follows mouse, scales on hover */}
      <div
        ref={ringRef}
        style={{
          position:      "fixed",
          pointerEvents: "none",
          zIndex:        9999,
          width:         20,
          height:        20,
          border:        "1px solid #c0001a",
          borderRadius:  "50%",
          transform:     "translate(-50%, -50%) scale(1)",
          transition:    "transform 0.15s ease, opacity 0.15s ease",
          display:       "none",   // shown by JS after mount
          willChange:    "left, top",
        }}
      />
      {/* Centre dot */}
      <div
        ref={dotRef}
        style={{
          position:        "fixed",
          pointerEvents:   "none",
          zIndex:          10000,
          width:           4,
          height:          4,
          backgroundColor: "#c0001a",
          borderRadius:    "50%",
          transform:       "translate(-50%, -50%)",
          transition:      "opacity 0.15s ease",
          display:         "none",  // shown by JS after mount
          willChange:      "left, top",
        }}
      />
    </>
  );
}
