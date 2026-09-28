'use client';

import React, { createContext, useCallback, useContext, useState, useSyncExternalStore } from 'react';
import type { Product } from '@/data/products';

export interface CartLine {
  product: Product;
  quantity: number;
  shade?: string;
}

interface CartApi {
  items: CartLine[];
  /** Total number of units, for the header badge. */
  count: number;
  /** Subtotal in dinars. Recomputed server-side at checkout. */
  subtotal: number;
  add: (product: Product, shade?: string, quantity?: number) => void;
  updateQuantity: (productId: string, delta: number, shade?: string) => void;
  remove: (productId: string, shade?: string) => void;
  clear: () => void;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  /** False until the stored cart has been read on the client. */
  ready: boolean;
}

const STORAGE_KEY = 'eclora-cart-v1';
const EMPTY: CartLine[] = [];

// The cart lives in localStorage, which is an external store: reading it with
// useSyncExternalStore keeps server and client renders consistent.
let lines: CartLine[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function loadOnce(): CartLine[] {
  if (loaded) return lines;
  loaded = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) lines = JSON.parse(raw) as CartLine[];
  } catch {
    // unreadable storage: start empty
  }
  return lines;
}

function write(next: CartLine[]) {
  lines = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // storage full or blocked: cart stays in memory
  }
  listeners.forEach((listener) => listener());
}

const store = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => loadOnce(),
  getServerSnapshot: () => EMPTY,
};

/** "8 500 DA" → 8500. Prices are strings in the component layer. */
export function priceToNumber(price: string): number {
  return Number(price.replace(/[^\d]/g, '')) || 0;
}

function sameLine(line: CartLine, productId: string, shade?: string) {
  return line.product.id === productId && (line.shade ?? '') === (shade ?? '');
}

const CartContext = createContext<CartApi | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const [isOpen, setOpen] = useState(false);

  const add = useCallback((product: Product, shade?: string, quantity = 1) => {
    const existing = lines.find((l) => sameLine(l, product.id, shade));
    write(
      existing
        ? lines.map((l) => (sameLine(l, product.id, shade) ? { ...l, quantity: l.quantity + quantity } : l))
        : [...lines, { product, quantity, shade }]
    );
    setOpen(true);
  }, []);

  const updateQuantity = useCallback((productId: string, delta: number, shade?: string) => {
    write(
      lines
        .map((l) => (sameLine(l, productId, shade) ? { ...l, quantity: l.quantity + delta } : l))
        .filter((l) => l.quantity > 0)
    );
  }, []);

  const remove = useCallback((productId: string, shade?: string) => {
    write(lines.filter((l) => !sameLine(l, productId, shade)));
  }, []);

  const clear = useCallback(() => write([]), []);

  const value: CartApi = {
    items,
    count: items.reduce((sum, l) => sum + l.quantity, 0),
    subtotal: items.reduce((sum, l) => sum + priceToNumber(l.product.price) * l.quantity, 0),
    add,
    updateQuantity,
    remove,
    clear,
    isOpen,
    setOpen,
    ready: loaded,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartApi {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
