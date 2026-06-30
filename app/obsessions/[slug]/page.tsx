// app/obsessions/[slug]/page.tsx
// Redirects /obsessions/[slug] → /collections/[slug]

import { redirect } from "next/navigation";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ObsessionSlugRedirect({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/collections/${slug}`);
}