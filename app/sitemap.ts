import { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

  // Static pages — every crawlable route with a real page
  const staticRoutes: MetadataRoute.Sitemap = [
    // Core
    { url: siteUrl,                       lastModified: new Date(), changeFrequency: "weekly"  as const, priority: 1.0  },
    { url: `${siteUrl}/shop`,            lastModified: new Date(), changeFrequency: "daily"   as const, priority: 0.9  },
    // Device portals
    { url: `${siteUrl}/iphone`,          lastModified: new Date(), changeFrequency: "daily"   as const, priority: 0.85 },
    { url: `${siteUrl}/android`,         lastModified: new Date(), changeFrequency: "daily"   as const, priority: 0.85 },
    { url: `${siteUrl}/pc`,              lastModified: new Date(), changeFrequency: "daily"   as const, priority: 0.85 },
    // Utility / info pages
    { url: `${siteUrl}/search`,          lastModified: new Date(), changeFrequency: "weekly"  as const, priority: 0.6  },
    { url: `${siteUrl}/about`,           lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5  },
    { url: `${siteUrl}/faq`,             lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5  },
    { url: `${siteUrl}/contact`,         lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.4  },
    { url: `${siteUrl}/licensing`,       lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.4  },
    { url: `${siteUrl}/privacy`,         lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3  },
  ];

  // Collection pages
  const collections = await db.collection.findMany({
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  const collectionRoutes: MetadataRoute.Sitemap = collections.map((c) => ({
    url: `${siteUrl}/shop/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Individual image pages — indexed separately for Google Image Search
  const images = await db.image.findMany({
    select: {
      slug: true,
      updatedAt: true,
      collection: { select: { slug: true } },
    },
    where: { collectionId: { not: null } },
    orderBy: { updatedAt: "desc" },
  });

  const imageRoutes: MetadataRoute.Sitemap = images
    .filter((img) => img.collection?.slug)
    .map((img) => ({
      url: `${siteUrl}/shop/${img.collection?.slug}/${img.slug}`,
      lastModified: img.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  // Standalone image pages — individual download/view pages per wallpaper
  const standalones = await db.image.findMany({
    select: {
      slug: true,
      updatedAt: true,
      deviceType: true,
      tags: true,
    },
    where: { collectionId: null, deviceType: { not: null } },
    orderBy: { updatedAt: "desc" },
  });

  const standaloneRoutes: MetadataRoute.Sitemap = standalones.map((img) => ({
    url: `${siteUrl}/${img.deviceType!.toLowerCase()}/${img.slug}`,
    lastModified: img.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));

  return [...staticRoutes, ...collectionRoutes, ...imageRoutes, ...standaloneRoutes];
}