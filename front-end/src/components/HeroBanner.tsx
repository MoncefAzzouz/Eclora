'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { ApiBanner } from '@/lib/shop/api';

interface HeroBannerProps {
  onDiscover: () => void;
  /** Hero banner managed in the admin. Falls back to the built-in artwork. */
  banner?: ApiBanner;
}

export default function HeroBanner({ onDiscover, banner }: HeroBannerProps) {
  const eyebrow = banner?.subtitle || 'The Eclora edit';
  const title = banner?.title || 'Beauty, in every form.';
  const description =
    banner?.description || 'Makeup, skincare, hair, fragrance — discover iconic favourites and the emerging brands worth knowing.';
  const cta = banner?.buttonText || 'Explore Eclora';

  return (
    <section className="relative w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 mt-3 sm:mt-6">
      <div className="relative isolate flex min-h-[500px] overflow-hidden rounded-2xl bg-[#d7b8a3] shadow-[0_24px_70px_rgba(86,49,32,0.18)] sm:min-h-[540px] sm:rounded-3xl md:min-h-[590px]">
        <Image
          src={banner?.imageUrl || '/images/eclora-beauty-hero.png'}
          alt="Eclora beauty edit with makeup, skincare, haircare and fragrance"
          fill
          preload
          sizes="(max-width: 1440px) 100vw, 1376px"
          quality={90}
          className="object-cover object-[58%_center] sm:object-center"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#5a2f22]/40 via-transparent to-white/5 sm:bg-gradient-to-r sm:from-[#fff8f1]/55 sm:via-transparent sm:to-black/5" />

        <div className="relative z-10 flex w-full items-end p-3 sm:items-center sm:p-8 md:p-12 lg:p-16">
          <div className="w-full max-w-[430px] rounded-2xl border border-white/60 bg-[#fffaf5]/94 p-5 text-[#21140f] shadow-[0_24px_70px_rgba(67,34,21,0.22)] backdrop-blur-md sm:rounded-3xl sm:p-8 md:max-w-[470px] md:p-10">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.28em] text-[#9b573f] sm:text-xs">
              {eyebrow}
            </p>
            <h1 className="mb-3 text-3xl font-black leading-[0.95] tracking-[-0.045em] sm:text-4xl md:text-5xl">
              {title}
            </h1>
            <p className="mb-6 max-w-sm text-sm leading-relaxed text-[#4b352d] sm:text-base">
              {description}
            </p>
            {banner?.link ? (
              <Link
                href={banner.link}
                className="group inline-flex w-full items-center justify-center rounded-full bg-[#21140f] px-7 py-3.5 text-sm font-extrabold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#a14955] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#21140f] sm:w-auto sm:min-w-44"
              >
                {cta}
                <span aria-hidden="true" className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={onDiscover}
                className="group inline-flex w-full items-center justify-center rounded-full bg-[#21140f] px-7 py-3.5 text-sm font-extrabold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#a14955] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#21140f] sm:w-auto sm:min-w-44"
              >
                {cta}
                <span aria-hidden="true" className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
