"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";

interface Post {
  id: string;
  slug: string;
  title: string;
  label: string;
  content: string;
  featuredImage: string | null;
  createdAt: string;
  updatedAt: string;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

function extractFirstImage(html: string): string | null {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m?.[1] ?? null;
}

function getExcerpt(html: string, len = 120) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, len);
}

const LABEL_COLORS: Record<string, string> = {
  "Wallpaper Guides":   "#c0001a",
  "How-To & Tutorials": "#c0001a",
  "Device Setup":       "#c0001a",
  "Dark Aesthetics":    "#7c3aed",
  "Gothic & Horror":    "#7c3aed",
  "Dark Fantasy":       "#7c3aed",
  "AMOLED Wallpapers":  "#0891b2",
  "Minimalist Dark":    "#0891b2",
  "Cyberpunk & Neon":   "#0891b2",
  "Halloween Special":  "#c0001a",
  "Top Lists":          "#b45309",
  "New Releases":       "#b45309",
};
function lc(l: string) { return LABEL_COLORS[l] ?? "#c0001a"; }

// ── Scroll Progress Bar ───────────────────────────────────────────────────────
function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    function onScroll() {
      const doc = document.documentElement;
      const scrolled = doc.scrollTop || document.body.scrollTop;
      const total = doc.scrollHeight - doc.clientHeight;
      setPct(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed", top: 0, left: 0, zIndex: 9999,
        width: `${pct}%`, height: "3px", pointerEvents: "none",
        background: "linear-gradient(90deg, #c0001a 0%, #ff3333 50%, #ff6600 100%)",
        transition: "width 0.08s linear",
        boxShadow: "0 0 8px rgba(192,0,26,0.6)",
      }}
    />
  );
}

