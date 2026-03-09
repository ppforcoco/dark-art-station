import Link from "next/link";

interface PaginationProps {
  currentPage:  number;
  totalPages:   number;
  /** Base URL without any page param — e.g. "/iphone" or "/iphone?tag=skull" */
  baseUrl:      string;
}

/** Build a URL for a given page number, preserving all existing params. */
function pageUrl(baseUrl: string, page: number): string {
  // baseUrl may already contain query params (e.g. /iphone?tag=skull)
  const separator = baseUrl.includes("?") ? "&" : "?";
  return page === 1 ? baseUrl : `${baseUrl}${separator}page=${page}`;
}

/** Which page numbers to show — always show first, last, current ±1, with ellipsis */
function getPageRange(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "…")[] = [1];

  if (current > 3)             pages.push("…");
  if (current > 2)             pages.push(current - 1);
  if (current !== 1 && current !== total) pages.push(current);
  if (current < total - 1)     pages.push(current + 1);
  if (current < total - 2)     pages.push("…");

  pages.push(total);
  // deduplicate while preserving order
  return pages.filter((v, i, arr) => arr.indexOf(v) === i);
}

export default function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  if (totalPages <= 1) return null;

  const range = getPageRange(currentPage, totalPages);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav className="pagination" aria-label="Pagination">

      {/* Previous */}
      {hasPrev ? (
        <Link
          href={pageUrl(baseUrl, currentPage - 1)}
          className="pagination-btn"
          aria-label="Previous page"
        >
          ← Prev
        </Link>
      ) : (
        <span className="pagination-btn pagination-btn--disabled" aria-disabled="true">
          ← Prev
        </span>
      )}

      {/* Page numbers */}
      {range.map((item, i) =>
        item === "…" ? (
          <span key={`ellipsis-${i}`} className="pagination-ellipsis">…</span>
        ) : (
          <Link
            key={item}
            href={pageUrl(baseUrl, item)}
            className={`pagination-btn${item === currentPage ? " pagination-btn--active" : ""}`}
            aria-label={`Page ${item}`}
            aria-current={item === currentPage ? "page" : undefined}
          >
            {item}
          </Link>
        )
      )}

      {/* Next */}
      {hasNext ? (
        <Link
          href={pageUrl(baseUrl, currentPage + 1)}
          className="pagination-btn"
          aria-label="Next page"
        >
          Next →
        </Link>
      ) : (
        <span className="pagination-btn pagination-btn--disabled" aria-disabled="true">
          Next →
        </span>
      )}

    </nav>
  );
}