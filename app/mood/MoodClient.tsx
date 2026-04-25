// app/mood/MoodClient.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { MoodId, MoodImage } from "./page";
import { MOODS } from "./page";

const LockScreenPreviewModal = dynamic(
  () => import("@/components/LockScreenPreviewModal"),
  { ssr: false }
);

interface Props {
  moods:        typeof MOODS;
  imagesByMood: Record<MoodId, MoodImage[]>;
}

interface PreviewTarget {
  src:   string;
  title: string;
}

// ── Mood descriptions (shown in the quiz intro and hero) ────────────────────
const MOOD_DESCRIPTIONS: Record<string, { vibe: string; example: string; keywords: string[] }> = {
  paranoid:   { vibe: "Hyper-aware. Eyes everywhere. Every shadow is a shape.", example: "Great for surveillance cams, all-seeing eyes, figures in the dark.", keywords: ["watching", "unsettling", "horror", "shadow"] },
  melancholy: { vibe: "A beautiful ache. Rain on glass. Missing something you can't name.", example: "Rain, fog, lonely coastlines, dimly lit rooms.", keywords: ["sad", "lonely", "rain", "moody", "atmospheric"] },
  powerful:   { vibe: "Unstoppable. Lightning in your veins. Born to burn.", example: "Demons, warriors, dragons, fire, divine wrath.", keywords: ["fire", "warrior", "epic", "demon"] },
  aggressive: { vibe: "Raw. Unfiltered. Chaos with teeth.", example: "Skulls, beasts, blood, claws, villains mid-scream.", keywords: ["skull", "blood", "monster", "chaos"] },
  quiet:      { vibe: "Still. Emptied. A room after everyone has left.", example: "Minimal dark art, moons, black voids, silhouettes.", keywords: ["minimal", "moon", "void", "night"] },
  haunted:    { vibe: "Something old clings to you. Candles. Cold rooms. Old names.", example: "Ghosts, spirits, candlelit manors, Victorian fog.", keywords: ["ghost", "spirit", "gothic", "candle"] },
  obsessed:   { vibe: "One thought on repeat. Can't stop. Won't stop.", example: "Spirals, fractals, hypnotic loops, glitch art.", keywords: ["spiral", "hypnotic", "ritual", "loop"] },
  cold:       { vibe: "Frozen inside. No warmth. No apologies.", example: "Ice, frost, winter wastelands, blizzard, pale light.", keywords: ["ice", "frost", "winter", "frozen"] },
  violent:    { vibe: "The darkness that isn't poetic. It just is.", example: "Death, brutal war art, reapers, carnage.", keywords: ["skull", "death", "war", "brutal"] },
  dreaming:   { vibe: "Half asleep. Reality blurring at the edges.", example: "Cosmic nebulas, surreal vistas, psychedelic dreamscapes.", keywords: ["cosmic", "galaxy", "surreal", "ethereal"] },
  isolated:   { vibe: "Alone is different from lonely. This is both.", example: "Abandoned ruins, empty deserts, post-apocalyptic.", keywords: ["abandoned", "ruin", "desolate", "alone"] },
  feral:      { vibe: "Primal. Hungry. Something behind your eyes just woke up.", example: "Wolves, predators, wild creatures, hunt.", keywords: ["wolf", "predator", "beast", "primal"] },
  glitching:  { vibe: "Reality is buffering. Error. Error. Rebooting.", example: "Digital corruption, cyber art, neon glitch, matrix.", keywords: ["glitch", "digital", "cyber", "neon"] },
  sinister:   { vibe: "Everything is fine. That's the problem.", example: "Clowns, masks, uncanny smiles, wrong-feeling art.", keywords: ["villain", "evil", "clown", "mask"] },
  mythic:     { vibe: "Ancient. Vast. You're not the main character here.", example: "Dragons, titans, eldritch gods, legendary beasts.", keywords: ["dragon", "titan", "ancient", "legendary"] },
};

