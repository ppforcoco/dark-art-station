import type { Metadata } from "next";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import { PrismaClient } from "@prisma/client";

// ADD THIS LINE for Dynamic Rendering
export const dynamic = "force-dynamic";

const prisma = new PrismaClient();
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

export const metadata: Metadata = {
  title: "Blog | Haunted Wallpapers",
  description: "Dark wallpaper guides, tips, and gothic art deep-dives from Haunted Wallpapers.",
  alternates: { canonical: `${SITE_URL}/blog` },
};

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    select: { slug: true, title: true, label: true, content: true, createdAt: true },
  });

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

        <div style={{ marginBottom: "32px" }}>
          <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN} width={728} height={90} />
        </div>

        <div className="static-page-body">
          {posts.length === 0 ? (
            <p style={{ color: "#6b6480", fontStyle: "italic" }}>
              No blog posts yet. Check back soon.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {posts.map((post) => {
                const excerpt = post.content
                  .replace(/<[^>]*>/g, " ")
                  .replace(/\s+/g, " ")
                  .trim()
                  .slice(0, 140);
                const dateStr = new Date(post.createdAt).toLocaleDateString("en-US", {
                  year: "numeric", month: "long", day: "numeric",
                });
                return (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="hover:border-[rgba(192,0,26,0.5)]" style={{ display: "block", padding: "20px 24px", border: "1px solid #2a2535", textDecoration: "none" }}>
                    <span style={{ fontSize: "0.55rem", letterSpacing: "0.2em", color: "#c0001a", textTransform: "uppercase" }}>{post.label} · {dateStr}</span>
                    <span style={{ display: "block", fontSize: "1rem", color: "#f0ecff", margin: "6px 0" }}>{post.title}</span>
                    <span style={{ fontSize: "0.95rem", color: "#8a8099", fontStyle: "italic" }}>{excerpt}…</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}