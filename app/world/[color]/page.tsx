// app/world/[color]/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import Pagination from "@/components/Pagination";
import WorldTheme from "@/components/WorldTheme";

export const revalidate = 3600;

const WORLDS = {
  purple: {
    label:      "Void",
    dot:        "#7c3aed",
    accent:     "#a855f7",
    accentDim:  "#6d28d9",
    bg:         "#0a0614",
    bgDeep:     "#06030d",
    border:     "rgba(147,51,234,0.3)",
    borderHi:   "rgba(168,85,247,0.7)",
    glow:       "rgba(124,58,237,0.35)",
    text:       "#e9d5ff",
    textMuted:  "#c4b5fd",
    tags:       ["purple", "violet", "lavender", "indigo", "dark purple", "neon purple", "amethyst"],
    titleWords: ["purple", "violet"],
    desc:       "Where reality dissolves into violet mist.",
    eyebrow:    "ENTER THE VOID",
    content: {
      intro: [
        "The Void World is built around a single feeling — the moment before something unknowable arrives. Purple and violet have always carried that weight in dark art: they sit at the edge of the visible spectrum, one step away from darkness, one step away from something stranger. Every wallpaper in this world lives in that threshold.",
        "These aren't simply purple images. They are psychological spaces — gothic anime characters with violet eyes that follow you, neon cyberpunk streets where the light never quite reaches the ground, cosmic horror scenes where the sky itself has become wrong. The colour is a vehicle, not a subject.",
        "This world is for people who feel the difference between a wallpaper and an atmosphere. If your screen is the first thing you see in the morning and the last thing you see at night, it should feel like something. The Void World wallpapers are curated to do exactly that."
      ],
      themes: [
        { name: "Gothic Anime", desc: "Violet-eyed characters, dark academia settings, possession aesthetics. Drawn from horror manga sensibilities and filtered through AMOLED-optimised contrast." },
        { name: "Neon Cyberpunk", desc: "Purple neon against deep black cityscapes. Grid lines, glitch effects, phantom figures. Designed for high-refresh OLED displays where neon blooms correctly." },
        { name: "Cosmic Horror", desc: "Amethyst skies, impossible geometries, entities that should not exist. The colour of deep space filtered through something that has gone wrong." },
        { name: "Dark Fantasy", desc: "Lavender flames, indigo forests, violet magic systems. High fantasy aesthetics stripped of colour warmth and rebuilt in the cold end of the spectrum." },
      ],
      deviceTips: "These wallpapers are generated at full resolution for both portrait screens. On AMOLED and OLED displays — including iPhone 14 Pro and above, Samsung Galaxy S series, and Google Pixel — the deep purples render as true blacks in the darkest areas, giving the images exceptional depth and saving battery life. For best results, set your display to Natural or OLED colour profile and allow maximum contrast.",
      faqs: [
        { q: "What makes a good dark purple wallpaper?", a: "Depth and contrast. A purple wallpaper that works on a dark phone screen needs true blacks in the background — not grey, not navy, but actual zero-luminance black — so the violet and amethyst tones can breathe. Every image in the Void World is curated with this in mind." },
        { q: "Are these wallpapers safe for AMOLED screens?", a: "Yes. AMOLED screens turn off pixels that display true black, which saves battery and extends screen lifespan. The Void World wallpapers use deep shadow areas intentionally — the dark backgrounds are not compressed or lifted, so AMOLED displays will benefit fully." },
        { q: "What resolution are the downloads?", a: "All downloads are provided at full resolution — typically 1080×1920 for phone wallpapers, which is native or higher than most current iPhone and Android screens. No upscaling, no compression artefacts." },
        { q: "How often are new purple wallpapers added?", a: "New images arrive regularly across all worlds. The Void World is one of the most active — violet and purple aesthetics are central to what we build. Check back often or browse the latest arrivals in the main gallery." },
      ],
    },
  },
  red: {
    label:      "Crimson",
    dot:        "#e0001f",
    accent:     "#ff1a33",
    accentDim:  "#8b0000",
    bg:         "#0d0000",
    bgDeep:     "#080000",
    border:     "rgba(192,0,26,0.3)",
    borderHi:   "rgba(255,26,51,0.7)",
    glow:       "rgba(192,0,26,0.35)",
    text:       "#ffe0e0",
    textMuted:  "#ffb3b3",
    tags:       ["red", "crimson", "scarlet", "dark red"],
    titleWords: ["red", "crimson", "scarlet"],
    desc:       "Fire and darkness. The deepest reds the dark has to offer.",
    eyebrow:    "BLEED INTO CRIMSON",
    content: {
      intro: [
        "Red is the most visceral colour in dark art. It carries fire, rage, and warning all at once — and when you strip away the brightness and push it into deep crimson, something else emerges. A controlled violence. A heat that feels cold. That is the Crimson World.",
        "Every image here exists at the intersection of intensity and restraint. Dark red tones against near-black backgrounds create wallpapers that feel dangerous without being loud. Scarlet eyes in the dark. Burning embers in an empty space. A red that has been burning so long it has forgotten why.",
        "The Crimson World is for those who want a phone screen that commands attention without performing it. Power, not decoration. Danger, not spectacle."
      ],
      themes: [
        { name: "Dark Horror", desc: "Crimson splatter aesthetics, gothic figures, dark medical imagery. High contrast, deeply unsettling. Not for the faint of heart." },
        { name: "Fire & Ember", desc: "Burning landscapes, ember trails, volcanic aesthetics. Red-orange gradients pushed toward pure crimson. Heat rendered cold." },
        { name: "Dark Fantasy Combat", desc: "Armoured figures and shadowed knights rendered in deep crimson. Scenes of conflict stripped back to atmosphere — tension, stillness, and the weight of the moment." },
        { name: "Scarlet Eyes", desc: "Portraits and characters defined by red eyes — a recurring motif across anime, horror, and dark fantasy that signals something fundamentally other." },
      ],
      deviceTips: "Crimson and dark red tones render differently across screen types. On AMOLED displays, the deep near-black backgrounds drop to true zero, making the red tones pop with unusual intensity — similar to how red looks against a darkroom. On LCD screens, the same images will appear slightly warmer. Either way, avoid applying a blue light filter while viewing these wallpapers as it will shift the reds toward orange and flatten the contrast.",
      faqs: [
        { q: "Why do red wallpapers look different on my screen vs the preview?", a: "Red is the most colour-profile-sensitive tone on phone displays. If your display is set to a warm or sRGB-clamped profile, deep crimsons may shift toward orange. Switch to the widest colour gamut setting your phone supports — on iPhone this is P3, on Samsung it is Vivid — for the most accurate rendering." },
        { q: "Are these suitable for lock screens or just home screens?", a: "Both. The high-contrast dark backgrounds work particularly well on lock screens where the always-on display or lock screen clock needs to remain readable. The dark areas ensure text legibility without needing a separate overlay." },
        { q: "How is the Crimson World different from just searching 'red'?", a: "The Crimson World is curated — not every image with a hint of red qualifies. These are wallpapers where red is the dominant emotional and visual tone, not an accent. Think of it as a strict editorial selection rather than a keyword search." },
      ],
    },
  },
  green: {
    label:      "Haunted",
    dot:        "#16a34a",
    accent:     "#22c55e",
    accentDim:  "#14532d",
    bg:         "#030a04",
    bgDeep:     "#010502",
    border:     "rgba(34,197,94,0.25)",
    borderHi:   "rgba(34,197,94,0.6)",
    glow:       "rgba(22,163,74,0.3)",
    text:       "#dcfce7",
    textMuted:  "#86efac",
    tags:       ["green", "emerald", "dark green", "neon green"],
    titleWords: ["green", "emerald"],
    desc:       "Something stirs in the green. A world of shadow and overgrowth.",
    eyebrow:    "INTO THE DARK FOREST",
    content: {
      intro: [
        "Green is the colour of things that grow — and of the things that grow in places they should not. The Haunted World is built on that contradiction: lush and suffocating, alive and deeply wrong. Every image in this collection is a place you could get lost in, and might not return from.",
        "Dark green sits in a unique position in the horror aesthetic. It doesn't announce itself like red or unsettle like violet. It waits. Emerald forest depths, bioluminescent decay, neon green terminal screens in abandoned buildings, toxic swamp light that seems to move on its own. The Haunted World explores all of it.",
        "This world is for people drawn to nature horror, post-apocalyptic overgrowth, dark environmental aesthetics, and the particular dread of something alive where nothing should be alive. If the forest outside is always a little threatening to you, you are in the right place."
      ],
      themes: [
        { name: "Forest Horror", desc: "Ancient trees, roots that move, fog-lit clearings where something stands just out of frame. Nature as predator, not backdrop." },
        { name: "Bioluminescent Dark", desc: "Glowing organisms, deep-sea aesthetics translated to land, emerald light sources that have no explanation. Beautiful and wrong." },
        { name: "Neon Green Cyber", desc: "Terminal green on black, matrix aesthetics, hacker iconography stripped of nostalgia and rebuilt as something colder and more threatening." },
        { name: "Toxic & Overgrowth", desc: "Post-collapse environments where green has reclaimed concrete. Poisonous beauty. Abandoned structures swallowed by something patient." },
      ],
      deviceTips: "Dark green wallpapers perform particularly well on OLED and AMOLED screens because the near-black backgrounds in forest and overgrowth scenes render as true blacks, creating a sense of genuine depth rather than a flat dark green field. On older LCD displays, the shadow areas may appear slightly lifted — if this happens, increasing your display contrast by one or two steps will recover the intended visual weight.",
      faqs: [
        { q: "What kinds of green wallpapers are in the Haunted World?", a: "The collection spans forest horror, bioluminescent aesthetics, neon cyber-green, and toxic overgrowth. The common thread is dark green as a dominant tone — not mint, not lime, not sage. Deep, saturated, slightly wrong greens." },
        { q: "Are these nature wallpapers or horror wallpapers?", a: "Both, and deliberately so. The Haunted World treats nature as inherently threatening — beautiful but unsafe. If you want a peaceful forest scene, this is not the right collection. If you want a forest that watches you back, you are in exactly the right place." },
        { q: "Do green wallpapers work well on dark mode phones?", a: "Exceptionally well. The dark backgrounds in these images are designed to integrate with system dark mode — the wallpaper and interface feel like a single environment rather than a decorated screen. Particularly effective on phones with AMOLED displays and system-wide dark mode enabled." },
        { q: "Is the Haunted World updated with new images?", a: "Yes. Green aesthetics — particularly forest horror and bioluminescent themes — are an active area of our generation pipeline. New images are added regularly. The collection grows most often after seasonal drops around autumn and winter." },
      ],
    },
  },
  blue: {
    label:      "Deep",
    dot:        "#1d4ed8",
    accent:     "#3b82f6",
    accentDim:  "#1e3a8a",
    bg:         "#030614",
    bgDeep:     "#010209",
    border:     "rgba(59,130,246,0.25)",
    borderHi:   "rgba(59,130,246,0.6)",
    glow:       "rgba(29,78,216,0.3)",
    text:       "#dbeafe",
    textMuted:  "#93c5fd",
    tags:       ["blue", "dark blue", "neon blue", "ice blue"],
    titleWords: ["blue"],
    desc:       "From the deepest cold. Electric, frozen, vast.",
    eyebrow:    "DESCEND INTO THE DEEP",
    content: {
      intro: [
        "The Deep World is named for what blue becomes when you take away the light. Not navy, not royal, not the friendly blue of clear skies — the blue of ocean trenches, of ice cores, of space between galaxies. Cold, vast, and indifferent to your presence.",
        "Blue carries a strange tension in dark art. It is simultaneously the coldest and the most electric of the dark palette — ice and neon living in the same spectrum. The Deep World captures both: still frozen landscapes that feel abandoned since before humans existed, and electric blue cityscapes that hum with a power no one controls anymore.",
        "This world is for the person whose idea of dark is not dramatic or loud but vast and impersonal. The horror of scale. The cold that has no interest in you. If you want a wallpaper that makes your phone feel like a window into something immeasurably large, this is where you belong."
      ],
      themes: [
        { name: "Ice & Arctic", desc: "Frozen wastelands, glacial formations, blizzard aesthetics. Pale blue light on black. The cold rendered visually rather than emotionally." },
        { name: "Deep Ocean", desc: "Deep-sea trench imagery, bioluminescent deep-sea life, the crushing dark blue of extreme depths. Horror through scale rather than threat." },
        { name: "Neon Blue Electric", desc: "Electric blue against black urban environments. High voltage aesthetics, lightning, plasma. Blue as a dangerous energy rather than a calming one." },
        { name: "Cosmic Blue", desc: "Nebulae, star fields, deep space rendered in blue. The universe at its largest and most indifferent. Wallpapers that make your phone feel small." },
      ],
      deviceTips: "Blue is the most display-sensitive tone in the dark spectrum. On True Tone displays (iPhone) and Adaptive display modes (Samsung, Pixel), blue tones can shift toward teal or toward purple depending on ambient light conditions and display calibration. For the most accurate rendering of the Deep World wallpapers, disable True Tone or Adaptive display and set your display to the widest available colour profile. The ice blue and neon blue tones in particular benefit significantly from this.",
      faqs: [
        { q: "Does True Tone affect how these blue wallpapers look?", a: "Yes, significantly. True Tone on iPhone and similar features on Android devices adjust display colour temperature based on ambient light — which can push dark blues toward teal in warm environments. For accurate rendering, switch True Tone off while using these as wallpapers, or accept that the warmth shift will occur." },
        { q: "What is the difference between the Deep World and just browsing blue wallpapers?", a: "Curation. The Deep World only includes images where dark blue is the primary emotional and visual tone — not images with a blue accent or blue sky. Think of the difference between a blue-tinted image and an image that is fundamentally, inescapably blue." },
        { q: "Why do my blue wallpapers look slightly purple sometimes?", a: "AMOLED displays boost blue channel saturation to compensate for the natural dimming of blue OLEDs over time. This can push deep blues toward indigo or violet, particularly on older Samsung devices. Switching from Vivid to Natural display mode will correct this." },
      ],
    },
  },
  black: {
    label:      "Shadow",
    dot:        "#050505",
    accent:     "#ffffff",
    accentDim:  "#888888",
    bg:         "#000000",
    bgDeep:     "#000000",
    border:     "rgba(255,255,255,0.1)",
    borderHi:   "rgba(255,255,255,0.35)",
    glow:       "rgba(100,100,100,0.2)",
    text:       "#f0f0f0",
    textMuted:  "#aaaaaa",
    tags:       ["black", "obsidian", "pitch black", "amoled", "monochrome"],
    titleWords: ["black", "obsidian"],
    desc:       "Pure void. The absence of everything. AMOLED-perfect.",
    eyebrow:    "EMBRACE THE SHADOW",
    content: {
      intro: [
        "The Shadow World is the most technically considered collection on this site. These are wallpapers designed specifically for AMOLED and OLED displays — built on true black backgrounds that turn display pixels completely off, achieving a literal absence of light rather than a simulation of darkness.",
        "Black wallpapers are often dismissed as lazy minimalism. The Shadow World exists to disprove that. Every image here earns its black — through texture, through the single element that exists against the void, through the contrast of something bone-white or ghost-pale against absolute nothing. These are not empty screens. They are carefully constructed negative spaces.",
        "This world is for the AMOLED enthusiast who understands that a screen displaying true black is using zero power at that pixel. It is for the minimalist who wants maximum impact. It is for anyone who has looked at a cluttered, colourful phone screen and thought: less. Much less."
      ],
      themes: [
        { name: "Pure AMOLED", desc: "True #000000 backgrounds with single-element compositions. Maximum battery saving. Maximum contrast. The phone screen as a portal to nothing." },
        { name: "Monochrome Figures", desc: "Characters, skulls, hands, and abstract figures rendered in white, grey, or pale tone against pure black. High-contrast portraiture with no colour to hide behind." },
        { name: "Obsidian Texture", desc: "Black surfaces that are not quite uniform — volcanic glass, carved stone, disturbed water at night. Darkness with depth rather than darkness as flatness." },
        { name: "Ghost & Shadow", desc: "Semi-transparent forms, motion blur ghosts, shadow entities that are more absence than presence. The aesthetic of something almost not there." },
      ],
      deviceTips: "The Shadow World wallpapers are engineered for AMOLED and OLED displays. On any phone with this screen technology — iPhone X and later, Samsung Galaxy S and A series, Google Pixel 2 and later, OnePlus, and most flagship Android devices from 2019 onward — true black areas in these wallpapers will consume zero battery because the pixel is simply off. Set your display to maximum brightness in dark environments for the most dramatic effect. On LCD screens, the blacks will appear dark grey rather than true black — the wallpapers still look good, but the AMOLED effect is not achievable on LCD hardware.",
      faqs: [
        { q: "How much battery do black AMOLED wallpapers actually save?", a: "The savings are real but context-dependent. On a fully black screen with nothing displayed, an AMOLED display uses approximately 60–70% less power than displaying full white at the same brightness. A wallpaper with large true-black areas will reduce display power draw proportionally. The effect is most noticeable at high brightness settings." },
        { q: "What is the difference between black and dark wallpapers?", a: "Black wallpapers use true #000000 or near-true-black as the dominant background — these are the ones that benefit from AMOLED pixel shutdown. Dark wallpapers may use deep navy, charcoal, or dark grey which still light the pixels at reduced intensity. The Shadow World focuses on true black, not just dark." },
        { q: "Will these wallpapers show burn-in on AMOLED screens?", a: "Static wallpapers carry some theoretical burn-in risk on any AMOLED screen over extremely long exposure periods, but modern AMOLED panels use pixel shifting and refresh patterns to mitigate this. Using true-black wallpapers actually reduces this risk compared to static bright-colour wallpapers, since pixels displaying black are off rather than running at constant brightness." },
      ],
    },
  },
} as const;

