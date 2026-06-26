// app/mood/MoodClient.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { MoodId, MoodImage } from "./moods";
import { MOODS } from "./moods";

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
  // "ritual" removed from keywords to match tags change in moods.ts
  obsessed:   { vibe: "One thought on repeat. Can't stop. Won't stop.", example: "Spirals, fractals, hypnotic loops, glitch art.", keywords: ["spiral", "hypnotic", "loop"] },
  cold:       { vibe: "Frozen inside. No warmth. No apologies.", example: "Ice, frost, winter wastelands, blizzard, pale light.", keywords: ["ice", "frost", "winter", "frozen"] },
  // violent entry removed
  dreaming:   { vibe: "Half asleep. Reality blurring at the edges.", example: "Cosmic nebulas, surreal vistas, psychedelic dreamscapes.", keywords: ["cosmic", "galaxy", "surreal", "ethereal"] },
  isolated:   { vibe: "Alone is different from lonely. This is both.", example: "Abandoned ruins, empty deserts, post-apocalyptic.", keywords: ["abandoned", "ruin", "desolate", "alone"] },
  feral:      { vibe: "Primal. Hungry. Something behind your eyes just woke up.", example: "Wolves, predators, wild creatures, hunt.", keywords: ["wolf", "predator", "beast", "primal"] },
  glitching:  { vibe: "Reality is buffering. Error. Error. Rebooting.", example: "Digital corruption, cyber art, neon glitch, matrix.", keywords: ["glitch", "digital", "cyber", "neon"] },
  // sinister: vibe updated — "Ancient. Vast…" moved to mythic; sinister keeps its own distinct vibe
  sinister:   { vibe: "Everything is fine. That's the problem.", example: "Clowns, masks, uncanny smiles, wrong-feeling art.", keywords: ["villain", "evil", "clown", "mask"] },
  // mythic: updated to match new moods.ts desc, no nat/religious words
  mythic:     { vibe: "Ancient. Vast. You're not the main character here.", example: "Dragons, titans, eldritch beasts, legendary creatures.", keywords: ["dragon", "titan", "ancient", "legendary"] },
};

// ── Quiz questions → mood scoring ──────────────────────────────────────────
// violent removed from all option arrays
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
      { text: "Low, deep bass that shakes the floor.", moods: ["powerful", "aggressive"] },
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
      { text: "They feel my energy whether they want to or not.", moods: ["powerful", "aggressive"] },
      { text: "I'm somewhere else entirely. They barely register.", moods: ["dreaming", "quiet", "obsessed"] },
    ],
  },
  {
    id: "q6",
    question: "One word for where you are right now:",
    options: [
      { text: "Fractured", moods: ["glitching", "aggressive"] },
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
      const resultMoodId = scoreMoods(newAnswers);
      setQuizResult(resultMoodId);
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
                    {/* only render glyph if non-empty */}
                    {rMood.glyph && (
                      <span className="quiz-result-glyph">{rMood.glyph}</span>
                    )}
                    <h2 className="quiz-result-mood">{rMood.label}</h2>
                    <p className="quiz-result-desc">{rMood.desc}</p>
                    {/* only show vibe if it differs from desc to avoid duplication */}
                    {rDesc && rDesc.vibe !== rMood.desc && (
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
          {/* only render glyph if non-empty (isolated has no glyph) */}
          {activeMood.glyph && (
            <span className="mood-hero-glyph">{activeMood.glyph}</span>
          )}
          <h1 className="mood-hero-title">
            I Feel <em>{activeMood.label}</em>
          </h1>
          <p className="mood-hero-desc">{activeMood.desc}</p>
          {/* only show vibe line if it differs from desc — prevents sinister double tagline */}
          {MOOD_DESCRIPTIONS[active] && MOOD_DESCRIPTIONS[active].vibe !== activeMood.desc && (
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
              {/* only render glyph span if non-empty — isolated shows label only */}
              {mood.glyph && (
                <span className="mood-btn-glyph">{mood.glyph}</span>
              )}
              {mood.label}
              <span className="mood-btn-dot" />
            </button>
          ))}
        </div>

        {/* ── Grid ── */}
        <section className="mood-grid-section" ref={gridRef}>
          <div className="mood-grid-header">
            <span className="mood-grid-heading">
              {activeMood.glyph && `${activeMood.glyph} `}{activeMood.label} Wallpapers
            </span>
            {allImages.length > 0 && (
              <span className="mood-grid-count">— {allImages.length} found</span>
            )}
          </div>

          <div className="mood-grid" key={animKey}>
            {shownImages.length > 0 ? (
              shownImages.map((img) => (
                <Link prefetch={false}
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

        {/* ── Tag hint — hidden for sinister (no tags) ── */}
        {activeMood.tags.length > 0 && (
          <div className="mood-tags-hint">
            <p className="mood-tags-hint-title">
              Tags that trigger &quot;{activeMood.label}&quot; mood:
            </p>
            {activeMood.tags.map((t) => (
              <span key={t} className="mood-tag-pill">{t}</span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}