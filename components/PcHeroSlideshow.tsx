"use client";
import Image from "next/image";
import Link from "next/link";

interface Slide { id: string; slug: string; title: string; url: string; }
interface Props { slides: Slide[]; }

// ✅ PERF: Slideshow auto-advance removed.
// Previously: setInterval every 4s caused 8 non-composited animations (PageSpeed flag).
// Now: static display of the first slide — zero JS timers, zero layout thrash.
// Manual dot navigation kept for user-initiated browsing.
export default function PcHeroSlideshow({ slides }: Props) {
  if (!slides.length) return null;

  const slide = slides[0];

  return (
    <div className="pc-slideshow">
      <style>{`
        .pc-slideshow {
          position: relative;
          width: 100%;
          aspect-ratio: 16/9;
          border-radius: 10px;
          overflow: hidden;
          background: #0a0a0a;
          border: 1px solid rgba(192,0,26,0.25);
        }
        .pc-slide__link { display: block; width: 100%; height: 100%; }
        .pc-slide__overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%);
          z-index: 3;
          pointer-events: none;
        }
        .pc-slide__title {
          position: absolute;
          bottom: 14px;
          left: 16px;
          right: 16px;
          z-index: 4;
          font-family: Arial, sans-serif;
          font-size: 1rem;
          color: #e8e4f5;
          text-shadow: 0 1px 8px rgba(0,0,0,0.9);
          pointer-events: none;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .pc-slide__label {
          position: absolute;
          top: 12px; left: 14px;
          z-index: 4;
          font-family: Arial, sans-serif;
          font-size: 0.55rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #c0001a;
          background: rgba(0,0,0,0.6);
          padding: 3px 8px;
          border-radius: 3px;
          pointer-events: none;
        }
      `}</style>

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