// components/SocialShare.tsx
'use client';

import { useState, useEffect } from "react";

interface SocialShareProps {
  title:    string;
  imageUrl: string;
  pageUrl?: string;
}

function PinterestIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ width: "16px", height: "16px" }}>
      <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function SocialShare({ title, imageUrl, pageUrl }: SocialShareProps) {
  const url = pageUrl ?? "";
  const text = `${title} — dark fantasy wallpaper`;
  const encoded = {
    url:   encodeURIComponent(url),
    text:  encodeURIComponent(text),
    image: encodeURIComponent(imageUrl),
  };

  const links = {
    pinterest: `https://pinterest.com/pin/create/button/?url=${encoded.url}&media=${encoded.image}&description=${encoded.text}`,
    x:         `https://twitter.com/intent/tweet?text=${encoded.text}&url=${encoded.url}`,
    whatsapp:  `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
  };

  // ── Hydration-safe: only detect navigator.share on the client ──
  const [canShare, setCanShare] = useState(false);
  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  // Web Share API — fires native share sheet on mobile
  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // User cancelled or error — do nothing
      }
    }
  };

  return (
    <div className="social-share hw-social-share-v2">
      <p className="social-share-label">Send this one to someone</p>
      <div className="social-share-btns">

        {/* Web Share API — primary on mobile, hidden on desktop */}
        {canShare && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="social-btn social-btn--native"
            aria-label="Share"
            style={{ touchAction: "manipulation" }}
          >
            <ShareIcon />
            Share
          </button>
        )}

        <a
          href={links.pinterest}
          target="_blank"
          rel="noopener noreferrer"
          className="social-btn social-btn--pinterest"
          aria-label="Pin on Pinterest"
          style={{ touchAction: "manipulation" }}
        >
          <PinterestIcon />
          Pinterest
        </a>

        <a
          href={links.x}
          target="_blank"
          rel="noopener noreferrer"
          className="social-btn social-btn--x"
          aria-label="Share on X"
          style={{ touchAction: "manipulation" }}
        >
          <XIcon />
          Post on X
        </a>

        <a
          href={links.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="social-btn social-btn--whatsapp"
          aria-label="Share on WhatsApp"
          style={{ touchAction: "manipulation" }}
        >
          <WhatsAppIcon />
          WhatsApp
        </a>

      </div>

      {/*
        Scoped, !important overrides — the global stylesheet currently has
        THREE separate copies of .social-share / .social-btn rules (all
        with different, theme-blind colors), which is why these pills went
        invisible on the light theme. Rather than untangle all three here,
        this component now guarantees its own contrast regardless of what
        globals.css ends up doing. Bold text, real border, uses the theme
        vars that flip with the light/dark toggle.
      */}
      <style>{`
        .hw-social-share-v2.social-share {
          display: flex !important;
          flex-direction: column !important;
          gap: 8px !important;
          border: 1px solid rgba(255,46,158,0.35) !important;
          border-radius: 8px !important;
          padding: 12px 14px !important;
          background: rgba(255,46,158,0.06) !important;
        }
        .hw-social-share-v2 .social-share-label {
          font-family: Arial, sans-serif !important;
          font-size: 0.6rem !important;
          font-weight: 800 !important;
          letter-spacing: 0.16em !important;
          text-transform: uppercase !important;
          color: var(--text-primary) !important;
          opacity: 0.85;
        }
        .hw-social-share-v2 .social-share-btns {
          display: flex !important;
          flex-wrap: wrap !important;
          gap: 8px !important;
        }
        .hw-social-share-v2 .social-btn {
          display: inline-flex !important;
          align-items: center !important;
          gap: 7px !important;
          font-family: Arial, sans-serif !important;
          font-size: 0.72rem !important;
          font-weight: 800 !important;
          letter-spacing: 0.04em !important;
          text-decoration: none !important;
          padding: 10px 16px !important;
          min-height: 40px !important;
          border-radius: 6px !important;
          border: 1.5px solid var(--text-primary) !important;
          color: var(--text-primary) !important;
          background: var(--surface-2, rgba(0,0,0,0.15)) !important;
          transition: transform 0.15s, background 0.2s !important;
          white-space: nowrap !important;
          touch-action: manipulation;
        }
        .hw-social-share-v2 .social-btn svg { width: 15px; height: 15px; fill: currentColor; flex-shrink: 0; }
        .hw-social-share-v2 .social-btn:hover { transform: translateY(-1px); }
        .hw-social-share-v2 .social-btn--pinterest:hover { border-color: #e60023 !important; color: #e60023 !important; background: rgba(230,0,35,0.1) !important; }
        .hw-social-share-v2 .social-btn--x:hover { border-color: var(--text-primary) !important; background: rgba(120,120,120,0.15) !important; }
        .hw-social-share-v2 .social-btn--whatsapp:hover { border-color: #25d366 !important; color: #25d366 !important; background: rgba(37,211,102,0.1) !important; }
        .hw-social-share-v2 .social-btn--native { border-color: #ff2e9e !important; color: #ff2e9e !important; background: rgba(255,46,158,0.1) !important; }
        @media (max-width: 480px) {
          .hw-social-share-v2 .social-btn { padding: 9px 12px !important; font-size: 0.65rem !important; }
        }
      `}</style>
    </div>
  );
}