"use client";
import Image from "next/image";
import Link from "next/link";

interface Slide { id: string; slug: string; title: string; url: string; }
interface Props { slides: Slide[]; }

// ✅ PERF: Slideshow auto-advance removed.
// Previously: setInterval every 4s caused 8 non-composited animation (PageSpeed flag).
// Now: static display of the first slide — zero JS timers, zero layout thrash.
// Manual dot navigation kept for user-initiated browsing.
export default function PcHeroSlideshow({ slides }: Props) {
  if (!slides.length) return null;

  const slide = slides[0];

  return (
    <div className="pc-slideshow">

      <Link href={`/pc/${slide.slug}`} className="pc-slide__link">
        <Image
          src={slide.url}
          alt={slide.title}
          fill
          className="object-cover"
          priority
          unoptimized
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </Link>
      <div className="pc-slide__overlay" />
      <span className="pc-slide__label">PC · 16:9</span>
      <span className="pc-slide__title">{slide.title}</span>
    </div>
  );
}