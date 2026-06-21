// lib/track.ts
//
// Dual-logs every tracked event:
//   1. Umami (window.umami.track) — kept for backward compatibility, but
//      silently no-ops if the script is blocked by an ad-blocker / Brave
//      Shields / privacy browser, which is common.
//   2. First-party endpoint (/api/hw-sig) — same-origin, neutrally named
//      straight to our own Postgres DB, can't be blocked the way a
//      third-party analytics domain can. This is the one to trust.
//
// Session id: a random UUID stored in a first-party cookie ("hw_sid"),
// generated once per browser and reused on every visit for a year. Not
// tied to any personal info — just lets us group page views/events that
// belong to the same visitor.

type TrackPayload = Record<string, string | number | boolean | undefined>;

const SESSION_COOKIE  = "hw_sid";
const SESSION_MAX_AGE = 60 * 60 * 24 * 365; // 1 year, seconds

// ── Paths that should never be tracked ───────────────────────────────────────
// The admin dashboard visiting itself (or any /admin* sub-route) shouldn't
// show up as a "visitor" in its own Visitors tab — that's just you working,
// not someone discovering the site.
const EXCLUDED_PATH_PREFIXES = ["/admin", "/api/hw-admin"];

function isExcludedPath(path: string): boolean {
  return EXCLUDED_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));
}

function getSessionId(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp(`(?:^|; )${SESSION_COOKIE}=([^;]+)`));
  if (match) return match[1];

  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  document.cookie = `${SESSION_COOKIE}=${id}; path=/; max-age=${SESSION_MAX_AGE}; samesite=lax`;
  return id;
}

function sendFirstParty(type: string, path: string, meta?: TrackPayload): void {
  if (typeof window === "undefined") return;
  try {
    const body = JSON.stringify({ sessionId: getSessionId(), type, path, meta });
    if (navigator.sendBeacon) {
      // sendBeacon survives the tab closing — important for duration pings.
      navigator.sendBeacon("/api/hw-sig", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/hw-sig", { method: "POST", body, keepalive: true }).catch(() => {});
    }
  } catch {
    // Never let analytics break the actual user-facing action it's attached to.
  }
}

// ── Named events — download clicks, preview opens, favorites, etc. ───────────
// Safe to call from anywhere on the client.
export function track(event: string, data?: TrackPayload): void {
  if (typeof window === "undefined") return;
  if (isExcludedPath(window.location.pathname)) return;

  const umami = (window as unknown as { umami?: { track: (e: string, d?: TrackPayload) => void } }).umami;
  if (umami && typeof umami.track === "function") {
    try { umami.track(event, data); } catch {}
  }

  // Always dual-log first-party too, even if Umami is blocked or absent.
  sendFirstParty(event, window.location.pathname, data);
}

// ── First-party only — called once per page by <SiteAnalytics /> ─────────────
// Umami already auto-tracks pageviews via its own script, so these aren't
// mirrored to window.umami (that would double-count there).
export function trackPageview(path: string): void {
  if (isExcludedPath(path)) return;
  sendFirstParty("pageview", path);
}

export function trackDuration(path: string, seconds: number): void {
  if (isExcludedPath(path)) return;
  if (seconds <= 0) return;
  sendFirstParty("duration", path, { seconds });
}