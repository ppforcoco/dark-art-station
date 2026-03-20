import fs from 'fs/promises';
import path from 'path';

// ============================================================
// CONFIGURATION
// ============================================================

const IGNORE_DIRS = new Set([
  'node_modules', '.git', '.next', '.github',
  'dist', 'build', 'coverage', '.husky',
  'content-safety-report.md', // don't scan our own output
  'package-lock.json',        // lockfile hashes create false positives
  'yarn.lock',                // same reason
  'pnpm-lock.yaml',           // same reason
]);

const ALLOWED_EXTENSIONS = new Set([
  '.html', '.js', '.jsx', '.ts', '.tsx',
  '.json', '.md', '.mdx', '.txt',
]);

// ============================================================
// SEVERITY & CATEGORY CONSTANTS
// ============================================================

const CRITICAL  = 'CRITICAL';   // Must fix before AdSense approval
const HIGH      = 'HIGH';       // Very likely to cause rejection
const MEDIUM    = 'MEDIUM';     // Review context — may be fine
const LOW       = 'LOW';        // Thematic / artistic — usually safe
const INFO      = 'INFO';       // Brand-adjacent, almost always fine

const CAT_SEXUAL    = 'Adult / Sexual Content';
const CAT_VIOLENCE  = 'Violence / Gore';
const CAT_HATE      = 'Hate Speech / Discrimination';
const CAT_DRUGS     = 'Drugs / Illegal Activity';
const CAT_SELFHARM  = 'Self-Harm / Suicide';
const CAT_WEAPONS   = 'Weapons / Dangerous Items';
const CAT_OCCULT    = 'Dark / Occult (Thematic)';
const CAT_RELIGIOUS = 'Religious / Sensitive';
// Religious sub-categories (all map to CAT_RELIGIOUS in reports,
// but notes field clarifies the sub-type for easier triage)
const REL_FIGURES   = CAT_RELIGIOUS;  // named deities / prophets / messiahs
const REL_CONCEPTS  = CAT_RELIGIOUS;  // heaven, sin, salvation etc.
const REL_PRACTICES = CAT_RELIGIOUS;  // prayer, worship, pilgrimage etc.
const REL_PLACES    = CAT_RELIGIOUS;  // church, mosque, temple etc.
const REL_TEXTS     = CAT_RELIGIOUS;  // bible, quran, torah etc.
const CAT_POLICY    = 'AdSense Policy Risk';

// ============================================================
// WHITELIST
// Words that are part of this site's brand, aesthetic, or
// completely safe artistic vocabulary.
// Any line where ALL matches are whitelisted words is skipped.
// These words are NEVER flagged regardless of dictionary entries.
// ============================================================

const WHITELIST = new Set([
  // Core brand words
  'haunted', 'hauntedwallpapers', 'wallpaper', 'wallpapers',

  // Dark aesthetic vocabulary — safe for this brand
  'dark', 'darkness', 'shadow', 'shadows', 'shadowy',
  'ghost', 'ghostly', 'ghosts',
  'skull', 'skulls',
  'demon', 'demons',               // artistic dark fantasy (demonic removed — now flagged)
  'witch', 'witches',              // artistic dark fantasy (witchcraft removed — now flagged)
  'dead',                          // "Day of the Dead" is a collection name
  'hell',                          // artistic / brand aesthetic
  'hellish',
  'grim', 'grimoire',
  'abyss', 'void',
  'cursed', 'curse',
  'ritual',                        // artistic context
  'sinister', 'ominous', 'eerie',
  'macabre',                       // morbid removed — now flagged
  'skeleton', 'skeletal',
  'reaper',
  'raven',
  'crypt', 'cryptic',
  'grave', 'graveyard', 'cemetery',
  'phantom', 'specter', 'wraith',
  'vampire', 'vampiric',
  'undead',
  'pagan',
  'tarot',
  'sigil',

  // Programming/technical terms — genuine false positives in code
  'kill',         // e.g. kill() process, kill switch in code comments
  'execute',      // code execution
  'script',
  'abort',
  'fatal',
  'exception',
  'terminate',
  'host',
  'master',
  'hack',         // "life hack", dev context
  // 'slave' and 'sin' are not whitelisted — they are actively flagged by the dictionary
]);

// ============================================================
// RELIGIOUS WHITELIST
// Words that overlap with religion but are:
//   (a) core to this site's dark/gothic brand, OR
//   (b) so common in everyday English they'd drown the report
// These are merged into WHITELIST at compile time below.
// ============================================================

const RELIGIOUS_WHITELIST = new Set([
  // Dark aesthetic / brand words that touch religion but are safe for this brand
  'hell', 'hellish',          // artistic aesthetic
  'demon', 'demons',          // dark fantasy art (demonic now flagged)
  'witch', 'witches',         // dark fantasy art (witchcraft now flagged)
  'ghost', 'ghostly',         // brand name adjacent
  'haunted',                  // literal brand name
  'shadow', 'shadows',        // aesthetic
  'dark', 'darkness',         // aesthetic
  'pagan',                    // thematic
  'ritual',                   // artistic context
  'abyss', 'void',

  // Programming / technical false positives only
  'host',                     // server host
  'oracle',                   // Oracle DB, "The Oracle's Eye" brand copy
  'creed',                    // "Our Creed" — brand copy section
  'lore',                     // "/lore" page route

  // NOTE: The following are now REMOVED from whitelist and will be FLAGGED:
  // devil, demonic, occult, spirit, spirits, soul, souls, witchcraft,
  // bless, blessed, blessing, grace, faith, divine, holy, sacred,
  // heaven, gospel, saint, angel, angels, paradise, sermon, morbid, slave, sin
]);

// ============================================================
// DICTIONARY
//
// Structure:
//   term        — root word or phrase to match
//   exactMatch  — true = word boundaries (\bterm\b), false = substring match
//   category    — grouping in the report
//   severity    — CRITICAL / HIGH / MEDIUM / LOW / INFO
//   suggestion  — safer replacement or action
//   notes       — (optional) context on why this is flagged
//
// AdSense rejection probability by severity:
//   CRITICAL  — near-certain rejection
//   HIGH      — likely rejection or manual review
//   MEDIUM    — contextual; only a problem if clearly inappropriate
//   LOW/INFO  — rarely causes issues; flagged for awareness only
// ============================================================

