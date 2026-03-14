// components/HeroMosaic.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from "react";

// ─── Season definitions ───────────────────────────────────────────────────────

const SEASONS = [
  {
    id:    "halloween",
    href:  "/halloween",
    label: "Halloween",
    sub:   "Ritual Season",
    bg:    "linear-gradient(135deg, #1a0820 0%, #3d0a3a 30%, #0e0820 60%, #1a0010 100%)",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="mosaic-svg-icon">
        <circle cx="32" cy="28" r="18" stroke="#c9a84c" strokeWidth="1.5" fill="none" opacity="0.6"/>
        <ellipse cx="32" cy="48" rx="14" ry="5" stroke="#c9a84c" strokeWidth="1.2" fill="none" opacity="0.4"/>
        <circle cx="25" cy="25" r="3" fill="#c0001a" opacity="0.9"/>
        <circle cx="39" cy="25" r="3" fill="#c0001a" opacity="0.9"/>
        <path d="M26 34 Q32 39 38 34" stroke="#c9a84c" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M28 34 L27 37 M32 35 L32 38 M36 34 L37 37" stroke="#c9a84c" strokeWidth="1" strokeLinecap="round" opacity="0.7"/>
        <path d="M14 28 Q10 22 16 18 Q12 14 20 16" stroke="#c0001a" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.6"/>
        <path d="M50 28 Q54 22 48 18 Q52 14 44 16" stroke="#c0001a" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.6"/>
      </svg>
    ),
  },
  {
    id:    "dark-valentine",
    href:  "/dark-valentine",
    label: "Dark Valentine",
    sub:   "Bleeding Hearts",
    bg:    "linear-gradient(225deg, #1a0808 0%, #3a0a14 30%, #200810 100%)",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="mosaic-svg-icon">
        <path d="M32 50 L10 30 Q6 20 16 16 Q24 13 32 22 Q40 13 48 16 Q58 20 54 30 Z" stroke="#c0001a" strokeWidth="1.5" fill="rgba(192,0,26,0.15)" strokeLinejoin="round"/>
        <path d="M32 50 L32 22" stroke="#c0001a" strokeWidth="0.8" opacity="0.4"/>
        <path d="M28 28 Q32 24 36 28" stroke="#c9a84c" strokeWidth="1" fill="none" opacity="0.7"/>
        <circle cx="32" cy="38" r="2" fill="#c0001a" opacity="0.8"/>
        <path d="M30 44 Q32 46 34 44" stroke="#c0001a" strokeWidth="1" fill="none" opacity="0.6"/>
        <path d="M26 16 Q24 10 28 8 M38 16 Q40 10 36 8" stroke="#c9a84c" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
      </svg>
    ),
  },
  {
    id:    "day-of-the-dead",
    href:  "/day-of-the-dead",
    label: "Day of the Dead",
    sub:   "Día de Muertos",
    bg:    "linear-gradient(45deg, #0a1a08 0%, #1a3010 40%, #081408 100%)",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="mosaic-svg-icon">
        <ellipse cx="32" cy="26" rx="14" ry="16" stroke="#c9a84c" strokeWidth="1.5" fill="none" opacity="0.7"/>
        <ellipse cx="32" cy="40" rx="10" ry="6" stroke="#c9a84c" strokeWidth="1.2" fill="none" opacity="0.5"/>
        <rect x="27" y="42" width="3" height="4" rx="0.5" fill="#c9a84c" opacity="0.6"/>
        <rect x="31.5" y="42" width="3" height="4" rx="0.5" fill="#c9a84c" opacity="0.6"/>
        <ellipse cx="25" cy="24" rx="4" ry="4.5" stroke="#c0001a" strokeWidth="1.2" fill="rgba(192,0,26,0.1)"/>
        <ellipse cx="39" cy="24" rx="4" ry="4.5" stroke="#c0001a" strokeWidth="1.2" fill="rgba(192,0,26,0.1)"/>
        <path d="M28 34 Q32 37 36 34" stroke="#c9a84c" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        <circle cx="32" cy="30" r="1.5" fill="#c9a84c" opacity="0.8"/>
        <path d="M20 18 Q18 12 22 10 M44 18 Q46 12 42 10" stroke="#c9a84c" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
        <circle cx="25" cy="24" r="1.5" fill="#c0001a" opacity="0.9"/>
        <circle cx="39" cy="24" r="1.5" fill="#c0001a" opacity="0.9"/>
      </svg>
    ),
  },
  {
    id:    "blood-moon",
    href:  "/blood-moon",
    label: "Blood Moon",
    sub:   "Lunar Omen",
    bg:    "linear-gradient(180deg, #1a0808 0%, #2a0000 50%, #0e0000 100%)",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="mosaic-svg-icon">
        <circle cx="32" cy="32" r="18" stroke="#c0001a" strokeWidth="1.5" fill="rgba(192,0,26,0.1)" opacity="0.9"/>
        <circle cx="32" cy="32" r="14" stroke="#c9a84c" strokeWidth="0.8" fill="none" opacity="0.3"/>
        <path d="M32 14 Q38 20 36 28 Q44 26 50 32 Q44 38 36 36 Q38 44 32 50 Q26 44 28 36 Q20 38 14 32 Q20 26 28 28 Q26 20 32 14Z" stroke="#c0001a" strokeWidth="1" fill="rgba(192,0,26,0.08)" opacity="0.7"/>
        <circle cx="32" cy="32" r="4" fill="#c0001a" opacity="0.6"/>
        <circle cx="32" cy="32" r="2" fill="#c9a84c" opacity="0.8"/>
        {[0,45,90,135,180,225,270,315].map((deg, i) => (
          <line key={i}
            x1={32 + 20 * Math.cos((deg * Math.PI) / 180)}
            y1={32 + 20 * Math.sin((deg * Math.PI) / 180)}
            x2={32 + 24 * Math.cos((deg * Math.PI) / 180)}
            y2={32 + 24 * Math.sin((deg * Math.PI) / 180)}
            stroke="#c0001a" strokeWidth="1" opacity="0.4"
          />
        ))}
      </svg>
    ),
  },
  {
    id:    "haunted-christmas",
    href:  "/haunted-christmas",
    label: "Haunted Christmas",
    sub:   "Dark Yule",
    bg:    "linear-gradient(135deg, #080e08 0%, #0a1e10 40%, #061206 100%)",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="mosaic-svg-icon">
        <polygon points="32,8 44,28 20,28" stroke="#c9a84c" strokeWidth="1.5" fill="rgba(201,168,76,0.06)" strokeLinejoin="round"/>
        <polygon points="32,18 46,40 18,40" stroke="#c9a84c" strokeWidth="1.3" fill="rgba(201,168,76,0.06)" strokeLinejoin="round"/>
        <rect x="27" y="40" width="10" height="8" rx="1" stroke="#c9a84c" strokeWidth="1.2" fill="none" opacity="0.5"/>
        <circle cx="26" cy="32" r="2" fill="#c0001a" opacity="0.8"/>
        <circle cx="38" cy="28" r="2" fill="#c0001a" opacity="0.8"/>
        <circle cx="33" cy="36" r="2" fill="#c0001a" opacity="0.8"/>
        <circle cx="32" cy="8" r="2.5" fill="#c9a84c" opacity="0.9"/>
        <path d="M28 8 Q26 4 30 3 M36 8 Q38 4 34 3" stroke="#c9a84c" strokeWidth="0.8" strokeLinecap="round" opacity="0.5"/>
      </svg>
    ),
  },
  {
    id:    "black-easter",
    href:  "/black-easter",
    label: "Black Easter",
    sub:   "Dark Resurrection",
    bg:    "linear-gradient(135deg, #0a0808 0%, #1a100a 40%, #0e0808 100%)",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="mosaic-svg-icon">
        <ellipse cx="32" cy="34" rx="14" ry="18" stroke="#c9a84c" strokeWidth="1.5" fill="none" opacity="0.6"/>
        <ellipse cx="32" cy="34" rx="9" ry="13" stroke="#c0001a" strokeWidth="0.8" fill="none" opacity="0.3"/>
        <path d="M24 26 Q32 22 40 26" stroke="#c9a84c" strokeWidth="1" fill="none" opacity="0.5" strokeLinecap="round"/>
        <path d="M22 34 Q32 30 42 34" stroke="#c9a84c" strokeWidth="1" fill="none" opacity="0.5" strokeLinecap="round"/>
        <path d="M24 42 Q32 38 40 42" stroke="#c9a84c" strokeWidth="1" fill="none" opacity="0.5" strokeLinecap="round"/>
        <circle cx="32" cy="16" r="3" fill="#c9a84c" opacity="0.7"/>
        <path d="M32 13 L32 8 M29 10 L35 10" stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
        <circle cx="32" cy="34" r="3" fill="#c0001a" opacity="0.5"/>
      </svg>
    ),
  },
];

