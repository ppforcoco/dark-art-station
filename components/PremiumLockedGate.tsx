"use client";
// components/PremiumLockedGate.tsx
//
// Drop this at the TOP of any detail page (iphone/[slug]/page.tsx, android/[slug]/page.tsx).
// If the wallpaper has tag "badge-premium" AND the global cycle is currently LOCKED,
// this replaces the entire page content with a vault gate + live countdown.
//
// Usage in detail page:
//   import PremiumLockedGate from "@/components/PremiumLockedGate";
//   // In your server component, pass tags + children:
//   <PremiumLockedGate tags={image.tags}>
//     {/* normal page content */}
//   </PremiumLockedGate>

import { useEffect, useState } from "react";
import Link from "next/link";

// ─── Cycle constants — must match all other files ──────────────────────────
const EPOCH_MS  = Date.UTC(2025, 0, 1, 0, 0, 0);
const CYCLE_MS  = 48 * 60 * 60 * 1000;
const UNLOCK_MS = 24 * 60 * 60 * 1000;

function getClientLockState(): boolean {
  const pos = (Date.now() - EPOCH_MS) % CYCLE_MS;
  return pos >= UNLOCK_MS;
}

function getMsUntilUnlock(): number {
  const pos = (Date.now() - EPOCH_MS) % CYCLE_MS;
  return Math.max(0, CYCLE_MS - pos);
}

function fmt(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return { h: pad(h), m: pad(m), s: pad(s) };
}

interface PremiumLockedGateProps {
  tags: string[];
  /** The device path for the back link: "iphone" | "android" | "pc" */
  devicePath?: string;
  children: React.ReactNode;
}

export default function PremiumLockedGate({ tags, devicePath = "iphone", children }: PremiumLockedGateProps) {
  const isPremium = tags.includes("badge-premium");

  const [isLocked, setIsLocked] = useState<boolean | null>(null);
  const [msRemaining, setMsRemaining] = useState(0);

  useEffect(() => {
    const update = () => {
      const locked = getClientLockState();
      setIsLocked(locked);
      if (locked) setMsRemaining(getMsUntilUnlock());
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  // Not yet hydrated or not premium — render children normally
  if (!isPremium || isLocked === null || !isLocked) {
    return <>{children}</>;
  }

  // LOCKED PREMIUM — show vault gate
  const { h, m, s } = fmt(msRemaining);

  return (
    <main style={{
      minHeight: "100vh",
      backgroundColor: "var(--bg-primary, #07050f)",
      color: "var(--text-primary, #e8e4f8)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 24px",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background glow */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,168,76,0.06) 0%, transparent 70%)",
      }} />

      {/* Animated corner runes */}
      {["tl","tr","bl","br"].map((pos) => (
        <span key={pos} style={{
          position: "absolute",
          top: pos.startsWith("t") ? "20px" : undefined,
          bottom: pos.startsWith("b") ? "20px" : undefined,
          left: pos.endsWith("l") ? "20px" : undefined,
          right: pos.endsWith("r") ? "20px" : undefined,
          fontFamily: "var(--font-cinzel, serif)",
          fontSize: "1.1rem",
          color: "rgba(201,168,76,0.25)",
          animation: "vaultRune 4s ease-in-out infinite",
          animationDelay: pos === "tl" ? "0s" : pos === "tr" ? "1s" : pos === "bl" ? "2s" : "3s",
        }}>†</span>
      ))}

      {/* Lock icon */}
      <div style={{
        fontSize: "56px",
        marginBottom: "24px",
        filter: "drop-shadow(0 0 20px rgba(201,168,76,0.3))",
        animation: "vaultFloat 3s ease-in-out infinite",
      }}>🔒</div>

      {/* Eyebrow */}
      <span style={{
        fontFamily: "var(--font-space, monospace)",
        fontSize: "0.6rem",
        letterSpacing: "0.28em",
        textTransform: "uppercase",
        color: "rgba(201,168,76,0.6)",
        marginBottom: "12px",
        display: "block",
      }}>Back In The Vault</span>

      {/* Main heading */}
      <h1 style={{
        fontFamily: "var(--font-cinzel, serif)",
        fontSize: "clamp(1.8rem, 4vw, 3rem)",
        fontWeight: 700,
        color: "#f0e8d8",
        margin: "0 0 16px",
        lineHeight: 1.1,
        maxWidth: "600px",
      }}>
        This Wallpaper Is Sealed
      </h1>

      <p style={{
        fontFamily: "var(--font-space, monospace)",
        fontSize: "0.85rem",
        color: "rgba(200,180,140,0.6)",
        maxWidth: "420px",
        lineHeight: 1.7,
        margin: "0 0 32px",
      }}>
        Premium wallpapers surface for 24 hours, then return to the vault.
        This one is locked away — come back when it resurfaces.
      </p>

      {/* Countdown */}
      <div style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.6rem",
        padding: "0.75rem 1.5rem",
        background: "rgba(20,14,8,0.85)",
        border: "1px solid rgba(201,168,76,0.3)",
        borderRadius: "3px",
        boxShadow: "0 0 24px rgba(201,168,76,0.08)",
        fontFamily: "var(--font-space, monospace)",
        fontSize: "0.72rem",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color: "#c9a84c",
        marginBottom: "40px",
      }}>
        <span style={{
          display: "inline-block", width: 6, height: 6, borderRadius: "50%",
          background: "#c9a84c", flexShrink: 0,
          animation: "premCountPulse 2s ease-in-out infinite",
        }} />
        <span style={{ color: "rgba(200,180,140,0.55)", letterSpacing: "0.2em" }}>BACK IN</span>
        <span style={{ fontWeight: 700 }}>{h} HRS · {m} MIN · {s} SEC</span>
      </div>

      {/* Divider */}
      <div style={{
        width: "100%", maxWidth: "360px",
        height: "1px",
        background: "linear-gradient(to right, transparent, rgba(201,168,76,0.25), transparent)",
        marginBottom: "32px",
      }} />

      {/* Back link */}
      <Link
        href={`/${devicePath}`}
        style={{
          fontFamily: "var(--font-space, monospace)",
          fontSize: "0.72rem",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "#e8e4f8",
          textDecoration: "none",
          border: "1px solid rgba(192,0,26,0.4)",
          padding: "13px 28px",
          background: "rgba(192,0,26,0.06)",
          transition: "all 0.25s ease",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(192,0,26,0.8)";
          (e.currentTarget as HTMLElement).style.background = "rgba(192,0,26,0.13)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(192,0,26,0.4)";
          (e.currentTarget as HTMLElement).style.background = "rgba(192,0,26,0.06)";
        }}
      >
        ← Browse Free Wallpapers
      </Link>

      <style>{`
        @keyframes vaultRune {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 0.6; }
        }
        @keyframes vaultFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes premCountPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </main>
  );
}