// ── Related Posts ─────────────────────────────────────────────────────────────
function RelatedPosts({ posts, currentSlug }: { posts: Post[]; currentSlug: string }) {
  // Prefer same label first, then any other posts
  const sameLabel = posts.filter((p) => p.slug !== currentSlug && p.label === posts.find(x => x.slug === currentSlug)?.label);
  const others    = posts.filter((p) => p.slug !== currentSlug && !sameLabel.includes(p));
  const related   = [...sameLabel, ...others].slice(0, 3);
  if (related.length === 0) return null;

  return (
    <section className="related-posts-section">
      <h2 className="related-posts-heading">
        <span style={{ color: "#c0001a" }}>✦</span> More Posts You&apos;ll Like
      </h2>
      <div className="related-posts-grid">
        {related.map((p) => {
          const thumb  = p.featuredImage ?? extractFirstImage(p.content);
          const excerpt = getExcerpt(p.content, 100);
          const dateStr = new Date(p.createdAt).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric",
            timeZone: "UTC",
          });
          return (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="related-post-card">
              {thumb ? (
                <div className="related-post-thumb-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumb} alt={p.title} className="related-post-thumb" loading="lazy" />
                </div>
              ) : (
                <div className="related-post-no-thumb">✦</div>
              )}
              <div className="related-post-body">
                <span className="related-post-label" style={{ color: lc(p.label) }}>{p.label}</span>
                <h3 className="related-post-title">{p.title}</h3>
                <p className="related-post-excerpt">{excerpt}…</p>
                <span className="related-post-date">{dateStr}</span>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="related-posts-cta-row">
        <Link href="/blog" className="related-posts-all-link">View all posts →</Link>
      </div>
    </section>
  );
}

// ── Read time ─────────────────────────────────────────────────────────────────
function readTime(html: string): string {
  const words = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().split(" ").length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function BlogPostClient({ post, allPosts }: { post: Post; allPosts: Post[] }) {
  // Use UTC methods to avoid server/client timezone mismatch (React hydration error #418)
  const _d = new Date(post.createdAt);
  const dateStr = _d.toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
    timeZone: "UTC",
  });
  const rt = readTime(post.content);

  const ogImage = post.featuredImage ?? extractFirstImage(post.content) ?? `${SITE_URL}/og-image.jpg`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    image: ogImage,
    author: { "@type": "Organization", name: "Haunted Wallpapers" },
    publisher: {
      "@type": "Organization",
      name: "Haunted Wallpapers",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/og-image.jpg` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${post.slug}` },
  };

  return (
    <main className="static-page blog-post-page" data-force-blog="true">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <ScrollProgress />

      {/* ── Top nav ── */}
      <nav className="blog-topnav">
        <div className="blog-topnav-inner">
          <Link href="/" className="blog-topnav-logo">
            <span className="blog-topnav-logo-text">HAUNTED<span>WALLPAPERS</span></span>
          </Link>
          <div className="blog-topnav-links">
            <Link href="/blog"    className="blog-topnav-link">← Blog</Link>
            <Link href="/shop"    className="blog-topnav-link">Collections</Link>
            <Link href="/iphone"  className="blog-topnav-link">iPhone</Link>
            <Link href="/android" className="blog-topnav-link">Android</Link>
            <Link href="/pc"      className="blog-topnav-link">PC</Link>
          </div>
        </div>
      </nav>

      <div className="static-page-inner">
        <header className="static-page-header">
          <p className="static-page-label">{post.label} · {dateStr} · {rt}</p>
          <h1 className="static-page-title">{post.title}</h1>
        </header>

        <div style={{ marginBottom: "32px" }}>
          <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN} width={728} height={90} />
        </div>

        <div
          className="static-page-body blog-html-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* ── Footer nav ── */}
        <div className="blog-post-footer-nav">
          <Link href="/blog" className="blog-post-footer-back">← Blog &amp; Guides</Link>
          <div className="blog-post-footer-links">
            <Link href="/iphone"      className="blog-post-footer-link">iPhone Wallpapers →</Link>
            <Link href="/android"     className="blog-post-footer-link">Android →</Link>
            <Link href="/pc"          className="blog-post-footer-link">PC →</Link>
          </div>
        </div>

        {/* ── Browse wallpapers CTA ── */}
        <div className="blog-wallpaper-cta">
          <p className="blog-wallpaper-cta-text">
            <span style={{ color: "#c0001a" }}>✦</span> Like what you read? Browse the collections.
          </p>
          <div className="blog-wallpaper-cta-links">
            <Link href="/collections"                    className="blog-wallpaper-cta-btn">All Collections</Link>
            <Link href="/shop/dark-fantasy-art"          className="blog-wallpaper-cta-btn">Dark Fantasy</Link>
            <Link href="/shop/horror-movie-posters"      className="blog-wallpaper-cta-btn">Horror Posters</Link>
            <Link href="/shop/dark-minimal-horror"       className="blog-wallpaper-cta-btn">Dark Minimal</Link>
          </div>
        </div>

        {/* ── Mid ad ── */}
        <div style={{ margin: "48px 0 40px" }}>
          <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR} width={728} height={90} />
        </div>

        {/* ── Related posts ── */}
        <RelatedPosts posts={allPosts} currentSlug={post.slug} />
      </div>

      <style>{`
        body:has(.blog-post-page) .site-header,
        body:has(.blog-post-page) [class*="Header"],
        body:has(.blog-post-page) header.site-header,
        body:has(.blog-post-page) .halloween-countdown { display: none !important; }

        .blog-topnav {
          position: sticky; top: 0; z-index: 900;
          background: rgba(7,5,14,0.92);
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(192,0,26,0.15); padding: 0 24px;
        }
        [data-theme="light"] .blog-topnav { background: rgba(242,237,225,0.95); border-color: rgba(192,0,26,0.1); }
        [data-theme="ghost"] .blog-topnav { background: rgba(20,20,24,0.95); border-color: rgba(248,248,255,0.08); }
        [data-theme="ember"] .blog-topnav { background: rgba(10,5,0,0.95); border-color: rgba(255,102,0,0.15); }
        .blog-topnav-inner {
          max-width: 1280px; margin: 0 auto; display: flex;
          align-items: center; justify-content: space-between; height: 52px; gap: 20px;
        }
        .blog-topnav-logo { text-decoration: none; flex-shrink: 0; }
        .blog-topnav-logo-text {
          font-family: var(--font-cinzel), cursive; font-size: 0.75rem;
          font-weight: 900; letter-spacing: 0.15em; text-transform: uppercase;
          color: #f0ecff; display: flex; flex-direction: column; line-height: 1.15;
        }
        [data-theme="light"] .blog-topnav-logo-text { color: #1a1814; }
        .blog-topnav-logo-text span { color: #c0001a; font-size: 0.55rem; letter-spacing: 0.25em; }
        .blog-topnav-links { display: flex; align-items: center; gap: 4px; overflow-x: auto; scrollbar-width: none; }
        .blog-topnav-links::-webkit-scrollbar { display: none; }
        .blog-topnav-link {
          font-family: var(--font-space), monospace; font-size: 0.55rem;
          letter-spacing: 0.15em; text-transform: uppercase; color: #8a8099;
          text-decoration: none; padding: 6px 10px; border: 1px solid transparent;
          white-space: nowrap; transition: color 0.2s, border-color 0.2s, background 0.2s;
        }
        .blog-topnav-link:hover { color: #f0ecff; border-color: rgba(192,0,26,0.4); background: rgba(192,0,26,0.06); }
        [data-theme="light"] .blog-topnav-link { color: #7a7468; }
        [data-theme="light"] .blog-topnav-link:hover { color: #1a1814; }

        .blog-post-footer-nav {
          max-width: 720px; margin: 48px auto 0; padding-top: 28px;
          border-top: 1px solid #2a2535; display: flex;
          justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;
        }
        [data-theme="light"] .blog-post-footer-nav { border-color: #cdc8bc; }
        .blog-post-footer-back {
          color: #c0001a; text-decoration: none; font-size: 0.8rem;
          font-family: monospace; letter-spacing: 0.1em; text-transform: uppercase; transition: color 0.2s;
        }
        .blog-post-footer-back:hover { color: #e00020; }
        .blog-post-footer-links { display: flex; gap: 16px; flex-wrap: wrap; }
        .blog-post-footer-link {
          color: #6b6480; text-decoration: none; font-size: 0.72rem;
          font-family: monospace; letter-spacing: 0.08em; transition: color 0.2s;
        }
        .blog-post-footer-link:hover { color: #c4bdd8; }
        [data-theme="light"] .blog-post-footer-link { color: #8a8468; }
        [data-theme="light"] .blog-post-footer-link:hover { color: #3a3450; }

        .blog-wallpaper-cta {
          max-width: 720px; margin: 32px auto 0; padding: 20px 24px;
          border: 1px solid rgba(192,0,26,0.2); background: rgba(192,0,26,0.04);
        }
        [data-theme="light"] .blog-wallpaper-cta { border-color: rgba(192,0,26,0.18); background: rgba(192,0,26,0.03); }
        .blog-wallpaper-cta-text {
          font-family: var(--font-space), monospace; font-size: 0.65rem;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: #8a8099; margin: 0 0 12px; display: flex; align-items: center; gap: 8px;
        }
        [data-theme="light"] .blog-wallpaper-cta-text { color: #5a5468; }
        .blog-wallpaper-cta-links { display: flex; flex-wrap: wrap; gap: 8px; }
        .blog-wallpaper-cta-btn {
          font-family: var(--font-space), monospace; font-size: 0.58rem;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: #c0001a; text-decoration: none;
          padding: 6px 12px; border: 1px solid rgba(192,0,26,0.35);
          transition: background 0.2s, border-color 0.2s, color 0.2s;
        }
        .blog-wallpaper-cta-btn:hover { background: rgba(192,0,26,0.1); border-color: rgba(192,0,26,0.6); color: #ff2233; }
        [data-theme="light"] .blog-wallpaper-cta-btn { color: #c0001a; border-color: rgba(192,0,26,0.3); }
        [data-theme="light"] .blog-wallpaper-cta-btn:hover { background: rgba(192,0,26,0.07); }
        [data-theme="light"] .blog-html-content h1,
        [data-theme="light"] .blog-html-content h2,
        [data-theme="light"] .blog-html-content h3,
        [data-theme="light"] .blog-html-content h4 { color: #1a1814; }
        [data-theme="light"] .blog-html-content h3 { color: #8b4200; }
        [data-theme="light"] .blog-html-content h4 { color: #5a3a70; }
        [data-theme="light"] .blog-html-content p { color: #3a3028; font-size: 1.05rem; line-height: 1.8; }
        [data-theme="light"] .blog-html-content li { color: #3a3028; }
        [data-theme="light"] .blog-html-content strong { color: #1a1814; }
        [data-theme="light"] .blog-html-content em { color: #8b4200; }
        [data-theme="light"] .blog-html-content a { color: #c0001a; border-color: rgba(192,0,26,0.3); }
        [data-theme="light"] .blog-html-content a:hover { color: #900015; border-color: rgba(192,0,26,0.6); }
        /* Force readable colors on blog post page regardless of stored theme */
        .blog-post-page .static-page-title { color: #1a1814 !important; }
        .blog-post-page .static-page-title em { color: #8b4000 !important; }
        .blog-post-page .static-page-label { color: #8a8468 !important; }
        .blog-post-page .static-page-header { border-bottom-color: #cdc8bc !important; }
        [data-theme="light"] .static-page-title { color: #1a1814; }
        [data-theme="light"] .static-page-label { color: #8a8468; }

        /* ── Related posts ── */
        /* ── Related posts — always light (blog pages always use cream bg) ── */
        .related-posts-section {
          max-width: 720px; margin: 0 auto 60px; padding-top: 8px;
        }
        .related-posts-heading {
          font-family: var(--font-cinzel), cursive; font-size: 0.85rem;
          font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase;
          color: #1a1814; margin: 0 0 20px; display: flex; align-items: center; gap: 10px;
        }
        .related-posts-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;
        }
        @media (max-width: 600px) { .related-posts-grid { grid-template-columns: 1fr; } }
        @media (min-width: 601px) and (max-width: 800px) { .related-posts-grid { grid-template-columns: repeat(2, 1fr); } }
        .related-post-card {
          display: flex; flex-direction: column; text-decoration: none;
          border: 1px solid rgba(0,0,0,0.1); overflow: hidden; background: #f0ebe0;
          transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
        }
        .related-post-card:hover {
          border-color: rgba(192,0,26,0.35); transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
        }
        .related-post-thumb-wrap { width: 100%; aspect-ratio: 16/9; overflow: hidden; background: #ddd8cc; }
        .related-post-thumb { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.35s ease; }
        .related-post-card:hover .related-post-thumb { transform: scale(1.05); }
        .related-post-no-thumb {
          width: 100%; aspect-ratio: 16/9;
          background: linear-gradient(135deg, #e8e3d8 0%, #ddd8cc 100%);
          display: flex; align-items: center; justify-content: center;
          color: rgba(192,0,26,0.25); font-size: 1.5rem;
        }
        .related-post-body { padding: 11px 12px; display: flex; flex-direction: column; gap: 5px; flex: 1; }
        .related-post-label { font-size: 0.58rem; font-family: monospace; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 700; }
        .related-post-title { font-size: 0.8rem; font-weight: 700; color: #1a1814; line-height: 1.35; margin: 0; }
        .related-post-excerpt { font-size: 0.7rem; color: #5a5450; line-height: 1.5; margin: 0; flex: 1; }
        .related-post-date { font-size: 0.6rem; color: #8a8468; font-family: monospace; letter-spacing: 0.06em; margin-top: 3px; }
        .related-posts-cta-row { margin-top: 20px; text-align: center; }
        .related-posts-all-link {
          color: #c0001a; text-decoration: none; font-size: 0.75rem;
          font-family: monospace; letter-spacing: 0.12em; text-transform: uppercase;
          border-bottom: 1px solid rgba(192,0,26,0.3); padding-bottom: 2px;
          transition: color 0.2s, border-color 0.2s;
        }
        .related-posts-all-link:hover { color: #900015; border-color: rgba(144,0,21,0.5); }
      `}</style>
    </main>
  );
}