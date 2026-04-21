/**
 * analytics-filter.ts
 *
 * Centralised helpers for deciding whether a request should be counted
 * in analytics (views, downloads).
 *
 * Strategy:
 *  1. Admin IP exclusion — set ADMIN_IPS env var as a comma-separated list
 *     of IPs you don't want counted (your home IP, office IP, etc.)
 *  2. Bot detection — skip obvious crawlers by User-Agent
 *  3. For downloads — hash-based dedup within a rolling window (already
 *     handled in the download route); this file adds the IP exclusion layer.
 *
 * Usage (Server Component or Route Handler):
 *   import { shouldCountRequest } from "@/lib/analytics-filter";
 *   if (shouldCountRequest(request)) { // increment viewCount ... }
 */

import { NextRequest } from "next/server";
import { headers } from "next/headers";

// ── Admin / owner IPs to exclude ────────────────────────────────────────────
// Set ADMIN_IPS in your .env / Coolify env vars as a comma-separated list:
//   ADMIN_IPS=203.0.113.1,198.51.100.42
// Your IP will never be counted in views or downloads.
function getAdminIps(): Set<string> {
  const raw = process.env.ADMIN_IPS ?? "";
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );
}

// ── Bot / crawler User-Agents to skip ───────────────────────────────────────
const BOT_PATTERNS = [
  /googlebot/i,
  /bingbot/i,
  /slurp/i,          // Yahoo
  /duckduckbot/i,
  /baiduspider/i,
  /yandexbot/i,
  /facebookexternalhit/i,
  /twitterbot/i,
  /rogerbot/i,
  /linkedinbot/i,
  /embedly/i,
  /quora link preview/i,
  /showyoubot/i,
  /outbrain/i,
  /pinterest/i,
  /developers\.google\.com\/\+\/web\/snippet/i,
  /slackbot/i,
  /vkshare/i,
  /w3c_validator/i,
  /redditbot/i,
  /applebot/i,
  /whatsapp/i,
  /flipboard/i,
  /tumblr/i,
  /bitlybot/i,
  /skypeuripreview/i,
  /nuzzel/i,
  /discordbot/i,
  /google page speed/i,
  /qwantify/i,
  /pinterestbot/i,
  /bitrix link preview/i,
  /xing-contenttabreceiver/i,
  /chrome-lighthouse/i,
  /telegrambot/i,
  /integration-test/i,
  /curl\//i,
  /wget\//i,
  /python-requests/i,
  /axios/i,
  /go-http-client/i,
  /node-fetch/i,
  /vercel/i,
];

function isBot(userAgent: string): boolean {
  return BOT_PATTERNS.some((pattern) => pattern.test(userAgent));
}

function getClientIp(req?: NextRequest): string {
  if (req) {
    return (
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      req.headers.get("x-real-ip") ??
      ""
    );
  }
  // Server Component context — use next/headers
  return "";
}

// ── Main check for Route Handlers (NextRequest available) ───────────────────
export function shouldCountRequest(req: NextRequest): boolean {
  const ip = getClientIp(req);
  const ua = req.headers.get("user-agent") ?? "";

  if (getAdminIps().has(ip)) return false;
  if (isBot(ua)) return false;

  return true;
}

// ── Server Component version (uses next/headers) ────────────────────────────
export async function shouldCountPageView(): Promise<boolean> {
  try {
    const hdrs = await headers();
    const ip =
      hdrs.get("x-forwarded-for")?.split(",")[0].trim() ??
      hdrs.get("x-real-ip") ??
      "";
    const ua = hdrs.get("user-agent") ?? "";

    if (getAdminIps().has(ip)) return false;
    if (isBot(ua)) return false;

    return true;
  } catch {
    // If headers() is unavailable (static rendering), count it
    return true;
  }
}