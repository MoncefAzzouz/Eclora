'use client';

import React from 'react';

interface HeroBannerProps {
  onDiscover: () => void;
}

export default function HeroBanner({ onDiscover }: HeroBannerProps) {
  return (
    <section className="relative w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6">
      <div className="relative overflow-hidden rounded-2xl bg-neutral-900 min-h-[380px] sm:min-h-[460px] md:min-h-[520px] flex items-center shadow-md">
        {/* Hero Background Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1800&q=85"
          alt="Dior Miss Dior Campaign"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Ambient overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/10 pointer-events-none" />

        {/* Floating White Dior Card (Right side) */}
        <div className="relative z-10 w-full flex justify-end px-4 sm:px-8 md:px-12 py-8">
          <div className="bg-white/95 backdrop-blur-xs rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 max-w-sm sm:max-w-md w-full border border-white/50 text-black transform transition-transform hover:scale-[1.01]">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black mb-3 font-sans">
              Dior
            </h2>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-normal mb-6">
              Miss Dior Eau de Parfum, la nouvelle icône couture aux notes vanillées et sensuelles.
            </p>
            <div className="w-full">
              <button
                onClick={onDiscover}
                className="w-full sm:w-auto px-8 py-3 rounded-full border-2 border-black text-black font-bold text-sm hover:bg-black hover:text-white transition-all duration-200 tracking-wide text-center"
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
