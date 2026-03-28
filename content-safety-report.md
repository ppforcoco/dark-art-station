# 🔍 Content Safety Audit Report
**Generated:** 2026-03-28T15:37:37.077Z  
**Total Flagged Occurrences:** 210  
**Dictionary Size:** 289 terms  
**Whitelist Size:** 52 terms  

## Summary by Severity

| Severity | Count | AdSense Risk |
|---|---|---|
| 🚨 CRITICAL | 0 | Immediate rejection |
| 🔴 HIGH     | 0     | Likely rejection |
| 🟠 MEDIUM   | 97   | Context-dependent |
| 🟡 LOW      | 103      | Usually safe in art context |
| 🔵 INFO     | 10      | Awareness only |

> ✅ **No critical or high-risk content found. Review MEDIUM items for context.**


## 🟠 Religious / Sensitive

### `app\about\page.tsx`

| Line | Term | Matched | Severity | Suggestion | Context |
|---|---|---|---|---|---|
| 7 | `spirits` | **spirits** | 🟠 MEDIUM | Replace with "forces", "energies", "essences" | "Two siblings raised on horror stories, graveyard houses, and jungle spirits. " + |

### `app\admin-secret-hw\page.tsx`

| Line | Term | Matched | Severity | Suggestion | Context |
|---|---|---|---|---|---|
| 37 | `angel` | **angel** | 🟠 MEDIUM | Replace with "dark figure", "winged entity" | "demon", "angel", "witch", "fire", "ice", "space", "ocean", "halloween", |
| 165 | `angel` | **angel** | 🟠 MEDIUM | Replace with "dark figure", "winged entity" | "demon","angel","witch","fire","ice","space","ocean","halloween", |
| 1742 | `angel` | **angel** | 🟠 MEDIUM | Replace with "dark figure", "winged entity" | "demon","angel","witch","fire","ice","space","ocean","halloween", |

### `app\[eventSlug]\page.tsx`

| Line | Term | Matched | Severity | Suggestion | Context |
|---|---|---|---|---|---|
| 41 | `spirit` | **spirit** | 🟠 MEDIUM | Replace with "essence", "force", "energy" | description: "Dia de los Muertos — vibrant art, marigolds, and spirit celebrations in  HD dark fantasy wallpapers.", |
| 32 | `dark valentine` | **Dark Valentine** | 🔵 INFO | Fine — Valentine is not a religious holiday in AdSense terms *(Your established collection name)* | title:       "Dark Valentine Wallpapers", |
| 33 | `dark valentine` | **Dark Valentine** | 🔵 INFO | Fine — Valentine is not a religious holiday in AdSense terms *(Your established collection name)* | metaTitle:   "Dark Valentine Wallpapers HD \| Haunted Wallpapers", |
| 48 | `lore` | **lore** | 🔵 INFO | Fine — very common in gaming/dark fantasy. Very low AdSense risk *(Removed from whitelist)* | description: "Scarlet lunar art, werewolf lore, and celestial horror. The crimson moon rises on your screen.", |

### `components\HeroMosaic.tsx`

| Line | Term | Matched | Severity | Suggestion | Context |
|---|---|---|---|---|---|
| 83 | `sin` | **sin** | 🟠 MEDIUM | Replace with "darkness", "vice" *(Also matches Math.sin() — check context carefully)* | y1={32 + 20 * Math.sin((deg * Math.PI) / 180)} |
| 83 | `sin` | **sin** | 🟠 MEDIUM | Fine in dark artistic context — very common in gothic art *("Sin" is extremely common in dark/gothic aesthetics)* | y1={32 + 20 * Math.sin((deg * Math.PI) / 180)} |
| 85 | `sin` | **sin** | 🟠 MEDIUM | Replace with "darkness", "vice" *(Also matches Math.sin() — check context carefully)* | y2={32 + 24 * Math.sin((deg * Math.PI) / 180)} |
| 85 | `sin` | **sin** | 🟠 MEDIUM | Fine in dark artistic context — very common in gothic art *("Sin" is extremely common in dark/gothic aesthetics)* | y2={32 + 24 * Math.sin((deg * Math.PI) / 180)} |
| 31 | `dark valentine` | **Dark Valentine** | 🔵 INFO | Fine — Valentine is not a religious holiday in AdSense terms *(Your established collection name)* | label: "Dark Valentine", |

