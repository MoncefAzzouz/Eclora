'use client';

import React from 'react';
import { ShoppingBag, Truck, CreditCard, RotateCcw } from 'lucide-react';

export default function TrustBar() {
  const TRUST_ITEMS = [
    {
      icon: ShoppingBag,
      title: 'Retrait en magasin',
      description: 'Click & Collect en 2h offert dans nos boutiques',
      linkText: 'En savoir plus',
    },
    {
      icon: Truck,
      title: 'Livraison à domicile',
      description: 'livraison express sur les 58 Wilayas en Algérie (offerte dès 12 000 DA)',
      linkText: "Explorer l'offre",
    },
    {
      icon: CreditCard,
      title: 'Paiement à la livraison',
      description: 'Paiement en espèces à la réception ou via BaridiMob',
      linkText: 'En savoir plus',
    },
    {
      icon: RotateCcw,
      title: 'Retours faciles',
      description: 'Echange ou retour sous 14 jours',
      linkText: 'Retourner mon article',
    },
  ];

  return (
    <section className="bg-white border-t border-b border-gray-200 mt-16 py-8">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {TRUST_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-start gap-4 text-black">
                <div className="p-2 bg-gray-50 rounded-xl border border-gray-100 flex-shrink-0">
                  <Icon className="w-6 h-6 stroke-[1.5] text-black" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-black">
                    {item.title}
                  </h4>
                  <p className="text-xs text-black font-semibold mt-1 leading-snug">
                    {item.description}
                  </p>
                  <button className="text-xs font-bold text-black underline mt-1.5 hover:text-gray-600 transition-colors">
                    {item.linkText}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
