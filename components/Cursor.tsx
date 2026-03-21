"use client";
import { useEffect, useRef, useState } from "react";

export default function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef  = useRef<HTMLDivElement>(null);
  const mx      = useRef(0);
  const my      = useRef(0);
  const raf     = useRef<number>(0);
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Never show on touch/mobile — only real pointer devices
    if (!window.matchMedia("(pointer: fine)").matches) return;

    // Show ring as soon as mouse first moves
    const onMove = (e: MouseEvent) => {
      mx.current = e.clientX;
      my.current = e.clientY;
      setVisible(true);
      if (dotRef.current) {
        dotRef.current.style.left = `${e.clientX}px`;
        dotRef.current.style.top  = `${e.clientY}px`;
      }
    };

    const loop = () => {
      if (ringRef.current) {
        ringRef.current.style.left = `${mx.current}px`;
        ringRef.current.style.top  = `${my.current}px`;
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);

    const onOver = (e: MouseEvent) => {
      setHovered(!!(e.target as Element)?.closest("a, button, [data-hover]"));
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <>
      {/* Red ring — follows mouse with slight lag */}
      <div ref={ringRef} style={{
        position: "fixed", pointerEvents: "none", zIndex: 9999,
        width: 20, height: 20,
        border: "1px solid #c0001a", borderRadius: "50%",
        transform: `translate(-50%, -50%) scale(${hovered ? 2 : 1})`,
        transition: "transform 0.15s ease",
        display: visible ? "block" : "none",
      }} />
      {/* Orange dot — snaps directly to cursor position */}
      <div ref={dotRef} style={{
        position: "fixed", pointerEvents: "none", zIndex: 9999,
        width: 4, height: 4,
        background: "#ff3c00", borderRadius: "50%",
        transform: "translate(-50%, -50%)",
        display: visible ? "block" : "none",
      }} />
    </>
  );
}