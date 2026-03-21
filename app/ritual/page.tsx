// app/ritual/page.tsx
'use client';

import { useState, useCallback } from "react";

const FATES = [
  "The void has chosen you. Your path leads deeper into the dark.",
  "Darkness surrounds you, but within it burns an ember that cannot be extinguished.",
  "The bones speak — a great change approaches. Embrace it without fear.",
  "Something follows in your shadow. Don't let it know that you know.",
  "You carry the weight of unseen eyes. They are not enemies.",
  "The abyss mirrors what you refuse to see in yourself.",
  "Three doors stand before you. The darkest one is yours.",
  "What haunts you also protects you. This is the balance.",
  "You have been here before, in another life, under another moon.",
  "The skull smiles because it knows what you've survived.",
  "Power lives in the spaces between heartbeats. You have it.",
  "Your worst fear and your greatest gift share the same face.",
  "The night is not empty. It is full of things that chose you.",
  "Something ends. Something worse — or better — begins.",
  "The cards cannot show what you already know in the dark.",
  "You stand at the threshold. What waits beyond cannot be unseen.",
  "The dark does not consume you. It has been feeding you all along.",
  "Three shadows walk beside you. Only one is yours.",
  "The silence between the screams — that is where your answer lives.",
  "It ends where it began. In the dark. With you.",
];

const CARD_BACKS = ["☠", "🕯", "✦", "🌑", "⚰", "🩸", "🗝", "🔮", "🐦‍⬛", "💀"];

