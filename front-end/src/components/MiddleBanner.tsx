'use client';

import React from 'react';

interface MiddleBannerProps {
  onDiscover: () => void;
}

export default function MiddleBanner({ onDiscover }: MiddleBannerProps) {
  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-10 sm:mt-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Card - Perfume Emotion */}
        <div className="bg-[#fcf8f2] rounded-2xl overflow-hidden border border-amber-100 flex flex-col sm:flex-row items-stretch shadow-xs hover:shadow-md transition-shadow">
          <div className="w-full sm:w-1/2 min-h-[220px] relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80"
              alt="Plus qu'un parfum, une émotion"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-full sm:w-1/2 p-6 flex flex-col justify-between bg-white/70 backdrop-blur-xs">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-black tracking-tight mb-2">
                Plus qu&apos;un parfum, une émotion
              </h3>
              <p className="text-xs sm:text-sm text-gray-700 font-normal leading-relaxed">
                Senteurs fruitées, florales ou chaleureuses à votre image.
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

        {/* Right Card - Erborian Premiere */}
        <div className="bg-[#f0f7f4] rounded-2xl overflow-hidden border border-emerald-100 flex flex-col sm:flex-row items-stretch shadow-xs hover:shadow-md transition-shadow">
          <div className="w-full sm:w-1/2 min-h-[220px] relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1512290900673-700200411b98?auto=format&fit=crop&w=800&q=80"
              alt="Avant-première Erborian"
              className="w-full h-full object-cover"
            />
            <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
              AVANT-PREMIÈRE
            </span>
          </div>
          <div className="w-full sm:w-1/2 p-6 flex flex-col justify-between bg-white/70 backdrop-blur-xs">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-black tracking-tight mb-2">
                Avant-première Erborian
              </h3>
              <p className="text-xs sm:text-sm text-gray-700 font-normal leading-relaxed">
                Triple Care BB Milk. Testez ce soin 3-en-1 : sérum, hydratant et base de teint.
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
