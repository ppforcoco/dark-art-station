"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface Props {
  prevHref: string | null;
  nextHref: string | null;
}

export default function KeyboardNav({ prevHref, nextHref }: Props) {
  const router = useRouter();

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      // Ignore when user is typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if ((e.key === "ArrowLeft" || e.key === "ArrowUp") && prevHref) {
        router.push(prevHref);
      }
      if ((e.key === "ArrowRight" || e.key === "ArrowDown") && nextHref) {
        router.push(nextHref);
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [prevHref, nextHref, router]);

  // Invisible hint shown on first visit only
  return (
    <div
      aria-hidden="true"
      style={{
        textAlign: "center",
        padding: "8px 0 0",
        fontSize: "0.58rem",
        fontFamily: "monospace",
        color: "var(--text-muted, #6b6480)",
        letterSpacing: "0.1em",
        opacity: 0.6,
        userSelect: "none",
      }}
    >
      ← → arrow keys to navigate
    </div>
  );
}