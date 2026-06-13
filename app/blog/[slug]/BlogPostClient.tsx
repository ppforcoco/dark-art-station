"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

// ── Remove the first heading tag from the content (avoids duplicate title) ───
function stripFirstHeading(html: string): string {
  return html.replace(/^\s*<h[1-3][^>]*>[\s\S]*?<\/h[1-3]>\s*/i, "");
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
          const thumb   = p.featuredImage ?? extractFirstImage(p.content);
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
          <div className="blog-author-byline">
            <span className="blog-author-avatar" aria-hidden="true">✦</span>
            <div className="blog-author-info">
              <span className="blog-author-name">Haunted Wallpapers</span>
              <span className="blog-author-meta">
                Published <time dateTime={post.createdAt}>{dateStr}</time>
                {post.createdAt !== post.updatedAt && (
                  <> · Updated <time dateTime={post.updatedAt}>{new Date(post.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}</time></>
                )}
              </span>
            </div>
          </div>
        </header>

        <div style={{ marginBottom: "32px" }} />

        <div
          className="static-page-body blog-html-content"
          dangerouslySetInnerHTML={{ __html: stripFirstHeading(post.content) }}
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
          <div className="blog-wallpaper-cta-links">
            <Link href="/shop/dark-creatures-world"  className="blog-wallpaper-cta-btn">Dark Creatures</Link>
            <Link href="/shop/the-anime-world"       className="blog-wallpaper-cta-btn">Anime World</Link>
            <Link href="/shop/the-character-ward"    className="blog-wallpaper-cta-btn">Character Ward</Link>
          </div>
        </div>

        <div style={{ margin: "48px 0 40px" }} />

        {/* ── Related posts ── */}
        <RelatedPosts posts={allPosts} currentSlug={post.slug} />
      </div>
    </main>
  );
}