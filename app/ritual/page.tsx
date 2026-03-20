import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Setup Guide | Haunted Wallpapers — How to Set Your Dark Wallpaper",
  description: "How to set your Haunted Wallpaper on iPhone, Android, and PC. Step by step guides for every device.",
};

const STEPS = {
  iphone: [
    "Download the wallpaper — tap the download button on any image page.",
    "Open the Photos app and find your downloaded image.",
    "Tap the share icon (box with arrow) → tap 'Use as Wallpaper'.",
    "Choose Lock Screen, Home Screen, or both.",
    "Pinch to zoom and position the image — tap Set.",
  ],
  android: [
    "Download the wallpaper from the image page.",
    "Open your Gallery or Files app and find the image.",
    "Long-press the image → tap 'Set as wallpaper'.",
    "Choose Lock screen, Home screen, or Both.",
    "Adjust position and confirm.",
  ],
  pc: [
    "Download the high-resolution PC wallpaper (16:9 format).",
    "Windows: Right-click the image → Set as desktop background.",
    "Mac: System Settings → Wallpaper → drag image into the panel.",
    "For dual monitors, use Display Settings to assign per-screen.",
    "For best results, set to 'Fill' or 'Fit' mode.",
  ],
};

export default function SetupGuidePage() {
  return (
    <main className="static-page setup-page">
      <div className="origins-hero">
        <span className="section-eyebrow">How To</span>
        <h1 className="origins-title">Setup<br /><span className="t-gold">Guide</span></h1>
        <p className="origins-sub">Get your dark art on every screen in minutes.</p>
      </div>

      <div className="origins-body">
        <div className="origins-block">
          <span className="origins-num" style={{ color: "var(--gold)" }}>📱</span>
          <div>
            <h2 className="origins-h2">iPhone / iOS</h2>
            <ol className="setup-steps">
              {STEPS.iphone.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
            <Link href="/iphone" className="btn-secondary" style={{ marginTop: "20px", display: "inline-block" }}>Browse iPhone Wallpapers →</Link>
          </div>
        </div>

        <div className="origins-block">
          <span className="origins-num" style={{ color: "var(--gold)" }}>🤖</span>
          <div>
            <h2 className="origins-h2">Android</h2>
            <ol className="setup-steps">
              {STEPS.android.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
            <Link href="/android" className="btn-secondary" style={{ marginTop: "20px", display: "inline-block" }}>Browse Android Wallpapers →</Link>
          </div>
        </div>

        <div className="origins-block">
          <span className="origins-num" style={{ color: "var(--gold)" }}>🖥</span>
          <div>
            <h2 className="origins-h2">PC / Desktop</h2>
            <ol className="setup-steps">
              {STEPS.pc.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
            <Link href="/pc" className="btn-secondary" style={{ marginTop: "20px", display: "inline-block" }}>Browse PC Wallpapers →</Link>
          </div>
        </div>

        <div className="origins-block">
          <span className="origins-num">✦</span>
          <div>
            <h2 className="origins-h2">Pro Tips</h2>
            <ul className="setup-tips">
              <li>For iPhone, use <strong>Perspective Zoom off</strong> for the cleanest look.</li>
              <li>Dark wallpapers dramatically reduce battery usage on OLED screens.</li>
              <li>Pair your wallpaper with a matching dark system theme for full immersion.</li>
              <li>High-contrast wallpapers (light icons vs. dark background) are easiest to read.</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}