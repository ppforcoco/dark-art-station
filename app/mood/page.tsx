// app/mood/page.tsx
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import MoodClient from "./MoodClient";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Mood Wallpapers — Find Your Vibe | Haunted Wallpapers",
  description:
    "Don't browse by category — browse by feeling. Paranoid, Melancholy, Powerful, Aggressive, Quiet, and 10 more psychological states. Find the wallpaper that matches your inner world.",
  openGraph: {
    title: "Mood Wallpapers — Find Your Vibe",
    description: "15 psychological moods. Each pulls dark art that matches your state of mind right now.",
    type: "website",
  },
};

// ── Mood definitions ──────────────────────────────────────────────────────────
// Each mood maps to tags on your images. hasSome — any ≥1 tag match shows up.
export const MOODS = [
  {
    id:       "paranoid",
    label:    "Paranoid",
    glyph:    "👁",
    desc:     "Something is watching. It knows your schedule.",
    color:    "#c0001a",
    gradient: "radial-gradient(ellipse at 50% 0%, rgba(192,0,26,0.18) 0%, transparent 65%)",
    tags:     ["paranoid", "eye", "surveillance", "watching", "horror", "shadow", "ghost", "creepy", "unsettling"],
  },
  {
    id:       "melancholy",
    label:    "Melancholy",
    glyph:    "🌧",
    desc:     "Beautiful sadness. The kind that feels like home.",
    color:    "#5b7fa6",
    gradient: "radial-gradient(ellipse at 50% 0%, rgba(91,127,166,0.15) 0%, transparent 65%)",
    tags:     ["melancholy", "rain", "sad", "lonely", "fog", "mist", "dark", "moody", "atmospheric", "noir", "blue"],
  },
  {
    id:       "powerful",
    label:    "Powerful",
    glyph:    "⚡",
    desc:     "You didn't survive this far to be small.",
    color:    "#c9a84c",
    gradient: "radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.15) 0%, transparent 65%)",
    tags:     ["powerful", "demon", "warrior", "fire", "lightning", "dragon", "god", "dark-fantasy", "epic", "crimson", "amoled"],
  },
  {
    id:       "aggressive",
    label:    "Aggressive",
    glyph:    "🩸",
    desc:     "Raw energy. Unfiltered. Do not tap twice.",
    color:    "#ff2222",
    gradient: "radial-gradient(ellipse at 50% 0%, rgba(255,34,34,0.15) 0%, transparent 65%)",
    tags:     ["aggressive", "skull", "blood", "gore", "monster", "beast", "claws", "teeth", "villain", "chaos", "anger"],
  },
  {
    id:       "quiet",
    label:    "Quiet",
    glyph:    "🌙",
    desc:     "Still. Empty. A room after everyone has left.",
    color:    "#8888bb",
    gradient: "radial-gradient(ellipse at 50% 0%, rgba(136,136,187,0.12) 0%, transparent 65%)",
    tags:     ["quiet", "minimal", "minimalist", "moon", "space", "void", "dark", "night", "calm", "silhouette", "black"],
  },
  {
    id:       "haunted",
    label:    "Haunted",
    glyph:    "🕯",
    desc:     "You carry something old with you. It won't leave.",
    color:    "#d4a847",
    gradient: "radial-gradient(ellipse at 50% 0%, rgba(212,168,71,0.14) 0%, transparent 65%)",
    tags:     ["haunted", "ghost", "spirit", "candle", "graveyard", "gothic", "Victorian", "specter", "wraith", "apparition"],
  },
  {
    id:       "obsessed",
    label:    "Obsessed",
    glyph:    "🔁",
    desc:     "One thought. Looping. You can't stop.",
    color:    "#9b30d0",
    gradient: "radial-gradient(ellipse at 50% 0%, rgba(155,48,208,0.15) 0%, transparent 65%)",
    tags:     ["obsessed", "spiral", "loop", "hypnotic", "surreal", "glitch", "distorted", "trance", "ritual"],
  },
  {
    id:       "cold",
    label:    "Cold",
    glyph:    "❄️",
    desc:     "Frozen inside. No warmth. No apologies.",
    color:    "#60b8d8",
    gradient: "radial-gradient(ellipse at 50% 0%, rgba(96,184,216,0.13) 0%, transparent 65%)",
    tags:     ["cold", "ice", "winter", "frost", "snow", "frozen", "pale", "arctic", "blizzard", "tundra"],
  },
  {
    id:       "violent",
    label:    "Violent",
    glyph:    "💀",
    desc:     "The darkness that isn't poetic. It just is.",
    color:    "#cc2200",
    gradient: "radial-gradient(ellipse at 50% 0%, rgba(204,34,0,0.16) 0%, transparent 65%)",
    tags:     ["violent", "skull", "death", "gore", "brutal", "war", "destruction", "carnage", "reaper"],
  },
  {
    id:       "dreaming",
    label:    "Dreaming",
    glyph:    "🌌",
    desc:     "Half asleep. The edges of reality softening.",
    color:    "#7060c8",
    gradient: "radial-gradient(ellipse at 50% 0%, rgba(112,96,200,0.15) 0%, transparent 65%)",
    tags:     ["dreaming", "dream", "cosmic", "galaxy", "nebula", "surreal", "psychedelic", "ethereal", "astral", "fantasy"],
  },
  {
    id:       "isolated",
    label:    "Isolated",
    glyph:    "🏚",
    desc:     "Alone is different from lonely. This is both.",
    color:    "#6a7a6a",
    gradient: "radial-gradient(ellipse at 50% 0%, rgba(106,122,106,0.13) 0%, transparent 65%)",
    tags:     ["isolated", "abandoned", "ruin", "empty", "alone", "desolate", "wasteland", "post-apocalyptic", "decayed"],
  },
  {
    id:       "feral",
    label:    "Feral",
    glyph:    "🐺",
    desc:     "Something primal just woke up behind your eyes.",
    color:    "#c87820",
    gradient: "radial-gradient(ellipse at 50% 0%, rgba(200,120,32,0.14) 0%, transparent 65%)",
    tags:     ["feral", "wolf", "beast", "animal", "primal", "hunt", "predator", "wilderness", "creature", "teeth", "claws"],
  },
  {
    id:       "glitching",
    label:    "Glitching",
    glyph:    "📡",
    desc:     "Reality keeps buffering. Error. Error. Error.",
    color:    "#00d4aa",
    gradient: "radial-gradient(ellipse at 50% 0%, rgba(0,212,170,0.12) 0%, transparent 65%)",
    tags:     ["glitch", "glitching", "digital", "cyber", "cyberpunk", "neon", "corruption", "error", "matrix", "vaporwave"],
  },
  {
    id:       "sinister",
    label:    "Sinister",
    glyph:    "🎭",
    desc:     "Everything is fine. That's the problem.",
    color:    "#c030c0",
    gradient: "radial-gradient(ellipse at 50% 0%, rgba(192,48,192,0.14) 0%, transparent 65%)",
    tags:     ["sinister", "villain", "evil", "clown", "mask", "smile", "dread", "uncanny", "wrong", "disturbing"],
  },
  {
    id:       "mythic",
    label:    "Mythic",
    glyph:    "🐉",
    desc:     "Ancient. Vast. You are not the main character.",
    color:    "#e8c060",
    gradient: "radial-gradient(ellipse at 50% 0%, rgba(232,192,96,0.14) 0%, transparent 65%)",
    tags:     ["mythic", "myth", "dragon", "titan", "eldritch", "elder", "god", "cosmic", "ancient", "legendary", "kraken"],
  },
] as const;

export type MoodId = (typeof MOODS)[number]["id"];

export interface MoodImage {
  id:         string;
  slug:       string;
  title:      string;
  url:        string;
  deviceType: string | null;
  tags:       string[];
}

export default async function MoodPage() {
  const results = await Promise.all(
    MOODS.map(async (mood) => {
      const images = await db.image.findMany({
        where: {
          isAdult: false,
          tags:    { hasSome: mood.tags as unknown as string[] },
        },
        orderBy: [{ viewCount: "desc" }, { createdAt: "desc" }],
        take: 48,
        select: {
          id:         true,
          slug:       true,
          title:      true,
          r2Key:      true,
          deviceType: true,
          tags:       true,
        },
      });

      const moodImages: MoodImage[] = images.map((img) => ({
        id:         img.id,
        slug:       img.slug,
        title:      img.title,
        url:        getPublicUrl(img.r2Key),
        deviceType: img.deviceType,
        tags:       img.tags,
      }));

      return { moodId: mood.id, images: moodImages };
    })
  );

  const imagesByMood = Object.fromEntries(
    results.map(({ moodId, images }) => [moodId, images])
  ) as Record<MoodId, MoodImage[]>;

  return <MoodClient moods={MOODS} imagesByMood={imagesByMood} />;
}