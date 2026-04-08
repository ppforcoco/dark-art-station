import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import { PrismaClient } from "@prisma/client";
import BlogPostClient from "./BlogPostClient";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

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
    prisma.blogPost.findUnique({ where: { slug, published: true } }),
    prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, slug: true, title: true, label: true,
        content: true, featuredImage: true, createdAt: true, updatedAt: true,
      },
    }),
  ]);

  if (!post) notFound();

  // Serialise dates for client component
  const serialisedPost = {
    ...post,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
  const serialisedAll = allPosts.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return (
    <BlogPostClient post={serialisedPost} allPosts={serialisedAll} />
  );
}