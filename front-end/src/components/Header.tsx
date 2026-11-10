'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronRight, Heart, Menu, Package, Search, ShoppingBag, User, X } from 'lucide-react';
import type { Product } from '@/data/products';
import { formatDA, shopApi, type ApiProduct } from '@/lib/shop/api';
import { useCategories } from '@/lib/shop/catalog';
import { useCustomer } from '@/lib/shop/account';

interface HeaderProps {
  wishlistCount: number;
  cartCount: number;
  onOpenCart: () => void;
  /** Kept for the pages that still pass it; search results now open the product page. */
  onOpenQuickView?: (product: Product) => void;
}

/** Live search: debounced, and only the latest answer is kept. */
function useProductSearch(query: string) {
  const [results, setResults] = useState<{ q: string; total: number; products: ApiProduct[] } | null>(null);
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    let alive = true;
    const timer = setTimeout(() => {
      shopApi
        .products({ q, limit: 6 })
        .then((r) => alive && setResults({ q, ...r }))
        .catch(() => alive && setResults({ q, total: 0, products: [] }));
    }, 250);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [query]);
  return query.trim().length >= 2 ? results : null;
}

function SearchResults({ query, onPick }: { query: string; onPick: () => void }) {
  const results = useProductSearch(query);
  const q = query.trim();
  if (q.length < 2) return null;
  const stale = !results || results.q !== q;

  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] animate-fade-in overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-2xl">
      {stale ? (
        <div className="p-5 text-center text-sm text-gray-500">Recherche...</div>
      ) : results.products.length === 0 ? (
        <div className="p-6 text-center text-sm text-gray-500">Aucun résultat pour « {q} »</div>
      ) : (
        <>
          <div className="divide-y divide-gray-100">
            {results.products.map((p) => (
              <Link
                key={p.id}
                href={`/product/${p.slug}`}
                onClick={onPick}
                className="flex items-center gap-3 p-3 transition-colors hover:bg-gray-50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.images[0] ?? ''} alt="" className="h-12 w-12 rounded-md border border-gray-100 object-contain" />
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-black">{p.brandName}</div>
                  <div className="truncate text-xs text-gray-700">{p.name}{p.volume ? ` · ${p.volume}` : ''}</div>
                  <div className="mt-0.5 text-xs font-semibold text-black">
                    {formatDA(p.price)}
                    {p.stock <= 0 && <span className="ml-2 font-medium text-red-600">Rupture de stock</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <Link
            href={`/recherche?q=${encodeURIComponent(q)}`}
            onClick={onPick}
            className="block bg-gray-50 p-3 text-center text-xs font-bold text-black hover:underline"
          >
            Voir les {results.total} résultat{results.total > 1 ? 's' : ''}
          </Link>
        </>
      )}
    </div>
  );
}

export default function Header({ wishlistCount, cartCount, onOpenCart }: HeaderProps) {
  const router = useRouter();
  const categories = useCategories();
  const { customer } = useCustomer();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setIsSearchFocused(false);
    setIsMobileSearchOpen(false);
    router.push(`/recherche?q=${encodeURIComponent(q)}`);
  };
  const closeSearch = () => {
    setIsSearchFocused(false);
    setIsMobileSearchOpen(false);
    setSearchQuery('');
  };

  const firstName = customer?.name.split(' ')[0];

  return (
    <>
      <header
        className={`sticky top-0 z-40 border-b transition-colors duration-300 ${
          isScrolled ? 'border-white/40 bg-white/75 shadow-sm backdrop-blur-xl' : 'border-gray-200 bg-white'
        }`}
      >
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => setIsMobileNavOpen(true)} className="p-1 text-black transition-opacity hover:opacity-75 sm:hidden" aria-label="Menu">
              <Menu className="h-6 w-6 stroke-[1.75]" />
            </button>
            <Link href="/" className="block flex-shrink-0 transition-opacity hover:opacity-80">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/svg/Eclora Horizontal.svg" alt="ECLORA" width={260} height={80} className="h-8 w-auto sm:h-10" />
            </Link>
          </div>

          {/* Desktop search */}
          <form onSubmit={submitSearch} className="relative mx-2 hidden max-w-2xl flex-1 sm:mx-6 sm:block" role="search">
            <div className="relative flex items-center">
              <Search className="pointer-events-none absolute left-4 h-4 w-4 text-gray-500" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (blurTimer.current) clearTimeout(blurTimer.current);
                  setIsSearchFocused(true);
                }}
                onBlur={() => {
                  blurTimer.current = setTimeout(() => setIsSearchFocused(false), 200);
                }}
                placeholder="Rechercher un produit, une marque..."
                aria-label="Rechercher"
                className="w-full rounded-full bg-[#f2f2f2] py-2.5 pl-11 pr-10 text-sm text-black placeholder-gray-600 outline-none transition-all focus:ring-2 focus:ring-black"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className="absolute right-3.5 p-1 text-gray-500 hover:text-black" aria-label="Effacer">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {isSearchFocused && <SearchResults query={searchQuery} onPick={closeSearch} />}
          </form>

          <div className="flex items-center gap-3 text-xs font-medium text-black sm:gap-6">
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="p-1 transition-opacity hover:opacity-75 sm:hidden"
              aria-label="Recherche"
            >
              <Search className="h-5 w-5 stroke-[1.75]" />
            </button>

            <Link href="/suivi" className="hidden items-center gap-2 transition-colors hover:text-gray-600 md:flex">
              <Package className="h-5 w-5 stroke-[1.75]" />
              <span className="font-medium leading-tight">Suivre ma commande</span>
            </Link>

            <Link href="/compte" className="flex items-center gap-2 transition-colors hover:text-gray-600" aria-label="Mon compte">
              <User className="h-5 w-5 stroke-[1.75]" />
              <span className="hidden font-medium leading-tight sm:inline">{firstName ? `Bonjour, ${firstName}` : 'Se connecter'}</span>
            </Link>

            <span className="relative p-1" aria-label={`Favoris (${wishlistCount})`}>
              <Heart className="h-5 w-5 stroke-[1.75]" />
              {wishlistCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#d80075] text-[10px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </span>

            <button type="button" onClick={onOpenCart} className="relative flex cursor-pointer items-center gap-1.5 p-1 transition-colors hover:text-gray-600" aria-label={`Mon panier (${cartCount})`}>
              <div className="relative">
                <ShoppingBag className="h-5 w-5 stroke-[1.75]" />
                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#d80075] text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {isMobileSearchOpen && (
          <form onSubmit={submitSearch} className="relative animate-fade-in border-t border-gray-200 bg-gray-50 p-3 sm:hidden" role="search">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-gray-500" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit, une marque..."
                aria-label="Rechercher"
                className="w-full rounded-full border border-gray-300 bg-white py-2.5 pl-10 pr-9 text-sm text-black placeholder-gray-500 outline-none focus:border-black"
                autoFocus
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className="absolute right-3 p-1 text-gray-500" aria-label="Effacer">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="relative">
              <SearchResults query={searchQuery} onPick={closeSearch} />
            </div>
          </form>
        )}
      </header>

      {/* Outside the blurred sticky header so the drawer uses the viewport as its containing block. */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 flex animate-fade-in sm:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setIsMobileNavOpen(false)} />
          <div className="relative z-10 flex h-dvh w-[85%] max-w-sm flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <span className="text-xl font-extrabold uppercase tracking-[0.2em] text-black">ECLORA</span>
              <button onClick={() => setIsMobileNavOpen(false)} className="p-1 text-black" aria-label="Fermer">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 divide-y divide-gray-100 overflow-y-auto px-4">
              {categories.map((cat) => {
                const open = openCategory === cat.slug;
                return (
                  <div key={cat.id}>
                    <button
                      onClick={() => setOpenCategory(open ? null : cat.slug)}
                      className="flex w-full items-center justify-between py-3.5 text-left"
                      aria-expanded={open}
                    >
                      <span>
                        <span className="block text-[14px] font-bold uppercase tracking-wide">{cat.name}</span>
                        {cat.description && <span className="block text-[11px] text-gray-500">{cat.description}</span>}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                    </button>
                    {open && (
                      <ul className="space-y-1 pb-3 pl-2">
                        <li>
                          <Link href={`/shop/${cat.slug}`} onClick={() => setIsMobileNavOpen(false)} className="block py-1.5 text-[13px] font-bold">
                            Tout voir
                          </Link>
                        </li>
                        {cat.subcategories.map((sub) => (
                          <li key={sub.id}>
                            <Link
                              href={`/shop/${cat.slug}?sub=${sub.slug}`}
                              onClick={() => setIsMobileNavOpen(false)}
                              className="block py-1.5 text-[13px] text-gray-700"
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
              <Link href="/marques" onClick={() => setIsMobileNavOpen(false)} className="flex items-center justify-between py-3.5">
                <span className="text-[14px] font-bold uppercase tracking-wide">Nos Marques</span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>
            </div>

            <div className="space-y-3 border-t border-gray-200 bg-gray-50 p-4 text-sm font-semibold text-gray-700">
              <Link href="/compte" onClick={() => setIsMobileNavOpen(false)} className="flex items-center gap-2">
                <User className="h-4 w-4 text-black" />
                {customer ? `Mon compte (${firstName})` : 'Se connecter / Créer un compte'}
              </Link>
              <Link href="/suivi" onClick={() => setIsMobileNavOpen(false)} className="flex items-center gap-2">
                <Package className="h-4 w-4 text-black" />
                Suivre ma commande
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
