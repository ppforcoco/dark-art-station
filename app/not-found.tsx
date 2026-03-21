// app/not-found.tsx
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";

export default async function NotFound() {
  // Fetch 4 random-ish wallpapers to suggest — use modulo trick to avoid full table scan
  let suggestions: { id: string; slug: string; title: string; r2Key: string; deviceType: string | null; collection: { slug: string } | null }[] = [];
  try {
    const total = await db.image.count();
    if (total > 0) {
      // Pick 4 spread across the table
      const step = Math.floor(total / 4);
      const offsets = [0, step, step * 2, step * 3];
      const results = await Promise.all(
        offsets.map(skip =>
          db.image.findFirst({
            skip,
            orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
            select: {
              id: true, slug: true, title: true, r2Key: true,
              deviceType: true,
              collection: { select: { slug: true } },
            },
          })
        )
      );
      suggestions = results.filter(Boolean) as typeof suggestions;
    }
  } catch {}

  function getHref(img: typeof suggestions[0]) {
    if (img.deviceType === "IPHONE")  return `/iphone/${img.slug}`;
    if (img.deviceType === "ANDROID") return `/android/${img.slug}`;
    if (img.deviceType === "PC")      return `/pc/${img.slug}`;
    if (img.collection?.slug)         return `/shop/${img.collection.slug}/${img.slug}`;
    return "/shop";
  }

  function isLandscape(img: typeof suggestions[0]) {
    return img.deviceType === "PC";
  }

  return (
    <main className="error-page" style={{ paddingBottom: "80px" }}>
      <div className="error-inner">
        <div className="error-sigil" aria-hidden="true">☽ ✦ ☾</div>
        <span className="error-code">404</span>
        <h1 className="error-title">Lost in the Dark</h1>
        <p className="error-desc">
          This page has vanished into the void. But you&apos;re still here —
          here&apos;s some dark art to keep you company.
        </p>
        <div className="error-actions">
          <Link href="/"     className="error-btn-primary">Back to Home →</Link>
          <Link href="/shop" className="error-btn-secondary">Browse All</Link>
        </div>
      </div>

      {/* Wallpaper suggestions */}
      {suggestions.length > 0 && (
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px 40px" }}>
          <p style={{
            fontFamily: "var(--font-space), monospace",
            fontSize: "0.6rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "#4a445a",
            marginBottom: "20px",
            textAlign: "center",
          }}>
            — While you&apos;re here —
          </p>
          <div className="nf-suggestions-grid">
            {suggestions.map(img => {
              const landscape = isLandscape(img);
              return (
                <Link
                  key={img.id}
                  href={getHref(img)}
                  className={`nf-suggestion-card${landscape ? " nf-suggestion-card--landscape" : ""}`}
                >
                  <Image
                    src={getPublicUrl(img.r2Key)}
                    alt={img.title}
                    fill
                    loading="lazy"
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 25vw"
                    style={{ objectFit: landscape ? "contain" : "cover", background: "#0a0a0a" }}
                  />
                  <div className="nf-suggestion-overlay">
                    <span className="nf-suggestion-title">{img.title}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <style>{`
        .nf-suggestions-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        @media (max-width: 767px) {
          .nf-suggestions-grid { grid-template-columns: repeat(2, 1fr); }
        }
        .nf-suggestion-card {
          position: relative;
          aspect-ratio: 9 / 16;
          overflow: hidden;
          display: block;
          text-decoration: none;
          border: 1px solid #2a2535;
          background: #0a0a0a;
          transition: border-color 0.2s ease, transform 0.2s ease;
        }
        .nf-suggestion-card--landscape {
          aspect-ratio: 16 / 9;
        }
        .nf-suggestion-card:hover {
          border-color: rgba(192,0,26,0.5);
          transform: translateY(-3px);
        }
        .nf-suggestion-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(5,5,10,0.92) 0%, transparent 60%);
          display: flex;
          align-items: flex-end;
          padding: 12px;
          opacity: 0;
          transition: opacity 0.25s ease;
        }
        .nf-suggestion-card:hover .nf-suggestion-overlay { opacity: 1; }
        .nf-suggestion-title {
          font-family: var(--font-space), monospace;
          font-size: 0.55rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #f0ecff;
        }
      `}</style>
    </main>
  );
}