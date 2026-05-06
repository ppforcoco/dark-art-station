"use client";
// components/IphoneImageGrid.tsx
//
// A thin "use client" wrapper that renders DeviceImageCard in a grid.
// All props must be plain serialisable values — no functions, no class instances.
//
// PREMIUM LOCK DISPLAY:
//   isLocked = true  → LOCKED    → DeviceImageCard shows "BACK IN THE VAULT" overlay
//   isLocked = false → UNLOCKED  → DeviceImageCard shows normal image + "GONE IN" badge
//
// isLockedGlobal comes from the server (same Monday-clock formula as PremiumCountdown)
// so the lock state is always consistent across page and countdown.

import React from "react";
import DeviceImageCard from "@/components/DeviceImageCard";
import { isPremiumLocked } from "@/lib/premium-lock";

export interface ImageItem {
  id: string;
  slug: string;
  title: string;
  src: string;        // pre-resolved public URL
  viewCount: number;
  tags: string[];
  isAdult: boolean;
  updatedAt?: string | null;
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
  aspectRatio?: "9/16" | "16/9";
  sizes?: string;
  /**
   * Insert an empty spacer div after this 0-based index.
   * Used for the ad / interstitial slot in the main grid.
   */
  insertAfter?: number;
  /**
   * Server-computed lock state. When provided, ALL premium images use this
   * value instead of the per-image isPremiumLocked() calculation.
   * Always pass this from the server page so lock state is consistent.
   */
  isLockedGlobal?: boolean;
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
  isLockedGlobal,
}: IphoneImageGridProps) {
  return (
    <div className={gridClassName} style={gridStyle}>
      {images.map((img, idx) => {
        const isPremium = img.tags.includes("badge-premium");

        // isLockedGlobal (server-computed) overrides per-image fallback
        const isLocked = isPremium && (isLockedGlobal ?? isPremiumLocked(img.updatedAt));

        return (
          <React.Fragment key={img.id}>
            <DeviceImageCard
              href={`${hrefPrefix}/${img.slug}`}
              src={img.src}
              alt={`${img.title} — ${altSuffix}`}
              title={img.title}
              tags={img.tags}
              isAdult={img.isAdult}
              isLocked={isLocked}
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
        );
      })}
    </div>
  );
}