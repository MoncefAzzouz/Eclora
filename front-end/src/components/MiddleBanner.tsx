'use client';

import React from 'react';
import Link from 'next/link';
import type { ApiBanner } from '@/lib/shop/api';

interface MiddleBannerProps {
  onDiscover: () => void;
  /** «Promo milieu» banners from the admin; the built-in cards are the fallback. */
  banners?: ApiBanner[];
}

export default function MiddleBanner({ onDiscover, banners }: MiddleBannerProps) {
  const first = banners?.[0];
  const second = banners?.[1];
  void onDiscover;

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Card 1 - Plus qu'un parfum, une émotion */}
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-200/90 flex flex-col sm:flex-row sm:h-[230px] shadow-2xs hover:shadow-md transition-shadow group">
          {/* Left Image (~44%) */}
          <div className="w-full sm:w-[44%] h-[180px] sm:h-full relative overflow-hidden bg-neutral-900 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={first?.imageUrl || '/images/image copy 13.png'}
              alt={first?.title || "Plus qu'un parfum, une émotion"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Right Content (~56%) */}
          <div className="w-full sm:w-[56%] p-5 sm:p-6 bg-white flex flex-col justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-black text-black tracking-tight mb-1.5 font-sans">
                {first?.title || "Plus qu'un parfum, une émotion"}
              </h3>
              <p className="text-xs text-neutral-800 font-medium leading-snug">
                {first?.description || 'Senteurs fruitées, florales ou chaleureuses à votre image.'}
              </p>
            </div>

            <div className="space-y-1 pt-2">
              <Link
                href={first?.link || '/shop/parfum'}
                className="w-full py-2.5 rounded-lg border border-black text-black font-extrabold text-xs sm:text-sm hover:bg-black hover:text-white transition-all text-center block shadow-2xs"
              >
                {first?.buttonText || 'Découvrir'}
              </Link>
              <p className="text-[10px] text-gray-500 font-normal leading-tight">
                *Voir nos offres et exclusivités en parfumerie.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2 - Avant-première Erborian */}
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-200/90 flex flex-col sm:flex-row sm:h-[230px] shadow-2xs hover:shadow-md transition-shadow group">
          {/* Left Image (~44%) */}
          <div className="w-full sm:w-[44%] h-[180px] sm:h-full relative overflow-hidden bg-gradient-to-br from-orange-300 via-amber-200 to-orange-400 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={second?.imageUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=85'}
              alt={second?.title || 'Avant-première'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Star Badge */}
            <div className="absolute top-2.5 left-2.5 bg-black/90 backdrop-blur-xs text-white rounded-full px-2 py-0.5 flex items-center gap-1 shadow-md">
              <span className="text-amber-300 text-[10px]">★</span>
              <span className="text-[9px] font-black uppercase tracking-wider">
                {second?.badge || 'AVANT-PREMIÈRE'}
              </span>
            </div>
          </div>

          {/* Right Content (~56%) */}
          <div className="w-full sm:w-[56%] p-5 sm:p-6 bg-white flex flex-col justify-between">
            <div>
              <div className="inline-block bg-[#f4ece4] px-2.5 py-1 rounded-md mb-1.5">
                <h3 className="text-xs sm:text-sm font-black text-black tracking-tight font-sans">
                  {second?.title || 'Avant-première Erborian'}
                </h3>
              </div>
              <p className="text-xs text-neutral-800 font-medium leading-snug">
                {second?.description || 'Triple Care BB Milk. Testez ce soin 3-en-1 : sérum, hydratant et base de teint.'}
              </p>
            </div>

            <div className="space-y-1 pt-2">
              <Link
                href={second?.link || '/shop/soin'}
                className="w-full py-2.5 rounded-lg border border-black text-black font-extrabold text-xs sm:text-sm hover:bg-black hover:text-white transition-all text-center block shadow-2xs"
              >
                {second?.buttonText || 'Découvrir'}
              </Link>
              <p className="text-[10px] text-gray-500 font-normal leading-tight">
                *À l&apos;exclusion des magasins de la marque.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
