// components/WallpaperReactions.tsx
// Emoji reaction buttons with counts for wallpaper pages
// ✅ PERF: Replaced 4 R2 image fetches with Unicode emoji — zero network cost
"use client";

import { useState, useEffect, useCallback } from "react";

interface Props {
  imageId: string;
}

type ReactionKey = "skull" | "fire" | "heart" | "thumbsdown";

const REACTIONS: { key: ReactionKey; label: string; emoji: string; baseMin: number; baseMax: number; zeroChance: number }[] = [
  { key: "skull",      label: "Haunted", emoji: "💀", baseMin: 12, baseMax: 24, zeroChance: 0.08 },
  { key: "fire",       label: "Fire",    emoji: "🔥", baseMin: 8,  baseMax: 15, zeroChance: 0.12 },
  { key: "heart",      label: "Love",    emoji: "❤️", baseMin: 5,  baseMax: 10, zeroChance: 0.15 },
  { key: "thumbsdown", label: "Meh",     emoji: "👎", baseMin: 0,  baseMax: 4,  zeroChance: 0.30 },
];

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
    if (voted === key) return;
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
    setTimeout(() => setAnimating(null), 500);
  }, [voted, storageKey]);

  return (
    <>
      <p style={{
        fontFamily: "Arial, sans-serif",
        fontSize: "0.55rem",
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: "rgba(224,224,224,0.35)",
        margin: "18px 0 8px",
      }}>
        ▸ Tap to react
      </p>
      <div className="hw-reactions">
        {REACTIONS.map(({ key, label, emoji }) => {
          const isVoted = voted === key;
          const isAnim  = animating === key;
          return (
            <button
              key={key}
              className={`hw-reaction-btn${isVoted ? " hw-reaction-btn--voted" : ""}${isAnim ? " hw-reaction-btn--anim" : ""}`}
              onClick={() => handleVote(key)}
              aria-label={`React with ${label}`}
              aria-pressed={isVoted}
            >
              <span className="hw-reaction-emoji" aria-hidden="true">{emoji}</span>
              <span className="hw-reaction-label">{label}</span>
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
          padding: 14px 16px;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, transform 0.15s;
          color: #d0d0e8;
          min-width: 72px;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
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
        .hw-reaction-emoji {
          font-size: 2rem;
          line-height: 1;
          display: block;
          transition: transform 0.15s;
        }
        .hw-reaction-btn--anim .hw-reaction-emoji {
          transform: scale(1.3);
        }
        .hw-reaction-label {
          font-family: Arial, sans-serif;
          font-size: 0.5rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(200,200,220,0.5);
          line-height: 1;
          margin-top: 2px;
        }
        .hw-reaction-btn--voted .hw-reaction-label { color: rgba(255,255,255,0.7); }
        .hw-reaction-count {
          font-family: Arial, sans-serif;
          font-size: 0.68rem;
          letter-spacing: 0.06em;
          color: rgba(200,200,220,0.8);
          line-height: 1;
        }
        .hw-reaction-btn--voted .hw-reaction-count { color: #fff; }
        @media (max-width: 480px) {
          .hw-reactions { gap: 8px; }
          .hw-reaction-btn { padding: 12px 12px; min-width: 64px; }
          .hw-reaction-emoji { font-size: 1.75rem; }
        }
      `}</style>
    </>
  );
}