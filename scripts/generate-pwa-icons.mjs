#!/usr/bin/env node
/**
 * scripts/generate-pwa-icons.mjs
 *
 * Generates icon-192.png and icon-512.png for PWA manifest.
 * Run once: node scripts/generate-pwa-icons.mjs
 *
 * Requires: npm install sharp --save-dev
 *
 * HOW TO USE:
 *   1. Put your source icon (at least 512×512 px) at public/icon-source.png
 *   2. Run: node scripts/generate-pwa-icons.mjs
 *   3. Commit public/icon-192.png and public/icon-512.png
 *
 * WHY THIS MATTERS:
 *   Chrome on Android (dominant browser in Nigeria, Kenya, Myanmar, India)
 *   requires icon-192.png in the manifest to show the PWA install prompt
 *   and to display a proper homescreen icon. Without it:
 *     - The manifest warning fires: "Download error or resource isn't a valid image"
 *     - The install prompt never appears
 *     - The app shows a blank/generic icon if installed anyway
 */

import sharp from "sharp";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

const SOURCE = join(publicDir, "icon-source.png");

// Fall back to apple-touch-icon if no dedicated source exists
const FALLBACK = join(publicDir, "apple-touch-icon.png");

const source = existsSync(SOURCE) ? SOURCE : FALLBACK;

if (!existsSync(source)) {
  console.error("❌ No source icon found. Place a 512×512 PNG at public/icon-source.png");
  process.exit(1);
}

const sizes = [192, 512];

for (const size of sizes) {
  const output = join(publicDir, `icon-${size}.png`);
  await sharp(source)
    .resize(size, size, { fit: "contain", background: { r: 12, g: 11, b: 20, alpha: 1 } })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(output);
  console.log(`✅ Generated ${output}`);
}

console.log("\n✅ Done. Commit public/icon-192.png and public/icon-512.png");
