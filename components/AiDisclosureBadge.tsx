// components/AiDisclosureBadge.tsx
//
// Displays a small, visible AI-generated content disclosure notice.
// Place this component:
//   - On the homepage (near the hero or above the product grid)
//   - On individual image/wallpaper detail pages (near the image)
//   - On the About page intro
//   - On collection listing pages
//
// Google AdSense policies and general transparency best practices require
// clear disclosure when content is AI-generated.
//

interface AiDisclosureBadgeProps {
  /** "inline" = small text badge (default), "block" = full-width banner */
  variant?: "inline" | "block";
  className?: string;
}

export default function AiDisclosureBadge({
  variant = "inline",
  className = "",
}: AiDisclosureBadgeProps) {
  if (variant === "block") {
    return (
      <div className={`ai-disclosure-block ${className}`}>
        <span className="ai-disclosure-icon" aria-hidden="true">✦</span>
        <span className="ai-disclosure-text">
          All artwork on this site is created using AI image generation. Each piece is
          curated and refined by our team.{" "}
          <a href="/about" className="ai-disclosure-link">Learn more about our process →</a>
        </span>
        <style>{`
          .ai-disclosure-block {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            padding: 12px 16px;
            border: 1px solid rgba(255,255,255,0.08);
            border-left: 2px solid rgba(192,0,26,0.4);
            background: rgba(192,0,26,0.04);
            font-family: var(--font-space), monospace;
            font-size: 0.6rem;
            letter-spacing: 0.08em;
            line-height: 1.7;
            color: #6b6480;
            max-width: 100%;
          }
          [data-theme="light"] .ai-disclosure-block {
            border-color: rgba(192,0,26,0.2);
            border-left-color: rgba(192,0,26,0.5);
            background: rgba(192,0,26,0.03);
            color: #7a7468;
          }
          .ai-disclosure-icon {
            color: rgba(192,0,26,0.5);
            flex-shrink: 0;
            font-size: 0.5rem;
            line-height: 1.8;
          }
          .ai-disclosure-text { flex: 1; }
          .ai-disclosure-link {
            color: rgba(192,0,26,0.8);
            text-decoration: none;
            border-bottom: 1px solid rgba(192,0,26,0.3);
          }
          .ai-disclosure-link:hover { border-color: rgba(192,0,26,0.8); }
        `}</style>
      </div>
    );
  }

  // inline (default) — a small pill badge
  return (
    <span className={`ai-disclosure-badge ${className}`} title="This image was created using AI generation">
      AI-generated art
      <style>{`
        .ai-disclosure-badge {
          display: inline-flex;
          align-items: center;
          font-family: var(--font-space), monospace;
          font-size: 0.5rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #4a445a;
          border: 1px solid rgba(255,255,255,0.1);
          padding: 3px 8px;
          line-height: 1;
          vertical-align: middle;
        }
        [data-theme="light"] .ai-disclosure-badge {
          color: #8a8270;
          border-color: rgba(0,0,0,0.12);
        }
      `}</style>
    </span>
  );
}