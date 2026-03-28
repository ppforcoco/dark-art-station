import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AdSlot from "@/components/AdSlot";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

// ── Fallback: extract first <img src="..."> from HTML content ─────────────────
function extractFirstImageFromContent(html: string): string | null {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] ?? null;
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) return { title: "Not Found" };

  const excerpt = post.content
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);

  // ✅ Use featuredImage for OG image, fall back to first content image, then site OG image
  const ogImage =
    post.featuredImage ??
    extractFirstImageFromContent(post.content) ??
    `${SITE_URL}/og-image.jpg`;

  return {
    title: `${post.title} | Haunted Wallpapers`,
    description: excerpt,
    alternates: { canonical: `${SITE_URL}/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: excerpt,
      url: `${SITE_URL}/blog/${post.slug}`,
      siteName: "Haunted Wallpapers",
      type: "article",
      // ✅ Rich OG image for social sharing
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: excerpt,
      images: [ogImage],
    },
  };
}

export default async function BlogPostPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug, published: true } });
  if (!post) notFound();

  const dateStr = new Date(post.createdAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  const ogImage =
    post.featuredImage ??
    extractFirstImageFromContent(post.content) ??
    `${SITE_URL}/og-image.jpg`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    // ✅ Article image for Google Rich Results
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

      <nav className="blog-topnav">
        <div className="blog-topnav-inner">
          <Link href="/" className="blog-topnav-logo">
            <span className="blog-topnav-logo-text">HAUNTED<span>WALLPAPERS</span></span>
          </Link>
          <div className="blog-topnav-links">
            <Link href="/blog" className="blog-topnav-link">← Blog</Link>
            <Link href="/shop" className="blog-topnav-link">Collections</Link>
            <Link href="/iphone" className="blog-topnav-link">iPhone</Link>
            <Link href="/android" className="blog-topnav-link">Android</Link>
            <Link href="/pc" className="blog-topnav-link">PC</Link>
          </div>
        </div>
      </nav>

      <div className="static-page-inner">
        <header className="static-page-header">
          <p className="static-page-label">{post.label} · {dateStr}</p>
          <h1 className="static-page-title">{post.title}</h1>
        </header>

        <div style={{ marginBottom: "32px" }}>
          <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN} width={728} height={90} />
        </div>

        <div
          className="static-page-body blog-html-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="blog-post-footer-nav">
          <Link href="/blog" className="blog-post-footer-back">
            ← Blog &amp; Guides
          </Link>
          <div className="blog-post-footer-links">
            <Link href="/iphone" className="blog-post-footer-link">iPhone Wallpapers →</Link>
            <Link href="/android" className="blog-post-footer-link">Android →</Link>
            <Link href="/pc" className="blog-post-footer-link">PC →</Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px 60px" }}>
        <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} width={728} height={90} />
      </div>

      <style>{`
        body:has(.blog-post-page) .site-header,
        body:has(.blog-post-page) [class*="Header"],
        body:has(.blog-post-page) header.site-header,
        body:has(.blog-post-page) .halloween-countdown {
          display: none !important;
        }

        /* ── Blog top nav ── */
        .blog-topnav {
          position: sticky;
          top: 0;
          z-index: 900;
          background: rgba(7, 5, 14, 0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(192, 0, 26, 0.15);
          padding: 0 24px;
        }
        [data-theme="light"] .blog-topnav {
          background: rgba(242, 237, 225, 0.95);
          border-color: rgba(192, 0, 26, 0.1);
        }
        [data-theme="ghost"] .blog-topnav {
          background: rgba(20, 20, 24, 0.95);
          border-color: rgba(248, 248, 255, 0.08);
        }
        [data-theme="ember"] .blog-topnav {
          background: rgba(10, 5, 0, 0.95);
          border-color: rgba(255, 102, 0, 0.15);
        }
        .blog-topnav-inner {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 52px;
          gap: 20px;
        }
        .blog-topnav-logo { text-decoration: none; flex-shrink: 0; }
        .blog-topnav-logo-text {
          font-family: var(--font-cinzel), cursive;
          font-size: 0.75rem;
          font-weight: 900;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #f0ecff;
          display: flex;
          flex-direction: column;
          line-height: 1.15;
        }
        [data-theme="light"] .blog-topnav-logo-text { color: #1a1814; }
        .blog-topnav-logo-text span {
          color: #c0001a;
          font-size: 0.55rem;
          letter-spacing: 0.25em;
        }
        .blog-topnav-links {
          display: flex;
          align-items: center;
          gap: 4px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .blog-topnav-links::-webkit-scrollbar { display: none; }
        .blog-topnav-link {
          font-family: var(--font-space), monospace;
          font-size: 0.55rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #8a8099;
          text-decoration: none;
          padding: 6px 10px;
          border: 1px solid transparent;
          white-space: nowrap;
          transition: color 0.2s, border-color 0.2s, background 0.2s;
        }
        .blog-topnav-link:hover {
          color: #f0ecff;
          border-color: rgba(192,0,26,0.4);
          background: rgba(192,0,26,0.06);
        }
        [data-theme="light"] .blog-topnav-link { color: #7a7468; }
        [data-theme="light"] .blog-topnav-link:hover { color: #1a1814; }

        /* ── Bottom nav ── */
        .blog-post-footer-nav {
          max-width: 720px;
          margin: 48px auto 0;
          padding-top: 28px;
          border-top: 1px solid #2a2535;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }
        [data-theme="light"] .blog-post-footer-nav { border-color: #cdc8bc; }
        .blog-post-footer-back {
          color: #c0001a;
          text-decoration: none;
          font-size: 0.8rem;
          font-family: monospace;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          transition: color 0.2s;
        }
        .blog-post-footer-back:hover { color: #e00020; }
        .blog-post-footer-links { display: flex; gap: 16px; flex-wrap: wrap; }
        .blog-post-footer-link {
          color: #6b6480;
          text-decoration: none;
          font-size: 0.72rem;
          font-family: monospace;
          letter-spacing: 0.08em;
          transition: color 0.2s;
        }
        .blog-post-footer-link:hover { color: #c4bdd8; }
        [data-theme="light"] .blog-post-footer-link { color: #8a8468; }
        [data-theme="light"] .blog-post-footer-link:hover { color: #3a3450; }

        /* ── Light theme content ── */
        [data-theme="light"] .blog-html-content { color: #2a2420; }
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
        [data-theme="light"] .static-page-title { color: #1a1814; }
        [data-theme="light"] .static-page-label { color: #8a8468; }
      `}</style>
    </main>
  );
}