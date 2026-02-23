/**
 * prisma/seed.ts
 * Run with: npx prisma db seed
 * Add to package.json: "prisma": { "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts" }
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SEED_COLLECTIONS = [
  {
    title: "Dark Goddesses",
    description: "Divine feminine power meets occult darkness. Hecate, Lilith, Kali, and more.",
    category: "Goddess",
    thumbnail: "thumbnails/dark-goddesses.webp",   // upload this to R2
    downloadUrl: "files/dark-goddesses-pack.zip",  // upload this to R2
    price: 4.99,
    isFree: false,
    badge: "New",
    icon: "🌙",
    bgClass: "cat-bg-goddess",
    tag: "Featured",
    featured: true,
  },
  {
    title: "Devils & Demons",
    description: "From Baphomet to Bael — infernal art for the damned.",
    category: "Demon",
    thumbnail: "thumbnails/devils-demons.webp",
    downloadUrl: "files/devils-demons-pack.zip",
    price: 6.99,
    isFree: false,
    badge: "Hot",
    icon: "🔱",
    bgClass: "cat-bg-demon",
    tag: "Dark",
    featured: false,
  },
  {
    title: "Tarot Cards",
    description: "Major Arcana reimagined through a dark fantasy lens.",
    category: "Tarot",
    thumbnail: "thumbnails/tarot-cards.webp",
    downloadUrl: "files/tarot-cards-pack.zip",
    price: 0,
    isFree: true,
    badge: "Free",
    icon: "🃏",
    bgClass: "cat-bg-tarot",
    tag: "Mystical",
    featured: false,
  },
  {
    title: "Skeletons",
    description: "Death is just an aesthetic. Skull art and memento mori for your screens.",
    category: "Gothic",
    thumbnail: "thumbnails/skeletons.webp",
    downloadUrl: "files/skeletons-pack.zip",
    price: 3.99,
    isFree: false,
    badge: null,
    icon: "💀",
    bgClass: "cat-bg-skeleton",
    tag: "Popular",
    featured: false,
  },
  {
    title: "Dark Humor",
    description: "Because death is funnier than your Monday morning. Viral occult memes.",
    category: "Dark Humor",
    thumbnail: "thumbnails/dark-humor.webp",
    downloadUrl: "files/dark-humor-pack.zip",
    price: 2.99,
    isFree: false,
    badge: "Hot",
    icon: "😈",
    bgClass: "cat-bg-humor",
    tag: "Viral",
    featured: false,
  },
  {
    title: "Void Witch Series Vol.1",
    description: "Nine wallpapers. One coven. Pure atmospheric darkness.",
    category: "Dark Fantasy",
    thumbnail: "thumbnails/void-witch.webp",
    downloadUrl: "files/void-witch-vol1.zip",
    price: 9.99,
    isFree: false,
    badge: "Hot",
    icon: "🌑",
    bgClass: "p-bg-5",
    tag: "Collection",
    featured: false,
  },
  {
    title: "Blood Moon Cathedral",
    description: "Gothic architecture bathed in crimson moonlight.",
    category: "Gothic",
    thumbnail: "thumbnails/blood-moon.webp",
    downloadUrl: "files/blood-moon-pack.zip",
    price: 4.99,
    isFree: false,
    badge: "New",
    icon: "🦇",
    bgClass: "p-bg-7",
    tag: "Collection",
    featured: false,
  },
  {
    title: "Leviathan's Tide — Freebie",
    description: "Three wallpapers from the depths. On us.",
    category: "Occult",
    thumbnail: "thumbnails/leviathan.webp",
    downloadUrl: "files/leviathan-freebie.zip",
    price: 0,
    isFree: true,
    badge: "Free",
    icon: "🌊",
    bgClass: "p-bg-8",
    tag: "Collection",
    featured: false,
  },
];

async function main() {
  console.log("🕯️  Seeding VoidCanvas database...");

  // Upsert so re-running seed doesn't create duplicates
  for (const data of SEED_COLLECTIONS) {
    await prisma.collection.upsert({
      where: { id: "seed-" + data.title.toLowerCase().replace(/\s+/g, "-").slice(0, 30) },
      update: data,
      create: {
        id: "seed-" + data.title.toLowerCase().replace(/\s+/g, "-").slice(0, 30),
        ...data,
      },
    });
    console.log(`  ✓ ${data.title}`);
  }

  console.log("✅ Seeding complete. Open Prisma Studio to verify: npx prisma studio");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());