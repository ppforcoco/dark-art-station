// components/DeviceImageCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import dynamic from "next/dynamic";

const LockScreenPreviewModal = dynamic(
  () => import("./LockScreenPreviewModal"),
  { ssr: false }
);

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
  /** Optional offset (0-9) so adjacent cards don't start on the same color */
  glowOffset?: number;
}

function glowDelay(seed: string, offset = 0): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const seconds = ((hash % 80) / 10 + offset * 0.7) % 8;
  return `-${seconds.toFixed(1)}s`;
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
  glowOffset = 0,
}: DeviceImageCardProps) {
  const [revealed,    setRevealed]    = useState(false);
  const [flipping,    setFlipping]    = useState(false);
  const [hovered,     setHovered]     = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const delay = glowDelay(src, glowOffset);

  const glowStyle: React.CSSProperties = {
    animationName: "cardGlowRotate",
    animationDuration: hovered ? "4s" : "8s",
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
    animationDelay: delay,
    transition: "animation-duration 0.3s ease",
  };

  function handleReveal(e: React.MouseEvent) {
    e.preventDefault();
    setFlipping(true);
    setTimeout(() => {
      setRevealed(true);
      setFlipping(false);
    }, 320);
  }

  function handlePreview(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setPreviewOpen(true);
  }

  // ── Adult unrevealed ──────────────────────────────────────────────────────
  if (isAdult && !revealed) {
    return (
      <>
        <style>{`
          @keyframes adultPulse {
            0%, 100% { opacity: 0.7; transform: scale(1);    }
            50%       { opacity: 1;   transform: scale(1.08); }
          }
        `}</style>
        <div
          className="group relative overflow-hidden bg-[#0a0a0a]"
          style={{
            aspectRatio: aspectRatio.replace("/", " / "),
            cursor: "pointer",
            ...glowStyle,
          }}
          onClick={handleReveal}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          role="button"
          aria-label="Tap to reveal mature content"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ")
              handleReveal(e as unknown as React.MouseEvent);
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
              border: "2.5px solid currentColor",
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--blood, #a01818)",
              animation: "adultPulse 2s ease-in-out infinite",
            }}>
              <span style={{
                fontFamily: "var(--font-space), monospace",
                fontWeight: 900, fontSize: "1rem",
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
        </div>
      </>
    );
  }

  // ── Normal card ───────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        .dic-preview-btn {
          position: absolute;
          top: 8px; left: 8px;
          z-index: 10;
          padding: 5px 10px;
          background: rgba(0,0,0,0.72);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 4px;
          color: #fff;
          font-family: var(--font-space), monospace;
          font-size: 0.48rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          opacity: 0;
          transform: translateY(-4px);
          transition: opacity 0.22s ease, transform 0.22s ease, background 0.2s;
          backdrop-filter: blur(4px);
        }
        .dic-preview-btn:hover {
          background: rgba(160,24,24,0.75);
          border-color: rgba(255,255,255,0.3);
        }
        .dic-wrap:hover .dic-preview-btn {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      {previewOpen && (
        <LockScreenPreviewModal
          src={src}
          title={title}
          onClose={() => setPreviewOpen(false)}
        />
      )}

      <Link
        href={href}
        className="dic-wrap group relative overflow-hidden bg-[#0a0a0a]"
        style={{
          aspectRatio: aspectRatio.replace("/", " / "),
          display: "block",
          ...glowStyle,
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

        {/* Preview button — top-left on hover */}
        <button
          className="dic-preview-btn"
          onClick={handlePreview}
          aria-label="Preview on lock screen"
          tabIndex={-1}
        >
          📱 Preview
        </button>

        {/* Title overlay — bottom on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(5,5,5,0.92)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
          <p className="font-body italic text-[0.85rem] text-white leading-tight">{title}</p>
        </div>
      </Link>
    </>
  );
}