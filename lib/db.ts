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
  limit = 48,
): Promise<SearchResultItem[]> {
  const q    = rawQuery.trim();
  if (!q)    return [];

  const like = `%${q}%`;          // ILIKE pattern
  // For tag array search — PostgreSQL array overlap on lowercased term
  const tagTokens = q.toLowerCase().split(/\s+/).filter(Boolean);

  const [collections, standalones] = await Promise.all([

    // ── Collections ──────────────────────────────────────────
    db.collection.findMany({
      where: {
        OR: [
          { title:       { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { category:    { contains: q, mode: "insensitive" } },
          { tag:         { contains: q, mode: "insensitive" } },
        ],
      },
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
      take: limit,
    }),

    // ── Standalone Images ─────────────────────────────────────
    // Only images that are standalone (collectionId IS NULL + deviceType set)
    db.image.findMany({
      where: {
        collectionId: null,
        deviceType:   { not: null },
        OR: [
          { title:       { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          // tags is String[] — hasSome checks for any overlap
          { tags: { hasSome: tagTokens } },
        ],
      },
      select: {
        id:         true,
        slug:       true,
        title:      true,
        r2Key:      true,       // thumbnail key
        deviceType: true,
        tags:       true,
      },
      take: limit,
    }),
  ]);

  // ── Normalise to unified shape ────────────────────────────
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

  // ── Sort: exact title match first, then partial, then rest ──
  const ql = q.toLowerCase();
  return all.sort((a, b) => {
    const aExact = a.title.toLowerCase() === ql ? 0 : 1;
    const bExact = b.title.toLowerCase() === ql ? 0 : 1;
    if (aExact !== bExact) return aExact - bExact;

    const aStart = a.title.toLowerCase().startsWith(ql) ? 0 : 1;
    const bStart = b.title.toLowerCase().startsWith(ql) ? 0 : 1;
    return aStart - bStart;
  });
}