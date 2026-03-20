"use client";
import { useEffect, useRef, useState } from "react";

export default function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef  = useRef<HTMLDivElement>(null);
  const mx  = useRef(0);
  const my  = useRef(0);
  const raf = useRef<number>(0);
  const [hovered,     setHovered]     = useState(false);
  const [cursorStyle, setCursorStyle] = useState("default");

  // Watch data-cursor attribute so the ring hides when an emoji cursor is active
  useEffect(() => {
    const read = () => {
      setCursorStyle(document.documentElement.getAttribute("data-cursor") ?? "default");
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-cursor"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const isPointerFine = window.matchMedia("(pointer: fine)").matches;
    if (!isPointerFine) return;

    // Hide ring/dot when an emoji cursor is selected (CSS handles the cursor icon)
    if (cursorStyle !== "default") {
      if (ringRef.current) ringRef.current.style.display = "none";
      if (dotRef.current)  dotRef.current.style.display  = "none";
      cancelAnimationFrame(raf.current);
      return;
    }

    // Show ring/dot for the default ring cursor style
    if (ringRef.current) ringRef.current.style.display = "block";
    if (dotRef.current)  dotRef.current.style.display  = "block";

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

    const onOver = (e: MouseEvent) => {
      const target = e.target as Element | null;
      setHovered(!!target?.closest("a, button, [data-hover]"));
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      cancelAnimationFrame(raf.current);
    };
  }, [cursorStyle]);

  const ringStyle: React.CSSProperties = {
    position: "fixed", pointerEvents: "none", zIndex: 9999,
    width: 20, height: 20,
    border: "1px solid #c0001a", borderRadius: "50%",
    transform: `translate(-50%, -50%) scale(${hovered ? 2 : 1})`,
    transition: "transform 0.15s ease",
    display: "none",
  };
  const dotStyle: React.CSSProperties = {
    position: "fixed", pointerEvents: "none", zIndex: 9999,
    width: 4, height: 4,
    background: "#ff3c00", borderRadius: "50%",
    transform: "translate(-50%, -50%)",
    display: "none",
  };

  return (
    <>
      <div ref={ringRef} style={ringStyle} />
      <div ref={dotRef}  style={dotStyle}  />
    </>
  );
}