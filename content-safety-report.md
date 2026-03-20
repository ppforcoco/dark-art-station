# 🔍 Content Safety Audit Report
**Generated:** 2026-03-20T12:07:52.179Z  
**Total Flagged Occurrences:** 19  
**Dictionary Size:** 251 terms  
**Whitelist Size:** 63 terms  

## Summary by Severity

| Severity | Count | AdSense Risk |
|---|---|---|
| 🚨 CRITICAL | 0 | Immediate rejection |
| 🔴 HIGH     | 0     | Likely rejection |
| 🟠 MEDIUM   | 12   | Context-dependent |
| 🟡 LOW      | 7      | Usually safe in art context |
| 🔵 INFO     | 0      | Awareness only |

> ✅ **No critical or high-risk content found. Review MEDIUM items for context.**


## 🟠 Violence / Gore

### `app/[eventSlug]/page.tsx`

| Line | Term | Matched | Severity | Suggestion | Context |
|---|---|---|---|---|---|
| 44 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | "blood-moon": { |

### `components/Footer.tsx`

| Line | Term | Matched | Severity | Suggestion | Context |
|---|---|---|---|---|---|
| 48 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | <li><Link href="/blood-moon">Crimson Moon</Link></li> |

### `components/HeroMosaic.tsx`

| Line | Term | Matched | Severity | Suggestion | Context |
|---|---|---|---|---|---|
| 68 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | id:    "blood-moon", |
| 69 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | href:  "/blood-moon", |

### `data/manifest.json`

| Line | Term | Matched | Severity | Suggestion | Context |
|---|---|---|---|---|---|
| 307 | `death` | **death** | 🟡 LOW | Fine in "Day of the Dead", "Dark Death" art — review context | "slug": "hooded-skeleton-purple-swirl-card-xiii-death", |
| 967 | `death` | **death** | 🟡 LOW | Fine in "Day of the Dead", "Dark Death" art — review context | "slug": "death-dealer-cracked-skull", |
| 1015 | `death` | **death** | 🟡 LOW | Fine in "Day of the Dead", "Dark Death" art — review context | "slug": "death-is-the-new-cool-mobster", |
| 1737 | `death` | **death** | 🟡 LOW | Fine in "Day of the Dead", "Dark Death" art — review context | "slug": "skeleton-death-beginning", |
| 2015 | `death` | **death** | 🟡 LOW | Fine in "Day of the Dead", "Dark Death" art — review context | "slug": "death-knight-card", |


## 🟠 Religious / Sensitive

### `components/HeroMosaic.tsx`

| Line | Term | Matched | Severity | Suggestion | Context |
|---|---|---|---|---|---|
| 83 | `sin` | **sin** | 🟠 MEDIUM | Replace with "darkness", "vice" *(Also matches Math.sin() — check context carefully)* | y1={32 + 20 * Math.sin((deg * Math.PI) / 180)} |
| 83 | `sin` | **sin** | 🟠 MEDIUM | Fine in dark artistic context — very common in gothic art *("Sin" is extremely common in dark/gothic aesthetics)* | y1={32 + 20 * Math.sin((deg * Math.PI) / 180)} |
| 85 | `sin` | **sin** | 🟠 MEDIUM | Replace with "darkness", "vice" *(Also matches Math.sin() — check context carefully)* | y2={32 + 24 * Math.sin((deg * Math.PI) / 180)} |
| 85 | `sin` | **sin** | 🟠 MEDIUM | Fine in dark artistic context — very common in gothic art *("Sin" is extremely common in dark/gothic aesthetics)* | y2={32 + 24 * Math.sin((deg * Math.PI) / 180)} |

### `data/manifest.json`

| Line | Term | Matched | Severity | Suggestion | Context |
|---|---|---|---|---|---|
| 256 | `spirits` | **spirits** | 🟠 MEDIUM | Replace with "forces", "energies", "essences" | "slug": "white-hair-sorceress-shadow-spirits", |
| 1793 | `soul` | **soul** | 🟠 MEDIUM | Replace with "essence", "energy". e.g. "12K Souls" → "12K Members" | "slug": "skeleton-streets-soul", |
| 2047 | `soul` | **soul** | 🟠 MEDIUM | Replace with "essence", "energy". e.g. "12K Souls" → "12K Members" | "slug": "soul-reaver-card", |
| 2507 | `occult` | **occult** | 🟠 MEDIUM | Replace with "arcane", "mystic", "hidden arts" *(Used in collection names — review carefully before changing)* | "slug": "occult-rune-symbol-pattern", |


## 🟡 Weapons / Dangerous Items

### `data/manifest.json`

| Line | Term | Matched | Severity | Suggestion | Context |
|---|---|---|---|---|---|
| 2017 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | "description": "A fearsome skeleton warrior in tattered chainmail armor wielding a scarlet-stained sword and a dark skul... |
| 2619 | `weapon` | **weapon** | 🟡 LOW | Fine in fantasy/gothic art context | "slug": "dark-weapon-rune-pattern", |


---

## 📋 Active Whitelist (63 terms)

These words are **never** flagged regardless of context:

`abort`, `abyss`, `cemetery`, `creed`, `crypt`, `cryptic`, `curse`, `cursed`, `dark`, `darkness`, `dead`, `demon`, `demons`, `eerie`, `exception`, `execute`, `fatal`, `ghost`, `ghostly`, `ghosts`, `grave`, `graveyard`, `grim`, `grimoire`, `hack`, `haunted`, `hauntedwallpapers`, `hell`, `hellish`, `host`, `kill`, `lore`, `macabre`, `master`, `ominous`, `oracle`, `pagan`, `phantom`, `raven`, `reaper`, `ritual`, `script`, `shadow`, `shadows`, `shadowy`, `sigil`, `sinister`, `skeletal`, `skeleton`, `skull`, `skulls`, `specter`, `tarot`, `terminate`, `undead`, `vampire`, `vampiric`, `void`, `wallpaper`, `wallpapers`, `witch`, `witches`, `wraith`

---
*This report was auto-generated. CRITICAL/HIGH items require action. MEDIUM items need context review. LOW/INFO items are informational only and are almost never the cause of AdSense rejection for an artistic/gothic site.*