type WorldKey = keyof typeof WORLDS;

const PAGE_SIZE = 24;

export async function generateMetadata(
  { params }: { params: Promise<{ color: string }> }
): Promise<Metadata> {
  const { color } = await params;
  const world = WORLDS[color as WorldKey];
  if (!world) return { title: "Not Found" };

  return {
    title: `${world.label} World — Dark Wallpapers | Haunted Wallpapers`,
    description: world.desc + " Free dark wallpapers for iPhone and Android.",
    openGraph: {
      title: `${world.label} World | Haunted Wallpapers`,
      description: world.desc,
    },
  };
}

export default async function WorldPage({
  params,
  searchParams,
}: {
  params: Promise<{ color: string }>;
  searchParams: Promise<{ page?: string; device?: string }>;
}) {
  const { color } = await params;
  const { page: rawPage, device: rawDevice } = await searchParams;

  const world = WORLDS[color as WorldKey];
  if (!world) notFound();

  const page   = Math.max(1, parseInt(rawPage ?? "1", 10) || 1);
  const device = rawDevice === "android" ? "android" : rawDevice === "iphone" ? "iphone" : "";
  const skip   = (page - 1) * PAGE_SIZE;

  const deviceFilter =
    device === "iphone"  ? { deviceType: "IPHONE"  as const } :
    device === "android" ? { deviceType: "ANDROID" as const } :
    { deviceType: { in: ["IPHONE" as const, "ANDROID" as const] } };

  const tagConditions = (world.tags as unknown as string[]).map((t) => ({
    tags: { has: t },
  }));

  const titleConditions = world.titleWords.map((w) => ({
    title: { contains: w, mode: "insensitive" as const },
  }));

  const where = {
    isAdult: false,
    ...deviceFilter,
    OR: [
      ...tagConditions,
      ...titleConditions,
    ],
  };

  const [images, total] = await Promise.all([
    db.image.findMany({
      where,
      orderBy: [{ viewCount: "desc" }, { createdAt: "desc" }],
      skip,
      take: PAGE_SIZE,
      select: {
        id:         true,
        slug:       true,
        title:      true,
        r2Key:      true,
        deviceType: true,
        tags:       true,
      },
    }),
    db.image.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const baseUrl    = `/world/${color}${device ? `?device=${device}` : ""}`;

  const accent    = world.accent;
  const bg        = world.bg;
  const bgDeep    = world.bgDeep;
  const border    = world.border;
  const borderHi  = world.borderHi;
  const glow      = world.glow;
  const text      = world.text;
  const textMuted = world.textMuted;

  const { content } = world;

  return (
    <>
      <WorldTheme color={color} />

      <style>{`
        .world-page * {
          animation: none !important;
          box-shadow: none !important;
          text-shadow: none !important;
        }
        .world-page a, .world-page button {
          transition: color 0.15s, border-color 0.15s, background 0.15s, opacity 0.15s !important;
        }

        .world-page {
          background: ${bgDeep};
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* ── Hero ── */
        .world-hero {
          background: ${bg};
          border-bottom: 1px solid ${border};
          padding: 60px 24px 44px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .world-hero__line {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, ${accent}, transparent);
        }
        .world-eyebrow {
          font-family: 'Courier New', monospace;
          font-size: 0.78rem;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: ${accent};
          margin-bottom: 14px;
          display: block;
        }
        .world-title {
          font-family: var(--font-cinzel, serif);
          font-size: clamp(2rem, 5vw, 3.6rem);
          font-weight: 900;
          color: ${text};
          line-height: 1.1;
          margin: 0 0 14px;
        }
        .world-desc {
          font-family: var(--font-cormorant, Georgia, serif);
          font-size: 1.05rem;
          font-style: italic;
          color: ${textMuted};
          max-width: 480px;
          margin: 0 auto 28px;
          line-height: 1.65;
        }
        .world-stats {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          border: 1px solid ${border};
          width: fit-content;
          margin: 0 auto;
        }
        .world-stat {
          padding: 10px 20px;
          border-right: 1px solid ${border};
          font-family: 'Courier New', monospace;
          font-size: 0.72rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: ${textMuted};
          text-align: center;
        }
        .world-stat:last-child { border-right: none; }
        .world-stat strong {
          display: block;
          font-family: var(--font-cinzel, serif);
          font-size: 0.95rem;
          color: ${accent};
          margin-bottom: 2px;
          font-weight: 700;
        }
        .world-back {
          position: absolute;
          top: 18px;
          left: 20px;
          font-family: 'Courier New', monospace;
          font-size: 0.76rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: ${textMuted};
          text-decoration: none;
        }
        .world-back:hover { color: ${accent}; }

        /* ── Filter bar ── */
        .world-filter-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px 24px;
          border-bottom: 1px solid ${border};
          background: ${bg};
          flex-wrap: wrap;
          overflow-x: hidden;
        }
        .world-filter-label {
          font-family: 'Courier New', monospace;
          font-size: 0.72rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: ${textMuted};
        }
        .world-filter-pill {
          font-family: 'Courier New', monospace;
          font-size: 0.78rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: ${textMuted};
          border: 1px solid ${border};
          padding: 7px 16px;
          min-height: 34px;
          display: inline-flex;
          align-items: center;
          text-decoration: none;
          background: transparent;
          white-space: nowrap;
        }
        .world-filter-pill:hover {
          color: ${text};
          border-color: ${borderHi};
        }
        .world-filter-pill.active {
          color: ${text};
          border-color: ${accent};
          background: ${glow.replace("0.35", "0.12")};
        }

        /* ── Grid ── */
        .world-grid-wrap {
          padding: 24px;
          background: ${bgDeep};
        }
        @media (max-width: 600px) {
          .world-grid-wrap { padding: 12px; }
          .world-filter-bar { padding: 12px; }
          .world-hero { padding: 52px 16px 32px; }
          .world-stats { flex-wrap: wrap; }
        }

        .world-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        @media (max-width: 1279px) { .world-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 767px)  { .world-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; } }
        @media (max-width: 400px)  { .world-grid { grid-template-columns: repeat(2, 1fr); gap: 6px; } }

        .world-card {
          display: block;
          text-decoration: none;
          position: relative;
          overflow: hidden;
          border: 1px solid ${border};
          background: #080808;
          width: 100%;
        }
        .world-card:hover { border-color: ${borderHi}; }

        .world-card-img {
          position: relative;
          width: 100%;
          aspect-ratio: 9 / 16;
          overflow: hidden;
          background: #0a0a0a;
        }

        .world-card-cap {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.9) 35%);
          padding: 28px 10px 10px;
        }
        @media (hover: hover) {
          .world-card-cap { opacity: 0; }
          .world-card:hover .world-card-cap { opacity: 1; }
        }
        .world-card-title {
          font-family: var(--font-cormorant, Georgia, serif);
          font-size: 0.85rem;
          font-style: italic;
          color: #f0f0f0;
          line-height: 1.3;
          display: block;
        }
        .world-card-device {
          font-family: 'Courier New', monospace;
          font-size: 0.68rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: ${accent};
          margin-top: 2px;
          display: block;
        }

        /* ── Empty state ── */
        .world-empty {
          padding: 80px 24px;
          text-align: center;
        }
        .world-empty-title {
          font-family: var(--font-cinzel, serif);
          font-size: 1.3rem;
          color: ${text};
          margin-bottom: 10px;
        }
        .world-empty-sub {
          font-family: var(--font-cormorant, serif);
          font-style: italic;
          color: ${textMuted};
          font-size: 1rem;
        }

        /* ── Other worlds nav ── */
        .world-nav {
          padding: 40px 24px;
          border-top: 1px solid ${border};
          background: ${bg};
          text-align: center;
        }
        .world-nav-label {
          font-family: 'Courier New', monospace;
          font-size: 0.74rem;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: ${textMuted};
          margin-bottom: 18px;
          display: block;
        }
        .world-nav-dots {
          display: flex;
          gap: 20px;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
        }
        .world-nav-dot {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          text-decoration: none;
        }
        .world-nav-dot:hover { opacity: 0.75; }
        .world-nav-dot-circle {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.12);
        }
        .world-nav-dot-label {
          font-family: 'Courier New', monospace;
          font-size: 0.70rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
        }
        .world-nav-dot--active .world-nav-dot-circle {
          border-color: ${accent};
        }
        .world-nav-dot--active .world-nav-dot-label { color: ${accent}; }

        /* ── Rich content section ── */
        .world-content {
          background: ${bg};
          border-top: 1px solid ${border};
          padding: clamp(40px, 6vw, 80px) clamp(20px, 5vw, 60px);
          max-width: 860px;
          margin: 0 auto;
        }
        .world-content-section {
          margin-bottom: 56px;
        }
        .world-content-section:last-child {
          margin-bottom: 0;
        }
        .world-content-heading {
          font-family: var(--font-cinzel, serif);
          font-size: clamp(1rem, 2vw, 1.25rem);
          font-weight: 700;
          color: ${text};
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin: 0 0 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid ${border};
        }
        .world-content-p {
          font-family: var(--font-cormorant, Georgia, serif);
          font-size: clamp(1rem, 1.5vw, 1.1rem);
          line-height: 1.8;
          color: ${textMuted};
          margin: 0 0 16px;
        }
        .world-content-p:last-child { margin-bottom: 0; }

        /* Themes grid */
        .world-themes-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (max-width: 600px) {
          .world-themes-grid { grid-template-columns: 1fr; }
        }
        .world-theme-card {
          border: 1px solid ${border};
          padding: 18px 20px;
          background: ${bgDeep};
        }
        .world-theme-name {
          font-family: 'Courier New', monospace;
          font-size: 0.72rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: ${accent};
          margin: 0 0 8px;
          display: block;
        }
        .world-theme-desc {
          font-family: var(--font-cormorant, Georgia, serif);
          font-size: 0.95rem;
          line-height: 1.65;
          color: ${textMuted};
          margin: 0;
        }

        /* Device tips */
        .world-device-tip {
          border-left: 2px solid ${accent};
          padding: 16px 20px;
          background: ${bgDeep};
          font-family: var(--font-cormorant, Georgia, serif);
          font-size: 1rem;
          line-height: 1.75;
          color: ${textMuted};
        }

        /* FAQ */
        .world-faq-list {
          display: flex;
          flex-direction: column;
          gap: 0;
          border: 1px solid ${border};
        }
        .world-faq-item {
          border-bottom: 1px solid ${border};
        }
        .world-faq-item:last-child { border-bottom: none; }
        .world-faq-q {
          font-family: var(--font-cinzel, serif);
          font-size: 0.9rem;
          color: ${text};
          padding: 18px 20px;
          cursor: pointer;
          list-style: none;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }
        .world-faq-q::-webkit-details-marker { display: none; }
        .world-faq-q::after {
          content: '+';
          font-family: 'Courier New', monospace;
          font-size: 1.1rem;
          color: ${accent};
          flex-shrink: 0;
        }
        details[open] .world-faq-q::after { content: '−'; }
        .world-faq-a {
          font-family: var(--font-cormorant, Georgia, serif);
          font-size: 1rem;
          line-height: 1.75;
          color: ${textMuted};
          padding: 0 20px 18px;
        }
      `}</style>

      <div className="world-page">

        {/* ── Hero ── */}
        <section className="world-hero">
          <span className="world-hero__line" aria-hidden="true" />
          <Link href="/" className="world-back">← Back</Link>
          <span className="world-eyebrow">{world.eyebrow}</span>
          <h1 className="world-title">{world.label} World</h1>
          <p className="world-desc">{world.desc}</p>
          <div className="world-stats">
            <div className="world-stat">
              <strong>{total}</strong>
              Wallpapers
            </div>
            <div className="world-stat">
              <strong>Free</strong>
              Always
            </div>
            <div className="world-stat">
              <strong>4K</strong>
              Ready
            </div>
          </div>
        </section>

        {/* ── Device filter ── */}
        <nav className="world-filter-bar" aria-label="Filter by device">
          <span className="world-filter-label">Filter:</span>
          {[
            { label: "All",     value: "" },
            { label: "iPhone",  value: "iphone" },
            { label: "Android", value: "android" },
          ].map(({ label, value }) => (
            <Link
              key={value}
              href={value ? `/world/${color}?device=${value}` : `/world/${color}`}
              className={`world-filter-pill${device === value ? " active" : ""}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* ── Grid ── */}
        <div className="world-grid-wrap">
          {images.length === 0 ? (
            <div className="world-empty">
              <p className="world-empty-title">No wallpapers found in this world yet.</p>
              <p className="world-empty-sub">
                Try a different filter — or tag wallpapers with &ldquo;{world.tags[0]}&rdquo; in admin.
              </p>
            </div>
          ) : (
            <div className="world-grid">
              {images.map((img, idx) => {
                const dp =
                  img.deviceType === "IPHONE"  ? "iphone" :
                  img.deviceType === "ANDROID" ? "android" : null;
                if (!dp) return null;
                const href = `/${dp}/${img.slug}`;
                const url  = getPublicUrl(img.r2Key);
                return (
                  <Link key={img.id} href={href} className="world-card" prefetch={false}>
                    <div className="world-card-img">
                      <Image
                        src={url}
                        alt={img.title}
                        fill
                        loading={idx < 8 ? "eager" : "lazy"}
                        priority={idx < 4}
                        sizes="(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25vw"
                        style={{ objectFit: "cover" }}
                        unoptimized
                      />
                    </div>
                    <div className="world-card-cap">
                      <span className="world-card-title">{img.title}</span>
                      <span className="world-card-device">{dp}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div style={{ marginTop: "40px" }}>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                baseUrl={baseUrl}
              />
            </div>
          )}
        </div>

        {/* ── Other worlds nav ── */}
        <nav className="world-nav">
          <span className="world-nav-label">Other Worlds</span>
          <div className="world-nav-dots">
            {(Object.entries(WORLDS) as [WorldKey, typeof WORLDS[WorldKey]][]).map(([key, w]) => (
              <Link
                key={key}
                href={`/world/${key}`}
                className={`world-nav-dot${key === color ? " world-nav-dot--active" : ""}`}
                title={w.label}
                prefetch={false}
              >
                <span
                  className="world-nav-dot-circle"
                  style={{ background: w.dot }}
                />
                <span className="world-nav-dot-label">{w.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* ── Rich content — description, themes, device tips, FAQ ── */}
        <div className="world-content">

          {/* About this world */}
          <div className="world-content-section">
            <h2 className="world-content-heading">About the {world.label} World</h2>
            {content.intro.map((para, i) => (
              <p key={i} className="world-content-p">{para}</p>
            ))}
          </div>

          {/* Themes */}
          <div className="world-content-section">
            <h2 className="world-content-heading">What You Will Find Here</h2>
            <div className="world-themes-grid">
              {content.themes.map((theme) => (
                <div key={theme.name} className="world-theme-card">
                  <span className="world-theme-name">{theme.name}</span>
                  <p className="world-theme-desc">{theme.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Device tips */}
          <div className="world-content-section">
            <h2 className="world-content-heading">Display & Device Notes</h2>
            <div className="world-device-tip">{content.deviceTips}</div>
          </div>

          {/* FAQ */}
          <div className="world-content-section">
            <h2 className="world-content-heading">Questions</h2>
            <div className="world-faq-list">
              {content.faqs.map((faq) => (
                <details key={faq.q} className="world-faq-item">
                  <summary className="world-faq-q">{faq.q}</summary>
                  <div className="world-faq-a">{faq.a}</div>
                </details>
              ))}
            </div>
          </div>

        </div>

      </div>
    </>
  );
}

export function generateStaticParams() {
  return Object.keys(WORLDS).map((color) => ({ color }));
}