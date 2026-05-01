"use client";
import { useState, useEffect } from "react";

const TIPS = [
  { icon: "📱", text: "On iPhone: Long-press the wallpaper → tap Save to Photos → Settings → Wallpaper → Choose New." },
  { icon: "🔒", text: "Set different wallpapers for Lock Screen and Home Screen on iOS 16+ for a split-personality effect." },
  { icon: "🌑", text: "AMOLED screens on Android display true black — our dark wallpapers save battery life." },
  { icon: "⚡", text: "On Android: Long-press your home screen → Wallpapers → pick from Gallery. Done in 10 seconds." },
  { icon: "🎭", text: "Use a dark wallpaper on your Lock Screen — it hides scratches and looks mysterious." },
  { icon: "📐", text: "All wallpapers are 9:16 portrait — perfect fit for every iPhone and Android without cropping." },
  { icon: "🔄", text: "iPhone tip: Swipe left on Lock Screen to switch wallpapers without entering settings." },
  { icon: "🌙", text: "Pair a dark wallpaper with Dark Mode for a full immersive experience — your eyes will thank you." },
  { icon: "💾", text: "Tap and hold any wallpaper image on this site → Save to Photos. No account required." },
  { icon: "🎨", text: "Match your app icons to your wallpaper using Shortcuts on iPhone for a custom aesthetic." },
  { icon: "👾", text: "Android users: Use Muzei or KLWP to auto-rotate your wallpapers daily automatically." },
  { icon: "🖤", text: "Dark wallpapers reduce eye strain at night — especially with Night Shift or Night Light enabled." },
  { icon: "✨", text: "Pro tip: Set wallpaper perspective zoom OFF on iPhone for a clean, static look." },
  { icon: "🔮", text: "Use the same wallpaper on Lock and Home Screen for a seamless, ghost-in-the-machine look." },
  { icon: "📲", text: "On Samsung: Settings → Wallpaper & style → Browse wallpapers, or just use Gallery." },
  { icon: "🌫️", text: "Enable blur on your iPhone Home Screen to make widgets pop against dark wallpapers." },
  { icon: "💀", text: "New wallpapers drop regularly — bookmark this site and check back every week." },
  { icon: "🧛", text: "Pixel phones: hold the home screen → Wallpaper & style → My photos to set any image." },
  { icon: "🎯", text: "Download the high-res version for the sharpest image — especially on newer Pro displays." },
  { icon: "🌀", text: "Use Live Photo wallpapers on iPhone by converting a still image in the Photos app." },
];

interface Props {
  mode?: "banner" | "popup";
}

export default function WallpaperTips({ mode = "banner" }: Props) {
  const [idx, setIdx]       = useState(0);
  const [visible, setVisible] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("hw-tips-dismissed");
    if (saved) setDismissed(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % TIPS.length);
        setVisible(true);
      }, 400);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  if (dismissed) return null;

  const tip = TIPS[idx];

  if (mode === "banner") {
    return (
      <div className="hw-tips-banner">
        <span className="hw-tips-icon">{tip.icon}</span>
        <span className={`hw-tips-text${visible ? " hw-tips-in" : " hw-tips-out"}`}>{tip.text}</span>
        <button
          className="hw-tips-dismiss"
          onClick={() => { setDismissed(true); sessionStorage.setItem("hw-tips-dismissed","1"); }}
          aria-label="Dismiss tips"
        >✕</button>
      </div>
    );
  }

  return null;
}