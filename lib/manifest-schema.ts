/**
 * lib/manifest-schema.ts
 *
 * Zod validation for data/manifest.json
 *
 * Rules enforced:
 *  ✅ No duplicate collection slugs
 *  ✅ No duplicate collection titles
 *  ✅ No duplicate thumbnailR2Key values
 *  ✅ No duplicate image slugs within a collection
 *  ✅ No duplicate image slugs across ALL collections
 *  ✅ No slug collision between collections and standalone images
 *  ✅ No duplicate standalone slugs
 *  ✅ Cover thumbnail filename must match collection slug
 *  ✅ All existing field rules (prefix, extension, min/max lengths)
 *
 * Usage in import scripts:
 *
 *   import manifestRaw from "../data/manifest.json";
 *   import { validateManifest } from "../lib/manifest-schema";
 *
 *   const manifest = validateManifest(manifestRaw);
 *   // Throws with a clear human-readable error if anything is invalid.
 *   // Returns the parsed, fully-typed manifest on success.
 */

import { z } from "zod";

// ─── Regex helpers ────────────────────────────────────────────────────────────

/** Lowercase, hyphen-separated, URL-safe slug */
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Accepted image file extensions */
const imageExt = /\.(webp|jpg|jpeg|png)$/i;

/** Accepted archive or image extensions */
const archiveOrImageExt = /\.(zip|webp|jpg|jpeg|png)$/i;

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

const CollectionImageSchema = z.object({
  slug: z
    .string()
    .min(3, "Image slug must be at least 3 characters")
    .max(80, "Image slug must be at most 80 characters")
    .regex(slugRegex, "Image slug must be lowercase and hyphenated (e.g. dark-witch-portrait)"),

  title: z
    .string()
    .min(3, "Image title must be at least 3 characters")
    .max(120, "Image title must be at most 120 characters"),

  description: z.string().max(500, "Image description must be at most 500 characters").optional(),

  sortOrder: z.number().int().min(0).default(0),

  thumbExt:   z.enum(["webp", "jpg", "jpeg", "png"]).optional().default("jpeg"),
  highResExt: z.enum(["webp", "jpg", "jpeg", "png"]).optional().default("jpeg"),
});

const CollectionSchema = z.object({
  slug: z
    .string()
    .min(3, "Collection slug must be at least 3 characters")
    .max(80, "Collection slug must be at most 80 characters")
    .regex(slugRegex, "Collection slug must be lowercase and hyphenated (e.g. dark-goddess-hecate)"),

  title: z
    .string()
    .min(3, "Collection title must be at least 3 characters")
    .max(120, "Collection title must be at most 120 characters"),

  description: z
    .string()
    .min(10, "Collection description must be at least 10 characters")
    .max(500, "Collection description must be at most 500 characters"),

  category: z
    .string()
    .min(2, "Category must be at least 2 characters")
    .max(60, "Category must be at most 60 characters"),

  thumbnailR2Key: z
    .string()
    .refine(
      (val) => val.startsWith("thumbnails/") && imageExt.test(val),
      { message: "thumbnailR2Key must start with 'thumbnails/' and end in .webp/.jpg/.jpeg/.png" }
    ),

  fullResR2Key: z
    .string()
    .refine(
      (val) => val.startsWith("files/") && archiveOrImageExt.test(val),
      { message: "fullResR2Key must start with 'files/' and end in .zip/.webp/.jpg/.jpeg/.png" }
    )
    .optional(),

  price:    z.number().min(0).optional().default(0),
  isFree:   z.boolean().optional().default(true),
  badge:    z.enum(["New", "Hot", "Free"]).nullable().optional(),
  icon:     z.string().default("🌙"),
  bgClass:  z.string().default("p-bg-1"),
  tag:      z.string().default("Collection"),
  featured: z.boolean().default(false),

  images: z.array(CollectionImageSchema).optional().default([]),

}).superRefine((data, ctx) => {
  // Cover thumbnail filename must match the collection slug
  const thumbFilename =
    data.thumbnailR2Key.split("/").pop()?.replace(/\.[^.]+$/, "") ?? "";
  if (thumbFilename !== data.slug) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["thumbnailR2Key"],
      message: `Cover filename must match slug: expected "${data.slug}.<ext>", got "${thumbFilename}.<ext>"`,
    });
  }

  // Bundle zip basename must also match slug
  if (data.fullResR2Key) {
    const fileBasename =
      data.fullResR2Key.split("/").pop()?.replace(/\.[^.]+$/, "") ?? "";
    if (fileBasename !== data.slug) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fullResR2Key"],
        message: `File basename must match slug: expected "${data.slug}.<ext>", got "${fileBasename}.<ext>"`,
      });
    }
  }

  // No duplicate image slugs within this collection
  const imageSlugs = (data.images ?? []).map((img) => img.slug);
  const seenImageSlugs = new Set<string>();
  imageSlugs.forEach((s, idx) => {
    if (seenImageSlugs.has(s)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["images", idx, "slug"],
        message: `Duplicate image slug within collection "${data.slug}": "${s}"`,
      });
    }
    seenImageSlugs.add(s);
  });
});

const DeviceTypeValues = ["IPHONE", "ANDROID", "PC"] as const;