const DICTIONARY = [

  // ── ADULT / SEXUAL CONTENT ────────────────────────────────
  // These are the #1 cause of AdSense rejection. Zero tolerance.

  { term: 'porn',         exactMatch: false, category: CAT_SEXUAL,   severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'pornography',  exactMatch: false, category: CAT_SEXUAL,   severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'xxx',          exactMatch: false, category: CAT_SEXUAL,   severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'nude',         exactMatch: true,  category: CAT_SEXUAL,   severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'nudity',       exactMatch: false, category: CAT_SEXUAL,   severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'naked',        exactMatch: false, category: CAT_SEXUAL,   severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'erotic',       exactMatch: false, category: CAT_SEXUAL,   severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'erotica',      exactMatch: false, category: CAT_SEXUAL,   severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'sexually',     exactMatch: false, category: CAT_SEXUAL,   severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'explicit',     exactMatch: true,  category: CAT_SEXUAL,   severity: HIGH,     suggestion: 'Remove or replace with "mature" if non-sexual context', notes: 'High false-positive risk in code comments' },
  { term: 'hentai',       exactMatch: false, category: CAT_SEXUAL,   severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'fetish',       exactMatch: false, category: CAT_SEXUAL,   severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'nsfw',         exactMatch: false, category: CAT_SEXUAL,   severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'lewd',         exactMatch: false, category: CAT_SEXUAL,   severity: HIGH,     suggestion: 'Remove entirely' },
  { term: 'adult content',exactMatch: false, category: CAT_SEXUAL,   severity: HIGH,     suggestion: 'Use "mature themes" if non-sexual' },
  { term: 'sex ',         exactMatch: false, category: CAT_SEXUAL,   severity: HIGH,     suggestion: 'Remove or rewrite context' },
  { term: 'sexual',       exactMatch: false, category: CAT_SEXUAL,   severity: HIGH,     suggestion: 'Remove or replace with "mature"' },
  { term: 'escort',       exactMatch: true,  category: CAT_SEXUAL,   severity: HIGH,     suggestion: 'Remove entirely' },
  { term: 'onlyfans',     exactMatch: false, category: CAT_SEXUAL,   severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'camgirl',      exactMatch: false, category: CAT_SEXUAL,   severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'stripper',     exactMatch: false, category: CAT_SEXUAL,   severity: HIGH,     suggestion: 'Remove entirely' },
  { term: 'lingerie',     exactMatch: false, category: CAT_SEXUAL,   severity: MEDIUM,   suggestion: 'Remove if not a fashion/product context' },
  { term: 'bikini',       exactMatch: false, category: CAT_SEXUAL,   severity: LOW,      suggestion: 'Fine in fashion/beach context, remove if suggestive' },

  // ── VIOLENCE / GORE ───────────────────────────────────────
  // Moderate flags — dark/gothic art can reference death thematically.
  // Flag extremes, not aesthetic references.

  { term: 'gore',         exactMatch: true,  category: CAT_VIOLENCE, severity: HIGH,     suggestion: 'Remove or replace with "darkness", "shadows"' },
  { term: 'gory',         exactMatch: true,  category: CAT_VIOLENCE, severity: HIGH,     suggestion: 'Remove or replace with "intense", "visceral"', notes: 'exactMatch:true prevents false positive inside "category"' },
  { term: 'torture',      exactMatch: false, category: CAT_VIOLENCE, severity: HIGH,     suggestion: 'Remove entirely' },
  { term: 'mutilat',      exactMatch: false, category: CAT_VIOLENCE, severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'dismember',    exactMatch: false, category: CAT_VIOLENCE, severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'decapitat',    exactMatch: false, category: CAT_VIOLENCE, severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'behead',       exactMatch: false, category: CAT_VIOLENCE, severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'rape',         exactMatch: true,  category: CAT_VIOLENCE, severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'slaughter',    exactMatch: false, category: CAT_VIOLENCE, severity: HIGH,     suggestion: 'Remove or replace with "battle", "conquest"' },
  { term: 'massacre',     exactMatch: false, category: CAT_VIOLENCE, severity: HIGH,     suggestion: 'Remove entirely' },
  { term: 'carnage',      exactMatch: false, category: CAT_VIOLENCE, severity: HIGH,     suggestion: 'Replace with "chaos", "darkness"' },
  { term: 'murder',       exactMatch: false, category: CAT_VIOLENCE, severity: HIGH,     suggestion: 'Replace with "darkness", "night", or remove' },
  { term: 'stabbing',     exactMatch: false, category: CAT_VIOLENCE, severity: HIGH,     suggestion: 'Remove' },
  { term: 'strangl',      exactMatch: false, category: CAT_VIOLENCE, severity: HIGH,     suggestion: 'Remove' },
  { term: 'brutaliz',     exactMatch: false, category: CAT_VIOLENCE, severity: HIGH,     suggestion: 'Remove' },
  { term: 'blood',        exactMatch: true,  category: CAT_VIOLENCE, severity: MEDIUM,   suggestion: 'Replace with "crimson", "scarlet", or remove if graphic context. OK in "Blood Moon" collection name.' },
  { term: 'bloody',       exactMatch: true,  category: CAT_VIOLENCE, severity: MEDIUM,   suggestion: 'Replace with "crimson" or remove' },
  { term: 'corpse',       exactMatch: false, category: CAT_VIOLENCE, severity: MEDIUM,   suggestion: 'Replace with "remains", "the fallen"', notes: 'Low AdSense risk in gothic art context' },
  { term: 'kill',         exactMatch: true,  category: CAT_VIOLENCE, severity: MEDIUM,   suggestion: 'Replace with "defeat", "overcome"', notes: 'Also common in code — check context' },
  { term: 'killing',      exactMatch: true,  category: CAT_VIOLENCE, severity: MEDIUM,   suggestion: 'Replace with "defeating"' },
  { term: 'killer',       exactMatch: true,  category: CAT_VIOLENCE, severity: MEDIUM,   suggestion: 'Replace with "hunter", "predator"' },
  { term: 'death',        exactMatch: true,  category: CAT_VIOLENCE, severity: LOW,      suggestion: 'Fine in "Day of the Dead", "Dark Death" art — review context' },
  { term: 'dying',        exactMatch: true,  category: CAT_VIOLENCE, severity: LOW,      suggestion: 'Usually fine in artistic context' },
  { term: 'suicide',      exactMatch: false, category: CAT_SELFHARM, severity: CRITICAL, suggestion: 'Remove entirely — strict AdSense policy violation' },
  { term: 'self-harm',    exactMatch: false, category: CAT_SELFHARM, severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'self harm',    exactMatch: false, category: CAT_SELFHARM, severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'cutting',      exactMatch: true,  category: CAT_SELFHARM, severity: MEDIUM,   suggestion: 'Review context — fine in design/art contexts', notes: 'High false-positive in CSS/design code' },
  { term: 'hang yourself',exactMatch: false, category: CAT_SELFHARM, severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'overdose',     exactMatch: false, category: CAT_SELFHARM, severity: HIGH,     suggestion: 'Remove entirely' },

  // ── HATE SPEECH / DISCRIMINATION ──────────────────────────
  // Instant rejection territory. No artistic context justifies these.

  { term: 'nigger',       exactMatch: false, category: CAT_HATE, severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'nigga',        exactMatch: false, category: CAT_HATE, severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'faggot',       exactMatch: false, category: CAT_HATE, severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'dyke',         exactMatch: true,  category: CAT_HATE, severity: HIGH,     suggestion: 'Remove entirely' },
  { term: 'tranny',       exactMatch: false, category: CAT_HATE, severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'kike',         exactMatch: true,  category: CAT_HATE, severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'spic',         exactMatch: true,  category: CAT_HATE, severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'chink',        exactMatch: true,  category: CAT_HATE, severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'wetback',      exactMatch: false, category: CAT_HATE, severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'white power',  exactMatch: false, category: CAT_HATE, severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'white suprema',exactMatch: false, category: CAT_HATE, severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'nazi',         exactMatch: true,  category: CAT_HATE, severity: CRITICAL, suggestion: 'Remove entirely unless purely historical/educational' },
  { term: 'heil',         exactMatch: true,  category: CAT_HATE, severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'holocaust denial', exactMatch: false, category: CAT_HATE, severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'genocide',     exactMatch: false, category: CAT_HATE, severity: HIGH,     suggestion: 'Remove or use only in strict historical/educational context' },
  { term: 'ethnic cleansing', exactMatch: false, category: CAT_HATE, severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'islamophob',   exactMatch: false, category: CAT_HATE, severity: HIGH,     suggestion: 'Remove entirely' },
  { term: 'antisemit',    exactMatch: false, category: CAT_HATE, severity: HIGH,     suggestion: 'Remove entirely' },

  // ── DRUGS / ILLEGAL ACTIVITY ──────────────────────────────

  { term: 'cocaine',      exactMatch: false, category: CAT_DRUGS, severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'heroin',       exactMatch: false, category: CAT_DRUGS, severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'methamphetamine', exactMatch: false, category: CAT_DRUGS, severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'meth',         exactMatch: true,  category: CAT_DRUGS, severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'fentanyl',     exactMatch: false, category: CAT_DRUGS, severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'crack cocaine',exactMatch: false, category: CAT_DRUGS, severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'mdma',         exactMatch: false, category: CAT_DRUGS, severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'ecstasy',      exactMatch: true,  category: CAT_DRUGS, severity: HIGH,     suggestion: 'Remove if drug reference; fine in "pure ecstasy" emotional context' },
  { term: 'weed',         exactMatch: true,  category: CAT_DRUGS, severity: MEDIUM,   suggestion: 'Remove if drug reference', notes: 'Common false positive in gardening/nature contexts' },
  { term: 'marijuana',    exactMatch: false, category: CAT_DRUGS, severity: HIGH,     suggestion: 'Remove entirely' },
  { term: 'cannabis',     exactMatch: false, category: CAT_DRUGS, severity: HIGH,     suggestion: 'Remove unless in legal/medical context' },
  { term: 'drug dealer',  exactMatch: false, category: CAT_DRUGS, severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'buy drugs',    exactMatch: false, category: CAT_DRUGS, severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'darkweb',      exactMatch: false, category: CAT_DRUGS, severity: HIGH,     suggestion: 'Remove entirely' },
  { term: 'dark web',     exactMatch: false, category: CAT_DRUGS, severity: HIGH,     suggestion: 'Remove entirely' },
  { term: 'hacking tutorial', exactMatch: false, category: CAT_DRUGS, severity: HIGH, suggestion: 'Remove entirely' },
  { term: 'piracy',       exactMatch: true,  category: CAT_DRUGS, severity: MEDIUM,   suggestion: 'Review — fine in pirate aesthetics, not fine if promoting IP theft' },
  { term: 'torrent',      exactMatch: true,  category: CAT_DRUGS, severity: LOW,      suggestion: 'Review context' },

  // ── WEAPONS ───────────────────────────────────────────────
  // Context-dependent. Art references are usually fine.

  { term: 'buy guns',     exactMatch: false, category: CAT_WEAPONS, severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'firearms for sale', exactMatch: false, category: CAT_WEAPONS, severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'bomb making',  exactMatch: false, category: CAT_WEAPONS, severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'how to make a bomb', exactMatch: false, category: CAT_WEAPONS, severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'explosive',    exactMatch: true,  category: CAT_WEAPONS, severity: MEDIUM,   suggestion: 'Fine in metaphorical/artistic context; remove if instructional' },
  { term: 'ammunition',   exactMatch: false, category: CAT_WEAPONS, severity: MEDIUM,   suggestion: 'Review context' },
  { term: 'assault rifle',exactMatch: false, category: CAT_WEAPONS, severity: HIGH,     suggestion: 'Remove if not clearly fictional/historical' },
  { term: 'weapon',       exactMatch: true,  category: CAT_WEAPONS, severity: LOW,      suggestion: 'Fine in fantasy/gothic art context' },
  { term: 'dagger',       exactMatch: false, category: CAT_WEAPONS, severity: LOW,      suggestion: 'Fine in gothic/fantasy art context' },
  { term: 'sword',        exactMatch: false, category: CAT_WEAPONS, severity: LOW,      suggestion: 'Fine in fantasy/art context' },

  // ── OCCULT / DARK THEMATIC ───────────────────────────────
  // These are CORE to this site's brand. Flagged as LOW/INFO only.
  // They serve as an awareness log, not an action list.

  { term: 'satan',        exactMatch: true,  category: CAT_OCCULT, severity: MEDIUM,  suggestion: 'Replace with "dark one", "adversary", or keep if purely artistic' },
  { term: 'satanic',      exactMatch: false, category: CAT_OCCULT, severity: MEDIUM,  suggestion: 'Replace with "dark", "occult", or keep if clearly artistic' },
  { term: 'lucifer',      exactMatch: true,  category: CAT_OCCULT, severity: MEDIUM,  suggestion: 'Replace with "dark angel" if concerned about AdSense' },
  { term: 'devil',        exactMatch: true,  category: CAT_OCCULT, severity: LOW,     suggestion: 'Usually fine in dark art context' },
  { term: 'pentagram',    exactMatch: false, category: CAT_OCCULT, severity: LOW,     suggestion: 'Fine in occult art context; replace with "star symbol" if concerned' },
  { term: '666',          exactMatch: false, category: CAT_OCCULT, severity: LOW,     suggestion: 'Fine in dark art; be mindful of context in copy' },
  { term: 'cult',         exactMatch: true,  category: CAT_OCCULT, severity: LOW,     suggestion: 'Fine in "cult classic" or dark art context' },
  { term: 'black magic',  exactMatch: false, category: CAT_OCCULT, severity: LOW,     suggestion: 'Fine in dark art context' },
  { term: 'necromancy',   exactMatch: false, category: CAT_OCCULT, severity: LOW,     suggestion: 'Fine in dark fantasy context' },
  { term: 'summoning',    exactMatch: false, category: CAT_OCCULT, severity: LOW,     suggestion: 'Fine in dark fantasy context' },

  // ── RELIGIOUS / SENSITIVE ─────────────────────────────────────────────────
  //
  // AdSense Religious Content Policy summary:
  //   → Content that mocks, attacks, or disparages a religion = REJECTION
  //   → Neutral/artistic/historical religious references = USUALLY FINE
  //   → Promoting one religion over another = HIGH RISK
  //
  // Severity guide for this section:
  //   HIGH   → Named figures or texts used in a potentially mocking/harmful way
  //   MEDIUM → Contextual — fine in art, risky if used disparagingly
  //   LOW    → Light artistic/metaphorical usage, very low AdSense risk
  //
  // The RELIGIOUS_WHITELIST above handles common false positives:
  //   "soul", "spirit", "blessed", "divine", "holy", "sacred", "faith" etc.
  //   are whitelisted because this site's copy uses them constantly and
  //   they pose near-zero AdSense risk in a dark art / wallpaper context.
  // ──────────────────────────────────────────────────────────────────────

  // ── NAMED RELIGIOUS FIGURES ──────────────────────────────────
  // Risk: medium-high if used mockingly. Low if historical/artistic.

  // Christianity
  { term: 'jesus',         exactMatch: true,  category: REL_FIGURES, severity: HIGH,   suggestion: 'Remove if mocking — fine in historical/artistic context', notes: 'Christianity' },
  { term: 'jesus christ',  exactMatch: false, category: REL_FIGURES, severity: HIGH,   suggestion: 'Remove if used as an expletive or mockingly', notes: 'Christianity' },
  { term: 'christ',        exactMatch: true,  category: REL_FIGURES, severity: MEDIUM, suggestion: 'Fine in "Black Easter" etc. — review if mocking', notes: 'Christianity' },
  { term: 'lord jesus',    exactMatch: false, category: REL_FIGURES, severity: HIGH,   suggestion: 'Remove if mocking', notes: 'Christianity' },
  { term: 'virgin mary',   exactMatch: false, category: REL_FIGURES, severity: HIGH,   suggestion: 'Remove if used mockingly or disparagingly', notes: 'Christianity / Catholicism' },
  { term: 'holy mary',     exactMatch: false, category: REL_FIGURES, severity: HIGH,   suggestion: 'Remove if mocking', notes: 'Christianity' },
  { term: 'holy ghost',    exactMatch: false, category: REL_FIGURES, severity: MEDIUM, suggestion: 'Replace with "apparition", "spirit" in artistic context', notes: 'Christianity — note: standalone "ghost" is whitelisted' },
  { term: 'holy spirit',   exactMatch: false, category: REL_FIGURES, severity: MEDIUM, suggestion: 'Replace with "spirit", "essence" in artistic context', notes: 'Christianity' },
  { term: 'god the father',exactMatch: false, category: REL_FIGURES, severity: HIGH,   suggestion: 'Remove if mocking', notes: 'Christianity' },
  { term: 'son of god',    exactMatch: false, category: REL_FIGURES, severity: HIGH,   suggestion: 'Remove if mocking', notes: 'Christianity' },
  { term: 'pope',          exactMatch: true,  category: REL_FIGURES, severity: LOW,    suggestion: 'Fine unless used mockingly', notes: 'Catholicism' },
  { term: 'pontiff',       exactMatch: false, category: REL_FIGURES, severity: LOW,    suggestion: 'Fine in historical context', notes: 'Catholicism' },

  // Islam
  { term: 'allah',         exactMatch: true,  category: REL_FIGURES, severity: HIGH,   suggestion: 'Remove if mocking — never use as an expletive', notes: 'Islam' },
  { term: 'muhammad',      exactMatch: false, category: REL_FIGURES, severity: HIGH,   suggestion: 'Remove if mocking or used disparagingly', notes: 'Islam' },
  { term: 'prophet muhammad', exactMatch: false, category: REL_FIGURES, severity: HIGH, suggestion: 'Remove if mocking', notes: 'Islam' },
  { term: 'mohammed',      exactMatch: true,  category: REL_FIGURES, severity: HIGH,   suggestion: 'Remove if mocking', notes: 'Islam — alternate spelling' },
  { term: 'quran',         exactMatch: false, category: REL_TEXTS,   severity: HIGH,   suggestion: 'Remove if mocking — fine in educational context', notes: 'Islam' },
  { term: 'koran',         exactMatch: false, category: REL_TEXTS,   severity: HIGH,   suggestion: 'Remove if mocking', notes: 'Islam — alternate spelling' },
  { term: 'islam',         exactMatch: true,  category: REL_FIGURES, severity: HIGH,   suggestion: 'Remove if mocking or disparaging', notes: 'Religion name — review context' },
  { term: 'muslim',        exactMatch: true,  category: REL_FIGURES, severity: HIGH,   suggestion: 'Remove if targeting or disparaging', notes: 'Islam' },

  // Judaism
  { term: 'yahweh',        exactMatch: false, category: REL_FIGURES, severity: HIGH,   suggestion: 'Remove if mocking', notes: 'Judaism' },
  { term: 'jehovah',       exactMatch: false, category: REL_FIGURES, severity: HIGH,   suggestion: 'Remove if mocking', notes: 'Judaism / Christianity' },
  { term: 'torah',         exactMatch: false, category: REL_TEXTS,   severity: HIGH,   suggestion: 'Remove if mocking — fine in educational context', notes: 'Judaism' },
  { term: 'talmud',        exactMatch: false, category: REL_TEXTS,   severity: MEDIUM, suggestion: 'Fine in educational/historical context', notes: 'Judaism' },
  { term: 'rabbi',         exactMatch: true,  category: REL_FIGURES, severity: LOW,    suggestion: 'Fine unless mocking', notes: 'Judaism' },
  { term: 'jewish',        exactMatch: true,  category: REL_FIGURES, severity: MEDIUM, suggestion: 'Fine in historical context; never use mockingly', notes: 'Judaism' },

  // Hinduism
  { term: 'krishna',       exactMatch: true,  category: REL_FIGURES, severity: MEDIUM, suggestion: 'Fine in artistic/cultural context', notes: 'Hinduism' },
  { term: 'shiva',         exactMatch: true,  category: REL_FIGURES, severity: LOW,    suggestion: 'Fine in dark art context (god of destruction)', notes: 'Hinduism — also common name' },
  { term: 'brahma',        exactMatch: true,  category: REL_FIGURES, severity: LOW,    suggestion: 'Fine in artistic context', notes: 'Hinduism' },
  { term: 'vishnu',        exactMatch: true,  category: REL_FIGURES, severity: LOW,    suggestion: 'Fine in artistic context', notes: 'Hinduism' },
  { term: 'hindu',         exactMatch: true,  category: REL_FIGURES, severity: MEDIUM, suggestion: 'Fine in cultural/historical context', notes: 'Hinduism — review if targeting' },
  { term: 'ganesh',        exactMatch: true,  category: REL_FIGURES, severity: LOW,    suggestion: 'Fine in artistic context', notes: 'Hinduism' },
  { term: 'kali',          exactMatch: true,  category: REL_FIGURES, severity: LOW,    suggestion: 'Fine in dark art context', notes: 'Hinduism — also common in dark art' },
  { term: 'vedas',         exactMatch: false, category: REL_TEXTS,   severity: LOW,    suggestion: 'Fine in educational context', notes: 'Hinduism' },

  // Buddhism
  { term: 'buddha',        exactMatch: true,  category: REL_FIGURES, severity: MEDIUM, suggestion: 'Fine in cultural/artistic context — never mock', notes: 'Buddhism' },
  { term: 'buddhism',      exactMatch: false, category: REL_FIGURES, severity: MEDIUM, suggestion: 'Fine in cultural context', notes: 'Religion name' },
  { term: 'buddhist',      exactMatch: false, category: REL_FIGURES, severity: LOW,    suggestion: 'Fine in cultural context', notes: 'Buddhism' },
  { term: 'dharma',        exactMatch: true,  category: REL_CONCEPTS, severity: LOW,   suggestion: 'Fine in philosophical/artistic context', notes: 'Buddhism / Hinduism' },
  { term: 'nirvana',       exactMatch: true,  category: REL_CONCEPTS, severity: LOW,   suggestion: 'Fine in artistic/metaphorical context — also a band name', notes: 'Buddhism' },
  { term: 'karma',         exactMatch: true,  category: REL_CONCEPTS, severity: LOW,   suggestion: 'Fine in everyday/artistic use', notes: 'Very common in everyday English — low risk' },

  // Other / General
  { term: 'allah akbar',   exactMatch: false, category: REL_FIGURES, severity: HIGH,   suggestion: 'Remove — highly sensitive, often misused in harmful contexts', notes: 'Islam — contextual risk is very high' },
  { term: 'allahu akbar',  exactMatch: false, category: REL_FIGURES, severity: HIGH,   suggestion: 'Remove — highly sensitive', notes: 'Islam' },
  { term: 'infidel',       exactMatch: true,  category: REL_FIGURES, severity: HIGH,   suggestion: 'Remove if targeting a religious group', notes: 'Multi-religion — used as slur' },

  // ── NEWLY ACTIVATED — removed from whitelist per site owner ──────────────
  // These were previously ignored. Now flagged so you can review each
  // occurrence and decide whether to replace or keep.

  // Spiritual / afterlife concepts
  { term: 'soul',       exactMatch: true, category: REL_CONCEPTS,  severity: MEDIUM, suggestion: 'Replace with "essence", "energy". e.g. "12K Souls" → "12K Members"' },
  { term: 'souls',      exactMatch: true, category: REL_CONCEPTS,  severity: MEDIUM, suggestion: 'Replace with "followers", "members", "visitors"' },
  { term: 'spirit',     exactMatch: true, category: REL_CONCEPTS,  severity: MEDIUM, suggestion: 'Replace with "essence", "force", "energy"' },
  { term: 'spirits',    exactMatch: true, category: REL_CONCEPTS,  severity: MEDIUM, suggestion: 'Replace with "forces", "energies", "essences"' },
  { term: 'divine',     exactMatch: true, category: REL_CONCEPTS,  severity: MEDIUM, suggestion: 'Replace with "ethereal", "otherworldly", "supreme"' },
  { term: 'heaven',     exactMatch: true, category: REL_CONCEPTS,  severity: MEDIUM, suggestion: 'Replace with "the beyond", "the void above"' },
  { term: 'paradise',   exactMatch: true, category: REL_CONCEPTS,  severity: MEDIUM, suggestion: 'Replace with "sanctuary", "the beyond"' },
  { term: 'sacred',     exactMatch: true, category: REL_CONCEPTS,  severity: MEDIUM, suggestion: 'Replace with "ancient", "forbidden", "arcane"' },
  { term: 'holy',       exactMatch: true, category: REL_CONCEPTS,  severity: MEDIUM, suggestion: 'Replace with "arcane", "ancient", "revered"' },
  { term: 'faith',      exactMatch: true, category: REL_CONCEPTS,  severity: LOW,    suggestion: 'Replace with "belief", "conviction" if in copy' },
  { term: 'sin',        exactMatch: true, category: REL_CONCEPTS,  severity: MEDIUM, suggestion: 'Replace with "darkness", "vice"', notes: 'Also matches Math.sin() — check context carefully' },
  { term: 'occult',     exactMatch: true, category: REL_CONCEPTS,  severity: MEDIUM, suggestion: 'Replace with "arcane", "mystic", "hidden arts"', notes: 'Used in collection names — review carefully before changing' },
  { term: 'morbid',     exactMatch: true, category: REL_CONCEPTS,  severity: LOW,    suggestion: 'Replace with "dark", "shadowy", "grim"' },

  // Religious figures / beings
  { term: 'angel',      exactMatch: true, category: REL_FIGURES,   severity: MEDIUM, suggestion: 'Replace with "dark figure", "winged entity"' },
  { term: 'angels',     exactMatch: true, category: REL_FIGURES,   severity: MEDIUM, suggestion: 'Replace with "dark figures", "winged entities"' },
  { term: 'demonic',    exactMatch: true, category: REL_FIGURES,   severity: MEDIUM, suggestion: 'Replace with "dark", "shadowy", "infernal"' },
  { term: 'witchcraft', exactMatch: true, category: REL_FIGURES,   severity: MEDIUM, suggestion: 'Replace with "dark arts", "arcane practice", "sorcery"' },

  // Religious practices / texts
  { term: 'gospel',     exactMatch: true, category: REL_TEXTS,     severity: LOW,    suggestion: 'Replace with "truth", "word", or remove' },
  { term: 'saint',      exactMatch: true, category: REL_FIGURES,   severity: LOW,    suggestion: 'Replace with "figure", "icon"', notes: 'Common in place names — check context' },
  { term: 'bless',      exactMatch: true, category: REL_PRACTICES, severity: LOW,    suggestion: 'Replace with "grant", "bestow"' },
  { term: 'blessed',    exactMatch: true, category: REL_PRACTICES, severity: LOW,    suggestion: 'Replace with "gifted", "chosen", "marked"' },
  { term: 'blessing',   exactMatch: true, category: REL_PRACTICES, severity: LOW,    suggestion: 'Replace with "gift", "power", "mark"' },
  { term: 'grace',      exactMatch: true, category: REL_PRACTICES, severity: LOW,    suggestion: 'Replace with "elegance", "poise"', notes: 'Common name and everyday word — check context' },

  // Sensitive social terms
  { term: 'slave',      exactMatch: true, category: CAT_POLICY,     severity: MEDIUM, suggestion: 'Replace with "follower", "subject", or remove', notes: 'Also legacy git/db terminology — check context' },

  { term: 'heretic',       exactMatch: false, category: REL_FIGURES, severity: LOW,    suggestion: 'Fine in artistic/dark context', notes: 'Generic — low risk' },
  { term: 'apostate',      exactMatch: false, category: REL_FIGURES, severity: LOW,    suggestion: 'Fine in historical/artistic context', notes: 'Generic' },

  // ── HOLY SCRIPTURES & TEXTS ──────────────────────────────
  // Fine in educational/historical context. Flag if mocking.

  { term: 'bible',         exactMatch: true,  category: REL_TEXTS, severity: MEDIUM, suggestion: 'Fine in artistic context — review if mocking', notes: 'Christianity' },
  { term: 'biblical',      exactMatch: false, category: REL_TEXTS, severity: LOW,    suggestion: 'Fine in artistic/metaphorical use', notes: 'Common English adjective — low risk' },
  { term: 'old testament', exactMatch: false, category: REL_TEXTS, severity: MEDIUM, suggestion: 'Fine in historical context', notes: 'Christianity / Judaism' },
  { term: 'new testament', exactMatch: false, category: REL_TEXTS, severity: MEDIUM, suggestion: 'Fine in historical context', notes: 'Christianity' },
  { term: 'book of revelation', exactMatch: false, category: REL_TEXTS, severity: MEDIUM, suggestion: 'Fine in dark/artistic context — popular in gothic art', notes: 'Christianity — "Revelation" alone is low risk' },
  { term: 'genesis',       exactMatch: true,  category: REL_TEXTS, severity: LOW,    suggestion: 'Fine in artistic context — also common word', notes: 'Common word / Bible book / band name' },
  { term: 'holy bible',    exactMatch: false, category: REL_TEXTS, severity: HIGH,   suggestion: 'Remove if mocking or using as a prop for shock value', notes: 'Christianity' },
  { term: 'hadith',        exactMatch: false, category: REL_TEXTS, severity: MEDIUM, suggestion: 'Fine in educational context', notes: 'Islam' },
  { term: 'sharia',        exactMatch: false, category: REL_TEXTS, severity: HIGH,   suggestion: 'Remove — highly politically sensitive', notes: 'Islam — very high political sensitivity' },
  { term: 'fatwa',         exactMatch: false, category: REL_TEXTS, severity: HIGH,   suggestion: 'Remove — highly politically sensitive', notes: 'Islam' },
  { term: 'upanishads',    exactMatch: false, category: REL_TEXTS, severity: LOW,    suggestion: 'Fine in educational context', notes: 'Hinduism' },
  { term: 'bhagavad gita', exactMatch: false, category: REL_TEXTS, severity: LOW,    suggestion: 'Fine in educational context', notes: 'Hinduism' },
  { term: 'tripitaka',     exactMatch: false, category: REL_TEXTS, severity: LOW,    suggestion: 'Fine in educational context', notes: 'Buddhism' },

  // ── RELIGIOUS CONCEPTS & SPIRITUAL TERMS ─────────────────
  // Most are low/medium risk — they're common English words.

  { term: 'god',           exactMatch: true,  category: REL_CONCEPTS, severity: MEDIUM, suggestion: 'Replace with "deity", "creator", or remove if mocking', notes: 'Risk only if used as an expletive or mockingly' },
  { term: 'gods',          exactMatch: true,  category: REL_CONCEPTS, severity: LOW,    suggestion: 'Fine in polytheistic/artistic context', notes: 'Common in dark fantasy art' },
  { term: 'deity',         exactMatch: false, category: REL_CONCEPTS, severity: LOW,    suggestion: 'Fine — neutral term', notes: 'Neutral religious vocabulary' },
  { term: 'godlike',       exactMatch: false, category: REL_CONCEPTS, severity: LOW,    suggestion: 'Fine in artistic context', notes: 'Common adjective — very low risk' },
  { term: 'sin',           exactMatch: true,  category: REL_CONCEPTS, severity: MEDIUM, suggestion: 'Fine in dark artistic context — very common in gothic art', notes: '"Sin" is extremely common in dark/gothic aesthetics' },
  { term: 'sinful',        exactMatch: false, category: REL_CONCEPTS, severity: LOW,    suggestion: 'Fine in artistic context', notes: 'Low risk' },
  { term: 'salvation',     exactMatch: false, category: REL_CONCEPTS, severity: LOW,    suggestion: 'Fine in artistic/dark context', notes: 'Low risk' },
  { term: 'redemption',    exactMatch: false, category: REL_CONCEPTS, severity: LOW,    suggestion: 'Fine in artistic context', notes: 'Common word — very low AdSense risk' },
  { term: 'purgatory',     exactMatch: false, category: REL_CONCEPTS, severity: LOW,    suggestion: 'Fine in dark art context', notes: 'Good fit for gothic aesthetic' },
  { term: 'damnation',     exactMatch: false, category: REL_CONCEPTS, severity: MEDIUM, suggestion: 'Replace with "ruin", "doom" if concerned', notes: 'Common in gothic/dark art' },
  { term: 'damned',        exactMatch: true,  category: REL_CONCEPTS, severity: LOW,    suggestion: 'Fine in dark art context — "the damned and the divine"', notes: 'Used in your own brand copy' },
  { term: 'blasphemy',     exactMatch: false, category: REL_CONCEPTS, severity: MEDIUM, suggestion: 'Replace with "heresy", "defiance" in artistic context' },
  { term: 'blasphemous',   exactMatch: false, category: REL_CONCEPTS, severity: MEDIUM, suggestion: 'Replace with "dark", "profane" in artistic context' },
  { term: 'antichrist',    exactMatch: false, category: REL_CONCEPTS, severity: MEDIUM, suggestion: 'Replace with "dark figure" or keep if clearly artistic' },
  { term: 'apocalypse',    exactMatch: false, category: REL_CONCEPTS, severity: LOW,    suggestion: 'Fine in dark artistic context', notes: 'Very common in dark art / gaming' },
  { term: 'armageddon',    exactMatch: false, category: REL_CONCEPTS, severity: LOW,    suggestion: 'Fine in dark artistic context', notes: 'Common in dark art' },
  { term: 'rapture',       exactMatch: false, category: REL_CONCEPTS, severity: LOW,    suggestion: 'Fine in dark artistic context', notes: 'Also means "ecstasy" — very low risk' },
  { term: 'resurrection',  exactMatch: false, category: REL_CONCEPTS, severity: LOW,    suggestion: 'Fine in artistic context — "Black Easter" / "Dark Resurrection"', notes: 'Used in your collection names' },
  { term: 'crucifixion',   exactMatch: false, category: REL_CONCEPTS, severity: MEDIUM, suggestion: 'Review context — fine in historical/art context, risky if mocking', notes: 'Christianity' },
  { term: 'crucifix',      exactMatch: false, category: REL_CONCEPTS, severity: LOW,    suggestion: 'Fine in dark art context', notes: 'Very common in gothic aesthetics' },
  { term: 'jihad',         exactMatch: false, category: REL_CONCEPTS, severity: HIGH,   suggestion: 'Remove — highly politically sensitive regardless of context', notes: 'Islam — extremely high sensitivity' },
  { term: 'martyrdom',     exactMatch: false, category: REL_CONCEPTS, severity: MEDIUM, suggestion: 'Review context', notes: 'Multi-religion' },
  { term: 'prophet',       exactMatch: true,  category: REL_CONCEPTS, severity: MEDIUM, suggestion: 'Fine in artistic/historical context', notes: 'Generic religious term' },
  { term: 'messiah',       exactMatch: false, category: REL_CONCEPTS, severity: MEDIUM, suggestion: 'Fine in historical context — review if mocking', notes: 'Christianity / Judaism' },
  { term: 'pilgrimage',    exactMatch: false, category: REL_PRACTICES, severity: LOW,   suggestion: 'Fine — neutral/metaphorical use is common', notes: 'Multi-religion' },
  { term: 'worship',       exactMatch: false, category: REL_PRACTICES, severity: LOW,   suggestion: 'Fine in artistic context', notes: 'Common English word' },
  { term: 'pray',          exactMatch: true,  category: REL_PRACTICES, severity: LOW,   suggestion: 'Fine in artistic/emotional context', notes: 'Extremely common — very low risk' },
  { term: 'prayer',        exactMatch: false, category: REL_PRACTICES, severity: LOW,   suggestion: 'Fine in artistic context', notes: 'Common English word' },
  { term: 'sermon',        exactMatch: false, category: REL_PRACTICES, severity: LOW,   suggestion: 'Fine', notes: 'Very low risk' },
  { term: 'confession',    exactMatch: false, category: REL_PRACTICES, severity: LOW,   suggestion: 'Fine in artistic context', notes: 'Common English word' },
  { term: 'baptism',       exactMatch: false, category: REL_PRACTICES, severity: LOW,   suggestion: 'Fine in artistic context', notes: 'Christianity' },
  { term: 'communion',     exactMatch: false, category: REL_PRACTICES, severity: LOW,   suggestion: 'Fine in artistic context', notes: 'Christianity — also means "connection"' },
  { term: 'excommunicate', exactMatch: false, category: REL_PRACTICES, severity: LOW,   suggestion: 'Fine in artistic context', notes: 'Catholicism — low risk' },
  { term: 'halal',         exactMatch: true,  category: REL_PRACTICES, severity: LOW,   suggestion: 'Fine — neutral food/lifestyle term', notes: 'Islam — common everyday term' },
  { term: 'haram',         exactMatch: true,  category: REL_PRACTICES, severity: MEDIUM, suggestion: 'Review context — fine in educational use', notes: 'Islam — sometimes used as slang' },
  { term: 'ramadan',       exactMatch: false, category: REL_PRACTICES, severity: LOW,   suggestion: 'Fine — neutral cultural term', notes: 'Islam' },
  { term: 'hajj',          exactMatch: true,  category: REL_PRACTICES, severity: LOW,   suggestion: 'Fine in educational context', notes: 'Islam' },

  // ── PLACES OF WORSHIP ────────────────────────────────────
  // Very low AdSense risk on their own. Only flag if mocking.

  { term: 'church',        exactMatch: true,  category: REL_PLACES, severity: LOW,   suggestion: 'Fine — common English word. Review if mocking.', notes: 'Christianity' },
  { term: 'cathedral',     exactMatch: false, category: REL_PLACES, severity: LOW,   suggestion: 'Fine in artistic context', notes: 'Very common in gothic art — low risk' },
  { term: 'chapel',        exactMatch: false, category: REL_PLACES, severity: LOW,   suggestion: 'Fine in artistic context', notes: 'Christianity' },
  { term: 'mosque',        exactMatch: false, category: REL_PLACES, severity: LOW,   suggestion: 'Fine in neutral/educational context', notes: 'Islam — review if disparaging' },
  { term: 'temple',        exactMatch: true,  category: REL_PLACES, severity: LOW,   suggestion: 'Fine in artistic context', notes: 'Multi-religion — also gaming term' },
  { term: 'synagogue',     exactMatch: false, category: REL_PLACES, severity: LOW,   suggestion: 'Fine in neutral/educational context', notes: 'Judaism' },
  { term: 'shrine',        exactMatch: false, category: REL_PLACES, severity: LOW,   suggestion: 'Fine in artistic/dark context', notes: 'Common in gothic/dark aesthetics' },
  { term: 'monastery',     exactMatch: false, category: REL_PLACES, severity: LOW,   suggestion: 'Fine in artistic context', notes: 'Multi-religion' },
  { term: 'convent',       exactMatch: true,  category: REL_PLACES, severity: LOW,   suggestion: 'Fine in artistic context', notes: 'Christianity — exactMatch:true prevents match inside "unconventional"' },
  { term: 'altar',         exactMatch: false, category: REL_PLACES, severity: LOW,   suggestion: 'Fine in dark/artistic context', notes: 'Common in gothic art — very low risk' },
  { term: 'tabernacle',    exactMatch: false, category: REL_PLACES, severity: LOW,   suggestion: 'Fine in historical/artistic context', notes: 'Judaism / Christianity' },
  { term: 'sanctuary',     exactMatch: false, category: REL_PLACES, severity: LOW,   suggestion: 'Fine — common English word, often used in your brand copy', notes: '"Dark Sanctum" — very low risk' },
  { term: 'vatican',       exactMatch: false, category: REL_PLACES, severity: LOW,   suggestion: 'Fine in historical/artistic context', notes: 'Catholicism — review if attacking' },

  // ── ADSENSE POLICY RISK (MISC) ────────────────────────────

  { term: 'click here',   exactMatch: false, category: CAT_POLICY, severity: MEDIUM, suggestion: 'Replace with descriptive link text — also better for SEO' },
  { term: 'click the ad', exactMatch: false, category: CAT_POLICY, severity: CRITICAL, suggestion: 'Remove entirely — explicitly violates AdSense click policy' },
  { term: 'support us by clicking', exactMatch: false, category: CAT_POLICY, severity: CRITICAL, suggestion: 'Remove entirely — AdSense TOS violation' },
  { term: 'please click', exactMatch: false, category: CAT_POLICY, severity: HIGH,     suggestion: 'Remove — encouraging ad clicks violates AdSense TOS' },
  { term: 'gambling',     exactMatch: false, category: CAT_POLICY, severity: HIGH,     suggestion: 'Remove unless you have explicit AdSense gambling approval' },
  { term: 'casino',       exactMatch: false, category: CAT_POLICY, severity: HIGH,     suggestion: 'Remove unless approved gambling content' },
  { term: 'bet ',         exactMatch: false, category: CAT_POLICY, severity: LOW,      suggestion: 'Fine in casual/artistic context' },
  { term: 'counterfeit',  exactMatch: false, category: CAT_POLICY, severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'fake id',      exactMatch: false, category: CAT_POLICY, severity: CRITICAL, suggestion: 'Remove entirely' },
  { term: 'malware',      exactMatch: false, category: CAT_POLICY, severity: CRITICAL, suggestion: 'Remove entirely unless in a clearly educational/security context' },
  { term: 'virus',        exactMatch: true,  category: CAT_POLICY, severity: LOW,      suggestion: 'Fine in metaphorical/artistic context', notes: 'Common false positive in tech/code files' },
  { term: 'phishing',     exactMatch: false, category: CAT_POLICY, severity: HIGH,     suggestion: 'Remove unless educational/security context' },
];

