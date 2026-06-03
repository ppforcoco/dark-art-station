"use client";
// components/WallpaperCardGrid.tsx

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./WallpaperCardGrid.module.css";

// ─── Cycle constants — must match all other files ────────────────────────────
const EPOCH_MS  = Date.UTC(2025, 0, 1, 0, 0, 0);
const CYCLE_MS  = 48 * 60 * 60 * 1000;
const UNLOCK_MS = 24 * 60 * 60 * 1000;

function getClientIsLocked(): boolean {
  const pos = (Date.now() - EPOCH_MS) % CYCLE_MS;
  return pos >= UNLOCK_MS;
}

function getMsUntilUnlock(): number {
  const pos = (Date.now() - EPOCH_MS) % CYCLE_MS;
  if (pos >= UNLOCK_MS) return Math.max(0, CYCLE_MS - pos);
  return 0;
}

function fmtMs(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(h)}h ${p(m)}m ${p(sec)}s`;
}

function VaultCountdown() {
  const [display, setDisplay] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setDisplay(fmtMs(getMsUntilUnlock()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  if (!display) return null;
  return <>{display}</>;
}

// ─── Seeded fake download count ───────────────────────────────────────────────
// Hashes the slug into a stable integer. Range: 12–97 (never round, believable).
// TO REMOVE BEFORE ADSENSE: delete this function + all fakeDownloads usages.
function seededFakeDownloads(slug: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  // sqrt curve weights toward lower numbers — most land 15–50, outliers up to 97
  const t = Math.sqrt((h % 10000) / 10000);
  return Math.floor(12 + t * 85);
}

function fmtDownloads(n: number): string {
  return String(n);
}

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

  // ── FIX: hydration-safe lock state ───────────────────────────────────────
  const [isLockedNow, setIsLockedNow] = useState(false);
  useEffect(() => {
    setIsLockedNow(getClientIsLocked());
    const id = setInterval(() => setIsLockedNow(getClientIsLocked()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={styles.outer}>
      {items.map((img) => {
        // REMOVE BEFORE ADSENSE: seededFakeDownloads line below
        const displayCount = img.downloadCount ?? seededFakeDownloads(img.slug);

        /* LOCKED CARD */
        if (img.isLocked && isLockedNow) {
          return (
            <div
              key={img.id}
              className={styles.lockedCard}
              style={{ boxShadow: `0 0 0 1px rgba(${accentRgb},0.15), 0 8px 32px rgba(0,0,0,0.6)` }}
            >
              <div className={styles.thumb}>
                <div className={styles.btnL1} />
                <div className={styles.btnL2} />
                <div className={styles.btnR} />
                <div className={styles.notch} />
                <Image src={img.src} alt="" aria-hidden="true" fill loading="lazy" sizes="100px"
                  style={{ objectFit: "cover", filter: "blur(12px) brightness(0.18)", transform: "scale(1.12)" }}
                  unoptimized />
                <div className={styles.vaultOverlay}>
                  <span className={styles.vaultLock} style={{ filter: `drop-shadow(0 0 8px rgba(${accentRgb},0.6))` }}>🔒</span>
                  <span className={styles.vaultLabel} style={{ color: accent }}>Back in the Vault</span>
                  <span className={styles.vaultTimer} style={{ color: `rgba(${accentRgb},0.55)` }}>BACK IN <VaultCountdown /></span>
                </div>
                <div className={styles.homeBar} style={{ background: "rgba(255,255,255,0.12)" }} />
              </div>
              <div className={styles.footer} style={{ borderTop: `1px solid rgba(${accentRgb},0.08)` }}>
                <p className={styles.lockedTitle} style={{ color: `rgba(${accentRgb},0.35)` }}>&nbsp;</p>
              </div>
            </div>
          );
        }

        /* UNLOCKED CARD */
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