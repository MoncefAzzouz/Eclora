'use client';

import React from 'react';
import Link from 'next/link';

interface MiddleBannerProps {
  onDiscover: () => void;
}

export default function MiddleBanner({ onDiscover }: MiddleBannerProps) {
  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1 - Plus qu'un parfum, une émotion */}
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-200/90 flex flex-col justify-between shadow-2xs hover:shadow-md transition-shadow group">
          {/* Top Half Image */}
          <div className="w-full h-[200px] sm:h-[240px] relative overflow-hidden bg-neutral-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=85"
              alt="Plus qu'un parfum, une émotion"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Bottom Half Content */}
          <div className="p-5 sm:p-6 bg-white flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-black tracking-tight mb-1.5">
                Plus qu&apos;un parfum, une émotion
              </h3>
              <p className="text-xs sm:text-sm text-neutral-800 font-normal leading-relaxed">
                Senteurs fruitées, florales ou chaleureuses à votre image.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/shop/parfum"
                className="w-full py-3 sm:py-3.5 rounded-xl border border-black text-black font-extrabold text-sm hover:bg-black hover:text-white transition-all text-center block shadow-2xs"
              >
                Découvrir
              </Link>
            </div>
          </div>
        </div>

        {/* Card 2 - Avant-première Erborian */}
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-200/90 flex flex-col justify-between shadow-2xs hover:shadow-md transition-shadow group">
          {/* Top Half Image with Badge */}
          <div className="w-full h-[200px] sm:h-[240px] relative overflow-hidden bg-gradient-to-r from-orange-200 to-amber-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=85"
              alt="Avant-première Erborian"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Round Badge */}
            <div className="absolute top-3 left-3 bg-black/90 backdrop-blur-xs text-white rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-md">
              <span className="text-amber-300 text-xs">★</span>
              <span className="text-[10px] font-black uppercase tracking-wider">
                AVANT-PREMIÈRE CHEZ ECLORA
              </span>
            </div>
          </div>

          {/* Bottom Half Content */}
          <div className="p-5 sm:p-6 bg-white flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-black tracking-tight mb-1.5">
                Avant-première Erborian
              </h3>
              <p className="text-xs sm:text-sm text-neutral-800 font-normal leading-relaxed">
                Triple Care BB Milk. Testez ce soin 3-en-1 : sérum, hydratant et base de teint.
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <Link
                href="/shop/soin-visage"
                className="w-full py-3 sm:py-3.5 rounded-xl border border-black text-black font-extrabold text-sm hover:bg-black hover:text-white transition-all text-center block shadow-2xs"
              >
                Découvrir
              </Link>
              <p className="text-[11px] text-gray-500 font-normal">
                *À l&apos;exclusion des magasins de la marque.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