// ── Quiz questions → mood scoring ──────────────────────────────────────────
const QUIZ_QUESTIONS = [
  {
    id: "q1",
    question: "What's the first thing you feel when you wake up right now?",
    options: [
      { text: "Wired. Alert. Like something might happen.", moods: ["paranoid", "aggressive"] },
      { text: "Heavy. Weighted down. Still half in a dream.", moods: ["melancholy", "dreaming"] },
      { text: "Charged. Ready. Today is for conquering.", moods: ["powerful", "feral"] },
      { text: "Numb. Detached. Like you're watching yourself from outside.", moods: ["isolated", "cold"] },
    ],
  },
  {
    id: "q2",
    question: "Pick a sound that matches your current inner state:",
    options: [
      { text: "Static. White noise. Something underneath it.", moods: ["paranoid", "glitching"] },
      { text: "Rain against a window at 3am.", moods: ["melancholy", "quiet"] },
      { text: "Low, deep bass that shakes the floor.", moods: ["powerful", "violent"] },
      { text: "Absolute silence. Not peaceful — just absent.", moods: ["isolated", "cold"] },
    ],
  },
  {
    id: "q3",
    question: "If your current mood was a place, it would be:",
    options: [
      { text: "A room you've never been in but somehow recognize.", moods: ["haunted", "sinister", "obsessed"] },
      { text: "A mountain just before a storm.", moods: ["powerful", "mythic"] },
      { text: "An empty highway at 4am.", moods: ["quiet", "isolated", "dreaming"] },
      { text: "Deep underwater. Cold. Still.", moods: ["cold", "melancholy", "feral"] },
    ],
  },
  {
    id: "q4",
    question: "What's been living rent-free in your head lately?",
    options: [
      { text: "One specific memory or thought, looping.", moods: ["obsessed", "melancholy"] },
      { text: "A feeling that something is wrong but you can't place it.", moods: ["paranoid", "sinister", "haunted"] },
      { text: "Pure restless energy with nowhere to go.", moods: ["aggressive", "feral"] },
      { text: "Big questions. Ancient things. Nothing small.", moods: ["mythic", "dreaming", "powerful"] },
    ],
  },
  {
    id: "q5",
    question: "How do people experience you right now?",
    options: [
      { text: "They sense something off. They can't explain it.", moods: ["sinister", "haunted", "paranoid"] },
      { text: "They feel the weight around me. Keep their distance.", moods: ["melancholy", "isolated", "cold"] },
      { text: "They feel my energy whether they want to or not.", moods: ["powerful", "aggressive", "violent"] },
      { text: "I'm somewhere else entirely. They barely register.", moods: ["dreaming", "quiet", "obsessed"] },
    ],
  },
  {
    id: "q6",
    question: "One word for where you are right now:",
    options: [
      { text: "Fractured", moods: ["glitching", "violent", "aggressive"] },
      { text: "Hollow", moods: ["isolated", "cold", "melancholy"] },
      { text: "Burning", moods: ["powerful", "feral", "mythic"] },
      { text: "Unraveling", moods: ["obsessed", "haunted", "paranoid", "sinister"] },
    ],
  },
];

// Score answers → best mood match
function scoreMoods(answers: Record<string, string[]>): MoodId {
  const scores: Record<string, number> = {};
  Object.values(answers).forEach(moods => {
    moods.forEach(m => { scores[m] = (scores[m] ?? 0) + 1; });
  });
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return (sorted[0]?.[0] ?? "paranoid") as MoodId;
}

