// components/ProductCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
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
}: ProductCardProps) {
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
    <div className="product-card-wrap group">
      {/* Image */}
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

        {/* Download count badge — top right, only when meaningful */}
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
  );
}