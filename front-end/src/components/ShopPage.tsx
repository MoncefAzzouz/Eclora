'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, Heart, Search, ChevronDown, ChevronUp, X, ShoppingBag, Check } from 'lucide-react';
import { Product, SHOP_PRODUCTS, SHOP_BRANDS } from '@/data/products';

interface ShopPageProps {
  categoryName: string;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
}

export default function ShopPage({
  categoryName,
  wishlist,
  onToggleWishlist,
  onAddToCart,
}: ShopPageProps) {
  const [brandSearch, setBrandSearch] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [activeTabPill, setActiveTabPill] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('Recommandé');
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  // Accordion toggle states
  const [openAccordion, setOpenAccordion] = useState<Record<string, boolean>>({
    marques: true,
    prix: false,
    promotion: false,
    eyeshadow: false,
    mascara: false,
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordion((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleBrandToggle = (brandName: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brandName)
        ? prev.filter((b) => b !== brandName)
        : [...prev, brandName]
    );
  };

  const filteredBrands = SHOP_BRANDS.filter((b) =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  // Filter products by selected brands
  const displayedProducts = selectedBrands.length > 0
    ? SHOP_PRODUCTS.filter((p) => selectedBrands.includes(p.brand))
    : SHOP_PRODUCTS;

  const handleAddClick = (product: Product) => {
    onAddToCart(product);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 2000);
  };

  return (
    <div className="bg-white min-h-screen pb-24 text-black font-sans">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* Breadcrumbs */}
        <nav className="text-xs text-gray-500 mb-6 flex items-center space-x-2">
          <Link href="/" className="hover:text-black transition-colors">
            Accueil
          </Link>
          <span>/</span>
          <span className="text-black font-bold uppercase tracking-wider">{categoryName}</span>
        </nav>

        {/* Category Description Pink Banner Box */}
        <div className="bg-[#fce3e7] rounded-2xl p-6 sm:p-10 mb-8 border border-pink-100 shadow-2xs">
          <h1 className="text-3xl sm:text-4xl font-black text-black mb-3">
            {categoryName}
          </h1>
          <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-normal max-w-5xl">
            Essentiel beauté incontournable, le {categoryName.toLowerCase()} est notre meilleur allié ! Teint frais, lèvres gourmandes et smoky eyes, le makeup parfait est à portée de main. On laisse libre cours à toutes nos envies en créant des looks à l&apos;infini ! Best-sellers ou nouveautés beauté, le {categoryName.toLowerCase()} n&apos;a jamais été aussi fun qu&apos;avec Eclora.
          </p>

          {/* Filter Subcategory Pills Row */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-6 text-xs font-bold whitespace-nowrap">
            <button
              onClick={() => setActiveTabPill(activeTabPill === 'promo' ? null : 'promo')}
              className={`px-4 py-2 rounded-full border transition-all ${
                activeTabPill === 'promo'
                  ? 'bg-black text-white border-black'
                  : 'bg-[#fde8e8] border-pink-200 text-black hover:bg-pink-100'
              }`}
            >
              -25% sur une sélection {categoryName.toLowerCase()}
            </button>
            {[
              'Nouveautés',
              'Meilleures ventes 🔥',
              'Uniquement chez Eclora',
              'Minis & formats voyage 🧳',
              'Coffrets maquillage',
              'Teint',
              'Lèvres',
              'Yeux',
            ].map((pill) => (
              <button
                key={pill}
                onClick={() => setActiveTabPill(activeTabPill === pill ? null : pill)}
                className={`px-4 py-2 rounded-full border transition-all ${
                  activeTabPill === pill
                    ? 'bg-black text-white border-black'
                    : 'bg-white border-gray-200 text-black hover:border-black'
                }`}
              >
                {pill}
              </button>
            ))}
          </div>
        </div>

        {/* Main Shop Grid (Sidebar Filters + Right Product Catalog) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Sidebar Filters (3 cols) */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h2 className="text-xl font-black text-black">Filtres</h2>
              {selectedBrands.length > 0 && (
                <button
                  onClick={() => setSelectedBrands([])}
                  className="text-xs font-bold text-gray-500 hover:text-black underline"
                >
                  Réinitialiser
                </button>
              )}
            </div>

            {/* Brands Filter Accordion */}
            <div className="border-b border-gray-200 pb-5">
              <button
                onClick={() => toggleAccordion('marques')}
                className="w-full flex items-center justify-between text-left py-2"
              >
                <h3 className="text-sm font-extrabold text-black">Marques</h3>
                {openAccordion.marques ? (
                  <ChevronUp className="w-4 h-4 text-black" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-black" />
                )}
              </button>

              {openAccordion.marques && (
                <div className="mt-3 space-y-3 animate-fade-in">
                  {/* Brand Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      value={brandSearch}
                      onChange={(e) => setBrandSearch(e.target.value)}
                      placeholder="Ex : Eclora Collection"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-black placeholder-gray-400 outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>

                  {/* Brands List with Checkboxes */}
                  <div className="max-h-60 overflow-y-auto space-y-2.5 pr-2 pt-1">
                    {filteredBrands.map((brand) => (
                      <label
                        key={brand.name}
                        className="flex items-center justify-between text-xs cursor-pointer hover:text-black group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(brand.name)}
                            onChange={() => handleBrandToggle(brand.name)}
                            className="rounded border-gray-300 text-black focus:ring-black"
                          />
                          <span className="font-semibold text-gray-800 group-hover:text-black truncate">
                            {brand.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-normal bg-gray-100 px-1.5 py-0.5 rounded-md">
                          {brand.count}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Price Filter Accordion */}
            <div className="border-b border-gray-200 pb-5">
              <button
                onClick={() => toggleAccordion('prix')}
                className="w-full flex items-center justify-between text-left py-2"
              >
                <h3 className="text-sm font-extrabold text-black">Prix</h3>
                <ChevronDown className="w-4 h-4 text-black" />
              </button>
            </div>

            {/* Promotion Accordion */}
            <div className="border-b border-gray-200 pb-5">
              <button
                onClick={() => toggleAccordion('promotion')}
                className="w-full flex items-center justify-between text-left py-2"
              >
                <h3 className="text-sm font-extrabold text-black">Promotion</h3>
                <ChevronDown className="w-4 h-4 text-black" />
              </button>
            </div>

            {/* Effets fard à paupières Accordion */}
            <div className="border-b border-gray-200 pb-5">
              <button
                onClick={() => toggleAccordion('eyeshadow')}
                className="w-full flex items-center justify-between text-left py-2"
              >
                <h3 className="text-sm font-extrabold text-black">Effets fard à paupières</h3>
                <ChevronDown className="w-4 h-4 text-black" />
              </button>
              {openAccordion.eyeshadow && (
                <div className="mt-3 space-y-2 text-xs">
                  {['Brillant/Glossy (47)', 'Iridescent/Nacré (67)', 'MAT (44)', 'Mat (229)', 'Métallisé (76)', 'Pailleté (81)'].map((eff) => (
                    <label key={eff} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded text-black" />
                      <span>{eff}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </aside>

          {/* Right Product Grid (9 cols) */}
          <main className="lg:col-span-9">
            {/* Header Line (Total Count & Sort Selector) */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-extrabold text-black">
                {displayedProducts.length * 300} Produits
              </span>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium hidden sm:inline">Trier par</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-xl px-4 py-2 pr-8 text-xs font-bold text-black outline-none focus:ring-1 focus:ring-black cursor-pointer shadow-2xs"
                  >
                    <option>Recommandé</option>
                    <option>Prix croissant</option>
                    <option>Prix décroissant</option>
                    <option>Meilleurs avis</option>
                    <option>Nouveautés</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-black absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* 3-Column Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {displayedProducts.map((product) => {
                const isWishlisted = wishlist.includes(product.id);
                const isAdded = addedProductId === product.id;

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col justify-between hover:shadow-xl transition-all duration-300 group relative"
                  >
                    <div>
                      {/* Top Badges & Wishlist Toggle */}
                      <div className="flex items-center justify-between mb-2">
                        {product.badge ? (
                          <span className="bg-black text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md">
                            {product.badge}
                          </span>
                        ) : (
                          <div />
                        )}
                        <button
                          onClick={() => onToggleWishlist(product.id)}
                          className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-black"
                          aria-label="Wishlist"
                        >
                          <Heart
                            className={`w-5 h-5 ${
                              isWishlisted ? 'fill-[#d80075] text-[#d80075]' : 'text-black stroke-[1.5]'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Product Image Link */}
                      <Link
                        href={`/product/${product.id}`}
                        className="w-full h-[220px] relative overflow-hidden rounded-xl bg-gray-50 flex items-center justify-center cursor-pointer block mb-3"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>

                      {/* Product Metadata */}
                      <div>
                        <div className="text-xs font-black text-black uppercase tracking-wider">
                          {product.brand}
                        </div>
                        <Link
                          href={`/product/${product.id}`}
                          className="text-xs text-gray-900 font-medium line-clamp-2 mt-1 hover:underline cursor-pointer min-h-[32px] block"
                        >
                          {product.title}
                        </Link>
                        {product.subtitle && (
                          <div className="text-[11px] text-gray-500 mt-0.5">{product.subtitle}</div>
                        )}

                        {/* Price */}
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="text-base font-extrabold text-black">{product.price}</span>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mt-1 text-xs">
                          <div className="flex text-black">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-black text-black" />
                            ))}
                          </div>
                          <span className="text-[10px] text-gray-500 font-normal">
                            {product.reviewsCount} avis
                          </span>
                        </div>

                        {product.shadeInfo && (
                          <div className="text-[10px] text-gray-500 mt-1 font-medium">
                            {product.shadeInfo}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Direct Add to Cart Action */}
                    <div className="mt-4 pt-2">
                      <button
                        onClick={() => handleAddClick(product)}
                        className={`w-full py-2.5 rounded-xl border border-black font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                          isAdded
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-black hover:bg-black hover:text-white'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Ajouté !</span>
                          </>
                        ) : (
                          <span>Ajouter au panier</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Load More Progress Bar */}
            <div className="mt-16 text-center space-y-4 max-w-sm mx-auto">
              <div className="text-xs text-gray-600 font-medium">
                Vous avez vu 24 produits sur 2554
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-black h-full w-[25%]" />
              </div>
              <button className="px-8 py-3.5 rounded-full bg-black text-white font-bold text-xs hover:bg-neutral-800 transition-colors shadow-sm">
                Voir plus de produits
              </button>
            </div>
          </main>
        </div>
      </div>

      {/* Floating Bottom Right Help Widget */}
      <div className="fixed bottom-6 right-6 z-40 bg-black text-white p-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in border border-neutral-800">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs font-bold">
          Besoin d&apos;aide sur nos produits {categoryName.toLowerCase()} ?
        </span>
        <button className="text-neutral-400 hover:text-white p-1">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
