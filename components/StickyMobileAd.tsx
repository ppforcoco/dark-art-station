// components/StickyMobileAd.tsx
//
// ⛔ THIS COMPONENT IS DISABLED
//
// Why: Using a custom fixed-position <div> wrapper around a standard AdSense
// ins.adsbygoogle unit violates Google AdSense ad placement policies.
// AdSense has a dedicated "Anchor Ad" unit type for sticky bottom ads.
// The previous implementation was a regular banner slot inside a position:fixed
// container, which is not a valid ad placement and can trigger policy violations
// or "invalid activity" flags.
//
// ✅ HOW TO REPLACE:
//  1. Go to your AdSense dashboard → Ads → By ad unit → Anchor ads
//  2. Create a new "Anchor ad" unit (bottom anchor, mobile only)
//  3. AdSense will automatically inject it — no custom component needed.
//  4. The auto-ads anchor unit is fully compliant and handles its own
//     display, dismissal, and mobile targeting.
//
// This file is kept as a no-op so the import in layout.tsx doesn't break
// if you want to reintroduce a compliant anchor ad later.
//

export default function StickyMobileAd() {
  return null;
}