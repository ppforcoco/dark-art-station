// components/ProductCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import FavoriteButton from "@/components/FavoriteButton";

// Dark 9:16 shimmer used as blur placeholder on all thumbnails.
// No DB changes needed — a solid dark rect matches the site bg perfectly.
const DARK_BLUR =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI5IiBoZWlnaHQ9IjE2Ij48cmVjdCB3aWR0aD0iOSIgaGVpZ2h0PSIxNiIgZmlsbD0iIzBjMGIxNCIvPjwvc3ZnPg==";

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
}: ProductCardProps) {
  const badgeStyles: Record<string, string> = {
    New:  "bg-[#c0001a] text-[#f0ecff]",
    Hot:  "bg-[#ff3c00] text-[#0a0a0a]",
    Free: "bg-[#c9a84c] text-[#0a0a0a]",
  };

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
            quality={65}
            placeholder="blur"
            blurDataURL={DARK_BLUR}
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