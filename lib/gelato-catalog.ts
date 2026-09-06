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
  // ── Apple ──
  "iPhone 7":                    "", // TODO
  "iPhone 7 Plus":               "", // TODO
  "iPhone 8":                    "", // TODO
  "iPhone 8 Plus":               "", // TODO
  "iPhone SE (2020)":            "", // TODO
  "iPhone X":                    "", // TODO
  "iPhone XS":                   "", // TODO
  "iPhone XS Max":               "", // TODO
  "iPhone XR":                   "", // TODO
  "iPhone 11":                   "", // TODO
  "iPhone 11 Pro":               "", // TODO
  "iPhone 11 Pro Max":           "", // TODO
  "iPhone 12":                   "", // TODO
  "iPhone 12 Mini":              "", // TODO
  "iPhone 12 Pro":               "", // TODO
  "iPhone 12 Pro Max":           "", // TODO
  "iPhone 13":                   "", // TODO
  "iPhone 13 Mini":              "", // TODO
  "iPhone 13 Pro":               "", // TODO
  "iPhone 13 Pro Max":           "", // TODO
  "iPhone 14":                   "phonecase_apple_iphone-14_tough_white_glossy", // ✅ confirmed
  "iPhone 14 Plus":              "", // TODO
  "iPhone 14 Pro":               "", // TODO
  "iPhone 14 Pro Max":           "", // TODO
  "iPhone 15":                   "", // TODO
  "iPhone 15 Plus":              "", // TODO
  "iPhone 15 Pro":               "", // TODO
  "iPhone 15 Pro Max":           "", // TODO
  "iPhone 16 (US only)":         "", // TODO — Gelato only ships this model within the US
  "iPhone 16 Plus (US only)":    "", // TODO — Gelato only ships this model within the US
  "iPhone 16 Pro (US only)":     "", // TODO — Gelato only ships this model within the US
  "iPhone 16 Pro Max (US only)": "", // TODO — Gelato only ships this model within the US
  // ── Samsung ──
  "Galaxy S20":                  "", // TODO
  "Galaxy S20 Plus":             "", // TODO
  "Galaxy S20 Ultra":            "", // TODO
  "Galaxy S21":                  "", // TODO
  "Galaxy S21 Plus":             "", // TODO
  "Galaxy S21 Ultra":            "", // TODO
  "Galaxy S22":                  "", // TODO
  "Galaxy S22 Plus":             "", // TODO
  "Galaxy S22 Ultra":            "", // TODO
  "Galaxy S23":                  "", // TODO
  "Galaxy S23 Plus":             "", // TODO
  "Galaxy S23 Ultra":            "", // TODO
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