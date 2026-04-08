"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

/* ── Types ──────────────────────────────────────────────────────── */
interface WallpaperResult {
  id: string;
  slug: string;
  title: string;
  description?: string;
  r2Key: string;
  deviceType?: "IPHONE" | "ANDROID" | "PC" | null;
  tags: string[];
  viewCount: number;
  href: string;
  collection?: { slug: string; title: string } | null;
}

type Phase =
  | "idle"       // initial state, nothing pulled yet
  | "pulling"    // animation playing
  | "revealing"  // card flip-in
  | "done";      // fully revealed

/* ── Rarity tiers (cosmetic, based on pull count) ───────────────── */
const RARITY_TIERS = [
  { label: "Legendary",  color: "#c9a84c", glow: "rgba(201,168,76,0.5)",  min: 0,  max: 2  },
  { label: "Epic",       color: "#9b5de5", glow: "rgba(155,93,229,0.45)", min: 3,  max: 7  },
  { label: "Rare",       color: "#00b4d8", glow: "rgba(0,180,216,0.4)",   min: 8,  max: 15 },
  { label: "Uncommon",   color: "#4caf50", glow: "rgba(76,175,80,0.35)",  min: 16, max: 30 },
  { label: "Common",     color: "#a89bc0", glow: "rgba(168,155,192,0.3)", min: 31, max: Infinity },
];

function getRarity(pullCount: number) {
  // Random roll with pull-count bias (pity system — more pulls = more chances for high rarity)
  const roll = Math.random() * 100;
  const pity = Math.min(pullCount * 1.5, 20); // up to +20% luck bonus

  if (roll + pity > 97)  return RARITY_TIERS[0]; // Legendary
  if (roll + pity > 88)  return RARITY_TIERS[1]; // Epic
  if (roll + pity > 72)  return RARITY_TIERS[2]; // Rare
  if (roll + pity > 50)  return RARITY_TIERS[3]; // Uncommon
  return RARITY_TIERS[4];                         // Common
}

/* ── Shuffle card icons (cosmetic flair during pull animation) ───── */
const SHUFFLE_ICONS = ["💀", "🕯️", "🦇", "🌑", "⚰️", "🔮", "🪦", "👁️", "🕸️", "🩸"];

