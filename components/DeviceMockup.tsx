// components/DeviceMockup.tsx
// CSS-only device frame wrapper. No external libraries.
// Pass deviceType from your DB record:
//   "IPHONE"  → slim phone frame (9:19.5)
//   "ANDROID" → same phone frame
//   "PC"      → monitor frame (16:10)
//   null      → plain bordered container (collection images)

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
          {/* Dynamic island / notch */}
          <div className="mockup-phone-notch" aria-hidden="true" />
          {/* Screen */}
          <div className="mockup-phone-screen">
            {children}
          </div>
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