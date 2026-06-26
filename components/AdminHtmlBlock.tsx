"use client";
import { useEffect, useRef } from "react";

/**
 * AdminHtmlBlock — renders admin-provided HTML as a styled div.
 * Replaced iframe (which caused "allow-scripts + allow-same-origin" browser warnings)
 * with a simple div. Admin HTML is already sanitized server-side.
 */
function stripExternalStylesheets(html: string): string {
  // Remove any <link rel="stylesheet"> tags (e.g. Google Fonts injected via admin)
  return html.replace(/<link[^>]+rel=["']stylesheet["'][^>]*\/?>/gi, "")
             .replace(/<link[^>]+href=["'][^"']*fonts\.googleapis[^"']*["'][^>]*\/?>/gi, "");
}

export default function AdminHtmlBlock({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const cleanHtml = stripExternalStylesheets(html);

  useEffect(() => {
    // Apply dark theme styles to any nested elements
    const el = ref.current;
    if (!el) return;
    // Resize images to be responsive
    el.querySelectorAll("img").forEach((img) => {
      img.style.maxWidth = "100%";
      img.style.height = "auto";
    });
  }, [html]);

  return (
    <div
      ref={ref}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
      style={{
        width: "100%",
        maxWidth: "100%",
        marginBottom: "32px",
        backgroundColor: "var(--bg-primary, #0c0b14)",
        color: "var(--text-primary, #e8e4dc)",
        fontSize: "clamp(0.82rem, 2.2vw, 1rem)",
        lineHeight: 1.7,
        colorScheme: "dark",
        overflowX: "hidden",
        overflowWrap: "break-word",
        wordBreak: "break-word",
        boxSizing: "border-box",
      }}
      className="admin-html-block"
    />
  );
}