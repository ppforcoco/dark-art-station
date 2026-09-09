// middleware.ts
//
// /world, /mood, and the three /top-100-* pages were removed permanently
// with no replacement page. Deleting the route folders alone would make
// Next.js serve a plain 404 for them — but 404 tells Google "might come
// back, keep checking", while 410 Gone tells it "this is intentionally and
// permanently gone, drop it from the index now". Since these are gone for
// good, 410 is the correct signal and gets them out of Search Console faster.
//
// This intercepts those exact paths (and everything under /world/*) before
// Next.js's router even looks for a page, and returns a real 410 response.

import { NextRequest, NextResponse } from "next/server";

const GONE_EXACT = new Set([
  "/all",
  "/mood",
  "/top-100-amoled-wallpapers",
  "/top-100-horror-wallpapers",
  "/top-100-dark-fantasy-wallpapers",
]);

const GONE_PREFIXES = ["/world/"];

function isGone(pathname: string): boolean {
  if (GONE_EXACT.has(pathname)) return true;
  return GONE_PREFIXES.some((p) => pathname.startsWith(p)) || pathname === "/world";
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isGone(pathname)) {
    return new NextResponse(
      "<!DOCTYPE html><html><head><title>410 Gone</title></head>" +
        "<body style=\"font-family:sans-serif;text-align:center;padding:80px 20px;background:#0d0616;color:#ede4ff;\">" +
        "<h1 style=\"font-size:2rem;margin-bottom:8px;\">410 — This page is gone</h1>" +
        "<p style=\"color:#af98cf;\">This section was removed and won&rsquo;t be coming back. " +
        "<a href=\"/\" style=\"color:#ff2e9e;\">Head back to the homepage</a>.</p>" +
        "</body></html>",
      {
        status: 410,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/all", "/mood", "/world", "/world/:path*",
    "/top-100-amoled-wallpapers", "/top-100-horror-wallpapers", "/top-100-dark-fantasy-wallpapers"],
};
