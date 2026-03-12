// components/RelatedWallpapers.tsx
// Displays a "You May Also Like" grid of related images.
// Server Component — no 'use client' needed.
// Data is fetched upstream (page.tsx) and passed as a prop.
// Reusable across shop/[slug]/[imageSlug], iphone/[slug], android/[slug], pc/[slug].

import Image from "next/image";
import Link from "next/link";
import { getPublicUrl } from "@/lib/r2";
import type { RelatedImage } from "@/lib/db";

interface Props {
  images: RelatedImage[];
  heading?: string;
}

export default function RelatedWallpapers({
  images,
  heading = "You May Also Like",
}: Props) {
  if (images.length === 0) return null;

  return (
    <section className="related-section">
      <div className="related-header">
        <span className="related-eyebrow">Related Art</span>
        <h2 className="related-title">{heading}</h2>
      </div>

      <div className="related-grid">
        {images.map((img) => {
          // Build the correct href depending on whether the image belongs to
          // a collection or is a standalone device wallpaper.
          const href = img.collectionSlug
            ? `/shop/${img.collectionSlug}/${img.slug}`
            : img.deviceType
              ? `/${img.deviceType.toLowerCase()}/${img.slug}`
              : `/shop`;

          return (
            <Link key={img.id} href={href} className="related-card">
              <div className="related-card-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getPublicUrl(img.r2Key)}
                  alt={img.title}
                  loading="lazy"
                />
              </div>
              <div className="related-card-cap">
                <span className="related-card-cap-title">{img.title}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}