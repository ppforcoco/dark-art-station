"use client";
// components/MatchingAvatarCard.tsx
//
// Renders a "matching pair" avatar (e.g. soulmate / bestfriend PFPs) as a
// single card with a two-frame slideshow. Each frame downloads as its own
// clean square image — nobody downloads a combined image and crops it
// themselves, which is the whole point of storing the pair as two real files.

import { useState } from "react";
import AvatarShareBtn from "@/components/AvatarShareBtn";

interface PairFrame {
  id: string;
  src: string;
  label: string;
}

interface MatchingAvatarCardProps {
  title: string;
  description: string | null;
  frames: PairFrame[]; // expects exactly 2, but degrades gracefully with 1
}

export default function MatchingAvatarCard({ title, description, frames }: MatchingAvatarCardProps) {
  const [active, setActive] = useState(0);
  const current = frames[active] ?? frames[0];

  return (
    <article className="hw-avatar-card hw-avatar-card--pair">
      {/* 1:1 square image, swaps between the two halves */}
      <div className="hw-avatar-card__img-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.src}
          alt={`${title} — ${current.label}`}
          className="hw-avatar-card__img"
          loading="lazy"
          decoding="async"
          draggable={false}
        />

        {/* Frame switcher — sits right on top of the image, full-width, so
            it's the first thing people see (a bottom-floating pill was easy
            to miss; this can't be missed). Doubles as the "matching pair"
            signal — no separate badge needed. */}
        {frames.length > 1 ? (
          <div className="hw-pair-tabs" role="tablist" aria-label={`${title} — choose a side`}>
            <span className="hw-pair-icon" aria-hidden="true">💞</span>
            {frames.map((f, i) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={i === active}
                className={`hw-pair-tab${i === active ? " hw-pair-tab--active" : ""}`}
                onClick={() => setActive(i)}
              >
                {f.label}
              </button>
            ))}
          </div>
        ) : (
          <span className="hw-pair-badge">Matching Pair</span>
        )}
      </div>

      {/* Card body */}
      <div className="hw-avatar-card__body">
        <h2 className="hw-avatar-card__title">{title}</h2>

        <div className="hw-avatar-card__actions">
          <a
            href={`/api/download/image/${current.id}`}
            className="hw-avatar-card__btn hw-avatar-card__btn--dl"
            aria-label={`Download ${title} — ${current.label}`}
          >
            ↓ Download {current.label}
          </a>
          <AvatarShareBtn url={current.src} title={`${title} — ${current.label}`} />
        </div>

        {description && (
          <div
            className="hw-avatar-card__desc"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}
      </div>

      <style>{`
        .hw-pair-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          font-family: var(--font-space, monospace);
          font-size: 0.55rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #fff;
          background: rgba(236, 72, 153, 0.85);
          padding: 3px 8px;
          border-radius: 2px;
        }
        .hw-pair-tabs {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 6px;
          background: linear-gradient(180deg, rgba(10,8,18,0.92) 0%, rgba(10,8,18,0.78) 70%, rgba(10,8,18,0) 100%);
        }
        .hw-pair-icon {
          font-size: 0.7rem;
          padding: 0 2px 0 4px;
          flex-shrink: 0;
          filter: drop-shadow(0 0 3px rgba(236,72,153,0.6));
        }
        .hw-pair-tab {
          flex: 1;
          font-family: var(--font-space, monospace);
          font-size: 0.62rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: rgba(232, 228, 220, 0.75);
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 6px 8px;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .hw-pair-tab--active {
          background: rgba(236, 72, 153, 0.9);
          border-color: rgba(236, 72, 153, 0.9);
          color: #fff;
          font-weight: 700;
        }
        .hw-pair-tab:hover:not(.hw-pair-tab--active) {
          color: #fff;
          background: rgba(255, 255, 255, 0.14);
        }
      `}</style>
    </article>
  );
}