// ============================================================
// SMART CONTEXT FILTERS
// Lines matching these patterns are skipped even if they
// contain a flagged term — prevents false positives from
// code, comments, imports, variable names, etc.
// ============================================================

const SKIP_PATTERNS = [
  /^\s*\/\/.*$/,                     // single-line JS/TS comments
  /^\s*#.*$/,                        // bash/Python comments
  /^\s*\*.*$/,                       // JSDoc / block comment lines
  /import\s+.+from\s+['"]/,         // ES module imports
  /require\s*\(['"]/,               // CommonJS requires
  /const\s+\w+\s*=/,               // variable declarations (catches kill = ...)
  /function\s+\w+/,                 // function declarations
  /className\s*=/,                  // JSX className props
  /\.(css|scss|module)/,            // CSS file references
  /node_modules/,                   // node_modules paths in content
  /eslint-disable/,                 // eslint comments
  /hauntedwallpapers\.com/i,        // domain references
  /process\.(kill|exit|abort)/,     // Node.js process methods
  /\.kill\s*\(/,                    // method calls like socket.kill()
  /console\.(log|warn|error|kill)/, // console methods
];

// ============================================================
// COMPILE DICTIONARY
// ============================================================

// Merge religious whitelist into main whitelist at runtime
for (const word of RELIGIOUS_WHITELIST) WHITELIST.add(word);

const COMPILED_DICTIONARY = DICTIONARY
  // Remove any entry whose term is in the whitelist
  .filter(entry => !WHITELIST.has(entry.term.toLowerCase()))
  .map(entry => {
    const pattern = entry.exactMatch
      ? `\\b${entry.term}\\b`
      : entry.term;
    return {
      ...entry,
      regex: new RegExp(pattern, 'gi'),
    };
  });

// ============================================================
// UTILITY: check if a line should be skipped
// ============================================================

function shouldSkipLine(line) {
  const trimmed = line.trim();
  if (trimmed.length === 0) return true;
  return SKIP_PATTERNS.some(p => p.test(trimmed));
}

// ============================================================
// FILE DISCOVERY
// ============================================================

async function getFiles(dir, fileList = []) {
  try {
    const files = await fs.readdir(dir, { withFileTypes: true });
    for (const file of files) {
      if (IGNORE_DIRS.has(file.name)) continue;
      const filepath = path.join(dir, file.name);
      if (file.isDirectory()) {
        await getFiles(filepath, fileList);
      } else {
        const ext = path.extname(file.name).toLowerCase();
        if (ALLOWED_EXTENSIONS.has(ext)) {
          fileList.push(filepath);
        }
      }
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn(`[WARNING] Could not read directory: ${dir} (${error.message})`);
    }
  }
  return fileList;
}

// ============================================================
// FILE SCANNER
// ============================================================

async function scanFile(filepath) {
  const results = [];
  try {
    const content = await fs.readFile(filepath, 'utf-8');
    const lines   = content.split(/\r?\n/);

    lines.forEach((line, index) => {
      // Skip lines that are almost certainly false positives
      if (shouldSkipLine(line)) return;

      COMPILED_DICTIONARY.forEach(entry => {
        entry.regex.lastIndex = 0;
        let match;
        while ((match = entry.regex.exec(line)) !== null) {
          // Secondary whitelist check: if the EXACT matched text
          // (lowercased) is in the whitelist, skip this match
          if (WHITELIST.has(match[0].toLowerCase())) return;

          // Skip if the matched word is part of a longer whitelisted word
          // e.g. "kill" inside "skill" or "toolkit"
          const before = line[match.index - 1] ?? ' ';
          const after  = line[match.index + match[0].length] ?? ' ';
          const isPartOfLongerWord = /\w/.test(before) || /\w/.test(after);
          if (entry.exactMatch && isPartOfLongerWord) continue;

          const surroundingText = line.trim().substring(0, 120) +
            (line.length > 120 ? '...' : '');

          results.push({
            file:          filepath,
            line:          index + 1,
            term:          entry.term,
            matchedText:   match[0],
            surroundingText,
            category:      entry.category,
            severity:      entry.severity,
            suggestion:    entry.suggestion,
            notes:         entry.notes ?? null,
          });
        }
      });
    });
  } catch (error) {
    console.warn(`[WARNING] Could not read file: ${filepath} (${error.message})`);
  }
  return results;
}

// ============================================================
// REPORT GENERATOR
// ============================================================

const SEVERITY_EMOJI = {
  [CRITICAL]: '🚨',
  [HIGH]:     '🔴',
  [MEDIUM]:   '🟠',
  [LOW]:      '🟡',
  [INFO]:     '🔵',
};

const SEVERITY_ORDER = { [CRITICAL]: 0, [HIGH]: 1, [MEDIUM]: 2, [LOW]: 3, [INFO]: 4 };

function generateMarkdownReport(findings) {
  const date = new Date().toISOString();

  // Sort: critical first
  const sorted = [...findings].sort(
    (a, b) => (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9)
  );

  let md = `# 🔍 Content Safety Audit Report\n`;
  md += `**Generated:** ${date}  \n`;
  md += `**Total Flagged Occurrences:** ${sorted.length}  \n`;
  md += `**Dictionary Size:** ${COMPILED_DICTIONARY.length} terms  \n`;
  md += `**Whitelist Size:** ${WHITELIST.size} terms  \n\n`;

  if (sorted.length === 0) {
    md += `✅ **No sensitive content found. Site appears AdSense-safe.**\n`;
    return md;
  }

  // ── Severity summary ──
  const counts = sorted.reduce((acc, f) => {
    acc[f.severity] = (acc[f.severity] || 0) + 1;
    return acc;
  }, {});

  md += `## Summary by Severity\n\n`;
  md += `| Severity | Count | AdSense Risk |\n`;
  md += `|---|---|---|\n`;
  md += `| 🚨 CRITICAL | ${counts[CRITICAL] || 0} | Immediate rejection |\n`;
  md += `| 🔴 HIGH     | ${counts[HIGH] || 0}     | Likely rejection |\n`;
  md += `| 🟠 MEDIUM   | ${counts[MEDIUM] || 0}   | Context-dependent |\n`;
  md += `| 🟡 LOW      | ${counts[LOW] || 0}      | Usually safe in art context |\n`;
  md += `| 🔵 INFO     | ${counts[INFO] || 0}      | Awareness only |\n\n`;

  // ── Action required banner ──
  const critical = counts[CRITICAL] || 0;
  const high     = counts[HIGH] || 0;
  if (critical > 0) {
    md += `> ⛔ **${critical} CRITICAL issue(s) found. These MUST be resolved before AdSense submission.**\n\n`;
  } else if (high > 0) {
    md += `> ⚠️ **${high} HIGH severity issue(s) found. Review before AdSense submission.**\n\n`;
  } else {
    md += `> ✅ **No critical or high-risk content found. Review MEDIUM items for context.**\n\n`;
  }

  // ── Group by category ──
  const byCat = sorted.reduce((acc, f) => {
    if (!acc[f.category]) acc[f.category] = [];
    acc[f.category].push(f);
    return acc;
  }, {});

  for (const [category, items] of Object.entries(byCat)) {
    const topSeverity = items[0].severity;
    md += `\n## ${SEVERITY_EMOJI[topSeverity]} ${category}\n\n`;

    // Group by file within category
    const byFile = items.reduce((acc, f) => {
      if (!acc[f.file]) acc[f.file] = [];
      acc[f.file].push(f);
      return acc;
    }, {});

    for (const [file, fileFindings] of Object.entries(byFile)) {
      const relPath = file.replace(process.cwd(), '').replace(/^[\\/]/, '');
      md += `### \`${relPath}\`\n\n`;
      md += `| Line | Term | Matched | Severity | Suggestion | Context |\n`;
      md += `|---|---|---|---|---|---|\n`;

      fileFindings.forEach(f => {
        const safeCtx = f.surroundingText
          .replace(/\|/g, '\\|')
          .replace(/`/g, "'");
        const noteStr = f.notes ? ` *(${f.notes})*` : '';
        md += `| ${f.line} | \`${f.term}\` | **${f.matchedText}** | ${SEVERITY_EMOJI[f.severity]} ${f.severity} | ${f.suggestion}${noteStr} | ${safeCtx} |\n`;
      });
      md += `\n`;
    }
  }

  // ── Whitelist reference ──
  md += `\n---\n\n`;
  md += `## 📋 Active Whitelist (${WHITELIST.size} terms)\n\n`;
  md += `These words are **never** flagged regardless of context:\n\n`;
  md += `\`${[...WHITELIST].sort().join('`, `')}\`\n\n`;

  md += `---\n`;
  md += `*This report was auto-generated. CRITICAL/HIGH items require action. `;
  md += `MEDIUM items need context review. LOW/INFO items are informational only `;
  md += `and are almost never the cause of AdSense rejection for an artistic/gothic site.*\n`;

  return md;
}

// ============================================================
// MAIN
// ============================================================

async function runAudit() {
  console.log('🚀 Starting Content Safety Audit...\n');
  console.log(`📚 Dictionary: ${COMPILED_DICTIONARY.length} active terms`);
  console.log(`✅ Whitelist:  ${WHITELIST.size} ignored terms`);
  console.log(`🔇 Skip patterns: ${SKIP_PATTERNS.length} context filters\n`);

  const projectRoot = process.cwd();
  console.log(`📂 Scanning: ${projectRoot}`);

  const filesToScan = await getFiles(projectRoot);
  console.log(`📄 Found ${filesToScan.length} files to scan\n`);
  console.log(`🔍 Scanning...`);

  let allFindings = [];
  for (const file of filesToScan) {
    const findings = await scanFile(file);
    if (findings.length > 0) {
      allFindings = allFindings.concat(findings);
      const rel = file.replace(projectRoot, '').replace(/^[\\/]/, '');
      const critCount = findings.filter(f => f.severity === CRITICAL).length;
      if (critCount > 0) {
        console.log(`  🚨 ${rel} — ${critCount} CRITICAL`);
      }
    }
  }

  const criticalCount = allFindings.filter(f => f.severity === CRITICAL).length;
  const highCount     = allFindings.filter(f => f.severity === HIGH).length;

  console.log(`\n📊 Scan complete:`);
  console.log(`   🚨 CRITICAL: ${criticalCount}`);
  console.log(`   🔴 HIGH:     ${highCount}`);
  console.log(`   🟠 MEDIUM:   ${allFindings.filter(f => f.severity === MEDIUM).length}`);
  console.log(`   🟡 LOW:      ${allFindings.filter(f => f.severity === LOW).length}\n`);

  const reportPath = path.join(projectRoot, 'content-safety-report.md');
  const report     = generateMarkdownReport(allFindings);

  try {
    await fs.writeFile(reportPath, report, 'utf-8');
    console.log(`📄 Report saved to: content-safety-report.md`);
  } catch (err) {
    console.error(`[ERROR] Could not write report: ${err.message}`);
  }

  // Exit with error code if CRITICAL issues found — useful for CI/CD
  if (criticalCount > 0) {
    console.log(`\n⛔ ${criticalCount} CRITICAL issue(s) must be fixed before AdSense submission.`);
    console.log(`   Add "audit:content": "node scripts/content-safety-audit.mjs" to package.json`);
    console.log(`   Use process.exit(1) at the end to fail CI builds on CRITICAL findings.\n`);
    // Uncomment the line below to hard-fail CI on critical findings:
    // process.exit(1);
  } else {
    console.log(`\n✅ No CRITICAL issues. Site looks AdSense-safe.\n`);
  }
}

runAudit().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});