'use client';

// Main menu. Categories and their subcategories come from the database (admin →
// Catégories), so adding a subcategory there adds it here. Hovering a category
// on desktop opens its panel; on phones the bar scrolls sideways and a tap
// opens the category page, where the subcategories appear as chips.
import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useAllBrands, useCategories } from '@/lib/shop/catalog';

const BRANDS_KEY = '__brands';

export default function CategoryNav() {
  const categories = useCategories();
  const brands = useAllBrands();
  const [active, setActive] = useState<string | null>(null);

  const activeCategory = categories.find((c) => c.slug === active);
  const close = () => setActive(null);

  return (
    <nav className="relative z-30 border-b border-gray-200 bg-white shadow-2xs" onMouseLeave={close}>
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <ul className="no-scrollbar flex items-center gap-6 overflow-x-auto whitespace-nowrap py-3.5 text-[14px] font-medium text-black lg:gap-8">
          {categories.map((cat) => (
            <li key={cat.id} onMouseEnter={() => setActive(cat.slug)}>
              <Link
                href={`/shop/${cat.slug}`}
                onClick={close}
                className={`inline-block border-b-2 pb-1 uppercase tracking-[0.04em] transition-colors ${
                  active === cat.slug ? 'border-black' : 'border-transparent hover:text-gray-600'
                } ${cat.badgeColor === 'PINK' ? 'text-[#d80075]' : cat.badgeColor === 'RED' ? 'text-[#d32f2f]' : ''}`}
                style={{ fontFamily: 'var(--font-avantgarde)', fontWeight: 500 }}
              >
                {cat.name}
              </Link>
            </li>
          ))}
          <li onMouseEnter={() => setActive(BRANDS_KEY)}>
            <Link
              href="/marques"
              onClick={close}
              className={`inline-block border-b-2 pb-1 uppercase tracking-[0.04em] transition-colors ${
                active === BRANDS_KEY ? 'border-black' : 'border-transparent hover:text-gray-600'
              }`}
              style={{ fontFamily: 'var(--font-avantgarde)', fontWeight: 500 }}
            >
              Nos Marques
            </Link>
          </li>
        </ul>
      </div>

      {activeCategory && (
        <div className="absolute inset-x-0 top-full z-50 hidden animate-fade-in border-b border-gray-200 bg-white py-8 shadow-2xl md:block">
          <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-8 px-4 sm:px-6 lg:px-8">
            <div className="col-span-3 border-r border-gray-100 pr-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">{activeCategory.description}</p>
              <h3 className="mt-1 text-2xl font-black">{activeCategory.name}</h3>
              <Link
                href={`/shop/${activeCategory.slug}`}
                onClick={close}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-xs font-bold text-white transition hover:bg-neutral-800"
              >
                Voir tout <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <ul className="col-span-9 grid grid-cols-3 content-start gap-x-8 gap-y-3 text-sm">
              {activeCategory.subcategories.map((sub) => (
                <li key={sub.id}>
                  <Link
                    href={`/shop/${activeCategory.slug}?sub=${sub.slug}`}
                    onClick={close}
                    className="text-gray-700 transition-colors hover:text-black hover:underline"
                  >
                    {sub.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {active === BRANDS_KEY && brands.length > 0 && (
        <div className="absolute inset-x-0 top-full z-50 hidden animate-fade-in border-b border-gray-200 bg-white py-8 shadow-2xl md:block">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-5 gap-3 lg:grid-cols-9">
              {brands.map((b) => (
                <Link
                  key={b.id}
                  href={`/marques/${b.slug}`}
                  onClick={close}
                  title={b.name}
                  className="flex h-20 items-center justify-center rounded-xl border border-gray-100 p-3 transition hover:border-gray-300 hover:shadow-sm"
                >
                  {b.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.logoUrl} alt={b.name} className="max-h-full max-w-full object-contain" loading="lazy" />
                  ) : (
                    <span className="text-center text-xs font-black tracking-wide">{b.name}</span>
                  )}
                </Link>
              ))}
            </div>
            <Link href="/marques" onClick={close} className="mt-5 inline-flex items-center gap-2 text-sm font-bold hover:underline">
              Toutes nos marques <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
