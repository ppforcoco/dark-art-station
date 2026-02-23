"use client";

import { useEffect, useRef, useState } from "react";

export default function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const mx = useRef(0);
  const my = useRef(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mx.current = e.clientX;
      my.current = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.left = `${e.clientX}px`;
        dotRef.current.style.top = `${e.clientY}px`;
      }
    };

    const animate = () => {
      if (ringRef.current) {
        ringRef.current.style.left = `${mx.current}px`;
        ringRef.current.style.top = `${my.current}px`;
      }
      raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);

    const addHover = () => {
      document.querySelectorAll("a, button, .cat-card, .product-card, [data-cursor-hover]").forEach((el) => {
        el.addEventListener("mouseenter", () => setHovered(true));
        el.addEventListener("mouseleave", () => setHovered(false));
      });
    };

    document.addEventListener("mousemove", onMove);
    addHover();

    // re-run on DOM mutations (dynamic content)
    const obs = new MutationObserver(addHover);
    obs.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf.current);
      obs.disconnect();
    };
  }, []);

  return (
    <>
      {/* Ring */}
      <div
        ref={ringRef}
        className="fixed pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#c0001a] transition-transform duration-150"
        style={{
          width: 20,
          height: 20,
          transform: `translate(-50%, -50%) scale(${hovered ? 2 : 1})`,
        }}
      />
      {/* Dot */}
      <div
        ref={dotRef}
        className="fixed pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff3c00]"
        style={{ width: 4, height: 4 }}
      />
    </>
  );
}