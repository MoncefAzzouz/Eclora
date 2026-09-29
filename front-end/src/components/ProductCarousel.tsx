'use client';

import React, { useEffect, useRef, useState } from 'react';
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
  const [isAutoPlayPaused, setIsAutoPlayPaused] = useState(false);

  useEffect(() => {
    if (isAutoPlayPaused) return;

    const interval = window.setInterval(() => {
      const carousel = carouselRef.current;
      if (!carousel || carousel.scrollWidth <= carousel.clientWidth) return;

      const isAtEnd = carousel.scrollLeft >= carousel.scrollWidth - carousel.clientWidth - 12;
      const firstCard = carousel.firstElementChild as HTMLElement | null;
      const gap = Number.parseFloat(window.getComputedStyle(carousel).columnGap) || 0;
      const step = (firstCard?.offsetWidth ?? 240) + gap;
      carousel.scrollTo({
        left: isAtEnd ? 0 : carousel.scrollLeft + step,
        behavior: 'smooth',
      });
    }, 3000);

    return () => window.clearInterval(interval);
  }, [isAutoPlayPaused, products.length]);

  const handleScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const firstCard = carouselRef.current.firstElementChild as HTMLElement | null;
      const gap = Number.parseFloat(window.getComputedStyle(carouselRef.current).columnGap) || 0;
      const step = (firstCard?.offsetWidth ?? 240) + gap;
      const scrollAmount = direction === 'left' ? -step : step;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="mx-auto mt-10 max-w-[1440px] px-4 sm:mt-14 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5">
        <h2 className="font-sans text-xl font-black tracking-tight text-black sm:text-[28px] sm:leading-tight">
          {title}
        </h2>
        <button className="flex-shrink-0 rounded-lg border border-gray-300 px-4 py-1.5 text-xs font-bold text-black transition-colors hover:border-black sm:text-sm">
          Voir tout
        </button>
      </div>

      {/* Carousel Container with Arrows */}
      <div
        className="relative group"
        onMouseEnter={() => setIsAutoPlayPaused(true)}
        onMouseLeave={() => setIsAutoPlayPaused(false)}
        onFocusCapture={() => setIsAutoPlayPaused(true)}
        onBlurCapture={() => setIsAutoPlayPaused(false)}
      >
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
          className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto pb-5 pt-1 sm:gap-4"
        >
          {products.map((product) => {
            const isWishlisted = wishlist.includes(product.id);

            return (
              <div
                key={product.id}
                className="group/card relative flex w-[200px] flex-none snap-start flex-col justify-between rounded-lg border border-gray-300 bg-white p-2.5 transition-colors hover:border-gray-400 sm:w-[220px] sm:p-3 md:w-[240px]"
              >
                <div>
                  {/* Top Badges & Wishlist Button */}
                  <div className="mb-1 flex items-center justify-between">
                    {product.badge ? (
                      <span className="rounded bg-black px-2 py-1 text-[10px] font-bold tracking-tight text-white sm:text-[11px]">
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
                      className="z-10 rounded-full p-1 transition-colors hover:bg-gray-100 text-black"
                      aria-label="Wishlist toggle"
                    >
                      <Heart
                        className={`h-5 w-5 ${
                          isWishlisted ? 'fill-[#d80075] text-[#d80075]' : 'text-black stroke-[1.5]'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Product Image Link */}
                  <Link
                    href={`/product/${product.id}`}
                    className="relative my-1.5 flex h-[180px] w-full cursor-pointer items-center justify-center overflow-hidden bg-white sm:h-[210px]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.image}
                      alt={product.title}
                      className="h-full w-full scale-[1.3] object-contain transition-transform duration-300 group-hover/card:scale-[1.36]"
                    />
                  </Link>

                  {/* Product Info */}
                  <div className="mt-2">
                    <div className="text-[11px] font-black uppercase tracking-wide text-black sm:text-xs">
                      {product.brand}
                    </div>
                    <Link
                      href={`/product/${product.id}`}
                      className="mt-1 block min-h-[34px] cursor-pointer line-clamp-2 text-[12px] font-medium leading-[1.4] text-gray-900 hover:underline sm:text-[13px]"
                    >
                      {product.title}
                    </Link>
                    {product.volume && (
                      <div className="mt-0.5 text-[11px] text-gray-500 sm:text-xs">{product.volume}</div>
                    )}

                    {/* Price Display */}
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-base font-extrabold text-black sm:text-lg">
                        {product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-[10px] text-gray-400 line-through sm:text-[11px]">
                          {product.originalPrice}
                        </span>
                      )}
                    </div>

                    {/* Rating & Reviews */}
                    <div className="mt-1 flex items-center gap-1 text-xs">
                      <div className="flex text-black">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-black text-black" />
                        ))}
                      </div>
                      <span className="text-[10px] font-normal text-gray-500 sm:text-[11px]">
                        {product.reviewsCount} avis
                      </span>
                    </div>

                    {/* Format / Shade info tag */}
                    {product.shadeInfo && (
                      <div className="mt-1 text-[10px] font-medium text-gray-500 sm:text-[11px]">
                        {product.shadeInfo}
                      </div>
                    )}
                    {product.tags && product.tags.length > 0 && (
                      <div className="mt-0.5 text-[10px] text-gray-500 sm:text-[11px]">
                        {product.tags.join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                {/* CTA Action Button */}
                <div className="mt-3 pt-1.5">
                  <Link
                    href={`/product/${product.id}`}
                    className="block w-full rounded-lg border-2 border-black py-2 text-center text-xs font-bold text-black transition-colors hover:bg-black hover:text-white sm:text-sm"
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
