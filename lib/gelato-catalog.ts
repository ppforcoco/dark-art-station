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
  // Pattern confirmed from iPhone 14 + 16 series: phonecase_apple_iphone-{model}_tough_white_glossy
  // 🤔 = inferred from that pattern, not clicked-and-copied — if an order for one of these
  // ever fails, that's the first place to check (Gelato will reject bad UIDs loudly, it
  // won't silently ship the wrong case).
  "iPhone 7":                    "phonecase_apple_iphone-7_tough_white_glossy",        // 🤔 inferred
  "iPhone 7 Plus":               "phonecase_apple_iphone-7plus_tough_white_glossy",    // 🤔 inferred
  "iPhone 8":                    "phonecase_apple_iphone-8_tough_white_glossy",        // 🤔 inferred
  "iPhone 8 Plus":               "phonecase_apple_iphone-8plus_tough_white_glossy",    // 🤔 inferred
  "iPhone SE (2020)":            "phonecase_apple_iphone-se2020_tough_white_glossy",   // 🤔 inferred — least confident, naming may differ
  "iPhone X":                    "phonecase_apple_iphone-x_tough_white_glossy",        // 🤔 inferred
  "iPhone XS":                   "phonecase_apple_iphone-xs_tough_white_glossy",       // 🤔 inferred
  "iPhone XS Max":               "phonecase_apple_iphone-xsmax_tough_white_glossy",    // 🤔 inferred
  "iPhone XR":                   "phonecase_apple_iphone-xr_tough_white_glossy",       // 🤔 inferred
  "iPhone 11":                   "phonecase_apple_iphone-11_tough_white_glossy",       // 🤔 inferred
  "iPhone 11 Pro":               "phonecase_apple_iphone-11pro_tough_white_glossy",    // 🤔 inferred
  "iPhone 11 Pro Max":           "phonecase_apple_iphone-11promax_tough_white_glossy", // 🤔 inferred
  "iPhone 12":                   "phonecase_apple_iphone-12_tough_white_glossy",       // 🤔 inferred
  "iPhone 12 Mini":              "phonecase_apple_iphone-12mini_tough_white_glossy",   // 🤔 inferred
  "iPhone 12 Pro":               "phonecase_apple_iphone-12pro_tough_white_glossy",    // 🤔 inferred
  "iPhone 12 Pro Max":           "phonecase_apple_iphone-12promax_tough_white_glossy", // 🤔 inferred
  "iPhone 13":                   "phonecase_apple_iphone-13_tough_white_glossy",       // 🤔 inferred
  "iPhone 13 Mini":              "phonecase_apple_iphone-13mini_tough_white_glossy",   // 🤔 inferred
  "iPhone 13 Pro":               "phonecase_apple_iphone-13pro_tough_white_glossy",    // 🤔 inferred
  "iPhone 13 Pro Max":           "phonecase_apple_iphone-13promax_tough_white_glossy", // 🤔 inferred
  "iPhone 14":                   "phonecase_apple_iphone-14_tough_white_glossy",       // ✅ confirmed
  "iPhone 14 Plus":              "phonecase_apple_iphone-14plus_tough_white_glossy",   // 🤔 inferred
  "iPhone 14 Pro":               "phonecase_apple_iphone-14pro_tough_white_glossy",    // 🤔 inferred
  "iPhone 14 Pro Max":           "phonecase_apple_iphone-14promax_tough_white_glossy", // ✅ confirmed
  "iPhone 15":                   "phonecase_apple_iphone-15_tough_white_glossy",       // 🤔 inferred
  "iPhone 15 Plus":              "phonecase_apple_iphone-15plus_tough_white_glossy",   // 🤔 inferred
  "iPhone 15 Pro":               "phonecase_apple_iphone-15pro_tough_white_glossy",    // 🤔 inferred
  "iPhone 15 Pro Max":           "phonecase_apple_iphone-15promax_tough_white_glossy", // ✅ confirmed
  "iPhone 16 (US only)":         "phonecase_apple_iphone-16_tough_white_glossy",       // ✅ confirmed
  "iPhone 16 Plus (US only)":    "phonecase_apple_iphone-16plus_tough_white_glossy",   // ✅ confirmed
  "iPhone 16 Pro (US only)":     "phonecase_apple_iphone-16pro_tough_white_glossy",    // ✅ confirmed
  "iPhone 16 Pro Max (US only)": "phonecase_apple_iphone-16promax_tough_white_glossy", // ✅ confirmed
  // ── Samsung ──
  // Pattern confirmed from Galaxy S23 Plus + S23 Ultra: phonecase_samsung_galaxy-{model}_tough_white_glossy
  "Galaxy S20":                  "phonecase_samsung_galaxy-s20_tough_white_glossy",       // 🤔 inferred
  "Galaxy S20 Plus":             "phonecase_samsung_galaxy-s20plus_tough_white_glossy",   // 🤔 inferred
  "Galaxy S20 Ultra":            "phonecase_samsung_galaxy-s20ultra_tough_white_glossy",  // 🤔 inferred
  "Galaxy S21":                  "phonecase_samsung_galaxy-s21_tough_white_glossy",       // 🤔 inferred
  "Galaxy S21 Plus":             "phonecase_samsung_galaxy-s21plus_tough_white_glossy",   // 🤔 inferred
  "Galaxy S21 Ultra":            "phonecase_samsung_galaxy-s21ultra_tough_white_glossy",  // 🤔 inferred
  "Galaxy S22":                  "phonecase_samsung_galaxy-s22_tough_white_glossy",       // 🤔 inferred
  "Galaxy S22 Plus":             "phonecase_samsung_galaxy-s22plus_tough_white_glossy",   // 🤔 inferred
  "Galaxy S22 Ultra":            "phonecase_samsung_galaxy-s22ultra_tough_white_glossy",  // 🤔 inferred
  "Galaxy S23":                  "phonecase_samsung_galaxy-s23_tough_white_glossy",       // 🤔 inferred
  "Galaxy S23 Plus":             "phonecase_samsung_galaxy-s23plus_tough_white_glossy",   // ✅ confirmed
  "Galaxy S23 Ultra":            "phonecase_samsung_galaxy-s23ultra_tough_white_glossy",  // ✅ confirmed
};

