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
  "18+ Mature Content":    "#c0001a",
};

function getLabelColor(label: string) {
  return LABEL_COLORS[label] ?? "#c0001a";
}

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    select: { slug: true, title: true, label: true, content: true, createdAt: true },
  });

  const grouped = posts.reduce<Record<string, typeof posts>>((acc, p) => {
    const key = p.label ?? "Guides";
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  return (
    <main className="blog-index-page" data-force-blog="true">

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
              return (
                <div className="blog-index-featured">
                  <Link href={`/blog/${p.slug}`} className="blog-featured-card">
                    <span className="blog-featured-eyebrow" style={{ color: getLabelColor(p.label) }}>
                      Latest · {p.label} · {dateStr}
                    </span>
                    <h2 className="blog-featured-title">{p.title}</h2>
                    <p className="blog-featured-excerpt">{excerpt}…</p>
                    <span className="blog-featured-cta">Read article →</span>
                  </Link>
                </div>
              );
            })()}

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
                  return (
                    <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-post-card">
                      <span className="blog-post-card-label" style={{ color: getLabelColor(post.label) }}>
                        {post.label}
                      </span>
                      <h3 className="blog-post-card-title">{post.title}</h3>
                      <p className="blog-post-card-excerpt">{excerpt}…</p>
                      <span className="blog-post-card-date">{dateStr}</span>
                    </Link>
                  );
                })}
              </div>
            )}

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
    </main>
  );
}