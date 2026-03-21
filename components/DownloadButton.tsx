"use client";
import { useState } from "react";

interface Props {
  href: string;
  viewCount: number;
  label?: string;
}

export default function DownloadButton({ href, viewCount, label }: Props) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (state === "done") return;
    // Don't prevent default — let the download happen
    setState("loading");
    setTimeout(() => setState("done"), 1400);
  }

  const buttonLabel =
    state === "loading"
      ? "Preparing Download…"
      : state === "done"
      ? "✓ Download Started"
      : label ?? "↓ Download 4K · Free";

  const bgColor =
    state === "done"
      ? "#1a5c35"
      : state === "loading"
      ? "#6b0000"
      : "#8b0000";

  return (
    <div className="download-btn-wrap">
      {/* Stats row */}
      <div className="download-stats-row">
        <span className="download-stat">
          👁 {viewCount.toLocaleString()} views
        </span>
        <span
          className="download-saved-msg"
          style={{ opacity: state === "done" ? 1 : 0 }}
          aria-live="polite"
        >
          ✓ Check your downloads folder
        </span>
      </div>

      {/* Main CTA */}
      <a
        href={state === "loading" ? "#" : href}
        onClick={handleClick}
        className="download-btn"
        style={{ backgroundColor: bgColor, borderColor: bgColor }}
        aria-label={buttonLabel}
        download
      >
        {buttonLabel}
      </a>

      <p className="download-sublabel">
        JPEG · 4K resolution · No account · No watermark
      </p>
    </div>
  );
}