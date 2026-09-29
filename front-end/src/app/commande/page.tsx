'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  Home,
  Loader2,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
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

const DELIVERY_LABEL: Record<Delivery, { title: string; hint: string; icon: typeof Home }> = {
  HOME: {
    title: 'Livraison à domicile',
    hint: "Votre commande est livrée à l'adresse indiquée.",
    icon: Home,
  },
  STOPDESK: {
    title: 'Livraison au bureau',
    hint: 'Retirez votre colis au stop desk de votre commune.',
    icon: Building2,
  },
};

const FIELD =
  'w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-[#f05b2a] focus:ring-2 focus:ring-[#f05b2a]/15';

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

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f8f8] px-4 text-center text-black">
        <h1 className="text-2xl font-black">Votre panier est vide</h1>
        <p className="mt-2 text-sm text-gray-500">Ajoutez des produits pour passer commande.</p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#f05b2a] to-[#faae3c] px-7 py-3.5 text-sm font-black uppercase tracking-wide text-white shadow-md transition hover:brightness-105"
        >
          Découvrir la boutique
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8] text-black">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="inline-block transition-opacity hover:opacity-80">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/svg/Eclora Horizontal.svg"
              alt="ECLORA"
              className="h-8 w-auto sm:h-10"
            />
          </Link>

          <div className="flex items-center gap-3 text-xs font-semibold sm:gap-4">
            <div className="flex items-center gap-2 text-gray-500">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white">
                <Check className="h-3.5 w-3.5" />
              </span>
              <span className="hidden sm:inline">Panier</span>
            </div>
            <div className="hidden h-px w-5 bg-gray-300 sm:block" />
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-[#f05b2a] to-[#faae3c] font-bold text-white">
                2
              </span>
              <span className="text-sm font-bold">Commande</span>
            </div>
            <div className="hidden h-px w-5 bg-gray-300 sm:block" />
            <div className="flex items-center gap-2 text-gray-400">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-gray-600">3</span>
              <span className="hidden sm:inline">Confirmation</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6 sm:py-10">
        <Link href="/panier" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-black">
          <ArrowLeft className="h-4 w-4" />
          Retour au panier
        </Link>

        <div className="mb-7">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#f05b2a]">Étape 2 sur 3</p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Finaliser ma commande</h1>
          <p className="mt-2 text-sm text-gray-600">
            Pas besoin de créer un compte. Remplissez vos coordonnées, nous vous appelons pour confirmer.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={submit} className="grid items-start gap-6 lg:grid-cols-12" noValidate>
          <div className="space-y-6 lg:col-span-7">
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
              <h2 className="mb-4 text-lg font-black">Mode de livraison</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {(Object.keys(DELIVERY_LABEL) as Delivery[]).map((type) => {
                  const active = deliveryType === type;
                  const price = rate ? (type === 'HOME' ? rate.homePrice : rate.stopdeskPrice) : null;
                  const { title, hint, icon: Icon } = DELIVERY_LABEL[type];
                  return (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setDeliveryType(type)}
                      className={`flex items-start gap-4 rounded-2xl border-2 p-4 text-left transition ${
                        active ? 'border-[#f05b2a] bg-[#fff5ef]' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className={`rounded-xl p-2.5 ${active ? 'bg-[#f05b2a] text-white' : 'bg-gray-100'}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block text-sm font-black">{title}</span>
                        <span className="mt-1 block text-xs leading-relaxed text-gray-600">{hint}</span>
                        <span className="mt-1.5 block text-xs font-bold text-[#f05b2a]">
                          {price === null ? 'Choisissez une wilaya' : freeShipping ? 'Offerte' : formatDA(price)}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
              <h2 className="mb-5 text-lg font-black">Vos coordonnées</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="mb-2 flex items-center gap-2 text-xs font-bold text-gray-700">
                    <UserRound className="h-4 w-4" /> Nom et prénom *
                  </span>
                  <input required autoComplete="name" value={form.customerName} onChange={set('customerName')} className={FIELD} placeholder="Ex. Amine Benali" />
                </label>

                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-xs font-bold text-gray-700">
                    <Phone className="h-4 w-4" /> Numéro de téléphone *
                  </span>
                  <input required type="tel" inputMode="tel" autoComplete="tel" value={form.customerPhone} onChange={set('customerPhone')} className={FIELD} placeholder="Ex. 0550 00 00 00" />
                  <span className="mt-1.5 block text-[11px] text-gray-500">Nous vous appelons pour confirmer la commande.</span>
                </label>

                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-xs font-bold text-gray-700">
                    <UserRound className="h-4 w-4" /> Email (optionnel)
                  </span>
                  <input type="email" autoComplete="email" value={form.customerEmail} onChange={set('customerEmail')} className={FIELD} placeholder="amine@exemple.dz" />
                </label>

                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-xs font-bold text-gray-700">
                    <MapPin className="h-4 w-4" /> Wilaya *
                  </span>
                  <span className="relative block">
                    <select required value={form.wilayaCode} onChange={set('wilayaCode')} className={`${FIELD} appearance-none pr-10`}>
                      <option value="">Choisir une wilaya</option>
                      {(data?.shipping ?? []).map((r) => (
                        <option key={r.wilayaCode} value={r.wilayaCode}>
                          {String(r.wilayaCode).padStart(2, '0')} - {r.wilayaName}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-gray-500" />
                  </span>
                  {rate && <span className="mt-1.5 block text-[11px] text-gray-500">Délai estimé : {rate.deliveryDays}</span>}
                </label>

                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-xs font-bold text-gray-700">
                    <MapPin className="h-4 w-4" /> Commune *
                  </span>
                  <input required value={form.commune} onChange={set('commune')} className={FIELD} placeholder="Ex. Hydra" />
                </label>

                {deliveryType === 'HOME' ? (
                  <label className="block sm:col-span-2">
                    <span className="mb-2 flex items-center gap-2 text-xs font-bold text-gray-700">
                      <Home className="h-4 w-4" /> Adresse complète *
                    </span>
                    <textarea
                      required
                      autoComplete="street-address"
                      rows={3}
                      value={form.address}
                      onChange={set('address')}
                      placeholder="Rue, numéro, bâtiment, étage et repère utile"
                      className={`${FIELD} resize-none`}
                    />
                  </label>
                ) : (
                  <div className="rounded-xl border border-[#faae3c]/40 bg-[#fff8eb] p-4 text-sm text-gray-700 sm:col-span-2">
                    <span className="font-bold text-black">Retrait au bureau :</span>{' '}
                    le stop desk disponible sera confirmé selon la wilaya et la commune choisies.
                    <label className="mt-3 block">
                      <span className="mb-2 flex items-center gap-2 text-xs font-bold text-gray-700">
                        <MapPin className="h-4 w-4" /> Adresse / repère *
                      </span>
                      <input required value={form.address} onChange={set('address')} className={FIELD} placeholder="Près de la pharmacie centrale" />
                    </label>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
              <h2 className="mb-5 text-lg font-black">Paiement</h2>
              <div className="space-y-3">
                {enabledPayments.map((method) => {
                  const active = paymentMethod === method;
                  return (
                    <label
                      key={method}
                      className={`flex cursor-pointer items-start gap-4 rounded-2xl border-2 p-4 transition ${
                        active ? 'border-[#f05b2a] bg-[#fff5ef]' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        className="mt-1 h-4 w-4 accent-[#f05b2a]"
                        checked={active}
                        onChange={() => setPaymentMethod(method)}
                      />
                      <span>
                        <span className="block text-sm font-black">{PAYMENT_LABEL[method].title}</span>
                        <span className="mt-1 block text-xs leading-relaxed text-gray-600">{PAYMENT_LABEL[method].hint}</span>
                      </span>
                    </label>
                  );
                })}
                {enabledPayments.length === 0 && (
                  <p className="text-xs text-gray-500">Chargement des moyens de paiement...</p>
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7 lg:sticky lg:top-24 lg:col-span-5">
            <h2 className="text-lg font-black">Votre commande</h2>

            <ul className="divide-y divide-gray-100">
              {cart.items.map((line) => (
                <li key={`${line.product.id}-${line.shade ?? ''}`} className="flex gap-3 py-3">
                  <div className="h-16 w-14 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={line.product.image} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1 text-xs">
                    <p className="text-[10px] font-black uppercase text-gray-500">{line.product.brand}</p>
                    <p className="line-clamp-2 font-bold">{line.product.title}</p>
                    {line.shade && <p className="text-gray-500">Teinte : {line.shade}</p>}
                    <p className="text-gray-500">Quantité : {line.quantity}</p>
                  </div>
                  <span className="whitespace-nowrap text-xs font-black">
                    {formatDA(priceToNumber(line.product.price) * line.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="space-y-1.5 border-t border-gray-100 pt-4 text-sm">
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
              <div className="flex justify-between border-t border-gray-100 pt-2 text-base">
                <dt className="font-black">Total</dt>
                <dd className="font-black">{formatDA(subtotal + (shippingFee ?? 0))}</dd>
              </div>
            </dl>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f05b2a] to-[#faae3c] px-7 py-4 text-sm font-black uppercase tracking-wide text-white shadow-md transition hover:brightness-105 active:scale-[0.99] disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirmer la commande
              {!submitting && <ArrowRight className="h-4 w-4" />}
            </button>

            <div className="flex items-center justify-center gap-2 text-center text-[11px] leading-relaxed text-gray-500">
              <ShieldCheck className="h-4 w-4 flex-shrink-0 text-emerald-600" />
              Le montant final est calculé par nos serveurs et confirmé par téléphone.
            </div>
          </aside>
        </form>
      </main>
    </div>
  );
}
