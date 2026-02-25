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
  thumbnail?: string | null; // Full URL from R2, e.g. https://assets.hauntedwallpapers.com/thumbnails/dark-goddesses.webp
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
  const badgeStyles = {
    New: "bg-[#c0001a] text-[#f0ecff]",
    Hot: "bg-[#ff3c00] text-[#0a0a0a]",
    Free: "bg-[#c9a84c] text-[#0a0a0a]",
  };

  return (
    <div className="group bg-[#2a2535] relative transition-transform duration-300 hover:-translate-y-2">
      {/* Image Container */}
      <div className={`aspect-[3/4] relative overflow-hidden ${!thumbnail ? bgClass : ""}`}>

        {thumbnail ? (
          // Real R2 thumbnail
          <Image
            src={thumbnail}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          // Emoji fallback while thumbnail isn't uploaded yet
          <div className="w-full h-full flex items-center justify-center text-[3rem] transition-transform duration-500 group-hover:scale-105 select-none">
            {icon}
          </div>
        )}

        {/* Badge */}
        {badge && (
          <span className={`absolute top-3 left-3 font-mono text-[0.55rem] tracking-[0.15em] uppercase px-[10px] py-[5px] z-10 ${badgeStyles[badge]}`}>
            {badge}
          </span>
        )}

        {/* Quick View — links to collection page */}
        <Link
          href={`/shop/${slug}`}
          className="absolute bottom-[-40px] group-hover:bottom-0 left-0 right-0 bg-[rgba(7,7,16,0.9)] backdrop-blur-[10px] text-center py-3 font-mono text-[0.65rem] tracking-[0.15em] uppercase text-[#c9a84c] transition-all duration-300 z-10"
        >
          Quick View
        </Link>
      </div>

      {/* Info */}
      <div className="p-5">
        <span className="font-mono text-[0.6rem] tracking-[0.15em] uppercase text-[#c0001a] mb-2 block">{category}</span>
        <div className="font-body italic text-[1.05rem] text-[#f0ecff] mb-3 leading-[1.3]">{name}</div>
        <div className="flex items-center justify-between">
          <span className={`font-mono text-[0.9rem] ${isFree ? "text-[#ff3c00]" : "text-[#c9a84c]"}`}>
            {isFree ? "Free" : typeof price === "number" ? `$${price.toFixed(2)}` : price}
          </span>
          <Link
            href={`/shop/${slug}`}
            className="w-8 h-8 bg-transparent border border-[#c0001a] text-[#c0001a] text-[1.2rem] flex items-center justify-center hover:bg-[#c0001a] hover:text-[#f0ecff] transition-all"
            aria-label={`View ${name}`}
          >
            +
          </Link>
        </div>
      </div>
    </div>
  );
}