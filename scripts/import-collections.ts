/**
 * scripts/import-collections.ts
 * Syncs data/manifest.json → PostgreSQL via Prisma upsert.
 *
 * Run with: npm run ingest
 */

import path from "path";
import fs from "fs";
import { PrismaClient } from "@prisma/client";
import { CollectionSchema, CollectionInput } from "../lib/schemas";

const prisma = new PrismaClient();

async function main() {
  const manifestPath = path.resolve(__dirname, "../data/manifest.json");

  if (!fs.existsSync(manifestPath)) {
    console.error("❌ manifest.json not found at", manifestPath);
    process.exit(1);
  }

  const raw: unknown[] = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

  console.log(`\n🕯️  VOIDCANVAS Ingestion Pipeline`);
  console.log(`   Found ${raw.length} entries in manifest.json\n`);

  let passed = 0;
  let failed = 0;

  for (const entry of raw) {
    const result = CollectionSchema.safeParse(entry);

    if (!result.success) {
      failed++;
      const slugGuess = (entry as Record<string, unknown>).slug ?? "(unknown)";
      console.error(`  ✗ [${slugGuess}] Validation failed:`);
      for (const issue of result.error.issues) {
        console.error(`      → ${issue.path.join(".")}: ${issue.message}`);
      }
      continue;
    }

    const data: CollectionInput = result.data;

    // Map manifest fields → Prisma Collection model fields
    const prismaPayload = {
      slug:        data.slug,
      title:       data.title,
      description: data.description,
      category:    data.category,
      thumbnail:   data.thumbnailR2Key,   // stored as R2 key in DB
      downloadUrl: data.fullResR2Key,      // stored as R2 key in DB
      price:       data.price,
      isFree:      data.isFree,
      badge:       data.badge ?? null,
      icon:        data.icon,
      bgClass:     data.bgClass,
      tag:         data.tag,
      featured:    data.featured,
    };

    try {
      await prisma.collection.upsert({
        where: { slug: data.slug },
        update: prismaPayload,
        create: prismaPayload,
      });

      console.log(`  ✓ [${data.slug}] "${data.title}" — upserted`);
      passed++;
    } catch (err) {
      failed++;
      console.error(`  ✗ [${data.slug}] DB error:`, err);
    }
  }

  console.log(`\n─────────────────────────────────────`);
  console.log(`  ✅ ${passed} upserted  |  ❌ ${failed} failed`);

  if (failed > 0) {
    console.log(`\n  Fix the errors above and re-run: npm run ingest`);
    process.exit(1);
  }

  console.log(`\n  All done. Run: npx prisma studio  to verify.\n`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());