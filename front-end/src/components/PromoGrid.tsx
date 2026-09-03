'use client';

import React from 'react';
import Link from 'next/link';

interface PromoGridProps {
  onDiscover: () => void;
}

export default function PromoGrid({ onDiscover }: PromoGridProps) {
  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1 - Exclusivité web */}
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-200/90 flex flex-col justify-between shadow-2xs hover:shadow-md transition-shadow group">
          <div className="w-full h-[200px] sm:h-[240px] relative overflow-hidden bg-neutral-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=85"
              alt="Exclusivité web beauty products"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="p-5 sm:p-6 bg-white flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-black tracking-tight mb-1.5">
                Exclusivité web
              </h3>
              <div className="mb-2">
                <span className="text-2xl sm:text-3xl font-black text-black block leading-none">
                  Jusqu&apos;à -30%
                </span>
                <span className="text-xs sm:text-sm text-neutral-800 font-medium mt-1 block">
                  sur une sélection de produits*.
                </span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <Link
                href="/shop/maquillage"
                className="w-full py-3 sm:py-3.5 rounded-xl border border-black text-black font-extrabold text-sm hover:bg-black hover:text-white transition-all text-center block shadow-2xs"
              >
                Découvrir
              </Link>
              <p className="text-[11px] text-gray-500 font-normal">
                *Offre fidélité en Algérie. Hors Point Rouge.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2 - Place au renouveau */}
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-200/90 flex flex-col justify-between shadow-2xs hover:shadow-md transition-shadow group">
          <div className="w-full h-[200px] sm:h-[240px] relative overflow-hidden bg-neutral-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=85"
              alt="Skincare skincare lineup"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="p-5 sm:p-6 bg-white flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-black tracking-tight mb-1.5">
                Place au renouveau
              </h3>
              <p className="text-xs sm:text-sm text-neutral-800 font-normal leading-relaxed">
                Préparez-vous à une nouvelle saison beauté avec nos favoris.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/shop/soin-visage"
                className="w-full py-3 sm:py-3.5 rounded-xl border border-black text-black font-extrabold text-sm hover:bg-black hover:text-white transition-all text-center block shadow-2xs"
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
