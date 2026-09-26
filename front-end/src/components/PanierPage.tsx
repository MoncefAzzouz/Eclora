'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Info, ChevronUp, ChevronDown, ChevronRight, Sparkles, ShieldCheck, Check } from 'lucide-react';
import { Product } from '@/data/products';
import { useCart } from '@/lib/shop/cart';
import { shopApi, formatDA } from '@/lib/shop/api';

export interface CartItemType {
  product: Product;
  quantity: number;
  shade?: string;
}

export default function PanierPage() {
  const cart = useCart();
  const items = cart.items;

  const [wishlist, setWishlist] = useState<string[]>([]);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [isPromoOpen, setIsPromoOpen] = useState(true);

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const updateQuantity = (productId: string, newQty: number) => {
    const current = items.find((item) => item.product.id === productId);
    if (!current || newQty < 1) return;
    cart.updateQuantity(productId, newQty - current.quantity, current.shade);
  };

  const removeItem = (productId: string) => {
    const current = items.find((item) => item.product.id === productId);
    cart.remove(productId, current?.shade);
  };

  // Helper to parse price number
  const parsePrice = (priceStr: string) => {
    const cleaned = priceStr.replace(/[^0-9.,]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 4400;
  };

  const subtotal = items.reduce(
    (sum, item) => sum + parsePrice(item.product.price) * item.quantity,
    0
  );

  const discount = promoApplied ? promoDiscount : 0;
  const finalTotal = subtotal - discount;

  /** The code is checked by the backend, and checked again when the order is placed. */
  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    if (!promoCode.trim()) return;
    try {
      const result = await shopApi.validatePromo(promoCode.trim(), Math.round(subtotal));
      setPromoDiscount(result.discount);
      setPromoApplied(true);
      try {
        sessionStorage.setItem('eclora-promo', promoCode.trim().toUpperCase());
      } catch {
        // ignore
      }
    } catch (err) {
      setPromoApplied(false);
      setPromoDiscount(0);
      setPromoError(err instanceof Error ? err.message : 'Code promo invalide');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] text-black font-sans">
      {/* Top Header with Stepper */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="inline-block">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-[0.24em] text-black uppercase font-sans hover:opacity-80 transition-opacity">
              ECLORA
            </span>
          </Link>

          {/* Stepper (1 Panier, 2, 3) */}
          <div className="flex items-center gap-3 sm:gap-4 text-xs font-semibold">
            {/* Step 1 */}
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#d80075] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                1
              </span>
              <span className="font-bold text-black text-sm">Panier</span>
            </div>

            <div className="w-4 h-[1px] bg-gray-300 hidden sm:block" />

            {/* Step 2 */}
            <div className="flex items-center gap-2 text-gray-400">
              <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-xs">
                2
              </span>
              <span className="hidden sm:inline font-medium">Livraison</span>
            </div>

            <div className="w-4 h-[1px] bg-gray-300 hidden sm:block" />

            {/* Step 3 */}
            <div className="flex items-center gap-2 text-gray-400">
              <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-xs">
                3
              </span>
              <span className="hidden sm:inline font-medium">Paiement</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Panier Container */}
      <main className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (Items) */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
              Panier
            </h1>

            {/* Info Banner Alert */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-4 flex items-center gap-3 shadow-2xs text-xs text-gray-700">
              <Info className="w-5 h-5 text-gray-500 flex-shrink-0" />
              <span className="font-medium">
                Le montant de votre panier a changé depuis votre dernière visite.
              </span>
            </div>

            {/* Cart Items List */}
            {items.length > 0 ? (
              <div className="space-y-4">
                {items.map((item) => {
                  const isWishlisted = wishlist.includes(item.product.id);

                  return (
                    <div
                      key={item.product.id}
                      className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-2xs relative transition-all"
                    >
                      {/* Wishlist Heart Icon */}
                      <button
                        onClick={() => toggleWishlist(item.product.id)}
                        className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-gray-100 transition-colors text-black"
                        aria-label="Ajouter à la wishlist"
                      >
                        <Heart
                          className={`w-5 h-5 transition-colors ${
                            isWishlisted
                              ? 'fill-[#d80075] text-[#d80075]'
                              : 'text-black hover:text-[#d80075]'
                          }`}
                        />
                      </button>

                      <div className="flex flex-col sm:flex-row gap-5">
                        {/* Product Thumbnail */}
                        <div className="w-24 h-28 sm:w-28 sm:h-32 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-100 p-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.product.image}
                            alt={item.product.title}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between pr-8">
                          <div>
                            <div className="text-xs font-black uppercase tracking-wider text-black">
                              {item.product.brand}
                            </div>
                            <h2 className="text-sm font-semibold text-gray-800 mt-1 line-clamp-2 leading-snug">
                              {item.product.title}
                            </h2>
                            {item.product.volume && (
                              <div className="text-xs text-gray-500 mt-0.5 font-medium">
                                {item.product.volume}
                              </div>
                            )}

                            {/* Red Point tag */}
                            <div className="inline-block mt-2.5">
                              <span className="bg-[#f0f0f0] text-gray-800 text-[11px] font-medium px-3 py-1 rounded-md">
                                Produit point rouge non éligible aux promotions
                              </span>
                            </div>
                          </div>

                          {/* Bottom Row: Quantity & Delete & Price */}
                          <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-4">
                              {/* Quantity Dropdown Pill */}
                              <div className="relative">
                                <select
                                  value={item.quantity}
                                  onChange={(e) =>
                                    updateQuantity(item.product.id, parseInt(e.target.value, 10))
                                  }
                                  className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-bold text-black appearance-none pr-7 cursor-pointer outline-none focus:border-black"
                                >
                                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((qty) => (
                                    <option key={qty} value={qty}>
                                      {qty}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2 top-2.5 pointer-events-none" />
                              </div>

                              {/* Delete Button */}
                              <button
                                onClick={() => removeItem(item.product.id)}
                                className="text-xs font-bold text-gray-700 hover:text-black uppercase tracking-wider hover:underline transition-colors"
                              >
                                SUPPRIMER
                              </button>
                            </div>

                            {/* Price Aligned Right */}
                            <div className="text-right">
                              <div className="text-base sm:text-lg font-black text-black">
                                {item.product.price}
                              </div>
                              <div className="text-[11px] text-gray-400 font-medium mt-0.5">
                                1 400 DA / 100ml
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-200/80 space-y-4 shadow-2xs">
                <p className="text-base font-bold text-gray-700">Votre panier est actuellement vide.</p>
                <Link
                  href="/shop/maquillage"
                  className="inline-block bg-black text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
                >
                  Découvrir nos produits
                </Link>
              </div>
            )}
          </div>

          {/* Right Column (Sidebar Widgets) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Widget 1: My Eclora Loyalty */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-2xs space-y-5">
              <div className="flex items-center gap-3">
                {/* Barcode Striped Logo */}
                <div className="flex items-center gap-0.5 text-black">
                  <span className="w-1.5 h-6 bg-black block" />
                  <span className="w-0.5 h-6 bg-black block" />
                  <span className="w-1.5 h-6 bg-black block" />
                  <span className="w-2 h-6 bg-black block" />
                </div>
                <div>
                  <div className="text-xs font-black tracking-[0.18em] uppercase text-black">
                    MY ECLORA
                  </div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    LE PROGRAMME DE FIDÉLITÉ
                  </div>
                </div>
              </div>

              <button className="w-full bg-white border border-gray-200 rounded-xl p-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors text-left group">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                  </div>
                  <span className="text-xs font-bold text-black group-hover:underline">
                    Découvrez tous les avantages fidélité
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
              </button>
            </div>

            {/* Widget 2: Promo Code Accordion */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-2xs space-y-4">
              <button
                onClick={() => setIsPromoOpen(!isPromoOpen)}
                className="w-full flex items-center justify-between text-left"
              >
                <h3 className="text-sm font-black text-black">
                  Avez-vous un code promo ?
                </h3>
                {isPromoOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>

              {isPromoOpen && (
                <form onSubmit={handleApplyPromo} className="space-y-3 pt-1 animate-fade-in">
                  <label className="text-xs font-bold text-gray-700 block">
                    Code promo
                  </label>
                  <div className="flex gap-2.5">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="WELCOME5"
                      className="flex-1 bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-black font-semibold outline-none focus:border-black uppercase transition-all"
                    />
                    <button
                      type="submit"
                      className="bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors shadow-xs uppercase tracking-wide"
                    >
                      Appliquer
                    </button>
                  </div>
                  {promoApplied ? (
                    <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Code promo appliqué : −{formatDA(promoDiscount)}
                    </p>
                  ) : promoError ? (
                    <p className="text-[11px] text-red-600 font-bold">{promoError}</p>
                  ) : (
                    <p className="text-[11px] text-gray-500 font-normal leading-tight">
                      Saisissez le code sans espaces entre les caractères.
                    </p>
                  )}
                </form>
              )}
            </div>

            {/* Widget 3: Order Summary (Récapitulatif) */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-2xs space-y-5">
              <h3 className="text-base font-black text-black tracking-tight">
                Récapitulatif
              </h3>

              <div className="space-y-3 text-xs border-b border-gray-100 pb-4">
                <div className="flex items-center justify-between text-gray-800 font-semibold">
                  <span>Sous-total</span>
                  <span className="font-bold text-black text-sm">
                    {Math.round(subtotal)} DA
                  </span>
                </div>

                {promoApplied && (
                  <div className="flex items-center justify-between text-emerald-600 font-semibold">
                    <span>Remise fidélité (-10%)</span>
                    <span className="font-bold">- {Math.round(discount)} DA</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-gray-600">
                  <span className="flex items-center gap-1">
                    <span>Livraison</span>
                    <Info className="w-3.5 h-3.5 text-gray-400" />
                  </span>
                  <span className="text-gray-700 font-medium">
                    Calculé à l&apos;étape paiement
                  </span>
                </div>
              </div>

              {/* Final Total */}
              <div className="flex items-center justify-between text-sm font-black text-black">
                <span>Total estimé</span>
                <span className="text-xl font-black text-black">
                  {formatDA(Math.round(finalTotal))}
                </span>
              </div>

              {/* Checkout Action Button */}
              {items.length === 0 ? (
                <button
                  disabled
                  className="w-full bg-black text-white text-xs sm:text-sm font-black uppercase tracking-wider py-4 rounded-xl opacity-50 flex items-center justify-center gap-2"
                >
                  <span>Valider mon panier</span>
                </button>
              ) : (
                <Link
                  href="/commande"
                  className="w-full bg-black text-white text-xs sm:text-sm font-black uppercase tracking-wider py-4 rounded-xl hover:bg-neutral-800 active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <span>Commander sans compte</span>
                </Link>
              )}

              {/* Security & Guarantees */}
              <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-gray-500 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Paiement 100% sécurisé & expédition rapide</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
