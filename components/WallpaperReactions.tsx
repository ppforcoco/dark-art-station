// components/WallpaperReactions.tsx
// Emoji reaction buttons with counts for wallpaper pages
// Placed ABOVE the download button, BELOW the preview image
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface Props {
  imageId: string;
}

type ReactionKey = "skull" | "fire" | "heart" | "thumbsdown";

const REACTIONS: { key: ReactionKey; label: string; src: string; baseMin: number; baseMax: number; zeroChance: number }[] = [
  { key: "skull",     label: "Haunted",   src: "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/emojis/skull-with-red-glowing-eyes.webp", baseMin: 12, baseMax: 24, zeroChance: 0.08 },
  { key: "fire",      label: "Fire",      src: "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/emojis/the-fire-icon.webp",              baseMin: 8,  baseMax: 15, zeroChance: 0.12 },
  { key: "heart",     label: "Love",      src: "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/emojis/the-heart-icon.webp",             baseMin: 5,  baseMax: 10, zeroChance: 0.15 },
  { key: "thumbsdown",label: "Meh",       src: "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/emojis/the-thumbs-down-emoji.webp",      baseMin: 0,  baseMax: 4,  zeroChance: 0.30 },
];

// Deterministic seeded random based on imageId so base counts are stable per image
function seededRand(seed: string, salt: number): number {
  let h = salt;
  for (let i = 0; i < seed.length; i++) { h = Math.imul(31, h) + seed.charCodeAt(i) | 0; }
  return (h >>> 0) / 0xffffffff;
}

function getBase(imageId: string, key: ReactionKey, min: number, max: number, zeroChance: number): number {
  const salt = key === "skull" ? 1 : key === "fire" ? 2 : key === "heart" ? 3 : 4;
  const r = seededRand(imageId, salt);
  if (r < zeroChance) return 0;
  return min + Math.floor(r * (max - min + 1));
}

function fmtCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

