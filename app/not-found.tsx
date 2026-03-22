// app/not-found.tsx
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";

export default async function NotFound() {
  let suggestions: {
    id: string; slug: string; title: string; r2Key: string;
    deviceType: string | null; collection: { slug: string } | null;
  }[] = [];

  try {
    const total = await db.image.count({ where: { collectionId: null } });
    if (total > 0) {
      const step = Math.max(1, Math.floor(total / 4));
      const results = await Promise.all(
        [0, step, step * 2, step * 3].map(skip =>
          db.image.findFirst({
            skip,
            where: { collectionId: null },
            orderBy: { createdAt: "desc" },
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

  return (
    <main className="nf-page">
      {/* Hero section */}
      <div className="nf-hero">
        <span className="nf-code">404</span>
        <h1 className="nf-title">Lost in the Dark</h1>
        <p className="nf-desc">
          This page has vanished into the void. But the darkness has more to offer —
          explore some art while you&apos;re here.
        </p>
        <div className="nf-actions">
          <Link href="/"     className="nf-btn-primary">← Back to Home</Link>
          <Link href="/shop" className="nf-btn-secondary">Browse All Collections</Link>
        </div>
      </div>

      {/* Wallpaper suggestions */}
      {suggestions.length > 0 && (
        <div className="nf-suggestions">
          <p className="nf-suggestions-label">— While you&apos;re here —</p>
          <div className="nf-grid">
            {suggestions.map(img => (
              <Link key={img.id} href={getHref(img)} className="nf-card">
                <Image
                  src={getPublicUrl(img.r2Key)}
                  alt={img.title}
                  fill
                  loading="lazy"
                  unoptimized
                  sizes="(max-width: 640px) 50vw, 25vw"
                  style={{ objectFit: "cover" }}
                />
                <div className="nf-card-overlay">
                  <span className="nf-card-title">{img.title}</span>
                  <span className="nf-card-cta">↓ Free Download</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .nf-page {
          background: #070710;
          min-height: 100vh;
          color: #f0ecff;
        }

        /* ── Hero ── */
        .nf-hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 100px 24px 60px;
          gap: 20px;
        }
        .nf-code {
          font-family: var(--font-space), monospace;
          font-size: 0.65rem;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          color: #c0001a;
          border: 1px solid rgba(192,0,26,0.35);
          padding: 6px 20px;
        }
        .nf-title {
          font-family: var(--font-cinzel), cursive;
          font-size: clamp(3rem, 8vw, 6rem);
          font-weight: 900;
          color: #f0ecff;
          line-height: 1.05;
          margin: 0;
          letter-spacing: -0.01em;
        }
        .nf-desc {
          font-family: var(--font-cormorant), Georgia, serif;
          font-style: italic;
          font-size: clamp(1.1rem, 2.5vw, 1.4rem);
          color: #6a6080;
          line-height: 1.65;
          max-width: 520px;
          margin: 0;
        }
        .nf-actions {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 8px;
        }
        .nf-btn-primary {
          font-family: var(--font-space), monospace;
          font-size: 0.68rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #f0ecff;
          background: #c0001a;
          border: 1px solid #c0001a;
          padding: 16px 32px;
          text-decoration: none;
          transition: background 0.2s;
          min-height: 52px;
          display: flex;
          align-items: center;
        }
        .nf-btn-primary:hover { background: #a00016; }
        .nf-btn-secondary {
          font-family: var(--font-space), monospace;
          font-size: 0.68rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #c9a84c;
          background: transparent;
          border: 1px solid rgba(201,168,76,0.4);
          padding: 16px 32px;
          text-decoration: none;
          transition: border-color 0.2s, background 0.2s;
          min-height: 52px;
          display: flex;
          align-items: center;
        }
        .nf-btn-secondary:hover { border-color: #c9a84c; background: rgba(201,168,76,0.08); }

        /* ── Suggestions grid ── */
        .nf-suggestions {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px 80px;
        }
        .nf-suggestions-label {
          font-family: var(--font-space), monospace;
          font-size: 0.58rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #4a445a;
          text-align: center;
          margin-bottom: 24px;
        }
        .nf-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        @media (max-width: 767px) {
          .nf-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .nf-hero { padding: 80px 20px 40px; }
        }
        .nf-card {
          position: relative;
          aspect-ratio: 9 / 16;
          overflow: hidden;
          display: block;
          text-decoration: none;
          border: 1px solid #2a2535;
          background: #0a0a0a;
          transition: border-color 0.25s, transform 0.25s;
        }
        .nf-card:hover {
          border-color: rgba(192,0,26,0.6);
          transform: translateY(-4px);
        }
        .nf-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(5,5,14,0.95) 0%, rgba(5,5,14,0.3) 50%, transparent 100%);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 16px 12px;
          gap: 6px;
          opacity: 0;
          transition: opacity 0.25s;
        }
        .nf-card:hover .nf-card-overlay { opacity: 1; }
        .nf-card-title {
          font-family: var(--font-cormorant), serif;
          font-style: italic;
          font-size: 0.9rem;
          color: #f0ecff;
          line-height: 1.3;
        }
        .nf-card-cta {
          font-family: var(--font-space), monospace;
          font-size: 0.5rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #c9a84c;
        }
      `}</style>
    </main>
  );
}