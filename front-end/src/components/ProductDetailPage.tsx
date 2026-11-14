'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Star,
  Heart,
  ShoppingBag,
  ChevronDown,
  Truck,
  MapPin,
  Check,
} from 'lucide-react';
import { Product } from '@/data/products';
import { STOCK_TONE, stockLabel } from '@/components/ProductCard';
import ProductReviews from '@/components/ProductReviews';
import StoreImage from '@/components/StoreImage';

interface ProductDetailPageProps {
  product: Product;
  recommendations?: React.ReactNode;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product, shadeName?: string) => void;
}

export default function ProductDetailPage({
  product,
  recommendations,
  wishlist,
  onToggleWishlist,
  onAddToCart,
}: ProductDetailPageProps) {
  const isWishlisted = wishlist.includes(product.id);

  const shades = product.shades ?? [];
  const hasShades = shades.length > 0;
  const [selectedReferenceId, setSelectedReferenceId] = useState('');
  const selectedReference = shades.find((s) => s.id === selectedReferenceId);
  const needsReference = hasShades && !selectedReference;
  const generalGallery = product.images?.length ? product.images : [product.image];
  const galleryImages = selectedReference?.images?.length ? selectedReference.images : generalGallery;
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const mainImage = previewImage ?? galleryImages[0];
  const selectedStock = hasShades ? selectedReference?.stock ?? product.stock : product.stock;
  const stock = stockLabel(selectedStock);
  const soldOut = stock.tone === 'out';
  const purchaseDisabled = soldOut || needsReference;

  // Accordion open states
  const [expandedSection, setExpandedSection] = useState<string | null>('description');

  // Sticky bottom purchase bar visibility
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 450);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAddToCartClick = () => {
    if (purchaseDisabled) return;
    onAddToCart(hasShades ? { ...product, image: galleryImages[0] ?? product.image, images: galleryImages, stock: selectedStock } : product, selectedReference?.name);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  const selectReference = (id: string) => {
    setSelectedReferenceId(id);
    setPreviewImage(null);
    setAddedSuccess(false);
  };

  return (
    <div className="bg-white min-h-screen pb-24 text-black font-sans">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* Breadcrumb Trail */}
        <nav className="text-xs text-gray-500 mb-6 flex flex-wrap items-center gap-x-2 gap-y-1" aria-label="Fil d'Ariane">
          <Link href="/" className="hover:text-black transition-colors">
            Accueil
          </Link>
          {product.categorySlug && (
            <>
              <span>/</span>
              <Link href={`/shop/${product.categorySlug}`} className="hover:text-black transition-colors">
                {product.categoryName}
              </Link>
            </>
          )}
          {product.subcategorySlug && (
            <>
              <span>/</span>
              <Link href={`/shop/${product.categorySlug}?sub=${product.subcategorySlug}`} className="hover:text-black transition-colors">
                {product.subcategory}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-black font-semibold truncate max-w-xs">{product.title}</span>
        </nav>

        {/* Main Product Display (Gallery + Info Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Vertical Thumbnails + Main Image Preview (7 cols) */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
            {/* Vertical Thumbnails List */}
            <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto max-h-[500px] no-scrollbar">
              {generalGallery.map((img, idx) => (
                <button
                  key={idx}
                  aria-label={`Afficher l’image ${idx + 1}`}
                  onClick={() => setPreviewImage(img)}
                  aria-pressed={mainImage === img}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    mainImage === img
                      ? 'border-black ring-2 ring-black/10'
                      : 'border-gray-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <StoreImage src={img} alt={`${product.title} — image ${idx + 1}`} width={64} height={64} sizes="64px" loading="lazy" className="w-full h-full object-cover" />
                </button>
              ))}

            </div>

            {/* Main Stage Image */}
            <div className="min-w-0 flex-1 bg-gray-50 rounded-2xl relative h-[420px] min-h-[420px] sm:h-[528px] sm:min-h-[528px] border border-gray-100">
              {product.badge && (
                <span className="absolute top-4 left-4 bg-black text-white text-xs font-bold px-3 py-1 rounded-md z-10">
                  {product.badge}
                </span>
              )}
              <StoreImage
                src={mainImage}
                alt={`${product.title}${!previewImage && selectedReference?.images?.length ? ` — Référence ${selectedReference.name}` : ''}`}
                data-testid="product-main-image"
                fill
                sizes="(min-width: 1440px) 640px, (min-width: 1024px) 45vw, (min-width: 640px) calc(100vw - 176px), calc(100vw - 80px)"
                loading="eager"
                fetchPriority="high"
                className="object-contain p-6 transition-all duration-300"
              />
            </div>
          </div>

          {/* Right Column: Product Metadata, Shades & Buy Actions (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              {/* Brand Title */}
              <Link
                href={product.brandSlug ? `/marques/${product.brandSlug}` : '/marques'}
                className="text-xs font-black uppercase tracking-widest text-black underline underline-offset-4 hover:text-gray-700"
              >
                {product.brand}
              </Link>

              {/* Product Heading */}
              <h1 className="text-xl sm:text-2xl font-extrabold text-black mt-2 leading-snug">
                {product.title}
              </h1>

              {(product.volume || product.stock !== undefined) && (
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  {product.volume && (
                    <span className="text-gray-700">
                      Contenance : <span className="font-bold text-black">{product.volume}</span>
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-1.5 font-semibold ${STOCK_TONE[stock.tone]}`}>
                    <span className={`h-2 w-2 rounded-full ${stock.tone === 'ok' ? 'bg-emerald-500' : stock.tone === 'low' ? 'bg-amber-500' : 'bg-red-500'}`} />
                    {stock.text}
                  </span>
                </div>
              )}

              {product.reviewsCount > 0 && (
                <div className="flex items-center gap-3 mt-3 text-xs">
                  <div className="flex items-center gap-1 font-bold text-black">
                    <Star className="w-4 h-4 fill-black text-black" />
                    <span>{product.rating.toFixed(1)}/5</span>
                  </div>
                  <a href="#reviews" className="text-gray-600 underline font-medium hover:text-black">
                    ({product.reviewsCount} avis)
                  </a>
                </div>
              )}

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
                Paiement en espèces à la livraison, partout en Algérie.
              </p>

              {hasShades && (
                <div className="mt-8 grid grid-cols-1 items-center gap-3 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-6">
                  <label htmlFor="product-reference" className="text-sm font-extrabold uppercase text-black">Référence</label>
                  <div className="relative min-w-0">
                    <select
                      id="product-reference"
                      value={selectedReferenceId}
                      onChange={(event) => selectReference(event.target.value)}
                      className="min-h-14 w-full appearance-none rounded-none border border-gray-300 bg-white py-3 pl-4 pr-14 text-base text-gray-700 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    >
                      <option value="">Choisir une option</option>
                      {shades.map((reference) => (
                        <option key={reference.id} value={reference.id}>
                          {reference.name}{reference.stock === 0 ? ' — Rupture de stock' : ''}
                        </option>
                      ))}
                    </select>
                    <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 flex w-12 items-center justify-center border-l border-gray-300 text-gray-500">
                      <ChevronDown className="h-5 w-5" />
                    </span>
                  </div>
                </div>
              )}

              {/* Add to Cart & Wishlist Buttons */}
              <div className="mt-8 flex items-center gap-3">
                <button
                  onClick={handleAddToCartClick}
                  disabled={purchaseDisabled}
                  className={`flex-1 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all ${
                    purchaseDisabled
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : addedSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-black text-white hover:bg-neutral-800'
                  }`}
                >
                  {needsReference ? (
                    <span>Choisir une référence</span>
                  ) : soldOut ? (
                    <span>Rupture de stock</span>
                  ) : addedSuccess ? (
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



              {/* Delivery */}
              <div className="mt-8 rounded-2xl border border-gray-200 p-5 bg-gray-50/50 space-y-4">
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-black mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-black">Livraison à domicile dans toute l&apos;Algérie</h4>
                    <p className="text-xs text-gray-600 mt-0.5">Par Yalidine. Frais calculés selon votre wilaya et votre commune avant la validation.</p>
                  </div>
                </div>
                <hr className="border-gray-200" />
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-black mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-black">Retrait au bureau Yalidine</h4>
                    <p className="text-xs text-gray-600 mt-0.5">Moins cher : récupérez votre colis dans le bureau le plus proche.</p>
                  </div>
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
                  <p className="whitespace-pre-line">{product.description}</p>
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
            {product.testResults && (
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
                  <p>{product.testResults}</p>
                </div>
              )}
            </div>
            )}

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
        {recommendations}

        <ProductReviews product={product} />


      </div>

      {/* Sticky Bottom Purchase Bar (Floating on Scroll) */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl py-3 px-4 sm:px-8 transition-transform duration-300 ${
          showStickyBar ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {showStickyBar && <StoreImage
              src={mainImage}
              alt={product.title}
              width={40}
              height={40}
              sizes="40px"
              className="w-10 h-10 object-cover rounded-lg border border-gray-200 hidden sm:block"
            />}
            <div className="min-w-0">
              <div className="text-[11px] font-black uppercase text-black truncate">{product.brand}</div>
              <div className="text-xs text-gray-800 truncate font-medium">{product.title}</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-base font-extrabold text-black whitespace-nowrap">{product.price}</span>

            {/* Shade dropdown selector in sticky bar */}
            {hasShades && (
            <div className="hidden md:flex items-center gap-2 border border-gray-300 rounded-xl px-3 py-2 bg-white">
              <span className="text-xs font-bold text-black">Référence : {selectedReference?.name ?? 'Choisir une option'}</span>
            </div>
            )}

            <button
              onClick={handleAddToCartClick}
              disabled={purchaseDisabled}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                purchaseDisabled
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : addedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-black text-white hover:bg-neutral-800'
              }`}
            >
              {needsReference ? 'Choisir une référence' : soldOut ? 'Rupture de stock' : addedSuccess ? 'Ajouté !' : 'Ajouter au panier'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
