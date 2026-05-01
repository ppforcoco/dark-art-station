"use client";
// components/IphoneImageGrid.tsx
//
// A thin "use client" wrapper that renders DeviceImageCard in a grid.
// All props must be plain serialisable values — no functions, no class instances.
// This component owns the client boundary so that DeviceImageCard's
// onMouseEnter / onMouseLeave handlers never cross the Server → Client
// serialisation boundary (which causes the Next.js build error).

import React from "react";
import DeviceImageCard from "@/components/DeviceImageCard";

export interface ImageItem {
  id: string;
  slug: string;
  title: string;
  src: string;        // pre-resolved public URL
  viewCount: number;
  tags: string[];
  isAdult: boolean;
}

interface IphoneImageGridProps {
  images: ImageItem[];
  hrefPrefix: string;           // e.g. "/iphone"
  altSuffix: string;            // e.g. "free dark iPhone wallpaper HD"
  /** Tailwind class string for the grid wrapper */
  gridClassName?: string;
  /** Inline style object for the grid wrapper (use when you need dynamic values) */
  gridStyle?: React.CSSProperties;
  /** How many images to mark priority={true}. Defaults to 0 (none). */
  priorityCount?: number;
  /** When true, ALL images get priority={true}. Overrides priorityCount. */
  priority?: boolean;
  aspectRatio?: string;
  sizes?: string;
  /**
   * Insert an empty spacer div after this 0-based index.
   * Used for the ad / interstitial slot in the main grid.
   */
  insertAfter?: number;
}

export default function IphoneImageGrid({
  images,
  hrefPrefix,
  altSuffix,
  gridClassName,
  gridStyle,
  priorityCount = 0,
  priority = false,
  aspectRatio = "9/16",
  sizes,
  insertAfter,
}: IphoneImageGridProps) {
  return (
    <div className={gridClassName} style={gridStyle}>
      {images.map((img, idx) => (
        <React.Fragment key={img.id}>
          <DeviceImageCard
            href={`${hrefPrefix}/${img.slug}`}
            src={img.src}
            alt={`${img.title} — ${altSuffix}`}
            title={img.title}
            tags={img.tags}
            isAdult={img.isAdult}
            priority={priority || idx < priorityCount}
            aspectRatio={aspectRatio}
            sizes={sizes}
          />
          {insertAfter !== undefined && idx === insertAfter && (
            <div
              className={
                gridClassName
                  ? "col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-5 my-2"
                  : undefined
              }
              style={gridClassName ? undefined : { gridColumn: "1 / -1", margin: "8px 0" }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}