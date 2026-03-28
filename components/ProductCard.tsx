// components/ProductCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import FavoriteButton from "@/components/FavoriteButton";

interface ProductCardProps {
  slug: string;
  name: string;
  category: string;
  price: string | number;
  isFree?: boolean;
  badge?: "New" | "Hot" | "Free";
  icon: string;
  bgClass?: string;
  thumbnail?: string | null;
  priority?: boolean;
  downloadCount?: number;
  /** Comes from the isAdult field in the DB — never hardcoded here */
  isAdult?: boolean;
}

export default function ProductCard({
  slug,
  name,
  category,
  price,
  isFree = false,
  badge,
  icon,
  bgClass = "p-bg-1",
  thumbnail,
  priority = false,
  downloadCount,
  isAdult = false,
}: ProductCardProps) {
  const [showAgeGate, setShowAgeGate] = useState(false);
  const [revealed,   setRevealed]    = useState(false);
  const [flipping,   setFlipping]    = useState(false);

  const badgeStyles: Record<string, string> = {
    New:  "bg-[#c0001a] text-[#f0ecff]",
    Hot:  "bg-[#ff3c00] text-[#0a0a0a]",
    Free: "bg-[#c9a84c] text-[#0a0a0a]",
  };

  function formatCount(n: number): string {
    if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
    return String(n);
  }

  function handleReveal() {
    setFlipping(true);
    setTimeout(() => {
      setRevealed(true);
      setFlipping(false);
    }, 350);
  }

  return (
    <>
      {/* ── Age Gate Modal ── */}
      {showAgeGate && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(5,5,10,0.92)",
            backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "20px",
            animation: "fadeIn 0.2s ease",
          }}
          onClick={() => setShowAgeGate(false)}
        >
          <div
            style={{
              background: "#0c0812",
              border: "1px solid #c0001a",
              maxWidth: "400px", width: "100%",
              padding: "36px 32px",
              textAlign: "center",
              animation: "slideUp 0.25s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Big 16+ icon */}
            <div style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: "64px", height: "64px",
              border: "3px solid #c0001a",
              borderRadius: "50%",
              marginBottom: "20px",
            }}>
              <span style={{
                fontFamily: "var(--font-space), monospace",
                fontWeight: 900, fontSize: "1.3rem",
                color: "#c0001a", letterSpacing: "-0.02em",
              }}>16+</span>
            </div>

            <h2 style={{
              fontFamily: "var(--font-space), monospace",
              fontSize: "0.75rem", letterSpacing: "0.2em",
              textTransform: "uppercase", color: "#f0ecff",
              marginBottom: "12px",
            }}>
              Mature Content Warning
            </h2>
            <p style={{
              fontFamily: "var(--font-space), monospace",
              fontSize: "0.65rem", letterSpacing: "0.06em",
              color: "#a89bc0", lineHeight: 1.7,
              marginBottom: "28px",
            }}>
              This collection contains mature dark art imagery.
              It is intended for audiences aged 18 and above only.
            </p>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setShowAgeGate(false)}
                style={{
                  flex: 1, padding: "12px",
                  background: "transparent",
                  border: "1px solid #2a2535",
                  color: "#6b6480",
                  fontFamily: "var(--font-space), monospace",
                  fontSize: "0.6rem", letterSpacing: "0.15em",
                  textTransform: "uppercase", cursor: "pointer",
                }}
              >
                ← Go Back
              </button>
              <a
                href={`/shop/${slug}`}
                style={{
                  flex: 1, padding: "12px",
                  background: "#c0001a",
                  border: "1px solid #c0001a",
                  color: "#fff",
                  fontFamily: "var(--font-space), monospace",
                  fontSize: "0.6rem", letterSpacing: "0.15em",
                  textTransform: "uppercase", cursor: "pointer",
                  textDecoration: "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                I am 16+ — Continue →
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="product-card-wrap group">
        {/* ── Image area ── */}
        {isAdult && !revealed ? (
          /* ── Adult card: flip-to-reveal (beautiful animation) ── */
          <div
            className={`product-card-image relative overflow-hidden block ${!thumbnail ? bgClass : ""}`}
            style={{
              cursor: "pointer",
              perspective: "800px",
            }}
            onClick={handleReveal}
            role="button"
            aria-label="Tap to reveal mature content"
          >
            {/* Dark blurred background hint */}
            {thumbnail && (
              <Image
                src={thumbnail}
                alt=""
                fill
                loading="lazy"
                unoptimized
                className="object-cover"
                style={{
                  filter: "blur(20px) brightness(0.2)",
                  transform: flipping ? "scale(1.15) rotateY(90deg)" : "scale(1.1)",
                  transition: "transform 0.35s ease, filter 0.35s ease",
                }}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
                aria-hidden="true"
              />
            )}

            {/* 16+ overlay */}
            <div style={{
              position: "absolute", inset: 0, zIndex: 5,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: "14px",
              opacity: flipping ? 0 : 1,
              transition: "opacity 0.2s ease",
            }}>
              {/* Pulsing circle badge */}
              <div style={{
                width: "56px", height: "56px",
                border: "2.5px solid #c0001a",
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 18px rgba(192,0,26,0.35)",
                animation: "adultPulse 2s ease-in-out infinite",
              }}>
                <span style={{
                  fontFamily: "var(--font-space), monospace",
                  fontWeight: 900, fontSize: "1.1rem",
                  color: "#c0001a",
                }}>16+</span>
              </div>
              <span style={{
                fontFamily: "var(--font-space), monospace",
                fontSize: "0.52rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#f0ecff",
                opacity: 0.85,
              }}>
                Tap to Reveal
              </span>
            </div>

            <style>{`
              @keyframes adultPulse {
                0%, 100% { box-shadow: 0 0 12px rgba(192,0,26,0.3); }
                50% { box-shadow: 0 0 28px rgba(192,0,26,0.6), 0 0 8px rgba(192,0,26,0.4); }
              }
              @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
              @keyframes slideUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
            `}</style>
          </div>
        ) : (
          /* ── Normal card (or adult after reveal) ── */
          <Link
            href={isAdult ? "#" : `/shop/${slug}`}
            onClick={isAdult ? (e) => { e.preventDefault(); setShowAgeGate(true); } : undefined}
            className={`product-card-image relative overflow-hidden block ${!thumbnail ? bgClass : ""}`}
            aria-label={`View ${name} collection`}
            tabIndex={-1}
          >
            {thumbnail ? (
              <Image
                src={thumbnail}
                alt={`${name} — free dark wallpaper HD`}
                fill
                loading={priority ? "eager" : "lazy"}
                priority={priority}
                unoptimized
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[3rem] transition-transform duration-500 group-hover:scale-105 select-none">
                {icon}
              </div>
            )}

            {badge && (
              <span className={`absolute top-3 left-3 font-mono text-[0.55rem] tracking-[0.15em] uppercase px-[10px] py-[5px] z-10 ${badgeStyles[badge] ?? ""}`}>
                {badge}
              </span>
            )}

            {/* Download count badge */}
            {downloadCount !== undefined && downloadCount > 0 && (
              <span
                className="absolute top-3 right-3 font-mono text-[0.5rem] tracking-[0.1em] uppercase px-[8px] py-[4px] z-10"
                style={{ background: "rgba(7,7,16,0.75)", color: "#c9a84c", backdropFilter: "blur(4px)" }}
              >
                ↓ {formatCount(downloadCount)}
              </span>
            )}

            {/* Heart / Favorite button */}
            {thumbnail && (
              <FavoriteButton
                size="sm"
                item={{
                  slug:   slug,
                  title:  name,
                  thumb:  thumbnail,
                  href:   `/shop/${slug}`,
                  device: "collection",
                }}
              />
            )}

            <span className="absolute bottom-[-40px] group-hover:bottom-0 left-0 right-0 bg-[rgba(7,7,16,0.9)] backdrop-blur-[10px] text-center py-3 font-mono text-[0.65rem] tracking-[0.15em] uppercase text-[#c9a84c] transition-all duration-300 z-10 pointer-events-none">
              Quick View
            </span>
          </Link>
        )}

        {/* Info — flex column, button always at bottom */}
        <div className="product-card-info">
          <div className="product-card-meta">
            <span className="product-card-category">{category}</span>
            <div className="product-card-title">{name}</div>
          </div>

          <div className="product-card-bottom">
            <span className="product-card-price">
              {isFree
                ? "Free"
                : typeof price === "number"
                ? `$${Number(price).toFixed(2)}`
                : price}
            </span>
            <Link
              href={isAdult ? "#" : `/shop/${slug}`}
              onClick={isAdult ? (e) => { e.preventDefault(); setShowAgeGate(true); } : undefined}
              className="product-card-cta"
              aria-label={isFree ? `Download ${name} free` : `View ${name} collection`}
            >
              {isFree ? "↓ Download Free" : "View Collection →"}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}