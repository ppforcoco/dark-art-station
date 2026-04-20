import { PrismaClient, DeviceType } from "@prisma/client";

// Prevent multiple PrismaClient instances in Next.js dev hot-reload
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// ─── Wallpaper of the Day ─────────────────────────────────────────────────────
//
// Deterministic daily selection — no randomness per-request, no extra columns.
// Algorithm:
//   1. Fetch all standalone image IDs (collectionId = null, deviceType set).
//   2. Derive a numeric seed from today's UTC date string (YYYY-MM-DD).
//   3. Pick index = seed % total — same result for every visitor, every server
//      instance, all day long. Changes at UTC midnight automatically.
//   4. Fetch the full record for that image.
//
// Returns null if no standalone images exist yet.

export type WotdImage = {
  id:         string;
  slug:       string;
  title:      string;
  description: string | null;
  r2Key:      string;
  deviceType: string | null;
  tags:       string[];
  viewCount:  number;
};

export async function getWallpaperOfTheDay(): Promise<WotdImage | null> {
  // Step 1 — get IDs only (cheap query, no image data yet)
  // PC wallpapers excluded — WOTD is for phone/tablet visuals only.
  const ids = await db.image.findMany({
    where: {
      collectionId: null,
      deviceType: { in: [DeviceType.IPHONE, DeviceType.ANDROID] },
    },
    select: { id: true },
    orderBy: { createdAt: "asc" }, // stable order across calls
  });

  if (ids.length === 0) return null;

  // Step 2 — date seed: "2025-06-15" → sum of char codes → integer
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  const seed  = today.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

  // Step 3 — deterministic index
  const index = seed % ids.length;

  // Step 4 — fetch full record
  return db.image.findUnique({
    where: { id: ids[index].id },
    select: {
      id:          true,
      slug:        true,
      title:       true,
      description: true,
      r2Key:       true,
      deviceType:  true,
      tags:        true,
      viewCount:   true,
    },
  });
}

// ─── Search Types ─────────────────────────────────────────────────────────────

export type SearchResultItem = {
  id:        string;
  slug:      string;
  title:     string;
  thumbnail: string;          // R2 key
  kind:      "collection" | "standalone";
  // collection-specific
  category?: string;
  tag?:      string;
  icon?:     string;
  bgClass?:  string;
  isFree?:   boolean;
  badge?:    string | null;
  // standalone-specific
  deviceType?:    string | null;
  tags?:          string[];
  // needed to build correct href: /shop/[collectionSlug]/[imageSlug]
  collectionSlug?: string | null;
};

// ─── Global Search Query ─────────────────────────────────────────────────────
//
// Searches Collections (title + description + category) and
// standalone Images (title + description + tags array) in one
// round-trip using Promise.all.
//
// Uses PostgreSQL ILIKE for case-insensitive partial matching.
// Tags on Images are a String[] column — we use hasSome() which
// maps to the Postgres && (array overlap) operator after lowercasing.
//
// Returns a unified array sorted by relevance proxy:
//   exact title match first → partial title match → rest.

