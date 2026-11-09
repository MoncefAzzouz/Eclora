'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ShopShell from '@/components/ShopShell';
import ShopPage from '@/components/ShopPage';

function SearchListing() {
  const q = (useSearchParams().get('q') ?? '').trim();
  if (!q) {
    return <p className="px-4 py-16 text-center text-sm text-gray-500">Tapez un produit ou une marque dans la barre de recherche.</p>;
  }
  return (
    <ShopPage
      title={`« ${q} »`}
      eyebrow="Résultats de recherche"
      breadcrumbs={[{ label: 'Accueil', href: '/' }, { label: 'Recherche' }]}
      query={{ q }}
      emptyMessage={`Aucun produit ne correspond à « ${q} ». Essayez un autre mot ou une marque.`}
    />
  );
}

export default function SearchPage() {
  return (
    <ShopShell>
      <Suspense fallback={<p className="px-4 py-16 text-center text-sm text-gray-500">Chargement...</p>}>
        <SearchListing />
      </Suspense>
    </ShopShell>
  );
}
