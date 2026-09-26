'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Star,
  Heart,
  ShoppingBag,
  ChevronDown,
  ChevronRight,
  Truck,
  MapPin,
  ThumbsUp,
  ThumbsDown,
  Check,
  Play,
} from 'lucide-react';
import { Product } from '@/data/products';
import ProductCarousel from '@/components/ProductCarousel';

interface ProductDetailPageProps {
  product: Product;
  /** Related products shown in the two carousels. */
  related?: Product[];
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product, shadeName?: string) => void;
}

export default function ProductDetailPage({
  product,
  related = [],
  wishlist,
  onToggleWishlist,
  onAddToCart,
}: ProductDetailPageProps) {
  const isWishlisted = wishlist.includes(product.id);

  // Gallery state
  const galleryImages = product.images && product.images.length > 0 ? product.images : [product.image];
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Shade state
  const shades = product.shades || [
    { id: 'default', name: product.subtitle || product.title, hex: '#f2d2b6', volume: product.volume || '' },
  ];
  const [selectedShade, setSelectedShade] = useState(shades[0]);

  // Accordion open states
  const [expandedSection, setExpandedSection] = useState<string | null>('description');

  // Sticky bottom purchase bar visibility
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Helpful reviews counter state
  const [reviewHelpful, setReviewHelpful] = useState<Record<string, { up: number; down: number; voted?: 'up' | 'down' }>>(
    () =>
      Object.fromEntries(
        (product.reviews ?? []).map((r) => [r.id, { up: r.helpfulCount, down: r.unhelpfulCount }])
      )
  );

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 450);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAddToCartClick = () => {
    onAddToCart(product, selectedShade.name);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  const handleVote = (reviewId: string, type: 'up' | 'down') => {
    setReviewHelpful((prev) => {
      const current = prev[reviewId] || { up: 0, down: 0 };
      if (current.voted === type) return prev;

      let newUp = current.up;
      let newDown = current.down;

      if (type === 'up') {
        newUp += 1;
        if (current.voted === 'down') newDown -= 1;
      } else {
        newDown += 1;
        if (current.voted === 'up') newUp -= 1;
      }

      return {
        ...prev,
        [reviewId]: { up: newUp, down: newDown, voted: type },
      };
    });
  };

  return (
    <div className="bg-white min-h-screen pb-24 text-black font-sans">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* Breadcrumb Trail */}
        <nav className="text-xs text-gray-500 mb-6 flex items-center space-x-2">
          <Link href="/" className="hover:text-black transition-colors">
            Eclora
          </Link>
          <span>/</span>
          <span className="hover:text-black cursor-pointer transition-colors">
            {product.category === 'maquillage' ? 'Maquillage' : 'Parfum'}
          </span>
          <span>/</span>
          <span className="hover:text-black cursor-pointer transition-colors">
            {product.subcategory || 'Teint'}
          </span>
          <span>/</span>
          <span className="text-black font-semibold truncate max-w-xs">{product.title}</span>
        </nav>

        {/* Main Product Display (Gallery + Info Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Vertical Thumbnails + Main Image Preview (7 cols) */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
            {/* Vertical Thumbnails List */}
            <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto max-h-[500px] no-scrollbar">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImageIndex === idx
                      ? 'border-black ring-2 ring-black/10'
                      : 'border-gray-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
              {/* Optional video preview thumbnail */}
              <div className="w-16 h-16 rounded-xl border-2 border-gray-200 bg-black/90 flex flex-col items-center justify-center text-white text-[10px] cursor-pointer hover:border-black flex-shrink-0">
                <Play className="w-4 h-4 fill-white mb-0.5" />
                <span>Vidéo</span>
              </div>
            </div>

            {/* Main Stage Image */}
            <div className="flex-1 bg-gray-50 rounded-2xl p-6 relative flex items-center justify-center min-h-[420px] border border-gray-100">
              {product.badge && (
                <span className="absolute top-4 left-4 bg-black text-white text-xs font-bold px-3 py-1 rounded-md z-10">
                  {product.badge}
                </span>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={galleryImages[selectedImageIndex]}
                alt={product.title}
                className="max-h-[480px] w-auto object-contain transition-all duration-300"
              />
            </div>
          </div>

          {/* Right Column: Product Metadata, Shades & Buy Actions (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              {/* Brand Title */}
              <Link
                href="#"
                className="text-xs font-black uppercase tracking-widest text-black underline underline-offset-4 hover:text-gray-700"
              >
                {product.brand}
              </Link>

              {/* Product Heading */}
              <h1 className="text-xl sm:text-2xl font-extrabold text-black mt-2 leading-snug">
                {product.title}
              </h1>

              {/* Rating & Description Anchor Link */}
              <div className="flex items-center gap-3 mt-3 text-xs">
                <div className="flex items-center gap-1 font-bold text-black">
                  <Star className="w-4 h-4 fill-black text-black" />
                  <span>{product.rating}/5</span>
                </div>
                <a href="#reviews" className="text-gray-600 underline font-medium hover:text-black">
                  ({product.reviewsCount} avis)
                </a>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => {
                    const el = document.getElementById('description-tab');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-black font-semibold underline hover:text-gray-600"
                >
                  Voir la description
                </button>
              </div>

              {/* Price Display */}
              <div className="mt-6">
                <span className="text-3xl font-black text-black">{product.price}</span>
                {product.originalPrice && (
                  <span className="text-sm text-gray-400 line-through ml-3">
                    {product.originalPrice}
                  </span>
                )}
              </div>

              {/* Payment Installment Note */}
              <p className="text-xs text-gray-700 mt-2 font-medium">
                Paiement à la livraison en espèces ou par <span className="font-bold underline cursor-pointer">BaridiMob</span> / <span className="font-bold underline cursor-pointer">Carte CIPA</span>
              </p>

              {/* Shade Selector Section */}
              <div className="mt-8">
                <label className="text-xs font-extrabold text-black block mb-3">
                  Ce produit existe en plusieurs teintes :
                </label>

                {/* Dropdown Display Button */}
                <div className="w-full bg-white border border-gray-300 rounded-xl p-3.5 flex items-center justify-between shadow-2xs hover:border-black cursor-pointer transition-colors mb-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-5 h-5 rounded-full border border-gray-300 shadow-2xs"
                      style={{ backgroundColor: selectedShade.hex }}
                    />
                    <span className="text-xs font-bold text-black">{selectedShade.name}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </div>

                {/* Color Swatch Circles Palette */}
                <div className="flex flex-wrap gap-2.5">
                  {shades.map((shade) => (
                    <button
                      key={shade.id}
                      onClick={() => setSelectedShade(shade)}
                      title={shade.name}
                      className={`w-7 h-7 rounded-full transition-all relative flex items-center justify-center ${
                        selectedShade.id === shade.id
                          ? 'ring-2 ring-black ring-offset-2 scale-110'
                          : 'hover:scale-105 border border-gray-300'
                      }`}
                      style={{ backgroundColor: shade.hex }}
                    >
                      {selectedShade.id === shade.id && (
                        <div className="w-1.5 h-1.5 rounded-full bg-black/40" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add to Cart & Wishlist Buttons */}
              <div className="mt-8 flex items-center gap-3">
                <button
                  onClick={handleAddToCartClick}
                  className={`flex-1 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all ${
                    addedSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-black text-white hover:bg-neutral-800'
                  }`}
                >
                  {addedSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Ajouté au panier !</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Ajouter au panier</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onToggleWishlist(product.id)}
                  className="p-3.5 rounded-xl border border-gray-300 hover:border-black transition-colors"
                  aria-label="Wishlist toggle"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isWishlisted ? 'fill-[#d80075] text-[#d80075]' : 'text-black'
                    }`}
                  />
                </button>
              </div>

              <p className="text-[11px] text-gray-500 mt-3 text-center">
                Produit point rouge non éligible aux promotions
              </p>

              {/* Delivery & Store Pickup Availability Box */}
              <div className="mt-8 rounded-2xl border border-gray-200 p-5 bg-gray-50/50 space-y-4">
                {/* Home Delivery Option */}
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-black mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-black">
                      Livraison à domicile ou en point relais
                    </h4>
                    <p className="text-xs text-gray-600 mt-0.5">À partir du 8 septembre</p>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 mt-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Disponible
                    </span>
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* Store Pickup Option */}
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-black mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-black">Retrait dès 2h en magasin</h4>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Pour découvrir nos stocks choisissez votre magasin
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 mt-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Disponible
                    </span>
                    <button className="w-full mt-3 py-2.5 rounded-xl border border-black text-black font-bold text-xs hover:bg-black hover:text-white transition-colors">
                      Choisir un magasin
                    </button>
                  </div>
                </div>

                <hr className="border-gray-200" />

                <div className="flex items-center justify-between text-xs font-semibold text-black cursor-pointer hover:underline">
                  <span>Plus d&apos;informations sur la livraison et les retours</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Accordion / Detailed Information Tabs */}
        <section id="description-tab" className="mt-16 border-t border-gray-200 pt-10 max-w-4xl">
          <div className="space-y-4">
            {/* Description Accordion */}
            <div className="border-b border-gray-200 pb-4">
              <button
                onClick={() =>
                  setExpandedSection(expandedSection === 'description' ? null : 'description')
                }
                className="w-full flex items-center justify-between text-left py-2"
              >
                <h3 className="text-base font-extrabold text-black">Description</h3>
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${
                    expandedSection === 'description' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {expandedSection === 'description' && (
                <div className="mt-3 text-xs sm:text-sm text-gray-700 leading-relaxed animate-fade-in space-y-3">
                  <p>{product.description}</p>
                  <button className="text-black font-bold underline hover:text-gray-600">
                    Lire la suite
                  </button>
                </div>
              )}
            </div>

            {/* Conseils d'utilisation Accordion */}
            <div className="border-b border-gray-200 pb-4">
              <button
                onClick={() =>
                  setExpandedSection(expandedSection === 'usage' ? null : 'usage')
                }
                className="w-full flex items-center justify-between text-left py-2"
              >
                <h3 className="text-base font-extrabold text-black">Conseils d&apos;utilisation</h3>
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${
                    expandedSection === 'usage' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {expandedSection === 'usage' && (
                <div className="mt-3 text-xs sm:text-sm text-gray-700 leading-relaxed animate-fade-in">
                  <p>{product.usageTips || 'Appliquer généreusement au pinceau ou à l\'éponge sur les zones souhaitées.'}</p>
                </div>
              )}
            </div>

            {/* Résultats des tests Accordion */}
            <div className="border-b border-gray-200 pb-4">
              <button
                onClick={() =>
                  setExpandedSection(expandedSection === 'tests' ? null : 'tests')
                }
                className="w-full flex items-center justify-between text-left py-2"
              >
                <h3 className="text-base font-extrabold text-black">Résultats des tests</h3>
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${
                    expandedSection === 'tests' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {expandedSection === 'tests' && (
                <div className="mt-3 text-xs sm:text-sm text-gray-700 leading-relaxed animate-fade-in">
                  <p>{product.testResults || '100% de satisfaction sur la tenue longue durée.'}</p>
                </div>
              )}
            </div>

            {/* Ingrédients Accordion */}
            <div className="border-b border-gray-200 pb-4">
              <button
                onClick={() =>
                  setExpandedSection(expandedSection === 'ingredients' ? null : 'ingredients')
                }
                className="w-full flex items-center justify-between text-left py-2"
              >
                <h3 className="text-base font-extrabold text-black">Ingrédients</h3>
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${
                    expandedSection === 'ingredients' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {expandedSection === 'ingredients' && (
                <div className="mt-3 text-xs text-gray-600 leading-relaxed uppercase tracking-wider font-mono animate-fade-in">
                  <p>{product.ingredients || 'TALC, SILICA, DIMETHICONE, ETHYLHEXYLGLYCERIN.'}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Carousel Section: Complétez votre routine */}
        <ProductCarousel
          title="Complétez votre routine"
          products={related}
          wishlist={wishlist}
          onToggleWishlist={onToggleWishlist}
          onOpenQuickView={() => {}}
        />

        {/* Customer Reviews Section ("Avis sur le produit") */}
        <section id="reviews" className="mt-20 border-t border-gray-200 pt-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-black">Avis sur le produit</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex text-black">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-black text-black" />
                  ))}
                </div>
                <span className="text-sm font-bold text-black">{product.rating}/5</span>
                <span className="text-xs text-gray-500 font-medium">
                  ({product.reviewsCount} avis sur le produit)
                </span>
              </div>
            </div>

            {/* Filter Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600">Trier par</span>
              <select className="border border-gray-300 rounded-xl px-4 py-2 text-xs font-semibold text-black bg-white outline-none focus:ring-1 focus:ring-black">
                <option>Les plus récents</option>
                <option>Les mieux notés</option>
                <option>Les plus utiles</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Rating Breakdown Bars Column (5 cols) */}
            <div className="lg:col-span-5 bg-gray-50/70 p-6 rounded-2xl border border-gray-100">
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between font-bold text-black mb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-black focus:ring-black" />
                    <span>Tous ({product.reviewsCount})</span>
                  </label>
                </div>

                {/* 5 Stars Bar */}
                <div className="flex items-center gap-3">
                  <label className="w-16 flex items-center gap-1 font-semibold text-gray-700">
                    <input type="checkbox" className="rounded text-black focus:ring-black" />
                    <span>5 ★</span>
                  </label>
                  <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-black h-full w-[85%]" />
                  </div>
                  <span className="text-gray-500 w-12 text-right">(10858)</span>
                </div>

                {/* 4 Stars Bar */}
                <div className="flex items-center gap-3">
                  <label className="w-16 flex items-center gap-1 font-semibold text-gray-700">
                    <input type="checkbox" className="rounded text-black focus:ring-black" />
                    <span>4 ★</span>
                  </label>
                  <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-black h-full w-[12%]" />
                  </div>
                  <span className="text-gray-500 w-12 text-right">(1346)</span>
                </div>

                {/* 3 Stars Bar */}
                <div className="flex items-center gap-3">
                  <label className="w-16 flex items-center gap-1 font-semibold text-gray-700">
                    <input type="checkbox" className="rounded text-black focus:ring-black" />
                    <span>3 ★</span>
                  </label>
                  <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-black h-full w-[2%]" />
                  </div>
                  <span className="text-gray-500 w-12 text-right">(260)</span>
                </div>

                {/* 2 Stars Bar */}
                <div className="flex items-center gap-3">
                  <label className="w-16 flex items-center gap-1 font-semibold text-gray-700">
                    <input type="checkbox" className="rounded text-black focus:ring-black" />
                    <span>2 ★</span>
                  </label>
                  <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-black h-full w-[1%]" />
                  </div>
                  <span className="text-gray-500 w-12 text-right">(112)</span>
                </div>

                {/* 1 Star Bar */}
                <div className="flex items-center gap-3">
                  <label className="w-16 flex items-center gap-1 font-semibold text-gray-700">
                    <input type="checkbox" className="rounded text-black focus:ring-black" />
                    <span>1 ★</span>
                  </label>
                  <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-black h-full w-[2%]" />
                  </div>
                  <span className="text-gray-500 w-12 text-right">(248)</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button className="w-full py-3 rounded-full bg-black text-white font-bold text-xs hover:bg-neutral-800 transition-colors">
                  Donner mon avis
                </button>
                <p className="text-[10px] text-gray-500 mt-2 text-center underline cursor-pointer">
                  Conditions de publication des avis
                </p>
              </div>
            </div>

            {/* Customer Reviews Feed (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((rev) => {
                  const votes = reviewHelpful[rev.id] || { up: rev.helpfulCount, down: rev.unhelpfulCount };

                  return (
                    <div
                      key={rev.id}
                      className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex text-black">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < rev.rating ? 'fill-black text-black' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-400 font-medium">{rev.date}</span>
                      </div>

                      <div>
                        <div className="text-sm font-extrabold text-black">{rev.author}</div>
                        <div className="text-xs text-gray-500">{rev.ageGroup}</div>
                      </div>

                      {rev.isVerified && (
                        <div className="inline-flex items-center gap-1.5 text-xs text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Acheteur vérifié et récompensé</span>
                          {rev.userDuration && <span className="text-gray-500 font-normal"> - {rev.userDuration}</span>}
                        </div>
                      )}

                      <h4 className="text-sm font-bold text-black">{rev.title}</h4>
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{rev.text}</p>

                      {rev.recommended && (
                        <div className="text-xs font-bold text-black">Recommande : Oui</div>
                      )}

                      {/* Helpful Feedback Voting */}
                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                        <span>Cet avis vous a-t-il été utile ?</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleVote(rev.id, 'up')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${
                              votes.voted === 'up'
                                ? 'bg-black text-white border-black'
                                : 'border-gray-200 hover:border-black text-black'
                            }`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>{votes.up}</span>
                          </button>
                          <button
                            onClick={() => handleVote(rev.id, 'down')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${
                              votes.voted === 'down'
                                ? 'bg-black text-white border-black'
                                : 'border-gray-200 hover:border-black text-black'
                            }`}
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                            <span>{votes.down}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-sm text-gray-500 border border-gray-200 rounded-2xl">
                  Aucun avis pour le moment. Soyez le premier à donner votre avis !
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Carousel Section: Vous aimerez aussi */}
        <ProductCarousel
          title="Vous aimerez aussi"
          products={related}
          wishlist={wishlist}
          onToggleWishlist={onToggleWishlist}
          onOpenQuickView={() => {}}
        />
      </div>

      {/* Sticky Bottom Purchase Bar (Floating on Scroll) */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl py-3 px-4 sm:px-8 transition-transform duration-300 ${
          showStickyBar ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImageIndex < galleryImages.length ? galleryImages[selectedImageIndex] : product.image}
              alt={product.title}
              className="w-10 h-10 object-cover rounded-lg border border-gray-200 hidden sm:block"
            />
            <div className="min-w-0">
              <div className="text-[11px] font-black uppercase text-black truncate">{product.brand}</div>
              <div className="text-xs text-gray-800 truncate font-medium">{product.title}</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-base font-extrabold text-black whitespace-nowrap">{product.price}</span>

            {/* Shade dropdown selector in sticky bar */}
            <div className="hidden md:flex items-center gap-2 border border-gray-300 rounded-xl px-3 py-2 bg-white cursor-pointer hover:border-black">
              <span
                className="w-3.5 h-3.5 rounded-full border border-gray-300"
                style={{ backgroundColor: selectedShade.hex }}
              />
              <span className="text-xs font-bold text-black">{selectedShade.name}</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </div>

            <button
              onClick={handleAddToCartClick}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                addedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-black text-white hover:bg-neutral-800'
              }`}
            >
              {addedSuccess ? 'Ajouté !' : 'Ajouter au panier'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
