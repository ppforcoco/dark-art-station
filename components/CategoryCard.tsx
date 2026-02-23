import Link from "next/link";

interface CategoryCardProps {
  name: string;
  count: string;
  icon: string;
  tag?: string;
  featured?: boolean;
  bgClass?: string;
  href?: string;
}

export default function CategoryCard({
  name,
  count,
  icon,
  tag = "Collection",
  featured = false,
  bgClass = "cat-bg-goddess",
  href = "/shop",
}: CategoryCardProps) {
  return (
    <Link
      href={href}
      className={`relative overflow-hidden group flex flex-col justify-end p-8 bg-[#2a2535] border border-white/5 transition-all duration-300 ${
        featured ? "md:row-span-2" : "aspect-[4/5]"
      }`}
      style={{ aspectRatio: featured ? "unset" : "4/5" }}
    >
      {/* Radial BG */}
      <div className={`absolute inset-0 transition-transform duration-700 group-hover:scale-[1.08] ${bgClass}`} />

      {/* Icon */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[4rem] opacity-[0.12] group-hover:opacity-25 transition-opacity duration-300 pointer-events-none select-none">
        {icon}
      </div>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(7,7,16,0.9)] via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10">
        <span className="inline-block font-mono text-[0.6rem] tracking-[0.2em] uppercase text-[#c0001a] border border-[rgba(192,0,26,0.4)] px-[10px] py-[4px] mb-3">
          {tag}
        </span>
        <div className="font-display text-[1.3rem] text-[#f0ecff] mb-2">{name}</div>
        <div className="font-mono text-[0.65rem] tracking-[0.1em] text-[#8a8099]">{count} wallpapers</div>
      </div>
    </Link>
  );
}