/* ══════════════════════════════════════════════════════════════════ */
export default function GachaPage() {
  const [phase,      setPhase]      = useState<Phase>("idle");
  const [result,     setResult]     = useState<WallpaperResult | null>(null);
  const [rarity,     setRarity]     = useState(RARITY_TIERS[4]);
  const [pullCount,  setPullCount]  = useState(0);
  const [shuffleIdx, setShuffleIdx] = useState(0);
  const [error,      setError]      = useState<string | null>(null);
  const [history,    setHistory]    = useState<WallpaperResult[]>([]);

  /* Shuffle icon ticker during pull animation */
  useEffect(() => {
    if (phase !== "pulling") return;
    const interval = setInterval(() => {
      setShuffleIdx(i => (i + 1) % SHUFFLE_ICONS.length);
    }, 90);
    return () => clearInterval(interval);
  }, [phase]);

  /* ── Core pull logic ─────────────────────────────────────────── */
  const pull = useCallback(async () => {
    if (phase === "pulling" || phase === "revealing") return;

    setPhase("pulling");
    setResult(null);
    setError(null);

    // Fetch & animation run in parallel — animation always lasts ≥1.6s
    const [data] = await Promise.all([
      fetch("/api/random-wallpaper").then(r => r.ok ? r.json() : null),
      new Promise(res => setTimeout(res, 1600)),
    ]);

    if (!data || data.error || !data.r2Key) {
      setError("The void returned nothing. Try again.");
      setPhase("idle");
      return;
    }

    const newPullCount = pullCount + 1;
    setPullCount(newPullCount);
    setRarity(getRarity(newPullCount));
    setResult(data);
    setPhase("revealing");

    // Add to session history (last 5)
    setHistory(prev => [data, ...prev].slice(0, 5));

    // Transition to "done" after reveal animation finishes
    setTimeout(() => setPhase("done"), 900);
  }, [phase, pullCount]);

  /* ── Derived values ──────────────────────────────────────────── */
  const r2PublicBase = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";
  const thumbUrl = result?.r2Key
    ? `${r2PublicBase}/${result.r2Key}`
    : null;

  const isPortrait = result?.deviceType !== "PC";

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <main className="gacha-page">

      {/* ── Hero header ── */}
      <header className="gacha-hero">
        <p className="gacha-eyebrow">🔮 Dark Art Station</p>
        <h1 className="gacha-title">
          Wallpaper<br /><em>Destiny Draw</em>
        </h1>
        <p className="gacha-subtitle">
          One pull. One fate. The void chooses for you.
        </p>
        {pullCount > 0 && (
          <p className="gacha-pull-count">Draw #{pullCount}</p>
        )}
      </header>

      {/* ── Stage ── */}
      <section className="gacha-stage">

        {/* ── IDLE STATE ── */}
        {phase === "idle" && (
          <div className="gacha-idle">
            <div className="gacha-orb" aria-hidden="true">
              <span className="gacha-orb-icon">🔮</span>
              <div className="gacha-orb-ring gacha-orb-ring--1" />
              <div className="gacha-orb-ring gacha-orb-ring--2" />
              <div className="gacha-orb-ring gacha-orb-ring--3" />
            </div>
            <p className="gacha-hint">
              The darkness holds {"\u221e"} wallpapers.<br />What will it reveal for you?
            </p>
          </div>
        )}

        {/* ── PULLING ANIMATION ── */}
        {phase === "pulling" && (
          <div className="gacha-pulling" aria-live="polite" aria-label="Pulling wallpaper...">
            <div className="gacha-shuffle-grid">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="gacha-shuffle-card"
                  style={{
                    animationDelay: `${i * 0.07}s`,
                    opacity: shuffleIdx % 9 === i ? 1 : 0.25 + Math.random() * 0.4,
                  }}
                >
                  <span className="gacha-shuffle-icon">
                    {SHUFFLE_ICONS[(shuffleIdx + i) % SHUFFLE_ICONS.length]}
                  </span>
                </div>
              ))}
            </div>
            <p className="gacha-pulling-text">The void is choosing…</p>
          </div>
        )}

        {/* ── REVEALING / DONE ── */}
        {(phase === "revealing" || phase === "done") && result && thumbUrl && (
          <div
            className={`gacha-result ${phase === "revealing" ? "gacha-result--entering" : "gacha-result--done"}`}
            style={{
              "--rarity-color": rarity.color,
              "--rarity-glow":  rarity.glow,
            } as React.CSSProperties}
          >
            {/* Rarity badge */}
            <div className="gacha-rarity-badge" style={{ color: rarity.color, borderColor: rarity.color }}>
              <span className="gacha-rarity-star">✦</span>
              {rarity.label}
              <span className="gacha-rarity-star">✦</span>
            </div>

            {/* Card */}
            <div className={`gacha-card ${isPortrait ? "gacha-card--portrait" : "gacha-card--landscape"}`}>
              {/* Glow halo */}
              <div className="gacha-card-glow" />

              {/* Image */}
              <div className="gacha-card-image-wrap">
                <Image
                  src={thumbUrl}
                  alt={result.title}
                  fill
                  priority
                  unoptimized
                  className="gacha-card-image"
                  sizes="(max-width: 640px) 90vw, 400px"
                />
                {/* Shimmer sweep overlay */}
                <div className="gacha-card-shimmer" aria-hidden="true" />
              </div>

              {/* Corner decorations */}
              <div className="gacha-card-corner gacha-card-corner--tl" aria-hidden="true">✦</div>
              <div className="gacha-card-corner gacha-card-corner--tr" aria-hidden="true">✦</div>
              <div className="gacha-card-corner gacha-card-corner--bl" aria-hidden="true">✦</div>
              <div className="gacha-card-corner gacha-card-corner--br" aria-hidden="true">✦</div>
            </div>

            {/* Info */}
            <div className="gacha-result-info">
              <h2 className="gacha-result-title">{result.title}</h2>

              {result.collection && (
                <p className="gacha-result-collection">
                  from <em>{result.collection.title}</em>
                </p>
              )}

              {result.tags.length > 0 && (
                <div className="gacha-result-tags">
                  {result.tags.slice(0, 4).map(tag => (
                    <span key={tag} className="gacha-result-tag">#{tag}</span>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div className="gacha-result-actions">
                <a
                  href={`/api/download/image/${result.id}`}
                  className="gacha-btn gacha-btn--primary"
                  download
                >
                  ↓ Download Free
                </a>
                <Link
                  href={result.href}
                  className="gacha-btn gacha-btn--secondary"
                >
                  View Page →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <p className="gacha-error">{error}</p>
        )}
      </section>

      {/* ── Pull Button ── */}
      <div className="gacha-pull-wrap">
        <button
          className={`gacha-pull-btn ${phase === "pulling" || phase === "revealing" ? "gacha-pull-btn--disabled" : ""}`}
          onClick={pull}
          disabled={phase === "pulling" || phase === "revealing"}
          aria-label={phase === "done" ? "Draw Again" : "Draw Wallpaper"}
        >
          {phase === "pulling"
            ? "Drawing…"
            : phase === "revealing"
            ? "Revealing…"
            : phase === "done"
            ? "🔮 Draw Again"
            : "🔮 Draw Wallpaper"}
        </button>

        {phase === "idle" && (
          <p className="gacha-pull-note">
            Completely free · No account · Instant download
          </p>
        )}
        {phase === "done" && (
          <p className="gacha-pull-note">
            {pullCount} draw{pullCount !== 1 ? "s" : ""} so far · Keep going…
          </p>
        )}
      </div>

      {/* ── Recent Pulls (Session History) ── */}
      {history.length > 1 && (
        <section className="gacha-history">
          <h3 className="gacha-history-heading">Recent Draws</h3>
          <div className="gacha-history-grid">
            {history.slice(1).map((item, i) => {
              const url = `${r2PublicBase}/${item.r2Key}`;
              return (
                <Link key={`${item.id}-${i}`} href={item.href} className="gacha-history-card">
                  <div className="gacha-history-img-wrap">
                    <Image
                      src={url}
                      alt={item.title}
                      fill
                      unoptimized
                      className="gacha-history-img"
                      sizes="120px"
                    />
                  </div>
                  <span className="gacha-history-title">{item.title}</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Diff from Header Shuffle callout ── */}
      <section className="gacha-explainer">
        <div className="gacha-explainer-inner">
          <h3 className="gacha-explainer-heading">What's the difference?</h3>
          <div className="gacha-explainer-grid">
            <div className="gacha-explainer-card">
              <span className="gacha-explainer-icon">🔀</span>
              <strong>Header Shuffle</strong>
              <p>Instantly teleports you to a random wallpaper page. Quick navigation tool.</p>
            </div>
            <div className="gacha-explainer-card gacha-explainer-card--highlight">
              <span className="gacha-explainer-icon">🎲</span>
              <strong>Destiny Draw</strong>
              <p>Reveals wallpapers here with animation, rarity system & pull history. A game.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SEO content block ── Google needs readable text on this page ── */}
      <section className="gacha-seo-section">
        <div className="gacha-seo-inner">
          <h2 className="gacha-seo-heading">Free Random Dark Wallpaper Generator</h2>
          <p className="gacha-seo-text">
            Destiny Draw pulls a random wallpaper from the entire Haunted Wallpapers collection —
            gothic art, dark fantasy, horror, atmospheric landscapes, skull artwork, and more.
            Every pull is completely free with no account required and no watermarks.
            Images are available in high resolution for iPhone, Android, and PC desktop screens.
          </p>
          <p className="gacha-seo-text">
            Our collection spans hundreds of unique dark art wallpapers across categories including
            dark fantasy, gothic horror, AMOLED-optimised black backgrounds, cyberpunk neon,
            dark minimalism, Halloween seasonal art, and more. The rarity system is purely cosmetic —
            every wallpaper is equally free to download regardless of its tier.
          </p>
          <div className="gacha-seo-links">
            <a href="/iphone" className="gacha-seo-link">Browse iPhone Wallpapers →</a>
            <a href="/android" className="gacha-seo-link">Browse Android Wallpapers →</a>
            <a href="/pc" className="gacha-seo-link">Browse PC Wallpapers →</a>
            <a href="/collections" className="gacha-seo-link">All Collections →</a>
          </div>
        </div>
      </section>

      {/* ── Styles ── */}
      <style>{`

        /* ── Page base ── */
        .gacha-page {
          min-height: 100vh;
          background-color: var(--bg-primary);
          color: var(--text-primary);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-bottom: 80px;
        }

        /* ── Hero ── */
        .gacha-hero {
          text-align: center;
          padding: 80px 24px 40px;
          max-width: 600px;
        }
        .gacha-eyebrow {
          font-family: var(--font-space), monospace;
          font-size: 0.65rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #8b0000;
          margin-bottom: 16px;
        }
        .gacha-title {
          font-family: var(--font-cormorant), serif;
          font-size: clamp(3rem, 10vw, 5.5rem);
          font-weight: 700;
          line-height: 1;
          color: var(--text-primary);
          margin-bottom: 16px;
        }
        .gacha-title em {
          font-style: italic;
          color: #8b0000;
        }
        .gacha-subtitle {
          font-family: var(--font-space), monospace;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          color: #6b6480;
          margin-bottom: 8px;
        }
        .gacha-pull-count {
          font-family: var(--font-space), monospace;
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #c9a84c;
        }

        /* ── Stage ── */
        .gacha-stage {
          width: 100%;
          max-width: 520px;
          min-height: 420px;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 32px;
        }

        /* ── Idle orb ── */
        .gacha-idle {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 32px;
        }
        .gacha-orb {
          position: relative;
          width: 160px;
          height: 160px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .gacha-orb-icon {
          font-size: 4rem;
          position: relative;
          z-index: 2;
          animation: gacha-float 3s ease-in-out infinite;
        }
        .gacha-orb-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1px solid rgba(139,0,0,0.3);
          animation: gacha-pulse 3s ease-in-out infinite;
        }
        .gacha-orb-ring--1 { animation-delay: 0s;    scale: 0.7; }
        .gacha-orb-ring--2 { animation-delay: 0.8s;  scale: 0.9; }
        .gacha-orb-ring--3 { animation-delay: 1.6s;  scale: 1.1; }

        @keyframes gacha-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        @keyframes gacha-pulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50%       { opacity: 0.7; transform: scale(1.08); }
        }

        .gacha-hint {
          font-family: var(--font-cormorant), serif;
          font-size: 1.1rem;
          font-style: italic;
          color: #6b6480;
          text-align: center;
          line-height: 1.6;
        }

        /* ── Pulling shuffle grid ── */
        .gacha-pulling {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }
        .gacha-shuffle-grid {
          display: grid;
          grid-template-columns: repeat(3, 80px);
          grid-template-rows: repeat(3, 80px);
          gap: 8px;
        }
        .gacha-shuffle-card {
          background: rgba(139,0,0,0.12);
          border: 1px solid rgba(139,0,0,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: gacha-card-flicker 0.18s linear infinite alternate;
          transition: opacity 0.09s;
        }
        @keyframes gacha-card-flicker {
          from { background: rgba(139,0,0,0.08); }
          to   { background: rgba(139,0,0,0.22); }
        }
        .gacha-shuffle-icon {
          font-size: 1.8rem;
          user-select: none;
          animation: gacha-spin-icon 0.6s linear infinite;
        }
        @keyframes gacha-spin-icon {
          from { transform: rotateY(0deg); }
          to   { transform: rotateY(360deg); }
        }
        .gacha-pulling-text {
          font-family: var(--font-space), monospace;
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #8b0000;
          animation: gacha-blink 0.8s ease-in-out infinite;
        }
        @keyframes gacha-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }

        /* ── Result card ── */
        .gacha-result {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          width: 100%;
        }
        .gacha-result--entering {
          animation: gacha-card-in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .gacha-result--done {
          animation: none;
        }
        @keyframes gacha-card-in {
          from {
            opacity: 0;
            transform: scale(0.6) rotateY(90deg);
          }
          to {
            opacity: 1;
            transform: scale(1) rotateY(0deg);
          }
        }

        /* Rarity badge */
        .gacha-rarity-badge {
          font-family: var(--font-space), monospace;
          font-size: 0.65rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          border: 1px solid;
          padding: 6px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          animation: gacha-badge-glow 2s ease-in-out infinite;
        }
        @keyframes gacha-badge-glow {
          0%, 100% { box-shadow: 0 0 8px var(--rarity-glow, transparent); }
          50%       { box-shadow: 0 0 22px var(--rarity-glow, transparent); }
        }
        .gacha-rarity-star { font-size: 0.5rem; }

        /* Card frame */
        .gacha-card {
          position: relative;
          overflow: hidden;
          border: 2px solid var(--rarity-color, #2a2535);
          box-shadow:
            0 0 30px var(--rarity-glow, rgba(0,0,0,0.5)),
            0 0 60px var(--rarity-glow, rgba(0,0,0,0.2)),
            inset 0 0 30px rgba(0,0,0,0.6);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .gacha-card:hover {
          transform: translateY(-4px) scale(1.01);
          box-shadow:
            0 0 40px var(--rarity-glow, rgba(0,0,0,0.6)),
            0 0 80px var(--rarity-glow, rgba(0,0,0,0.3));
        }
        .gacha-card--portrait {
          width: min(320px, 85vw);
          aspect-ratio: 9/16;
        }
        .gacha-card--landscape {
          width: min(460px, 90vw);
          aspect-ratio: 16/9;
        }

        .gacha-card-glow {
          position: absolute;
          inset: -20px;
          background: radial-gradient(ellipse at center, var(--rarity-glow, transparent) 0%, transparent 70%);
          pointer-events: none;
          z-index: 1;
          opacity: 0.6;
        }
        .gacha-card-image-wrap {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .gacha-card-image {
          object-fit: cover;
          object-position: center;
        }

        /* Shimmer sweep */
        .gacha-card-shimmer {
          position: absolute;
          inset: 0;
          z-index: 3;
          background: linear-gradient(
            105deg,
            transparent 35%,
            rgba(255,255,255,0.15) 50%,
            transparent 65%
          );
          background-size: 200% 100%;
          animation: gacha-shimmer 1.2s ease-out 0.3s 1 forwards;
          opacity: 0;
        }
        @keyframes gacha-shimmer {
          from { background-position: -100% 0; opacity: 1; }
          to   { background-position: 200% 0;  opacity: 0; }
        }

        /* Corner ornaments */
        .gacha-card-corner {
          position: absolute;
          z-index: 4;
          font-size: 0.6rem;
          color: var(--rarity-color, #2a2535);
          line-height: 1;
        }
        .gacha-card-corner--tl { top: 6px;    left: 8px;  }
        .gacha-card-corner--tr { top: 6px;    right: 8px; }
        .gacha-card-corner--bl { bottom: 6px; left: 8px;  }
        .gacha-card-corner--br { bottom: 6px; right: 8px; }

        /* Info below card */
        .gacha-result-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          text-align: center;
          width: 100%;
          max-width: 420px;
        }
        .gacha-result-title {
          font-family: var(--font-cormorant), serif;
          font-size: 1.5rem;
          font-style: italic;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.2;
        }
        .gacha-result-collection {
          font-family: var(--font-space), monospace;
          font-size: 0.6rem;
          letter-spacing: 0.15em;
          color: #6b6480;
          text-transform: uppercase;
        }
        .gacha-result-collection em {
          color: #a89bc0;
          font-style: normal;
        }
        .gacha-result-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          justify-content: center;
        }
        .gacha-result-tag {
          font-family: var(--font-space), monospace;
          font-size: 0.5rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          border: 1px solid #2a2535;
          padding: 3px 8px;
          color: #6b6480;
        }

        /* Action buttons */
        .gacha-result-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 4px;
        }
        .gacha-btn {
          font-family: var(--font-space), monospace;
          font-size: 0.65rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 12px 24px;
          text-decoration: none;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .gacha-btn--primary {
          background: #8b0000;
          color: #f0ecff;
          border: 1px solid #8b0000;
        }
        .gacha-btn--primary:hover {
          background: #c0001a;
          border-color: #c0001a;
        }
        .gacha-btn--secondary {
          background: transparent;
          color: #a89bc0;
          border: 1px solid #2a2535;
        }
        .gacha-btn--secondary:hover {
          border-color: #8b0000;
          color: #f0ecff;
        }

        /* ── Pull button ── */
        .gacha-pull-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin-bottom: 48px;
        }
        .gacha-pull-btn {
          font-family: var(--font-space), monospace;
          font-size: 0.8rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          padding: 18px 48px;
          background: linear-gradient(135deg, #6b0000, #8b0000, #6b0000);
          background-size: 200% 100%;
          color: #f0ecff;
          border: 1px solid rgba(192,0,26,0.6);
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .gacha-pull-btn::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%);
          background-size: 200% 100%;
          background-position: -100%;
          transition: background-position 0.4s ease;
        }
        .gacha-pull-btn:hover:not(.gacha-pull-btn--disabled)::before {
          background-position: 200%;
        }
        .gacha-pull-btn:hover:not(.gacha-pull-btn--disabled) {
          background-position: right center;
          box-shadow: 0 0 30px rgba(139,0,0,0.5), 0 0 60px rgba(139,0,0,0.2);
          border-color: #c0001a;
        }
        .gacha-pull-btn--disabled {
          opacity: 0.5;
          cursor: not-allowed;
          animation: gacha-btn-pulse 0.6s ease-in-out infinite;
        }
        @keyframes gacha-btn-pulse {
          0%, 100% { box-shadow: 0 0 10px rgba(139,0,0,0.3); }
          50%       { box-shadow: 0 0 25px rgba(139,0,0,0.6); }
        }
        .gacha-pull-note {
          font-family: var(--font-space), monospace;
          font-size: 0.55rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #4a445a;
        }

        /* ── Error ── */
        .gacha-error {
          font-family: var(--font-space), monospace;
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          color: #c0001a;
          text-align: center;
          border: 1px solid rgba(192,0,26,0.3);
          padding: 16px 24px;
        }

        /* ── Recent pulls history ── */
        .gacha-history {
          width: 100%;
          max-width: 560px;
          padding: 0 24px;
          margin-bottom: 48px;
        }
        .gacha-history-heading {
          font-family: var(--font-space), monospace;
          font-size: 0.6rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #4a445a;
          margin-bottom: 16px;
          text-align: center;
        }
        .gacha-history-grid {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          scrollbar-width: none;
          padding-bottom: 4px;
          justify-content: center;
        }
        .gacha-history-grid::-webkit-scrollbar { display: none; }
        .gacha-history-card {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          text-decoration: none;
          width: 80px;
        }
        .gacha-history-img-wrap {
          position: relative;
          width: 80px;
          aspect-ratio: 9/16;
          overflow: hidden;
          border: 1px solid #2a2535;
          transition: border-color 0.2s;
        }
        .gacha-history-card:hover .gacha-history-img-wrap {
          border-color: rgba(139,0,0,0.5);
        }
        .gacha-history-img {
          object-fit: cover;
          object-position: center;
        }
        .gacha-history-title {
          font-family: var(--font-space), monospace;
          font-size: 0.45rem;
          letter-spacing: 0.05em;
          color: #6b6480;
          text-align: center;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          line-height: 1.3;
        }

        /* ── Explainer section ── */
        .gacha-explainer {
          width: 100%;
          max-width: 560px;
          padding: 0 24px;
        }
        .gacha-explainer-inner {
          border: 1px solid #1e1b2a;
          padding: 28px;
        }
        .gacha-explainer-heading {
          font-family: var(--font-space), monospace;
          font-size: 0.6rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #4a445a;
          margin-bottom: 20px;
          text-align: center;
        }
        .gacha-explainer-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .gacha-explainer-card {
          padding: 16px;
          border: 1px solid #1e1b2a;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .gacha-explainer-card--highlight {
          border-color: rgba(139,0,0,0.3);
          background: rgba(139,0,0,0.04);
        }
        .gacha-explainer-icon {
          font-size: 1.4rem;
        }
        .gacha-explainer-card strong {
          font-family: var(--font-space), monospace;
          font-size: 0.6rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-primary);
        }
        .gacha-explainer-card p {
          font-family: var(--font-space), monospace;
          font-size: 0.6rem;
          letter-spacing: 0.04em;
          color: #6b6480;
          line-height: 1.6;
          margin: 0;
        }

        /* ── Light theme overrides ── */
        [data-theme="light"] .gacha-pull-btn {
          background: linear-gradient(135deg, #8b0000, #c0001a, #8b0000);
          border-color: #c0001a;
        }
        [data-theme="light"] .gacha-card {
          box-shadow:
            0 0 20px var(--rarity-glow, rgba(0,0,0,0.2)),
            0 4px 24px rgba(0,0,0,0.15);
        }
        [data-theme="light"] .gacha-explainer-inner,
        [data-theme="light"] .gacha-explainer-card {
          border-color: #cdc8bc;
        }
        [data-theme="light"] .gacha-explainer-card--highlight {
          background: rgba(192,0,26,0.04);
          border-color: rgba(192,0,26,0.25);
        }
        [data-theme="light"] .gacha-idle .gacha-hint {
          color: #9a9288;
        }

        /* ── SEO section ── */
        .gacha-seo-section {
          width: 100%;
          max-width: 640px;
          padding: 48px 24px 0;
          margin-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        [data-theme="light"] .gacha-seo-section { border-color: #cdc8bc; }
        .gacha-seo-inner {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .gacha-seo-heading {
          font-family: var(--font-space), monospace;
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #4a445a;
          margin: 0;
        }
        [data-theme="light"] .gacha-seo-heading { color: #8a8468; }
        .gacha-seo-text {
          font-family: var(--font-cormorant), serif;
          font-size: 0.95rem;
          color: #6b6480;
          line-height: 1.75;
          margin: 0;
        }
        [data-theme="light"] .gacha-seo-text { color: #5a5450; }
        .gacha-seo-links {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .gacha-seo-link {
          font-family: var(--font-space), monospace;
          font-size: 0.55rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #c0001a;
          text-decoration: none;
          border-bottom: 1px solid rgba(192,0,26,0.3);
          padding-bottom: 2px;
          transition: border-color 0.2s;
        }
        .gacha-seo-link:hover { border-color: #c0001a; }
      `}</style>
    </main>
  );
}