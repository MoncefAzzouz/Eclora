'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, Heart, Search, ChevronDown, ChevronUp, ChevronRight, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
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
  const [activeCategoryPill, setActiveCategoryPill] = useState<string>(categoryName || 'Maquillage');
  const [sortBy, setSortBy] = useState('Nouveautés');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [activeMobileFilterSection, setActiveMobileFilterSection] = useState<string | null>(null);

  // Desktop accordions
  const [openAccordion, setOpenAccordion] = useState<Record<string, boolean>>({
    marques: true,
    prix: false,
    promotion: false,
    tendances: false,
    notes: false,
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

  const CATEGORY_PILLS = [
    'Maquillage',
    'Parfum',
    'Soin Visage',
    'Corps & Bain',
    'Cheveux',
    'Bons plans & Cadeaux',
    'Marques',
  ];

  const MOBILE_FILTER_SECTIONS = [
    { id: 'marques', title: 'Marques' },
    { id: 'prix', title: 'Prix' },
    { id: 'promotion', title: 'Promotion' },
    { id: 'tendances', title: 'Nouveautés & tendances' },
    { id: 'notes', title: 'Notes' },
  ];

  return (
    <div className="bg-white min-h-screen pb-24 text-black font-sans">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4">
        {/* Breadcrumbs */}
        <nav className="text-xs text-gray-500 mb-3 sm:mb-6 flex items-center space-x-1.5 sm:space-x-2">
          <Link href="/" className="hover:text-black transition-colors text-gray-400">
            ...
          </Link>
          <span>/</span>
          <span className="text-black font-bold tracking-wide capitalize">
            {categoryName || 'Nouveautés par catégorie'}
          </span>
        </nav>

        {/* Category Description Banner Header */}
        <div className="bg-[#fce5dd] rounded-2xl sm:rounded-3xl p-5 sm:p-8 mb-4 sm:mb-8 border border-[#f7d6cc]">
          <h1 className="text-2xl sm:text-4xl font-black text-black mb-1 sm:mb-3 tracking-tight">
            {categoryName || 'Nouveautés par catégorie'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-normal max-w-4xl hidden sm:block">
            Essentiel beauté incontournable, le maquillage et les parfums sont nos meilleurs alliés ! Teint frais, lèvres gourmandes et smoky eyes, le makeup parfait est à portée de main chez Eclora.
          </p>
        </div>

        {/* Subcategory Horizontal Pills Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-4 mb-3 sm:mb-8 text-xs font-bold whitespace-nowrap">
          {CATEGORY_PILLS.map((pill) => {
            const isSelected = activeCategoryPill.toLowerCase() === pill.toLowerCase();
            return (
              <button
                key={pill}
                onClick={() => setActiveCategoryPill(pill)}
                className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-black text-white border-black shadow-xs'
                    : 'bg-[#faede5] border-[#f5ded4] text-black hover:bg-[#f6dfd3]'
                }`}
              >
                {pill}
              </button>
            );
          })}
        </div>

        {/* Mobile Filter & Sort Split Bar (Hidden on Desktop, Visible on Mobile) */}
        <div className="grid grid-cols-2 border-t border-b border-gray-200 py-3 mb-4 sm:hidden text-xs font-bold text-black text-center">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex items-center justify-center gap-2 border-r border-gray-200 py-1"
          >
            <span>Filtres</span>
            {selectedBrands.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-bold">
                {selectedBrands.length}
              </span>
            )}
          </button>

          <div className="relative flex items-center justify-center py-1">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-transparent text-xs font-bold text-black text-center outline-none cursor-pointer"
            >
              <option value="Nouveautés">Tri : Nouveautés</option>
              <option value="Recommandé">Tri : Recommandé</option>
              <option value="Prix croissant">Tri : Prix croissant</option>
              <option value="Prix décroissant">Tri : Prix décroissant</option>
            </select>
          </div>
        </div>

        {/* Product Count Header on Mobile */}
        <div className="text-xs sm:text-sm font-extrabold text-black mb-3 sm:mb-6 sm:hidden">
          818 Produits
        </div>

        {/* Main Grid: Desktop Sidebar + Product Catalog */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Left Sidebar Filters (Hidden on Mobile) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6">
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
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      value={brandSearch}
                      onChange={(e) => setBrandSearch(e.target.value)}
                      placeholder="Ex : Dior, Huda Beauty..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-black placeholder-gray-400 outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>

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

            {/* Price Accordion */}
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
          </aside>

          {/* Right Product Grid (2 Items per row on mobile, 3 on desktop) */}
          <main className="lg:col-span-9">
            {/* Desktop Header Line */}
            <div className="hidden sm:flex items-center justify-between mb-6">
              <span className="text-sm font-extrabold text-black">
                818 Produits
              </span>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">Trier par</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-xl px-4 py-2 pr-8 text-xs font-bold text-black outline-none focus:ring-1 focus:ring-black cursor-pointer shadow-2xs"
                  >
                    <option>Nouveautés</option>
                    <option>Recommandé</option>
                    <option>Prix croissant</option>
                    <option>Prix décroissant</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-black absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Product Grid (2 Columns on mobile: grid-cols-2) */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
              {displayedProducts.map((product) => {
                const isWishlisted = wishlist.includes(product.id);

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-gray-200 p-2.5 sm:p-4 flex flex-col justify-between hover:shadow-lg transition-all duration-300 group relative"
                  >
                    <div>
                      {/* Top Badges & Wishlist Toggle */}
                      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                        {product.badge ? (
                          <span className="bg-black text-white text-[9px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 rounded-sm sm:rounded-md">
                            {product.badge}
                          </span>
                        ) : (
                          <span className="bg-black text-white text-[9px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 rounded-sm sm:rounded-md">
                            Nouveauté
                          </span>
                        )}
                        <button
                          onClick={() => onToggleWishlist(product.id)}
                          className="p-1 sm:p-1.5 rounded-full hover:bg-gray-100 transition-colors text-black"
                          aria-label="Wishlist"
                        >
                          <Heart
                            className={`w-4 h-4 sm:w-5 sm:h-5 ${
                              isWishlisted ? 'fill-[#d80075] text-[#d80075]' : 'text-black stroke-[1.5]'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Product Image Link */}
                      <Link
                        href={`/product/${product.id}`}
                        className="w-full h-[140px] sm:h-[220px] relative overflow-hidden rounded-xl bg-gray-50 flex items-center justify-center cursor-pointer block mb-2 sm:mb-3 p-2"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>

                      {/* Product Metadata */}
                      <div>
                        <div className="text-[10px] sm:text-xs font-black text-black uppercase tracking-wider truncate">
                          {product.brand}
                        </div>
                        <Link
                          href={`/product/${product.id}`}
                          className="text-[11px] sm:text-xs text-gray-900 font-medium line-clamp-2 mt-0.5 sm:mt-1 hover:underline cursor-pointer min-h-[28px] sm:min-h-[32px] block leading-tight"
                        >
                          {product.title}
                        </Link>
                        {product.subtitle && (
                          <div className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5 truncate">
                            {product.subtitle}
                          </div>
                        )}

                        {/* Price */}
                        <div className="mt-1.5 sm:mt-2 flex items-baseline gap-2">
                          <span className="text-xs sm:text-base font-extrabold text-black">
                            {product.price}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Direct Add to Cart Action */}
                    <div className="mt-3 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => onAddToCart(product)}
                        className="w-full py-1.5 sm:py-2.5 rounded-xl border border-black font-bold text-[10px] sm:text-xs text-black hover:bg-black hover:text-white transition-all text-center"
                      >
                        Ajouter au panier
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Filters Full Screen Modal / Drawer (Matching Screenshot 2) */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col justify-between animate-fade-in">
          {/* Modal Header */}
          <div className="p-5 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-black text-black">Filtres</h2>
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="p-1 text-black hover:opacity-70 transition-opacity"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Filter Sections List */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {MOBILE_FILTER_SECTIONS.map((sec) => (
              <div key={sec.id} className="p-4">
                <button
                  onClick={() =>
                    setActiveMobileFilterSection(
                      activeMobileFilterSection === sec.id ? null : sec.id
                    )
                  }
                  className="w-full flex items-center justify-between py-2 text-left"
                >
                  <span className="text-sm font-bold text-black">{sec.title}</span>
                  <ChevronRight className="w-4 h-4 text-black" />
                </button>

                {/* Expanded Brands Filter inside Mobile Drawer */}
                {activeMobileFilterSection === 'marques' && sec.id === 'marques' && (
                  <div className="mt-3 space-y-3 pt-2 border-t border-gray-100">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="text"
                        value={brandSearch}
                        onChange={(e) => setBrandSearch(e.target.value)}
                        placeholder="Chercher une marque..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs text-black outline-none"
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {filteredBrands.map((brand) => (
                        <label
                          key={brand.name}
                          className="flex items-center justify-between text-xs py-1 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedBrands.includes(brand.name)}
                              onChange={() => handleBrandToggle(brand.name)}
                              className="rounded border-gray-300 text-black"
                            />
                            <span className="font-semibold text-gray-900">{brand.name}</span>
                          </div>
                          <span className="text-[10px] text-gray-400">{brand.count}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Sticky Bottom Confirm Button */}
          <div className="p-5 border-t border-gray-200 bg-white">
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full bg-black text-white py-4 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider hover:bg-neutral-800 transition-colors shadow-md"
            >
              Afficher les 818 résultats
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
