import { notFound } from 'next/navigation';
import ShopShell from '@/components/ShopShell';
import ProductContent from '@/components/product/ProductContent';
import { toProduct, type ApiProduct } from '@/lib/shop/api';

// Read current prices, availability and admin edits from the local API.
// Product information and its photo are in the HTML before JavaScript runs.
export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const origin = (process.env.API_INTERNAL_URL ?? 'http://127.0.0.1:4000').replace(/\/api\/?$/, '').replace(/\/$/, '');
  const response = await fetch(`${origin}/api/shop/products/${encodeURIComponent(id)}`, {
    cache: 'no-store',
    signal: AbortSignal.timeout(5000),
  });
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error(`Product API returned ${response.status}`);
  const product = toProduct(await response.json() as ApiProduct);

  return <ShopShell><ProductContent key={product.id} product={product} /></ShopShell>;
}
