"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";

interface Props {
  slug: string;
  name: string;
  category: string;
  variantLabel: string;
  variants: string[];
  price: number;
  compareAtPrice: number | null;
  images: string[];
  descriptionHtml: string;
}

export default function ProductDetailClient({
  slug, name, category, variantLabel, variants, price, compareAtPrice, images, descriptionHtml,
}: Props) {
  const { addItem } = useCart();
  const router = useRouter();
  const [selectedVariant, setSelectedVariant] = useState(variants[0] ?? "");
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);

  const mainImage = images[activeImage] ?? images[0] ?? null;

  function handleAddToCart() {
    addItem({
      slug, name, variantLabel,
      variant: selectedVariant,
      price,
      thumbnailUrl: images[0] ?? "",
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  function handleBuyNow() {
    handleAddToCart();
    router.push("/cart");
  }

  return (
    <section className="max-w-6xl mx-auto px-6 md:px-[60px] py-8 grid grid-cols-1 md:grid-cols-2 gap-10">
      {/* ── Gallery ── */}
      <div>
        <div style={{
          position: "relative", width: "100%", aspectRatio: "9 / 16",
          background: mainImage ? "transparent" : "radial-gradient(at 60% 30%, #2d0838, #0e0820)",
          overflow: "hidden",
        }}>
          {mainImage ? (
            <Image src={mainImage} alt={name} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 480px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[3rem]">🖤</div>
          )}
        </div>
        {images.length > 1 && (
          <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
            {images.map((img, i) => (
              <button
                key={img}
                onClick={() => setActiveImage(i)}
                aria-label={`View image ${i + 1}`}
                style={{
                  width: "56px", aspectRatio: "9 / 16", position: "relative",
                  border: i === activeImage ? "2px solid #c9a84c" : "1px solid #2a2535",
                  overflow: "hidden", cursor: "pointer", padding: 0, background: "none",
                }}
              >
                <Image src={img} alt="" fill className="object-cover" sizes="56px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Info ── */}
      <div>
        <span style={{
          fontFamily: "var(--font-space,monospace)", fontSize: "0.6rem",
          letterSpacing: "0.2em", textTransform: "uppercase", color: "#8a809a",
        }}>
          {category}
        </span>
        <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight" style={{ margin: "8px 0 16px" }}>
          {name}
        </h1>

        <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "24px" }}>
          <span style={{ fontSize: "1.6rem", fontWeight: 700, color: "#f0ecff" }}>${price.toFixed(2)}</span>
          {compareAtPrice && compareAtPrice > price && (
            <span style={{ textDecoration: "line-through", opacity: 0.5 }}>${compareAtPrice.toFixed(2)}</span>
          )}
        </div>

        {variants.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <label
              htmlFor="variant-select"
              style={{
                display: "block", fontFamily: "var(--font-space,monospace)",
                fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase",
                color: "#8a809a", marginBottom: "8px",
              }}
            >
              {variantLabel}
            </label>
            <select
              id="variant-select"
              value={selectedVariant}
              onChange={e => setSelectedVariant(e.target.value)}
              style={{
                width: "100%", maxWidth: "320px", background: "#0a0812",
                border: "1px solid #2a2535", color: "#e8e4f8",
                padding: "12px 14px", fontSize: "0.9rem", fontFamily: "var(--font-space,monospace)",
              }}
            >
              {variants.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        )}

        <div style={{ display: "flex", gap: "12px", marginBottom: "32px", flexWrap: "wrap" }}>
          <button
            onClick={handleBuyNow}
            style={{
              flex: "1 1 200px", padding: "16px 24px",
              background: "#c0001a", color: "#fff", border: "none",
              fontFamily: "var(--font-space,monospace)", fontSize: "0.75rem",
              letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer",
            }}
          >
            Buy Now
          </button>
          <button
            onClick={handleAddToCart}
            style={{
              flex: "1 1 160px", padding: "16px 24px",
              background: "transparent", color: "#e8e4f8", border: "1px solid #2a2535",
              fontFamily: "var(--font-space,monospace)", fontSize: "0.75rem",
              letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer",
            }}
          >
            {added ? "Added ✓" : "Add to Cart"}
          </button>
        </div>

        {descriptionHtml && (
          <div
            className="blog-html-content"
            style={{ color: "#c8c2d8", lineHeight: 1.7, fontSize: "0.92rem" }}
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />
        )}
      </div>
    </section>
  );
}