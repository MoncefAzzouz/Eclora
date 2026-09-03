'use client';

import React from 'react';
import Link from 'next/link';

interface HeroBannerProps {
  onDiscover: () => void;
}

export default function HeroBanner({ onDiscover }: HeroBannerProps) {
  return (
    <section className="relative w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 mt-3 sm:mt-6">
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-neutral-900 min-h-[460px] sm:min-h-[500px] md:min-h-[560px] flex flex-col justify-end sm:justify-end shadow-md">
        {/* Hero Background Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1800&q=85"
          alt="Dior Miss Dior Campaign"
          className="absolute inset-0 w-full h-full object-cover object-[center_20%] sm:object-center"
        />

        {/* Ambient overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none sm:bg-gradient-to-r sm:from-black/10 sm:to-black/20" />

        {/* Floating White Dior Card (Bottom on Mobile, Right Bottom on Desktop) */}
        <div className="relative z-10 w-full flex justify-center sm:justify-end p-3 sm:p-8 md:p-12">
          <div className="bg-white rounded-2xl shadow-2xl p-5 sm:p-7 md:p-8 max-w-sm sm:max-w-md w-full border border-gray-100 text-black">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-black mb-1.5 sm:mb-2 font-sans">
              Dior
            </h2>
            <p className="text-xs sm:text-sm text-neutral-800 leading-snug font-normal mb-5 sm:mb-6">
              Miss Dior Eau de Parfum, la nouvelle icône couture aux notes vanillées et sensuelles.
            </p>
            <div className="w-full">
              <Link
                href="/shop/parfum"
                className="w-full py-3 sm:py-3.5 rounded-lg border border-black text-black font-extrabold text-xs sm:text-sm hover:bg-black hover:text-white transition-all duration-200 tracking-wide text-center block shadow-2xs"
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
