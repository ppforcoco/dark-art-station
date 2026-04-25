"use client";

import { useState } from "react";

interface Props {
  /** Optional server-side HTML body from the CMS — rendered first if present */
  html: string | null;
  /** Fallback children rendered when no html is available */
  children: React.ReactNode;
}

/**
 * ReadMoreIntro
 * Shows the first paragraph (or CMS html) and collapses the rest behind a
 * "Read more" toggle. If html is supplied it is rendered as raw HTML;
 * otherwise the children are used as fallback.
 */
export default function ReadMoreIntro({ html, children }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (html) {
    return (
      <div className="read-more-intro">
        <div
          className={`read-more-body ${expanded ? "read-more-body--open" : ""}`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <button
          className="read-more-btn"
          onClick={() => setExpanded(v => !v)}
          aria-expanded={expanded}
        >
          {expanded ? "Show less ↑" : "Read more ↓"}
        </button>
        <style>{`
          .read-more-intro { display: flex; flex-direction: column; gap: 10px; }
          .read-more-body { overflow: hidden; max-height: 120px; transition: max-height 0.4s ease; mask-image: linear-gradient(to bottom, black 60%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, black 60%, transparent 100%); }
          .read-more-body--open { max-height: 1000px; mask-image: none; -webkit-mask-image: none; }
          .read-more-btn { align-self: flex-start; background: none; border: none; font-family: var(--font-space, monospace); font-size: 0.58rem; letter-spacing: 0.14em; text-transform: uppercase; color: #c0001a; cursor: pointer; padding: 4px 0; transition: color 0.2s; }
          .read-more-btn:hover { color: #ff2222; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="read-more-intro">
      <div className={`read-more-body read-more-children ${expanded ? "read-more-body--open" : ""}`}>
        {children}
      </div>
      <button
        className="read-more-btn"
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
      >
        {expanded ? "Show less ↑" : "Read more ↓"}
      </button>
      <style>{`
        .read-more-intro { display: flex; flex-direction: column; gap: 10px; }
        .read-more-body { overflow: hidden; max-height: 120px; transition: max-height 0.4s ease; mask-image: linear-gradient(to bottom, black 60%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, black 60%, transparent 100%); }
        .read-more-body--open { max-height: 1000px; mask-image: none; -webkit-mask-image: none; }
        .read-more-children p { font-family: var(--font-cormorant, serif); font-size: 1rem; color: var(--text-muted, #8a8099); line-height: 1.75; margin: 0 0 12px; }
        .read-more-btn { align-self: flex-start; background: none; border: none; font-family: var(--font-space, monospace); font-size: 0.58rem; letter-spacing: 0.14em; text-transform: uppercase; color: #c0001a; cursor: pointer; padding: 4px 0; transition: color 0.2s; }
        .read-more-btn:hover { color: #ff2222; }
      `}</style>
    </div>
  );
}