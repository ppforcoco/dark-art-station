// components/AdsterraAdSlot.tsx
import AdsterraBanner from "./AdsterraBanner";
import AdsterraNativeBanner from "./AdsterraNativeBanner";

// ── Adsterra ad zone keys (from the Adsterra dashboard) ─────────────────────
const ADS = {
  // 728x90 leaderboard banner — desktop
  leaderboard:  { adKey: "02866a37767d7710789f470ba39a93a5", width: 728, height: 90 },
  // 300x250 medium rectangle — in-content
  rectangle:    { adKey: "87771c8738665ad01ba148c3b72a8e87", width: 300, height: 250 },
  // 320x50 mobile banner
  mobileBanner: { adKey: "5100edfb3c49f3b36ac9bb3187c4db67", width: 320, height: 50 },
} as const;

type AdsterraVariant = "leaderboard" | "rectangle" | "mobileBanner" | "native" | "topResponsive";

interface AdsterraAdSlotProps {
  variant: AdsterraVariant;
  className?: string;
}

/**
 * Drop-in Adsterra ad slot, styled to match the existing `.ad-banner` /
 * `.ad-content` / `.ad-label` design used across the site.
 *
 * Variants:
 *  - "leaderboard"    → 728x90 banner
 *  - "rectangle"      → 300x250 banner (good for in-content placements)
 *  - "mobileBanner"   → 320x50 banner
 *  - "native"         → Native Banner (blends into content lists)
 *  - "topResponsive"  → 728x90 on desktop, 320x50 on mobile (one slot, two units)
 */
export default function AdsterraAdSlot({ variant, className = "" }: AdsterraAdSlotProps) {
  if (variant === "native") {
    return (
      <div className={`ad-banner ad-banner--native ${className}`} data-section="content">
        <span className="ad-label ad-label--side">Sponsored</span>
        <div className="ad-content">
          <AdsterraNativeBanner />
        </div>
        <span className="ad-label ad-label--side">Advertisement</span>
        <span className="ad-label ad-label--mobile">Advertisement</span>
      </div>
    );
  }

  if (variant === "topResponsive") {
    return (
      <div className={`ad-banner ad-banner--top ${className}`} data-section="header">
        <span className="ad-label ad-label--side">Sponsored</span>
        <div className="ad-content">
          <AdsterraBanner {...ADS.leaderboard} className="ad-unit--desktop" />
          <AdsterraBanner {...ADS.mobileBanner} className="ad-unit--mobile" />
        </div>
        <span className="ad-label ad-label--side">Advertisement</span>
        <span className="ad-label ad-label--mobile">Advertisement</span>
      </div>
    );
  }

  const ad = ADS[variant];

  return (
    <div className={`ad-banner ad-banner--${variant} ${className}`} data-section="content">
      <span className="ad-label ad-label--side">Sponsored</span>
      <div className="ad-content">
        <AdsterraBanner {...ad} />
      </div>
      <span className="ad-label ad-label--side">Advertisement</span>
      <span className="ad-label ad-label--mobile">Advertisement</span>
    </div>
  );
}