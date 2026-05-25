"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface Props {
  prevHref: string | null;
  nextHref: string | null;
  /** If true, renders the styled ← → hint inline (place this right after the More strip) */
  showHint?: boolean;
}

export default function KeyboardNav({ prevHref, nextHref, showHint }: Props) {
  const router = useRouter();

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
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

  if (!showHint) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        padding: "10px 0 4px",
        userSelect: "none",
      }}
    >
      {[{ key: "←", active: !!prevHref }, { key: "→", active: !!nextHref }].map(({ key, active }) => (
        <kbd
          key={key}
          style={{
            border: `1px solid ${active ? "#3a0006" : "#1a0002"}`,
            borderRadius: "4px",
            padding: "2px 8px",
            fontSize: "0.7rem",
            color: active ? "#6b0010" : "#2a0004",
            background: active ? "#120002" : "#0a0001",
            boxShadow: active ? "0 1px 0 #3a0006" : "none",
            lineHeight: 1.6,
            fontFamily: "monospace",
            transition: "all 0.2s",
          }}
        >
          {key}
        </kbd>
      ))}
      <span
        style={{
          fontSize: "0.62rem",
          fontFamily: "monospace",
          color: "#3a0006",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginLeft: "2px",
        }}
      >
        arrow keys to navigate
      </span>
    </div>
  );
}