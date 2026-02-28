import { z } from "zod";

// Slug must be lowercase, hyphenated, URL-safe
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Accepted image extensions
const imageExt = /\.(webp|jpg|jpeg|png)$/i;
const archiveOrImageExt = /\.(zip|webp|jpg|jpeg|png)$/i;

// ─── Collection Schema ────────────────────────────────────────────────────────

export const CollectionSchema = z.object({
  slug: z
    .string()
    .min(3)
    .max(80)
    .regex(slugRegex, "Slug must be lowercase and hyphenated (e.g. dark-goddess-hecate)"),

  title: z.string().min(3).max(120),
  description: z.string().min(10).max(500),
  category: z.string().min(2).max(60),

  // Accepts flat:   thumbnails/<slug>.jpeg
  // OR nested:      thumbnails/<slug>/<slug>.jpeg
  // Any of: .webp .jpg .jpeg .png
  thumbnailR2Key: z
    .string()
    .refine(
      (val) => val.startsWith("thumbnails/") && imageExt.test(val),
      { message: "thumbnailR2Key must start with 'thumbnails/' and end in .webp/.jpg/.jpeg/.png" }
    ),

  // Optional bundle ZIP or image
  fullResR2Key: z
    .string()
    .refine(
      (val) => val.startsWith("files/") && archiveOrImageExt.test(val),
      { message: "fullResR2Key must start with 'files/' and end in .zip/.webp/.jpg/.jpeg/.png" }
    )
    .optional(),

  price: z.number().min(0).optional().default(0),
  isFree: z.boolean().optional().default(true),
  badge: z.enum(["New", "Hot", "Free"]).nullable().optional(),
  icon: z.string().default("🌙"),
  bgClass: z.string().default("p-bg-1"),
  tag: z.string().default("Collection"),
  featured: z.boolean().default(false),

  // Inline image definitions
  images: z.array(z.object({
    slug: z
      .string()
      .min(3)
      .max(80)
      .regex(slugRegex, "Image slug must be lowercase and hyphenated"),
    title: z.string().min(3).max(120),
    description: z.string().max(500).optional(),
    sortOrder: z.number().int().min(0).default(0),
    // Per-image extension — defaults to jpeg, override per image if needed
    thumbExt:   z.enum(["webp", "jpg", "jpeg", "png"]).optional().default("jpeg"),
    highResExt: z.enum(["webp", "jpg", "jpeg", "png"]).optional().default("jpeg"),
  })).optional().default([]),

}).superRefine((data, ctx) => {
  // Extract just the filename (after last /), strip extension, compare to slug
  const thumbFilename = data.thumbnailR2Key.split("/").pop()?.replace(/\.[^.]+$/, "") ?? "";
  if (thumbFilename !== data.slug) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["thumbnailR2Key"],
      message: `Cover filename must match slug: expected "${data.slug}.<ext>", got "${thumbFilename}.<ext>"`,
    });
  }

  if (data.fullResR2Key) {
    const fileBasename = data.fullResR2Key.split("/").pop()?.replace(/\.[^.]+$/, "") ?? "";
    if (fileBasename !== data.slug) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fullResR2Key"],
        message: `File basename must match slug: expected "${data.slug}.<ext>", got "${fileBasename}.<ext>"`,
      });
    }
  }
});

export type CollectionInput = z.infer<typeof CollectionSchema>;

// ─── R2 Key Helpers ───────────────────────────────────────────────────────────
// ext defaults to "jpeg" to match current uploads.
// Pass a different ext when your file is .webp or .png.

/** Collection cover — nested under its own subfolder */
export function collectionThumbKey(collectionSlug: string, ext = "jpeg") {
  return `thumbnails/${collectionSlug}/${collectionSlug}.${ext}`;
}

/** Individual image thumbnail — nested under collection subfolder */
export function imageThumbKey(collectionSlug: string, imageSlug: string, ext = "jpeg") {
  return `thumbnails/${collectionSlug}/${imageSlug}.${ext}`;
}

/** Individual image high-res download */
export function imageHighResKey(collectionSlug: string, imageSlug: string, ext = "jpeg") {
  return `high-res/${collectionSlug}/${imageSlug}.${ext}`;
}

/** Bundle ZIP */
export function collectionZipKey(collectionSlug: string) {
  return `files/${collectionSlug}.zip`;
}