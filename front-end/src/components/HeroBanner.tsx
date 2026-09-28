'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface HeroBannerProps {
  onDiscover: () => void;
}

export default function HeroBanner({ onDiscover }: HeroBannerProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % 2);
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 mt-3 sm:mt-6">
      {/* Mobile crops to the model; from sm up the container matches the artwork's
          native 2172x724 so the full composition stays uncropped. */}
      <div className="relative isolate flex min-h-[420px] overflow-hidden rounded-2xl bg-[#1d6f72] shadow-[0_24px_70px_rgba(16,64,66,0.22)] sm:min-h-0 sm:aspect-[2172/724] sm:rounded-3xl">
        <div className={`absolute inset-0 transition-opacity duration-700 ${activeSlide === 0 ? 'opacity-100' : 'opacity-0'}`}>
          <Image
            src="/images/2.png"
            alt="Gracias Sérum Figue de Barbarie hair serum, shown with a model applying it"
            fill
            preload
            sizes="(max-width: 1440px) 100vw, 1376px"
            quality={90}
            className="object-cover object-[22%_center] sm:object-center"
          />
        </div>

        <div className={`absolute inset-0 transition-opacity duration-700 ${activeSlide === 1 ? 'opacity-100' : 'opacity-0'}`}>
          <Image
            src="/images/3.png"
            alt="Collection Gracias Premium rose avec gel douche, masque capillaire et shampoing"
            fill
            sizes="(max-width: 1440px) 100vw, 1376px"
            quality={90}
            className="object-cover object-center"
          />
        </div>

        {/* Scrim sits under the copy only: bottom on mobile, right on desktop,
            so neither the model nor the bottle is washed out. */}
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0c3f41]/70 via-[#0c3f41]/10 to-transparent transition-opacity duration-700 sm:bg-gradient-to-l sm:from-[#0c3f41]/75 sm:via-[#0c3f41]/15 sm:to-transparent ${
            activeSlide === 0 ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <div
          className={`relative z-10 flex w-full items-end justify-start p-4 pb-10 transition-opacity duration-700 sm:items-center sm:justify-end sm:p-8 md:p-10 lg:p-12 ${
            activeSlide === 0 ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          <div className="w-full max-w-[430px] text-white sm:max-w-[300px] sm:text-right md:max-w-[360px]">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.28em] text-[#9fe7e4] sm:text-xs">
              The Eclora edit
            </p>
            <h1 className="mb-3 text-3xl font-black leading-[0.95] tracking-[-0.045em] drop-shadow-[0_2px_12px_rgba(6,40,42,0.55)] sm:text-4xl md:text-5xl">
              Beauty, in every form.
            </h1>
            <p className="mb-6 text-sm leading-relaxed text-white/85 drop-shadow-[0_1px_8px_rgba(6,40,42,0.5)] sm:text-[13px] md:text-base">
              Makeup, skincare, hair, fragrance &amp; more — discover iconic
              favourites and the emerging brands worth knowing.
            </p>
            <button
              type="button"
              onClick={onDiscover}
              className="group inline-flex w-full items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-extrabold text-[#0c3f41] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#9fe7e4] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto sm:min-w-44"
            >
              Explore Eclora
              <span aria-hidden="true" className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </button>
          </div>
        </div>

        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {[0, 1].map((slide) => (
            <button
              key={slide}
              type="button"
              onClick={() => setActiveSlide(slide)}
              className={`h-2.5 rounded-full border border-white/80 shadow-sm transition-all ${
                activeSlide === slide ? 'w-7 bg-white' : 'w-2.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Afficher la bannière ${slide + 1}`}
              aria-current={activeSlide === slide ? 'true' : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
