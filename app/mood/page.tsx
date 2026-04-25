// app/mood/page.tsx
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import MoodClient from "./MoodClient";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Mood Wallpapers — Find Your Vibe | Haunted Wallpapers",
  description:
    "Don't browse by category — browse by feeling. Paranoid, Melancholy, Powerful, Aggressive, or Quiet. Find the wallpaper that matches your psychological state.",
  openGraph: {
    title: "Mood Wallpapers — Find Your Vibe",
    description: "Browse 5 psychological vibes. Each mood pulls dark art that matches your state of mind.",
    type: "website",
  },
};

// ── Mood definitions ──────────────────────────────────────────────────────────
// Each mood maps to a set of tags that exist (or could exist) on your images.
// The query does hasSome — any image with ≥1 matching tag shows up.
// Add more tags to a mood to pull more images. Add these tags in the admin panel.
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
] as const;

export type MoodId = (typeof MOODS)[number]["id"];

// ── Image type ────────────────────────────────────────────────────────────────
export interface MoodImage {
  id:         string;
  slug:       string;
  title:      string;
  url:        string;
  deviceType: string | null;
  tags:       string[];
}

export default async function MoodPage() {
  // Fetch all moods in parallel — each mood gets up to 24 images
  const results = await Promise.all(
    MOODS.map(async (mood) => {
      const images = await db.image.findMany({
        where: {
          isAdult: false,
          tags:    { hasSome: mood.tags as unknown as string[] },
        },
        orderBy: [{ viewCount: "desc" }, { createdAt: "desc" }],
        take: 24,
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

  // Build a map: moodId → images
  const imagesByMood = Object.fromEntries(
    results.map(({ moodId, images }) => [moodId, images])
  ) as Record<MoodId, MoodImage[]>;

  return <MoodClient moods={MOODS} imagesByMood={imagesByMood} />;
}