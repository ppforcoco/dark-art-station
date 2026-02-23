"use client";
import { useEffect, useRef, useState } from "react";

export default function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef  = useRef<HTMLDivElement>(null);
  const mx = useRef(0);
  const my = useRef(0);
  const raf = useRef<number>(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mx.current = e.clientX;
      my.current = e.clientY;
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

    const bindHover = () => {
      document.querySelectorAll("a, button, [data-hover]").forEach((el) => {
        el.addEventListener("mouseenter", () => setHovered(true));
        el.addEventListener("mouseleave", () => setHovered(false));
      });
    };
    bindHover();
    const obs = new MutationObserver(bindHover);
    obs.observe(document.body, { childList: true, subtree: true });

    document.addEventListener("mousemove", onMove);
    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf.current);
      obs.disconnect();
    };
  }, []);

  const ringStyle: React.CSSProperties = {
    position: "fixed", pointerEvents: "none", zIndex: 9999,
    width: 20, height: 20,
    border: "1px solid #c0001a", borderRadius: "50%",
    transform: `translate(-50%, -50%) scale(${hovered ? 2 : 1})`,
    transition: "transform 0.15s ease",
  };
  const dotStyle: React.CSSProperties = {
    position: "fixed", pointerEvents: "none", zIndex: 9999,
    width: 4, height: 4,
    background: "#ff3c00", borderRadius: "50%",
    transform: "translate(-50%, -50%)",
  };

  return (
    <>
      <div ref={ringRef} style={ringStyle} />
      <div ref={dotRef}  style={dotStyle}  />
    </>
  );
}