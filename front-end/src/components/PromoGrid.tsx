'use client';

import React from 'react';
import Link from 'next/link';
import type { ApiBanner } from '@/lib/shop/api';

interface PromoGridProps {
  onDiscover: () => void;
  /** «Promo double» banners from the admin; the built-in cards are the fallback. */
  banners?: ApiBanner[];
}

export default function PromoGrid({ onDiscover, banners }: PromoGridProps) {
  const first = banners?.[0];
  const second = banners?.[1];
  void onDiscover;

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-4 sm:mt-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 sm:gap-5">
        {/* Card 1 - Exclusivité web */}
        <div className="group flex flex-col overflow-hidden rounded-xl border border-gray-300 bg-white transition-shadow hover:shadow-sm sm:h-[210px] sm:flex-row">
          {/* Left Image (~44%) */}
          <div className="relative h-[180px] w-full flex-shrink-0 overflow-hidden bg-gradient-to-br from-pink-400 via-orange-300 to-amber-300 sm:h-full sm:w-[45%]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={first?.imageUrl || '/images/image copy 12.png'}
              alt={first?.title || 'Exclusivité web'}
              className="w-full h-full object-cover object-[70%_center] group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Right Content (~56%) */}
          <div className="flex w-full flex-col justify-between bg-white p-4 sm:w-[55%] sm:p-5">
            <div>
              <h3 className="mb-2 font-sans text-sm font-black tracking-tight text-black sm:text-base">
                {first?.title || 'Exclusivité web'}
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 rounded-md bg-[#f3f3f3] px-3 py-2 text-left">
                  <span className="block text-lg font-black leading-tight text-black sm:text-xl">
                    {first?.subtitle || "Jusqu'à -30%"}
                  </span>
                </div>
                <span className="text-xs font-semibold leading-snug text-neutral-900 sm:text-[13px]">
                  {first?.description || 'sur une sélection de produits*.'}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <Link
                href={first?.link || '/shop/maquillage'}
                className="block w-full rounded-lg border-2 border-black py-2 text-center text-xs font-extrabold text-black transition-colors hover:bg-black hover:text-white sm:text-sm"
              >
                {first?.buttonText || 'Découvrir'}
              </Link>
              <p className="text-[10px] font-normal leading-tight text-gray-500 sm:text-[11px]">
                *Offre fidélité. Hors Point Rouge. Voir conditions <span className="underline cursor-pointer">ici</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2 - Place au renouveau */}
        <div className="group flex flex-col overflow-hidden rounded-xl border border-gray-300 bg-white transition-shadow hover:shadow-sm sm:h-[210px] sm:flex-row">
          {/* Left Image (~44%) */}
          <div className="relative h-[180px] w-full flex-shrink-0 overflow-hidden bg-[#e8ded4] sm:h-full sm:w-[45%]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={second?.imageUrl || '/images/image copy 11.png'}
              alt={second?.title || 'Nouveautés soin'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Right Content (~56%) */}
          <div className="flex w-full flex-col justify-between bg-white p-4 sm:w-[55%] sm:p-5">
            <div>
              <h3 className="mb-2 font-sans text-sm font-black tracking-tight text-black sm:text-base">
                {second?.title || 'Place au renouveau'}
              </h3>
              <p className="text-xs font-semibold leading-snug text-neutral-900 sm:text-[13px]">
                {second?.description || 'Préparez-vous à une nouvelle saison beauté avec nos favoris.'}
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
