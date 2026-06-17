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
                  loading={i < 2 ? "eager" : "lazy"}
                  unoptimized
                  sizes="(max-width:767px) 44vw, 145px"
                  style={{ objectFit: "cover", objectPosition: "center top", contentVisibility: "auto" }}
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