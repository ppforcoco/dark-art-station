"use client";
import { useEffect, useRef, useState } from "react";

export default function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef  = useRef<HTMLDivElement>(null);
  const mx  = useRef(0);
  const my  = useRef(0);
  const raf = useRef<number>(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    // Only activate on true pointer (mouse/trackpad) devices.
    // Touch-only phones/tablets keep native behaviour — zero CPU waste.
    const isPointerFine = window.matchMedia("(pointer: fine)").matches;
    if (!isPointerFine) return;

    // Reveal cursor elements (start hidden to prevent flash on touch devices)
    if (ringRef.current) ringRef.current.style.display = "block";
    if (dotRef.current)  dotRef.current.style.display  = "block";

    // ── Position tracking ─────────────────────────────────────────────────────
    const onMove = (e: MouseEvent) => {
      mx.current = e.clientX;
      my.current = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.left = `${e.clientX}px`;
        dotRef.current.style.top  = `${e.clientY}px`;
      }
    };

    // rAF loop for the lagging ring — gives the "trailing" feel
    const loop = () => {
      if (ringRef.current) {
        ringRef.current.style.left = `${mx.current}px`;
        ringRef.current.style.top  = `${my.current}px`;
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);

    // ── Event delegation — ONE listener on document, no MutationObserver ─────
    // Instead of attaching mouseenter/mouseleave to every a/button on the page
    // (which needed a MutationObserver to catch dynamically added elements),
    // we use a single mouseover on document and walk up the DOM to check if
    // the cursor is over an interactive element. O(1) listeners regardless of
    // how many links/buttons are on the page.
    const onOver = (e: MouseEvent) => {
      const target = e.target as Element | null;
      const interactive = target?.closest("a, button, [data-hover]");
      setHovered(!!interactive);
    };

    document.addEventListener("mousemove",  onMove);
    document.addEventListener("mouseover",  onOver);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  const ringStyle: React.CSSProperties = {
    position: "fixed", pointerEvents: "none", zIndex: 9999,
    width: 20, height: 20,
    border: "1px solid #c0001a", borderRadius: "50%",
    transform: `translate(-50%, -50%) scale(${hovered ? 2 : 1})`,
    transition: "transform 0.15s ease",
    display: "none",  // hidden until pointer:fine confirmed in useEffect
  };
  const dotStyle: React.CSSProperties = {
    position: "fixed", pointerEvents: "none", zIndex: 9999,
    width: 4, height: 4,
    background: "#ff3c00", borderRadius: "50%",
    transform: "translate(-50%, -50%)",
    display: "none",  // hidden until pointer:fine confirmed in useEffect
  };

  return (
    <>
      <div ref={ringRef} style={ringStyle} />
      <div ref={dotRef}  style={dotStyle}  />
    </>
  );
}