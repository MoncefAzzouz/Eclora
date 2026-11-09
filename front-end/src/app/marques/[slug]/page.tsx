'use client';

import React, { Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import ShopShell from '@/components/ShopShell';
import ShopPage from '@/components/ShopPage';
import { shopApi } from '@/lib/shop/api';
import { useCategories } from '@/lib/shop/catalog';
import { useAsyncData } from '@/lib/useAsyncData';

function BrandListing() {
  const { slug } = useParams<{ slug: string }>();
  const category = useSearchParams().get('categorie') ?? undefined;
  const categories = useCategories();
  const { data: brand, error } = useAsyncData(() => shopApi.brand(slug), [slug]);
  // Which categories this brand has products in, for the chips.
  const { data: used } = useAsyncData(async () => {
    const res = await shopApi.products({ brand: slug, limit: 500 });
    return new Set(res.products.map((p) => p.categorySlug));
  }, [slug]);

  if (error) return <p className="px-4 py-16 text-center text-sm text-gray-500">{error}</p>;
  if (!brand) return <p className="px-4 py-16 text-center text-sm text-gray-500">Chargement...</p>;

  const brandCategories = categories.filter((c) => used?.has(c.slug));
  const chips = brandCategories.length > 1
    ? [
        { label: 'Tous les produits', href: `/marques/${slug}`, active: !category },
        ...brandCategories.map((c) => ({ label: c.name, href: `/marques/${slug}?categorie=${c.slug}`, active: c.slug === category })),
      ]
    : [];

  return (
    <ShopPage
      title={brand.name}
      eyebrow="Marque"
      description={brand.description ?? `Tous les produits ${brand.name} disponibles chez ECLORA.`}
      visual={
        brand.logoUrl ? (
          <div className="hidden h-24 w-24 flex-shrink-0 items-center justify-center rounded-2xl bg-white p-3 sm:flex sm:h-28 sm:w-28">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={brand.logoUrl} alt="" className="max-h-full max-w-full object-contain" />
          </div>
        ) : undefined
      }
      breadcrumbs={[{ label: 'Accueil', href: '/' }, { label: 'Nos Marques', href: '/marques' }, { label: brand.name }]}
      query={{ brand: slug, category }}
      chips={chips}
      hideBrandFilter
      emptyMessage={`Les produits ${brand.name} arrivent bientôt.`}
    />
  );
}

export default function BrandPage() {
  return (
    <ShopShell>
      <Suspense fallback={<p className="px-4 py-16 text-center text-sm text-gray-500">Chargement...</p>}>
        <BrandListing />
      </Suspense>
    </ShopShell>
  );
}
