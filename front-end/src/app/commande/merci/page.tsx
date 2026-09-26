'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Phone, Truck } from 'lucide-react';
import { shopApi, formatDA, type OrderConfirmation } from '@/lib/shop/api';

const DELIVERY_LABEL = { HOME: 'À domicile', STOPDESK: 'Stop desk' } as const;
const PAYMENT_LABEL = { COD: 'Paiement à la livraison', BARIDIMOB: 'BaridiMob', CIB: 'Carte CIB / Edahabia' } as const;

/** The phone used for the order, kept only to fetch the recap. */
function readStoredPhone(): string {
  if (typeof window === 'undefined') return '';
  try {
    const stored = sessionStorage.getItem('eclora-last-order');
    return stored ? (JSON.parse(stored) as { phone?: string }).phone ?? '' : '';
  } catch {
    return '';
  }
}

export default function OrderThanksPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <OrderThanks />
    </Suspense>
  );
}

function OrderThanks() {
  // useSearchParams (not window.location) — the URL is only up to date after navigation commits.
  const orderNumber = useSearchParams().get('n') ?? '';
  const [phone] = useState(readStoredPhone);
  const [order, setOrder] = useState<OrderConfirmation | null>(null);

  useEffect(() => {
    if (!orderNumber || !phone) return;
    // Details are a bonus: the number alone is enough to confirm the order.
    shopApi.trackOrder(orderNumber, phone).then(setOrder).catch(() => undefined);
  }, [orderNumber, phone]);

  return (
    <div className="min-h-screen bg-[#faf8f7]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-[900px] mx-auto px-4 py-4 text-center">
          <Link href="/" className="text-xl font-black tracking-[0.2em]">ECLORA</Link>
        </div>
      </header>

      <main className="max-w-[900px] mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto mb-4" />
          <h1 className="text-2xl sm:text-3xl font-black">Merci ! Votre commande est enregistrée.</h1>
          <p className="text-sm text-gray-600 mt-3 max-w-lg mx-auto leading-relaxed">
            Votre numéro de commande est <b className="text-black">{orderNumber || '—'}</b>. Notez-le : il vous permet de
            suivre votre commande sans créer de compte.
          </p>

          <div className="grid sm:grid-cols-2 gap-3 mt-8 text-left">
            <div className="flex gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <Phone className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-sm">Confirmation par téléphone</p>
                <p className="text-gray-600 mt-0.5">Notre équipe vous appelle pour confirmer avant l’expédition.</p>
              </div>
            </div>
            <div className="flex gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <Truck className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-sm">Livraison</p>
                <p className="text-gray-600 mt-0.5">
                  {order ? `${DELIVERY_LABEL[order.deliveryType]} · ${order.commune}` : 'Selon la wilaya choisie.'}
                </p>
              </div>
            </div>
          </div>

          {order && (
            <div className="mt-8 text-left border-t border-gray-100 pt-6">
              <h2 className="text-sm font-black uppercase tracking-wide mb-3">Récapitulatif</h2>
              <ul className="divide-y divide-gray-100 mb-4">
                {order.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 py-2.5 text-xs">
                    <div className="w-11 h-12 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="flex-1 min-w-0">
                      <span className="block font-black uppercase text-[10px] text-gray-500">{item.brand}</span>
                      <span className="block font-bold line-clamp-1">{item.name}</span>
                      <span className="text-gray-500">× {item.quantity}</span>
                    </span>
                    <span className="font-black">{formatDA(item.unitPrice * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <dl className="text-sm space-y-1">
                <div className="flex justify-between"><dt className="text-gray-600">Sous-total</dt><dd>{formatDA(order.subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-600">Livraison</dt><dd>{order.shippingFee ? formatDA(order.shippingFee) : 'Offerte'}</dd></div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-[#d80075]"><dt>Remise</dt><dd>− {formatDA(order.discount)}</dd></div>
                )}
                <div className="flex justify-between font-black text-base border-t border-gray-100 pt-2 mt-2">
                  <dt>Total à payer</dt><dd>{formatDA(order.total)}</dd>
                </div>
                <p className="text-[11px] text-gray-500 pt-1">{PAYMENT_LABEL[order.paymentMethod]}</p>
              </dl>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link href="/" className="bg-black text-white px-6 py-3 rounded-xl text-sm font-bold">
              Continuer mes achats
            </Link>
            <Link href={`/suivi?n=${encodeURIComponent(orderNumber)}`} className="border border-gray-300 px-6 py-3 rounded-xl text-sm font-bold hover:bg-gray-50">
              Suivre ma commande
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
