// lib/gelato.ts
//
// This is the file that actually talks to Gelato. Nothing here runs
// automatically yet — it's just the function. We wire it to fire after
// a real payment in a later step, once Paddle is connected.
//
// What it does, in plain terms:
//   1. Takes an order (customer, address, what they bought)
//   2. Looks up the correct Gelato product UID for each item's variant
//   3. Sends one request to Gelato with links to your print files
//   4. Gelato fetches those files themselves, prints, and ships
//   5. Returns Gelato's own order ID so you can look up status later

import { getGelatoProductUid } from "./gelato-catalog";

const GELATO_API_URL = "https://order.gelatoapis.com/v4/orders";

export interface GelatoOrderItem {
  /** Your own internal id for this line item, e.g. cart item key */
  itemReferenceId: string;
  /** Product category as stored on your Product model, e.g. "Phone Case" */
  category: string;
  /** The variant the customer picked, e.g. "iPhone 14" */
  variant: string;
  /** Public URL to the print-ready file (printFileKey via getPublicUrl) */
  printFileUrl: string;
  quantity: number;
}

export interface GelatoShippingAddress {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postCode: string;
  state?: string;
  country: string; // 2-letter ISO code, e.g. "US"
  email: string;
  phone?: string;
}

export interface CreateGelatoOrderInput {
  /** Your own order id from your database — lets you match Gelato's order back to yours */
  orderReferenceId: string;
  customerReferenceId: string;
  currency: string; // e.g. "USD"
  items: GelatoOrderItem[];
  shippingAddress: GelatoShippingAddress;
}

export class GelatoOrderError extends Error {
  constructor(message: string, public details?: unknown) {
    super(message);
    this.name = "GelatoOrderError";
  }
}

/**
 * Creates a real production order with Gelato. Throws GelatoOrderError if
 * any item can't be mapped to a Gelato product, or if Gelato's API rejects
 * the request — callers should catch this and NOT mark the order as
 * fulfilled if it throws.
 */
export async function createGelatoOrder(input: CreateGelatoOrderInput) {
  const apiKey = process.env.GELATO_API_KEY;
  if (!apiKey) {
    throw new GelatoOrderError("GELATO_API_KEY is not set on the server");
  }

  // Resolve every item's variant to a real Gelato product UID first.
  // If ANY item can't be mapped, we refuse to send the order at all —
  // better to fail loudly here than ship an order missing an item.
  const resolvedItems = input.items.map(item => {
    const productUid = getGelatoProductUid(item.category, item.variant);
    if (!productUid) {
      throw new GelatoOrderError(
        `No Gelato product UID mapped for category "${item.category}" + variant "${item.variant}". ` +
        `Add it to lib/gelato-catalog.ts before this order can be fulfilled.`
      );
    }
    return {
      itemReferenceId: item.itemReferenceId,
      productUid,
      quantity: item.quantity,
      files: [{ type: "default", url: item.printFileUrl }],
    };
  });

  const body = {
    orderType: "order",
    orderReferenceId: input.orderReferenceId,
    customerReferenceId: input.customerReferenceId,
    currency: input.currency,
    items: resolvedItems,
    shippingAddress: input.shippingAddress,
  };

  const res = await fetch(GELATO_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": apiKey,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new GelatoOrderError(
      `Gelato rejected the order (status ${res.status})`,
      data
    );
  }

  // data.id is Gelato's own order id — save this on your Order record
  // so you can look up print/shipping status later.
  return data as { id: string; fulfillmentStatus: string; financialStatus: string; [key: string]: unknown };
}
