'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Loader2, PackageSearch } from 'lucide-react';
import { shopApi, formatDA, type OrderConfirmation } from '@/lib/shop/api';

const STATUS: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'En attente de confirmation', className: 'bg-amber-50 text-amber-800 border-amber-200' },
  CONFIRMED: { label: 'Confirmée', className: 'bg-blue-50 text-blue-800 border-blue-200' },
  SHIPPED: { label: 'Expédiée', className: 'bg-violet-50 text-violet-800 border-violet-200' },
  DELIVERED: { label: 'Livrée', className: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  RETURNED: { label: 'Retournée', className: 'bg-pink-50 text-pink-800 border-pink-200' },
  CANCELLED: { label: 'Annulée', className: 'bg-red-50 text-red-700 border-red-200' },
};

const FIELD = 'w-full bg-white border border-gray-300 rounded-xl px-3.5 py-3 text-sm outline-none focus:ring-2 focus:ring-black';

/** Order tracking for customers who ordered without an account. */
export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <TrackOrder />
    </Suspense>
  );
}

function TrackOrder() {
  // Prefilled from the confirmation link and the last order placed in this browser.
  const [number, setNumber] = useState(useSearchParams().get('n') ?? '');
  const [phone, setPhone] = useState(() => {
    if (typeof window === 'undefined') return '';
    try {
      const stored = sessionStorage.getItem('eclora-last-order');
      return stored ? (JSON.parse(stored) as { phone?: string }).phone ?? '' : '';
    } catch {
      return '';
    }
  });
  const [order, setOrder] = useState<OrderConfirmation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOrder(null);
    setLoading(true);
    try {
      setOrder(await shopApi.trackOrder(number.trim(), phone.trim()));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Commande introuvable');
    } finally {
      setLoading(false);
    }
  };

  const status = order ? STATUS[order.status] ?? { label: order.status, className: 'bg-gray-100 text-gray-700 border-gray-200' } : null;

  return (
    <div className="min-h-screen bg-[#faf8f7]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-[760px] mx-auto px-4 py-4 text-center">
          <Link href="/" className="text-xl font-black tracking-[0.2em]">ECLORA</Link>
        </div>
      </header>

      <main className="max-w-[760px] mx-auto px-4 py-12">
        <h1 className="text-2xl font-black mb-1">Suivre ma commande</h1>
        <p className="text-sm text-gray-600 mb-6">
          Saisissez votre numéro de commande et le téléphone utilisé lors de l&apos;achat. Aucun compte requis.
        </p>

        <form onSubmit={search} className="bg-white rounded-2xl border border-gray-200 p-5 grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
          <label className="block">
            <span className="text-xs font-bold text-gray-700 block mb-1.5">Numéro de commande</span>
            <input required value={number} onChange={(e) => setNumber(e.target.value)} placeholder="ECL-26042" className={FIELD} />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-gray-700 block mb-1.5">Téléphone</span>
            <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0550 12 34 56" className={FIELD} />
          </label>
          <button type="submit" disabled={loading} className="bg-black text-white px-5 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Rechercher
          </button>
        </form>

        {error && (
          <p className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-xl px-4 py-3">{error}</p>
        )}

        {order && status && (
          <section className="mt-6 bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-lg font-black">{order.number}</h2>
                <p className="text-xs text-gray-500">
                  Passée le {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full border text-xs font-extrabold ${status.className}`}>{status.label}</span>
            </div>

            <ul className="divide-y divide-gray-100 my-5">
              {order.items.map((item, i) => (
                <li key={i} className="flex items-center gap-3 py-3 text-xs">
                  <div className="w-12 h-14 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
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

            <div className="flex justify-between text-sm font-black border-t border-gray-100 pt-3">
              <span>Total</span>
              <span>{formatDA(order.total)}</span>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Livraison : {order.commune} · {order.deliveryType === 'HOME' ? 'à domicile' : 'stop desk'}
            </p>
          </section>
        )}

        {!order && !error && (
          <div className="mt-8 text-center text-gray-400">
            <PackageSearch className="w-10 h-10 mx-auto mb-2" />
            <p className="text-xs">Vos informations de commande s&apos;afficheront ici.</p>
          </div>
        )}
      </main>
    </div>
  );
}
