// app/api/analytics/event/route.ts
//
// First-party analytics intake. Same-origin, so ad-blockers that kill
// cloud.umami.is / google-analytics.com generally don't touch this — it
// looks like a normal API call to your own site, not a third-party tracker.
//
// Receives beacons from lib/track.ts:
//   { sessionId, type: "pageview" | "duration" | <named event>, path, meta? }
//
// Writes to Session (upsert, first/last seen), PageView (one row per page
// load, duration filled in later), and AnalyticsEvent (downloads, preview
// opens, favorites, etc.).

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createHash } from "crypto";
import { shouldCountRequest } from "@/lib/analytics-filter";

export const runtime = "nodejs";

function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT ?? "haunted-default-salt";
  return createHash("sha256").update(salt + ip).digest("hex");
}

function detectDevice(ua: string): string {
  if (/iPhone|iPod/i.test(ua)) return "iphone";
  if (/iPad/i.test(ua)) return "tablet";
  if (/Android/i.test(ua)) return /Mobile/i.test(ua) ? "android-mobile" : "tablet";
  if (/Macintosh|Windows|Linux/i.test(ua)) return "desktop";
  return "unknown";
}

export async function POST(req: NextRequest) {
  // Same bot/admin-IP filter already used for views and downloads.
  if (!shouldCountRequest(req)) {
    return NextResponse.json({ ok: true });
  }

  // sendBeacon delivers a Blob, which arrives without a JSON content-type —
  // read as text first and parse manually instead of req.json().
  let payload: { sessionId?: string; type?: string; path?: string; meta?: Record<string, unknown> };
  try {
    const raw = await req.text();
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { sessionId, type, path, meta } = payload;
  if (!sessionId || !type || !path) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const rawIp =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const ipHash = hashIp(rawIp);
  const ua = req.headers.get("user-agent") ?? "";
  // Free if the site is behind Cloudflare's orange-cloud proxy. Null otherwise —
  // that's fine, country just won't be shown for that visitor.
  const country = req.headers.get("cf-ipcountry") ?? null;

  try {
    await db.session.upsert({
      where: { id: sessionId },
      create: { id: sessionId, ipHash, userAgent: ua, device: detectDevice(ua), country },
      update: { lastSeen: new Date(), ...(country ? { country } : {}) },
    });

    if (type === "pageview") {
      await db.pageView.create({ data: { sessionId, path } });
    } else if (type === "duration") {
      const seconds = typeof meta?.seconds === "number" ? Math.round(meta.seconds) : null;
      if (seconds !== null) {
        // Find that session's most recent PageView for this exact path and
        // fill in how long they stayed.
        const latest = await db.pageView.findFirst({
          where: { sessionId, path },
          orderBy: { enteredAt: "desc" },
        });
        if (latest) {
          await db.pageView.update({ where: { id: latest.id }, data: { duration: seconds } });
        }
      }
    } else {
      await db.analyticsEvent.create({
        data: { sessionId, path, type, meta: meta as object | undefined },
      });
    }
  } catch (err) {
    console.error("[ANALYTICS_EVENT]", err);
    // Don't fail the beacon response either way — the browser doesn't care
    // about the response body for sendBeacon.
  }

  return NextResponse.json({ ok: true });
}