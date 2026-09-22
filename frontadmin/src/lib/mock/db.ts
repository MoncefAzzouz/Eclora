// In-browser mock database, persisted to localStorage so edits survive a refresh.
// Only used by src/lib/api — swap that layer for real HTTP calls when the backend is ready.
import * as seed from './seed';

const STORAGE_KEY = 'eclora-admin-db-v1';

function createSeed() {
  return structuredClone({
    products: seed.seedProducts,
    categories: seed.seedCategories,
    brands: seed.seedBrands,
    orders: seed.seedOrders,
    clients: seed.seedClients,
    reviews: seed.seedReviews,
    banners: seed.seedBanners,
    homeSections: seed.seedHomeSections,
    promoCodes: seed.seedPromoCodes,
    shippingRates: seed.seedShippingRates,
    settings: seed.seedSettings,
    admins: seed.seedAdmins,
  });
}

export type MockDB = ReturnType<typeof createSeed>;

let cache: MockDB | null = null;

export function db(): MockDB {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) cache = JSON.parse(raw) as MockDB;
  } catch {
    // ignore corrupt or unavailable storage
  }
  cache ??= createSeed();
  return cache;
}

export function commit(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // storage full or blocked: keep in memory only
  }
}

export function resetDB(): void {
  cache = createSeed();
  commit();
}

/** Simulated network latency so loading states are exercised. */
export function delay<T>(value: T, ms = 180): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), ms));
}
