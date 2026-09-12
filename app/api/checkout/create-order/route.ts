// app/api/checkout/create-order/route.ts
//
// Creates a "pending" Order record from the customer's cart. This is the
// step BEFORE payment — nothing is charged here. Once Paddle is connected,
// its checkout will reference this order's id/orderNumber, and a webhook
// will flip paymentStatus to "paid" when Paddle confirms the charge.
//
// Prices and product/variant validity are re-checked against the database
// here rather than trusted from the client, since cart contents are just
// localStorage on the customer's browser and could be edited before this
// request is sent.
//
// These are digital goods — there's no shipping address, just an email for
// the confirmation. Since Paddle isn't wired up yet, we generate signed
// download links immediately so the flow can be tested end-to-end. Once
// real payment is connected, gate this download-link generation behind
// `paymentStatus === "paid"` (e.g. only return links once a webhook has
// confirmed the charge) instead of handing them out at order-creation time.

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSignedDownloadUrl } from "@/lib/r2";

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

function safeFileName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60) || "download";
}

export async function POST(req: NextRequest) {
  let body: {
    email?: string;
    items?: IncomingItem[];
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request body." }, { status: 400 });
  }

  const { email, items } = body;

  // ── Basic required-field validation ──
  const missing: string[] = [];
  if (!email?.trim()) missing.push("email");
  if (!items?.length) missing.push("items");
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
    digitalFileKey: string;
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
    if (!product.digitalFileKey) {
      return NextResponse.json(
        { error: `"${product.name}" has no download file yet — please check back soon.` },
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
      digitalFileKey: product.digitalFileKey,
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
        },
      });

      // Digital delivery: sign a time-limited download URL per line item.
      // TODO(paddle): once real payment is wired up, only generate these
      // after a webhook confirms paymentStatus === "paid".
      const downloads = await Promise.all(
        resolvedItems.map(async item => ({
          slug: item.slug,
          name: item.name,
          variant: item.variant,
          url: await getSignedDownloadUrl(
            item.digitalFileKey,
            60 * 30, // 30 minutes
            `${safeFileName(item.name)}.zip`
          ),
        }))
      );

      return NextResponse.json({
        orderId: order.id,
        orderNumber: order.orderNumber,
        downloads,
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