// components/DeviceMockup.tsx
// CSS-only device frame wrapper. No external libraries.
// Pass deviceType from your DB record:
//   "IPHONE"  → slim phone frame (9:19.5) with glass reflection
//   "ANDROID" → same phone frame
//   "PC"      → monitor frame (16:9) with cinematic bezel
//   null      → plain bordered container (collection images, 9:16)

interface DeviceMockupProps {
  deviceType: string | null;
  children: React.ReactNode;
  /** Pass the same src/href you use in DeviceImageCard so borders match */
  seed?: string;
}

// ── Border palette — mirrors DeviceImageCard exactly ─────────────────────────
const BORDER_PALETTE = [
  { border: "#8b0000", glow: "rgba(139,0,0,0.55)",     shadow: "rgba(139,0,0,0.3)"     }, // deep maroon
  { border: "#c0001a", glow: "rgba(192,0,26,0.55)",    shadow: "rgba(192,0,26,0.3)"    }, // blood red
  { border: "#6b6b6b", glow: "rgba(107,107,107,0.45)", shadow: "rgba(180,180,180,0.2)" }, // silver
  { border: "#1a1a1a", glow: "rgba(255,255,255,0.08)", shadow: "rgba(255,255,255,0.05)"}, // near-black
  { border: "#2d5a1b", glow: "rgba(45,90,27,0.55)",    shadow: "rgba(60,130,30,0.25)"  }, // dark green
  { border: "#ff3c00", glow: "rgba(255,60,0,0.5)",     shadow: "rgba(255,60,0,0.25)"   }, // ember orange
  { border: "#c9a84c", glow: "rgba(201,168,76,0.45)",  shadow: "rgba(201,168,76,0.2)"  }, // gold
  { border: "#4a0080", glow: "rgba(74,0,128,0.5)",     shadow: "rgba(74,0,128,0.25)"   }, // deep violet
  { border: "#003366", glow: "rgba(0,51,102,0.5)",     shadow: "rgba(0,80,160,0.2)"    }, // midnight blue
  { border: "#2a0000", glow: "rgba(80,0,0,0.6)",       shadow: "rgba(120,0,0,0.3)"     }, // void black-red
  { border: "#8b7355", glow: "rgba(139,115,85,0.45)",  shadow: "rgba(180,150,100,0.2)" }, // bronze
  { border: "#1c1c1c", glow: "rgba(200,200,200,0.06)", shadow: "rgba(200,200,200,0.04)"}, // obsidian
];

function pickBorderIndex(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash % BORDER_PALETTE.length;
}

export default function DeviceMockup({ deviceType, children, seed = "" }: DeviceMockupProps) {
  const accent = BORDER_PALETTE[pickBorderIndex(seed)];

  const frameStyle = {
    "--mockup-border":  accent.border,
    "--mockup-glow":    accent.glow,
    "--mockup-shadow":  accent.shadow,
  } as React.CSSProperties;

  // ── Phone (iPhone or Android) ─────────────────────────────────────────────
  if (deviceType === "IPHONE" || deviceType === "ANDROID") {
    return (
      <div className="mockup-phone" style={frameStyle}>
        <div
          className="mockup-phone-shell"
          style={{
            borderColor: accent.border,
            boxShadow: `0 0 18px ${accent.glow}, 0 0 6px ${accent.shadow}`,
          }}
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
    return (
      <div className="mockup-monitor" style={frameStyle}>
        <div
          className="mockup-monitor-bezel"
          style={{
            borderColor: accent.border,
            boxShadow: `0 0 20px ${accent.glow}, 0 0 8px ${accent.shadow}`,
          }}
        >
          <div className="mockup-monitor-cam" aria-hidden="true" />
          <div className="mockup-monitor-screen">
            {children}
          </div>
        </div>
        {/* Stand — tinted to match accent */}
        <div
          className="mockup-monitor-stand"
          aria-hidden="true"
          style={{ borderColor: accent.border, opacity: 0.6 }}
        />
        <div
          className="mockup-monitor-base"
          aria-hidden="true"
          style={{ borderColor: accent.border, opacity: 0.6 }}
        />
      </div>
    );
  }

  // ── Plain frame ───────────────────────────────────────────────────────────
  return (
    <div
      className="mockup-plain"
      style={{
        borderColor: accent.border,
        boxShadow: `0 0 12px ${accent.glow}, inset 0 0 6px ${accent.shadow}`,
        ...frameStyle,
      }}
    >
      {children}
    </div>
  );
}