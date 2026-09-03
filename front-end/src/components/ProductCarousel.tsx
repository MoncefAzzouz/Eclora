'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Heart, Star } from 'lucide-react';
import { Product } from '@/data/products';

interface ProductCarouselProps {
  title: string;
  products: Product[];
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  onOpenQuickView: (product: Product) => void;
}

export default function ProductCarousel({
  title,
  products,
  wishlist,
  onToggleWishlist,
}: ProductCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight font-sans">
          {title}
        </h2>
        <button className="px-4 py-1.5 rounded-lg border border-gray-300 text-black text-xs font-bold hover:border-black transition-colors">
          Voir tout
        </button>
      </div>

      {/* Carousel Container with Arrows */}
      <div className="relative group">
        {/* Left Floating Scroll Arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/95 rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-black hover:scale-110 transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Right Floating Scroll Arrow */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Scrollable Track */}
        <div
          ref={carouselRef}
          onScroll={handleScroll}
          className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-6 pt-2 snap-x snap-mandatory"
        >
          {products.map((product) => {
            const isWishlisted = wishlist.includes(product.id);

            return (
              <div
                key={product.id}
                className="flex-none w-[220px] sm:w-[250px] md:w-[270px] snap-start bg-white rounded-2xl border border-gray-200/80 p-4 flex flex-col justify-between hover:shadow-xl transition-all duration-300 group/card relative"
              >
                <div>
                  {/* Top Badges & Wishlist Button */}
                  <div className="flex items-center justify-between mb-2">
                    {product.badge ? (
                      <span className="bg-black text-white text-[11px] font-bold px-2.5 py-1 rounded-md tracking-tight">
                        {product.badge}
                      </span>
                    ) : (
                      <div />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWishlist(product.id);
                      }}
                      className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-black z-10"
                      aria-label="Wishlist toggle"
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
                    className="w-full h-[180px] sm:h-[200px] my-2 relative overflow-hidden rounded-xl cursor-pointer flex items-center justify-center bg-gray-50 block"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                    />
                  </Link>

                  {/* Product Info */}
                  <div className="mt-3">
                    <div className="text-xs font-black text-black uppercase tracking-wider">
                      {product.brand}
                    </div>
                    <Link
                      href={`/product/${product.id}`}
                      className="text-xs text-gray-900 font-medium line-clamp-2 mt-1 hover:underline cursor-pointer min-h-[32px] block"
                    >
                      {product.title}
                    </Link>
                    {product.volume && (
                      <div className="text-[11px] text-gray-500 mt-0.5">{product.volume}</div>
                    )}

                    {/* Price Display */}
                    <div className="mt-2.5 flex items-baseline gap-2">
                      <span className="text-sm sm:text-base font-extrabold text-black">
                        {product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-[10px] text-gray-400 line-through">
                          {product.originalPrice}
                        </span>
                      )}
                    </div>

                    {/* Rating & Reviews */}
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

                    {/* Format / Shade info tag */}
                    {product.shadeInfo && (
                      <div className="text-[10px] text-gray-500 mt-1 font-medium">
                        {product.shadeInfo}
                      </div>
                    )}
                    {product.tags && product.tags.length > 0 && (
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        {product.tags.join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                {/* CTA Action Button */}
                <div className="mt-4 pt-2">
                  <Link
                    href={`/product/${product.id}`}
                    className="w-full py-2.5 rounded-xl border border-black text-black font-bold text-xs hover:bg-black hover:text-white transition-all text-center block"
                  >
                    Découvrir
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
