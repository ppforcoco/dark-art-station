// app/obsessions/[slug]/page.tsx
// Redirects /obsessions/[slug] → /shop/[slug]
// All collection content lives under /shop/[slug]

import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ObsessionSlugRedirect({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/shop/${slug}`);
}