export async function searchWallpapers(
  rawQuery: string,
  page  = 1,
  limit = 24,
): Promise<{ items: SearchResultItem[]; total: number }> {
  const q = rawQuery.trim();
  if (!q) return { items: [], total: 0 };

  // tagTokens: split on whitespace, lowercase, non-empty only
  const tagTokens = q
    .toLowerCase()
    .split(/\s+/)
    .filter(t => t.length > 0);

  const skip = (page - 1) * limit;

  // ── WHERE clauses ──────────────────────────────────────────
  // description is nullable on Image — use { contains } only when
  // the field is guaranteed non-null (Collection.description is required).
  const collectionWhere = {
    isAdult: false,
    OR: [
      { title:       { contains: q, mode: "insensitive" as const } },
      { description: { contains: q, mode: "insensitive" as const } },
      { category:    { contains: q, mode: "insensitive" as const } },
      { tag:         { contains: q, mode: "insensitive" as const } },
    ],
  };

  const imageWhere = {
    collectionId: null,
    isAdult: false,
    deviceType: { in: [DeviceType.IPHONE, DeviceType.ANDROID] },
    OR: [
      { title: { contains: q, mode: "insensitive" as const } },
      // Only match description when it is not null
      {
        AND: [
          { description: { not: null } },
          { description: { contains: q, mode: "insensitive" as const } },
        ],
      },
      // hasSome requires at least one token — guard the empty array case
      ...(tagTokens.length > 0 ? [{ tags: { hasSome: tagTokens } }] : []),
    ],
  };

  const [collections, collectionCount, standalones, standaloneCount] =
    await Promise.all([
      db.collection.findMany({
        where:   collectionWhere,
        select: {
          id:        true,
          slug:      true,
          title:     true,
          thumbnail: true,
          category:  true,
          tag:       true,
          icon:      true,
          bgClass:   true,
          isFree:    true,
          badge:     true,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      db.collection.count({ where: collectionWhere }),

      db.image.findMany({
        where:  imageWhere,
        select: {
          id:         true,
          slug:       true,
          title:      true,
          r2Key:      true,
          deviceType: true,
          tags:       true,
          // Include collection slug so search page can build correct href
          collection: { select: { slug: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      db.image.count({ where: imageWhere }),
    ]);

  const collectionResults: SearchResultItem[] = collections.map(c => ({
    id:        c.id,
    slug:      c.slug,
    title:     c.title,
    thumbnail: c.thumbnail,
    kind:      "collection",
    category:  c.category,
    tag:       c.tag,
    icon:      c.icon,
    bgClass:   c.bgClass,
    isFree:    c.isFree,
    badge:     c.badge,
  }));

  const standaloneResults: SearchResultItem[] = standalones.map(img => ({
    id:             img.id,
    slug:           img.slug,
    title:          img.title,
    thumbnail:      img.r2Key,
    kind:           "standalone",
    deviceType:     img.deviceType,
    tags:           img.tags,
    // collectionSlug enables building /shop/[collectionSlug]/[imageSlug]
    collectionSlug: img.collection?.slug ?? null,
  }));

  const all = [...collectionResults, ...standaloneResults];
  const total = collectionCount + standaloneCount;

  // Sort: exact title match first → starts-with → rest
  const ql = q.toLowerCase();
  const sorted = all.sort((a, b) => {
    const aExact = a.title.toLowerCase() === ql ? 0 : 1;
    const bExact = b.title.toLowerCase() === ql ? 0 : 1;
    if (aExact !== bExact) return aExact - bExact;
    const aStart = a.title.toLowerCase().startsWith(ql) ? 0 : 1;
    const bStart = b.title.toLowerCase().startsWith(ql) ? 0 : 1;
    return aStart - bStart;
  });

  return { items: sorted, total };
}
// ─── Related Images ───────────────────────────────────────────────────────────
//
// Returns up to `limit` images that share AT LEAST 2 tags with the source
// image, sorted by viewCount descending (most popular first).
//
// Works for both standalone images (collectionId = null) and
// collection images (collectionId set) — pass whichever field applies.
// The source image itself is excluded via the `id` filter.
//
// Tag matching uses Prisma hasSome (Postgres && array overlap operator).
// We then post-filter in JS for the ≥2 overlap requirement, because
// Prisma doesn't expose a "count of matching elements" predicate.

export type RelatedImage = {
  id:         string;
  slug:       string;
  title:      string;
  r2Key:      string;
  tags:       string[];
  viewCount:  number;
  deviceType: string | null;
  collectionSlug: string | null;
};

export async function getRelatedImages(
  sourceId:   string,
  sourceTags: string[],
  limit = 6,
  deviceType?: string | null,   // filter to same device type
): Promise<RelatedImage[]> {
  if (sourceTags.length === 0) return [];

  // Build the where clause — optionally restrict to same deviceType
  const whereClause: Record<string, unknown> = {
    id:   { not: sourceId },
    tags: { hasSome: sourceTags },
  };
  if (deviceType) {
    whereClause.deviceType = deviceType;
  }

  const candidates = await db.image.findMany({
    where: whereClause,
    select: {
      id:         true,
      slug:       true,
      title:      true,
      r2Key:      true,
      tags:       true,
      viewCount:  true,
      deviceType: true,
      collection: { select: { slug: true } },
    },
    orderBy: { viewCount: "desc" },
    take:    limit * 4,
  });

  const sourceSet = new Set(sourceTags.map(t => t.toLowerCase()));
  const qualified = candidates.filter((img) => {
    const overlap = img.tags.filter(t => sourceSet.has(t.toLowerCase())).length;
    return overlap >= 2;
  });

  const pool = qualified.length >= 2 ? qualified : candidates;

  return pool.slice(0, limit).map(img => ({
    id:             img.id,
    slug:           img.slug,
    title:          img.title,
    r2Key:          img.r2Key,
    tags:           img.tags,
    viewCount:      img.viewCount,
    deviceType:     img.deviceType,
    collectionSlug: img.collection?.slug ?? null,
  }));
}

// ─── Seasonal / Event Page Query ──────────────────────────────────────────────
//
// Returns all images (standalone + collection-based) tagged with a given
// seasonal keyword, sorted by viewCount desc. Used by app/[eventSlug]/page.tsx.
// No pagination — limit is generous; seasonal pages are curated not infinite.

export type SeasonalImage = {
  id:             string;
  slug:           string;
  title:          string;
  r2Key:          string;
  tags:           string[];
  viewCount:      number;
  deviceType:     string | null;
  collectionSlug: string | null;
};

export async function getSeasonalImages(
  tag:   string,
  limit = 48,
): Promise<SeasonalImage[]> {
  const images = await db.image.findMany({
    where: {
      tags: { hasSome: [tag.toLowerCase()] },
    },
    select: {
      id:         true,
      slug:       true,
      title:      true,
      r2Key:      true,
      tags:       true,
      viewCount:  true,
      deviceType: true,
      collection: { select: { slug: true } },
    },
    orderBy: { viewCount: "desc" },
    take:    limit,
  });

  return images.map(img => ({
    id:             img.id,
    slug:           img.slug,
    title:          img.title,
    r2Key:          img.r2Key,
    tags:           img.tags,
    viewCount:      img.viewCount,
    deviceType:     img.deviceType,
    collectionSlug: img.collection?.slug ?? null,
  }));
}
// ─── Page Content helper ───────────────────────────────────────────────────────
// Fetch editable page content by slug. Returns null if not set (pages should
// fall back to their hardcoded default text).
export async function getPageContent(slug: string): Promise<{
  title:    string | null;
  body:     string;
  metaDesc: string | null;
} | null> {
  try {
    const record = await db.pageContent.findUnique({ where: { slug } });
    return record ?? null;
  } catch {
    return null;
  }
}