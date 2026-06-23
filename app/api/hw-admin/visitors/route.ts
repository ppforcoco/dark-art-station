// app/api/hw-admin/visitors/route.ts
//
// Powers the "Visitors" tab in the admin panel — answers "who's on the site
// right now, which page, and what are they doing" using our own first-party
// Session / PageView / AnalyticsEvent tables instead of Umami.
//
// Also answers "where are these downloaders coming from?" by querying the
// Download table's referer column — the only reliable signal for dark-social
// and direct-link traffic that Google / Pinterest never see.
//
// Also returns share click stats from AnalyticsEvent where type = "share_click".

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function checkAuth(req: NextRequest) {
  const pw = req.headers.get("x-admin-password");
  const correct = process.env.ADMIN_PASSWORD ?? "haunted-admin-2025";
  return pw === correct;
}

// Classify a raw referer string into a human-readable traffic source label.
function classifyReferer(raw: string | null): string {
  if (!raw) return "Direct / Dark Social";

  try {
    const url   = new URL(raw);
    const host  = url.hostname.replace(/^www\./, "").toLowerCase();
    const path  = url.pathname.toLowerCase();

    if (host === "t.co" || host === "twitter.com" || host === "x.com")        return "Twitter / X";
    if (host.includes("pinterest"))                                             return "Pinterest";
    if (host.includes("reddit"))                                                return "Reddit";
    if (host.includes("google"))                                                return path.includes("/imgres") ? "Google Images" : "Google Search";
    if (host.includes("bing"))                                                  return "Bing";
    if (host.includes("facebook") || host === "fb.me" || host === "l.facebook.com") return "Facebook";
    if (host.includes("instagram"))                                             return "Instagram";
    if (host.includes("tiktok"))                                                return "TikTok";
    if (host.includes("discord"))                                               return "Discord";
    if (host.includes("telegram"))                                              return "Telegram";
    if (host.includes("whatsapp"))                                              return "WhatsApp";
    if (host.includes("tumblr"))                                                return "Tumblr";
    if (host.includes("hauntedwallpapers.com"))                                 return "Internal (own site)";

    return host; // Unknown external domain — show it raw so you can spot aggregators
  } catch {
    return "Direct / Dark Social";
  }
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now        = new Date();
    const fiveMinAgo = new Date(now.getTime() - 5  * 60 * 1000);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart  = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // ── Who's on the site right now (active in the last 5 minutes) ──────────
    const liveRaw = await db.session.findMany({
      where:   { lastSeen: { gte: fiveMinAgo } },
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
      where:   { lastSeen: { gte: todayStart } },
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
      by:      ["path"],
      where:   { enteredAt: { gte: todayStart } },
      _count:  { path: true },
      _avg:    { duration: true },
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
      where:   { createdAt: { gte: todayStart } },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    const recentEvents = recentEventsRaw.map((e) => ({
      type:      e.type,
      path:      e.path,
      meta:      e.meta,
      createdAt: e.createdAt,
    }));

    // ── Traffic source breakdown from Download.referer ───────────────────────
    const [downloadsToday, downloadsWeek] = await Promise.all([
      db.download.findMany({
        where:  { createdAt: { gte: todayStart } },
        select: { referer: true },
      }),
      db.download.findMany({
        where:  { createdAt: { gte: weekStart } },
        select: { referer: true },
      }),
    ]);

    function aggregateSources(rows: { referer: string | null }[]) {
      const map = new Map<string, number>();
      for (const row of rows) {
        const label = classifyReferer(row.referer);
        map.set(label, (map.get(label) ?? 0) + 1);
      }
      return Array.from(map.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([source, count]) => ({ source, count }));
    }

    const trafficSourcesToday = aggregateSources(downloadsToday);
    const trafficSourcesWeek  = aggregateSources(downloadsWeek);

    const rawRefererSample = await db.download.findMany({
      where:   { createdAt: { gte: todayStart }, referer: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 20,
      select:  { referer: true, createdAt: true },
    });

    const refererSample = rawRefererSample.map((r) => ({
      referer:   r.referer!,
      createdAt: r.createdAt,
    }));

    const totalDownloadsToday = downloadsToday.length;
    const nullRefererToday    = downloadsToday.filter((d) => d.referer === null).length;

    // ── Share click stats from AnalyticsEvent ────────────────────────────────
    // SocialShare component fires track("share_click", { platform, slug })
    // which writes an AnalyticsEvent row with type = "share_click".
    const [shareEventsToday, shareEventsWeek] = await Promise.all([
      db.analyticsEvent.findMany({
        where:   { type: "share_click", createdAt: { gte: todayStart } },
        select:  { meta: true },
      }),
      db.analyticsEvent.findMany({
        where:   { type: "share_click", createdAt: { gte: weekStart } },
        select:  { meta: true, createdAt: true, path: true },
      }),
    ]);

    // Platform breakdown (week — more data to show)
    const platformMap = new Map<string, number>();
    for (const e of shareEventsWeek) {
      const meta = e.meta as Record<string, string> | null;
      const platform = meta?.platform ?? "unknown";
      platformMap.set(platform, (platformMap.get(platform) ?? 0) + 1);
    }
    const sharePlatforms = Array.from(platformMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([platform, count]) => ({ platform, count }));

    // Top shared wallpapers (by slug, week)
    const slugMap = new Map<string, number>();
    for (const e of shareEventsWeek) {
      const meta = e.meta as Record<string, string> | null;
      const slug = meta?.slug ?? e.path ?? "unknown";
      slugMap.set(slug, (slugMap.get(slug) ?? 0) + 1);
    }
    const topSharedWallpapers = Array.from(slugMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([slug, count]) => ({ slug, count }));

    return NextResponse.json({
      liveCount: live.length,
      live,
      sessionsToday: sessions.length,
      sessions,
      topPages,
      recentEvents,
      // Traffic source intelligence (from Download.referer)
      traffic: {
        downloadsToday:      totalDownloadsToday,
        darkSocialToday:     nullRefererToday,
        darkSocialPct:       totalDownloadsToday > 0
          ? Math.round((nullRefererToday / totalDownloadsToday) * 100)
          : 0,
        sourcesToday:        trafficSourcesToday,
        sourcesWeek:         trafficSourcesWeek,
        refererSample,
      },
      // Share click stats (from AnalyticsEvent type="share_click")
      shares: {
        today:          shareEventsToday.length,
        week:           shareEventsWeek.length,
        platforms:      sharePlatforms,
        topWallpapers:  topSharedWallpapers,
      },
    });
  } catch (err) {
    console.error("[admin/visitors]", err);
    return NextResponse.json({ error: "Failed to fetch visitor data" }, { status: 500 });
  }
}