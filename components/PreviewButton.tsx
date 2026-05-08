// components/PreviewButton.tsx
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const LockScreenPreviewModal = dynamic(
  () => import("./LockScreenPreviewModal"),
  { ssr: false }
);

interface Props {
  src:   string;
  title: string;
}

export default function PreviewButton({ src, title }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <LockScreenPreviewModal
          src={src}
          title={title}
          onClose={() => setOpen(false)}
        />
      )}
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          padding: "13px 20px",
          border: "1px solid rgba(139,100,180,0.45)",
          background: "linear-gradient(135deg, rgba(80,40,120,0.25) 0%, rgba(40,20,70,0.35) 100%)",
          color: "#c4a8f0",
          fontFamily: "var(--font-space), monospace",
          fontSize: "0.62rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          cursor: "pointer",
          transition: "all 0.25s ease",
          borderRadius: "4px",
          whiteSpace: "nowrap",
          width: "100%",
          boxShadow: "0 0 18px rgba(120,60,200,0.12), inset 0 1px 0 rgba(255,255,255,0.06)",
          position: "relative",
          overflow: "hidden",
        }}
        onMouseEnter={e => {
          const btn = e.currentTarget as HTMLButtonElement;
          btn.style.borderColor = "rgba(180,120,255,0.7)";
          btn.style.color = "#e8d5ff";
          btn.style.boxShadow = "0 0 28px rgba(140,70,255,0.25), inset 0 1px 0 rgba(255,255,255,0.08)";
          btn.style.background = "linear-gradient(135deg, rgba(100,50,160,0.35) 0%, rgba(60,25,100,0.45) 100%)";
        }}
        onMouseLeave={e => {
          const btn = e.currentTarget as HTMLButtonElement;
          btn.style.borderColor = "rgba(139,100,180,0.45)";
          btn.style.color = "#c4a8f0";
          btn.style.boxShadow = "0 0 18px rgba(120,60,200,0.12), inset 0 1px 0 rgba(255,255,255,0.06)";
          btn.style.background = "linear-gradient(135deg, rgba(80,40,120,0.25) 0%, rgba(40,20,70,0.35) 100%)";
        }}
        aria-label="Preview on lock screen"
      >
        <span style={{ fontSize: "1.1rem", filter: "drop-shadow(0 0 6px rgba(180,120,255,0.5))" }}>📱</span>
        <span>Preview on Lock Screen</span>
        <span style={{
          marginLeft: "auto",
          fontSize: "0.55rem",
          color: "rgba(180,140,255,0.6)",
          border: "1px solid rgba(140,80,220,0.3)",
          padding: "2px 6px",
          borderRadius: "2px",
          letterSpacing: "0.1em",
        }}>LIVE</span>
      </button>
    </>
  );
}