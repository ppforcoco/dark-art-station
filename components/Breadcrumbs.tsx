// components/Breadcrumbs.tsx
import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

/**
 * Server component.
 * Beautiful, SEO-ready breadcrumb trail with Schema.org BreadcrumbList JSON-LD.
 * Visually stunning — readable by bots AND humans. Every link is obviously clickable.
 */
export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (!items || items.length < 2) return null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${siteUrl}${item.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="hw-breadcrumb" aria-label="Breadcrumb">
        <ol className="hw-breadcrumb__list">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={index} className="hw-breadcrumb__item">
                {index > 0 && (
                  <span className="hw-breadcrumb__sep" aria-hidden="true">
                    <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L5 5L1 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                )}
                {isLast || !item.href ? (
                  <span className="hw-breadcrumb__current" aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <Link href={item.href} className="hw-breadcrumb__link">
                    {index === 0 && (
                      <svg className="hw-breadcrumb__home-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V9.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>

        <style>{`
          .hw-breadcrumb {
            padding: 0 clamp(16px, 4vw, 60px);
            height: 42px;
            display: flex;
            align-items: center;
            background: linear-gradient(
              to right,
              rgba(20, 14, 30, 0.98),
              rgba(14, 10, 22, 0.98)
            );
            border-bottom: 1px solid rgba(192, 0, 26, 0.15);
            position: relative;
            overflow: hidden;
          }

          /* Subtle left accent line */
          .hw-breadcrumb::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 2px;
            background: linear-gradient(to bottom, transparent, #8b0000, transparent);
          }

          /* Very faint glow */
          .hw-breadcrumb::after {
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(ellipse 40% 100% at 0% 50%, rgba(139,0,0,0.06) 0%, transparent 70%);
            pointer-events: none;
          }

          .hw-breadcrumb__list {
            display: flex;
            align-items: center;
            list-style: none;
            margin: 0;
            padding: 0;
            gap: 0;
            flex-wrap: nowrap;
            min-width: 0;
          }

          .hw-breadcrumb__item {
            display: flex;
            align-items: center;
            min-width: 0;
            flex-shrink: 0;
          }

          .hw-breadcrumb__sep {
            display: flex;
            align-items: center;
            color: rgba(139, 0, 0, 0.5);
            margin: 0 8px;
            flex-shrink: 0;
          }

          .hw-breadcrumb__link {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            font-family: var(--font-space, 'Space Mono', monospace);
            font-size: 0.62rem;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            color: rgba(180, 160, 220, 0.6);
            text-decoration: none;
            padding: 4px 10px;
            border-radius: 2px;
            border: 1px solid transparent;
            transition: color 0.2s ease, background 0.2s ease, border-color 0.2s ease;
            white-space: nowrap;
            position: relative;
            z-index: 1;
          }

          .hw-breadcrumb__link:hover {
            color: #e0d4f8;
            background: rgba(139, 0, 0, 0.1);
            border-color: rgba(139, 0, 0, 0.25);
          }

          .hw-breadcrumb__home-icon {
            opacity: 0.7;
            flex-shrink: 0;
            transition: opacity 0.2s;
          }

          .hw-breadcrumb__link:hover .hw-breadcrumb__home-icon {
            opacity: 1;
          }

          .hw-breadcrumb__current {
            font-family: var(--font-space, 'Space Mono', monospace);
            font-size: 0.62rem;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            color: #c9a84c;
            padding: 4px 2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 260px;
          }

          @media (max-width: 480px) {
            .hw-breadcrumb { padding: 0 16px; height: 38px; }
            .hw-breadcrumb__link { font-size: 0.56rem; padding: 3px 6px; letter-spacing: 0.1em; }
            .hw-breadcrumb__current { font-size: 0.56rem; letter-spacing: 0.1em; max-width: 140px; }
            .hw-breadcrumb__sep { margin: 0 5px; }
          }
        `}</style>
      </nav>
    </>
  );
}