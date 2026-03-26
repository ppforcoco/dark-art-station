import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

  return {
    rules: [
      // ── Allow all crawlers by default ────────────────────────────────
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",           // API routes
          "/admin/",         // Admin pages
          "/admin-secret-hw", // Secret admin panel
          "/*.json",         // JSON files (except those public-facing)
          "/*?*search*",     // Dynamic search parameters
        ],
        crawlDelay: 0,
      },
      // ── GoogleBot — Aggressive crawling allowed ──────────────────────
      {
        userAgent: "Googlebot",
        allow: "/",
        crawlDelay: 0,
      },
      // ── GPTBot — Restrict to reduce training data usage ──────────────
      {
        userAgent: "GPTBot",
        disallow: "/",
      },
      // ── ClaudeBot — Restrict to reduce training data usage ──────────
      {
        userAgent: "ClaudeBot",
        disallow: "/",
      },
      // ── Other crawlers with restrictions ─────────────────────────────
      {
        userAgent: "AdsBot-Google",
        allow: "/",
      },
      {
        userAgent: "Slurp",
        allow: "/",
        crawlDelay: 1,
      },
      {
        userAgent: "DuckDuckBot",
        allow: "/",
        crawlDelay: 1,
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    crawlDelay: 0.5,
  };
}