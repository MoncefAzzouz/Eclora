'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ShieldCheck, Truck, Store, AlertCircle, Loader2 } from 'lucide-react';
import { shopApi, formatDA, type CheckoutPayload } from '@/lib/shop/api';
import { useCart, priceToNumber } from '@/lib/shop/cart';
import { useAsyncData } from '@/lib/useAsyncData';

type Delivery = 'HOME' | 'STOPDESK';
type Payment = 'COD' | 'BARIDIMOB' | 'CIB';

const PAYMENT_LABEL: Record<Payment, { title: string; hint: string }> = {
  COD: { title: 'Paiement à la livraison', hint: 'Vous payez le livreur en espèces à la réception.' },
  BARIDIMOB: { title: 'BaridiMob', hint: 'Virement via l’application BaridiMob. Nous vous contacterons pour les détails.' },
  CIB: { title: 'Carte CIB / Edahabia', hint: 'Paiement en ligne sécurisé.' },
};

const FIELD =
  'w-full bg-white border border-gray-300 rounded-xl px-3.5 py-3 text-sm outline-none focus:ring-2 focus:ring-black focus:border-black transition';

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCart();
  const { data } = useAsyncData(async () => {
    const [settings, shipping] = await Promise.all([shopApi.settings(), shopApi.shipping()]);
    return { settings, shipping };
  });

  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    wilayaCode: '',
    commune: '',
    address: '',
  });
  const [deliveryType, setDeliveryType] = useState<Delivery>('HOME');
  const [paymentMethod, setPaymentMethod] = useState<Payment>('COD');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const promoCode = typeof window !== 'undefined' ? sessionStorage.getItem('eclora-promo') ?? '' : '';
  const subtotal = cart.items.reduce((sum, l) => sum + priceToNumber(l.product.price) * l.quantity, 0);

  const rate = data?.shipping.find((r) => r.wilayaCode === Number(form.wilayaCode));
  const freeShipping = !!data && data.settings.freeShippingThreshold > 0 && subtotal >= data.settings.freeShippingThreshold;
  const shippingFee = useMemo(() => {
    if (!rate) return null;
    if (freeShipping) return 0;
    return deliveryType === 'HOME' ? rate.homePrice : rate.stopdeskPrice;
  }, [rate, deliveryType, freeShipping]);

  const enabledPayments = (Object.keys(PAYMENT_LABEL) as Payment[]).filter((m) => data?.settings.payments[m]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (cart.items.length === 0) return setError('Votre panier est vide.');
    if (!form.wilayaCode) return setError('Choisissez votre wilaya.');

    const payload: CheckoutPayload = {
      customerName: form.customerName.trim(),
      customerPhone: form.customerPhone.trim(),
      customerEmail: form.customerEmail.trim() || undefined,
      wilayaCode: Number(form.wilayaCode),
      commune: form.commune.trim(),
      address: form.address.trim(),
      deliveryType,
      paymentMethod,
      promoCode: promoCode || undefined,
      items: cart.items.map((l) => ({ productId: l.product.id, shade: l.shade, quantity: l.quantity })),
    };

    setSubmitting(true);
    try {
      const order = await shopApi.createOrder(payload);
      // Keep just enough to show the confirmation page after the cart is cleared.
      sessionStorage.setItem('eclora-last-order', JSON.stringify({ number: order.number, phone: order.customerPhone }));
      sessionStorage.removeItem('eclora-promo');
      cart.clear();
      router.replace(`/commande/merci?n=${encodeURIComponent(order.number)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'La commande n’a pas pu être enregistrée.');
      setSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (cart.ready && cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-black">Votre panier est vide</h1>
        <p className="text-sm text-gray-500 mt-2">Ajoutez des produits pour passer commande.</p>
        <Link href="/" className="mt-6 bg-black text-white px-6 py-3 rounded-xl text-sm font-bold">
          Découvrir la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f7]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-[1100px] mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/panier" className="text-xs font-bold text-gray-600 hover:text-black inline-flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> Retour au panier
          </Link>
          <Link href="/" className="text-xl font-black tracking-[0.2em]">ECLORA</Link>
          <span className="text-[11px] text-gray-500 font-semibold hidden sm:flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Commande sécurisée
          </span>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-4 py-8">
        <h1 className="text-2xl font-black mb-1">Finaliser ma commande</h1>
        <p className="text-sm text-gray-600 mb-6">
          Pas besoin de créer un compte. Remplissez vos coordonnées, nous vous appelons pour confirmer.
        </p>

        {error && (
          <div role="alert" className="mb-6 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-xl px-4 py-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={submit} className="grid lg:grid-cols-12 gap-6 items-start" noValidate>
          <div className="lg:col-span-7 space-y-5">
            <section className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6">
              <h2 className="text-sm font-black uppercase tracking-wide mb-4">Vos coordonnées</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block sm:col-span-2">
                  <span className="text-xs font-bold text-gray-700 block mb-1.5">Nom et prénom *</span>
                  <input required value={form.customerName} onChange={set('customerName')} className={FIELD} placeholder="Amina Benali" />
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-gray-700 block mb-1.5">Téléphone *</span>
                  <input required type="tel" inputMode="tel" value={form.customerPhone} onChange={set('customerPhone')} className={FIELD} placeholder="0550 12 34 56" />
                  <span className="text-[11px] text-gray-500 mt-1 block">Nous vous appelons pour confirmer la commande.</span>
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-gray-700 block mb-1.5">Email (optionnel)</span>
                  <input type="email" value={form.customerEmail} onChange={set('customerEmail')} className={FIELD} placeholder="amina@exemple.dz" />
                </label>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6">
              <h2 className="text-sm font-black uppercase tracking-wide mb-4">Livraison</h2>

              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                {(['HOME', 'STOPDESK'] as Delivery[]).map((type) => {
                  const active = deliveryType === type;
                  const price = rate ? (type === 'HOME' ? rate.homePrice : rate.stopdeskPrice) : null;
                  const Icon = type === 'HOME' ? Truck : Store;
                  return (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setDeliveryType(type)}
                      className={`flex items-start gap-3 p-4 rounded-xl border text-left transition ${active ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-300 hover:border-gray-400'}`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>
                        <span className="block text-sm font-bold">{type === 'HOME' ? 'À domicile' : 'Stop desk'}</span>
                        <span className="block text-[11px] text-gray-500">
                          {price === null ? 'Choisissez une wilaya' : freeShipping ? 'Offerte' : formatDA(price)}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-bold text-gray-700 block mb-1.5">Wilaya *</span>
                  <select required value={form.wilayaCode} onChange={set('wilayaCode')} className={FIELD}>
                    <option value="">Choisir...</option>
                    {(data?.shipping ?? []).map((r) => (
                      <option key={r.wilayaCode} value={r.wilayaCode}>
                        {String(r.wilayaCode).padStart(2, '0')} - {r.wilayaName}
                      </option>
                    ))}
                  </select>
                  {rate && <span className="text-[11px] text-gray-500 mt-1 block">Délai estimé : {rate.deliveryDays}</span>}
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-gray-700 block mb-1.5">Commune *</span>
                  <input required value={form.commune} onChange={set('commune')} className={FIELD} placeholder="Hydra" />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-xs font-bold text-gray-700 block mb-1.5">Adresse complète *</span>
                  <input required value={form.address} onChange={set('address')} className={FIELD} placeholder="15 rue Didouche Mourad, près de la pharmacie" />
                </label>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6">
              <h2 className="text-sm font-black uppercase tracking-wide mb-4">Paiement</h2>
              <div className="space-y-2">
                {enabledPayments.map((method) => (
                  <label
                    key={method}
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${paymentMethod === method ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-300 hover:border-gray-400'}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      className="mt-1 accent-black"
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                    />
                    <span>
                      <span className="block text-sm font-bold">{PAYMENT_LABEL[method].title}</span>
                      <span className="block text-[11px] text-gray-500">{PAYMENT_LABEL[method].hint}</span>
                    </span>
                  </label>
                ))}
                {enabledPayments.length === 0 && <p className="text-xs text-gray-500">Chargement des moyens de paiement...</p>}
              </div>
            </section>
          </div>

          <aside className="lg:col-span-5 lg:sticky lg:top-6 bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wide">Votre commande</h2>

            <ul className="divide-y divide-gray-100">
              {cart.items.map((line) => (
                <li key={`${line.product.id}-${line.shade ?? ''}`} className="flex gap-3 py-3">
                  <div className="w-14 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={line.product.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 text-xs">
                    <p className="font-black uppercase text-[10px] text-gray-500">{line.product.brand}</p>
                    <p className="font-bold line-clamp-2">{line.product.title}</p>
                    {line.shade && <p className="text-gray-500">Teinte : {line.shade}</p>}
                    <p className="text-gray-500">Quantité : {line.quantity}</p>
                  </div>
                  <span className="text-xs font-black whitespace-nowrap">
                    {formatDA(priceToNumber(line.product.price) * line.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="space-y-1.5 text-sm border-t border-gray-100 pt-4">
              <div className="flex justify-between">
                <dt className="text-gray-600">Sous-total</dt>
                <dd className="font-bold">{formatDA(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Livraison</dt>
                <dd className="font-bold">
                  {shippingFee === null ? '—' : shippingFee === 0 ? 'Offerte' : formatDA(shippingFee)}
                </dd>
              </div>
              {promoCode && (
                <div className="flex justify-between text-[#d80075]">
                  <dt>Code {promoCode}</dt>
                  <dd className="font-bold">appliqué à la validation</dd>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-100 text-base">
                <dt className="font-black">Total</dt>
                <dd className="font-black">{formatDA(subtotal + (shippingFee ?? 0))}</dd>
              </div>
            </dl>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-black text-white text-sm font-black uppercase tracking-wider py-4 rounded-xl hover:bg-neutral-800 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirmer la commande
            </button>

            <p className="text-[11px] text-gray-500 text-center leading-relaxed">
              Le montant final est calculé par nos serveurs et confirmé par téléphone.
              <br />
              Aucun compte n’est nécessaire.
            </p>
          </aside>
        </form>
      </main>
    </div>
  );
}
