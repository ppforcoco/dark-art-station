"use client";

import { useState, useRef } from "react";

export default function ProtectedImg({
  src, alt, className, style, loading,
}: {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  loading?: "lazy" | "eager";
}) {
  const [showMsg, setShowMsg] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function block(e: React.SyntheticEvent) {
    e.preventDefault();
    setShowMsg(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowMsg(false), 2800);
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={className}
        style={{ ...style, userSelect: "none", WebkitUserSelect: "none", pointerEvents: "none" }}
        loading={loading}
        onContextMenu={block}
        onTouchStart={() => {}}
        draggable={false}
      />

      {/* Invisible touch shield — catches long-press on mobile */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0, zIndex: 5,
          WebkitTouchCallout: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
        } as React.CSSProperties}
        onContextMenu={block}
        onDragStart={block}
      />

      {/* Toast message */}
      {showMsg && (
        <div style={{
          position: "absolute",
          bottom: "18px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 20,
          background: "rgba(10,6,20,0.96)",
          border: "1px solid rgba(192,0,26,0.6)",
          padding: "10px 18px",
          borderRadius: "3px",
          whiteSpace: "nowrap",
          fontFamily: "var(--font-space, monospace)",
          fontSize: "0.68rem",
          letterSpacing: "0.08em",
          color: "#f0e8e8",
          boxShadow: "0 0 20px rgba(192,0,26,0.25)",
          animation: "hwToastIn 0.2s ease",
          textAlign: "center",
        }}>
          ↓ Use the <span style={{ color: "#c0001a", fontWeight: 700 }}>Download button</span> below
          <style>{`
            @keyframes hwToastIn {
              from { opacity: 0; transform: translateX(-50%) translateY(6px); }
              to   { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}