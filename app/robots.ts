import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

  return {
    rules: [
      // ── Googlebot — no delay, full access ───────────────────────────
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/admin/", "/admin-secret-hw"],
      },
      // ── All other crawlers ───────────────────────────────────────────
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/admin-secret-hw"],
        crawlDelay: 1,
      },
      // ── Block AI training bots ───────────────────────────────────────
      { userAgent: "GPTBot",           disallow: "/" },
      { userAgent: "ClaudeBot",        disallow: "/" },
      { userAgent: "CCBot",            disallow: "/" },
      { userAgent: "anthropic-ai",     disallow: "/" },
      { userAgent: "Google-Extended",  disallow: "/" },
      { userAgent: "Applebot-Extended",disallow: "/" },
      { userAgent: "Bytespider",       disallow: "/" },
      { userAgent: "Diffbot",          disallow: "/" },
      { userAgent: "FacebookBot",      disallow: "/" },
      { userAgent: "ImagesiftBot",     disallow: "/" },
      { userAgent: "Omgilibot",        disallow: "/" },
      { userAgent: "PetalBot",         disallow: "/" },
      { userAgent: "Timpibot",         disallow: "/" },
      { userAgent: "YouBot",           disallow: "/" },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}