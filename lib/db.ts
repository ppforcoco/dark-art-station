import { PrismaClient } from "@prisma/client";

// Prevent multiple PrismaClient instances in Next.js dev hot-reload
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

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
  deviceType?: string | null;
  tags?:       string[];
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
    OR: [
      { title:       { contains: q, mode: "insensitive" as const } },
      { description: { contains: q, mode: "insensitive" as const } },
      { category:    { contains: q, mode: "insensitive" as const } },
      { tag:         { contains: q, mode: "insensitive" as const } },
    ],
  };

  // For Image, guard description with a nested AND so null rows are skipped
  const imageWhere = {
    collectionId: null,
    deviceType:   { not: null },
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
    id:         img.id,
    slug:       img.slug,
    title:      img.title,
    thumbnail:  img.r2Key,
    kind:       "standalone",
    deviceType: img.deviceType,
    tags:       img.tags,
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