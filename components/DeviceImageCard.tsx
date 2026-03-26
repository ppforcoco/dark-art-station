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

  function handleReveal(e: React.MouseEvent) {
    e.preventDefault();
    setFlipping(true);
    setTimeout(() => {
      setRevealed(true);
      setFlipping(false);
    }, 320);
  }

  // Adult unrevealed state — blur + 18+ overlay
  if (isAdult && !revealed) {
    return (
      <div
        className="group relative overflow-hidden bg-[#0a0a0a] border border-[#2a2535] hover:border-[rgba(192,0,26,0.6)] transition-colors duration-300"
        style={{ aspectRatio: aspectRatio.replace("/", " / "), cursor: "pointer" }}
        onClick={handleReveal}
        role="button"
        aria-label="Tap to reveal mature content"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleReveal(e as unknown as React.MouseEvent); }}
      >
        {/* Blurred background hint */}
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

        {/* 18+ overlay */}
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
            border: "2.5px solid #c0001a",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "deviceAdultPulse 2s ease-in-out infinite",
          }}>
            <span style={{
              fontFamily: "var(--font-space), monospace",
              fontWeight: 900, fontSize: "1rem",
              color: "#c0001a",
            }}>18+</span>
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
            0%, 100% { box-shadow: 0 0 10px rgba(192,0,26,0.25); }
            50% { box-shadow: 0 0 22px rgba(192,0,26,0.55), 0 0 6px rgba(192,0,26,0.35); }
          }
        `}</style>
      </div>
    );
  }

  // Normal (or revealed adult) card
  return (
    <Link
      href={href}
      className="group relative overflow-hidden bg-[#0a0a0a] border border-[#2a2535] hover:border-[rgba(192,0,26,0.6)] transition-colors duration-300"
      style={{ aspectRatio: aspectRatio.replace("/", " / "), display: "block" }}
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
        <div>
          <p className="font-body italic text-[0.85rem] text-white leading-tight">{title}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {tags.slice(0, 3).map((t) => (
              <span key={t} className="font-mono text-[0.45rem] tracking-[0.1em] text-[#c9a84c]">#{t}</span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
