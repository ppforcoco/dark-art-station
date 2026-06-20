// app/api/hw-admin/visitors/route.ts
//
// Powers the "Visitors" tab in the admin panel — answers "who's on the site
// right now, which page, and what are they doing" using our own first-party
// Session / PageView / AnalyticsEvent tables instead of Umami.

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function checkAuth(req: NextRequest) {
  const pw = req.headers.get("x-admin-password");
  const correct = process.env.ADMIN_PASSWORD ?? "haunted-admin-2025";
  return pw === correct;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now         = new Date();
    const fiveMinAgo  = new Date(now.getTime() - 5 * 60 * 1000);
    const todayStart  = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // ── Who's on the site right now (active in the last 5 minutes) ──────────
    const liveRaw = await db.session.findMany({
      where: { lastSeen: { gte: fiveMinAgo } },
      orderBy: { lastSeen: "desc" },
      include: { pageViews: { orderBy: { enteredAt: "desc" }, take: 1 } },
    });

    const live = liveRaw.map((s) => ({
      id:       s.id.slice(0, 8),
      device:   s.device,
      country:  s.country,
      path:     s.pageViews[0]?.path ?? "—",
      lastSeen: s.lastSeen,
    }));

    // ── Every session seen today, with their full page trail + events ───────
    const sessionsRaw = await db.session.findMany({
      where: { lastSeen: { gte: todayStart } },
      orderBy: { lastSeen: "desc" },
      take: 100,
      include: {
        pageViews: { orderBy: { enteredAt: "desc" }, take: 25 },
        events:    { orderBy: { createdAt: "desc" }, take: 25 },
      },
    });

    const sessions = sessionsRaw.map((s) => ({
      id:            s.id.slice(0, 8),
      device:        s.device,
      country:       s.country,
      firstSeen:     s.firstSeen,
      lastSeen:      s.lastSeen,
      pageCount:     s.pageViews.length,
      totalDuration: s.pageViews.reduce((sum, p) => sum + (p.duration ?? 0), 0),
      pages: s.pageViews.map((p) => ({
        path:      p.path,
        duration:  p.duration,
        enteredAt: p.enteredAt,
      })),
      events: s.events.map((e) => ({
        type:      e.type,
        path:      e.path,
        meta:      e.meta,
        createdAt: e.createdAt,
      })),
    }));

    // ── Which pages get viewed today, and the average time spent on each ────
    const pageStats = await db.pageView.groupBy({
      by: ["path"],
      where: { enteredAt: { gte: todayStart } },
      _count: { path: true },
      _avg: { duration: true },
      orderBy: { _count: { path: "desc" } },
      take: 15,
    });

    const topPages = pageStats.map((p) => ({
      path:        p.path,
      views:       p._count.path,
      avgDuration: Math.round(p._avg.duration ?? 0),
    }));

    // ── Recent named events (downloads, previews, favorites) for a live feed ─
    const recentEventsRaw = await db.analyticsEvent.findMany({
      where: { createdAt: { gte: todayStart } },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    const recentEvents = recentEventsRaw.map((e) => ({
      type:      e.type,
      path:      e.path,
      meta:      e.meta,
      createdAt: e.createdAt,
    }));

    return NextResponse.json({
      liveCount: live.length,
      live,
      sessionsToday: sessions.length,
      sessions,
      topPages,
      recentEvents,
    });
  } catch (err) {
    console.error("[admin/visitors]", err);
    return NextResponse.json({ error: "Failed to fetch visitor data" }, { status: 500 });
  }
}