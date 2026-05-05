"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export type ConsentState = "accepted" | "declined" | null;
const COOKIE_NAME = "hw-cookie-consent";
const ANON_ID_COOKIE = "hw-anon-id";
const MAX_AGE = 60 * 60 * 24 * 365;

// ── Cookie read/write ─────────────────────────────────────────────────────────
function _readCookieRaw(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split("; ").find((r) => r.startsWith(name + "="));
  return match ? match.split("=")[1] : null;
}

function _writeCookieRaw(name: string, value: string, maxAge: number) {
  if (typeof document === "undefined") return;
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${value}; max-age=${maxAge}; path=/; SameSite=Lax${secure}`;
}

// ── Stable anon ID — stored in a COOKIE (survives Safari ITP, not localStorage)
function getAnonId(): string {
  let id = _readCookieRaw(ANON_ID_COOKIE);
  if (!id) {
    id = crypto.randomUUID();
    _writeCookieRaw(ANON_ID_COOKIE, id, MAX_AGE);
  }
  return id;
}

// ── Consent cookie helpers ────────────────────────────────────────────────────
function _readConsentCookie(): ConsentState {
  const v = _readCookieRaw(COOKIE_NAME);
  if (v === "accepted" || v === "declined") return v;
  return null;
}

function _writeConsentCookie(value: "accepted" | "declined") {
  _writeCookieRaw(COOKIE_NAME, value, MAX_AGE);
}

// ── localStorage helpers (best-effort, may fail in Safari private mode) ───────
function _readLS(): ConsentState {
  try {
    const v = localStorage.getItem(COOKIE_NAME);
    if (v === "accepted" || v === "declined") return v as ConsentState;
  } catch {}
  return null;
}

function _writeLS(value: "accepted" | "declined") {
  try { localStorage.setItem(COOKIE_NAME, value); } catch {}
}

// ── DB fallback ───────────────────────────────────────────────────────────────
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

// ── Read: cookie → localStorage → DB ─────────────────────────────────────────
function readConsentSync(): ConsentState {
  return _readConsentCookie() ?? _readLS();
}

async function readConsentFull(): Promise<ConsentState> {
  const sync = readConsentSync();
  if (sync) return sync;
  const db = await _readDB();
  if (db) {
    // Re-hydrate all layers so future loads are instant
    _writeConsentCookie(db);
    _writeLS(db);
  }
  return db;
}

// ── Write: all three layers ───────────────────────────────────────────────────
function writeConsent(value: "accepted" | "declined") {
  _writeConsentCookie(value);
  _writeLS(value);
  _writeDB(value); // fire-and-forget
  window.dispatchEvent(new CustomEvent("hw-consent-change", { detail: value }));
}

// Public helpers
export function getConsent(): ConsentState { return readConsentSync(); }
export function setConsentValue(value: "accepted" | "declined") { writeConsent(value); }

// ── Component ─────────────────────────────────────────────────────────────────
export default function CookieBanner() {
  const [visible, setVisible] = useState<boolean>(false);
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    // 1. Instant sync check (cookie + localStorage)
    const sync = readConsentSync();
    if (sync !== null) {
      if (sync === "accepted") fireGtag("accepted");
      return; // banner stays hidden
    }

    // 2. Async DB check (last resort fallback)
    readConsentFull().then((result) => {
      if (result !== null) {
        if (result === "accepted") fireGtag("accepted");
        // banner stays hidden
      } else {
        // Genuinely no record anywhere — show banner
        setVisible(true);
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
      <div
        className="cookie-banner"
        role="dialog"
        aria-label="Cookie consent"
        aria-live="polite"
      >
        <p className="cookie-title">🍪 Cookies</p>
        <p className="cookie-desc">
          We use AdSense to keep this site free. Personalised ads use cookies.{" "}
          <Link href="/privacy#cookies" className="cookie-link">Privacy</Link>
          {" · "}
          <Link href="/terms" className="cookie-link">Terms</Link>
        </p>
        <div className="cookie-actions">
          <button
            type="button"
            className="cookie-btn cookie-btn--accept"
            onClick={accept}
          >
            Accept All
          </button>
          <button
            type="button"
            className="cookie-btn cookie-btn--decline"
            onClick={decline}
          >
            Decline
          </button>
        </div>
      </div>

      <style>{`
        .cookie-banner {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9999;
          width: 300px;
          background: #0e0c14;
          border: 1px solid rgba(192,0,26,0.5);
          border-radius: 6px;
          padding: 16px 18px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(192,0,26,0.08);
          animation: cookie-pop-in 0.35s cubic-bezier(0.22,1,0.36,1);
        }
        @keyframes cookie-pop-in {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .cookie-title {
          font-family: var(--font-space), monospace;
          font-size: 0.7rem; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: #f0ecff; margin-bottom: 6px;
        }
        .cookie-desc {
          font-family: var(--font-cormorant), serif;
          font-size: 0.88rem; color: #8a8099; line-height: 1.5;
          margin-bottom: 14px;
        }
        .cookie-link { color: #c9a84c; text-decoration: underline; text-underline-offset: 2px; }
        .cookie-link:hover { color: #f0ecff; }
        .cookie-actions { display: flex; gap: 8px; }
        .cookie-btn {
          flex: 1;
          font-family: var(--font-space), monospace;
          font-size: 0.62rem; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          min-height: 40px; border: 1px solid; cursor: pointer;
          border-radius: 3px;
          transition: background-color 0.2s, color 0.2s, border-color 0.2s;
          touch-action: manipulation; white-space: nowrap;
        }
        .cookie-btn--accept { background: #8b0000; border-color: #8b0000; color: #fff; }
        .cookie-btn--accept:hover { background: #a80000; border-color: #a80000; }
        .cookie-btn--decline { background: transparent; border-color: #2a2535; color: #8a8099; }
        .cookie-btn--decline:hover { border-color: #8a8099; color: #f0ecff; }

        @media (max-width: 400px) {
          .cookie-banner { right: 10px; left: 10px; width: auto; bottom: 10px; }
        }

        [data-theme="fog"] .cookie-banner { background: #f4f1ea; border-color: rgba(192,0,26,0.3); }
        [data-theme="fog"] .cookie-title { color: #1a1814; }
        [data-theme="fog"] .cookie-desc  { color: #5a5450; }
        [data-theme="fog"] .cookie-btn--decline { border-color: #cdc8bc; color: #5a5450; }
        [data-theme="fog"] .cookie-btn--decline:hover { border-color: #5a5450; color: #1a1814; }
      `}</style>
    </>
  );
}