### `data\manifest.json`

| Line | Term | Matched | Severity | Suggestion | Context |
|---|---|---|---|---|---|
| 288 | `spirits` | **spirits** | 🟠 MEDIUM | Replace with "forces", "energies", "essences" | "slug": "white-hair-sorceress-shadow-spirits", |
| 2029 | `soul` | **soul** | 🟠 MEDIUM | Replace with "essence", "energy". e.g. "12K Souls" → "12K Members" | "slug": "skeleton-streets-soul", |
| 2316 | `soul` | **soul** | 🟠 MEDIUM | Replace with "essence", "energy". e.g. "12K Souls" → "12K Members" | "slug": "soul-reaver-card", |
| 2836 | `occult` | **occult** | 🟠 MEDIUM | Replace with "arcane", "mystic", "hidden arts" *(Used in collection names — review carefully before changing)* | "slug": "occult-rune-symbol-pattern", |
| 4251 | `spirits` | **spirits** | 🟠 MEDIUM | Replace with "forces", "energies", "essences" | "slug": "crimson-moon-forest-spirits-iphone", |
| 4756 | `dark valentine` | **dark valentine** | 🔵 INFO | Fine — Valentine is not a religious holiday in AdSense terms *(Your established collection name)* | "description": "A dark, intricate illustration featuring a shattered black heart entwined with thorns and roses, held by... |
| 4759 | `dark valentine` | **dark valentine** | 🔵 INFO | Fine — Valentine is not a religious holiday in AdSense terms *(Your established collection name)* | "dark valentine", |
| 4773 | `dark valentine` | **dark valentine** | 🔵 INFO | Fine — Valentine is not a religious holiday in AdSense terms *(Your established collection name)* | "description": "A skeleton holding a single red rose over a cracked heart and skull, paired with witty dark humor text. ... |
| 4776 | `dark valentine` | **dark valentine** | 🔵 INFO | Fine — Valentine is not a religious holiday in AdSense terms *(Your established collection name)* | "dark valentine", |

### `app\dmca\page.tsx`

| Line | Term | Matched | Severity | Suggestion | Context |
|---|---|---|---|---|---|
| 68 | `faith` | **faith** | 🟡 LOW | Replace with "belief", "conviction" if in copy | A statement that you have a good faith belief that the use of the |
| 110 | `faith` | **faith** | 🟡 LOW | Replace with "belief", "conviction" if in copy | A statement under penalty of perjury that you have a good faith belief |

### `app\terms\page.tsx`

| Line | Term | Matched | Severity | Suggestion | Context |
|---|---|---|---|---|---|
| 173 | `faith` | **faith** | 🟡 LOW | Replace with "belief", "conviction" if in copy | shall be resolved through good-faith negotiation in the first instance. |


## 🟠 Violence / Gore

### `app\admin-secret-hw\page.tsx`

| Line | Term | Matched | Severity | Suggestion | Context |
|---|---|---|---|---|---|
| 39 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | "skeleton", "smoke", "rose", "blood", "darkness", "void", "crimson", |
| 1744 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | "skeleton","smoke","rose","blood","knife","darkness","void","crimson", |

### `app\[eventSlug]\page.tsx`

