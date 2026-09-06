"use client";

// lib/cart-context.tsx
//
// Lightweight client-side cart. Persists to localStorage so it survives
// refreshes/tab-closes. No server/DB involvement — Paddle checkout will
// read straight out of this context when it's wired up, so nothing here
// needs to change when that lands.

import {
  createContext, useContext, useEffect, useMemo, useState, useCallback,
} from "react";
import type { JSX } from "react";

export interface CartItem {
  /** slug + variant uniquely identifies a line item, e.g. "forever-defiant-case::iPhone 15" */
  key: string;
  slug: string;
  name: string;
  variantLabel: string;
  variant: string;
  price: number;
  thumbnailUrl: string;
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "key" | "qty">, qty?: number) => void;
  removeItem: (key: string) => void;
  updateQty: (key: string, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "hw-cart";

export function CartProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage once, client-side only.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // corrupt/blocked storage — start with an empty cart
    }
    setHydrated(true);
  }, []);

  // Persist on every change, after initial hydration.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage full/blocked — cart just won't survive a refresh
    }
  }, [items, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, "key" | "qty">, qty = 1) => {
    const key = `${item.slug}::${item.variant}`;
    setItems(prev => {
      const existing = prev.find(i => i.key === key);
      if (existing) {
        return prev.map(i => i.key === key ? { ...i, qty: i.qty + qty } : i);
      }
      return [...prev, { ...item, key, qty }];
    });
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems(prev => prev.filter(i => i.key !== key));
  }, []);

  const updateQty = useCallback((key: string, qty: number) => {
    setItems(prev =>
      qty <= 0
        ? prev.filter(i => i.key !== key)
        : prev.map(i => i.key === key ? { ...i, qty } : i)
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(() => items.reduce((n, i) => n + i.qty, 0), [items]);
  const subtotal = useMemo(() => items.reduce((n, i) => n + i.price * i.qty, 0), [items]);

  const value = useMemo(
    () => ({ items, count, subtotal, addItem, removeItem, updateQty, clear }),
    [items, count, subtotal, addItem, removeItem, updateQty, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}