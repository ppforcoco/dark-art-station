"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import Breadcrumbs from "@/components/Breadcrumbs";

export const dynamic = "force-static";

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#150a2a", border: "1px solid #341a63",
  color: "#f3e8ff", padding: "12px 14px", fontSize: "0.9rem", boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.7rem", letterSpacing: "0.1em",
  textTransform: "uppercase", color: "#af98cf", marginBottom: "8px",
};

interface ShippingForm {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postCode: string;
  state: string;
  country: string;
  phone: string;
}

const emptyShipping: ShippingForm = {
  firstName: "", lastName: "", addressLine1: "", addressLine2: "",
  city: "", postCode: "", state: "", country: "US", phone: "",
};

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const [email, setEmail] = useState("");
  const [shipping, setShipping] = useState<ShippingForm>(emptyShipping);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<{ orderId: string; orderNumber: string } | null>(null);

  function setField<K extends keyof ShippingForm>(key: K, value: ShippingForm[K]) {
    setShipping(prev => ({ ...prev, [key]: value }));
  }

  // ── PADDLE INTEGRATION POINT ────────────────────────────────────────────
  // Once Paddle is connected: after create-order succeeds below, call
  // Paddle.Checkout.open({ ..., customData: { orderId: order.orderId } })
  // instead of showing the placeholder alert. A webhook on Paddle's end
  async function handleSubmit() {
    setError(null);

    if (!email.trim()) { setError("Enter an email for order confirmation."); return; }
    if (!shipping.firstName.trim() || !shipping.lastName.trim()) { setError("Enter your full name."); return; }
    if (!shipping.addressLine1.trim() || !shipping.city.trim() || !shipping.postCode.trim() || !shipping.country.trim()) {
      setError("Fill in your full shipping address.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          items: items.map(i => ({ slug: i.slug, variant: i.variant, qty: i.qty })),
          ...shipping,
        }),
      });
      const j = await res.json();
      if (!res.ok) {
        setError(j.error ?? "Something went wrong creating your order.");
        setSubmitting(false);
        return;
      }
      setOrder({ orderId: j.orderId, orderNumber: j.orderNumber });
      clear();
    } catch {
      setError("Network error — please try again.");
    }
    setSubmitting(false);
  }

  if (order) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>
        <Breadcrumbs items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: "Checkout" },
        ]} />
        <section className="max-w-3xl mx-auto px-6 md:px-[60px] py-16 text-center">
          <p style={{ color: "#ffd23f", fontSize: "0.7rem", letterSpacing: "0.2em", marginBottom: "10px" }}>
            ORDER #{order.orderNumber}
          </p>
          <h1 className="font-display text-3xl font-bold mb-4">Order saved</h1>
          <p style={{ color: "#af98cf", maxWidth: "480px", margin: "0 auto 24px" }}>
            Your order has been recorded. Payment isn&apos;t connected yet, so nothing has
            been charged — this is a placeholder step until Paddle checkout is wired up.
          </p>
          <Link href="/shop" style={{ color: "#ffd23f" }}>← Back to Shop</Link>
        </section>
      </div>
    );
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
            <p style={{ color: "#af98cf", marginBottom: "16px" }}>Your cart is empty.</p>
            <Link href="/shop" style={{ color: "#ffd23f" }}>← Back to Shop</Link>
          </div>
        ) : (
          <>
            <div style={{ border: "1px solid #341a63", padding: "20px", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "14px" }}>Order Summary</h2>
              {items.map(item => (
                <div key={item.key} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", padding: "6px 0", color: "#c8c2d8" }}>
                  <span>{item.name} ({item.variant}) × {item.qty}</span>
                  <span>${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #341a63", marginTop: "12px", paddingTop: "12px", fontWeight: 700 }}>
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label htmlFor="checkout-email" style={labelStyle}>Email for order confirmation</label>
              <input
                id="checkout-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={inputStyle}
              />
            </div>

            <div style={{ border: "1px solid #341a63", padding: "20px", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "14px" }}>Shipping Address</h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                <div>
                  <label style={labelStyle}>First Name</label>
                  <input style={inputStyle} value={shipping.firstName} onChange={e => setField("firstName", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Last Name</label>
                  <input style={inputStyle} value={shipping.lastName} onChange={e => setField("lastName", e.target.value)} />
                </div>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={labelStyle}>Address Line 1</label>
                <input style={inputStyle} value={shipping.addressLine1} onChange={e => setField("addressLine1", e.target.value)} />
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label style={labelStyle}>Address Line 2 (optional)</label>
                <input style={inputStyle} value={shipping.addressLine2} onChange={e => setField("addressLine2", e.target.value)} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                <div>
                  <label style={labelStyle}>City</label>
                  <input style={inputStyle} value={shipping.city} onChange={e => setField("city", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>State / Region</label>
                  <input style={inputStyle} value={shipping.state} onChange={e => setField("state", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Post Code</label>
                  <input style={inputStyle} value={shipping.postCode} onChange={e => setField("postCode", e.target.value)} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={labelStyle}>Country (2-letter code)</label>
                  <input style={inputStyle} value={shipping.country} maxLength={2} onChange={e => setField("country", e.target.value.toUpperCase())} placeholder="US" />
                </div>
                <div>
                  <label style={labelStyle}>Phone (optional)</label>
                  <input style={inputStyle} value={shipping.phone} onChange={e => setField("phone", e.target.value)} />
                </div>
              </div>
            </div>

            {error && (
              <p style={{ color: "#ff6b6b", fontSize: "0.82rem", marginBottom: "16px" }}>{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                width: "100%", padding: "16px 24px", background: "#ff2e9e", color: "#fff",
                border: "none", fontFamily: "var(--font-space,monospace)", fontSize: "0.8rem",
                letterSpacing: "0.15em", textTransform: "uppercase", cursor: submitting ? "not-allowed" : "pointer",
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? "Saving order…" : "Pay with Paddle"}
            </button>
            <p style={{ fontSize: "0.7rem", color: "#8670b3", marginTop: "10px", textAlign: "center" }}>
              Paddle checkout isn&apos;t connected yet — this saves your order but doesn&apos;t charge you.
            </p>
          </>
        )}
      </section>
    </div>
  );
}