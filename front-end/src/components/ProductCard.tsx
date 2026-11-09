'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, Heart, Star } from 'lucide-react';
import type { Product } from '@/data/products';

/** Availability label shared by cards and the product page. */
export function stockLabel(stock: number | undefined): { text: string; tone: 'ok' | 'low' | 'out' } {
  if (stock === undefined) return { text: 'Disponible', tone: 'ok' };
  if (stock <= 0) return { text: 'Rupture de stock', tone: 'out' };
  if (stock <= 5) return { text: `Plus que ${stock} en stock`, tone: 'low' };
  return { text: 'En stock', tone: 'ok' };
}

export const STOCK_TONE = {
  ok: 'text-emerald-700',
  low: 'text-amber-600',
  out: 'text-red-600',
} as const;

interface Props {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (id: string) => void;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, isWishlisted, onToggleWishlist, onAddToCart }: Props) {
  const [added, setAdded] = useState(false);
  const href = `/product/${product.slug ?? product.id}`;
  const stock = stockLabel(product.stock);
  const soldOut = stock.tone === 'out';
  const badge = product.badge ?? (product.isNew ? 'Nouveauté' : product.isBestSeller ? 'Best-seller' : null);

  const add = () => {
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-2 transition-colors duration-200 hover:border-gray-400 sm:p-3">
      <div>
        <div className="mb-1 flex min-h-[28px] items-center justify-between">
          {badge ? (
            <span className="rounded bg-black px-2 py-1 text-[10px] font-bold text-white sm:text-[11px]">{badge}</span>
          ) : (
            <span />
          )}
          <button
            onClick={() => onToggleWishlist(product.id)}
            className="rounded-full p-1 text-black transition-colors hover:bg-gray-100"
            aria-label={isWishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-[#d80075] text-[#d80075]' : 'stroke-[1.75] text-black'}`} />
          </button>
        </div>

        <Link href={href} className="relative mb-2 flex h-[170px] w-full items-center justify-center overflow-hidden bg-white sm:h-[230px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.title}
            loading="lazy"
            className={`h-full w-full object-contain transition-transform duration-200 group-hover:scale-105 ${soldOut ? 'opacity-50' : ''}`}
          />
        </Link>

        <div className="mb-1 line-clamp-1 text-[11px] font-extrabold uppercase tracking-tight text-black sm:text-[13px]">
          {product.brandSlug ? (
            <Link href={`/marques/${product.brandSlug}`} className="hover:underline">
              {product.brand}
            </Link>
          ) : (
            product.brand
          )}
        </div>
        <Link href={href} className="line-clamp-2 min-h-[36px] text-[13px] font-medium leading-snug text-neutral-900 hover:underline sm:min-h-[40px] sm:text-sm">
          {product.title}
        </Link>
        {product.volume && <div className="mt-0.5 text-[11px] text-gray-500 sm:text-xs">{product.volume}</div>}

        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-base font-black text-black sm:text-lg">{product.price}</span>
          {product.originalPrice && <span className="text-[10px] text-gray-400 line-through sm:text-[11px]">{product.originalPrice}</span>}
        </div>

        {product.reviewsCount > 0 && (
          <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-black">
            <div className="flex">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${i < Math.round(product.rating) ? 'fill-black text-black' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="text-[10px] sm:text-[11px]">{product.reviewsCount}</span>
          </div>
        )}
        <div className={`mt-1 text-[11px] font-semibold sm:text-xs ${STOCK_TONE[stock.tone]}`}>{stock.text}</div>
      </div>

      <button
        onClick={add}
        disabled={soldOut}
        className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border-2 py-2.5 text-xs font-bold transition-colors sm:text-sm ${
          soldOut
            ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
            : added
            ? 'border-emerald-600 bg-emerald-600 text-white'
            : 'border-black bg-white text-black hover:bg-black hover:text-white'
        }`}
      >
        {soldOut ? 'Indisponible' : added ? (<><Check className="h-4 w-4" /> Ajouté</>) : 'Ajouter au panier'}
      </button>
    </div>
  );
}
