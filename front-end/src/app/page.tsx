import HomePage from '@/components/HomePage';
import { CatalogProvider } from '@/lib/shop/catalog';
import type { ApiBrand, ApiCategory, HomePayload } from '@/lib/shop/api';

// Fetch current public content at request time so admin edits stay fresh and
// the browser discovers the correct images in the initial HTML.
export const dynamic = 'force-dynamic';

async function loadPublicData<T>(path: string): Promise<T | undefined> {
  const origin = (process.env.API_INTERNAL_URL ?? 'http://127.0.0.1:4000').replace(/\/api\/?$/, '').replace(/\/$/, '');
  try {
    const response = await fetch(`${origin}/api/shop/${path}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Shop API returned ${response.status}`);
    return await response.json() as T;
  } catch {
    // During an API outage, the client can retry without breaking the page.
    return undefined;
  }
}

export default async function Page() {
  const [home, categories, brands] = await Promise.all([
    loadPublicData<HomePayload>('home'),
    loadPublicData<ApiCategory[]>('categories'),
    loadPublicData<ApiBrand[]>('brands?all=1'),
  ]);
  return (
    <CatalogProvider categories={categories} brands={brands}>
      <HomePage initialData={home ?? null} />
    </CatalogProvider>
  );
}
