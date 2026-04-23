// components/DeviceImageCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface DeviceImageCardProps {
  href: string;
  src: string;
  alt: string;
  title: string;
  tags: string[];
  isAdult?: boolean;
  priority?: boolean;
  aspectRatio?: "9/16" | "16/9";
  sizes?: string;
}

// ── Border palette — every card gets a unique accent ──────────────────────────
const BORDER_PALETTE = [
  { border: "#8b0000", glow: "rgba(139,0,0,0.55)",     hover: "rgba(139,0,0,0.8)"     }, // deep maroon
  { border: "#c0001a", glow: "rgba(192,0,26,0.55)",    hover: "rgba(192,0,26,0.85)"   }, // blood red
  { border: "#6b6b6b", glow: "rgba(107,107,107,0.45)", hover: "rgba(180,180,180,0.7)" }, // silver
  { border: "#1a1a1a", glow: "rgba(255,255,255,0.08)", hover: "rgba(255,255,255,0.18)"}, // near-black
  { border: "#2d5a1b", glow: "rgba(45,90,27,0.55)",    hover: "rgba(60,130,30,0.75)"  }, // dark green
  { border: "#ff3c00", glow: "rgba(255,60,0,0.5)",     hover: "rgba(255,60,0,0.8)"    }, // ember orange
  { border: "#c9a84c", glow: "rgba(201,168,76,0.45)",  hover: "rgba(201,168,76,0.75)" }, // gold
  { border: "#4a0080", glow: "rgba(74,0,128,0.5)",     hover: "rgba(100,0,180,0.75)"  }, // deep violet
  { border: "#003366", glow: "rgba(0,51,102,0.5)",     hover: "rgba(0,80,160,0.7)"    }, // midnight blue
  { border: "#2a0000", glow: "rgba(80,0,0,0.6)",       hover: "rgba(120,0,0,0.8)"     }, // void black-red
  { border: "#8b7355", glow: "rgba(139,115,85,0.45)",  hover: "rgba(180,150,100,0.7)" }, // bronze
  { border: "#1c1c1c", glow: "rgba(200,200,200,0.06)", hover: "rgba(200,200,200,0.15)"}, // obsidian
];

/** Deterministic index from a string — same src always gets same color */
function pickBorderIndex(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash % BORDER_PALETTE.length;
}

export default function DeviceImageCard({
  href,
  src,
  alt,
  title,
  tags,
  isAdult = false,
  priority = false,
  aspectRatio = "9/16",
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw",
}: DeviceImageCardProps) {
  const [revealed, setRevealed] = useState(false);
  const [flipping, setFlipping] = useState(false);
  const [hovered, setHovered] = useState(false);

  const accent = BORDER_PALETTE[pickBorderIndex(src)];

  const borderStyle = {
    border: `1px solid ${hovered ? accent.hover : accent.border}`,
    boxShadow: hovered
      ? `0 0 12px ${accent.glow}, inset 0 0 8px ${accent.glow}`
      : `0 0 4px ${accent.glow}`,
    transition: "border-color 0.3s ease, box-shadow 0.3s ease",
  };

  function handleReveal(e: React.MouseEvent) {
    e.preventDefault();
    setFlipping(true);
    setTimeout(() => {
      setRevealed(true);
      setFlipping(false);
    }, 320);
  }

  // Adult unrevealed state
  if (isAdult && !revealed) {
    return (
      <div
        className="group relative overflow-hidden bg-[#0a0a0a]"
        style={{
          aspectRatio: aspectRatio.replace("/", " / "),
          cursor: "pointer",
          ...borderStyle,
        }}
        onClick={handleReveal}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        role="button"
        aria-label="Tap to reveal mature content"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleReveal(e as unknown as React.MouseEvent);
        }}
      >
        <Image
          src={src}
          alt=""
          fill
          loading="lazy"
          unoptimized
          className="object-cover"
          style={{
            filter: "blur(20px) brightness(0.18)",
            transform: flipping ? "scale(1.2) rotateY(90deg)" : "scale(1.1)",
            transition: "transform 0.32s ease, filter 0.32s ease",
          }}
          sizes={sizes}
          aria-hidden="true"
        />

        <div
          style={{
            position: "absolute", inset: 0, zIndex: 5,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: "12px",
            opacity: flipping ? 0 : 1,
            transition: "opacity 0.18s ease",
          }}
        >
          <div style={{
            width: "50px", height: "50px",
            border: `2.5px solid ${accent.border}`,
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 0 16px ${accent.glow}`,
            animation: "deviceAdultPulse 2s ease-in-out infinite",
          }}>
            <span style={{
              fontFamily: "var(--font-space), monospace",
              fontWeight: 900, fontSize: "1rem",
              color: accent.border,
            }}>16+</span>
          </div>
          <span style={{
            fontFamily: "var(--font-space), monospace",
            fontSize: "0.48rem",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#f0ecff",
            opacity: 0.8,
          }}>
            Tap to Reveal
          </span>
        </div>

        <style>{`
          @keyframes deviceAdultPulse {
            0%, 100% { box-shadow: 0 0 10px ${accent.glow}; }
            50%       { box-shadow: 0 0 22px ${accent.border}, 0 0 6px ${accent.glow}; }
          }
        `}</style>
      </div>
    );
  }

  // Normal (or revealed adult) card
  return (
    <Link
      href={href}
      className="group relative overflow-hidden bg-[#0a0a0a]"
      style={{
        aspectRatio: aspectRatio.replace("/", " / "),
        display: "block",
        ...borderStyle,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Image
        src={src}
        alt={alt}
        fill
        loading={priority ? "eager" : "lazy"}
        priority={priority}
        unoptimized
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes={sizes}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(5,5,5,0.92)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
        <p className="font-body italic text-[0.85rem] text-white leading-tight">{title}</p>
      </div>
    </Link>
  );
}