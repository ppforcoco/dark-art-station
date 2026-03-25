import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import { PrismaClient } from "@prisma/client";

// This ensures the page is generated on-demand, not at build time
export const dynamic = "force-dynamic";

const prisma = new PrismaClient();
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Organization", name: "Haunted Wallpapers" },
    publisher: {
      "@type": "Organization",
      name: "Haunted Wallpapers",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/og-image.jpg` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${post.slug}` },
  };

  return (
    <main className="static-page" data-force-blog="true">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="static-page-inner">
        <header className="static-page-header">
          <p className="static-page-label">{post.label} · {dateStr}</p>
          <h1 className="static-page-title">{post.title}</h1>
        </header>

        <div style={{ marginBottom: "32px" }}>
          <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN} width={728} height={90} />
        </div>

        {/* Renders the HTML content from admin directly */}
        <div
          className="static-page-body blog-html-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div style={{ maxWidth: "720px", margin: "48px auto 0", paddingTop: "28px", borderTop: "1px solid #2a2535", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <Link href="/blog" style={{ color: "#c0001a", textDecoration: "none", fontSize: "0.8rem", fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            ← Blog &amp; Guides
          </Link>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <Link href="/iphone" style={{ color: "#6b6480", textDecoration: "none", fontSize: "0.72rem", fontFamily: "monospace", letterSpacing: "0.08em" }}>
              iPhone Wallpapers →
            </Link>
            <Link href="/android" style={{ color: "#6b6480", textDecoration: "none", fontSize: "0.72rem", fontFamily: "monospace", letterSpacing: "0.08em" }}>
              Android →
            </Link>
            <Link href="/pc" style={{ color: "#6b6480", textDecoration: "none", fontSize: "0.72rem", fontFamily: "monospace", letterSpacing: "0.08em" }}>
              PC →
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px 60px" }}>
        <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} width={728} height={90} />
      </div>
    </main>
  );
}