const StandaloneSchema = z.object({
  slug: z
    .string()
    .min(3, "Standalone slug must be at least 3 characters")
    .max(80, "Standalone slug must be at most 80 characters")
    .regex(slugRegex, "Standalone slug must be lowercase and hyphenated"),

  title:       z.string().min(3).max(120),
  description: z.string().max(500).optional(),

  deviceType: z.enum(DeviceTypeValues),
  tags: z
    .array(z.string().min(1).max(40))
    .min(1, "At least one tag required for standalone images"),

  ext:       z.enum(["webp", "jpg", "jpeg", "png"]).optional().default("jpeg"),
  sortOrder: z.number().int().min(0).default(0),
});

// ─── Root manifest schema (structure only) ───────────────────────────────────

const ManifestStructureSchema = z.object({
  collections: z.array(CollectionSchema).optional().default([]),
  standalone:  z.array(StandaloneSchema).optional().default([]),
});

// ─── Duplicate-detection across the whole manifest ───────────────────────────

function findDuplicates(arr: string[]): string[] {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const val of arr) {
    if (seen.has(val)) dupes.add(val);
    seen.add(val);
  }
  return [...dupes];
}

// ─── Public validator ─────────────────────────────────────────────────────────

export type ValidatedManifest = z.infer<typeof ManifestStructureSchema>;

/**
 * Validates a raw manifest object against all rules.
 * Throws a descriptive Error on any violation.
 * Returns the fully-typed, parsed manifest on success.
 */
export function validateManifest(raw: unknown): ValidatedManifest {
  // 1. Run structural Zod validation (field types, lengths, per-collection duplicate slugs)
  const result = ManifestStructureSchema.safeParse(raw);
  if (!result.success) {
    const messages = result.error.issues
      .map((e) => `  [${e.path.join(".")}] ${e.message}`)
      .join("\n");
    throw new Error(`❌ manifest.json validation failed:\n${messages}`);
  }

  const manifest = result.data;
  const errors: string[] = [];

  // 2. Collect all slugs/titles/keys for cross-manifest duplicate checks
  const collectionSlugs      = manifest.collections.map((c) => c.slug);
  const collectionTitles     = manifest.collections.map((c) => c.title);
  const collectionThumbKeys  = manifest.collections.map((c) => c.thumbnailR2Key);
  const standaloneSlugs      = manifest.standalone.map((s) => s.slug);

  // All image slugs across all collections (flat)
  const allImageSlugs: string[] = manifest.collections.flatMap(
    (c) => (c.images ?? []).map((img) => img.slug)
  );

  // 3. Duplicate collection slugs
  findDuplicates(collectionSlugs).forEach((slug) => {
    errors.push(`Duplicate collection slug: "${slug}"`);
  });

  // 4. Duplicate collection titles
  findDuplicates(collectionTitles).forEach((title) => {
    errors.push(`Duplicate collection title: "${title}"`);
  });

  // 5. Duplicate thumbnailR2Key values across collections
  findDuplicates(collectionThumbKeys).forEach((key) => {
    errors.push(`Duplicate thumbnailR2Key: "${key}"`);
  });

  // 6. Duplicate image slugs across ALL collections (global)
  findDuplicates(allImageSlugs).forEach((slug) => {
    const parentCollection = manifest.collections.find((c) =>
      (c.images ?? []).some((img) => img.slug === slug)
    );
    errors.push(
      `Duplicate image slug across collections: "${slug}"` +
        (parentCollection ? ` (first seen in "${parentCollection.slug}")` : "")
    );
  });

  // 7. Duplicate standalone slugs
  findDuplicates(standaloneSlugs).forEach((slug) => {
    errors.push(`Duplicate standalone slug: "${slug}"`);
  });

  // 8. Slug collision between collections and standalone
  const collectionSlugSet = new Set(collectionSlugs);
  standaloneSlugs.forEach((slug) => {
    if (collectionSlugSet.has(slug)) {
      errors.push(
        `Slug collision between collection and standalone: "${slug}" exists in both`
      );
    }
  });

  // 9. Slug collision between collection image slugs and standalone slugs
  const standaloneSlugSet = new Set(standaloneSlugs);
  allImageSlugs.forEach((slug) => {
    if (standaloneSlugSet.has(slug)) {
      errors.push(
        `Slug collision: image slug "${slug}" also exists as a standalone slug`
      );
    }
  });

  if (errors.length > 0) {
    throw new Error(
      `❌ manifest.json duplicate/collision errors:\n${errors.map((e) => `  • ${e}`).join("\n")}`
    );
  }

  return manifest;
}

/**
 * Convenience: validate and pretty-print results to console.
 * Useful for running as a standalone check script.
 *
 * Usage: npx ts-node -e "require('./lib/manifest-schema').checkManifest(require('./data/manifest.json'))"
 */
export function checkManifest(raw: unknown): boolean {
  try {
    const manifest = validateManifest(raw);
    const totalImages =
      manifest.collections.reduce((sum, c) => sum + (c.images?.length ?? 0), 0) +
      manifest.standalone.length;
    console.log(`✅ manifest.json is valid`);
    console.log(`   Collections : ${manifest.collections.length}`);
    console.log(`   Standalone  : ${manifest.standalone.length}`);
    console.log(`   Total images: ${totalImages}`);
    return true;
  } catch (err) {
    console.error((err as Error).message);
    return false;
  }
}