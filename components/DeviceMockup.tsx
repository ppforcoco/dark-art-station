// components/DeviceMockup.tsx
// CSS-only device frame wrapper. No external libraries.
// Pass deviceType from your DB record:
//   "IPHONE"  → slim phone frame (9:19.5) with glass reflection
//   "ANDROID" → same phone frame
//   "PC"      → monitor frame (16:9) with cinematic bezel
//   null      → plain bordered container (collection images, 9:16)
//
// Glow: uses the same cardGlowRotate keyframe defined in globals.css.
// Every device gets a unique starting color via animationDelay derived
// from the seed string — same image always = same start color.

interface DeviceMockupProps {
  deviceType: string | null;
  children: React.ReactNode;
  /** Pass the same src/href you use in DeviceImageCard so animation offsets are consistent */
  seed?: string;
}

/** Deterministic delay in 0–7.9 s range so every mockup starts on a different glow color */
function glowDelay(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const seconds = (hash % 80) / 10; // 0.0 – 7.9
  return `-${seconds.toFixed(1)}s`;
}

/** Shared animation style — references cardGlowRotate defined in globals.css */
function animatedGlow(seed: string, durationSeconds = 8): React.CSSProperties {
  return {
    animationName: "cardGlowRotate",
    animationDuration: `${durationSeconds}s`,
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
    animationDelay: glowDelay(seed),
    // border-color is driven by the keyframe, but set a sane fallback:
    border: "1px solid #8b0000",
  };
}

export default function DeviceMockup({ deviceType, children, seed = "" }: DeviceMockupProps) {
  const glow = animatedGlow(seed);

  // ── Phone (iPhone or Android) ─────────────────────────────────────────────
  if (deviceType === "IPHONE" || deviceType === "ANDROID") {
    return (
      <div className="mockup-phone">
        <div
          className="mockup-phone-shell"
          style={glow}
        >
          {/* Dynamic Island */}
          <div className="mockup-phone-notch" aria-hidden="true" />
          {/* Screen */}
          <div className="mockup-phone-screen">
            {children}
          </div>
        </div>
      </div>
    );
  }

  // ── Monitor (PC) ──────────────────────────────────────────────────────────
  if (deviceType === "PC") {
    // For the monitor we put the glow on the bezel; stand inherits border color
    // via a slightly-offset variant of the same animation.
    const standGlow: React.CSSProperties = {
      ...animatedGlow(seed + "-stand"),
      opacity: 0.55,
    };

    return (
      <div className="mockup-monitor">
        <div
          className="mockup-monitor-bezel"
          style={glow}
        >
          <div className="mockup-monitor-cam" aria-hidden="true" />
          <div className="mockup-monitor-screen">
            {children}
          </div>
        </div>
        {/* Stand — tinted with slightly offset glow so it doesn't perfectly sync */}
        <div
          className="mockup-monitor-stand"
          aria-hidden="true"
          style={standGlow}
        />
        <div
          className="mockup-monitor-base"
          aria-hidden="true"
          style={standGlow}
        />
      </div>
    );
  }

  // ── Plain frame ───────────────────────────────────────────────────────────
  return (
    <div
      className="mockup-plain"
      style={glow}
    >
      {children}
    </div>
  );
}