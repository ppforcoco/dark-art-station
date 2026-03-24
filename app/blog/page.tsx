import type { Metadata } from "next";
import Link from "next/link";
import fs from "fs";
import path from "path";
import AdSlot from "@/components/AdSlot";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";
const BLOGS_FILE = path.join(process.cwd(), "public", "hw-blogs.json");

export const metadata: Metadata = {
  title: "Blog | Haunted Wallpapers",
  description: "Dark wallpaper tips, guides, and news from Haunted Wallpapers.",
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: "Blog | Haunted Wallpapers",
    description: "Dark wallpaper tips, guides, and news.",
    url: `${SITE_URL}/blog`,
    siteName: "Haunted Wallpapers",
    type: "website",
  },
};

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

export default function BlogPage() {
  const posts = loadBlogs();

  return (
    <main className="static-page">
      <div className="static-page-inner">
        <header className="static-page-header">
          <p className="static-page-label">Dark Knowledge</p>
          <h1 className="static-page-title">The<br /><em>Blog</em></h1>
          <p className="static-page-meta">
            Wallpaper guides, dark art explainers, and tips for your perfect screen.
          </p>
        </header>

        <div className="static-page-body">
          {posts.length === 0 ? (
            <p style={{ color: "#6b6480", fontStyle: "italic" }}>No blog posts yet. Check back soon.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  style={{
                    display: "block",
                    padding: "20px 24px",
                    border: "1px solid #2a2535",
                    textDecoration: "none",
                    transition: "border-color 0.2s",
                  }}
                  className="hover:border-[rgba(192,0,26,0.5)]"
                >
                  <span style={{
                    fontFamily: "var(--font-space)",
                    fontSize: "0.55rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "#c0001a",
                    display: "block",
                    marginBottom: "6px",
                  }}>
                    {post.label} · {post.date}
                  </span>
                  <span style={{
                    fontFamily: "var(--font-cinzel)",
                    fontSize: "1rem",
                    color: "#f0ecff",
                    display: "block",
                    marginBottom: "6px",
                  }}>
                    {post.title}
                  </span>
                  <span style={{
                    fontFamily: "var(--font-cormorant)",
                    fontStyle: "italic",
                    fontSize: "0.95rem",
                    color: "#8a8099",
                    display: "block",
                  }}>
                    {post.content.replace(/##[^\n]*/g, "").trim().slice(0, 120)}…
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px 60px" }}>
        <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} width={728} height={90} />
      </div>
    </main>
  );
}