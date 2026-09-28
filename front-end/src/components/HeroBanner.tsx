'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { ApiBanner } from '@/lib/shop/api';

interface HeroBannerProps {
  onDiscover: () => void;
  /** Active hero banners managed in the admin. */
  banners?: ApiBanner[];
}

const FALLBACK_BANNERS: ApiBanner[] = [
  {
    id: 'fallback-hero-1',
    title: 'Beauty, in every form.',
    subtitle: 'The Eclora edit',
    description: 'Makeup, skincare, hair, fragrance — discover iconic favourites and the emerging brands worth knowing.',
    buttonText: 'Explore Eclora',
    imageUrl: '/images/2.png',
    link: '/shop/maquillage',
  },
  {
    id: 'fallback-hero-2',
    title: 'Une nouvelle saison beauté',
    subtitle: 'Gracias Premium',
    description: 'Découvrez une sélection colorée de soins et de parfums pour votre nouvelle routine.',
    buttonText: 'Découvrir',
    imageUrl: '/images/3.png',
    link: '/shop/nouveautes',
  },
];

export default function HeroBanner({ onDiscover, banners }: HeroBannerProps) {
  const slides = banners?.length ? banners : FALLBACK_BANNERS;
  const [activeIndex, setActiveIndex] = useState(0);
  const banner = slides[activeIndex] ?? slides[0]!;

  useEffect(() => {
    if (activeIndex >= slides.length) setActiveIndex(0);
  }, [activeIndex, slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => setActiveIndex((current) => (current + 1) % slides.length), 5500);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const eyebrow = banner?.subtitle || 'The Eclora edit';
  const title = banner?.title || 'Beauty, in every form.';
  const description =
    banner?.description || 'Makeup, skincare, hair, fragrance — discover iconic favourites and the emerging brands worth knowing.';
  const cta = banner?.buttonText || 'Explore Eclora';

  const ctaClassName =
    'group inline-flex w-full items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-extrabold text-[#0c3f41] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#9fe7e4] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto sm:min-w-44';

  const ctaLabel = (
    <>
      {cta}
      <span aria-hidden="true" className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
        →
      </span>
    </>
  );

  return (
    <section className="relative w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 mt-3 sm:mt-6">
      {/* Mobile crops to the model; from sm up the container matches the artwork's
          native 2172x724 so the full composition stays uncropped. */}
      <div className="relative isolate flex min-h-[420px] overflow-hidden rounded-2xl bg-[#1d6f72] shadow-[0_24px_70px_rgba(16,64,66,0.22)] sm:min-h-0 sm:aspect-[2172/724] sm:rounded-3xl">
        <Image
          key={banner.id}
          src={banner.imageUrl}
          alt={banner.title}
          fill
          preload
          sizes="(max-width: 1440px) 100vw, 1376px"
          quality={90}
          className="object-cover object-[22%_center] sm:object-center"
        />

        {/* Scrim sits under the copy only: bottom on mobile, right on desktop,
            so neither the model nor the bottle is washed out. */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0c3f41]/70 via-[#0c3f41]/10 to-transparent sm:bg-gradient-to-l sm:from-[#0c3f41]/75 sm:via-[#0c3f41]/15 sm:to-transparent" />

        <div className="relative z-10 flex w-full items-end justify-start p-4 sm:items-center sm:justify-end sm:p-8 md:p-10 lg:p-12">
          <div className="w-full max-w-[430px] text-white sm:max-w-[300px] sm:text-right md:max-w-[360px]">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.28em] text-[#9fe7e4] sm:text-xs">
              {eyebrow}
            </p>
            <h1 className="mb-3 text-3xl font-black leading-[0.95] tracking-[-0.045em] drop-shadow-[0_2px_12px_rgba(6,40,42,0.55)] sm:text-4xl md:text-5xl">
              {title}
            </h1>
            <p className="mb-6 text-sm leading-relaxed text-white/85 drop-shadow-[0_1px_8px_rgba(6,40,42,0.5)] sm:text-[13px] md:text-base">
              {description}
            </p>
            {banner.link ? (
              <Link href={banner.link} className={ctaClassName}>
                {ctaLabel}
              </Link>
            ) : (
              <button type="button" onClick={onDiscover} className={ctaClassName}>
                {ctaLabel}
              </button>
            )}
          </div>
        </div>

        {slides.length > 1 && (
          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-2 sm:bottom-4" aria-label="Choisir une bannière">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Afficher la bannière ${index + 1}`}
                aria-current={index === activeIndex}
                className={`h-2 rounded-full shadow-sm transition-all ${index === activeIndex ? 'w-7 bg-white' : 'w-2 bg-white/55 hover:bg-white/80'}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
