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
}

export default function DeviceMockup({ deviceType, children }: DeviceMockupProps) {

  // ── Phone (iPhone or Android) ──────────────────────────────────────────────
  if (deviceType === "IPHONE" || deviceType === "ANDROID") {
    return (
      <div className="mockup-phone">
        <div className="mockup-phone-shell">
          {/* Dynamic Island */}
          <div className="mockup-phone-notch" aria-hidden="true" />
          {/* Screen */}
          <div className="mockup-phone-screen">
            {children}
          </div>
          {/* Glass overlay is applied via CSS ::after on mockup-phone-shell */}
        </div>
      </div>
    );
  }

  // ── Monitor (PC) ───────────────────────────────────────────────────────────
  if (deviceType === "PC") {
    return (
      <div className="mockup-monitor">
        <div className="mockup-monitor-bezel">
          <div className="mockup-monitor-cam" aria-hidden="true" />
          <div className="mockup-monitor-screen">
            {children}
          </div>
          {/* Glass overlay is applied via CSS ::after on mockup-monitor-bezel */}
        </div>
        {/* Stand */}
        <div className="mockup-monitor-stand" aria-hidden="true" />
        <div className="mockup-monitor-base"  aria-hidden="true" />
      </div>
    );
  }

  // ── Plain frame (collection images — no device context) ───────────────────
  return (
    <div className="mockup-plain">
      {children}
    </div>
  );
}