// ─── Slot background classes — maps slot index to CSS class ──────────────────
const SLOT_CLASSES = ["m1", "m2", "m3", "m4"] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export default function HeroMosaic() {
  const [offset, setOffset]     = useState(0);
  const [visible, setVisible]   = useState(true);   // drives the CSS transition
  const pausedRef               = useRef(false);
  const intervalRef             = useRef<ReturnType<typeof setInterval> | null>(null);

  // Returns the 4 seasons currently in view based on offset
  const visibleSeasons = SEASONS.slice(offset, offset + 4).concat(
    SEASONS.slice(0, Math.max(0, (offset + 4) - SEASONS.length))
  );

  const rotate = useCallback(() => {
    if (pausedRef.current) return;

    // 1. Fade out
    setVisible(false);

    // 2. After fade-out completes, advance offset and fade back in
    setTimeout(() => {
      setOffset(prev => (prev + 1) % SEASONS.length);
      setVisible(true);
    }, 420); // matches the CSS transition duration
  }, []);

  // Start interval on mount
  useEffect(() => {
    intervalRef.current = setInterval(rotate, 6000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [rotate]);

  const handleMouseEnter = () => { pausedRef.current = true; };
  const handleMouseLeave = () => { pausedRef.current = false; };

  return (
    <div className="hero-mosaic">
      {visibleSeasons.map((season, slotIndex) => (
        <a
          key={`${season.id}-${slotIndex}`}
          href={season.href}
          className={`mosaic-card ${SLOT_CLASSES[slotIndex]} mosaic-card--animated`}
          style={{
            background: season.bg,
            opacity:    visible ? 1 : 0,
            transform:  visible ? "translateY(0) scale(1)" : "translateY(12px) scale(0.98)",
            transition: `opacity 0.4s ease ${slotIndex * 0.07}s, transform 0.4s cubic-bezier(0.16,1,0.3,1) ${slotIndex * 0.07}s`,
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="mosaic-icon">{season.icon}</div>
          <div className="mosaic-labels">
            <span className="mosaic-sub">{season.sub}</span>
            <span className="mosaic-label">{season.label}</span>
          </div>
          <div className="mosaic-hover-bar" />

          {slotIndex === 3 && (
            <div className="mosaic-dots" aria-hidden="true">
              {SEASONS.map((_, i) => (
                <span
                  key={i}
                  className={`mosaic-dot${
                    SEASONS[(offset + slotIndex) % SEASONS.length].id === SEASONS[i].id
                      ? " mosaic-dot--active"
                      : ""
                  }`}
                />
              ))}
            </div>
          )}
        </a>
      ))}
    </div>
  );
}