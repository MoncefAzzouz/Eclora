'use client';

import React from 'react';
import Link from 'next/link';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Product } from '@/data/products';

export interface CartItem {
  product: Product;
  quantity: number;
  shade?: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number, shade?: string) => void;
  onRemoveItem: (productId: string, shade?: string) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
}: CartDrawerProps) {
  if (!isOpen) return null;

  // Simple price parsing helper
  const parsePrice = (priceStr: string) => {
    const num = parseFloat(priceStr.replace(/[^0-9,.]/g, '').replace(',', '.'));
    return isNaN(num) ? 35.0 : num;
  };

  const subtotal = items.reduce(
    (acc, item) => acc + parsePrice(item.product.price) * item.quantity,
    0
  );

  const freeShippingThreshold = 12000;
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-black" />
              <h2 className="text-lg font-black text-black uppercase tracking-wide">
                Mon Panier ({items.reduce((sum, i) => sum + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-[#fce3e7] p-4 text-xs">
            {remainingForFreeShipping > 0 ? (
              <p className="font-semibold text-black mb-1.5">
                Plus que <span className="font-bold">{Math.round(remainingForFreeShipping)} DA</span> pour bénéficier de la <span className="underline font-bold">Livraison offerte</span> !
              </p>
            ) : (
              <p className="font-bold text-[#d80075] mb-1.5">
                Félicitations ! Vous bénéficiez de la livraison offerte ! 🎉
              </p>
            )}
            <div className="w-full bg-white rounded-full h-2 overflow-hidden border border-pink-200">
              <div
                className="bg-[#d80075] h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-gray-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <ShoppingBag className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-sm font-bold text-gray-700">Votre panier est vide</p>
                <p className="text-xs text-gray-500 mt-1">Découvrez nos best-sellers et promotions !</p>
              </div>
            ) : (
              items.map(({ product, quantity, shade }) => (
                <div key={`${product.id}-${shade ?? 'default'}`} className="py-4 flex gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-20 h-20 object-cover rounded-xl border border-gray-100 flex-shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-[11px] font-black uppercase text-black">
                            {product.brand}
                          </div>
                          <h4 className="text-xs text-gray-800 font-medium line-clamp-2">
                            {product.title}
                          </h4>
                          {shade && <p className="mt-0.5 text-[11px] text-gray-500">{shade}</p>}
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(product.id, shade)}
                          aria-label={`Supprimer ${product.title} du panier`}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(product.id, -1, shade)}
                          className="px-2.5 py-1 text-xs font-bold text-gray-700 hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="px-3 text-xs font-bold text-black">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(product.id, 1, shade)}
                          className="px-2.5 py-1 text-xs font-bold text-gray-700 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm font-extrabold text-black">{product.price}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="p-5 border-t border-gray-200 bg-gray-50 space-y-4">
              <div className="flex items-center justify-between text-sm font-bold text-black">
                <span>Sous-total</span>
                <span className="text-base">{Math.round(subtotal)} DA</span>
              </div>
              <p className="text-[11px] text-gray-500">Taxes incluses et frais de port calculés au paiement.</p>
              <Link
                href="/panier"
                onClick={onClose}
                className="w-full bg-black text-white py-3.5 rounded-xl font-bold text-sm hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 block text-center"
              >
                <span>Voir mon panier</span>
                <ArrowRight className="w-4 h-4 inline" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
