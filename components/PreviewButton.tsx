// components/PreviewButton.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

// ── Types ────────────────────────────────────────────────────────────────────
type DeviceFrame = "iphone-di" | "iphone-notch" | "android-punch" | "android-full";
type ClockPos    = "top" | "center";

const FRAMES: { id: DeviceFrame; label: string }[] = [
  { id: "iphone-di",     label: "iPhone (Dynamic Island)" },
  { id: "iphone-notch",  label: "iPhone (Notch)" },
  { id: "android-punch", label: "Android (Punch-hole)" },
  { id: "android-full",  label: "Android (Full Screen)" },
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

// ── Modal (rendered via portal into document.body) ───────────────────────────
function LockScreenModal({
  src, title, onClose,
}: { src: string; title: string; onClose: () => void }) {
  const [frame,     setFrame]     = useState<DeviceFrame>("iphone-di");
  const [clockPos,  setClockPos]  = useState<ClockPos>("top");
  const [showClock, setShowClock] = useState(true);
  const [showNotif, setShowNotif] = useState(false);
  const [showDock,  setShowDock]  = useState(false);
  const [now,       setNow]       = useState(getNow);

  useEffect(() => {
    const t = setInterval(() => setNow(getNow()), 30000);
    return () => clearInterval(t);
  }, []);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Keyboard close
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
          position: fixed !important;
          inset: 0 !important;
          z-index: 999999 !important;
          background: rgba(0,0,0,0.9) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 20px !important;
          overflow-y: auto !important;
          animation: lspFadeIn 0.18s ease;
          color-scheme: dark;
        }
        @keyframes lspFadeIn { from { opacity:0 } to { opacity:1 } }

        .lsp-panel {
          background: #111118 !important;
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 14px;
          display: flex;
          flex-direction: row;
          max-width: 820px;
          width: 100%;
          max-height: 88vh;
          overflow: hidden;
          box-shadow: 0 32px 80px rgba(0,0,0,0.85);
          position: relative;
          color-scheme: dark;
          color: #e0e0f8;
          margin: auto;
          flex-shrink: 0;
        }

        .lsp-close {
          position: absolute; top: 12px; right: 12px; z-index: 10;
          width: 32px; height: 32px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 50%;
          color: #aaa; font-size: 1rem;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: background 0.2s;
          line-height: 1;
        }
        .lsp-close:hover { background: rgba(255,255,255,0.14); color: #fff; }

        /* ── Left: phone preview ── */
        .lsp-preview {
          flex: 0 0 auto;
          width: 260px;
          background: #070710;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 20px;
          border-radius: 14px 0 0 14px;
          flex-shrink: 0;
        }

        .lsp-phone {
          position: relative;
          width: 190px;
          height: 412px;
          border-radius: 36px;
          overflow: hidden;
          box-shadow: 0 0 0 2px rgba(255,255,255,0.13), 0 20px 60px rgba(0,0,0,0.85);
          background: #000;
          flex-shrink: 0;
        }

        .lsp-di {
          position: absolute; top: 12px; left: 50%; transform: translateX(-50%);
          width: 88px; height: 28px; background: #000; border-radius: 20px; z-index: 10;
        }
        .lsp-notch {
          position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 118px; height: 24px; background: #000; border-radius: 0 0 18px 18px; z-index: 10;
        }
        .lsp-punch {
          position: absolute; top: 14px; left: 50%; transform: translateX(-50%);
          width: 14px; height: 14px; background: #000; border-radius: 50%; z-index: 10;
        }

        .lsp-clock {
          position: absolute; left: 0; right: 0; z-index: 5; text-align: center; pointer-events: none;
        }
        .lsp-clock--top    { top: 68px; }
        .lsp-clock--center { top: 50%; transform: translateY(-50%); }
        .lsp-clock-time {
          font-family: -apple-system, "SF Pro Display", sans-serif;
          font-size: 2.6rem; font-weight: 200; color: #fff; line-height: 1;
          text-shadow: 0 2px 12px rgba(0,0,0,0.6); letter-spacing: -1px;
        }
        .lsp-clock-date {
          font-family: -apple-system, "SF Pro Display", sans-serif;
          font-size: 0.72rem; color: rgba(255,255,255,0.75); margin-top: 3px; letter-spacing: 0.02em;
        }

        .lsp-notif {
          position: absolute; left: 12px; right: 12px; bottom: 90px; z-index: 6;
          background: rgba(30,30,34,0.85); backdrop-filter: blur(12px);
          border-radius: 14px; padding: 10px 12px;
          display: flex; align-items: center; gap: 8px;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .lsp-notif-icon {
          width: 28px; height: 28px; border-radius: 6px;
          background: linear-gradient(135deg, #8b0000, #c0001a);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.85rem; flex-shrink: 0;
        }
        .lsp-notif-text { flex: 1; min-width: 0; }
        .lsp-notif-app { font-size: 0.5rem; color: rgba(255,255,255,0.5); letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 1px; }
        .lsp-notif-msg { font-size: 0.6rem; color: rgba(255,255,255,0.85); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        .lsp-dock {
          position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%);
          display: flex; gap: 8px; z-index: 6;
          background: rgba(255,255,255,0.12); backdrop-filter: blur(10px);
          border-radius: 18px; padding: 6px 10px;
        }
        .lsp-dock-icon {
          width: 32px; height: 32px; border-radius: 8px; font-size: 1.1rem;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.15);
        }
        .lsp-android-bar {
          position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%);
          width: 60px; height: 4px;
          background: rgba(255,255,255,0.35); border-radius: 4px; z-index: 6;
        }

        /* ── Right: controls ── */
        .lsp-controls {
          flex: 1;
          overflow-y: auto;
          padding: 28px 28px 28px 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          background: #111118;
          border-radius: 0 14px 14px 0;
          min-width: 0;
        }

        .lsp-eyebrow {
          font-family: var(--font-space, monospace);
          font-size: 0.55rem; letter-spacing: 0.22em; text-transform: uppercase;
          color: #a01818; margin-bottom: 2px;
        }
        .lsp-wallpaper-name {
          font-family: var(--font-cormorant, serif);
          font-size: 1rem; color: #e0e0f8; font-style: italic; line-height: 1.3;
        }

        .lsp-group-label {
          font-family: var(--font-space, monospace);
          font-size: 0.52rem; letter-spacing: 0.2em; text-transform: uppercase;
          color: #8888aa; margin-bottom: 8px;
        }

        .lsp-frame-btns { display: flex; flex-direction: column; gap: 6px; }
        .lsp-frame-btn {
          padding: 9px 14px;
          border: 1px solid rgba(255,255,255,0.08);
          background: transparent; color: #8888aa;
          font-family: var(--font-space, monospace);
          font-size: 0.6rem; letter-spacing: 0.1em;
          cursor: pointer; border-radius: 6px; text-align: left;
          transition: all 0.15s;
        }
        .lsp-frame-btn:hover { border-color: rgba(255,255,255,0.18); color: #e0e0f8; }
        .lsp-frame-btn--active {
          border-color: #a01818 !important; color: #e0e0f8 !important; background: rgba(160,24,24,0.1) !important;
        }

        .lsp-toggles { display: flex; flex-direction: column; gap: 10px; }
        .lsp-toggle-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .lsp-toggle-label {
          font-family: var(--font-space, monospace); font-size: 0.6rem; letter-spacing: 0.1em;
          color: #e0e0f8; cursor: pointer;
        }
        .lsp-toggle {
          width: 36px; height: 20px; background: rgba(255,255,255,0.1);
          border-radius: 10px; position: relative; cursor: pointer;
          transition: background 0.2s; border: none; flex-shrink: 0;
        }
        .lsp-toggle::after {
          content: ""; position: absolute;
          width: 14px; height: 14px; border-radius: 50%; background: #fff;
          top: 3px; left: 3px; transition: transform 0.2s;
        }
        .lsp-toggle--on { background: #a01818; }
        .lsp-toggle--on::after { transform: translateX(16px); }

        .lsp-clock-pos { display: flex; gap: 6px; }
        .lsp-pos-btn {
          flex: 1; padding: 7px;
          border: 1px solid rgba(255,255,255,0.08); background: transparent;
          color: #8888aa;
          font-family: var(--font-space, monospace); font-size: 0.55rem; letter-spacing: 0.1em;
          cursor: pointer; border-radius: 5px; transition: all 0.15s;
        }
        .lsp-pos-btn--active { border-color: #a01818; color: #e0e0f8; background: rgba(160,24,24,0.1); }

        /* ── Mobile stacked layout ── */
        @media (max-width: 600px) {
          .lsp-overlay { padding: 0 !important; align-items: flex-end !important; }
          .lsp-panel {
            flex-direction: column !important;
            border-radius: 16px 16px 0 0 !important;
            max-height: 92vh !important;
            overflow-y: auto !important;
          }
          .lsp-preview {
            width: 100% !important; padding: 20px 16px 12px !important;
            border-radius: 16px 16px 0 0 !important;
          }
          .lsp-phone { width: 140px !important; height: 304px !important; }
          .lsp-clock-time { font-size: 1.8rem !important; }
          .lsp-controls { padding: 16px !important; border-radius: 0 !important; overflow-y: visible !important; }
        }

        /* ── Restore cursor inside modal (overrides global cursor:none) ── */
        .lsp-overlay, .lsp-overlay * { cursor: auto !important; }
        .lsp-overlay button, .lsp-overlay label { cursor: pointer !important; }
      `}</style>

      <div className="lsp-overlay" onClick={onClose}>
        <div className="lsp-panel" onClick={(e) => e.stopPropagation()}>
          <button className="lsp-close" onClick={onClose} aria-label="Close">✕</button>

          {/* ── Phone mockup ── */}
          <div className="lsp-preview">
            <div className="lsp-phone">
              <Image src={src} alt={title} fill unoptimized style={{ objectFit: "cover" }} />

              {frame === "iphone-di"     && <div className="lsp-di" />}
              {frame === "iphone-notch"  && <div className="lsp-notch" />}
              {frame === "android-punch" && <div className="lsp-punch" />}

              {showClock && (
                <div className={`lsp-clock lsp-clock--${clockPos}`}>
                  <div className="lsp-clock-time">
                    {now.time}<span style={{ fontSize: "1.2rem", opacity: 0.7 }}> {now.ampm}</span>
                  </div>
                  <div className="lsp-clock-date">{now.date}</div>
                </div>
              )}

              {showNotif && (
                <div className="lsp-notif">
                  <div className="lsp-notif-icon">👻</div>
                  <div className="lsp-notif-text">
                    <div className="lsp-notif-app">HauntedWallpapers</div>
                    <div className="lsp-notif-msg">New dark art just dropped 🩸</div>
                  </div>
                </div>
              )}

              {showDock && isIphone && (
                <div className="lsp-dock">
                  {["📞","📷","📧","🎵"].map((icon, i) => (
                    <div key={i} className="lsp-dock-icon">{icon}</div>
                  ))}
                </div>
              )}
              {!isIphone && <div className="lsp-android-bar" />}
            </div>
          </div>

          {/* ── Controls ── */}
          <div className="lsp-controls">
            <div>
              <p className="lsp-eyebrow">Lock Screen Preview</p>
              <p className="lsp-wallpaper-name">{title}</p>
            </div>

            <div>
              <p className="lsp-group-label">Device Frame</p>
              <div className="lsp-frame-btns">
                {FRAMES.map((f) => (
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
                  ["Clock & Date",     showClock, setShowClock],
                  ["Notification",     showNotif, setShowNotif],
                  ["App Dock (iPhone)", showDock,  setShowDock],
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
                  {([["top","Upper Third"],["center","Centered"]] as [ClockPos,string][]).map(([pos, label]) => (
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
                  <p style={{ marginTop: "6px", fontSize: "0.5rem", fontFamily: "monospace", color: "#8888aa", letterSpacing: "0.08em" }}>
                    Check the clock doesn&apos;t cover your wallpaper&apos;s focal point
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

// ── PreviewButton — portal-based, zero in-flow rendering ────────────────────
interface ButtonProps {
  src:       string;
  title:     string;
  label?:    string;
  showLive?: boolean;
  mode?:     "mobile" | "desktop";
}

export default function PreviewButton({
  src, title, label = "Preview on Lock Screen", showLive = true,
}: ButtonProps) {
  const [open,    setOpen]    = useState(false);
  const [mounted, setMounted] = useState(false);

  // Only enable portal after client mount — prevents SSR mismatch
  useEffect(() => { setMounted(true); }, []);

  return (
    <>
      {/* Modal rendered via portal — always on document.body, never in-flow */}
      {mounted && open && createPortal(
        <LockScreenModal src={src} title={title} onClose={() => setOpen(false)} />,
        document.body
      )}

      <button
        onClick={() => setOpen(true)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          padding: "13px 20px",
          border: "1px solid rgba(139,100,180,0.45)",
          background: "linear-gradient(135deg, rgba(80,40,120,0.25) 0%, rgba(40,20,70,0.35) 100%)",
          color: "#c4a8f0",
          fontFamily: "var(--font-space), monospace",
          fontSize: "0.62rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          cursor: "pointer",
          transition: "all 0.25s ease",
          borderRadius: "4px",
          whiteSpace: "nowrap",
          width: "100%",
          boxShadow: "0 0 18px rgba(120,60,200,0.12), inset 0 1px 0 rgba(255,255,255,0.06)",
          position: "relative",
          overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          const btn = e.currentTarget as HTMLButtonElement;
          btn.style.borderColor = "rgba(180,120,255,0.7)";
          btn.style.color = "#e8d5ff";
          btn.style.boxShadow = "0 0 28px rgba(140,70,255,0.25), inset 0 1px 0 rgba(255,255,255,0.08)";
          btn.style.background = "linear-gradient(135deg, rgba(100,50,160,0.35) 0%, rgba(60,25,100,0.45) 100%)";
        }}
        onMouseLeave={(e) => {
          const btn = e.currentTarget as HTMLButtonElement;
          btn.style.borderColor = "rgba(139,100,180,0.45)";
          btn.style.color = "#c4a8f0";
          btn.style.boxShadow = "0 0 18px rgba(120,60,200,0.12), inset 0 1px 0 rgba(255,255,255,0.06)";
          btn.style.background = "linear-gradient(135deg, rgba(80,40,120,0.25) 0%, rgba(40,20,70,0.35) 100%)";
        }}
        aria-label="Preview on lock screen"
      >
        <span style={{ fontSize: "1.1rem", filter: "drop-shadow(0 0 6px rgba(180,120,255,0.5))" }}>📱</span>
        <span>{label}</span>
        {showLive && (
          <span style={{
            marginLeft: "auto",
            fontSize: "0.55rem",
            color: "rgba(180,140,255,0.6)",
            border: "1px solid rgba(140,80,220,0.3)",
            padding: "2px 6px",
            borderRadius: "2px",
            letterSpacing: "0.1em",
          }}>LIVE</span>
        )}
      </button>
    </>
  );
}