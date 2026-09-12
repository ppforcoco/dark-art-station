// app/shop/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import { sanitizeAdminHtml } from "@/lib/sanitize-html";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductDetailClient from "./ProductDetailClient";

export const revalidate = 0;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

async function getProduct(slug: string) {
  return db.product.findUnique({ where: { slug } });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product Not Found | HauntedWallpapers" };

  const title = `${product.name} — $${product.price.toFixed(2)} | HauntedWallpapers Shop`;
  const description = `${product.name} — digital ${product.category.toLowerCase()}. $${product.price.toFixed(2)}. Instant download after purchase.`;
  const image = product.thumbnailKey ? getPublicUrl(product.thumbnailKey) : undefined;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/shop/${slug}` },
    openGraph: {
      title, description, url: `${SITE_URL}/shop/${slug}`, siteName: "Haunted Wallpapers", type: "website",
      ...(image ? { images: [{ url: image, width: 1200, height: 1200, alt: product.name }] } : {}),
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product || !product.isPublished) notFound();

  const images = [product.thumbnailKey, ...product.galleryKeys]
    .filter(Boolean)
    .map(key => getPublicUrl(key));

  const descriptionHtml = sanitizeAdminHtml(product.descriptionHtml);

  // Digital good: no shipping, always "in stock" since there's nothing to
  // run out of. Note — the GSC "missing aggregateRating/review" warnings
  // are non-critical and unrelated to physical-vs-digital; they only go
  // away once real customer reviews exist and are added here.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: images,
    description: product.descriptionHtml.replace(/<[^>]+>/g, "").slice(0, 300),
    offers: {
      "@type": "Offer",
      price: product.price.toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/shop/${slug}`,
    },
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Shop", href: "/shop" },
        { label: product.name },
      ]} />

      <ProductDetailClient
        slug={product.slug}
        name={product.name}
        category={product.category}
        variantLabel={product.variantLabel}
        variants={product.variants}
        price={product.price}
        compareAtPrice={product.compareAtPrice}
        images={images}
        descriptionHtml={descriptionHtml}
      />
    </div>
  );
}