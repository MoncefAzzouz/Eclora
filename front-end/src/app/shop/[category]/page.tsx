'use client';

import React, { Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import ShopShell from '@/components/ShopShell';
import ShopPage from '@/components/ShopPage';
import { useCategories } from '@/lib/shop/catalog';

function CategoryListing() {
  const { category: slug } = useParams<{ category: string }>();
  const sub = useSearchParams().get('sub') ?? undefined;
  const categories = useCategories();
  const category = categories.find((c) => c.slug === slug);
  const subcategory = category?.subcategories.find((s) => s.slug === sub);

  const chips = category
    ? [
        { label: 'Tout voir', href: `/shop/${slug}`, active: !sub },
        ...category.subcategories.map((s) => ({ label: s.name, href: `/shop/${slug}?sub=${s.slug}`, active: s.slug === sub })),
      ]
    : [];

  return (
    <ShopPage
      title={subcategory?.name ?? category?.name ?? ''}
      eyebrow={subcategory ? category?.name : undefined}
      description={subcategory ? undefined : category?.description}
      breadcrumbs={[
        { label: 'Accueil', href: '/' },
        ...(category ? [{ label: category.name, href: subcategory ? `/shop/${slug}` : undefined }] : []),
        ...(subcategory ? [{ label: subcategory.name }] : []),
      ]}
      query={{ category: slug, subcategory: sub }}
      chips={chips}
      emptyMessage="Les produits de cette catégorie arrivent bientôt."
    />
  );
}

export default function ShopCategoryPage() {
  return (
    <ShopShell>
      <Suspense fallback={<p className="px-4 py-16 text-center text-sm text-gray-500">Chargement...</p>}>
        <CategoryListing />
      </Suspense>
    </ShopShell>
  );
}
