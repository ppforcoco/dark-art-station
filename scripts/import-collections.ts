/**
 * scripts/import-collections.ts
 * Syncs data/manifest.json → PostgreSQL via Prisma upsert.
 * Handles both Collection metadata and nested Image records.
 *
 * Run with: npm run ingest
 */

import path from "path";
import fs from "fs";
import { PrismaClient } from "@prisma/client";
import {
  CollectionSchema,
  CollectionInput,
  imageThumbKey,
  imageHighResKey,
  StandaloneSchema,
  StandaloneInput,
  standaloneHighResKey,
  standaloneThumbnailKey,
} from "../lib/schemas";

const prisma = new PrismaClient();

async function main() {
  const manifestPath = path.resolve(__dirname, "../data/manifest.json");

  if (!fs.existsSync(manifestPath)) {
    console.error("❌ manifest.json not found at", manifestPath);
    process.exit(1);
  }

  const raw: { collections?: unknown[]; standalones?: unknown[] } = JSON.parse(
    fs.readFileSync(manifestPath, "utf-8")
  );

  // Support both legacy flat array format and new split format
  const collectionsRaw: unknown[] = Array.isArray(raw)
    ? (raw as unknown[])
    : (raw.collections ?? []);
  const standalonesRaw: unknown[] = Array.isArray(raw) ? [] : (raw.standalones ?? []);

  console.log(`\n🕯️  VOIDCANVAS Ingestion Pipeline`);
  console.log(`   Found ${collectionsRaw.length} collections in manifest.json`);
  console.log(`   Found ${standalonesRaw.length} standalones in manifest.json\n`);

  let collectionsPassed = 0;
  let collectionsFailed = 0;
  let imagesPassed = 0;
  let imagesFailed = 0;

  for (const entry of collectionsRaw) {
    const result = CollectionSchema.safeParse(entry);

    if (!result.success) {
      collectionsFailed++;
      const slugGuess = (entry as Record<string, unknown>).slug ?? "(unknown)";
      console.error(`  ✗ [${slugGuess}] Validation failed:`);
      for (const issue of result.error.issues) {
        console.error(`      → ${issue.path.join(".")}: ${issue.message}`);
      }
      continue;
    }

    const data: CollectionInput = result.data;

    // ── Upsert Collection ──────────────────────────────────────────────────
    const collectionPayload = {
      slug:            data.slug,
      title:           data.title,
      description:     data.description,
      // metaDescription: stored separately — used by generateMetadata() instead of description
      metaDescription: (data as Record<string, unknown>).metaDescription as string | undefined ?? null,
      // thumbnailAlt: SEO alt text for the collection cover image
      thumbnailAlt:    (data as Record<string, unknown>).altText as string | undefined ?? null,
      category:        data.category,
      thumbnail:       data.thumbnailR2Key,
      downloadUrl:     data.fullResR2Key ?? null,
      price:           data.price,
      isFree:          data.isFree,
      badge:           data.badge ?? null,
      icon:            data.icon,
      bgClass:         data.bgClass,
      tag:             data.tag,
      featured:        data.featured,
      isAdult:         data.isAdult ?? false,
    };

    let collectionId: string;

    try {
      const upserted = await prisma.collection.upsert({
        where:  { slug: data.slug },
        update: collectionPayload,
        create: collectionPayload,
        select: { id: true },
      });
      collectionId = upserted.id;
      collectionsPassed++;
      console.log(`  ✓ [${data.slug}] "${data.title}" — collection upserted`);
    } catch (err) {
      collectionsFailed++;
      console.error(`  ✗ [${data.slug}] Collection DB error:`, err);
      continue;
    }

    // ── Upsert Images ──────────────────────────────────────────────────────
    if (!data.images || data.images.length === 0) {
      console.log(`      ↳ No images defined`);
      continue;
    }

    for (const img of data.images) {
      const imgTags: string[] = [];
      if (img.isAdult || data.isAdult) imgTags.push("18plus");

      const imagePayload = {
        slug:         img.slug,
        title:        img.title,
        description:  img.description ?? null,
        // altText: SEO-optimised alt text for <Image> tags, stored in DB
        altText:      (img as Record<string, unknown>).altText as string | undefined ?? null,
        r2Key:        imageHighResKey(data.slug, img.slug, img.highResExt ?? "jpeg"),
        highResKey:   imageHighResKey(data.slug, img.slug, img.highResExt ?? "jpeg"),
        sortOrder:    img.sortOrder,
        collectionId,
        isAdult:      !!(img.isAdult || data.isAdult),
        ...(imgTags.length > 0 && { tags: imgTags }),
      };

      try {
        await prisma.image.upsert({
          where:  { slug: img.slug },
          update: imagePayload,
          create: imagePayload,
        });
        imagesPassed++;
        console.log(`      ↳ ✓ [${img.slug}] "${img.title}"`);
      } catch (err) {
        imagesFailed++;
        console.error(`      ↳ ✗ [${img.slug}] Image DB error:`, err);
      }
    }
  }

  console.log(`\n─────────────────────────────────────────────────`);
  console.log(`  ⬇  Processing ${standalonesRaw.length} standalone images...\n`);

  let standalonesPassed = 0;
  let standalonesFailed = 0;

  for (const entry of standalonesRaw) {
    const result = StandaloneSchema.safeParse(entry);

    if (!result.success) {
      standalonesFailed++;
      const slugGuess = (entry as Record<string, unknown>).slug ?? "(unknown)";
      console.error(`  ✗ [${slugGuess}] Standalone validation failed:`);
      for (const issue of result.error.issues) {
        console.error(`      → ${issue.path.join(".")}: ${issue.message}`);
      }
      continue;
    }

    const data: StandaloneInput = result.data;
    const ext = data.ext ?? "jpeg";

    const standaloneTags = [...(data.tags ?? [])];
    if (data.isAdult && !standaloneTags.includes("18plus")) standaloneTags.push("18plus");

    const imagePayload = {
      slug:        data.slug,
      title:       data.title,
      description: data.description ?? null,
      // altText: SEO-optimised alt text stored per image
      altText:     (data as Record<string, unknown>).altText as string | undefined ?? null,
      r2Key:       standaloneThumbnailKey(data.deviceType, data.slug, ext),
      highResKey:  standaloneHighResKey(data.deviceType, data.slug, ext),
      deviceType:  data.deviceType,
      tags:        standaloneTags,
      sortOrder:   data.sortOrder,
      isAdult:     data.isAdult ?? false,
      // collectionId intentionally omitted — standalone image
    };

    try {
      await prisma.image.upsert({
        where:  { slug: data.slug },
        update: imagePayload,
        create: imagePayload,
      });
      standalonesPassed++;
      console.log(`  ✓ [${data.slug}] "${data.title}" [${data.deviceType}] — standalone upserted`);
    } catch (err) {
      standalonesFailed++;
      console.error(`  ✗ [${data.slug}] Standalone DB error:`, err);
    }
  }

  console.log(`\n─────────────────────────────────────────────────`);
  console.log(`  Collections: ✅ ${collectionsPassed}  |  ❌ ${collectionsFailed}`);
  console.log(`  Images:      ✅ ${imagesPassed}  |  ❌ ${imagesFailed}`);
  console.log(`  Standalones: ✅ ${standalonesPassed}  |  ❌ ${standalonesFailed}`);

  if (collectionsFailed > 0 || imagesFailed > 0 || standalonesFailed > 0) {
    console.log(`\n  Fix errors above and re-run: npm run ingest`);
    process.exit(1);
  }

  console.log(`\n  All done. npx prisma studio to verify.\n`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());