"use client";
// components/MatchingWallpaperCard.tsx
// Cloned from MatchingAvatarCard.tsx for the /matching-wallpapers page. Same
// slideshow-pair pattern (title, tab pills, download, share) but the image
// frame uses a wallpaper aspect ratio instead of a 1:1 avatar crop.

import { useState, useEffect } from "react";
import AvatarShareBtn from "@/components/AvatarShareBtn";

interface PairFrame {
  id: string;
  src: string;
  label: string;
}

interface MatchingWallpaperCardProps {
  title: string;
  description: string | null;
  frames: PairFrame[];
}

export default function MatchingWallpaperCard({
  title,
  description,
  frames,
}: MatchingWallpaperCardProps) {
  const [active, setActive] = useState(0);
  const current = frames[active] ?? frames[0];

  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (frames.length < 2 || paused) return;
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % frames.length);
    }, 2500);
    return () => clearInterval(id);
  }, [frames.length, paused]);

  function handleTabClick(i: number) {
    setActive(i);
    setPaused(true);
  }

  return (
    <article className="hw-wp-pair-card">
      <div
        className="hw-wp-pair-card__img-wrap"
        style={{ aspectRatio: "9 / 16" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.src}
          alt={`${title} — ${current.label}`}
          className="hw-wp-pair-card__img"
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      </div>

      <div className="hw-wp-pair-card__body">
        <h2 className="hw-wp-pair-card__title">{title}</h2>

        {frames.length > 1 && (
          <div className="hw-pair-pills" role="tablist" aria-label={`${title} — choose a side`}>
            {frames.map((f, i) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={i === active}
                className={`hw-pair-pill${i === active ? " hw-pair-pill--active" : ""}`}
                onClick={() => handleTabClick(i)}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        <div className="hw-wp-pair-card__actions">
          <a
            href={`/api/download/image/${current.id}`}
            className="hw-wp-pair-card__btn hw-wp-pair-card__btn--dl"
            aria-label={`Download ${title} — ${current.label}`}
          >
            ↓ Download
          </a>
          <AvatarShareBtn url={current.src} title={`${title} — ${current.label}`} />
        </div>

        {description && (
          <div
            className="hw-wp-pair-card__desc"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}
      </div>

      <style>{`
        .hw-wp-pair-card {
          background: #13111e;
          border: 1px solid #2a2535;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .hw-wp-pair-card:hover {
          border-color: rgba(192,0,26,0.45);
          box-shadow: 0 0 16px rgba(192,0,26,0.1);
        }
        .hw-wp-pair-card__img-wrap {
          position: relative;
          width: 100%;
          background: #0a0812;
          overflow: hidden;
        }
        .hw-wp-pair-card__img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
          transition: transform 0.35s ease;
        }
        .hw-wp-pair-card:hover .hw-wp-pair-card__img { transform: scale(1.03); }
        .hw-wp-pair-card__body { padding: 10px 10px 12px; }
        .hw-wp-pair-card__title {
          font-family: var(--font-space, monospace);
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-primary, #e8e4dc);
          margin-bottom: 8px;
          line-height: 1.3;
        }
        .hw-wp-pair-card__actions {
          display: flex;
          gap: 6px;
          margin-bottom: 8px;
        }
        .hw-wp-pair-card__btn {
          flex: 1;
          font-family: var(--font-space, monospace);
          font-size: 0.58rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-decoration: none;
          text-align: center;
          padding: 6px 4px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.04);
          color: rgba(232,228,220,0.75);
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 3px;
        }
        .hw-wp-pair-card__btn--dl {
          border-color: rgba(192,0,26,0.4);
          background: rgba(192,0,26,0.08);
          color: #e8e4dc;
        }
        .hw-wp-pair-card__btn--dl:hover {
          background: rgba(192,0,26,0.22);
          border-color: rgba(192,0,26,0.8);
          color: #fff;
        }
        .hw-wp-pair-card__desc {
          margin-top: 8px;
          overflow: hidden;
          border-radius: 0 0 4px 4px;
        }
        .hw-pair-pills {
          display: flex;
          gap: 8px;
          margin: 8px 0 10px;
        }
        .hw-pair-pill {
          flex: 1;
          font-family: var(--font-space, monospace);
          font-size: 0.62rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(232, 228, 220, 0.6);
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 7px 10px;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .hw-pair-pill--active {
          background: rgba(236, 72, 153, 0.15);
          border-color: rgba(236, 72, 153, 0.7);
          color: rgba(236, 72, 153, 1);
          font-weight: 700;
        }
        .hw-pair-pill:hover:not(.hw-pair-pill--active) {
          color: #fff;
          border-color: rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.08);
        }
      `}</style>
    </article>
  );
}