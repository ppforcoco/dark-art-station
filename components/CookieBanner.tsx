"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export type ConsentState = "accepted" | "declined" | null;
const COOKIE_NAME = "hw-cookie-consent";
const MAX_AGE = 60 * 60 * 24 * 365;

// ── Generates/retrieves a stable anonymous user ID for DB fallback ────────────
function getAnonId(): string {
  try {
    let id = localStorage.getItem("hw-anon-id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("hw-anon-id", id);
    }
    return id;
  } catch {
    // Safari private mode — fall back to session-scoped ID stored on window
    if (!(window as any).__hwAnonId) {
      (window as any).__hwAnonId = crypto.randomUUID();
    }
    return (window as any).__hwAnonId;
  }
}

// ── Cookie helpers ────────────────────────────────────────────────────────────
function _writeCookie(value: "accepted" | "declined") {
  if (typeof document === "undefined") return;
  // SameSite=None + Secure is needed for Safari cross-site contexts.
  // SameSite=Lax is fine for first-party — keep Lax here.
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_NAME}=${value}; max-age=${MAX_AGE}; path=/; SameSite=Lax${secure}`;
}

function _readCookie(): ConsentState {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((r) => r.startsWith(COOKIE_NAME + "="));
  if (match) {
    const v = match.split("=")[1];
    if (v === "accepted" || v === "declined") return v as ConsentState;
  }
  return null;
}

// ── localStorage helpers (may throw in Safari private mode) ──────────────────
function _readLS(): ConsentState {
  try {
    const v = localStorage.getItem(COOKIE_NAME);
    if (v === "accepted" || v === "declined") return v as ConsentState;
  } catch {}
  return null;
}

function _writeLS(value: "accepted" | "declined") {
  try {
    localStorage.setItem(COOKIE_NAME, value);
  } catch {}
}

// ── DB fallback via API route ─────────────────────────────────────────────────
async function _readDB(): Promise<ConsentState> {
  try {
    const id = getAnonId();
    const res = await fetch(`/api/consent?id=${encodeURIComponent(id)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.value === "accepted" || json.value === "declined") return json.value;
  } catch {}
  return null;
}

async function _writeDB(value: "accepted" | "declined") {
  try {
    const id = getAnonId();
    await fetch("/api/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, value }),
    });
  } catch {}
}

// ── Combined read: cookie → localStorage → DB ────────────────────────────────
function readConsentSync(): ConsentState {
  return _readCookie() ?? _readLS();
}

async function readConsentFull(): Promise<ConsentState> {
  const sync = readConsentSync();
  if (sync) return sync;
  // Only hit DB if both client storages came up empty
  const db = await _readDB();
  if (db) {
    // Re-hydrate local storages so future loads are instant
    _writeCookie(db);
    _writeLS(db);
  }
  return db;
}

// ── Combined write: all three layers ─────────────────────────────────────────
function writeConsent(value: "accepted" | "declined") {
  _writeCookie(value);
  _writeLS(value);
  _writeDB(value); // fire-and-forget
  window.dispatchEvent(new CustomEvent("hw-consent-change", { detail: value }));
}