export default function MoodClient({ moods, imagesByMood }: Props) {
  const [active,        setActive]   = useState<MoodId>("paranoid");
  const [visible,       setVisible]  = useState(12);
  const [animKey,       setAnimKey]  = useState(0);
  const [preview,       setPreview]  = useState<PreviewTarget | null>(null);
  const [showQuiz,      setShowQuiz] = useState(false);
  const [quizStep,      setQuizStep] = useState(0);
  const [quizAnswers,   setQuizAnswers] = useState<Record<string, string[]>>({});
  const [quizResult,    setQuizResult] = useState<MoodId | null>(null);
  const [quizResultImg, setQuizResultImg] = useState<MoodImage | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const activeMood  = moods.find((m) => m.id === active)!;
  const allImages   = imagesByMood[active] ?? [];
  const shownImages = allImages.slice(0, visible);
  const hasMore     = allImages.length > visible;

  const switchMood = (id: MoodId) => {
    if (id === active) return;
    setActive(id);
    setVisible(12);
    setAnimKey((k) => k + 1);
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const cards = gridRef.current?.querySelectorAll<HTMLElement>(".mood-card");
    if (!cards) return;
    cards.forEach((card, i) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(20px)";
      setTimeout(() => {
        card.style.transition = "opacity 0.4s ease, transform 0.4s ease";
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      }, i * 35);
    });
  }, [animKey]);

  const devicePath = (img: MoodImage) => {
    const d = img.deviceType?.toLowerCase();
    if (d === "iphone")  return `/iphone/${img.slug}`;
    if (d === "android") return `/android/${img.slug}`;
    if (d === "pc")      return `/pc/${img.slug}`;
    return `/iphone/${img.slug}`;
  };

  const openPreview = useCallback((e: React.MouseEvent, img: MoodImage) => {
    e.preventDefault();
    e.stopPropagation();
    setPreview({ src: img.url, title: img.title });
  }, []);

  // ── Quiz logic ──────────────────────────────────────────────────────────
  const handleQuizAnswer = (option: { text: string; moods: string[] }) => {
    const newAnswers = { ...quizAnswers, [QUIZ_QUESTIONS[quizStep].id]: option.moods };
    setQuizAnswers(newAnswers);

    if (quizStep < QUIZ_QUESTIONS.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      // Score and find result
      const resultMoodId = scoreMoods(newAnswers);
      setQuizResult(resultMoodId);
      // Pick the top wallpaper for that mood
      const imgs = imagesByMood[resultMoodId] ?? [];
      setQuizResultImg(imgs[0] ?? null);
    }
  };

  const resetQuiz = () => {
    setShowQuiz(false);
    setQuizStep(0);
    setQuizAnswers({});
    setQuizResult(null);
    setQuizResultImg(null);
  };

  const applyQuizResult = (moodId: MoodId) => {
    resetQuiz();
    switchMood(moodId);
  };

  return (
    <>
      <style>{`
        .mood-page {
          min-height: 100vh;
          background: var(--bg-primary);
          color: var(--text-primary);
        }

        /* ── Hero ── */
        .mood-hero {
          text-align: center;
          padding: clamp(48px, 8vw, 96px) 24px clamp(32px, 5vw, 56px);
          background: var(--mood-gradient);
          transition: background 0.6s ease;
          position: relative;
          overflow: hidden;
        }
        .mood-hero::before {
          content: "";
          position: absolute; inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent, transparent 2px,
            rgba(128,120,100,0.04) 2px, rgba(128,120,100,0.04) 4px
          );
          pointer-events: none;
        }
        .mood-hero-eyebrow {
          font-family: var(--font-space), monospace;
          font-size: 0.6rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--mood-color);
          margin-bottom: 14px;
          opacity: 0.8;
        }
        .mood-hero-glyph {
          font-size: clamp(2.5rem, 6vw, 4rem);
          display: block;
          margin-bottom: 12px;
          filter: drop-shadow(0 0 20px var(--mood-color));
          transition: filter 0.5s ease;
        }
        .mood-hero-title {
          font-family: var(--font-cinzel), serif;
          font-size: clamp(2.2rem, 7vw, 5rem);
          font-weight: 900;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-primary);
          margin-bottom: 14px;
          line-height: 1;
          text-shadow: 0 0 40px var(--mood-color);
          transition: text-shadow 0.5s ease, color 0.4s ease;
        }
        .mood-hero-title em {
          color: var(--mood-color);
          font-style: normal;
          transition: color 0.4s ease;
        }
        .mood-hero-desc {
          font-family: var(--font-cormorant), serif;
          font-size: clamp(1.1rem, 2.5vw, 1.5rem);
          color: var(--text-muted);
          max-width: 480px;
          margin: 0 auto;
          font-style: italic;
          line-height: 1.6;
        }
        .mood-hero-vibe {
          margin-top: 12px;
          font-family: var(--font-space), monospace;
          font-size: 0.58rem;
          letter-spacing: 0.15em;
          color: var(--mood-color);
          opacity: 0.75;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.6;
        }
        .mood-count {
          margin-top: 16px;
          font-family: var(--font-space), monospace;
          font-size: 0.58rem;
          letter-spacing: 0.2em;
          color: var(--mood-color);
          opacity: 0.7;
        }
        /* Quiz CTA button in hero */
        .mood-quiz-cta {
          margin-top: 24px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 28px;
          border: 1px solid var(--mood-color);
          background: transparent;
          color: var(--text-primary);
          font-family: var(--font-space), monospace;
          font-size: 0.6rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.22s;
          border-radius: 4px;
        }
        .mood-quiz-cta:hover {
          background: var(--mood-color);
          color: #fff;
        }

        /* ── Quiz Modal ── */
        .quiz-overlay {
          position: fixed; inset: 0; z-index: 9000;
          background: rgba(0,0,0,0.9);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          backdrop-filter: blur(8px);
          animation: quizFadeIn 0.25s ease;
        }
        @keyframes quizFadeIn { from { opacity: 0 } to { opacity: 1 } }

        .quiz-panel {
          background: var(--bg-secondary, #12121c);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          max-width: 580px;
          width: 100%;
          max-height: 88vh;
          overflow-y: auto;
          box-shadow: 0 32px 80px rgba(0,0,0,0.7);
          padding: 40px;
          position: relative;
        }
        [data-theme="fog"] .quiz-panel {
          background: #dde0e5;
          border-color: rgba(74,84,96,0.2);
          box-shadow: 0 32px 80px rgba(0,0,0,0.2);
        }

        .quiz-close {
          position: absolute; top: 16px; right: 16px;
          width: 32px; height: 32px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 50%;
          color: #aaa; font-size: 1rem;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: background 0.2s;
        }
        .quiz-close:hover { background: rgba(255,255,255,0.14); color: #fff; }

        .quiz-progress {
          display: flex; gap: 6px; margin-bottom: 32px;
        }
        .quiz-prog-dot {
          height: 3px; flex: 1; border-radius: 2px;
          background: rgba(255,255,255,0.1);
          transition: background 0.3s;
        }
        [data-theme="fog"] .quiz-prog-dot { background: rgba(74,84,96,0.2); }
        .quiz-prog-dot--done { background: var(--qmood-color, #c0001a); }
        .quiz-prog-dot--active { background: var(--qmood-color, #c0001a); opacity: 0.5; }

        .quiz-step-label {
          font-family: var(--font-space), monospace;
          font-size: 0.5rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--qmood-color, #c0001a);
          margin-bottom: 10px;
          opacity: 0.8;
        }
        .quiz-question {
          font-family: var(--font-cinzel), serif;
          font-size: clamp(1.1rem, 3vw, 1.5rem);
          font-weight: 700;
          color: var(--text-primary, #f0ecff);
          line-height: 1.35;
          margin-bottom: 28px;
        }
        .quiz-options {
          display: flex; flex-direction: column; gap: 10px;
        }
        .quiz-option {
          padding: 16px 20px;
          border: 1px solid rgba(255,255,255,0.08);
          background: transparent;
          color: var(--text-muted, #8a8099);
          font-family: var(--font-cormorant), serif;
          font-size: 1.05rem;
          text-align: left;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s;
          line-height: 1.4;
        }
        .quiz-option:hover {
          border-color: var(--qmood-color, #c0001a);
          color: var(--text-primary, #f0ecff);
          background: rgba(192,0,26,0.05);
        }
        [data-theme="fog"] .quiz-option {
          border-color: rgba(74,84,96,0.2);
          color: #4a5460;
        }
        [data-theme="fog"] .quiz-option:hover {
          border-color: #c0001a;
          color: #12181e;
          background: rgba(192,0,26,0.04);
        }

        /* ── Quiz Result ── */
        .quiz-result {
          text-align: center;
        }
        .quiz-result-eyebrow {
          font-family: var(--font-space), monospace;
          font-size: 0.55rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--qmood-color, #c0001a);
          margin-bottom: 12px;
          opacity: 0.8;
        }
        .quiz-result-glyph {
          font-size: 3.5rem;
          display: block;
          margin-bottom: 8px;
          filter: drop-shadow(0 0 16px var(--qmood-color, #c0001a));
        }
        .quiz-result-mood {
          font-family: var(--font-cinzel), serif;
          font-size: clamp(1.8rem, 5vw, 2.8rem);
          font-weight: 900;
          text-transform: uppercase;
          color: var(--qmood-color, #c0001a);
          letter-spacing: 0.08em;
          margin-bottom: 8px;
        }
        .quiz-result-desc {
          font-family: var(--font-cormorant), serif;
          font-size: 1.15rem;
          color: var(--text-muted, #8a8099);
          font-style: italic;
          line-height: 1.6;
          max-width: 400px;
          margin: 0 auto 16px;
        }
        .quiz-result-vibe {
          font-family: var(--font-space), monospace;
          font-size: 0.55rem;
          letter-spacing: 0.12em;
          color: var(--qmood-color, #c0001a);
          opacity: 0.7;
          line-height: 1.7;
          max-width: 400px;
          margin: 0 auto 24px;
        }
        .quiz-result-img-wrap {
          width: 140px;
          aspect-ratio: 9/16;
          margin: 0 auto 24px;
          border-radius: 12px;
          overflow: hidden;
          border: 2px solid var(--qmood-color, #c0001a);
          position: relative;
          box-shadow: 0 0 40px rgba(0,0,0,0.5);
        }
        .quiz-result-actions {
          display: flex; flex-direction: column; gap: 10px; align-items: center;
        }
        .quiz-result-btn-primary {
          padding: 14px 32px;
          background: var(--qmood-color, #c0001a);
          border: none;
          color: #fff;
          font-family: var(--font-space), monospace;
          font-size: 0.62rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          cursor: pointer;
          border-radius: 6px;
          transition: opacity 0.2s;
          width: 100%;
          max-width: 320px;
        }
        .quiz-result-btn-primary:hover { opacity: 0.85; }
        .quiz-result-btn-secondary {
          padding: 10px 24px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.15);
          color: var(--text-muted, #8a8099);
          font-family: var(--font-space), monospace;
          font-size: 0.58rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s;
          width: 100%;
          max-width: 320px;
        }
        .quiz-result-btn-secondary:hover { border-color: rgba(255,255,255,0.3); color: var(--text-primary, #f0ecff); }
        [data-theme="fog"] .quiz-result-btn-secondary { border-color: rgba(74,84,96,0.3); color: #4a5460; }

        /* ── Selector strip ── */
        .mood-selector {
          display: flex;
          justify-content: center;
          gap: 6px;
          flex-wrap: wrap;
          padding: 24px 20px;
          position: sticky;
          top: 60px;
          z-index: 40;
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border-dim);
        }
        .mood-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 9px 16px;
          border: 1px solid var(--border-dim);
          background: transparent;
          color: var(--text-muted);
          font-family: var(--font-space), monospace;
          font-size: 0.6rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.22s ease;
          border-radius: 4px;
          position: relative;
          overflow: hidden;
        }
        .mood-btn::before {
          content: "";
          position: absolute; inset: 0;
          background: var(--btn-color);
          opacity: 0;
          transition: opacity 0.22s;
        }
        .mood-btn:hover::before { opacity: 0.07; }
        .mood-btn:hover {
          color: var(--text-primary);
          border-color: var(--btn-color);
        }
        .mood-btn--active {
          border-color: var(--btn-color) !important;
          color: var(--text-primary) !important;
          background: transparent !important;
          box-shadow: inset 0 0 0 1px var(--btn-color);
        }
        .mood-btn--active::before { opacity: 0.10 !important; }
        .mood-btn-glyph { font-size: 0.95rem; line-height: 1; }
        .mood-btn-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: var(--btn-color);
          flex-shrink: 0;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .mood-btn--active .mood-btn-dot { opacity: 1; }

        /* ── Grid section ── */
        .mood-grid-section {
          max-width: 1400px;
          margin: 0 auto;
          padding: 36px 20px 60px;
        }
        .mood-grid-header {
          display: flex;
          align-items: baseline;
          gap: 12px;
          margin-bottom: 24px;
        }
        .mood-grid-heading {
          font-family: var(--font-space), monospace;
          font-size: 0.6rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--mood-color);
        }
        .mood-grid-count {
          font-size: 0.55rem;
          font-family: var(--font-space), monospace;
          color: var(--text-muted);
          letter-spacing: 0.15em;
        }

        .mood-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 10px;
        }
        @media (min-width: 480px)  { .mood-grid { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); } }
        @media (min-width: 640px)  { .mood-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); } }
        @media (min-width: 1024px) { .mood-grid { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; } }

        /* ── Mood card ── */
        .mood-card {
          position: relative;
          aspect-ratio: 9/16;
          overflow: hidden;
          border: 1px solid var(--border-dim);
          cursor: pointer;
          display: block;
          text-decoration: none;
          background: var(--bg-secondary);
          border-radius: 6px;
          transition: border-color 0.25s ease;
        }
        .mood-card:hover { border-color: var(--mood-color); }
        .mood-card:hover .mood-card-overlay { opacity: 1; }
        .mood-card:hover .mood-card-title   { transform: translateY(0); opacity: 1; }
        .mood-card:hover .mood-card-preview { opacity: 1; transform: translateY(0); }
        .mood-card:hover img                { transform: scale(1.05); }

        .mood-card img {
          transition: transform 0.4s ease;
          object-fit: cover;
        }
        .mood-card-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 55%);
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 2;
        }
        .mood-card-title {
          position: absolute;
          bottom: 10px; left: 10px; right: 10px;
          z-index: 3;
          font-family: var(--font-cormorant), serif;
          font-size: 0.82rem;
          color: #e8e4f5;
          line-height: 1.3;
          transform: translateY(6px);
          opacity: 0;
          transition: transform 0.3s ease, opacity 0.3s ease;
          text-shadow: 0 1px 6px rgba(0,0,0,0.9);
        }
        .mood-card-device {
          position: absolute;
          top: 8px; right: 8px; z-index: 3;
          font-family: var(--font-space), monospace;
          font-size: 0.45rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--mood-color);
          background: rgba(0,0,0,0.65);
          padding: 2px 6px;
          border-radius: 2px;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .mood-card:hover .mood-card-device { opacity: 1; }

        /* Preview button on card */
        .mood-card-preview {
          position: absolute;
          top: 8px; left: 8px; z-index: 4;
          padding: 4px 9px;
          background: rgba(0,0,0,0.72);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 3px;
          color: #fff;
          font-family: var(--font-space), monospace;
          font-size: 0.44rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          opacity: 0;
          transform: translateY(-4px);
          transition: opacity 0.22s ease, transform 0.22s ease, background 0.2s;
          backdrop-filter: blur(4px);
        }
        .mood-card-preview:hover { background: rgba(160,24,24,0.8); }

        /* ── Empty state ── */
        .mood-empty {
          text-align: center;
          padding: 80px 24px;
          grid-column: 1/-1;
        }
        .mood-empty-glyph { font-size: 3rem; margin-bottom: 16px; opacity: 0.4; }
        .mood-empty-title {
          font-family: var(--font-cinzel), serif;
          font-size: 1.2rem;
          color: var(--text-muted);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .mood-empty-desc {
          font-family: var(--font-space), monospace;
          font-size: 0.62rem;
          color: var(--text-muted);
          letter-spacing: 0.12em;
          opacity: 0.6;
        }
        .mood-empty-tags {
          margin-top: 20px;
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          justify-content: center;
        }
        .mood-empty-tag {
          font-family: var(--font-space), monospace;
          font-size: 0.55rem;
          padding: 3px 10px;
          border: 1px solid var(--border-dim);
          color: var(--text-muted);
          letter-spacing: 0.1em;
          border-radius: 2px;
        }

        /* ── Load more ── */
        .mood-load-more {
          display: block;
          margin: 36px auto 0;
          padding: 14px 40px;
          border: 1px solid var(--border-dim);
          background: transparent;
          color: var(--text-muted);
          font-family: var(--font-space), monospace;
          font-size: 0.62rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 4px;
        }
        .mood-load-more:hover {
          border-color: var(--mood-color);
          color: var(--text-primary);
          background: rgba(128,128,128,0.04);
        }

        /* ── Tags hint ── */
        .mood-tags-hint {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px 48px;
          border-top: 1px solid var(--border-dim);
          padding-top: 24px;
        }
        .mood-tags-hint-title {
          font-family: var(--font-space), monospace;
          font-size: 0.55rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 10px;
          opacity: 0.5;
        }
        .mood-tag-pill {
          display: inline-block;
          font-family: var(--font-space), monospace;
          font-size: 0.52rem;
          padding: 3px 10px;
          border: 1px solid var(--border-dim);
          color: var(--text-muted);
          letter-spacing: 0.1em;
          margin: 3px;
          border-radius: 2px;
          opacity: 0.6;
        }
      `}</style>

      {preview && (
        <LockScreenPreviewModal
          src={preview.src}
          title={preview.title}
          onClose={() => setPreview(null)}
        />
      )}

      {/* ── Quiz Modal ── */}
      {showQuiz && (
        <div className="quiz-overlay" onClick={resetQuiz}
          style={{ ["--qmood-color" as string]: activeMood.color }}>
          <div className="quiz-panel" onClick={e => e.stopPropagation()}>
            <button className="quiz-close" onClick={resetQuiz} aria-label="Close">✕</button>

            {quizResult ? (
              /* ── Result screen ── */
              (() => {
                const rMood = moods.find(m => m.id === quizResult)!;
                const rDesc = MOOD_DESCRIPTIONS[quizResult];
                return (
                  <div className="quiz-result"
                    style={{ ["--qmood-color" as string]: rMood.color }}>
                    <p className="quiz-result-eyebrow">Your mood is</p>
                    <span className="quiz-result-glyph">{rMood.glyph}</span>
                    <h2 className="quiz-result-mood">{rMood.label}</h2>
                    <p className="quiz-result-desc">{rMood.desc}</p>
                    {rDesc && (
                      <p className="quiz-result-vibe">{rDesc.vibe}</p>
                    )}
                    {quizResultImg && (
                      <div className="quiz-result-img-wrap">
                        <Image
                          src={quizResultImg.url}
                          alt={quizResultImg.title}
                          fill unoptimized
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                    )}
                    <div className="quiz-result-actions">
                      <button className="quiz-result-btn-primary"
                        onClick={() => applyQuizResult(quizResult)}>
                        See all {rMood.label} wallpapers
                      </button>
                      {quizResultImg && (
                        <button className="quiz-result-btn-secondary"
                          onClick={() => {
                            resetQuiz();
                            setPreview({ src: quizResultImg.url, title: quizResultImg.title });
                          }}>
                          📱 Preview this on your phone
                        </button>
                      )}
                      <button className="quiz-result-btn-secondary" onClick={() => {
                        setQuizStep(0);
                        setQuizAnswers({});
                        setQuizResult(null);
                        setQuizResultImg(null);
                      }}>
                        Retake the quiz
                      </button>
                    </div>
                  </div>
                );
              })()
            ) : (
              /* ── Question screen ── */
              <>
                <div className="quiz-progress">
                  {QUIZ_QUESTIONS.map((q, i) => (
                    <div key={q.id} className={`quiz-prog-dot${
                      i < quizStep ? " quiz-prog-dot--done"
                      : i === quizStep ? " quiz-prog-dot--active"
                      : ""
                    }`} />
                  ))}
                </div>
                <p className="quiz-step-label">
                  Question {quizStep + 1} of {QUIZ_QUESTIONS.length}
                </p>
                <h2 className="quiz-question">
                  {QUIZ_QUESTIONS[quizStep].question}
                </h2>
                <div className="quiz-options">
                  {QUIZ_QUESTIONS[quizStep].options.map((opt, i) => (
                    <button
                      key={i}
                      className="quiz-option"
                      onClick={() => handleQuizAnswer(opt)}
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div
        className="mood-page"
        style={{
          ["--mood-color"    as string]: activeMood.color,
          ["--mood-gradient" as string]: activeMood.gradient,
        }}
      >
        {/* ── Hero ── */}
        <div className="mood-hero">
          <p className="mood-hero-eyebrow">Find Your Vibe</p>
          <span className="mood-hero-glyph">{activeMood.glyph}</span>
          <h1 className="mood-hero-title">
            I Feel <em>{activeMood.label}</em>
          </h1>
          <p className="mood-hero-desc">{activeMood.desc}</p>
          {MOOD_DESCRIPTIONS[active] && (
            <p className="mood-hero-vibe">
              {MOOD_DESCRIPTIONS[active].vibe}
            </p>
          )}
          <p className="mood-count">
            {allImages.length > 0
              ? `${allImages.length} wallpaper${allImages.length !== 1 ? "s" : ""} match this mood`
              : "No wallpapers yet — add tags in admin panel"}
          </p>
          <button className="mood-quiz-cta" onClick={() => setShowQuiz(true)}>
            ✦ Not sure? Take the mood quiz
          </button>
        </div>

        {/* ── Mood selector ── */}
        <div className="mood-selector">
          {moods.map((mood) => (
            <button
              key={mood.id}
              className={`mood-btn${active === mood.id ? " mood-btn--active" : ""}`}
              style={{ ["--btn-color" as string]: mood.color }}
              onClick={() => switchMood(mood.id)}
              title={MOOD_DESCRIPTIONS[mood.id]?.vibe ?? mood.desc}
            >
              <span className="mood-btn-glyph">{mood.glyph}</span>
              {mood.label}
              <span className="mood-btn-dot" />
            </button>
          ))}
        </div>

        {/* ── Grid ── */}
        <section className="mood-grid-section" ref={gridRef}>
          <div className="mood-grid-header">
            <span className="mood-grid-heading">
              {activeMood.glyph} {activeMood.label} Wallpapers
            </span>
            {allImages.length > 0 && (
              <span className="mood-grid-count">— {allImages.length} found</span>
            )}
          </div>

          <div className="mood-grid" key={animKey}>
            {shownImages.length > 0 ? (
              shownImages.map((img) => (
                <Link
                  key={img.id}
                  href={devicePath(img)}
                  className="mood-card"
                >
                  <Image
                    src={img.url}
                    alt={img.title}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
                    style={{ objectFit: "cover" }}
                  />
                  <div className="mood-card-overlay" />
                  <span className="mood-card-device">{img.deviceType ?? ""}</span>
                  <span className="mood-card-title">{img.title}</span>
                  {/* Preview button */}
                  <button
                    className="mood-card-preview"
                    onClick={(e) => openPreview(e, img)}
                    aria-label="Preview on lock screen"
                    tabIndex={-1}
                  >
                    📱 Preview
                  </button>
                </Link>
              ))
            ) : (
              <div className="mood-empty">
                <div className="mood-empty-glyph">{activeMood.glyph}</div>
                <p className="mood-empty-title">No wallpapers tagged yet</p>
                <p className="mood-empty-desc">
                  Add these tags to your images in the admin panel:
                </p>
                <div className="mood-empty-tags">
                  {activeMood.tags.map((t) => (
                    <span key={t} className="mood-empty-tag">{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {hasMore && (
            <button
              className="mood-load-more"
              onClick={() => setVisible((v) => v + 12)}
            >
              Show more {activeMood.label.toLowerCase()} wallpapers
            </button>
          )}
        </section>

        {/* ── Tag hint ── */}
        <div className="mood-tags-hint">
          <p className="mood-tags-hint-title">
            Tags that trigger &quot;{activeMood.label}&quot; mood:
          </p>
          {activeMood.tags.map((t) => (
            <span key={t} className="mood-tag-pill">{t}</span>
          ))}
        </div>
      </div>
    </>
  );
}