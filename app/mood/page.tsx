// app/mood/page.tsx
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import MoodClient from "./MoodClient";
import { MOODS } from "./moods";
import type { MoodId, MoodImage } from "./moods";
import Breadcrumbs from "@/components/Breadcrumbs";

export const revalidate = 3600;

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

export default async function MoodPage() {
  const results = await Promise.all(
    MOODS.map(async (mood) => {
      const images = await db.image.findMany({
        where: {
          isAdult: false,
          // exclude PC wallpapers — mood page is phone-first
          deviceType: { in: ["IPHONE", "ANDROID"] },
          tags: mood.tags.length > 0
            ? { hasSome: mood.tags as unknown as string[] }
            : undefined,
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

  return (
    <>
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Mood" },
      ]} />
      <MoodClient moods={MOODS} imagesByMood={imagesByMood} />
    </>
  );
}