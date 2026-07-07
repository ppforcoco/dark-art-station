import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import BlogPostClient from "./BlogPostClient";

export const revalidate = 3600;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

// unstable_cache serializes its return value for storage/reuse across
// requests, so Date fields come back as plain strings on cache HITS while
// staying real Date objects on the very first (cache MISS) call. Calling
// .toISOString() later on an already-stringified date throws — that was
// the cause of every /blog/[slug] request 500ing after the first hit.
// Fix: normalise dates to strings *inside* the cached function so the
// shape is identical (and safe) whether it's a hit or a miss.
type CachedBlogPost = Awaited<ReturnType<typeof db.blogPost.findUnique>>;
type SerialisedBlogPost = Omit<NonNullable<CachedBlogPost>, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

function getCachedPost(slug: string): Promise<SerialisedBlogPost | null> {
  return unstable_cache(
    async () => {
      const post = await db.blogPost.findUnique({ where: { slug } });
      if (!post) return null;
      return {
        ...post,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      };
    },
    [`blog-post-${slug}`],
    { revalidate: 3600 },
  )();
}

function extractFirstImageFromContent(html: string): string | null {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] ?? null;
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getCachedPost(slug);
  if (!post) return { title: "Not Found" };

  const excerpt = post.content
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);

  const ogImage =
    post.featuredImage ??
    extractFirstImageFromContent(post.content) ??
    `${SITE_URL}/og-image.jpg`;

  return {
    title: `${post.title} | Haunted Wallpapers`,
    description: excerpt,
    authors: [{ name: "Haunted Wallpapers", url: SITE_URL }],
    alternates: { canonical: `${SITE_URL}/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: excerpt,
      url: `${SITE_URL}/blog/${post.slug}`,
      siteName: "Haunted Wallpapers",
      type: "article",
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
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

  const [post, allPosts] = await Promise.all([
    getCachedPost(slug),
    db.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, slug: true, title: true, label: true,
        content: true, featuredImage: true, createdAt: true, updatedAt: true,
      },
    }),
  ]);

  if (!post) notFound();

  // post's dates are already ISO strings (converted inside getCachedPost,
  // before the value goes into unstable_cache) — don't call .toISOString()
  // on them again here.
  const serialisedPost = post;
  const serialisedAll = allPosts.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return (
    <BlogPostClient post={serialisedPost} allPosts={serialisedAll} />
  );
}