// components/ProductCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";

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
}: ProductCardProps) {
  const badgeStyles: Record<string, string> = {
    New: "bg-[#c0001a] text-[#f0ecff]",
    Hot: "bg-[#ff3c00] text-[#0a0a0a]",
    Free: "bg-[#c9a84c] text-[#0a0a0a]",
  };

  return (
    <div className="group bg-[#2a2535] relative transition-transform duration-300 hover:-translate-y-2">
      {/* Image — full area clickable */}
      <Link
        href={`/shop/${slug}`}
        className={`product-card-image relative overflow-hidden block ${!thumbnail ? bgClass : ""}`}
        aria-label={`View ${name} collection`}
        tabIndex={-1}
      >
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={name}
            fill
            loading="lazy"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[3rem] transition-transform duration-500 group-hover:scale-105 select-none">
            {icon}
          </div>
        )}

        {/* Badge */}
        {badge && (
          <span
            className={`absolute top-3 left-3 font-mono text-[0.55rem] tracking-[0.15em] uppercase px-[10px] py-[5px] z-10 ${badgeStyles[badge] ?? ""}`}
          >
            {badge}
          </span>
        )}

        {/* Quick View hover overlay */}
        <span className="absolute bottom-[-40px] group-hover:bottom-0 left-0 right-0 bg-[rgba(7,7,16,0.9)] backdrop-blur-[10px] text-center py-3 font-mono text-[0.65rem] tracking-[0.15em] uppercase text-[#c9a84c] transition-all duration-300 z-10 pointer-events-none">
          Quick View
        </span>
      </Link>

      {/* Info panel */}
      <div className="p-5 flex flex-col gap-3">
        <div>
          <span className="font-mono text-[0.6rem] tracking-[0.15em] uppercase text-[#c0001a] mb-1 block">
            {category}
          </span>
          <div className="font-body italic text-[1.05rem] text-[#f0ecff] leading-[1.3] line-clamp-2">
            {name}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 mt-auto">
          <span className={`font-mono text-[0.85rem] font-bold ${isFree ? "text-[#c9a84c]" : "text-[#c9a84c]"}`}>
            {isFree
              ? "Free"
              : typeof price === "number"
              ? `$${Number(price).toFixed(2)}`
              : price}
          </span>
        </div>

        {/* CTA — full-width, touch-friendly */}
        <Link
          href={`/shop/${slug}`}
          className="product-card-cta"
          aria-label={isFree ? `Download ${name} free` : `View ${name} collection`}
        >
          {isFree ? "↓ Download Free" : "View Collection →"}
        </Link>
      </div>
    </div>
  );
}