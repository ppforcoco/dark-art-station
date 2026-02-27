import { z } from "zod";

// Slug must be lowercase, hyphenated, URL-safe
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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

  thumbnailR2Key: z
    .string()
    .refine((val) => val.startsWith("thumbnails/") && val.endsWith(".webp"), {
      message: "thumbnailR2Key must be 'thumbnails/<slug>.webp'",
    }),

  // Now optional — collections may not have a bundle ZIP
  fullResR2Key: z
    .string()
    .refine((val) => val.startsWith("files/") && val.endsWith(".zip"), {
      message: "fullResR2Key must be 'files/<slug>.zip'",
    })
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
  })).optional().default([]),

}).superRefine((data, ctx) => {
  const expectedThumb = `thumbnails/${data.slug}.webp`;
  if (data.thumbnailR2Key !== expectedThumb) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["thumbnailR2Key"],
      message: `Expected "${expectedThumb}", got "${data.thumbnailR2Key}"`,
    });
  }

  if (data.fullResR2Key) {
    const expectedFile = `files/${data.slug}.zip`;
    if (data.fullResR2Key !== expectedFile) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fullResR2Key"],
        message: `Expected "${expectedFile}", got "${data.fullResR2Key}"`,
      });
    }
  }
});

export type CollectionInput = z.infer<typeof CollectionSchema>;

// ─── R2 Key Helpers ───────────────────────────────────────────────────────────

export function collectionThumbKey(collectionSlug: string) {
  return `thumbnails/${collectionSlug}.webp`;
}

export function imageThumbKey(collectionSlug: string, imageSlug: string) {
  return `thumbnails/${collectionSlug}/${imageSlug}.webp`;
}

export function imageHighResKey(collectionSlug: string, imageSlug: string) {
  return `high-res/${collectionSlug}/${imageSlug}.png`;
}

export function collectionZipKey(collectionSlug: string) {
  return `files/${collectionSlug}.zip`;
}