'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import ShopShell from '@/components/ShopShell';
import { useAllBrands } from '@/lib/shop/catalog';

export default function BrandsPage() {
  const brands = useAllBrands();
  const [query, setQuery] = useState('');
  const shown = useMemo(
    () => brands.filter((b) => b.name.toLowerCase().includes(query.trim().toLowerCase())),
    [brands, query]
  );

  return (
    <ShopShell>
      <div className="mx-auto max-w-[1440px] px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        <nav className="mb-3 text-xs text-gray-500">
          <Link href="/" className="hover:text-black">Accueil</Link> / <span className="font-bold text-black">Nos Marques</span>
        </nav>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Nos Marques</h1>
            <p className="mt-2 text-sm text-gray-600">
              {brands.length > 0 ? `${brands.length} marques de soin, beauté et maquillage disponibles chez ECLORA.` : 'Chargement des marques...'}
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Chercher une marque"
              aria-label="Chercher une marque"
              className="w-full rounded-full border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-black"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
          {shown.map((b) => (
            <Link
              key={b.id}
              href={`/marques/${b.slug}`}
              className="group flex flex-col items-center rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-gray-400 hover:shadow-md"
            >
              <div className="flex h-28 w-full items-center justify-center sm:h-32">
                {b.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.logoUrl} alt={b.name} loading="lazy" className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105" />
                ) : (
                  <span className="text-center text-xl font-black tracking-wider">{b.name}</span>
                )}
              </div>
              <span className="mt-3 text-center text-sm font-extrabold uppercase tracking-wide">{b.name}</span>
              <span className="text-xs text-gray-500">
                {b.count > 0 ? `${b.count} produit${b.count > 1 ? 's' : ''}` : 'Bientôt disponible'}
              </span>
            </Link>
          ))}
        </div>
        {brands.length > 0 && shown.length === 0 && (
          <p className="py-16 text-center text-sm text-gray-500">Aucune marque ne correspond à « {query} ».</p>
        )}
      </div>
    </ShopShell>
  );
}
