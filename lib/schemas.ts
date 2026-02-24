import { z } from "zod";

// Slug must be lowercase, hyphenated, URL-safe
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const CollectionSchema = z.object({
  slug: z
    .string()
    .min(3)
    .max(80)
    .regex(slugRegex, "Slug must be lowercase and hyphenated (e.g. dark-goddess-hecate)"),

  title: z.string().min(3).max(120),

  description: z.string().min(10).max(500),

  category: z.string().min(2).max(60),

  // Auto-derived from slug — validated to enforce naming convention
  thumbnailR2Key: z
    .string()
    .refine((val) => val.startsWith("thumbnails/") && val.endsWith(".webp"), {
      message: "thumbnailR2Key must be 'thumbnails/<slug>.webp'",
    }),

  fullResR2Key: z
    .string()
    .refine((val) => val.startsWith("files/") && val.endsWith(".zip"), {
      message: "fullResR2Key must be 'files/<slug>.zip'",
    }),

  price: z.number().min(0),

  isFree: z.boolean(),

  badge: z.enum(["New", "Hot", "Free"]).nullable().optional(),

  icon: z.string().emoji("Must be a single emoji").default("🌙"),

  bgClass: z.string().default("p-bg-1"),

  tag: z.string().default("Collection"),

  featured: z.boolean().default(false),
}).superRefine((data, ctx) => {
  // Enforce that R2 keys match the slug exactly
  const expectedThumb = `thumbnails/${data.slug}.webp`;
  const expectedFile = `files/${data.slug}.zip`;

  if (data.thumbnailR2Key !== expectedThumb) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["thumbnailR2Key"],
      message: `Must match slug: expected "${expectedThumb}", got "${data.thumbnailR2Key}"`,
    });
  }

  if (data.fullResR2Key !== expectedFile) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["fullResR2Key"],
      message: `Must match slug: expected "${expectedFile}", got "${data.fullResR2Key}"`,
    });
  }

  // Free items must have price 0; paid items must have price > 0
  if (data.isFree && data.price !== 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["price"],
      message: "Free collections must have price 0",
    });
  }

  if (!data.isFree && data.price <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["price"],
      message: "Paid collections must have price > 0",
    });
  }
});

export type CollectionInput = z.infer<typeof CollectionSchema>;

// Helper to build a manifest entry with auto-derived R2 keys from a slug
export function buildManifestEntry(
  slug: string,
  rest: Omit<CollectionInput, "slug" | "thumbnailR2Key" | "fullResR2Key">
): CollectionInput {
  return {
    slug,
    thumbnailR2Key: `thumbnails/${slug}.webp`,
    fullResR2Key: `files/${slug}.zip`,
    ...rest,
  };
}