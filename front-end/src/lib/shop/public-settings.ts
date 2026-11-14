import 'server-only';
import type { ShopSettings } from './api';

/** Fresh public content so an admin save is visible on the next page visit. */
export async function loadPublicSettings(): Promise<ShopSettings | undefined> {
  const origin = (process.env.API_INTERNAL_URL ?? 'http://127.0.0.1:4000').replace(/\/api\/?$/, '').replace(/\/$/, '');
  try {
    const response = await fetch(`${origin}/api/shop/settings`, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
    if (!response.ok) return undefined;
    return await response.json() as ShopSettings;
  } catch {
    return undefined;
  }
}
