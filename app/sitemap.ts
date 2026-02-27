import { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${siteUrl}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
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
    orderBy: { updatedAt: "desc" },
  });

  const imageRoutes: MetadataRoute.Sitemap = images.map((img) => ({
    url: `${siteUrl}/shop/${img.collection.slug}/${img.slug}`,
    lastModified: img.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...collectionRoutes, ...imageRoutes];
}