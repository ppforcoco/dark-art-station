// components/ShopProductCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";

interface ShopProductCardProps {
  slug: string;
  name: string;
  category: string;
  price: number;
  compareAtPrice?: number | null;
  badge?: string | null;
  thumbnail?: string | null;
  priority?: boolean;
}

export default function ShopProductCard({
  slug,
  name,
  category,
  price,
  compareAtPrice,
  badge,
  thumbnail,
  priority = false,
}: ShopProductCardProps) {
  const badgeStyles: Record<string, string> = {
    New:  "bg-[#ff2e9e] text-[#f6ecff]",
    Hot:  "bg-[#ff4d6d] text-[#140a28]",
    Sale: "bg-[#ffd23f] text-[#140a28]",
  };

  return (
    <div className="shop-card-wrap group">
      <Link
        prefetch={false}
        href={`/shop/${slug}`}
        className={`shop-card-image relative overflow-hidden block${thumbnail ? "" : " p-bg-1"}`}
        aria-label={`View ${name}`}
      >
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={`${name} — ${category}`}
            fill
            loading={priority ? "eager" : "lazy"}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[3rem] select-none">🖤</div>
        )}

        {badge && (
          <span className={`absolute top-3 left-3 font-mono text-[0.55rem] tracking-[0.15em] uppercase px-[10px] py-[5px] z-10 ${badgeStyles[badge] ?? ""}`}>
            {badge}
          </span>
        )}

        <span className="absolute bottom-[-40px] group-hover:bottom-0 left-0 right-0 bg-[rgba(16,8,34,0.9)] backdrop-blur-[10px] text-center py-3 font-mono text-[0.65rem] tracking-[0.15em] uppercase text-[#ffd23f] transition-all duration-300 z-10 pointer-events-none">
          Quick View
        </span>
      </Link>

      <div className="shop-card-info">
        <div className="shop-card-meta">
          <span className="shop-card-category">{category}</span>
          <div className="shop-card-title">{name}</div>
        </div>

        <div className="shop-card-bottom">
          <span className="shop-card-price">
            ${price.toFixed(2)}
            {compareAtPrice && compareAtPrice > price && (
              <span style={{ marginLeft: "6px", textDecoration: "line-through", opacity: 0.5, fontSize: "0.85em" }}>
                ${compareAtPrice.toFixed(2)}
              </span>
            )}
          </span>
          <Link prefetch={false} href={`/shop/${slug}`} className="shop-card-cta" aria-label={`View ${name}`}>
            View →
          </Link>
        </div>
      </div>
    </div>
  );
}