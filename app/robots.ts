import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

  return {
    rules: [
      // ── Googlebot first — no delay, full access ──────────────────────
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/admin-secret-hw",
        ],
      },
      // ── AdsBot — needs full access for AdSense approval ──────────────
      {
        userAgent: "AdsBot-Google",
        allow: "/",
      },
      // ── All other crawlers ───────────────────────────────────────────
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/admin-secret-hw",
        ],
        crawlDelay: 1,
      },
      // ── Block AI training bots ───────────────────────────────────────
      {
        userAgent: "GPTBot",
        disallow: "/",
      },
      {
        userAgent: "ClaudeBot",
        disallow: "/",
      },
      {
        userAgent: "CCBot",
        disallow: "/",
      },
      {
        userAgent: "anthropic-ai",
        disallow: "/",
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}