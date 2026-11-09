'use client';

// The logged-in customer, shared by every page (header, checkout, /compte).
// The token lives in localStorage; the profile is fetched once and cached here.
import { useEffect, useSyncExternalStore } from 'react';
import { customerToken, setCustomerToken, shopApi, ShopApiError, type Customer } from './api';

type State = { customer: Customer | null; ready: boolean };

let state: State = { customer: null, ready: false };
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();
const SERVER_STATE: State = { customer: null, ready: false };

function set(next: State) {
  state = next;
  listeners.forEach((l) => l());
}

function load(): Promise<void> {
  if (loading) return loading;
  if (!customerToken()) {
    set({ customer: null, ready: true });
    return Promise.resolve();
  }
  loading = shopApi
    .me()
    .then((customer) => set({ customer, ready: true }))
    .catch((e) => {
      // Expired or revoked: forget it. A network error keeps the token for later.
      if (e instanceof ShopApiError && e.status === 401) setCustomerToken(null);
      set({ customer: null, ready: true });
    })
    .finally(() => {
      loading = null;
    });
  return loading;
}

export function signIn(token: string, customer: Customer) {
  setCustomerToken(token);
  set({ customer, ready: true });
}

export function signOut() {
  setCustomerToken(null);
  set({ customer: null, ready: true });
}

export function updateCustomer(customer: Customer) {
  set({ customer, ready: true });
}

export function useCustomer() {
  const snapshot = useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => SERVER_STATE
  );

  useEffect(() => {
    if (!state.ready) void load();
    // Logging in or out in another tab.
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'eclora-customer-token') {
        state = { customer: null, ready: false };
        void load();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return snapshot;
}