export const TSHIRT_UID_MAP: Record<string, string> = {
  "S":   "apparel_product_gca_t-shirt_gsc_crewneck_gcu_unisex_gqa_heavy-weight_gsi_s_gco_black_gpr_4-0_gildan_5000",   // ✅ confirmed
  "M":   "apparel_product_gca_t-shirt_gsc_crewneck_gcu_unisex_gqa_heavy-weight_gsi_m_gco_black_gpr_4-0_gildan_5000",   // ✅ confirmed
  "L":   "apparel_product_gca_t-shirt_gsc_crewneck_gcu_unisex_gqa_heavy-weight_gsi_l_gco_black_gpr_4-0_gildan_5000",   // ✅ confirmed
  "XL":  "apparel_product_gca_t-shirt_gsc_crewneck_gcu_unisex_gqa_heavy-weight_gsi_xl_gco_black_gpr_4-0_gildan_5000",  // ✅ confirmed
  "XXL": "apparel_product_gca_t-shirt_gsc_crewneck_gcu_unisex_gqa_heavy-weight_gsi_2xl_gco_black_gpr_4-0_gildan_5000", // ✅ confirmed (Gelato calls this "2XL")
};

export const HOODIE_UID_MAP: Record<string, string> = {
  "XS":  "", // TODO
  "S":   "apparel_product_gca_hoodie_gsc_pullover_gcu_unisex_gqa_classic_gsi_s_gco_white_gpr_4-0_gildan_18500",   // ✅ confirmed
  "M":   "apparel_product_gca_hoodie_gsc_pullover_gcu_unisex_gqa_classic_gsi_m_gco_white_gpr_4-0_gildan_18500",   // ✅ confirmed
  "L":   "apparel_product_gca_hoodie_gsc_pullover_gcu_unisex_gqa_classic_gsi_l_gco_white_gpr_4-0_gildan_18500",   // ✅ confirmed
  "XL":  "apparel_product_gca_hoodie_gsc_pullover_gcu_unisex_gqa_classic_gsi_xl_gco_white_gpr_4-0_gildan_18500",  // ✅ confirmed
  "XXL": "apparel_product_gca_hoodie_gsc_pullover_gcu_unisex_gqa_classic_gsi_2xl_gco_white_gpr_4-0_gildan_18500", // ✅ confirmed (Gelato calls this "2XL")
  "3XL": "", // TODO
  "4XL": "", // TODO
};

// Category name (from Product.category) → which map to use.
const CATEGORY_UID_MAPS: Record<string, Record<string, string>> = {
  "Phone Case": PHONE_CASE_UID_MAP,
  "T-Shirt":    TSHIRT_UID_MAP,
  "Hoodie":     HOODIE_UID_MAP,
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