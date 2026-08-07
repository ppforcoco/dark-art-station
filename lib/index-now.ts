// lib/index-now.ts
//
// IndexNow lets you push a URL to search engines the instant it changes,
// instead of waiting for them to recrawl your sitemap on their own schedule.
//
// IMPORTANT — what this does and doesn't cover:
//   Supported: Bing, Yandex, Seznam.cz, Naver (they share one IndexNow index).
//   NOT supported: Google. Google shut down its sitemap "ping" endpoint in
//   2023 and does not participate in IndexNow. There is no official API to
//   force Google to recrawl an arbitrary page on demand — Google decides
//   crawl timing itself based on signals like:
//     - the <lastmod> date in your sitemap (app/sitemap.ts already sets this
//       correctly from `updatedAt`, which is the single most useful signal)
//     - internal links from pages Google already crawls often (e.g. linking
//       new wallpapers from your homepage / device index pages helps a lot)
//     - Search Console: manually click "Request Indexing" after inspecting a
//       URL, or make sure your sitemap is submitted there (Settings > Sitemaps)
//   This file still helps: it gets you fast, automatic indexing on Bing, and
//   costs nothing to leave in place.
//
// Setup:
//   1. Add INDEXNOW_KEY=<any random string, e.g. a uuid> to your .env
//   2. That's it — app/indexnow-key.txt/route.ts already serves it publicly.

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

export async function pingIndexNow(urls: string[]): Promise<void> {
  const key = process.env.INDEXNOW_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

  if (!key || urls.length === 0) return;

  const host = new URL(siteUrl).host;

  try {
    await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key,
        keyLocation: `${siteUrl}/indexnow-key.txt`,
        urlList: urls,
      }),
    });
  } catch (err) {
    // Never let an indexing ping break the upload flow.
    console.error("[index-now] ping failed:", err);
  }
}