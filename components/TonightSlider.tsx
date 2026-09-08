"use client";

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

/**
 * "Tonight's Haunting" — fixed grid (2 cols mobile / 3 cols tablet+),
 * matching the reference layout: full-bleed art, a small download
 * glyph and a "New" pill over the image, title + meta line below.
 */
export default function TonightSlider({ items }: TonightSliderProps) {
  return (
    <div className="ts-grid">
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
              priority={i < 3}
              loading={i < 3 ? "eager" : "lazy"}
              sizes="(max-width:767px) 46vw, (max-width:1100px) 30vw, 280px"
              style={{ objectFit: "cover", objectPosition: "center top" }}
            />
            {item.isNew && <span className="ts-badge">New</span>}
            <span className="ts-dl" aria-hidden="true">
              <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M8 2v8m0 0L4.7 6.7M8 10l3.3-3.3M3 13h10"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
          <div className="ts-meta">
            <span className="ts-title">{item.title}</span>
            <span className="ts-sub">4K &middot; {item.isWide ? "Desktop" : "Mobile"}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}