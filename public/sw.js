/**
 * public/sw.js — Haunted Wallpapers Service Worker
 *
 * CRITICAL RULES for GA4 engagement time to work:
 *
 * 1. NEVER intercept requests to google-analytics.com or googletagmanager.com.
 *    GA4 sends engagement time via navigator.sendBeacon() on page hide/unload.
 *    If the SW intercepts that beacon, engagement time = 0s in every report.
 *
 * 2. NEVER cache HTML pages (Cache-Control: no-store for navigation requests).
 *    Cached HTML with stale nonces breaks CSP and kills inline scripts.
 *
 * Strategy:
 *  - Analytics domains   → always bypass (return immediately, no respondWith)
 *  - Navigation (HTML)   → network only, no cache
 *  - Static assets       → cache-first (CSS, JS, fonts, images)
 *  - API routes          → network only, no cache
 *  - Everything else     → network with cache fallback
 */

const CACHE_NAME = "hw-static-v2";

// Domains that must NEVER be intercepted.
// GA4 engagement time is sent as a beacon to these — intercepting = 0s forever.
const PASSTHROUGH_ORIGINS = [
  "www.google-analytics.com",
  "google-analytics.com",
  "www.googletagmanager.com",
  "googletagmanager.com",
  "static.cloudflareinsights.com",
  "cloudflareinsights.com",
];

// Static asset patterns safe to cache long-term (content-hashed filenames).
const CACHEABLE_PATTERNS = [
  /\/_next\/static\//,       // JS chunks, CSS, fonts, media (content-hashed)
  /\/favicon\.ico$/,
  /\/apple-touch-icon\.png$/,
  /\/icon-192\.png$/,
  /\/icon-512\.png$/,
];

// ── Install: pre-cache the offline page only ─────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(["/offline"])
    ).catch(() => {
      // /offline page may not exist yet — safe to ignore
    })
  );
  self.skipWaiting();
});

// ── Activate: remove old caches ───────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: routing logic ──────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // ── Rule 1: Analytics & beacon endpoints → ALWAYS pass through ───────────
  // This is the most important rule. Do not respondWith() for these.
  // navigator.sendBeacon() calls for GA4 engagement time go to google-analytics.com.
  // If we intercept them, the beacon fails silently and engagement time = 0s.
  if (PASSTHROUGH_ORIGINS.includes(url.hostname)) {
    return; // No event.respondWith() — browser handles natively
  }

  // ── Rule 2: Non-GET requests → network only ───────────────────────────────
  if (request.method !== "GET") {
    return; // POST, PUT, DELETE etc. always go to network
  }

  // ── Rule 3: API routes → network only, never cache ───────────────────────
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // ── Rule 4: HTML navigation requests → network only ──────────────────────
  // Never serve cached HTML. Cached HTML with stale nonces = CSP violations.
  // If the network fails, fall back to the offline page.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match("/offline").then((r) => r ?? Response.error())
      )
    );
    return;
  }

  // ── Rule 5: Content-hashed static assets → cache-first ───────────────────
  // These filenames change on every build so stale cache is impossible.
  if (CACHEABLE_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          // Only cache valid, same-origin responses
          if (
            response.ok &&
            response.type === "basic" &&
            response.status === 200
          ) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // ── Rule 6: Everything else → network only ────────────────────────────────
  // Manifest, robots.txt, images from R2/CDN — let the browser and
  // Cloudflare handle caching via HTTP headers.
});