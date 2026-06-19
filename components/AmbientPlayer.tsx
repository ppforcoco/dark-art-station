"use client";
import { useState, useRef, useEffect, useCallback } from "react";

export default function AmbientPlayer() {
  const [playing, setPlaying]   = useState(false);
  const [visible, setVisible]   = useState(false);
  const [volume,  setVolume]    = useState(0.5);
  const [expanded, setExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const audio = new Audio("/audio/haunted-town.mp3");
    audio.loop   = true;
    audio.volume = 0;
    audioRef.current = audio;

    // Show player after 2 s
    const t = setTimeout(() => setVisible(true), 2000);

    // Restore pref
    try {
      const pref = localStorage.getItem("hw-ambient");
      if (pref === "on") {
        audio.play().then(() => {
          setPlaying(true);
          fadeTo(audio, 0.5, 1500);
        }).catch(() => {});
      }
    } catch {}

    return () => {
      clearTimeout(t);
      audio.pause();
      audio.src = "";
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function fadeTo(audio: HTMLAudioElement, target: number, ms: number) {
    if (fadeRef.current) clearInterval(fadeRef.current);
    const steps = 30;
    const interval = ms / steps;
    const delta = (target - audio.volume) / steps;
    let step = 0;
    fadeRef.current = setInterval(() => {
      step++;
      audio.volume = Math.min(1, Math.max(0, audio.volume + delta));
      if (step >= steps) {
        clearInterval(fadeRef.current!);
        audio.volume = target;
      }
    }, interval);
  }

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      fadeTo(audio, 0, 800);
      setTimeout(() => { audio.pause(); }, 850);
      setPlaying(false);
      try { localStorage.setItem("hw-ambient", "off"); } catch {}
    } else {
      audio.play().then(() => {
        setPlaying(true);
        fadeTo(audio, volume, 1200);
        try { localStorage.setItem("hw-ambient", "on"); } catch {}
      }).catch(() => {});
    }
  }, [playing, volume]);

  const handleVolume = useCallback((v: number) => {
    setVolume(v);
    const audio = audioRef.current;
    if (audio && playing) audio.volume = v;
  }, [playing]);

  if (!visible) return null;

  return (
    <>
      <style>{`
        .amb-wrap {
          position: fixed;
          bottom: 80px;
          right: 18px;
          z-index: 998;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
          pointer-events: none;
        }
        @media (min-width: 900px) {
          .amb-wrap { bottom: 28px; right: 28px; }
        }

        /* Expanded panel */
        .amb-panel {
          pointer-events: auto;
          background: rgba(8,6,18,0.95);
          border: 1px solid rgba(192,0,26,0.3);
          border-radius: 12px;
          padding: 14px 16px;
          backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04);
          min-width: 200px;
          transform-origin: bottom right;
          animation: amb-in 0.2s ease;
        }
        @keyframes amb-in {
          from { opacity: 0; transform: scale(0.9) translateY(6px); }
          to   { opacity: 1; transform: scale(1)   translateY(0); }
        }
        .amb-panel-title {
          font-family: monospace;
          font-size: 0.48rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #c0001a;
          margin: 0 0 6px;
        }
        .amb-panel-track {
          font-family: monospace;
          font-size: 0.6rem;
          color: #e8e4f8;
          margin: 0 0 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .amb-panel-track .amb-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #c0001a;
          flex-shrink: 0;
          animation: amb-pulse 1.4s ease-in-out infinite;
        }
        @keyframes amb-pulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.4; transform: scale(0.7); }
        }
        .amb-dot--off { background: #3a3452 !important; animation: none !important; }
        .amb-vol-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .amb-vol-icon {
          font-size: 0.75rem;
          flex-shrink: 0;
          color: #6a6080;
        }
        .amb-vol-slider {
          flex: 1;
          -webkit-appearance: none;
          appearance: none;
          height: 3px;
          border-radius: 2px;
          background: rgba(255,255,255,0.1);
          outline: none;
          cursor: pointer;
        }
        .amb-vol-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px; height: 12px;
          border-radius: 50%;
          background: #c0001a;
          cursor: pointer;
        }
        .amb-vol-slider::-moz-range-thumb {
          width: 12px; height: 12px;
          border-radius: 50%;
          background: #c0001a;
          border: none;
          cursor: pointer;
        }

        /* Main button */
        .amb-btn {
          pointer-events: auto;
          width: 46px; height: 46px;
          border-radius: 50%;
          border: 1px solid rgba(192,0,26,0.5);
          background: rgba(8,6,18,0.92);
          backdrop-filter: blur(16px);
          color: #c0001a;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.6), 0 0 12px rgba(192,0,26,0.15);
          transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s;
          position: relative;
        }
        .amb-btn:hover {
          transform: scale(1.08);
          box-shadow: 0 6px 24px rgba(0,0,0,0.7), 0 0 20px rgba(192,0,26,0.3);
          border-color: rgba(192,0,26,0.8);
        }
        .amb-btn--playing {
          border-color: rgba(192,0,26,0.8);
          box-shadow: 0 4px 20px rgba(0,0,0,0.6), 0 0 20px rgba(192,0,26,0.25);
        }
        /* Ripple when playing */
        .amb-btn--playing::before {
          content: "";
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 1px solid rgba(192,0,26,0.3);
          animation: amb-ring 2s ease-out infinite;
        }
        .amb-btn--playing::after {
          content: "";
          position: absolute;
          inset: -14px;
          border-radius: 50%;
          border: 1px solid rgba(192,0,26,0.12);
          animation: amb-ring 2s ease-out 0.6s infinite;
        }
        @keyframes amb-ring {
          0%   { transform: scale(0.9); opacity: 1; }
          100% { transform: scale(1.2); opacity: 0; }
        }

        /* Bars animation (playing indicator inside button) */
        .amb-bars {
          display: flex;
          align-items: flex-end;
          gap: 2px;
          height: 14px;
        }
        .amb-bars span {
          display: block;
          width: 3px;
          background: #c0001a;
          border-radius: 1px;
          animation: amb-bar 0.8s ease-in-out infinite alternate;
        }
        .amb-bars span:nth-child(1) { height: 6px;  animation-delay: 0s; }
        .amb-bars span:nth-child(2) { height: 12px; animation-delay: 0.15s; }
        .amb-bars span:nth-child(3) { height: 8px;  animation-delay: 0.3s; }
        .amb-bars span:nth-child(4) { height: 14px; animation-delay: 0.1s; }
        @keyframes amb-bar {
          from { height: 3px; }
          to   { height: 100%; }
        }
      `}</style>

      <div className="amb-wrap">
        {expanded && (
          <div className="amb-panel">
            <p className="amb-panel-title">Ambient Atmosphere</p>
            <p className="amb-panel-track">
              <span className={`amb-dot${playing ? "" : " amb-dot--off"}`} />
              Haunted Town
            </p>
            <div className="amb-vol-row">
              <span className="amb-vol-icon">🔈</span>
              <input
                type="range"
                min={0} max={1} step={0.01}
                value={volume}
                className="amb-vol-slider"
                onChange={e => handleVolume(Number(e.target.value))}
              />
              <span className="amb-vol-icon">🔊</span>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {/* Volume toggle */}
          <button
            className="amb-btn"
            style={{ width: 36, height: 36, fontSize: "0.9rem", pointerEvents: "auto" }}
            onClick={() => setExpanded(p => !p)}
            title="Settings"
            aria-label="Audio settings"
          >
            {expanded ? "✕" : "⚙"}
          </button>

          {/* Play/Pause */}
          <button
            className={`amb-btn${playing ? " amb-btn--playing" : ""}`}
            onClick={toggle}
            title={playing ? "Pause ambient music" : "Play ambient music"}
            aria-label={playing ? "Pause ambient music" : "Play ambient music"}
          >
            {playing ? (
              <div className="amb-bars">
                <span /><span /><span /><span />
              </div>
            ) : (
              <span style={{ fontSize: "1.1rem" }}>🎵</span>
            )}
          </button>
        </div>
      </div>
    </>
  );
}