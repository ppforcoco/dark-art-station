// lib/track.ts
// Tiny shared wrapper around window.umami.track().
// Safe to call from anywhere on the client — no-ops silently if the
// Umami script hasn't loaded yet (blocked by an ad-blocker, still
// loading, etc.) so it never throws and never blocks the real action
// (download / preview / favorite) it's attached to.

type TrackPayload = Record<string, string | number | boolean | undefined>;

export function track(event: string, data?: TrackPayload): void {
  if (typeof window === "undefined") return;
  const umami = (window as unknown as { umami?: { track: (e: string, d?: TrackPayload) => void } }).umami;
  if (!umami || typeof umami.track !== "function") return;
  try {
    umami.track(event, data);
  } catch {
    // Never let analytics break the actual user-facing action.
  }
}