| Line | Term | Matched | Severity | Suggestion | Context |
|---|---|---|---|---|---|
| 44 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | "blood-moon": { |

### `components\Header.tsx`

| Line | Term | Matched | Severity | Suggestion | Context |
|---|---|---|---|---|---|
| 17 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | type Theme = "dark" \| "blood" \| "light" \| "ghost" \| "ember"; |
| 36 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | const valid: Theme[] = ["dark", "blood", "light", "ghost", "ember"]; |
| 136 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] { |
| 148 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | --blood:        #cc0000; |
| 156 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] body                  { background-color: #080000 !important; } |
| 157 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .site-nav             { border-bottom-color: rgba(192,0,0,0.35) !important; } |
| 158 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .nav-logo             { color: #ff5555 !important; } |
| 159 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .logo-red             { color: #ff0000 !important; text-shadow: 0 0 18px rgba(255,0,0,0.65) !import... |
| 160 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .nav-links a          { color: #cc7070 !important; } |
| 161 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .nav-links a:hover    { color: #fff0f0 !important; } |
| 162 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .btn-primary          { background: #cc0000 !important; } |
| 163 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .btn-primary::before  { background: #ff2200 !important; } |
| 164 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .btn-secondary        { border-color: #622020 !important; color: #ffd0d0 !important; } |
| 165 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .btn-secondary:hover  { border-color: #cc0000 !important; color: #fff0f0 !important; background: rg... |
| 166 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .hero-section         { background: radial-gradient(ellipse at 65% 0%, #380000 0%, #080000 65%) !im... |
| 167 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .hero-title .t-red    { color: #ff2200 !important; text-shadow: 0 0 28px rgba(255,34,0,0.55) !impor... |
| 168 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .hero-title .t-gold   { color: #ff7070 !important; } |
| 169 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .hero-eyebrow         { color: #cc0000 !important; } |
| 170 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .eyebrow-line         { background: #cc0000 !important; } |
| 171 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .section-eyebrow      { color: #cc0000 !important; } |
| 172 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .stat-num             { color: #ff7070 !important; } |
| 173 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .hero-stats           { border-top-color: #340808 !important; } |
| 174 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .marquee-section      { background: #100000 !important; border-color: rgba(192,0,0,0.28) !important... |
| 175 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .marquee-dot          { color: #cc0000 !important; } |
| 176 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .wotd-section         { background: #080000 !important; border-color: rgba(192,0,0,0.22) !important... |
| 177 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .wotd-eyebrow         { color: #cc0000 !important; } |
| 178 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .wotd-title           { color: #fff0f0 !important; } |
| 179 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .wotd-tag             { border-color: rgba(255,80,80,0.3) !important; color: #ff7070 !important; }... |
| 180 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .wotd-cta             { border-color: #cc0000 !important; color: #ffd0d0 !important; } |
| 181 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .wotd-cta:hover       { background: #cc0000 !important; color: #fff0f0 !important; } |
| 182 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .section-title        { color: #fff0f0 !important; } |
| 183 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .section-link         { color: #aa5858 !important; border-color: #622020 !important; } |
| 184 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .section-link:hover   { color: #fff0f0 !important; border-color: #fff0f0 !important; } |
| 185 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .cat-tag              { color: #cc0000 !important; border-color: rgba(192,0,0,0.4) !important; }... |
| 186 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .products-bg          { background: #100000 !important; } |
| 187 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .manifesto-section    { background: #080000 !important; border-color: #340808 !important; } |
| 188 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .manifesto-quote      { color: #fff0f0 !important; } |
| 189 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .manifesto-quote .em  { color: #ff7070 !important; } |
| 190 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .manifesto-vert-label { color: #cc0000 !important; } |
| 191 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .newsletter-section   { background: #100000 !important; } |
| 192 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .newsletter-title     { color: #fff0f0 !important; } |
| 193 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .nl-input             { background: #280808 !important; border-color: #622020 !important; color: #f... |
| 194 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .nl-input::placeholder{ color: #622020 !important; } |
| 195 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .nl-btn               { background: #cc0000 !important; border-color: #cc0000 !important; } |
| 196 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .nl-btn:hover         { background: #ff2200 !important; border-color: #ff2200 !important; } |
| 197 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .site-footer          { background: #100000 !important; border-color: #340808 !important; } |
| 198 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .footer-bottom        { border-color: #340808 !important; } |
| 199 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .mobile-menu-panel    { background: rgba(8,0,0,0.98) !important; border-color: rgba(192,0,0,0.25) !... |
| 200 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .mobile-menu-topbar   { background: linear-gradient(90deg, transparent, #cc0000 40%, #ff2200 60%, t... |
| 201 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .search-overlay-backdrop { background: rgba(8,0,0,0.93) !important; } |
| 202 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] ::-webkit-scrollbar-track { background: #080000 !important; } |
| 203 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] ::-webkit-scrollbar-thumb { background: #cc0000 !important; } |
| 204 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .hw-nav-icon          { border-color: rgba(192,0,0,0.3) !important; color: #aa5858 !important; }... |
| 205 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .hw-nav-icon:hover    { border-color: #cc0000 !important; color: #cc0000 !important; } |
| 206 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .hw-dropdown          { background: #160000 !important; border-color: rgba(192,0,0,0.45) !important... |
| 207 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .hw-dropdown-item:hover { background: rgba(192,0,0,0.18) !important; } |
| 208 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .hw-dropdown-item.hw-active { color: #cc0000 !important; } |
| 209 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .hw-dropdown-btn      { border-color: rgba(192,0,0,0.3) !important; color: #aa5858 !important; }... |
| 210 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .hw-dropdown-btn:hover { border-color: #cc0000 !important; color: #cc0000 !important; } |
| 211 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .search-hint-btn      { background: rgba(192,0,0,0.1) !important; border-color: rgba(192,0,0,0.25) ... |
| 212 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .search-hint-btn:hover { background: rgba(192,0,0,0.22) !important; color: #fff0f0 !important; bord... |
| 213 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .hw-search-eyebrow    { color: #cc0000 !important; } |
| 214 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .hw-search-form-box   { border-color: rgba(192,0,0,0.5) !important; background: rgba(10,0,0,0.97) !... |
| 215 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .hw-search-form-box:focus-within { border-color: rgba(192,0,0,0.9) !important; box-shadow: 0 0 0 1p... |
| 216 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .hw-search-icon-wrap  { color: rgba(192,0,0,0.8) !important; } |
| 217 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .hw-search-big-input  { color: #fff0f0 !important; caret-color: #cc0000 !important; } |
| 218 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .hw-search-submit     { background: #cc0000 !important; } |
| 219 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .hw-search-submit:hover { background: #a80000 !important; } |
| 220 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .mobile-theme-pill.active { border-color: #cc0000 !important; color: #cc0000 !important; background... |
| 221 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .dark-quote-bar       { background: #100000 !important; border-color: rgba(192,0,0,0.25) !important... |
| 222 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | [data-theme="blood"] .dqb-text             { color: #ffd0d0 !important; } |
| 549 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | {(["dark", "blood", "light", "ghost", "ember"] as Theme[]).map(t => ( |
| 551 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | {t === "dark" ? "☽ Dark" : t === "blood" ? "🔴 Crimson" : t === "ghost" ? "👻 Ghost" : t === "ember" ? "🔥 Ember" : "☀ L... |

### `components\HeroMosaic.tsx`

| Line | Term | Matched | Severity | Suggestion | Context |
|---|---|---|---|---|---|
| 68 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | id:    "blood-moon", |
| 69 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | href:  "/blood-moon", |

### `data\manifest.json`

| Line | Term | Matched | Severity | Suggestion | Context |
|---|---|---|---|---|---|
| 3879 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | "slug": "dark-knight-blood-blade-iphone", |
| 3880 | `blood` | **Blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | "title": "Dark Knight Blood Blade", |
| 3895 | `blood` | **Blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | "altText": "Dark Knight Blood Blade \u2014 free dark wallpaper download" |
| 4472 | `bloody` | **bloody** | 🟠 MEDIUM | Replace with "crimson" or remove | "slug": "bloody-vampire-skull-android", |
| 4482 | `blood` | **blood** | 🟠 MEDIUM | Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name. | "blood", |
| 346 | `death` | **death** | 🟡 LOW | Fine in "Day of the Dead", "Dark Death" art — review context | "slug": "hooded-skeleton-purple-swirl-card-xiii-death", |
| 1093 | `death` | **death** | 🟡 LOW | Fine in "Day of the Dead", "Dark Death" art — review context | "slug": "death-dealer-cracked-skull", |
| 1147 | `death` | **death** | 🟡 LOW | Fine in "Day of the Dead", "Dark Death" art — review context | "slug": "death-is-the-new-cool-mobster", |
| 1966 | `death` | **death** | 🟡 LOW | Fine in "Day of the Dead", "Dark Death" art — review context | "slug": "skeleton-death-beginning", |
| 2280 | `death` | **death** | 🟡 LOW | Fine in "Day of the Dead", "Dark Death" art — review context | "slug": "death-knight-card", |
| 5147 | `death` | **death** | 🟡 LOW | Fine in "Day of the Dead", "Dark Death" art — review context | "death", |
| 5222 | `death` | **death** | 🟡 LOW | Fine in "Day of the Dead", "Dark Death" art — review context | "death", |


## 🟡 Dark / Occult (Thematic)

### `app\admin-secret-hw\page.tsx`

| Line | Term | Matched | Severity | Suggestion | Context |
|---|---|---|---|---|---|
| 37 | `demon` | **demon** | 🟡 LOW | Fine in dark fantasy art — review if prominently featured in blog/meta titles *(Removed from whitelist)* | "demon", "angel", "witch", "fire", "ice", "space", "ocean", "halloween", |
| 165 | `demon` | **demon** | 🟡 LOW | Fine in dark fantasy art — review if prominently featured in blog/meta titles *(Removed from whitelist)* | "demon","angel","witch","fire","ice","space","ocean","halloween", |
| 1742 | `demon` | **demon** | 🟡 LOW | Fine in dark fantasy art — review if prominently featured in blog/meta titles *(Removed from whitelist)* | "demon","angel","witch","fire","ice","space","ocean","halloween", |
| 1750 | `cemetery` | **cemetery** | 🔵 INFO | Fine — classic gothic imagery. Very low AdSense risk *(Removed from whitelist)* | "graveyard","cemetery","coffin","chains","thorns","runes","magic", |

### `data\manifest.json`

| Line | Term | Matched | Severity | Suggestion | Context |
|---|---|---|---|---|---|
| 180 | `demon` | **demon** | 🟡 LOW | Fine in dark fantasy art — review if prominently featured in blog/meta titles *(Removed from whitelist)* | "slug": "shadow-demon-queen-red-glow", |
| 181 | `demon` | **Demon** | 🟡 LOW | Fine in dark fantasy art — review if prominently featured in blog/meta titles *(Removed from whitelist)* | "title": "Shadow Demon Queen", |
| 186 | `demon` | **Demon** | 🟡 LOW | Fine in dark fantasy art — review if prominently featured in blog/meta titles *(Removed from whitelist)* | "altText": "Shadow Demon Queen \u2014 free dark wallpaper download" |
| 2264 | `demons` | **demons** | 🟡 LOW | Fine in dark fantasy art *(Removed from whitelist)* | "description": "A premium series of 15 dark fantasy trading card wallpapers featuring undead warriors, frost giants, fir... |
| 2899 | `demon` | **demon** | 🟡 LOW | Fine in dark fantasy art — review if prominently featured in blog/meta titles *(Removed from whitelist)* | "slug": "demon-skull-horn-pattern", |
| 2900 | `demon` | **Demon** | 🟡 LOW | Fine in dark fantasy art — review if prominently featured in blog/meta titles *(Removed from whitelist)* | "title": "Demon Skull Horn Crossbones Dark Pattern Wallpaper", |
| 2901 | `demon` | **demon** | 🟡 LOW | Fine in dark fantasy art — review if prominently featured in blog/meta titles *(Removed from whitelist)* | "description": "A bold repeating pattern of horned demon skull icons above crossed bone pairs in a tight grid formation ... |
| 2905 | `demon` | **Demon** | 🟡 LOW | Fine in dark fantasy art — review if prominently featured in blog/meta titles *(Removed from whitelist)* | "altText": "Demon Skull Horn Crossbones Dark Pattern Wallpaper \u2014 free dark wallpaper download" |
| 3012 | `demon` | **Demon** | 🟡 LOW | Fine in dark fantasy art — review if prominently featured in blog/meta titles *(Removed from whitelist)* | "title": "Night Hallowed Evil Demon Horror Poster", |
| 3017 | `demon` | **Demon** | 🟡 LOW | Fine in dark fantasy art — review if prominently featured in blog/meta titles *(Removed from whitelist)* | "altText": "Night Hallowed Evil Demon Horror Poster \u2014 free dark wallpaper download" |
| 3047 | `curse` | **curse** | 🟡 LOW | Fine in dark art context *(Removed from whitelist)* | "slug": "blackwood-hall-curse", |
| 3152 | `demons` | **demons** | 🟡 LOW | Fine in dark fantasy art *(Removed from whitelist)* | "description": "A stunning series of 10 dark fantasy digital art wallpapers featuring gothic castles on moonlit cliffs, ... |
| 3178 | `demon` | **Demon** | 🟡 LOW | Fine in dark fantasy art — review if prominently featured in blog/meta titles *(Removed from whitelist)* | "title": "Horned Demon Skull Glowing Eyes Dark Fantasy Art", |
| 3179 | `demon` | **demon** | 🟡 LOW | Fine in dark fantasy art — review if prominently featured in blog/meta titles *(Removed from whitelist)* | "description": "A carved stone demon skull with massive curved horns and glowing blue eyes resting on a mossy stone pede... |
| 3183 | `demon` | **Demon** | 🟡 LOW | Fine in dark fantasy art — review if prominently featured in blog/meta titles *(Removed from whitelist)* | "altText": "Horned Demon Skull Glowing Eyes Dark Fantasy Art \u2014 free dark wallpaper download" |
| 3240 | `demon` | **demon** | 🟡 LOW | Fine in dark fantasy art — review if prominently featured in blog/meta titles *(Removed from whitelist)* | "slug": "knight-vs-demon", |
| 3241 | `demon` | **Demon** | 🟡 LOW | Fine in dark fantasy art — review if prominently featured in blog/meta titles *(Removed from whitelist)* | "title": "Knight vs Giant Horned Demon Monster Epic Dark Fantasy Art", |
| 3242 | `demon` | **demon** | 🟡 LOW | Fine in dark fantasy art — review if prominently featured in blog/meta titles *(Removed from whitelist)* | "description": "A lone armored knight wielding a glowing fiery blade and shield stands his ground against a towering hor... |
| 3246 | `demon` | **Demon** | 🟡 LOW | Fine in dark fantasy art — review if prominently featured in blog/meta titles *(Removed from whitelist)* | "altText": "Knight vs Giant Horned Demon Monster Epic Dark Fantasy Art \u2014 free dark wallpaper download" |
| 3505 | `demon` | **demon** | 🟡 LOW | Fine in dark fantasy art — review if prominently featured in blog/meta titles *(Removed from whitelist)* | "slug": "demon-shadow-eyes", |
| 3506 | `demon` | **Demon** | 🟡 LOW | Fine in dark fantasy art — review if prominently featured in blog/meta titles *(Removed from whitelist)* | "title": "Shadow Demon Glowing Eyes Dark Minimal Wallpaper", |
| 3507 | `demon` | **demon** | 🟡 LOW | Fine in dark fantasy art — review if prominently featured in blog/meta titles *(Removed from whitelist)* | "description": "A dark horned shadow demon with glowing yellow eyes barely visible against a charcoal background. Symbol... |
| 3511 | `demon` | **Demon** | 🟡 LOW | Fine in dark fantasy art — review if prominently featured in blog/meta titles *(Removed from whitelist)* | "altText": "Shadow Demon Glowing Eyes Dark Minimal Wallpaper \u2014 free dark wallpaper download" |
| 3860 | `abyss` | **abyss** | 🟡 LOW | Fine in dark art context — review in any new ad or meta copy *(Removed from whitelist)* | "slug": "demon-portal-abyss-iphone", |
| 3860 | `demon` | **demon** | 🟡 LOW | Fine in dark fantasy art — review if prominently featured in blog/meta titles *(Removed from whitelist)* | "slug": "demon-portal-abyss-iphone", |
| 3861 | `demon` | **Demon** | 🟡 LOW | Fine in dark fantasy art — review if prominently featured in blog/meta titles *(Removed from whitelist)* | "title": "Demon Portal Void", |
| 3862 | `demon` | **demon** | 🟡 LOW | Fine in dark fantasy art — review if prominently featured in blog/meta titles *(Removed from whitelist)* | "description": "A horned, winged demon looms over a swirling dark vortex portal. A terrifying and epic fantasy scene set... |
| 3865 | `demon` | **demon** | 🟡 LOW | Fine in dark fantasy art — review if prominently featured in blog/meta titles *(Removed from whitelist)* | "demon", |
| 3876 | `demon` | **Demon** | 🟡 LOW | Fine in dark fantasy art — review if prominently featured in blog/meta titles *(Removed from whitelist)* | "altText": "Demon Portal Void \u2014 free dark wallpaper download" |
| 4011 | `demon` | **demon** | 🟡 LOW | Fine in dark fantasy art — review if prominently featured in blog/meta titles *(Removed from whitelist)* | "slug": "thorn-demon-grin-iphone", |
| 4012 | `demon` | **Demon** | 🟡 LOW | Fine in dark fantasy art — review if prominently featured in blog/meta titles *(Removed from whitelist)* | "title": "Thorn Demon Grin", |
| 4017 | `demon` | **demon** | 🟡 LOW | Fine in dark fantasy art — review if prominently featured in blog/meta titles *(Removed from whitelist)* | "demon", |
| 4026 | `demon` | **Demon** | 🟡 LOW | Fine in dark fantasy art — review if prominently featured in blog/meta titles *(Removed from whitelist)* | "altText": "Thorn Demon Grin \u2014 free dark wallpaper download" |
| 4066 | `abyss` | **abyss** | 🟡 LOW | Fine in dark art context — review in any new ad or meta copy *(Removed from whitelist)* | "slug": "shadow-castle-abyss-iphone", |
| 4547 | `abyss` | **abyss** | 🟡 LOW | Fine in dark art context — review in any new ad or meta copy *(Removed from whitelist)* | "slug": "dark-abyss-grin-android", |
| 4987 | `summoning` | **summoning** | 🟡 LOW | Fine in dark fantasy context | "slug": "sorcerer-pearl-summoning-pc", |
| 4988 | `summoning` | **Summoning** | 🟡 LOW | Fine in dark fantasy context | "title": "Sorcerer Pearl Summoning", |
| 5003 | `summoning` | **Summoning** | 🟡 LOW | Fine in dark fantasy context | "altText": "Sorcerer Pearl Summoning \u2014 free dark wallpaper download" |
| 4197 | `cemetery` | **cemetery** | 🔵 INFO | Fine — classic gothic imagery. Very low AdSense risk *(Removed from whitelist)* | "slug": "day-of-the-dead-cemetery-queen-iphone", |


## 🟡 Weapons / Dangerous Items

### `app\admin-secret-hw\page.tsx`

| Line | Term | Matched | Severity | Suggestion | Context |
|---|---|---|---|---|---|
| 253 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | body: JSON.stringify({ password: pw }), |
| 256 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | else setError("Wrong password."); |
| 266 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | <input type="password" placeholder="Enter password" value={pw} |
| 266 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | <input type="password" placeholder="Enter password" value={pw} |
| 295 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | }, [password]); |
| 483 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | headers: { "x-admin-password": password }, |
| 483 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | headers: { "x-admin-password": password }, |
| 949 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | { password: string; prefillTitle: string; prefillLabel: string; onPrefillUsed: () => void }) { |
| 990 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | }, [password]); |
| 1046 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | headers: { "Content-Type": "application/json", "x-admin-password": password }, |
| 1046 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | headers: { "Content-Type": "application/json", "x-admin-password": password }, |
| 1067 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | headers: { "Content-Type": "application/json", "x-admin-password": password }, |
| 1067 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | headers: { "Content-Type": "application/json", "x-admin-password": password }, |
| 1360 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | headers: { "Content-Type": "application/json", "x-admin-password": password }, |
| 1360 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | headers: { "Content-Type": "application/json", "x-admin-password": password }, |
| 1452 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | <ManualMarkAdult password={password} /> |
| 1452 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | <ManualMarkAdult password={password} /> |
| 1469 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | headers: { "Content-Type": "application/json", "x-admin-password": password }, |
| 1469 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | headers: { "Content-Type": "application/json", "x-admin-password": password }, |
| 1521 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | headers: { "Content-Type": "application/json", "x-admin-password": password }, |
| 1521 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | headers: { "Content-Type": "application/json", "x-admin-password": password }, |
| 1569 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | }, [password]); |
| 1580 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | headers: { "Content-Type": "application/json", "x-admin-password": password }, |
| 1580 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | headers: { "Content-Type": "application/json", "x-admin-password": password }, |
| 1605 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | headers: { "Content-Type": "application/json", "x-admin-password": password }, |
| 1605 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | headers: { "Content-Type": "application/json", "x-admin-password": password }, |
| 1785 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | headers: { "x-admin-password": password }, |
| 1785 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | headers: { "x-admin-password": password }, |
| 1794 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | }, [password, page, q]); |
| 1815 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | headers: { "Content-Type": "application/json", "x-admin-password": password }, |
| 1815 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | headers: { "Content-Type": "application/json", "x-admin-password": password }, |
| 1832 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | headers: { "x-admin-password": password }, |
| 1832 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | headers: { "x-admin-password": password }, |
| 2068 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | const [password, setPw]               = useState(""); |
| 2089 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | if (!authed) return <PasswordGate onAuth={handleAuth} />; |
| 2133 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | {tab === "analytics" && <AnalyticsTab password={password} />} |
| 2133 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | {tab === "analytics" && <AnalyticsTab password={password} />} |
| 2134 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | {tab === "upload"    && <ImageUploaderTab password={password} />} |
| 2134 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | {tab === "upload"    && <ImageUploaderTab password={password} />} |
| 2135 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | {tab === "published" && <PublishedImagesTab password={password} />} |
| 2135 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | {tab === "published" && <PublishedImagesTab password={password} />} |
| 2138 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | password={password} |
| 2138 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | password={password} |
| 2145 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | {tab === "manage18" && <Manage18Tab password={password} />} |
| 2145 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | {tab === "manage18" && <Manage18Tab password={password} />} |
| 2146 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | {tab === "backdate" && <BackdateTab password={password} />} |
| 2146 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | {tab === "backdate" && <BackdateTab password={password} />} |

### `app\api\hw-admin\auth\route.ts`

| Line | Term | Matched | Severity | Suggestion | Context |
|---|---|---|---|---|---|
| 5 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | const { password } = await req.json(); |
| 7 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | if (password === correct) { |
| 10 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | return NextResponse.json({ error: "Wrong password" }, { status: 401 }); |

### `data\manifest.json`

| Line | Term | Matched | Severity | Suggestion | Context |
|---|---|---|---|---|---|
| 2282 | `sword` | **sword** | 🟡 LOW | Fine in fantasy/art context | "description": "A fearsome skeleton warrior in tattered chainmail armor wielding a battle-worn sword and a dark skull-em... |
| 2962 | `weapon` | **weapon** | 🟡 LOW | Fine in fantasy/gothic art context | "slug": "dark-weapon-rune-pattern", |


---

## 📋 Active Whitelist (52 terms)

These words are **never** flagged regardless of context:

`abort`, `crypt`, `cryptic`, `dark`, `darkness`, `dead`, `eerie`, `exception`, `fatal`, `ghost`, `ghostly`, `ghosts`, `grave`, `graveyard`, `grim`, `grimoire`, `hack`, `halloween`, `haunted`, `hauntedwallpapers`, `hell`, `hellish`, `host`, `macabre`, `master`, `ominous`, `phantom`, `raven`, `reaper`, `script`, `shadow`, `shadows`, `shadowy`, `sigil`, `sinister`, `skeletal`, `skeleton`, `skull`, `skulls`, `specter`, `tarot`, `terminate`, `undead`, `valentine`, `vampire`, `vampiric`, `void`, `wallpaper`, `wallpapers`, `witch`, `witches`, `wraith`

---
*This report was auto-generated. CRITICAL/HIGH items require action. MEDIUM items need context review. LOW/INFO items are informational only and are almost never the cause of AdSense rejection for an artistic/gothic site.*
