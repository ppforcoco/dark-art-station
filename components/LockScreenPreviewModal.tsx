// components/LockScreenPreviewModal.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface Props {
  src:     string;
  title:   string;
  onClose: () => void;
  mode?:   "mobile" | "desktop";
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

export default function LockScreenPreviewModal({ src, title, onClose, mode: _mode = "mobile" }: Props) {
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
                  <div key={label as string} className="lsp-toggle-row">
                    <label className="lsp-toggle-label" onClick={() => (set as (v: boolean) => void)(!(val as boolean))}>{label as string}</label>
                    <button
                      className={`lsp-toggle${val ? " lsp-toggle--on" : ""}`}
                      onClick={() => (set as (v: boolean) => void)(!(val as boolean))}
                      aria-label={`Toggle ${label as string}`}
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
                    Check if the clock covers your wallpaper&apos;s focal point
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