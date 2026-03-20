# 🔍 Content Safety Audit Report
**Generated:** 2026-03-20T11:42:54.006Z  
**Total Flagged Occurrences:** 11  
**Dictionary Size:** 224 terms  
**Whitelist Size:** 89 terms  

## Summary by Severity

| Severity | Count | AdSense Risk |
|---|---|---|
| 🚨 CRITICAL | 0 | Immediate rejection |
| 🔴 HIGH     | 0     | Likely rejection |
| 🟠 MEDIUM   | 4   | Context-dependent |
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


## 🟡 Weapons / Dangerous Items

### `data/manifest.json`

| Line | Term | Matched | Severity | Suggestion | Context |
|---|---|---|---|---|---|
| 2017 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | "description": "A fearsome skeleton warrior in tattered chainmail armor wielding a scarlet-stained sword and a dark skul... |
| 2619 | `weapon` | **weapon** | 🟡 LOW | Fine in fantasy/gothic art context | "slug": "dark-weapon-rune-pattern", |


---

## 📋 Active Whitelist (89 terms)

These words are **never** flagged regardless of context:

`abort`, `abyss`, `angel`, `angels`, `bless`, `blessed`, `blessing`, `cemetery`, `creed`, `crypt`, `cryptic`, `curse`, `cursed`, `dark`, `darkness`, `dead`, `demon`, `demonic`, `demons`, `devil`, `divine`, `eerie`, `exception`, `execute`, `faith`, `fatal`, `ghost`, `ghostly`, `ghosts`, `gospel`, `grace`, `grave`, `graveyard`, `grim`, `grimoire`, `hack`, `haunted`, `hauntedwallpapers`, `heaven`, `hell`, `hellish`, `holy`, `host`, `kill`, `lore`, `macabre`, `master`, `morbid`, `occult`, `ominous`, `oracle`, `pagan`, `paradise`, `phantom`, `raven`, `reaper`, `ritual`, `sacred`, `saint`, `script`, `sermon`, `shadow`, `shadows`, `shadowy`, `sigil`, `sin`, `sinister`, `skeletal`, `skeleton`, `skull`, `skulls`, `slave`, `soul`, `souls`, `specter`, `spirit`, `spirits`, `tarot`, `terminate`, `undead`, `vampire`, `vampiric`, `void`, `wallpaper`, `wallpapers`, `witch`, `witchcraft`, `witches`, `wraith`

---
*This report was auto-generated. CRITICAL/HIGH items require action. MEDIUM items need context review. LOW/INFO items are informational only and are almost never the cause of AdSense rejection for an artistic/gothic site.*