// Public helpers for use in layout / gtag setup
export function getConsent(): ConsentState {
  return readConsentSync();
}
export function setConsentValue(value: "accepted" | "declined") {
  writeConsent(value);
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function CookieBanner() {
  // Start hidden on SSR; on client we'll check storage immediately then
  // optionally fall back to DB asynchronously.
  const [visible, setVisible] = useState<boolean>(false);
  const [checked, setChecked] = useState(false);
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    // 1. Sync check (instant — no flash)
    const sync = readConsentSync();
    if (sync !== null) {
      // Restore gtag for accepted users
      if (sync === "accepted") fireGtag("accepted");
      setChecked(true);
      return; // banner stays hidden
    }

    // 2. Async DB check (Safari ITP may have wiped cookies + localStorage)
    readConsentFull().then((result) => {
      if (result !== null) {
        if (result === "accepted") fireGtag("accepted");
        setChecked(true);
        // banner stays hidden
      } else {
        // Genuinely no consent on record — show banner
        setVisible(true);
        setChecked(true);
      }
    });
  }, []);

  function fireGtag(decision: "accepted" | "declined") {
    if (typeof (window as any).gtag !== "function") return;
    const granted = decision === "accepted" ? "granted" : "denied";
    (window as any).gtag("consent", "update", {
      ad_storage: granted,
      ad_user_data: granted,
      ad_personalization: granted,
      analytics_storage: granted,
    });
  }

  function accept() {
    writeConsent("accepted");
    fireGtag("accepted");
    setVisible(false);
  }

  function decline() {
    writeConsent("declined");
    fireGtag("declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <>
      <div className="cookie-overlay" aria-hidden="true" />
      <div
        className="cookie-banner"
        role="dialog"
        aria-modal="true"
        aria-label="Cookie consent"
        aria-live="polite"
      >
        <div className="cookie-inner">
          <div className="cookie-text-block">
            <p className="cookie-title">🍪 This site uses cookies</p>
            <p className="cookie-desc">
              We use Google AdSense to serve ads that keep this site free.
              Personalised ads use cookies based on your browsing activity.
              You can accept or decline — your choice is saved.{" "}
              <Link href="/privacy#cookies" className="cookie-link">
                Privacy Policy
              </Link>
              {" · "}
              <Link href="/terms" className="cookie-link">
                Terms of Service
              </Link>
            </p>
          </div>
          <div className="cookie-actions">
            <button
              type="button"
              className="cookie-btn cookie-btn--decline"
              onClick={decline}
            >
              Decline
            </button>
            <button
              type="button"
              className="cookie-btn cookie-btn--accept"
              onClick={accept}
            >
              Accept All
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .cookie-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.45);
          z-index: 9998;
          animation: cookie-fade-in 0.3s ease;
        }
        .cookie-banner {
          position: fixed; bottom: 0; left: 0; right: 0;
          z-index: 9999;
          background: #0e0c14;
          border-top: 1px solid rgba(192,0,26,0.5);
          padding: 20px 24px calc(20px + env(safe-area-inset-bottom));
          box-shadow: 0 -8px 40px rgba(0,0,0,0.6);
          animation: cookie-slide-up 0.35s cubic-bezier(0.22,1,0.36,1);
        }
        @keyframes cookie-fade-in { from { opacity:0 } to { opacity:1 } }
        @keyframes cookie-slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .cookie-inner {
          max-width: 1280px; margin: 0 auto;
          display: flex; align-items: center; gap: 24px; flex-wrap: wrap;
        }
        .cookie-text-block { flex: 1; min-width: 240px; }
        .cookie-title {
          font-family: var(--font-space), monospace;
          font-size: 0.75rem; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: #f0ecff; margin-bottom: 6px;
        }
        .cookie-desc {
          font-family: var(--font-cormorant), serif;
          font-size: 0.95rem; color: #8a8099; line-height: 1.5;
        }
        .cookie-link { color: #c9a84c; text-decoration: underline; text-underline-offset: 2px; }
        .cookie-link:hover { color: #f0ecff; }
        .cookie-actions { display: flex; gap: 10px; flex-shrink: 0; }
        .cookie-btn {
          font-family: var(--font-space), monospace;
          font-size: 0.65rem; font-weight: 700;
          letter-spacing: 0.15em; text-transform: uppercase;
          padding: 0 20px; min-height: 44px;
          border: 1px solid; cursor: pointer;
          transition: background-color 0.2s, color 0.2s;
          touch-action: manipulation; white-space: nowrap;
        }
        .cookie-btn--decline { background: transparent; border-color: #2a2535; color: #8a8099; }
        .cookie-btn--decline:hover { border-color: #8a8099; color: #f0ecff; }
        .cookie-btn--accept { background: #8b0000; border-color: #8b0000; color: #fff; }
        .cookie-btn--accept:hover { background: #a80000; border-color: #a80000; }
        @media (max-width: 639px) {
          .cookie-inner { flex-direction: column; align-items: stretch; gap: 16px; }
          .cookie-actions { flex-direction: row; }
          .cookie-btn { flex: 1; }
        }
        [data-theme="fog"] .cookie-banner { background: #f4f1ea; border-top-color: rgba(192,0,26,0.3); }
        [data-theme="fog"] .cookie-title { color: #1a1814; }
        [data-theme="fog"] .cookie-desc  { color: #5a5450; }
        [data-theme="fog"] .cookie-btn--decline { border-color: #cdc8bc; color: #5a5450; }
        [data-theme="fog"] .cookie-btn--decline:hover { border-color: #5a5450; color: #1a1814; }
      `}</style>
    </>
  );
}