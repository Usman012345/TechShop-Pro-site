"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  productId: string;
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  add: (productId: string, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "techshop_cart_v1";

function safeParseCart(raw: string | null): CartItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((x) => {
        const obj = x as any;
        const productId = typeof obj?.productId === "string" ? obj.productId : "";
        const qtyNum = typeof obj?.qty === "number" ? obj.qty : Number(obj?.qty);
        const qty = Number.isFinite(qtyNum) ? Math.floor(qtyNum) : 0;
        return { productId, qty };
      })
      .filter((x) => x.productId && x.qty > 0);
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load from localStorage
  useEffect(() => {
    const loaded = safeParseCart(localStorage.getItem(STORAGE_KEY));
    setItems(loaded);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, x) => sum + x.qty, 0);

    function add(productId: string, qty = 1) {
      const n = Number.isFinite(qty) ? Math.max(1, Math.floor(qty)) : 1;
      setItems((prev) => {
        const idx = prev.findIndex((x) => x.productId === productId);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], qty: next[idx].qty + n };
          return next;
        }
        return [...prev, { productId, qty: n }];
      });
    }

    function remove(productId: string) {
      setItems((prev) => prev.filter((x) => x.productId !== productId));
    }

    function setQty(productId: string, qty: number) {
      const n = Number.isFinite(qty) ? Math.floor(qty) : 0;
      setItems((prev) => {
        if (n <= 0) return prev.filter((x) => x.productId !== productId);
        const idx = prev.findIndex((x) => x.productId === productId);
        if (idx < 0) return prev;
        const next = [...prev];
        next[idx] = { ...next[idx], qty: n };
        return next;
      });
    }

    function clear() {
      setItems([]);
    }

    return { items, count, add, remove, setQty, clear };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
