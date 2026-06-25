"use client";
// components/MatchingAvatarCard.tsx

import { useState, useEffect } from "react";
import AvatarShareBtn from "@/components/AvatarShareBtn";

interface PairFrame {
  id: string;
  src: string;
  label: string;
}

interface MatchingAvatarCardProps {
  title: string;
  description: string | null;
  frames: PairFrame[];
}

export default function MatchingAvatarCard({ title, description, frames }: MatchingAvatarCardProps) {
  const [active, setActive] = useState(0);
  const current = frames[active] ?? frames[0];

  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (frames.length < 2 || paused) return;
    const id = setInterval(() => {
      setActive(prev => (prev + 1) % frames.length);
    }, 2500);
    return () => clearInterval(id);
  }, [frames.length, paused]);

  function handleTabClick(i: number) {
    setActive(i);
    setPaused(true);
  }

  return (
    <article className="hw-avatar-card hw-avatar-card--pair">
      {/* 1:1 square image — no overlay, clean */}
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
      </div>

      {/* Card body */}
      <div className="hw-avatar-card__body">
        <h2 className="hw-avatar-card__title">{title}</h2>

        {/* Pill switcher — below the image, above the download button */}
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