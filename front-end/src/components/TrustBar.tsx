'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Truck, CreditCard } from 'lucide-react';
import { formatDA, shopApi } from '@/lib/shop/api';
import { useAsyncData } from '@/lib/useAsyncData';

export default function TrustBar() {
  const { data: settings } = useAsyncData(() => shopApi.settings());
  const threshold = settings?.freeShippingThreshold ?? 0;
  const TRUST_ITEMS = [
    {
      icon: ShoppingBag,
      title: 'Nos marques',
      description: 'Une sélection de marques de soin, de beauté et de maquillage choisies avec soin',
      linkText: 'Voir les marques',
      href: '/marques',
    },
    {
      icon: Truck,
      title: 'Livraison partout en Algérie',
      description: `À domicile ou au bureau Yalidine${threshold > 0 ? `, offerte dès ${formatDA(threshold)} d’achats` : ''}`,
      linkText: 'Conditions de livraison',
      href: '/aide#livraison',
    },
    {
      icon: CreditCard,
      title: 'Paiement à la livraison',
      description: 'Vous payez en espèces à la réception de votre colis',
      linkText: 'En savoir plus',
      href: '/aide#paiement',
    },
  ];

  return (
    <section className="bg-white border-t border-b border-gray-200 mt-16 py-8">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
                  <Link href={item.href} className="mt-1.5 inline-block text-xs font-bold text-black underline transition-colors hover:text-gray-600">
                    {item.linkText}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