export default function WallpaperReactions({ imageId }: Props) {
  const storageKey = `hw_reactions_${imageId}`;

  const [counts, setCounts] = useState<Record<ReactionKey, number>>(() => {
    const bases = {} as Record<ReactionKey, number>;
    for (const r of REACTIONS) bases[r.key] = getBase(imageId, r.key, r.baseMin, r.baseMax, r.zeroChance);
    return bases;
  });

  const [voted, setVoted] = useState<ReactionKey | null>(null);
  const [animating, setAnimating] = useState<ReactionKey | null>(null);
  const [glowing, setGlowing] = useState(false);

  // Load saved vote + deltas from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const { votedKey, deltas } = JSON.parse(saved);
        setVoted(votedKey ?? null);
        if (deltas) {
          setCounts(prev => {
            const next = { ...prev };
            for (const k of Object.keys(deltas) as ReactionKey[]) next[k] = (next[k] ?? 0) + deltas[k];
            return next;
          });
        }
      }
    } catch { /* ignore */ }
  }, [storageKey]);

  const handleVote = useCallback((key: ReactionKey) => {
    if (voted === key) return; // already voted this

    setCounts(prev => {
      const next = { ...prev };
      const deltas: Partial<Record<ReactionKey, number>> = {};
      if (voted) { next[voted] = Math.max(0, next[voted] - 1); deltas[voted] = -1; }
      next[key] = (next[key] ?? 0) + 1;
      deltas[key] = (deltas[key] ?? 0) + 1;
      try { localStorage.setItem(storageKey, JSON.stringify({ votedKey: key, deltas })); } catch { /* ignore */ }
      return next;
    });
    setVoted(key);
    setAnimating(key);
    setTimeout(() => setAnimating(null), 700);
  }, [voted, storageKey]);

  return (
    <>
      <div className="hw-reactions">
        {REACTIONS.map(({ key, label, src }) => {
          const isVoted = voted === key;
          const isAnim  = animating === key;
          const isSkull = key === "skull";
          return (
            <button
              key={key}
              className={`hw-reaction-btn${isVoted ? " hw-reaction-btn--voted" : ""}${isAnim ? ` hw-reaction-btn--anim-${key}` : ""}${isSkull ? " hw-reaction-skull" : ""}`}
              onClick={() => handleVote(key)}
              onMouseEnter={() => isSkull && setGlowing(true)}
              onMouseLeave={() => isSkull && setGlowing(false)}
              aria-label={`React with ${label}`}
              aria-pressed={isVoted}
            >
              <span className={`hw-reaction-img-wrap${isSkull && glowing ? " hw-skull-glow" : ""}`}>
                <Image src={src} alt={label} width={32} height={32} unoptimized className="hw-reaction-img" />
              </span>
              <span className="hw-reaction-count">{fmtCount(counts[key])}</span>
            </button>
          );
        })}
      </div>

      <style>{`
        .hw-reactions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin: 18px 0 14px;
        }
        .hw-reaction-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 10px 14px;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, transform 0.15s;
          color: #d0d0e8;
          min-width: 62px;
        }
        .hw-reaction-btn:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(192,0,26,0.4);
          transform: translateY(-2px);
        }
        .hw-reaction-btn--voted {
          background: rgba(192,0,26,0.12);
          border-color: rgba(192,0,26,0.6);
        }
        .hw-reaction-img-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          transition: filter 0.2s;
        }
        .hw-reaction-img {
          width: 32px;
          height: 32px;
          object-fit: contain;
          display: block;
        }
        .hw-skull-glow .hw-reaction-img {
          filter: drop-shadow(0 0 8px rgba(220,0,0,0.9)) drop-shadow(0 0 16px rgba(220,0,0,0.6)) brightness(1.2);
        }
        .hw-reaction-count {
          font-family: var(--font-space, monospace);
          font-size: 0.68rem;
          letter-spacing: 0.06em;
          color: rgba(200,200,220,0.8);
          line-height: 1;
        }
        .hw-reaction-btn--voted .hw-reaction-count { color: #fff; }

        /* Skull glow animation on vote */
        @keyframes skullPulse {
          0%   { filter: drop-shadow(0 0 4px rgba(220,0,0,0.5)); }
          50%  { filter: drop-shadow(0 0 16px rgba(220,0,0,1)) drop-shadow(0 0 30px rgba(220,0,0,0.7)) brightness(1.3); }
          100% { filter: drop-shadow(0 0 4px rgba(220,0,0,0.5)); }
        }
        .hw-reaction-btn--anim-skull .hw-reaction-img { animation: skullPulse 0.7s ease; }

        /* Fire flicker */
        @keyframes fireFX {
          0%,100% { transform: scale(1) rotate(0deg); }
          25%  { transform: scale(1.15) rotate(-4deg); }
          50%  { transform: scale(1.25) rotate(3deg); }
          75%  { transform: scale(1.1) rotate(-2deg); }
        }
        .hw-reaction-btn--anim-fire .hw-reaction-img { animation: fireFX 0.7s ease; }

        /* Heart beat */
        @keyframes heartBeat {
          0%,100% { transform: scale(1); }
          30%  { transform: scale(1.35); }
          60%  { transform: scale(1.1); }
        }
        .hw-reaction-btn--anim-heart .hw-reaction-img { animation: heartBeat 0.7s ease; }

        /* Thumbs down wobble */
        @keyframes thumbsWobble {
          0%,100% { transform: rotate(0deg); }
          25%  { transform: rotate(-15deg); }
          75%  { transform: rotate(10deg); }
        }
        .hw-reaction-btn--anim-thumbsdown .hw-reaction-img { animation: thumbsWobble 0.7s ease; }

        @media (max-width: 480px) {
          .hw-reactions { gap: 8px; }
          .hw-reaction-btn { padding: 8px 10px; min-width: 54px; }
          .hw-reaction-img, .hw-reaction-img-wrap { width: 26px; height: 26px; }
          .hw-reaction-img { width: 26px; height: 26px; }
        }
      `}</style>
    </>
  );
}