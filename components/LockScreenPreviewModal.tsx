// components/LockScreenPreviewModal.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface Props {
  src:   string;
  title: string;
  onClose: () => void;
}

type DeviceFrame = "iphone-di" | "iphone-notch" | "android-punch" | "android-full";
type ClockPos    = "top" | "center";

const FRAMES: { id: DeviceFrame; label: string; w: number; h: number }[] = [
  { id: "iphone-di",     label: "iPhone (Dynamic Island)", w: 320, h: 693 },
  { id: "iphone-notch",  label: "iPhone (Notch)",          w: 320, h: 693 },
  { id: "android-punch", label: "Android (Punch-hole)",    w: 320, h: 693 },
  { id: "android-full",  label: "Android (Full Screen)",   w: 320, h: 693 },
];

function getNow() {
  const d = new Date();
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = ((h % 12) || 12).toString();
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return {
    time: `${h12}:${m}`,
    ampm,
    date: `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`,
  };
}

export default function LockScreenPreviewModal({ src, title, onClose }: Props) {
  const [frame,       setFrame]       = useState<DeviceFrame>("iphone-di");
  const [clockPos,    setClockPos]    = useState<ClockPos>("top");
  const [showClock,   setShowClock]   = useState(true);
  const [showNotif,   setShowNotif]   = useState(false);
  const [showDock,    setShowDock]    = useState(false);
  const [now,         setNow]         = useState(getNow);

  useEffect(() => {
    const t = setInterval(() => setNow(getNow()), 30000);
    return () => clearInterval(t);
  }, []);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);
  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const isIphone = frame.startsWith("iphone");

  return (
    <>
      <style>{`
        .lsp-overlay {
          position: fixed; inset: 0; z-index: 9000;
          background: rgba(0,0,0,0.88);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          backdrop-filter: blur(6px);
          animation: lspFadeIn 0.2s ease;
        }
        @keyframes lspFadeIn { from { opacity:0 } to { opacity:1 } }

        .lsp-panel {
          background: var(--bg-secondary, #12121c);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          display: flex;
          gap: 0;
          max-width: 820px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          box-shadow: 0 32px 80px rgba(0,0,0,0.7);
          position: relative;
        }

        .lsp-close {
          position: absolute; top: 14px; right: 14px; z-index: 10;
          width: 32px; height: 32px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 50%;
          color: #aaa; font-size: 1rem;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: background 0.2s;
        }
        .lsp-close:hover { background: rgba(255,255,255,0.16); color: #fff; }

        /* ── Left: phone preview ── */
        .lsp-preview {
          flex: 0 0 auto;
          width: 280px;
          min-width: 280px;
          background: #070710;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 24px;
        }

        .lsp-phone {
          position: relative;
          width: 200px;
          height: 433px;
          border-radius: 36px;
          overflow: hidden;
          box-shadow: 0 0 0 2px rgba(255,255,255,0.12), 0 20px 60px rgba(0,0,0,0.8);
          background: #000;
        }

        /* Dynamic Island */
        .lsp-di {
          position: absolute; top: 12px; left: 50%; transform: translateX(-50%);
          width: 90px; height: 30px;
          background: #000;
          border-radius: 20px;
          z-index: 10;
        }
        /* Notch */
        .lsp-notch {
          position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 120px; height: 26px;
          background: #000;
          border-radius: 0 0 18px 18px;
          z-index: 10;
        }
        /* Punch hole */
        .lsp-punch {
          position: absolute; top: 14px; left: 50%; transform: translateX(-50%);
          width: 14px; height: 14px;
          background: #000;
          border-radius: 50%;
          z-index: 10;
        }

        /* Clock */
        .lsp-clock {
          position: absolute;
          left: 0; right: 0;
          z-index: 5;
          text-align: center;
          pointer-events: none;
        }
        .lsp-clock--top    { top: 68px; }
        .lsp-clock--center { top: 50%; transform: translateY(-50%); }

        .lsp-clock-time {
          font-family: -apple-system, "SF Pro Display", sans-serif;
          font-size: 2.6rem;
          font-weight: 200;
          color: #fff;
          line-height: 1;
          text-shadow: 0 2px 12px rgba(0,0,0,0.6);
          letter-spacing: -1px;
        }
        .lsp-clock-date {
          font-family: -apple-system, "SF Pro Display", sans-serif;
          font-size: 0.72rem;
          color: rgba(255,255,255,0.75);
          margin-top: 3px;
          letter-spacing: 0.02em;
        }

        /* Notification */
        .lsp-notif {
          position: absolute;
          left: 12px; right: 12px;
          bottom: 90px;
          z-index: 6;
          background: rgba(30,30,34,0.85);
          backdrop-filter: blur(12px);
          border-radius: 14px;
          padding: 10px 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .lsp-notif-icon {
          width: 28px; height: 28px;
          border-radius: 6px;
          background: linear-gradient(135deg, #8b0000, #c0001a);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.85rem;
          flex-shrink: 0;
        }
        .lsp-notif-text { flex: 1; min-width: 0; }
        .lsp-notif-app {
          font-size: 0.5rem;
          color: rgba(255,255,255,0.5);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 1px;
        }
        .lsp-notif-msg {
          font-size: 0.6rem;
          color: rgba(255,255,255,0.85);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Dock */
        .lsp-dock {
          position: absolute;
          bottom: 14px;
          left: 50%; transform: translateX(-50%);
          display: flex; gap: 8px;
          z-index: 6;
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(10px);
          border-radius: 18px;
          padding: 6px 10px;
        }
        .lsp-dock-icon {
          width: 32px; height: 32px;
          border-radius: 8px;
          font-size: 1.1rem;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.15);
        }

        /* Android home indicator */
        .lsp-android-bar {
          position: absolute;
          bottom: 8px; left: 50%; transform: translateX(-50%);
          width: 60px; height: 4px;
          background: rgba(255,255,255,0.35);
          border-radius: 4px;
          z-index: 6;
        }

        /* ── Right: controls ── */
        .lsp-controls {
          flex: 1;
          overflow-y: auto;
          padding: 28px 28px 28px 20px;
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .lsp-title {
          font-family: var(--font-space), monospace;
          font-size: 0.58rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--blood, #a01818);
          margin-bottom: 2px;
        }
        .lsp-wallpaper-name {
          font-family: var(--font-cormorant), serif;
          font-size: 1.05rem;
          color: var(--text-primary, #e0e0f8);
          font-style: italic;
          line-height: 1.3;
        }

        .lsp-group-label {
          font-family: var(--font-space), monospace;
          font-size: 0.55rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--text-muted, #8888aa);
          margin-bottom: 8px;
        }

        .lsp-frame-btns {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .lsp-frame-btn {
          padding: 9px 14px;
          border: 1px solid rgba(255,255,255,0.08);
          background: transparent;
          color: var(--text-muted, #8888aa);
          font-family: var(--font-space), monospace;
          font-size: 0.6rem;
          letter-spacing: 0.1em;
          cursor: pointer;
          border-radius: 6px;
          text-align: left;
          transition: all 0.2s;
        }
        .lsp-frame-btn:hover { border-color: rgba(255,255,255,0.18); color: var(--text-primary, #e0e0f8); }
        .lsp-frame-btn--active {
          border-color: var(--blood, #a01818) !important;
          color: var(--text-primary, #e0e0f8) !important;
          background: rgba(160,24,24,0.1) !important;
        }

        .lsp-toggles {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .lsp-toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .lsp-toggle-label {
          font-family: var(--font-space), monospace;
          font-size: 0.6rem;
          letter-spacing: 0.1em;
          color: var(--text-primary, #e0e0f8);
          cursor: pointer;
        }
        .lsp-toggle {
          width: 36px; height: 20px;
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
          position: relative;
          cursor: pointer;
          transition: background 0.2s;
          border: none;
          flex-shrink: 0;
        }
        .lsp-toggle::after {
          content: "";
          position: absolute;
          width: 14px; height: 14px;
          border-radius: 50%;
          background: #fff;
          top: 3px; left: 3px;
          transition: transform 0.2s;
        }
        .lsp-toggle--on { background: var(--blood, #a01818); }
        .lsp-toggle--on::after { transform: translateX(16px); }

        .lsp-clock-pos {
          display: flex;
          gap: 6px;
        }
        .lsp-pos-btn {
          flex: 1;
          padding: 7px;
          border: 1px solid rgba(255,255,255,0.08);
          background: transparent;
          color: var(--text-muted, #8888aa);
          font-family: var(--font-space), monospace;
          font-size: 0.55rem;
          letter-spacing: 0.1em;
          cursor: pointer;
          border-radius: 5px;
          transition: all 0.2s;
        }
        .lsp-pos-btn--active {
          border-color: var(--blood, #a01818);
          color: var(--text-primary, #e0e0f8);
          background: rgba(160,24,24,0.1);
        }

        @media (max-width: 580px) {
          .lsp-panel { flex-direction: column; max-height: 95vh; }
          .lsp-preview { width: 100%; padding: 24px 16px 16px; }
          .lsp-phone { width: 160px; height: 347px; }
          .lsp-clock-time { font-size: 2rem; }
          .lsp-controls { padding: 16px; }
        }
      `}</style>

      <div className="lsp-overlay" onClick={onClose}>
        <div className="lsp-panel" onClick={e => e.stopPropagation()}>
          <button className="lsp-close" onClick={onClose} aria-label="Close">✕</button>

          {/* ── Phone mockup ── */}
          <div className="lsp-preview">
            <div className="lsp-phone">
              {/* Wallpaper */}
              <Image src={src} alt={title} fill unoptimized style={{ objectFit: "cover" }} />

              {/* Frame chrome */}
              {frame === "iphone-di"     && <div className="lsp-di" />}
              {frame === "iphone-notch"  && <div className="lsp-notch" />}
              {frame === "android-punch" && <div className="lsp-punch" />}

              {/* Clock */}
              {showClock && (
                <div className={`lsp-clock lsp-clock--${clockPos}`}>
                  <div className="lsp-clock-time">
                    {now.time}<span style={{fontSize:"1.2rem",opacity:0.7}}> {now.ampm}</span>
                  </div>
                  <div className="lsp-clock-date">{now.date}</div>
                </div>
              )}

              {/* Notification */}
              {showNotif && (
                <div className="lsp-notif">
                  <div className="lsp-notif-icon">👻</div>
                  <div className="lsp-notif-text">
                    <div className="lsp-notif-app">HauntedWallpapers</div>
                    <div className="lsp-notif-msg">New dark art just dropped 🩸</div>
                  </div>
                </div>
              )}

              {/* Dock / Home indicator */}
              {showDock && isIphone && (
                <div className="lsp-dock">
                  {["📞","📷","📧","🎵"].map((icon,i) => (
                    <div key={i} className="lsp-dock-icon">{icon}</div>
                  ))}
                </div>
              )}
              {!isIphone && (
                <div className="lsp-android-bar" />
              )}
            </div>
          </div>

          {/* ── Controls ── */}
          <div className="lsp-controls">
            <div>
              <p className="lsp-title">Lock Screen Preview</p>
              <p className="lsp-wallpaper-name">{title}</p>
            </div>

            <div>
              <p className="lsp-group-label">Device Frame</p>
              <div className="lsp-frame-btns">
                {FRAMES.map(f => (
                  <button
                    key={f.id}
                    className={`lsp-frame-btn${frame === f.id ? " lsp-frame-btn--active" : ""}`}
                    onClick={() => setFrame(f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="lsp-group-label">Overlays</p>
              <div className="lsp-toggles">
                {([
                  ["Clock & Date", showClock,  setShowClock],
                  ["Notification", showNotif,  setShowNotif],
                  ["App Dock (iPhone)", showDock, setShowDock],
                ] as [string, boolean, (v: boolean) => void][]).map(([label, val, set]) => (
                  <div key={label} className="lsp-toggle-row">
                    <label className="lsp-toggle-label" onClick={() => set(!val)}>{label}</label>
                    <button
                      className={`lsp-toggle${val ? " lsp-toggle--on" : ""}`}
                      onClick={() => set(!val)}
                      aria-label={`Toggle ${label}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {showClock && (
              <div>
                <p className="lsp-group-label">Clock Position</p>
                <div className="lsp-clock-pos">
                  {([["top","Upper Third"],["center","Centered"]] as [ClockPos,string][]).map(([pos,label]) => (
                    <button
                      key={pos}
                      className={`lsp-pos-btn${clockPos === pos ? " lsp-pos-btn--active" : ""}`}
                      onClick={() => setClockPos(pos)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {clockPos === "top" && (
                  <p style={{marginTop:"6px",fontSize:"0.5rem",fontFamily:"monospace",color:"var(--text-muted,#8888aa)",letterSpacing:"0.08em"}}>
                    Check if the clock covers your wallpaper's focal point
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}