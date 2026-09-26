'use client';

import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'eclora-wishlist-v1';
const EMPTY: string[] = [];

// Same external-store pattern as the cart: localStorage read through
// useSyncExternalStore so server and client renders agree.
let ids: string[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function loadOnce(): string[] {
  if (loaded) return ids;
  loaded = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) ids = JSON.parse(raw) as string[];
  } catch {
    // unreadable storage: start empty
  }
  return ids;
}

function write(next: string[]) {
  ids = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  listeners.forEach((listener) => listener());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** Wishlist kept in the browser — no account needed. */
export function useWishlist() {
  const wishlist = useSyncExternalStore(subscribe, loadOnce, () => EMPTY);

  const toggle = useCallback((productId: string) => {
    write(ids.includes(productId) ? ids.filter((id) => id !== productId) : [...ids, productId]);
  }, []);

  return { wishlist, toggle };
}
