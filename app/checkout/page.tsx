"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import Breadcrumbs from "@/components/Breadcrumbs";

export const dynamic = "force-static";

export default function CheckoutPage() {
  const { items, subtotal } = useCart();
  const [email, setEmail] = useState("");

  // ── PADDLE INTEGRATION POINT ────────────────────────────────────────────
  // Once Paddle is connected: call Paddle.Checkout.open({ items: [...] })
  // here, built from `items` in the cart. Until then this button is a
  // clearly-labeled placeholder so nothing looks broken to a real visitor.
  function handlePayPlaceholder() {
    alert("Paddle checkout isn't connected yet — this is a placeholder.");
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Shop", href: "/shop" },
        { label: "Cart", href: "/cart" },
        { label: "Checkout" },
      ]} />

      <section className="max-w-3xl mx-auto px-6 md:px-[60px] py-10">
        <h1 className="font-display text-3xl font-bold mb-8">Checkout</h1>

        {items.length === 0 ? (
          <div>
            <p style={{ color: "#8a809a", marginBottom: "16px" }}>Your cart is empty.</p>
            <Link href="/shop" style={{ color: "#c9a84c" }}>← Back to Shop</Link>
          </div>
        ) : (
          <>
            <div style={{ border: "1px solid #2a2535", padding: "20px", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "14px" }}>Order Summary</h2>
              {items.map(item => (
                <div key={item.key} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", padding: "6px 0", color: "#c8c2d8" }}>
                  <span>{item.name} ({item.variant}) × {item.qty}</span>
                  <span>${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #2a2535", marginTop: "12px", paddingTop: "12px", fontWeight: 700 }}>
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label htmlFor="checkout-email" style={{ display: "block", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#8a809a", marginBottom: "8px" }}>
                Email for order confirmation
              </label>
              <input
                id="checkout-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: "100%", background: "#0a0812", border: "1px solid #2a2535",
                  color: "#e8e4f8", padding: "12px 14px", fontSize: "0.9rem",
                }}
              />
            </div>

            <button
              onClick={handlePayPlaceholder}
              style={{
                width: "100%", padding: "16px 24px", background: "#c0001a", color: "#fff",
                border: "none", fontFamily: "var(--font-space,monospace)", fontSize: "0.8rem",
                letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer",
              }}
            >
              Pay with Paddle
            </button>
            <p style={{ fontSize: "0.7rem", color: "#6b6480", marginTop: "10px", textAlign: "center" }}>
              Paddle checkout isn&apos;t connected yet — this button is a placeholder.
            </p>
          </>
        )}
      </section>
    </div>
  );
}