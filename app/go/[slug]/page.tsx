import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function VanityRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const vanity = await db.vanityRedirect.findUnique({
    where: { slug },
  });

  if (!vanity) notFound();

  // Fire-and-forget click increment
  db.vanityRedirect
    .update({
      where: { slug },
      data: { clicks: { increment: 1 } },
    })
    .catch(() => {});

  redirect(vanity.destination);
}