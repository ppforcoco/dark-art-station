"use client";
// components/VaultSealedView.tsx
//
// Minimal "Back In The Town" sealed screen — same style as the locked grid
// cards (🔒 + label + live countdown), nothing else.
//
// Rendered DIRECTLY by a server component when it already knows (via
// isImagePremiumLocked() on the server) that an item is locked — instead of
// always rendering the real image/download markup and hiding it client-side.
// This keeps a locked premium image's URL out of the page HTML entirely.

import { useEffect, useState } from "react";

// ─── Cycle constants — must match all other files ──────────────────────────
const EPOCH_MS  = Date.UTC(2025, 0, 1, 0, 0, 0);
const CYCLE_MS  = 48 * 60 * 60 * 1000;
const UNLOCK_MS = 24 * 60 * 60 * 1000;

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

interface VaultSealedViewProps {
  devicePath?: string;
}

export default function VaultSealedView({ devicePath = "iphone" }: VaultSealedViewProps) {
  const [msRemaining, setMsRemaining] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setMsRemaining(getMsUntilUnlock());
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const { h, m, s } = fmt(msRemaining ?? 0);

  return (
    <main style={{
      minHeight: "100vh",
      backgroundColor: "var(--bg-primary, #07050f)",
      color: "var(--text-primary, #e8e4f8)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      padding: "40px 24px",
      textAlign: "center",
    }}>
      <span style={{ fontSize: "20px", opacity: 0.6 }}>🔒</span>

      <span style={{
        fontFamily: "var(--font-space, monospace)",
        fontSize: "0.62rem",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.45)",
        fontWeight: 700,
      }}>
        BACK IN THE TOWN
      </span>

      <span style={{
        fontFamily: "var(--font-space, monospace)",
        fontSize: "0.72rem",
        fontWeight: 700,
        color: "#c9a84c",
        letterSpacing: "0.08em",
      }}>
        BACK IN {h}h {m}m {s}s
      </span>
    </main>
  );
}