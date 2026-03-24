import type { Metadata } from "next";
import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";
const BLOGS_FILE = path.join(process.cwd(), "public", "hw-blogs.json");

interface BlogPost {
  slug: string;
  title: string;
  label: string;
  content: string;
  date: string;
}

function loadBlogs(): BlogPost[] {
  try {
    if (fs.existsSync(BLOGS_FILE)) {
      return JSON.parse(fs.readFileSync(BLOGS_FILE, "utf-8"));
    }
  } catch {}
  return [];
}

function getPost(slug: string): BlogPost | null {
  const blogs = loadBlogs();
  return blogs.find((b) => b.slug === slug) ?? null;
}

// Generate metadata dynamically
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Not Found" };

  return {
    title: `${post.title} | Haunted Wallpapers`,
    description: post.content.slice(0, 160).replace(/##[^\n]*/g, "").trim(),
    alternates: { canonical: `${SITE_URL}/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      url: `${SITE_URL}/blog/${post.slug}`,
      siteName: "Haunted Wallpapers",
      type: "article",
    },
  };
}

// Render content: ## = h2, blank line = new paragraph
function renderContent(content: string) {
  const paragraphs = content.split(/\n\n+/);
  return paragraphs.map((block, i) => {
    const trimmed = block.trim();
    if (trimmed.startsWith("## ")) {
      return <h2 key={i}>{trimmed.replace("## ", "")}</h2>;
    }
    if (trimmed.startsWith("### ")) {
      return <h3 key={i}>{trimmed.replace("### ", "")}</h3>;
    }
    if (!trimmed) return null;
    return <p key={i}>{trimmed}</p>;
  });
}

export default async function BlogPostPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    datePublished: post.date,
    author: { "@type": "Organization", name: "Haunted Wallpapers" },
    publisher: {
      "@type": "Organization",
      name: "Haunted Wallpapers",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/og-image.jpg` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${post.slug}` },
  };

  return (
    <main className="static-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="static-page-inner">
        <header className="static-page-header">
          <p className="static-page-label">{post.label} · {post.date}</p>
          <h1 className="static-page-title">{post.title}</h1>
        </header>

        <div style={{ marginBottom: "32px" }}>
          <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN} width={728} height={90} />
        </div>

        <div className="static-page-body">
          {renderContent(post.content)}

          <div style={{ marginTop: "40px", paddingTop: "24px", borderTop: "1px solid #2a2535" }}>
            <Link href="/blog" style={{ color: "#c0001a", textDecoration: "none", fontSize: "0.85rem" }}>
              ← All Blog Posts
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