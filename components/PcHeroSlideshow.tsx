"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

interface Slide { id: string; slug: string; title: string; url: string; }

interface Props { slides: Slide[]; }

export default function PcHeroSlideshow({ slides }: Props) {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev]       = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = (idx: number) => {
    if (transitioning || idx === current) return;
    setPrev(current);
    setCurrent(idx);
    setTransitioning(true);
    setTimeout(() => { setPrev(null); setTransitioning(false); }, 700);
  };

  const next = () => goTo((current + 1) % slides.length);

  useEffect(() => {
    if (slides.length < 2) return;
    timerRef.current = setInterval(next, 4000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [current, slides.length]);

  if (!slides.length) return null;

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
          box-shadow: 0 0 30px rgba(0,0,0,0.6);
        }
        .pc-slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.7s ease;
        }
        .pc-slide--active  { opacity: 1; z-index: 2; }
        .pc-slide--leaving { opacity: 0; z-index: 1; }
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
          right: 40px;
          z-index: 4;
          font-family: var(--font-cormorant), serif;
          font-size: 1rem;
          color: #e8e4f5;
          text-shadow: 0 1px 8px rgba(0,0,0,0.9);
          pointer-events: none;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .pc-slide__dots {
          position: absolute;
          bottom: 10px;
          right: 12px;
          z-index: 5;
          display: flex;
          gap: 5px;
        }
        .pc-slide__dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.3);
          border: none;
          cursor: pointer;
          padding: 0;
          transition: background 0.2s, transform 0.2s;
        }
        .pc-slide__dot--active {
          background: #c0001a;
          transform: scale(1.3);
        }
        .pc-slide__label {
          position: absolute;
          top: 12px; left: 14px;
          z-index: 4;
          font-family: var(--font-space), monospace;
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

      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`pc-slide ${i === current ? "pc-slide--active" : i === prev ? "pc-slide--leaving" : ""}`}
        >
          <Link href={`/pc/${slide.slug}`} className="pc-slide__link">
            <Image
              src={slide.url}
              alt={slide.title}
              fill
              className="object-cover"
              priority={i === 0}
              unoptimized
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </Link>
          <div className="pc-slide__overlay" />
          <span className="pc-slide__label">PC · 16:9</span>
          <span className="pc-slide__title">{slide.title}</span>
        </div>
      ))}

      {slides.length > 1 && (
        <div className="pc-slide__dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`pc-slide__dot${i === current ? " pc-slide__dot--active" : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}