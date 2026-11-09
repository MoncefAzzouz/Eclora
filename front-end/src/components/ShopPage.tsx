'use client';

// Product listing with filters, used by category pages, brand pages and search.
// The page's base query (category / subcategory / brand / text) is sent to the
// API once; brand, price, availability and sort are then applied instantly in
// the browser, with counts that match what is on screen.
import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { shopApi, toProduct, type ProductQuery } from '@/lib/shop/api';
import { useCart } from '@/lib/shop/cart';
import { useWishlist } from '@/lib/shop/wishlist';
import { useAsyncData } from '@/lib/useAsyncData';

export interface Chip {
  label: string;
  href: string;
  active: boolean;
}

interface ShopPageProps {
  title: string;
  eyebrow?: string;
  description?: string;
  /** Logo or other visual shown in the header band (brand pages). */
  visual?: React.ReactNode;
  breadcrumbs: { label: string; href?: string }[];
  query: ProductQuery;
  /** Sub-navigation above the grid: subcategories on a category page, categories on a brand page. */
  chips?: Chip[];
  /** Hide the brand filter on a brand's own page. */
  hideBrandFilter?: boolean;
  emptyMessage?: string;
}

type Sort = 'new' | 'price-asc' | 'price-desc' | 'rating' | 'name';
const SORTS: { value: Sort; label: string }[] = [
  { value: 'new', label: 'Nouveautés' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix décroissant' },
  { value: 'rating', label: 'Mieux notés' },
  { value: 'name', label: 'Nom A → Z' },
];

const PRICE_RANGES = [
  { label: 'Moins de 1 000 DA', min: 0, max: 999 },
  { label: '1 000 – 2 000 DA', min: 1000, max: 2000 },
  { label: '2 000 – 5 000 DA', min: 2000, max: 5000 },
  { label: 'Plus de 5 000 DA', min: 5000, max: Infinity },
];

export default function ShopPage({
  title,
  eyebrow,
  description,
  visual,
  breadcrumbs,
  query,
  chips,
  hideBrandFilter,
  emptyMessage = 'Aucun produit pour le moment.',
}: ShopPageProps) {
  const cart = useCart();
  const { wishlist, toggle: toggleWishlist } = useWishlist();
  const { data, loading, error } = useAsyncData(async () => {
    const res = await shopApi.products({ ...query, limit: 500 });
    return res.products.map(toProduct);
  }, [query]);

  const [brands, setBrands] = useState<string[]>([]);
  const [brandSearch, setBrandSearch] = useState('');
  const [range, setRange] = useState<number | null>(null);
  const [customMin, setCustomMin] = useState('');
  const [customMax, setCustomMax] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<Sort>('new');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const all = useMemo(() => data ?? [], [data]);

  const brandFacets = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of all) counts.set(p.brand, (counts.get(p.brand) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([name, count]) => ({ name, count }));
  }, [all]);

  const priceBounds = useMemo(() => {
    const min = customMin ? Number(customMin) : range !== null ? PRICE_RANGES[range]!.min : 0;
    const max = customMax ? Number(customMax) : range !== null ? PRICE_RANGES[range]!.max : Infinity;
    return { min, max };
  }, [range, customMin, customMax]);

  const shown = useMemo(() => {
    const list = all.filter(
      (p) =>
        (brands.length === 0 || brands.includes(p.brand)) &&
        (p.priceValue ?? 0) >= priceBounds.min &&
        (p.priceValue ?? 0) <= priceBounds.max &&
        (!inStockOnly || (p.stock ?? 1) > 0)
    );
    // Data arrives newest-first; available products stay ahead of sold-out ones.
    const sorted = [...list];
    if (sort === 'price-asc') sorted.sort((a, b) => (a.priceValue ?? 0) - (b.priceValue ?? 0));
    if (sort === 'price-desc') sorted.sort((a, b) => (b.priceValue ?? 0) - (a.priceValue ?? 0));
    if (sort === 'rating') sorted.sort((a, b) => b.rating - a.rating);
    if (sort === 'name') sorted.sort((a, b) => a.title.localeCompare(b.title));
    return sorted.sort((a, b) => Number((a.stock ?? 1) <= 0) - Number((b.stock ?? 1) <= 0));
  }, [all, brands, priceBounds, inStockOnly, sort]);

  const activeCount = brands.length + (range !== null || customMin || customMax ? 1 : 0) + (inStockOnly ? 1 : 0);
  const reset = () => {
    setBrands([]);
    setRange(null);
    setCustomMin('');
    setCustomMax('');
    setInStockOnly(false);
  };

  const filters = (
    <div className="space-y-6">
      {!hideBrandFilter && brandFacets.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-extrabold">Marques</h3>
          {brandFacets.length > 8 && (
            <div className="relative mb-3">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
              <input
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                placeholder="Chercher une marque"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          )}
          <div className="max-h-64 space-y-2.5 overflow-y-auto pr-1">
            {brandFacets
              .filter((b) => b.name.toLowerCase().includes(brandSearch.toLowerCase()))
              .map((b) => (
                <label key={b.name} className="flex cursor-pointer items-center justify-between gap-2 text-sm">
                  <span className="flex min-w-0 items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={brands.includes(b.name)}
                      onChange={() => setBrands((cur) => (cur.includes(b.name) ? cur.filter((x) => x !== b.name) : [...cur, b.name]))}
                      className="h-4 w-4 rounded border-gray-300 accent-black"
                    />
                    <span className="truncate font-semibold text-gray-800">{b.name}</span>
                  </span>
                  <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-500">{b.count}</span>
                </label>
              ))}
          </div>
        </section>
      )}

      <section>
        <h3 className="mb-3 text-sm font-extrabold">Prix</h3>
        <div className="space-y-2.5">
          {PRICE_RANGES.map((r, i) => (
            <label key={r.label} className="flex cursor-pointer items-center gap-2.5 text-sm">
              <input
                type="radio"
                name="price-range"
                checked={range === i && !customMin && !customMax}
                onChange={() => {
                  setRange(i);
                  setCustomMin('');
                  setCustomMax('');
                }}
                className="h-4 w-4 accent-black"
              />
              <span className="font-semibold text-gray-800">{r.label}</span>
            </label>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <input
            inputMode="numeric"
            value={customMin}
            onChange={(e) => setCustomMin(e.target.value.replace(/\D/g, ''))}
            placeholder="Min DA"
            aria-label="Prix minimum"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
          />
          <span className="text-gray-400">–</span>
          <input
            inputMode="numeric"
            value={customMax}
            onChange={(e) => setCustomMax(e.target.value.replace(/\D/g, ''))}
            placeholder="Max DA"
            aria-label="Prix maximum"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
          />
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-extrabold">Disponibilité</h3>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} className="h-4 w-4 accent-black" />
          <span className="font-semibold text-gray-800">En stock uniquement</span>
        </label>
      </section>
    </div>
  );

  const sortSelect = (
    <div className="relative">
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value as Sort)}
        aria-label="Trier par"
        className="cursor-pointer appearance-none rounded-xl border border-gray-300 bg-white px-4 py-2 pr-8 text-sm font-bold text-black outline-none focus:ring-1 focus:ring-black"
      >
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4" />
    </div>
  );

  const countLabel = loading && !data ? 'Chargement...' : `${shown.length} produit${shown.length > 1 ? 's' : ''}`;

  return (
    <div className="bg-white pb-24 text-black">
      <div className="mx-auto max-w-[1440px] px-4 pt-4 sm:px-6 lg:px-8">
        <nav className="mb-3 flex flex-wrap items-center gap-1.5 text-xs text-gray-500" aria-label="Fil d'Ariane">
          {breadcrumbs.map((b, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span>/</span>}
              {b.href ? (
                <Link href={b.href} className="hover:text-black">
                  {b.label}
                </Link>
              ) : (
                <span className="font-bold text-black">{b.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>

        <header className="mb-5 flex items-center gap-5 rounded-2xl bg-gradient-to-r from-[#f05b2a] to-[#faae3c] p-5 text-white sm:rounded-3xl sm:p-8">
          {visual}
          <div className="min-w-0">
            {eyebrow && <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/85">{eyebrow}</p>}
            <h1 className="text-2xl font-black tracking-tight sm:text-4xl">{title}</h1>
            {description && <p className="mt-1 max-w-3xl text-sm leading-relaxed text-white/95">{description}</p>}
          </div>
        </header>

        {chips && chips.length > 0 && (
          <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto pb-1 text-sm font-medium">
            {chips.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                scroll={false}
                className={`whitespace-nowrap rounded-2xl px-4 py-2.5 transition ${c.active ? 'bg-black text-white' : 'bg-[#faede5] text-black hover:bg-[#f5ded4]'}`}
              >
                {c.label}
              </Link>
            ))}
          </div>
        )}

        {/* Mobile: filters + sort */}
        <div className="mb-4 flex items-center justify-between gap-3 border-y border-gray-200 py-3 lg:hidden">
          <button onClick={() => setDrawerOpen(true)} className="flex items-center gap-2 text-sm font-bold">
            <SlidersHorizontal className="h-4 w-4" />
            Filtres
            {activeCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] text-white">{activeCount}</span>
            )}
          </button>
          {sortSelect}
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <aside className="hidden lg:col-span-3 lg:block">
            <div className="mb-5 flex items-center justify-between border-b border-gray-200 pb-3">
              <h2 className="text-xl font-black">Filtres</h2>
              {activeCount > 0 && (
                <button onClick={reset} className="text-xs font-bold text-gray-500 underline hover:text-black">
                  Réinitialiser
                </button>
              )}
            </div>
            {filters}
          </aside>

          <section className="lg:col-span-9">
            <div className="mb-5 flex items-center justify-between">
              <span className="text-sm font-extrabold">{countLabel}</span>
              <div className="hidden items-center gap-2 lg:flex">
                <span className="text-xs text-gray-500">Trier par</span>
                {sortSelect}
              </div>
            </div>

            {error && <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}

            {!loading && !error && shown.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-sm text-gray-500">{all.length > 0 ? 'Aucun produit ne correspond à ces filtres.' : emptyMessage}</p>
                {activeCount > 0 && (
                  <button onClick={reset} className="mt-4 rounded-full bg-black px-5 py-2.5 text-sm font-bold text-white">
                    Effacer les filtres
                  </button>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
              {shown.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isWishlisted={wishlist.includes(product.id)}
                  onToggleWishlist={toggleWishlist}
                  onAddToCart={(p) => cart.add(p)}
                />
              ))}
            </div>
          </section>
        </div>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex animate-fade-in flex-col bg-white lg:hidden" role="dialog" aria-modal="true" aria-label="Filtres">
          <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <h2 className="text-lg font-black">Filtres</h2>
            <button onClick={() => setDrawerOpen(false)} className="p-1" aria-label="Fermer">
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">{filters}</div>
          <div className="flex gap-3 border-t border-gray-200 p-4">
            {activeCount > 0 && (
              <button onClick={reset} className="rounded-xl border border-gray-300 px-4 py-3.5 text-sm font-bold">
                Effacer
              </button>
            )}
            <button onClick={() => setDrawerOpen(false)} className="flex-1 rounded-xl bg-black py-3.5 text-sm font-bold uppercase tracking-wide text-white">
              Voir {shown.length} produit{shown.length > 1 ? 's' : ''}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
