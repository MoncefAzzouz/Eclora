'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, MapPin, User, Heart, ShoppingBag, X, Menu, ChevronRight } from 'lucide-react';
import { BEST_SELLERS, NEW_LAUNCHES, Product } from '@/data/products';

interface HeaderProps {
  wishlistCount: number;
  cartCount: number;
  onOpenCart: () => void;
  onOpenQuickView: (product: Product) => void;
}

export default function Header({ wishlistCount, cartCount, onOpenCart, onOpenQuickView }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const allProducts = [...BEST_SELLERS, ...NEW_LAUNCHES];
  const filteredProducts = searchQuery.trim()
    ? allProducts.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const CATEGORIES = [
    { name: 'Maquillage', slug: 'maquillage' },
    { name: 'Parfum', slug: 'parfum' },
    { name: 'Soin Visage', slug: 'soin-visage' },
    { name: 'Corps & Bain', slug: 'corps-bain' },
    { name: 'Cheveux', slug: 'cheveux' },
    { name: 'Nouveautés & Tendances', slug: 'nouveautes' },
    { name: 'Marques', slug: 'marques' },
    { name: 'Eclora Collection', slug: 'eclora-collection', highlight: 'pink' },
    { name: 'Bons plans & Cadeaux', slug: 'bons-plans' },
    { name: 'Dernière chance -40%', slug: 'derniere-chance', highlight: 'red' },
  ];

  return (
    <>
    <header
      className={`sticky top-0 z-40 border-b transition-colors duration-300 ${
        isScrolled
          ? 'bg-white/75 border-white/40 backdrop-blur-xl shadow-sm'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Left: Mobile Hamburger + Eclora Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsMobileNavOpen(true)}
            className="p-1 text-black hover:opacity-75 transition-opacity sm:hidden"
            aria-label="Menu"
          >
            <Menu className="w-6 h-6 stroke-[1.75]" />
          </button>

          <Link href="/" className="flex-shrink-0 cursor-pointer block hover:opacity-80 transition-opacity">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/svg/Eclora Horizontal.svg"
              alt="ECLORA"
              className="h-8 sm:h-10 w-auto"
            />
          </Link>
        </div>

        {/* Desktop Search Bar (Hidden on Mobile) */}
        <div className="relative flex-1 max-w-2xl mx-2 sm:mx-6 hidden sm:block">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-4 h-4 text-gray-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              placeholder="Rechercher un produit, une marque..."
              className="w-full bg-[#f2f2f2] text-sm text-black placeholder-gray-600 rounded-full pl-11 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-black transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 text-gray-500 hover:text-black p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Instant Search Dropdown Preview */}
          {isSearchFocused && searchQuery.trim().length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fade-in max-h-96 overflow-y-auto">
              <div className="p-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Résultats de recherche ({filteredProducts.length})
              </div>
              {filteredProducts.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => {
                        onOpenQuickView(product);
                        setIsSearchFocused(false);
                      }}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-12 h-12 object-cover rounded-md border border-gray-100"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-black uppercase tracking-wide">
                          {product.brand}
                        </div>
                        <div className="text-xs text-gray-700 truncate">{product.title}</div>
                        <div className="text-xs font-semibold text-black mt-0.5">{product.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-sm text-gray-500">
                  Aucun résultat pour &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Navigation Action Icons */}
        <div className="flex items-center gap-3 sm:gap-6 text-black text-xs font-medium">
          {/* Mobile Search Icon */}
          <button
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="p-1 sm:hidden hover:opacity-75 transition-opacity"
            aria-label="Recherche"
          >
            <Search className="w-5 h-5 stroke-[1.75]" />
          </button>

          {/* Store & Services (Desktop) */}
          <button className="hidden md:flex items-center gap-2 hover:text-gray-600 transition-colors">
            <MapPin className="w-5 h-5 stroke-[1.75]" />
            <span className="leading-tight font-medium">Magasin et Services</span>
          </button>

          {/* User Account */}
          <button className="flex items-center gap-2 hover:text-gray-600 transition-colors" aria-label="Compte">
            <User className="w-5 h-5 stroke-[1.75]" />
            <span className="hidden sm:inline leading-tight font-medium">Se connecter</span>
          </button>

          {/* Wishlist Icon */}
          <button className="relative p-1 hover:text-gray-600 transition-colors" aria-label="Favoris">
            <Heart className="w-5 h-5 stroke-[1.75]" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#d80075] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Icon */}
          <button
            type="button"
            onClick={onOpenCart}
            className="relative p-1 hover:text-gray-600 transition-colors flex items-center gap-1.5 cursor-pointer"
            aria-label={`Mon panier (${cartCount})`}
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#d80075] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Search Bar Expansion */}
      {isMobileSearchOpen && (
        <div className="p-3 bg-gray-50 border-t border-gray-200 sm:hidden animate-fade-in">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un produit, une marque..."
              className="w-full bg-white text-xs text-black placeholder-gray-500 rounded-full pl-10 pr-9 py-2 border border-gray-300 outline-none focus:border-black"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-gray-500 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>

    {/* Kept outside the blurred sticky header so it uses the viewport as its
        containing block and the white drawer covers its full height. */}
    {isMobileNavOpen && (
      <div className="fixed inset-0 z-50 flex animate-fade-in sm:hidden">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-xs"
          onClick={() => setIsMobileNavOpen(false)}
        />
        <div className="relative z-10 flex h-dvh w-4/5 max-w-sm flex-col justify-between bg-white shadow-2xl">
            <div>
              <div className="flex items-center justify-between border-b border-gray-200 bg-white p-4">
                <span className="text-xl font-extrabold tracking-[0.2em] text-black uppercase font-sans">
                  ECLORA
                </span>
                <button
                  onClick={() => setIsMobileNavOpen(false)}
                  className="p-1 text-black"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="max-h-[calc(100dvh-140px)] divide-y divide-gray-100 overflow-y-auto bg-white p-4">
                <div className="py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-avantgarde">
                  Catégories
                </div>
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/shop/${cat.slug}`}
                    onClick={() => setIsMobileNavOpen(false)}
                    className="flex items-center justify-between py-3 text-[13px] font-medium font-avantgarde transition-colors hover:text-[#d80075]"
                    style={{ fontFamily: 'var(--font-avantgarde)', fontWeight: 500 }}
                  >
                    <span
                      className={
                        cat.highlight === 'pink'
                          ? 'text-[#d80075]'
                          : cat.highlight === 'red'
                          ? 'text-red-600'
                          : 'text-black'
                      }
                    >
                      {cat.name}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-2 border-t border-gray-200 bg-gray-50 p-4 text-xs font-semibold text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-black" />
                <span>Magasins & Services</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-black" />
                <span>Mon compte</span>
              </div>
            </div>
        </div>
      </div>
    )}
    </>
  );
}
