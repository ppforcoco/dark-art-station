import type { Metadata } from "next";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

export const metadata: Metadata = {
  title: "Blog & Guides | Haunted Wallpapers",
  description: "Dark wallpaper guides, gothic art deep-dives, how-to tutorials, and tips for your perfect screen — from Haunted Wallpapers.",
  alternates: { canonical: `${SITE_URL}/blog` },
};

const LABEL_COLORS: Record<string, string> = {
  "Wallpaper Guides":      "#c0001a",
  "How-To & Tutorials":    "#c0001a",
  "Device Setup":          "#c0001a",
  "Dark Aesthetics":       "#7c3aed",
  "Gothic & Horror":       "#7c3aed",
  "Dark Fantasy":          "#7c3aed",
  "AMOLED Wallpapers":     "#0891b2",
  "Minimalist Dark":       "#0891b2",
  "Cyberpunk & Neon":      "#0891b2",
  "Halloween Special":     "#c0001a",
  "Top Lists":             "#b45309",
  "New Releases":          "#b45309",
  // ✅ FIX: removed "18+ Mature Content" label — AdSense rejects sites
  // that publicly label content as 18+. Use "Dark Aesthetics" instead
  // if you need a category for edgier-but-safe gothic content.
};

function getLabelColor(label: string) {
  return LABEL_COLORS[label] ?? "#c0001a";
}

