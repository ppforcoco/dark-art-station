// components/ProductCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import FavoriteButton from "@/components/FavoriteButton";

// Collections that require an 18+ warning label on the grid card thumbnail
// Updated to include new PC and Android slugs
const ADULT_COLLECTION_SLUGS = [
  "skull-warning-collection",
  "bone-hands-collection",
  "dark-humor-wallpaper-collection",
  "skull-street-collection",
  "bone-street-collection",
  // PC Additions
  "rebel-skeleton-smoking",
  "gangster-skull",
  "gangster-skeleton-smoking",
  // Android Additions
  "sweet-screams-hoodie",
  "skeletal-king-defiance",
];

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
  tags?: string[]; // Added tags prop to support API check
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
  tags, // Destructure tags
}: ProductCardProps) {
  // Updated logic: Check slugs OR API tags
  const isAdult = ADULT_COLLECTION_SLUGS.includes(slug) || tags?.includes("18plus");
  
  const [isFlipped, setIsFlipped] = useState(false);

  const badgeStyles: Record<string, string> = {
    New:  "bg-[#c0001a] text-[#f0ecff]",
    Hot:  "bg-[#ff3c00] text-[#0a0a0a]",
    Free: "bg-[#c9a84c] text-[#0a0a0a]",
  };

  function formatCount(n: number): string {
    if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
    return String(n);
  }

  return (
    <div className="product-card-wrap group" style={{ perspective: "1000px" }}>
      {/* 
         Flip Card Container 
         - Uses CSS 3D transforms.
         - Flips on click if it is an adult item.
      */}
      <div
        className={`relative w-full transition-transform duration-700 ease-in-out`}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* ── FRONT: 18+ Warning (Visible if Adult & Not Flipped) ── */}
        {isAdult && (
          <div
            className="absolute inset-0 z-20 cursor-pointer"
            style={{ backfaceVisibility: "hidden" }}
            onClick={() => setIsFlipped(true)}
          >
            {/* Background Placeholder */}
            <div className={`w-full h-full ${bgClass} flex items-center justify-center overflow-hidden`}>
               {icon && <span className="text-[3rem] opacity-30 select-none">{icon}</span>}
            </div>

            {/* 18+ Overlay Sticker */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 20,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(5,5,10,0.85)",
                backdropFilter: "blur(4px)",
              }}
            >
              {/* Big 18+ Icon */}
              <div style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: "72px", height: "72px",
                border: "3px solid #c0001a",
                borderRadius: "50%",
                marginBottom: "16px",
              }}>
                <span style={{
                  fontFamily: "var(--font-space), monospace",
                  fontWeight: 900, fontSize: "1.5rem",
                  color: "#c0001a", letterSpacing: "-0.02em",
                }}>18+</span>
              </div>

              <h3 style={{
                fontFamily: "var(--font-space), monospace",
                fontSize: "0.7rem", letterSpacing: "0.15em",
                textTransform: "uppercase", color: "#f0ecff",
                marginBottom: "8px", textAlign: "center",
              }}>
                Mature Content
              </h3>
              <p style={{
                fontFamily: "var(--font-space), monospace",
                fontSize: "0.6rem", letterSpacing: "0.05em",
                color: "#a89bc0", lineHeight: 1.5,
                marginBottom: "20px", textAlign: "center", padding: "0 10%",
              }}>
                Click to reveal image
              </p>
              
              <div style={{
                padding: "8px 16px",
                border: "1px solid #2a2535",
                color: "#6b6480",
                fontSize: "0.6rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}>
                Tap to Flip
              </div>
            </div>
          </div>
        )}

        {/* ── BACK: The Actual Product Card ── */}
        {/* 
           This serves as the 'Back' of the flip card (rotated 180deg).
           For non-adult items, this is the only face visible (z-0).
        */}
        <div
          className={`relative w-full ${isAdult ? "" : ""}`}
          style={{ 
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            // Position absolute ensures it stacks behind the front face when not flipped
            position: isAdult ? "absolute" : "relative",
            top: 0,
            left: 0,
            zIndex: 10,
          }}
        >
            {/* Image Container */}
            <Link
              href={`/shop/${slug}`}
              className={`product-card-image relative overflow-hidden block ${!thumbnail ? bgClass : ""}`}
              aria-label={`View ${name} collection`}
              tabIndex={-1}
            >
              {thumbnail ? (
                <Image
                  src={thumbnail}
                  alt={`${name} — free dark wallpaper 4K`}
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
                  href={`/shop/${slug}`}
                  className="product-card-cta"
                  aria-label={isFree ? `Download ${name} free` : `View ${name} collection`}
                >
                  {isFree ? "↓ Download Free" : "View Collection →"}
                </Link>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}