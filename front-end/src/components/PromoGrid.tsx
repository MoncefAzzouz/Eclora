'use client';

import React from 'react';

interface PromoGridProps {
  onDiscover: () => void;
}

export default function PromoGrid({ onDiscover }: PromoGridProps) {
  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Card - Exclusivité web */}
        <div className="bg-[#fff0f3] rounded-2xl overflow-hidden border border-pink-100 flex flex-col sm:flex-row items-stretch shadow-xs hover:shadow-md transition-shadow">
          <div className="w-full sm:w-1/2 min-h-[220px] relative bg-cover bg-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80"
              alt="Exclusivité web beauty products"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-full sm:w-1/2 p-6 flex flex-col justify-between bg-white/60 backdrop-blur-xs">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-black tracking-tight mb-1">
                Exclusivité web
              </h3>
              <div className="my-2">
                <span className="text-xl sm:text-2xl font-black text-black block leading-tight">
                  Jusqu&apos;à -30%
                </span>
                <span className="text-xs sm:text-sm text-gray-800 font-medium">
                  sur une sélection de produits*.
                </span>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={onDiscover}
                className="px-6 py-2.5 rounded-full border border-black text-black font-bold text-xs hover:bg-black hover:text-white transition-colors"
              >
                Découvrir
              </button>
              <p className="text-[10px] text-gray-500 mt-3 font-normal leading-normal">
                *Offre fidélité. Hors Point Rouge. Voir conditions <span className="underline cursor-pointer">ici</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Right Card - Place au renouveau */}
        <div className="bg-[#f9f6f0] rounded-2xl overflow-hidden border border-amber-100/60 flex flex-col sm:flex-row items-stretch shadow-xs hover:shadow-md transition-shadow">
          <div className="w-full sm:w-1/2 min-h-[220px] relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80"
              alt="Skincare skincare lineup"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-full sm:w-1/2 p-6 flex flex-col justify-between bg-white/60 backdrop-blur-xs">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-black tracking-tight mb-2">
                Place au renouveau
              </h3>
              <p className="text-xs sm:text-sm text-gray-700 font-normal leading-relaxed">
                Préparez-vous à une nouvelle saison beauté avec nos favoris.
              </p>
            </div>

            <div className="mt-6">
              <button
                onClick={onDiscover}
                className="px-6 py-2.5 rounded-full border border-black text-black font-bold text-xs hover:bg-black hover:text-white transition-colors"
              >
                Découvrir
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
