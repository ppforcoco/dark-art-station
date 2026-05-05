"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

// ─── Consent helpers ──────────────────────────────────────────────────────────
// Uses a real HTTP cookie (not localStorage) so Safari ITP doesn't wipe it.
// Cookie is SameSite=Lax; max-age 1 year. Falls back to localStorage as backup.
export type ConsentState = "accepted" | "declined" | null;
const COOKIE_NAME = "hw-cookie-consent";
const MAX_AGE = 60 * 60 * 24 * 365; // 1 year in seconds

function getCookieValue(): ConsentState {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(COOKIE_NAME + "="));
  if (match) return match.split("=")[1] as ConsentState;
  // Fallback: check localStorage for users who previously consented
  try {
    return (localStorage.getItem(COOKIE_NAME) as ConsentState) ?? null;
  } catch {
    return null;
  }
}

function setCookieValue(value: "accepted" | "declined") {
  // Set real HTTP cookie — persists across Safari sessions.
  // "Secure" is required so Safari ITP does not classify this as a tracking
  // cookie and strip it after 7 days. SameSite=Lax is kept for compatibility.
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_NAME}=${value}; max-age=${MAX_AGE}; path=/; SameSite=Lax${secure}`;
  // Also write localStorage as belt-and-suspenders backup
  try { localStorage.setItem(COOKIE_NAME, value); } catch {}
  window.dispatchEvent(new CustomEvent("hw-consent-change", { detail: value }));
}

export function getConsent(): ConsentState {
  return getCookieValue();
}

export function setConsentValue(value: "accepted" | "declined") {
  setCookieValue(value);
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existing = getCookieValue();
    if (existing === null) {
      setVisible(true);
    } else if (existing === "accepted") {
      // Returning user who already accepted — restore full consent
      if (typeof (window as any).gtag === "function") {
        (window as any).gtag("consent", "update", {
          ad_storage:         "granted",
          ad_user_data:       "granted",
          ad_personalization: "granted",
          analytics_storage:  "granted",
        });
      }
    }
    // declined users: consent stays denied (already set as default in layout.tsx)
  }, []);

  function accept() {
    setCookieValue("accepted");
    setVisible(false);
    if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
      (window as any).gtag("consent", "update", {
        ad_storage:          "granted",
        ad_user_data:        "granted",
        ad_personalization:  "granted",
        analytics_storage:   "granted",
      });
    }
  }

  function decline() {
    setCookieValue("declined");
    setVisible(false);
    if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
      (window as any).gtag("consent", "update", {
        ad_storage:          "denied",
        ad_user_data:        "denied",
        ad_personalization:  "denied",
        analytics_storage:   "denied",
      });
    }
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
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          z-index: 9998;
          animation: cookie-fade-in 0.3s ease;
        }
        .cookie-banner {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 9999;
          background: #0e0c14;
          border-top: 1px solid rgba(192,0,26,0.5);
          padding: 20px 24px calc(20px + env(safe-area-inset-bottom));
          box-shadow: 0 -8px 40px rgba(0,0,0,0.6);
          animation: cookie-slide-up 0.35s cubic-bezier(0.22,1,0.36,1);
        }
        @keyframes cookie-fade-in {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes cookie-slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .cookie-inner {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
        }
        .cookie-text-block { flex: 1; min-width: 240px; }
        .cookie-title {
          font-family: var(--font-space), monospace;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #f0ecff;
          margin-bottom: 6px;
        }
        .cookie-desc {
          font-family: var(--font-cormorant), serif;
          font-size: 0.95rem;
          color: #8a8099;
          line-height: 1.5;
        }
        .cookie-link { color: #c9a84c; text-decoration: underline; text-underline-offset: 2px; }
        .cookie-link:hover { color: #f0ecff; }
        .cookie-actions { display: flex; gap: 10px; flex-shrink: 0; }
        .cookie-btn {
          font-family: var(--font-space), monospace;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 0 20px;
          min-height: 44px;
          border: 1px solid;
          cursor: pointer;
          transition: background-color 0.2s ease, color 0.2s ease;
          touch-action: manipulation;
          white-space: nowrap;
        }
        .cookie-btn--decline { background: transparent; border-color: #2a2535; color: #8a8099; }
        .cookie-btn--decline:hover { border-color: #8a8099; color: #f0ecff; }
        .cookie-btn--accept { background: #8b0000; border-color: #8b0000; color: #ffffff; }
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