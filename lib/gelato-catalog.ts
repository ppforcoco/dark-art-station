// lib/gelato-catalog.ts
//
// Maps your storefront variant strings (the ones in Product.variants,
// e.g. "iPhone 14") to Gelato's real product UIDs.
//
// WHY THIS FILE EXISTS:
// Gelato's order API does not accept "iPhone 14" — it needs an exact
// product UID string like "hardcase_iphone-14_gloss" (made up example).
// This table is the translation layer between what your customer picks
// on the site and what Gelato actually needs to print + ship.
//
// ── HOW TO FILL IN THE REAL UIDs (2 minutes per variant) ──────────────────
// 1. Log into your Gelato dashboard → Product Catalog.
// 2. Find "Phone Case" → pick a case type (Tough case is a good default —
//    dye-sub print, holds detail well for dark art designs).
// 3. Select the exact phone model (must match your variant, e.g. iPhone 14).
// 4. Scroll to the description box on that product page — the UID is
//    printed there. Copy it exactly, including all dashes/underscores.
// 5. Paste it into the matching line below.
// Repeat for every variant. For T-shirts, do the same under "Apparel" →
// "T-shirt" → pick the size.
//
// If a variant's UID is left as "" (empty), we'll block checkout for that
// variant later rather than send Gelato a request that will just fail —
// safer than silently accepting an order we can't fulfill.

export const PHONE_CASE_UID_MAP: Record<string, string> = {
  "iPhone 14":   "phonecase_apple_iphone-14_tough_white_glossy", // ✅ confirmed
  "iPhone 15":   "", // TODO
  "iPhone 16":   "", // TODO
  "Galaxy S23":  "", // TODO — double check Gelato still stocks this before launch
  "Galaxy S24":  "", // TODO — double check Gelato still stocks this before launch
};

export const TSHIRT_UID_MAP: Record<string, string> = {
  "S":   "", // TODO
  "M":   "", // TODO
  "L":   "", // TODO
  "XL":  "", // TODO
  "XXL": "", // TODO
};

// Category name (from Product.category) → which map to use.
const CATEGORY_UID_MAPS: Record<string, Record<string, string>> = {
  "Phone Case": PHONE_CASE_UID_MAP,
  "T-Shirt":    TSHIRT_UID_MAP,
};

/**
 * Look up the Gelato product UID for a given product category + variant.
 * Returns null if there's no mapping yet (UID still blank) or the
 * category/variant combo isn't recognized — callers should treat null
 * as "can't fulfill this via Gelato yet".
 */
export function getGelatoProductUid(category: string, variant: string): string | null {
  const map = CATEGORY_UID_MAPS[category];
  if (!map) return null;
  const uid = map[variant];
  return uid ? uid : null;
}
