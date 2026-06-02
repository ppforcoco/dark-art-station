"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface SliderItem {
  id: string;
  slug: string;
  title: string;
  src: string;
  devicePath: string;
  isWide: boolean;
  isNew: boolean;
}

interface TonightSliderProps {
  items: SliderItem[];
}

export default function TonightSlider({ items }: TonightSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft]   = useState(false);
  const [canRight, setCanRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", checkScroll); ro.disconnect(); };
  }, [checkScroll]);

  const scroll = (dir: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    const cardWidth = el.querySelector<HTMLElement>(".ts-card")?.offsetWidth ?? 130;
    const visibleCards = Math.floor(el.clientWidth / (cardWidth + 8));
    el.scrollBy({ left: dir === "right" ? cardWidth * visibleCards : -(cardWidth * visibleCards), behavior: "smooth" });
  };

  return (
    <>
      <style>{`
        .ts-wrap {
          position: relative;
        }

        /* ── track ── */
        .ts-track {
          display: flex;
          gap: clamp(6px, 1.2vw, 10px);
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          -ms-overflow-style: none;
          margin: 0 calc(-1 * clamp(16px, 5vw, 48px));
          padding: 0 clamp(16px, 5vw, 48px) 12px;
        }
        .ts-track::-webkit-scrollbar { display: none }

        @media (min-width: 768px) {
          .ts-track {
            margin: 0;
            padding: 0 0 4px;
          }
        }

        /* ── card ── */
        .ts-card {
          position: relative;
          flex: 0 0 clamp(110px, 42vw, 150px);
          scroll-snap-align: start;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,.07);
          background: #0a0818;
          overflow: hidden;
          display: block;
        }
        @media (min-width: 768px) {
          .ts-card {
            flex: 0 0 clamp(110px, 9vw, 145px);
          }
        }

        /* ── thumb ── */
        .ts-thumb {
          position: relative;
          aspect-ratio: 9/16;
          overflow: hidden;
          background: #0d0b18;
        }
        .ts-thumb--wide { aspect-ratio: 16/9 }

        /* ── hover overlay ── */
        .ts-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 10px 8px 9px;
          background: linear-gradient(
            to top,
            rgba(4, 2, 16, 0.92) 0%,
            rgba(4, 2, 16, 0.55) 48%,
            transparent 100%
          );
          opacity: 0;
          transform: translateY(4px);
          transition: opacity 0.22s ease, transform 0.22s ease;
          pointer-events: none;
        }
        .ts-card:hover .ts-overlay,
        .ts-card:focus-within .ts-overlay {
          opacity: 1;
          transform: translateY(0);
        }
        /* touch devices — tap once to reveal, tap again to navigate */
        @media (hover: none) {
          .ts-card:focus .ts-overlay { opacity: 1; transform: translateY(0); }
        }

        .ts-badge {
          font-family: Arial, sans-serif;
          font-size: clamp(.42rem, .52vw, .5rem);
          letter-spacing: .18em;
          text-transform: uppercase;
          color: #4caf50;
          margin-bottom: 3px;
        }
        .ts-badge--premium { color: #c9a84c }

        .ts-title {
          font-family: Arial, sans-serif;
          font-size: clamp(.78rem, .9vw, .88rem);
          color: #e8e4f8;
          font-weight: 600;
          line-height: 1.25;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* ── arrow buttons ── */
        .ts-arrow {
          display: none;
        }
        @media (min-width: 768px) {
          .ts-arrow {
            display: flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            z-index: 10;
            width: 36px;
            height: 52px;
            background: rgba(6, 4, 20, 0.82);
            border: 1px solid rgba(255,255,255,.13);
            color: #d4d0ee;
            cursor: pointer;
            transition: background 0.15s, border-color 0.15s, opacity 0.2s;
            backdrop-filter: blur(6px);
            padding: 0;
          }
          .ts-arrow:hover:not(:disabled) {
            background: rgba(20, 14, 48, 0.95);
            border-color: rgba(255,255,255,.28);
            color: #fff;
          }
          .ts-arrow:disabled {
            opacity: 0;
            pointer-events: none;
          }
          .ts-arrow--left  { left: -18px }
          .ts-arrow--right { right: -18px }
          .ts-arrow svg { width: 16px; height: 16px; flex-shrink: 0 }
        }
      `}</style>

      <div className="ts-wrap">
        {/* Left arrow */}
        <button
          className="ts-arrow ts-arrow--left"
          onClick={() => scroll("left")}
          disabled={!canLeft}
          aria-label="Scroll left"
        >
          <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Scrollable track */}
        <div className="ts-track" ref={trackRef}>
          {items.map((item, i) => (
            <Link
              key={item.id}
              href={`/${item.devicePath}/${item.slug}`}
              prefetch={false}
              className="ts-card"
            >
              <div className={`ts-thumb${item.isWide ? " ts-thumb--wide" : ""}`}>
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  loading={i < 4 ? "eager" : "lazy"}
                  priority={i < 2}
                  unoptimized
                  sizes="(max-width:767px) 44vw, 145px"
                  style={{ objectFit: "cover", objectPosition: "center top" }}
                />
                {/* Hover overlay with title */}
                <div className="ts-overlay">
                  <span className={`ts-badge${!item.isNew ? " ts-badge--premium" : ""}`}>
                    {item.isNew ? "New" : "Premium"}
                  </span>
                  <span className="ts-title">{item.title}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Right arrow */}
        <button
          className="ts-arrow ts-arrow--right"
          onClick={() => scroll("right")}
          disabled={!canRight}
          aria-label="Scroll right"
        >
          <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </>
  );
}