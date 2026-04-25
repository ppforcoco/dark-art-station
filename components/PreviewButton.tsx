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
          gap: "8px",
          padding: "12px 20px",
          border: "1px solid rgba(255,255,255,0.12)",
          background: "transparent",
          color: "#8a8099",
          fontFamily: "var(--font-space), monospace",
          fontSize: "0.6rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          cursor: "pointer",
          transition: "border-color 0.2s, color 0.2s",
          borderRadius: "4px",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#c0001a";
          (e.currentTarget as HTMLButtonElement).style.color = "#f0ecff";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.12)";
          (e.currentTarget as HTMLButtonElement).style.color = "#8a8099";
        }}
        aria-label="Preview on lock screen"
      >
        <span style={{ fontSize: "1rem" }}>📱</span>
        Preview on Lock Screen
      </button>
    </>
  );
}