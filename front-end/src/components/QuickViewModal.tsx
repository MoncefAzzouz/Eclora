'use client';

import React, { useState } from 'react';
import { X, Star, Heart, ShoppingBag, Check } from 'lucide-react';
import { Product } from '@/data/products';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
}

export default function QuickViewModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
}: QuickViewModalProps) {
  const [addedSuccess, setAddedSuccess] = useState(false);

  if (!isOpen || !product) return null;

  const handleAdd = () => {
    onAddToCart(product);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl z-10 border border-gray-100 animate-fade-in my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-black rounded-full hover:bg-gray-100 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product Image Side */}
          <div className="bg-gray-50 p-6 flex items-center justify-center relative min-h-[300px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image}
              alt={product.title}
              className="max-h-[320px] w-auto object-contain rounded-xl"
            />
            {product.badge && (
              <span className="absolute top-4 left-4 bg-black text-white text-xs font-bold px-3 py-1 rounded-md">
                {product.badge}
              </span>
            )}
          </div>

          {/* Details Side */}
          <div className="p-6 flex flex-col justify-between">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-black">
                {product.brand}
              </div>
              <h2 className="text-base font-bold text-gray-900 mt-1 leading-snug">
                {product.title}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-1.5 mt-2">
                <div className="flex text-black">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-black text-black" />
                  ))}
                </div>
                <span className="text-xs text-gray-500 font-medium">
                  {product.reviewsCount} avis
                </span>
              </div>

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-black">{product.price}</span>
                {product.originalPrice && (
                  <span className="text-xs text-gray-400 line-through">
                    {product.originalPrice}
                  </span>
                )}
              </div>

              {/* Description preview */}
              <p className="text-xs text-gray-600 mt-3 leading-relaxed">
                Découvrez l&apos;incontournable de chez {product.brand}. Formule haute performance, texture agréable et tenue longue durée garanties.
              </p>

              {product.shadeInfo && (
                <div className="mt-4 p-3 bg-gray-50 rounded-xl text-xs font-semibold text-gray-700">
                  ✨ {product.shadeInfo}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              <button
                onClick={handleAdd}
                className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
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
                className="w-full py-2.5 rounded-xl border border-gray-300 text-black font-semibold text-xs hover:border-black transition-colors flex items-center justify-center gap-2"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isWishlisted ? 'fill-[#d80075] text-[#d80075]' : 'text-black'
                  }`}
                />
                <span>
                  {isWishlisted ? 'Ajouté aux favoris' : 'Ajouter à la liste de souhaits'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
