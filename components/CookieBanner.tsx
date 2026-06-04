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

// ── Stable anon ID ────────────────────────────────────────────────────────────
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

// ── localStorage helpers ──────────────────────────────────────────────────────
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
    const res = await fetch(`/api/consent?id=${encodeURIComponent(id)}`, { cache: "no-store" });
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

// ── Read helpers ──────────────────────────────────────────────────────────────
function readConsentSync(): ConsentState {
  return _readConsentCookie() ?? _readLS();
}

async function readConsentFull(): Promise<ConsentState> {
  const sync = readConsentSync();
  if (sync) return sync;
  const db = await _readDB();
  if (db) {
    _writeConsentCookie(db);
    _writeLS(db);
  }
  return db;
}

// ── Write all three layers ────────────────────────────────────────────────────
function writeConsent(value: "accepted" | "declined") {
  _writeConsentCookie(value);
  _writeLS(value);
  _writeDB(value);
  window.dispatchEvent(new CustomEvent("hw-consent-change", { detail: value }));
}

export function getConsent(): ConsentState { return readConsentSync(); }
export function setConsentValue(value: "accepted" | "declined") { writeConsent(value); }


// ── Component ─────────────────────────────────────────────────────────────────
export default function CookieBanner() {
  const [visible, setVisible] = useState<boolean>(false);
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    // ✅ PERF FIX: Show banner immediately if no local consent found.
    // Previously: waited for a DB roundtrip (/api/consent) before showing banner.
    // Now: show instantly from cookie/localStorage. DB is only written on accept/decline.
    // This eliminates the API call delay on first visit entirely.
    const sync = readConsentSync();
    if (sync === null) {
      setVisible(true);
    }
    // Still sync to DB in background on accept/decline (via writeConsent)
    // No need to read from DB on mount — local storage is source of truth.
  }, []);

  function accept() {
    writeConsent("accepted");
    setVisible(false);
  }

  function decline() {
    writeConsent("declined");
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
          <Link prefetch={false} href="/privacy#cookies" className="cookie-link">Privacy</Link>
          {" · "}
          <Link prefetch={false} href="/terms" className="cookie-link">Terms</Link>
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
    </>
  );
}