// Extract first <img src="..."> from the post's HTML content
function extractFirstImageFromContent(html: string): string | null {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] ?? null;
}

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    select: {
      slug: true,
      title: true,
      label: true,
      content: true,
      featuredImage: true,
      createdAt: true,
    },
  });

  const grouped = posts.reduce<Record<string, typeof posts>>((acc, p) => {
    const key = p.label ?? "Guides";
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  return (
    <main className="blog-index-page" data-force-blog="true">

      <nav className="blog-topnav">
        <div className="blog-topnav-inner">
          <Link href="/" className="blog-topnav-logo">
            <span className="blog-topnav-logo-text">HAUNTED<span>WALLPAPERS</span></span>
          </Link>
          <div className="blog-topnav-links">
            <Link href="/collections" className="blog-topnav-link">Collections</Link>
            <Link href="/iphone" className="blog-topnav-link">iPhone</Link>
            <Link href="/android" className="blog-topnav-link">Android</Link>
            <Link href="/pc" className="blog-topnav-link">PC</Link>
          </div>
        </div>
      </nav>

      <header className="blog-index-hero">
        <div className="blog-index-hero-inner">
          <p className="blog-index-eyebrow">Dark Knowledge</p>
          <h1 className="blog-index-title">
            Blog <em>&amp; Guides</em>
          </h1>
          <p className="blog-index-subtitle">
            Wallpaper guides, dark art explainers, device tutorials and gothic deep-dives.
          </p>
          {posts.length > 0 && (
            <p className="blog-index-count">{posts.length} post{posts.length !== 1 ? "s" : ""}</p>
          )}
        </div>
      </header>

      <div className="blog-index-body">

        <div className="blog-index-ad">
          <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN} width={728} height={90} />
        </div>

        {posts.length === 0 ? (
          <div className="blog-index-empty">
            <p className="blog-index-empty-glyph">✦</p>
            <p className="blog-index-empty-text">No posts yet. Check back soon.</p>
          </div>
        ) : (
          <>
            {/* ── Featured / latest post ──────────────────────────────────── */}
            {posts[0] && (() => {
              const p = posts[0];
              const excerpt = p.content
                .replace(/<[^>]*>/g, " ")
                .replace(/\s+/g, " ")
                .trim()
                .slice(0, 220);
              const dateStr = new Date(p.createdAt).toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric",
              });
              const thumb = p.featuredImage ?? extractFirstImageFromContent(p.content);

              return (
                <div className="blog-index-featured">
                  <Link href={`/blog/${p.slug}`} className="blog-featured-card">
                    <div className="blog-featured-thumb-wrap">
                      {thumb ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={thumb}
                            alt={p.title}
                            className="blog-featured-thumb-img"
                            loading="eager"
                          />
                          <div className="blog-featured-thumb-overlay" />
                        </>
                      ) : (
                        <div className="blog-featured-thumb-placeholder">✦</div>
                      )}
                    </div>
                    <div className="blog-featured-body">
                      <span className="blog-featured-eyebrow" style={{ color: getLabelColor(p.label) }}>
                        Latest · {p.label} · {dateStr}
                      </span>
                      <h2 className="blog-featured-title">{p.title}</h2>
                      <p className="blog-featured-excerpt">{excerpt}…</p>
                      <span className="blog-featured-cta">Read article →</span>
                    </div>
                  </Link>
                </div>
              );
            })()}

            {/* ── Grid of remaining posts ─────────────────────────────────── */}
            {posts.length > 1 && (
              <div className="blog-index-grid">
                {posts.slice(1).map((post) => {
                  const excerpt = post.content
                    .replace(/<[^>]*>/g, " ")
                    .replace(/\s+/g, " ")
                    .trim()
                    .slice(0, 130);
                  const dateStr = new Date(post.createdAt).toLocaleDateString("en-US", {
                    year: "numeric", month: "short", day: "numeric",
                  });
                  const thumb = post.featuredImage ?? extractFirstImageFromContent(post.content);

                  return (
                    <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-post-card">
                      {thumb ? (
                        <div className="blog-post-card-thumb-wrap">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={thumb}
                            alt={post.title}
                            className="blog-post-card-thumb-img"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="blog-post-card-thumb-placeholder">
                          <span>✦</span>
                        </div>
                      )}
                      <div className="blog-post-card-content">
                        <span className="blog-post-card-label" style={{ color: getLabelColor(post.label) }}>
                          {post.label}
                        </span>
                        <h3 className="blog-post-card-title">{post.title}</h3>
                        <p className="blog-post-card-excerpt">{excerpt}…</p>
                        <span className="blog-post-card-date">{dateStr}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* ── Browse by Category ─────────────────────────────────────── */}
            {Object.keys(grouped).length > 1 && (
              <div className="blog-index-categories">
                <h2 className="blog-categories-heading">Browse by Category</h2>
                <div className="blog-categories-list">
                  {Object.entries(grouped).map(([label, items]) => (
                    <div key={label} className="blog-category-group">
                      <h3 className="blog-category-label" style={{ color: getLabelColor(label) }}>
                        {label}
                        <span className="blog-category-count">{items.length}</span>
                      </h3>
                      {items.map((p) => (
                        <Link key={p.slug} href={`/blog/${p.slug}`} className="blog-category-item">
                          <span className="blog-category-item-title">{p.title}</span>
                          <span className="blog-category-item-date">
                            {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="blog-index-ad">
          <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} width={728} height={90} />
        </div>

      </div>

      {/* ── Thumbnail styles ── */}
      <style>{`

        /* ── Featured card ── */
        .blog-featured-card {
          display: block;
          text-decoration: none;
          border: 1px solid rgba(192,0,26,0.2);
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .blog-featured-card:hover { border-color: rgba(192,0,26,0.5); }

        .blog-featured-thumb-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          background: #0f0c1a;
        }
        .blog-featured-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center center;
          display: block;
          transition: transform 0.4s ease;
        }
        .blog-featured-card:hover .blog-featured-thumb-img { transform: scale(1.04); }

        .blog-featured-thumb-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #0f0c1a 0%, #1a1228 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(192,0,26,0.3);
          font-size: 3rem;
        }
        .blog-featured-thumb-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 30%, rgba(7,5,14,0.75) 100%);
          pointer-events: none;
        }

        .blog-featured-body { padding: 24px; }

        /* ── Grid cards ── */
        .blog-post-card {
          display: flex;
          flex-direction: column;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.06);
          overflow: hidden;
          transition: border-color 0.2s, transform 0.2s;
        }
        .blog-post-card:hover {
          border-color: rgba(192,0,26,0.4);
          transform: translateY(-2px);
        }

        .blog-post-card-thumb-wrap {
          width: 100%;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          background: #0f0c1a;
          flex-shrink: 0;
        }
        .blog-post-card-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center center;
          display: block;
          transition: transform 0.35s ease;
        }
        .blog-post-card:hover .blog-post-card-thumb-img { transform: scale(1.05); }

        /* Placeholder when post has no images */
        .blog-post-card-thumb-placeholder {
          width: 100%;
          aspect-ratio: 16 / 9;
          background: linear-gradient(135deg, #0f0c1a 0%, #1a1228 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(192,0,26,0.3);
          font-size: 2rem;
          flex-shrink: 0;
        }

        .blog-post-card-content {
          padding: 16px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        /* Light theme */
        [data-theme="light"] .blog-post-card { border-color: rgba(0,0,0,0.08); }
        [data-theme="light"] .blog-post-card:hover { border-color: rgba(192,0,26,0.3); }
        [data-theme="light"] .blog-post-card-thumb-wrap,
        [data-theme="light"] .blog-featured-thumb-wrap { background: #e8e4d8; }
        [data-theme="light"] .blog-post-card-thumb-placeholder {
          background: linear-gradient(135deg, #e8e4d8 0%, #d8d0c8 100%);
        }
        [data-theme="light"] .blog-featured-thumb-overlay {
          background: linear-gradient(to bottom, transparent 30%, rgba(242,237,225,0.6) 100%);
        }
      `}</style>
    </main>
  );
}