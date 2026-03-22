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
    { url: `${siteUrl}/shop`,         lastModified: new Date(), changeFrequency: "daily"   as const, priority: 0.9  },
    { url: `${siteUrl}/iphone`,       lastModified: new Date(), changeFrequency: "daily"   as const, priority: 0.85 },
    { url: `${siteUrl}/android`,      lastModified: new Date(), changeFrequency: "daily"   as const, priority: 0.85 },
    { url: `${siteUrl}/pc`,           lastModified: new Date(), changeFrequency: "daily"   as const, priority: 0.85 },
    { url: `${siteUrl}/search`,       lastModified: new Date(), changeFrequency: "weekly"  as const, priority: 0.6  },
    { url: `${siteUrl}/about`,        lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5  },
    { url: `${siteUrl}/faq`,          lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5  },
    { url: `${siteUrl}/contact`,      lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.4  },
    { url: `${siteUrl}/licensing`,    lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.4  },
    { url: `${siteUrl}/privacy`,      lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3  },
    { url: `${siteUrl}/terms`,        lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3  },
    { url: `${siteUrl}/guides`,       lastModified: new Date(), changeFrequency: "weekly"  as const, priority: 0.7  },
    { url: `${siteUrl}/tools`,        lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.65 },
    { url: `${siteUrl}/favorites`,    lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5  },
    { url: `${siteUrl}/guides/how-to-set-wallpaper-iphone`,      lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${siteUrl}/guides/how-to-set-wallpaper-android`,     lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${siteUrl}/guides/best-dark-wallpapers-iphone`,      lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${siteUrl}/guides/what-is-amoled-wallpaper`,         lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${siteUrl}/guides/dark-fantasy-art-styles-explained`,lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 },
  ];

  // Collection pages — include thumbnail image for Google Image Search
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

  // Collection image pages — include the wallpaper image
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

  // Standalone wallpaper pages — iphone/android/pc detail pages
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

  return [...staticRoutes, ...collectionRoutes, ...imageRoutes, ...standaloneRoutes];
}