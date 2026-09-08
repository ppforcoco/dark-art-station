"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import Breadcrumbs from "@/components/Breadcrumbs";

export const dynamic = "force-static";

export default function CartPage() {
  const { items, subtotal, updateQty, removeItem } = useCart();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Shop", href: "/shop" },
        { label: "Cart" },
      ]} />

      <section className="max-w-4xl mx-auto px-6 md:px-[60px] py-10">
        <h1 className="font-display text-3xl font-bold mb-8">Your Cart</h1>

        {items.length === 0 ? (
          <div className="hw-coming-soon" style={{ marginTop: "20px" }}>
            <div className="hw-coming-soon__sigil">✦ ☽ ✦</div>
            <h2 className="hw-coming-soon__title">Your cart is empty</h2>
            <p className="hw-coming-soon__sub" style={{ marginBottom: "20px" }}>
              Haunt your pockets and your walls.
            </p>
            <Link
              href="/shop"
              style={{
                display: "inline-block", padding: "12px 28px", background: "#ff2e9e",
                color: "#fff", fontFamily: "var(--font-space,monospace)", fontSize: "0.75rem",
                letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none",
              }}
            >
              Browse the Shop
            </Link>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" }}>
              {items.map(item => (
                <div
                  key={item.key}
                  style={{
                    display: "flex", gap: "16px", alignItems: "center",
                    border: "1px solid #341a63", padding: "14px",
                  }}
                >
                  <div style={{ position: "relative", width: "64px", aspectRatio: "9 / 16", flexShrink: 0, background: "#0e0820" }}>
                    {item.thumbnailUrl && (
                      <Image src={item.thumbnailUrl} alt={item.name} fill className="object-cover" sizes="64px" />
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, marginBottom: "4px" }}>{item.name}</div>
                    <div style={{ fontSize: "0.8rem", color: "#af98cf" }}>
                      {item.variantLabel}: {item.variant}
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "#ffd23f", marginTop: "4px" }}>
                      ${item.price.toFixed(2)}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button
                      onClick={() => updateQty(item.key, item.qty - 1)}
                      aria-label="Decrease quantity"
                      style={{ width: "28px", height: "28px", background: "#150a2a", border: "1px solid #341a63", color: "#f3e8ff", cursor: "pointer" }}
                    >
                      −
                    </button>
                    <span style={{ minWidth: "20px", textAlign: "center" }}>{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.key, item.qty + 1)}
                      aria-label="Increase quantity"
                      style={{ width: "28px", height: "28px", background: "#150a2a", border: "1px solid #341a63", color: "#f3e8ff", cursor: "pointer" }}
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.key)}
                    aria-label={`Remove ${item.name}`}
                    style={{ background: "none", border: "none", color: "#8670b3", cursor: "pointer", fontSize: "0.8rem", textDecoration: "underline" }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              borderTop: "1px solid #341a63", paddingTop: "20px",
            }}>
              <div>
                <div style={{ fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#af98cf" }}>Subtotal</div>
                <div style={{ fontSize: "1.4rem", fontWeight: 700 }}>${subtotal.toFixed(2)}</div>
              </div>
              <Link
                href="/checkout"
                style={{
                  padding: "14px 32px", background: "#ff2e9e", color: "#fff",
                  fontFamily: "var(--font-space,monospace)", fontSize: "0.75rem",
                  letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none",
                }}
              >
                Checkout →
              </Link>
            </div>
          </>
        )}
      </section>
    </div>
  );
}