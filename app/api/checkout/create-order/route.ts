// app/api/checkout/create-order/route.ts
//
// Creates a "pending" Order record from the customer's cart + shipping form.
// This is the step BEFORE payment — nothing is charged here. Once Paddle is
// connected, its checkout will reference this order's id/orderNumber, and a
// webhook will flip paymentStatus to "paid" when Paddle confirms the charge.
//
// Prices and product/variant validity are re-checked against the database
// here rather than trusted from the client, since cart contents are just
// localStorage on the customer's browser and could be edited before this
// request is sent.

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface IncomingItem {
  slug: string;
  variant: string;
  qty: number;
}

function generateOrderNumber(): string {
  // e.g. "HW-L3F9K2" — short, unique enough with the DB @unique as a backstop.
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `HW-${rand}`;
}

export async function POST(req: NextRequest) {
  let body: {
    email?: string;
    items?: IncomingItem[];
    firstName?: string;
    lastName?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    postCode?: string;
    state?: string;
    country?: string;
    phone?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request body." }, { status: 400 });
  }

  const {
    email, items,
    firstName, lastName, addressLine1, addressLine2,
    city, postCode, state, country, phone,
  } = body;

  // ── Basic required-field validation ──
  const missing: string[] = [];
  if (!email?.trim()) missing.push("email");
  if (!items?.length) missing.push("items");
  if (!firstName?.trim()) missing.push("firstName");
  if (!lastName?.trim()) missing.push("lastName");
  if (!addressLine1?.trim()) missing.push("addressLine1");
  if (!city?.trim()) missing.push("city");
  if (!postCode?.trim()) missing.push("postCode");
  if (!country?.trim()) missing.push("country");
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required field(s): ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  // ── Re-fetch each product from the DB and validate price + variant ──
  // so a tampered cart can't check out at the wrong price or with a
  // variant that doesn't exist / isn't published.
  const resolvedItems: Array<{
    slug: string; name: string; category: string;
    variant: string; variantLabel: string;
    price: number; qty: number; thumbnailKey: string;
  }> = [];

  for (const item of items!) {
    if (!item.slug || !item.variant || !item.qty || item.qty < 1) {
      return NextResponse.json({ error: "Invalid item in cart." }, { status: 400 });
    }
    const product = await db.product.findUnique({ where: { slug: item.slug } });
    if (!product || !product.isPublished) {
      return NextResponse.json(
        { error: `"${item.slug}" is no longer available.` },
        { status: 400 }
      );
    }
    if (!product.variants.includes(item.variant)) {
      return NextResponse.json(
        { error: `"${item.variant}" is not a valid option for "${product.name}".` },
        { status: 400 }
      );
    }
    resolvedItems.push({
      slug: product.slug,
      name: product.name,
      category: product.category,
      variant: item.variant,
      variantLabel: product.variantLabel,
      price: product.price, // server price wins, never trust client-sent price
      qty: item.qty,
      thumbnailKey: product.thumbnailKey,
    });
  }

  const subtotal = resolvedItems.reduce((sum, i) => sum + i.price * i.qty, 0);

  // ── Create the order, retrying on the rare orderNumber collision ──
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const order = await db.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          email: email!.trim(),
          items: resolvedItems,
          currency: "USD",
          subtotal,
          firstName: firstName!.trim(),
          lastName: lastName!.trim(),
          addressLine1: addressLine1!.trim(),
          addressLine2: addressLine2?.trim() || null,
          city: city!.trim(),
          postCode: postCode!.trim(),
          state: state?.trim() || null,
          country: country!.trim().toUpperCase(),
          phone: phone?.trim() || null,
        },
      });
      return NextResponse.json({
        orderId: order.id,
        orderNumber: order.orderNumber,
      });
    } catch (err: unknown) {
      const isUniqueClash = typeof err === "object" && err !== null && "code" in err && err.code === "P2002";
      if (isUniqueClash && attempt < 4) continue; // retry with a fresh orderNumber
      console.error("Order creation failed:", err);
      return NextResponse.json({ error: "Could not create order." }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Could not create order." }, { status: 500 });
}
