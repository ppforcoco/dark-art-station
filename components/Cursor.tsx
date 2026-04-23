"use client";
import { useEffect, useRef } from "react";

export default function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const ring = ringRef.current;
    const dot  = dotRef.current;
    if (!ring || !dot) return;

    const style = document.createElement("style");
    style.id = "cursor-hide-native";
    style.textContent = "html,body,*,*::before,*::after{cursor:none!important}";
    document.head.appendChild(style);

    ring.style.display = "block";
    dot.style.display  = "block";

    let initialised = false;

    const onMove = (e: MouseEvent) => {
      // On very first move: snap to position instantly (no transition), then re-enable
      if (!initialised) {
        initialised = true;
        ring.style.transition = "none";
        dot.style.transition  = "none";
        ring.style.transform = `translate(${e.clientX - 20}px, ${e.clientY - 20}px)`;
        dot.style.transform  = `translate(${e.clientX - 5}px,  ${e.clientY - 5}px)`;
        ring.style.opacity = "1";
        dot.style.opacity  = "1";
        // Re-enable smooth transitions after one paint frame
        requestAnimationFrame(() => {
          ring.style.transition = "";
          dot.style.transition  = "";
        });
        return;
      }
      ring.style.transform = `translate(${e.clientX - 20}px, ${e.clientY - 20}px)`;
      dot.style.transform  = `translate(${e.clientX - 5}px,  ${e.clientY - 5}px)`;
    };

    const onOver = (e: MouseEvent) => {
      const isBtn = !!(e.target as Element)?.closest(
        "a,button,[data-hover],input,select,textarea,.hw2-obs-card,.cat-card,.mosaic-card,.coll-card,.product-card,.download-btn"
      );
      if (isBtn) {
        ring.style.width       = "52px";
        ring.style.height      = "52px";
        ring.style.borderColor = "#ff2233";
        ring.style.boxShadow   = "0 0 16px rgba(255,34,51,0.6), 0 0 32px rgba(192,0,26,0.3)";
        ring.style.background  = "rgba(192,0,26,0.07)";
        dot.style.background   = "#ff2233";
        dot.style.width        = "8px";
        dot.style.height       = "8px";
      } else {
        ring.style.width       = "40px";
        ring.style.height      = "40px";
        ring.style.borderColor = "#c0001a";
        ring.style.boxShadow   = "0 0 8px rgba(192,0,26,0.5)";
        ring.style.background  = "transparent";
        dot.style.background   = "#c0001a";
        dot.style.width        = "10px";
        dot.style.height       = "10px";
      }
    };

    const onLeave = () => { ring.style.opacity = "0"; dot.style.opacity = "0"; };
    const onEnter = () => { ring.style.opacity = "1"; dot.style.opacity = "1"; };

    document.addEventListener("mousemove",  onMove,  { passive: true });
    document.addEventListener("mouseover",  onOver,  { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    return () => {
      document.removeEventListener("mousemove",  onMove);
      document.removeEventListener("mouseover",  onOver);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      document.getElementById("cursor-hide-native")?.remove();
    };
  }, []);

  return (
    <>
      <div ref={ringRef} style={{
        position:"fixed", top:0, left:0, width:"40px", height:"40px",
        border:"2.5px solid #c0001a", borderRadius:"50%",
        pointerEvents:"none", zIndex:9999, opacity:0,
        boxShadow:"0 0 8px rgba(192,0,26,0.5)",
        transition:"width 0.15s ease, height 0.15s ease, border-color 0.15s, box-shadow 0.15s, background 0.15s, opacity 0.2s",
        willChange:"transform", display:"none",
      }}/>
      <div ref={dotRef} style={{
        position:"fixed", top:0, left:0, width:"10px", height:"10px",
        background:"#c0001a", borderRadius:"50%",
        pointerEvents:"none", zIndex:10000, opacity:0,
        boxShadow:"0 0 6px rgba(192,0,26,0.9)",
        transition:"width 0.1s ease, height 0.1s ease, background 0.1s, opacity 0.2s",
        willChange:"transform", display:"none",
      }}/>
    </>
  );
}