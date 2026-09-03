'use client';

import React from 'react';
import Link from 'next/link';

interface PromoGridProps {
  onDiscover: () => void;
}

export default function PromoGrid({ onDiscover }: PromoGridProps) {
  return (
    <section className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 mt-4 sm:mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Card 1 - Exclusivité web */}
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-200/90 flex flex-col sm:flex-row shadow-2xs hover:shadow-md transition-shadow group">
          {/* Left Image (~46%) */}
          <div className="w-full sm:w-[46%] h-[180px] sm:h-auto sm:min-h-[220px] relative overflow-hidden bg-gradient-to-r from-pink-400 to-amber-300 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=85"
              alt="Exclusivité web beauty products"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Right Content (~54%) */}
          <div className="w-full sm:w-[54%] p-5 sm:p-6 bg-white flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-base sm:text-lg font-black text-black tracking-tight mb-2 font-sans">
                Exclusivité web
              </h3>
              <div className="flex items-center gap-3">
                <div className="text-left">
                  <span className="text-xs font-black uppercase text-black block leading-none">
                    Jusqu&apos;à
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-black leading-none">
                    -30%
                  </span>
                </div>
                <span className="text-xs text-neutral-800 font-medium leading-tight">
                  sur une sélection de produits*.
                </span>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <Link
                href="/shop/maquillage"
                className="w-full py-2.5 sm:py-3 rounded-lg border border-black text-black font-extrabold text-xs sm:text-sm hover:bg-black hover:text-white transition-all text-center block shadow-2xs"
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
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-200/90 flex flex-col sm:flex-row shadow-2xs hover:shadow-md transition-shadow group">
          {/* Left Image (~46%) */}
          <div className="w-full sm:w-[46%] h-[180px] sm:h-auto sm:min-h-[220px] relative overflow-hidden bg-neutral-100 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=85"
              alt="Skincare skincare lineup"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Right Content (~54%) */}
          <div className="w-full sm:w-[54%] p-5 sm:p-6 bg-white flex flex-col justify-between space-y-4">
            <div>
              <div className="inline-block bg-[#f4ece4] px-2.5 py-1 rounded-md mb-2">
                <h3 className="text-xs sm:text-sm font-black text-black tracking-tight font-sans">
                  Place au renouveau
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-neutral-800 font-normal leading-snug">
                Préparez-vous à une nouvelle saison beauté avec nos favoris.
              </p>
            </div>

            <div className="pt-1">
              <Link
                href="/shop/soin-visage"
                className="w-full py-2.5 sm:py-3 rounded-lg border border-black text-black font-extrabold text-xs sm:text-sm hover:bg-black hover:text-white transition-all text-center block shadow-2xs"
              >
                Découvrir
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
