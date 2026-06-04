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