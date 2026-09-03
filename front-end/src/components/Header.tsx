'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, MapPin, User, Heart, ShoppingBag, X } from 'lucide-react';
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

  const allProducts = [...BEST_SELLERS, ...NEW_LAUNCHES];
  const filteredProducts = searchQuery.trim()
    ? allProducts.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Eclora Logo */}
        <Link href="/" className="flex-shrink-0 cursor-pointer block">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-[0.22em] text-black font-sans uppercase hover:opacity-80 transition-opacity">
            ECLORA
          </h1>
        </Link>

        {/* Search Bar Container */}
        <div className="relative flex-1 max-w-2xl mx-2 sm:mx-6">
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

        {/* Navigation Action Icons */}
        <div className="flex items-center gap-4 sm:gap-6 text-black text-xs font-medium">
          {/* Store & Services */}
          <button className="hidden md:flex items-center gap-2 hover:text-gray-600 transition-colors">
            <MapPin className="w-5 h-5 stroke-[1.75]" />
            <span className="leading-tight font-medium">Magasin et Services</span>
          </button>

          {/* User Account */}
          <button className="flex items-center gap-2 hover:text-gray-600 transition-colors">
            <User className="w-5 h-5 stroke-[1.75]" />
            <span className="hidden sm:inline leading-tight font-medium">Se connecter</span>
          </button>

          {/* Wishlist Icon */}
          <button className="relative p-1 hover:text-gray-600 transition-colors">
            <Heart className="w-5 h-5 stroke-[1.75]" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#d80075] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Icon */}
          <Link
            href="/panier"
            className="relative p-1 hover:text-gray-600 transition-colors flex items-center gap-1.5 cursor-pointer"
            aria-label="Mon Panier"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#d80075] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
