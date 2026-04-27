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
 * Renders a visible breadcrumb trail in the .path-bar strip (sticky, below nav).
 * Also injects Schema.org BreadcrumbList JSON-LD for Google rich results.
 *
 * Usage:
 *   <Breadcrumbs items={[
 *     { label: "Home",        href: "/" },
 *     { label: "Collections", href: "/shop" },
 *     { label: "Dark Goddess" },
 *   ]} />
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

      {/* path-bar CSS class: sticky strip immediately below the nav */}
      <div className="path-bar">
        <nav aria-label="Breadcrumb">
          <ol className="breadcrumbs">
            {items.map((item, index) => {
              const isLast = index === items.length - 1;
              return (
                <li key={index} className="breadcrumb-item">
                  {index > 0 && (
                    <span className="breadcrumb-sep" aria-hidden="true">/</span>
                  )}
                  {isLast || !item.href ? (
                    <span
                      className="breadcrumb-current"
                      aria-current="page"
                      title={item.label}
                    >
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      href={item.href}
                      className="breadcrumb-link"
                      title={item.label}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
        <style>{`
          .path-bar {
            padding: 10px clamp(16px,4vw,52px);
            border-bottom: 1px solid var(--border-dim);
            background: var(--bg-secondary, var(--bg-primary));
          }
          .breadcrumbs {
            display: flex;
            align-items: center;
            gap: 0;
            list-style: none;
            margin: 0;
            padding: 0;
            flex-wrap: wrap;
          }
          .breadcrumb-item {
            display: flex;
            align-items: center;
            gap: 0;
          }
          .breadcrumb-sep {
            font-family: var(--font-space, monospace);
            font-size: 0.65rem;
            color: var(--text-muted);
            opacity: 0.4;
            margin: 0 6px;
          }
          .breadcrumb-link {
            font-family: var(--font-space, monospace);
            font-size: 0.62rem;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: var(--text-muted);
            text-decoration: none;
            transition: color 0.2s;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 160px;
          }
          .breadcrumb-link:hover { color: var(--text-primary); }
          .breadcrumb-current {
            font-family: var(--font-space, monospace);
            font-size: 0.62rem;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: var(--text-primary);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 220px;
            display: inline-block;
          }
        `}</style>
      </div>
    </>
  );
}