const CARD_NAMES = [
  "The Void", "The Wraith", "The Relic", "The Fallen", "The Omen",
  "The Specter", "The Wound", "The Unbound", "The Last Door", "The Watcher",
  "The Marked", "The Echo", "The Threshold", "The Descent", "The Hunger",
  "The Ritual", "The Unnamed", "The Abyss", "The Remnant", "The End",
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Card { id: number; back: string; name: string; fate: string; flipped: boolean; }

function buildDeck(): Card[] {
  const fates = shuffle(FATES);
  const backs = shuffle(CARD_BACKS);
  const names = shuffle(CARD_NAMES);
  return Array.from({ length: 9 }, (_, i) => ({
    id: i,
    back: backs[i % backs.length],
    name: names[i % names.length],
    fate: fates[i % fates.length],
    flipped: false,
  }));
}

export default function RitualPage() {
  const [deck, setDeck] = useState<Card[]>(() => buildDeck());
  const [selected, setSelected] = useState<number[]>([]);
  const [reading, setReading] = useState<string | null>(null);
  const [phase, setPhase] = useState<"choose" | "reading" | "done">("choose");

  const flip = useCallback((id: number) => {
    if (selected.length >= 3) return;
    if (selected.includes(id)) return;

    const newSelected = [...selected, id];
    setSelected(newSelected);
    setDeck(d => d.map(c => c.id === id ? { ...c, flipped: true } : c));

    if (newSelected.length === 3) {
      setTimeout(() => setPhase("reading"), 600);
    }
  }, [selected]);

  const reset = useCallback(() => {
    setDeck(buildDeck());
    setSelected([]);
    setReading(null);
    setPhase("choose");
  }, []);

  const revealReading = useCallback(() => {
    const combined = selected.map(id => {
      const card = deck.find(c => c.id === id)!;
      return card.fate;
    }).join(" ");
    // Pick one of the 3 fates as the "combined" reading
    const idx = Math.floor(Math.random() * 3);
    setReading(deck.find(c => c.id === selected[idx])!.fate);
    setPhase("done");
  }, [selected, deck]);

  return (
    <main className="ritual-page" style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh" }}>
      <style>{`
        .ritual-page { padding-bottom: 80px; }
        .ritual-hero {
          text-align: center;
          padding: clamp(60px, 10vw, 120px) 24px clamp(32px, 5vw, 60px);
        }
        .ritual-eyebrow {
          font-family: var(--font-space, monospace);
          font-size: 0.55rem; letter-spacing: 0.35em; text-transform: uppercase;
          color: var(--blood, #c0001a); display: block; margin-bottom: 20px;
        }
        .ritual-title {
          font-family: var(--font-cinzel, cursive);
          font-size: clamp(2rem, 6vw, 4rem);
          color: var(--text-primary, #f0ecff); line-height: 1.1; margin-bottom: 16px;
        }
        .ritual-sub {
          font-family: var(--font-cormorant, serif);
          font-style: italic; font-size: clamp(1rem, 2.5vw, 1.25rem);
          color: var(--text-muted, #8a8099); max-width: 480px; margin: 0 auto 8px;
        }
        .ritual-instruction {
          font-family: var(--font-space, monospace);
          font-size: 0.6rem; letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--blood, #c0001a); margin-top: 24px;
          animation: ritual-pulse 2s ease-in-out infinite;
        }
        @keyframes ritual-pulse {
          0%,100% { opacity: 1; } 50% { opacity: 0.4; }
        }
        .ritual-deck {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(10px, 2vw, 20px);
          max-width: 640px; margin: 0 auto; padding: 0 24px;
        }
        @media (max-width: 400px) {
          .ritual-deck { grid-template-columns: repeat(3, 1fr); gap: 8px; }
        }
        .ritual-card {
          aspect-ratio: 9/16;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          background: #0e0c18;
          border: 1px solid rgba(192,0,26,0.3);
          cursor: pointer;
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1),
                      box-shadow 0.3s ease,
                      border-color 0.3s ease;
          position: relative; overflow: hidden;
          user-select: none; -webkit-user-select: none;
          touch-action: manipulation;
        }
        .ritual-card:hover:not(.ritual-card--flipped):not(.ritual-card--locked) {
          transform: translateY(-6px) scale(1.02);
          border-color: rgba(192,0,26,0.7);
          box-shadow: 0 8px 32px rgba(192,0,26,0.2), 0 0 0 1px rgba(192,0,26,0.2);
        }
        .ritual-card--locked:not(.ritual-card--flipped) { opacity: 0.45; cursor: default; }
        .ritual-card--flipped {
          border-color: rgba(192,0,26,0.6);
          background: linear-gradient(135deg, #160010 0%, #0e0820 100%);
          box-shadow: 0 4px 24px rgba(192,0,26,0.15);
          animation: card-reveal 0.5s cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes card-reveal {
          from { transform: rotateY(90deg) scale(0.9); opacity: 0; }
          to   { transform: rotateY(0deg) scale(1); opacity: 1; }
        }
        .ritual-card-back { font-size: clamp(1.8rem, 5vw, 2.8rem); line-height: 1; }
        .ritual-card-name {
          font-family: var(--font-space, monospace);
          font-size: clamp(0.42rem, 1.2vw, 0.55rem);
          letter-spacing: 0.15em; text-transform: uppercase;
          color: #c0001a; margin-top: 10px; text-align: center; padding: 0 8px;
        }
        .ritual-card-fate {
          font-family: var(--font-cormorant, serif);
          font-style: italic;
          font-size: clamp(0.7rem, 1.8vw, 0.88rem);
          color: #d4cde8; text-align: center; padding: 12px 10px;
          line-height: 1.4;
        }
        .ritual-card-num {
          position: absolute; top: 8px; left: 10px;
          font-family: var(--font-space, monospace);
          font-size: 0.5rem; color: rgba(192,0,26,0.6); letter-spacing: 0.1em;
        }
        .ritual-reading {
          max-width: 560px; margin: 48px auto 0; padding: 0 24px; text-align: center;
        }
        .ritual-reading-label {
          font-family: var(--font-space, monospace);
          font-size: 0.55rem; letter-spacing: 0.3em; text-transform: uppercase;
          color: #c0001a; margin-bottom: 20px; display: block;
        }
        .ritual-reading-text {
          font-family: var(--font-cormorant, serif);
          font-style: italic; font-size: clamp(1.2rem, 3vw, 1.6rem);
          color: var(--text-primary, #f0ecff); line-height: 1.5;
          animation: reading-fade 0.8s cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes reading-fade {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ritual-divider {
          width: 60px; height: 1px;
          background: linear-gradient(90deg, transparent, #c0001a, transparent);
          margin: 24px auto;
        }
        .ritual-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin-top: 32px; }
        .ritual-btn-primary {
          font-family: var(--font-space, monospace);
          font-size: 0.62rem; letter-spacing: 0.18em; text-transform: uppercase;
          background: #c0001a; color: #f0ecff; border: none;
          padding: 14px 28px; cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          touch-action: manipulation;
        }
        .ritual-btn-primary:hover { background: #a80016; transform: scale(1.02); }
        .ritual-btn-secondary {
          font-family: var(--font-space, monospace);
          font-size: 0.62rem; letter-spacing: 0.18em; text-transform: uppercase;
          background: transparent; color: #8a8099;
          border: 1px solid rgba(139,0,0,0.35); padding: 14px 28px;
          cursor: pointer; transition: all 0.2s; touch-action: manipulation;
        }
        .ritual-btn-secondary:hover { border-color: #c0001a; color: #f0ecff; }
        .ritual-selected-count {
          text-align: center; margin: 32px 0 20px;
          font-family: var(--font-space, monospace);
          font-size: 0.55rem; letter-spacing: 0.2em; text-transform: uppercase;
          color: rgba(192,0,26,0.7);
        }
        .ritual-selected-count strong { color: #c0001a; }
      `}</style>

      {/* ── Hero ── */}
      <div className="ritual-hero">
        <span className="ritual-eyebrow">The Oracle Awaits</span>
        <h1 className="ritual-title">Tarot<br /><span style={{ color: "var(--blood,#c0001a)" }}>Oracle</span></h1>
        <p className="ritual-sub">Three cards. One fate. Choose carefully — the dark does not lie.</p>

        {phase === "choose" && (
          <p className="ritual-instruction">
            {selected.length === 0
              ? "Choose three cards from the void"
              : selected.length === 1
              ? "Two more — the dark is patient"
              : "One more to seal your fate"}
          </p>
        )}
      </div>

      {/* ── Deck ── */}
      <div className="ritual-deck">
        {deck.map((card, i) => (
          <div
            key={card.id}
            className={[
              "ritual-card",
              card.flipped ? "ritual-card--flipped" : "",
              !card.flipped && selected.length >= 3 ? "ritual-card--locked" : "",
            ].join(" ")}
            onClick={() => !card.flipped && phase === "choose" && flip(card.id)}
            role="button"
            tabIndex={card.flipped || selected.length >= 3 ? -1 : 0}
            onKeyDown={e => e.key === "Enter" && flip(card.id)}
            aria-label={card.flipped ? `${card.name}: ${card.fate}` : `Card ${i + 1} — face down`}
          >
            {!card.flipped ? (
              <>
                <span className="ritual-card-back">{card.back}</span>
                <span className="ritual-card-name">
                  {selected.includes(card.id) ? card.name : "Unknown"}
                </span>
              </>
            ) : (
              <>
                <span className="ritual-card-num">
                  {["I","II","III","IV","V","VI","VII","VIII","IX"][i]}
                </span>
                <span className="ritual-card-back">{card.back}</span>
                <span className="ritual-card-name">{card.name}</span>
                {phase === "done" && (
                  <span className="ritual-card-fate">{card.fate}</span>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* ── Action Phase ── */}
      {phase === "reading" && (
        <div className="ritual-reading">
          <div className="ritual-divider" />
          <p className="ritual-reading-label">Your three cards have been drawn</p>
          <div className="ritual-actions">
            <button className="ritual-btn-primary" onClick={revealReading}>
              Reveal Your Fate
            </button>
            <button className="ritual-btn-secondary" onClick={reset}>
              Draw Again
            </button>
          </div>
        </div>
      )}

      {phase === "done" && reading && (
        <div className="ritual-reading">
          <div className="ritual-divider" />
          <span className="ritual-reading-label">The Oracle Speaks</span>
          <p className="ritual-reading-text">&ldquo;{reading}&rdquo;</p>
          <div className="ritual-divider" />
          <div className="ritual-actions">
            <button className="ritual-btn-primary" onClick={reset}>
              Consult Again
            </button>
          </div>
        </div>
      )}
    </main>
  );
}