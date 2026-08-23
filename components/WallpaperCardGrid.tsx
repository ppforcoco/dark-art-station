"use client";
// components/WallpaperCardGrid.tsx

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./WallpaperCardGrid.module.css";

export interface WallpaperCardItem {
  id: string;
  slug: string;
  title: string;
  src: string;
  devicePath: string;
  isLocked?: boolean;
  downloadCount?: number;
}

interface WallpaperCardGridProps {
  items: WallpaperCardItem[];
  accentRgb: string;
  badge?: string;
  badgeColor?: string;
}

export default function WallpaperCardGrid({ items, accentRgb, badge, badgeColor }: WallpaperCardGridProps) {
  const accent = badgeColor ?? `rgb(${accentRgb})`;
  const shadowDefault = `0 0 0 1px rgba(${accentRgb},0.25), 0 8px 32px rgba(0,0,0,0.6)`;
  const shadowHover   = `0 0 0 1px rgba(${accentRgb},0.65), 0 20px 56px rgba(0,0,0,0.85), 0 0 32px rgba(${accentRgb},0.22)`;

  return (
    <div className={styles.outer}>
      {items.map((img) => {
        return (
          <Link prefetch={false} key={img.id} href={`/${img.devicePath}/${img.slug}`} className={styles.link}>
            <div
              className={styles.card}
              style={{ boxShadow: shadowDefault }}
            >
              {/* Phone mockup shell */}
              <div className={styles.thumb}>
                <div className={styles.btnL1} />
                <div className={styles.btnL2} />
                <div className={styles.btnR} />
                <div className={styles.notch} />
                <Image
                  src={img.src}
                  alt={img.title}
                  fill
                  unoptimized
                  loading="lazy"
                  sizes="(max-width: 640px) 100px, (max-width: 1024px) 180px, 220px"
                  style={{ objectFit: "cover" }}
                />
                {/* Glass gloss */}
                <div className={styles.gloss} />
                {/* Badge */}
                {badge && (
                  <div
                    className={styles.badge}
                    style={{
                      background: `rgba(${accentRgb},0.15)`,
                      border: `1px solid ${accent}`,
                      color: accent,
                    }}
                  >
                    {badge}
                  </div>
                )}
                {/* Hover title overlay */}
                <div className={styles.hoverOverlay}>
                  <p className={styles.hoverTitle}>{img.title}</p>
                </div>
                {/* Home indicator */}
                <div className={styles.homeBar} />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}