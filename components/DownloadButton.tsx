"use client";
import { useState } from "react";

interface Props {
  href: string;
  viewCount: number;
}

export default function DownloadButton({ href, viewCount }: Props) {
  const [downloaded, setDownloaded] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
      {/* View count + success indicator — fixed height so nothing shifts */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "20px" }}>
        <span style={{
          fontFamily: "var(--font-space, monospace)",
          fontSize: "0.6rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "#4a445a",
        }}>
          👁 {viewCount.toLocaleString()} views
        </span>
        <span style={{
          fontFamily: "var(--font-space, monospace)",
          fontSize: "0.6rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "#2ecc71",
          opacity: downloaded ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}>
          ✓ Saved
        </span>
      </div>

      {/* Fixed-size button — color changes but text and size stay identical */}
      <a
        href={href}
        onClick={() => setDownloaded(true)}
        style={{
          display: "block",
          width: "100%",
          textAlign: "center",
          height: "56px",
          lineHeight: "56px",
          padding: "0 32px",
          boxSizing: "border-box",
          backgroundColor: downloaded ? "#1a6b3a" : "#8b0000",
          borderColor: downloaded ? "#1a6b3a" : "#8b0000",
          border: "1px solid",
          color: "#fff",
          fontFamily: "var(--font-space, monospace)",
          fontSize: "0.7rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          textDecoration: "none",
          transition: "background-color 0.3s ease, border-color 0.3s ease",
        }}
      >
        {downloaded ? "✓ Downloaded (Free)" : "↓ Download 4K (Free)"}
      </a>
      <p className="font-mono text-[0.5rem] tracking-[0.1em] text-[#4a445a]">
        JPEG · 4K resolution · No account required
      </p>
    </div>
  );
}