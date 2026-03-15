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
      </div>
    </>
  );
}