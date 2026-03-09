import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string; // omit for the current (last) item
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

/**
 * Server component — no 'use client' needed.
 * Each page passes its own trail explicitly via props.
 *
 * Renders semantic <nav aria-label="Breadcrumb"> with Schema.org
 * BreadcrumbList JSON-LD so Google recognises the structure.
 *
 * Usage:
 *   <Breadcrumbs items={[
 *     { label: "Home",        href: "/"            },
 *     { label: "Collections", href: "/collections" },
 *     { label: "Dark Goddess" },   ← current page, no href
 *   ]} />
 */
export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (!items || items.length < 2) return null;

  // Schema.org JSON-LD for Google rich results
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href
        ? { item: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}${item.href}` }
        : {}),
    })),
  };

  return (
    <>
      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="Breadcrumb">
        <ol className="breadcrumbs">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={index} className="breadcrumb-item">
                {/* Separator — not before the first item */}
                {index > 0 && (
                  <span className="breadcrumb-sep" aria-hidden="true">/</span>
                )}

                {/* Last item = current page, no link */}
                {isLast || !item.href ? (
                  <span
                    className="breadcrumb-current"
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link href={item.href} className="breadcrumb-link">
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}