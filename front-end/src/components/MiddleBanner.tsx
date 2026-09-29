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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 sm:gap-5">
        {/* Card 1 - Plus qu'un parfum, une émotion */}
        <div className="group flex flex-col overflow-hidden rounded-xl border border-gray-300 bg-white transition-shadow hover:shadow-sm sm:h-[210px] sm:flex-row">
          {/* Left Image (~44%) */}
          <div className="relative h-[180px] w-full flex-shrink-0 overflow-hidden bg-neutral-900 sm:h-full sm:w-[45%]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={first?.imageUrl || '/images/image copy 13.png'}
              alt={first?.title || "Plus qu'un parfum, une émotion"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Right Content (~56%) */}
          <div className="flex w-full flex-col justify-between bg-white p-4 sm:w-[55%] sm:p-5">
            <div>
              <h3 className="mb-2 font-sans text-sm font-black tracking-tight text-black sm:text-base">
                {first?.title || "Plus qu'un parfum, une émotion"}
              </h3>
              <p className="text-xs font-semibold leading-snug text-neutral-900 sm:text-[13px]">
                {first?.description || 'Senteurs fruitées, florales ou chaleureuses à votre image.'}
              </p>
            </div>

            <div className="pt-2">
              <Link
                href={first?.link || '/shop/parfum'}
                className="block w-full rounded-lg border-2 border-black py-2 text-center text-xs font-extrabold text-black transition-colors hover:bg-black hover:text-white sm:text-sm"
              >
                {first?.buttonText || 'Découvrir'}
              </Link>
            </div>
          </div>
        </div>

        {/* Card 2 - Avant-première Erborian */}
        <div className="group flex flex-col overflow-hidden rounded-xl border border-gray-300 bg-white transition-shadow hover:shadow-sm sm:h-[210px] sm:flex-row">
          {/* Left Image (~44%) */}
          <div className="relative h-[180px] w-full flex-shrink-0 overflow-hidden bg-gradient-to-br from-orange-300 via-amber-200 to-orange-400 sm:h-full sm:w-[45%]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={second?.imageUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=85'}
              alt={second?.title || 'Avant-première'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Right Content (~56%) */}
          <div className="flex w-full flex-col justify-between bg-white p-4 sm:w-[55%] sm:p-5">
            <div>
              <h3 className="mb-2 font-sans text-sm font-black tracking-tight text-black sm:text-base">
                {second?.title || 'Avant-première Erborian'}
              </h3>
              <p className="text-xs font-semibold leading-snug text-neutral-900 sm:text-[13px]">
                {second?.description || 'Triple Care BB Milk. Testez ce soin 3-en-1 : sérum, hydratant et base de teint.'}
              </p>
            </div>

            <div className="pt-2">
              <Link
                href={second?.link || '/shop/soin'}
                className="block w-full rounded-lg border-2 border-black py-2 text-center text-xs font-extrabold text-black transition-colors hover:bg-black hover:text-white sm:text-sm"
              >
                {second?.buttonText || 'Découvrir'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
