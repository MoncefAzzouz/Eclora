'use client';

import React from 'react';
import Link from 'next/link';

interface PromoGridProps {
  onDiscover: () => void;
}

export default function PromoGrid({ onDiscover }: PromoGridProps) {
  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-4 sm:mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Card 1 - Exclusivité web */}
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-200/90 flex flex-col sm:flex-row sm:h-[230px] shadow-2xs hover:shadow-md transition-shadow group">
          {/* Left Image (~44%) */}
          <div className="w-full sm:w-[44%] h-[180px] sm:h-full relative overflow-hidden bg-gradient-to-br from-pink-400 via-orange-300 to-amber-300 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=85"
              alt="Exclusivité web beauty products"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Right Content (~56%) */}
          <div className="w-full sm:w-[56%] p-5 sm:p-6 bg-white flex flex-col justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-black text-black tracking-tight mb-1.5 font-sans">
                Exclusivité web
              </h3>
              <div className="flex items-center gap-3">
                <div className="text-left flex-shrink-0">
                  <span className="text-[11px] font-black uppercase text-black block leading-none">
                    Jusqu&apos;à
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-black leading-none">
                    -30%
                  </span>
                </div>
                <span className="text-xs text-neutral-800 font-medium leading-snug">
                  sur une sélection de produits*.
                </span>
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <Link
                href="/shop/maquillage"
                className="w-full py-2.5 rounded-lg border border-black text-black font-extrabold text-xs sm:text-sm hover:bg-black hover:text-white transition-all text-center block shadow-2xs"
              >
                Découvrir
              </Link>
              <p className="text-[10px] text-gray-500 font-normal leading-tight">
                *Offre fidélité. Hors Point Rouge. Voir conditions <span className="underline cursor-pointer">ici</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2 - Place au renouveau */}
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-200/90 flex flex-col sm:flex-row sm:h-[230px] shadow-2xs hover:shadow-md transition-shadow group">
          {/* Left Image (~44%) */}
          <div className="w-full sm:w-[44%] h-[180px] sm:h-full relative overflow-hidden bg-[#e8ded4] flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=85"
              alt="Skincare skincare lineup"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Right Content (~56%) */}
          <div className="w-full sm:w-[56%] p-5 sm:p-6 bg-white flex flex-col justify-between">
            <div>
              <div className="inline-block bg-[#f4ece4] px-2.5 py-1 rounded-md mb-1.5">
                <h3 className="text-xs sm:text-sm font-black text-black tracking-tight font-sans">
                  Place au renouveau
                </h3>
              </div>
              <p className="text-xs text-neutral-800 font-medium leading-snug">
                Préparez-vous à une nouvelle saison beauté avec nos favoris.
              </p>
            </div>

            <div className="space-y-1 pt-2">
              <Link
                href="/shop/soin-visage"
                className="w-full py-2.5 rounded-lg border border-black text-black font-extrabold text-xs sm:text-sm hover:bg-black hover:text-white transition-all text-center block shadow-2xs"
              >
                Découvrir
              </Link>
              <p className="text-[10px] text-gray-500 font-normal leading-tight">
                *Voir sélection de soins et nouveautés.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
