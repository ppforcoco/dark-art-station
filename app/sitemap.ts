import { MetadataRoute } from "next";
import { db } from "@/lib/db";

const CDN = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "https://assets.hauntedwallpapers.com";

function r2Url(key: string) {
  return `${CDN}/${key}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl,                    lastModified: new Date(), changeFrequency: "weekly"  as const, priority: 1.0  },
    { url: `${siteUrl}/shop`,          lastModified: new Date(), changeFrequency: "daily"   as const, priority: 0.9  },
    { url: `${siteUrl}/iphone`,        lastModified: new Date(), changeFrequency: "daily"   as const, priority: 0.85 },
    { url: `${siteUrl}/android`,       lastModified: new Date(), changeFrequency: "daily"   as const, priority: 0.85 },
    { url: `${siteUrl}/pc`,            lastModified: new Date(), changeFrequency: "daily"   as const, priority: 0.85 },
    { url: `${siteUrl}/collections`,   lastModified: new Date(), changeFrequency: "weekly"  as const, priority: 0.8  },
    { url: `${siteUrl}/search`,        lastModified: new Date(), changeFrequency: "weekly"  as const, priority: 0.6  },
    { url: `${siteUrl}/blog`,          lastModified: new Date(), changeFrequency: "weekly"  as const, priority: 0.75 },
    { url: `${siteUrl}/tools`,         lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.65 },
    { url: `${siteUrl}/gacha`,         lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6  },
    { url: `${siteUrl}/about`,         lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5  },
    { url: `${siteUrl}/faq`,           lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5  },
    { url: `${siteUrl}/contact`,       lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.4  },
    { url: `${siteUrl}/licensing`,     lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.4  },
    { url: `${siteUrl}/privacy`,       lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3  },
    { url: `${siteUrl}/terms`,         lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3  },
    { url: `${siteUrl}/dmca`,          lastModified: new Date(), changeFrequency: "yearly"  as const, priority: 0.3  },
    { url: `${siteUrl}/favorites`,     lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5  },
  ];

  // ✅ FIX: Blog posts are now included in the sitemap.
  // Before this fix, Google could only find blog posts by clicking links.
  // Now Google gets a direct list of every blog post URL — much faster indexing.
  const blogPosts = await db.blogPost.findMany({
    where: { published: true },
    select: { slug: true, createdAt: true, updatedAt: true },
    orderBy: { createdAt: "desc" },
  });

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt ?? post.createdAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Collection pages
  const collections = await db.collection.findMany({
    select: { slug: true, title: true, thumbnail: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  const collectionRoutes: MetadataRoute.Sitemap = collections.map((c) => ({
    url: `${siteUrl}/shop/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.8,
    ...(c.thumbnail ? {
      images: [r2Url(c.thumbnail)],
    } : {}),
  }));

  // Collection image pages
  const collectionImages = await db.image.findMany({
    select: {
      slug: true, title: true, r2Key: true, updatedAt: true,
      collection: { select: { slug: true } },
    },
    where: { collectionId: { not: null } },
    orderBy: { updatedAt: "desc" },
  });

  const imageRoutes: MetadataRoute.Sitemap = collectionImages
    .filter((img) => img.collection?.slug)
    .map((img) => ({
      url: `${siteUrl}/shop/${img.collection?.slug}/${img.slug}`,
      lastModified: img.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      images: [r2Url(img.r2Key)],
    }));

  // Standalone wallpaper pages
  const standalones = await db.image.findMany({
    select: {
      slug: true, title: true, r2Key: true, updatedAt: true,
      deviceType: true,
    },
    where: { collectionId: null, deviceType: { not: null } },
    orderBy: { updatedAt: "desc" },
  });

  const standaloneRoutes: MetadataRoute.Sitemap = standalones.map((img) => ({
    url: `${siteUrl}/${img.deviceType!.toLowerCase()}/${img.slug}`,
    lastModified: img.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.65,
    images: [r2Url(img.r2Key)],
  }));

  return [...staticRoutes, ...blogRoutes, ...collectionRoutes, ...imageRoutes, ...standaloneRoutes];
}