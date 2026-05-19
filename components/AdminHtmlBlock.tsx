"use client";

import { useEffect, useRef } from "react";

/**
 * AdminHtmlBlock
 *
 * Renders admin-provided HTML (which can be a full standalone page with its own
 * <style>, <script>, <svg>, grid layouts, animations etc.) inside a sandboxed
 * iframe that auto-sizes to its content height.
 *
 * This means ANY HTML the admin pastes works perfectly — no sanitisation needed.
 */
export default function AdminHtmlBlock({ html }: { html: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument;
    if (!doc) return;

    const darkBase = `<style>html,body{background:#0c0b14;color:#e8e4dc;margin:0;padding:0;}*{box-sizing:border-box;}</style>`;
    doc.open();
    doc.write(darkBase + html);
    doc.close();

    // Auto-size iframe to content height
    const resize = () => {
      try {
        const h = doc.documentElement.scrollHeight || doc.body?.scrollHeight || 400;
        iframe.style.height = h + "px";
      } catch {
        iframe.style.height = "400px";
      }
    };

    // Resize after content loads + fonts settle
    iframe.onload = resize;
    setTimeout(resize, 200);
    setTimeout(resize, 800);
  }, [html]);

  return (
    <iframe
      ref={iframeRef}
      style={{
        width: "100%",
        height: "400px", // initial before resize kicks in
        border: "none",
        display: "block",
        marginBottom: "32px",
        backgroundColor: "var(--bg-primary, #0c0b14)",
        colorScheme: "dark",
      }}
      sandbox="allow-scripts allow-same-origin"
      title="Collection description"
    />
  );
}