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
  Truck,
  UserRound,
} from 'lucide-react';
import { shopApi, formatDA, type CheckoutPayload, type DeliveryQuote, type WilayaDelivery } from '@/lib/shop/api';
import { useCart, priceToNumber } from '@/lib/shop/cart';
import { useCustomer } from '@/lib/shop/account';
import { useAsyncData } from '@/lib/useAsyncData';

type Delivery = 'HOME' | 'STOPDESK';
type Payment = 'COD' | 'BARIDIMOB' | 'CIB';

const PAYMENT_LABEL: Record<Payment, { title: string; hint: string }> = {
  COD: { title: 'Paiement à la livraison', hint: 'Vous payez en espèces à la réception du colis.' },
  BARIDIMOB: { title: 'BaridiMob', hint: 'Virement via l’application BaridiMob. Nous vous contacterons pour les détails.' },
  CIB: { title: 'Carte CIB / Edahabia', hint: 'Paiement en ligne sécurisé.' },
};

const FIELD =
  'w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-black outline-none transition focus:border-[#f05b2a] focus:ring-2 focus:ring-[#f05b2a]/15 sm:text-sm';

function Label({ icon: Icon, children }: { icon: typeof Home; children: React.ReactNode }) {
  return (
    <span className="mb-2 flex items-center gap-2 text-xs font-bold text-gray-700">
      <Icon className="h-4 w-4" /> {children}
    </span>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCart();
  const { customer, ready: customerReady } = useCustomer();
  const { data } = useAsyncData(async () => {
    const [settings, wilayas] = await Promise.all([shopApi.settings(), shopApi.deliveryWilayas()]);
    return { settings, wilayas };
  });

  const [form, setForm] = useState({ customerName: '', customerPhone: '', customerEmail: '', address: '', commune: '' });
  const [wilayaCode, setWilayaCode] = useState<number | null>(null);
  const [communeId, setCommuneId] = useState<number | null>(null);
  const [stopdeskId, setStopdeskId] = useState<number | null>(null);
  const [deliveryType, setDeliveryType] = useState<Delivery>('HOME');
  const [paymentMethod, setPaymentMethod] = useState<Payment>('COD');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefill once from the customer's account.
  const [prefilled, setPrefilled] = useState(false);
  if (customer && !prefilled) {
    setPrefilled(true);
    setForm((f) => ({
      ...f,
      customerName: f.customerName || customer.name,
      customerPhone: f.customerPhone || customer.phone,
      customerEmail: f.customerEmail || customer.email,
      address: f.address || customer.address,
    }));
  }

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const subtotal = cart.items.reduce((sum, l) => sum + priceToNumber(l.product.price) * l.quantity, 0);

  // Communes and Yalidine offices of the chosen wilaya.
  const { data: area, loading: areaLoading } = useAsyncData<WilayaDelivery | null>(
    async () => (wilayaCode ? shopApi.deliveryWilaya(wilayaCode) : null),
    [wilayaCode]
  );
  const wilaya = data?.wilayas.find((w) => w.wilayaCode === wilayaCode);
  const hasCommuneList = (area?.communes.length ?? 0) > 0;
  const commune = area?.communes.find((c) => c.id === communeId);
  const centers = useMemo(() => area?.centers ?? [], [area]);
  // Offices exist, or Yalidine has not been synced yet (no lists): pickup stays possible.
  const stopdeskAvailable = !!wilaya && (wilaya.hasStopdesk || !hasCommuneList);
  const homeAvailable = !commune || commune.isDeliverable;

  // Keep the delivery type valid when the area changes.
  const effectiveType: Delivery =
    deliveryType === 'STOPDESK' && wilaya && !stopdeskAvailable ? 'HOME' : deliveryType === 'HOME' && !homeAvailable ? 'STOPDESK' : deliveryType;

  // Promo code entered in the cart.
  // Read once; it is not rendered, so the server's empty value cannot cause a mismatch.
  const [promoCode] = useState(() => {
    try {
      return typeof window === 'undefined' ? '' : sessionStorage.getItem('eclora-promo') ?? '';
    } catch {
      return '';
    }
  });
  const { data: promo } = useAsyncData(
    async () => (promoCode && subtotal > 0 ? shopApi.validatePromo(promoCode, subtotal).catch(() => null) : null),
    [promoCode, subtotal]
  );

  // Exact fee from the server once the destination is complete.
  const quoteReady =
    !!wilayaCode && (effectiveType === 'HOME' ? !hasCommuneList || !!communeId : centers.length === 0 || !!stopdeskId);
  const { data: quote, error: quoteError } = useAsyncData<DeliveryQuote | null>(
    async () =>
      quoteReady
        ? shopApi.deliveryQuote({ wilayaCode: wilayaCode!, communeId, deliveryType: effectiveType, stopdeskId, subtotal })
        : null,
    [quoteReady, wilayaCode, communeId, effectiveType, stopdeskId, subtotal]
  );

  const threshold = data?.settings.freeShippingThreshold ?? 0;
  const shippingFee = quote ? (promo?.freeShipping ? 0 : quote.fee) : null;
  const discount = promo?.discount ?? 0;
  const total = subtotal - discount + (shippingFee ?? 0);
  const missingForFree = threshold > 0 && subtotal < threshold ? threshold - subtotal : 0;

  const homePrice = commune?.homePrice ?? wilaya?.homePrice;
  const deskPrice = stopdeskId
    ? centers.find((c) => c.id === stopdeskId)?.price
    : centers.length
    ? Math.min(...centers.map((c) => c.price))
    : wilaya?.stopdeskPrice;

  const enabledPayments = (Object.keys(PAYMENT_LABEL) as Payment[]).filter((m) => data?.settings.payments[m]);

  const sortedCenters = useMemo(() => {
    // Offices in the customer's commune first.
    return [...centers].sort((a, b) => Number(b.communeId === communeId) - Number(a.communeId === communeId) || a.name.localeCompare(b.name));
  }, [centers, communeId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (cart.items.length === 0) return setError('Votre panier est vide.');
    if (!form.customerName.trim()) return setError('Indiquez votre nom et prénom.');
    if (!form.customerPhone.trim()) return setError('Indiquez votre numéro de téléphone.');
    if (!wilayaCode) return setError('Choisissez votre wilaya.');
    if (effectiveType === 'HOME' && hasCommuneList && !communeId) return setError('Choisissez votre commune.');
    if (effectiveType === 'HOME' && !hasCommuneList && form.commune.trim().length < 2) return setError('Indiquez votre commune.');
    if (effectiveType === 'HOME' && form.address.trim().length < 5) return setError('Indiquez votre adresse complète.');
    if (effectiveType === 'STOPDESK' && centers.length > 0 && !stopdeskId) return setError('Choisissez le bureau Yalidine.');

    const payload: CheckoutPayload = {
      customerName: form.customerName.trim(),
      customerPhone: form.customerPhone.trim(),
      customerEmail: form.customerEmail.trim() || undefined,
      wilayaCode,
      commune: commune?.name ?? form.commune.trim(),
      communeId: effectiveType === 'HOME' ? communeId : null,
      address: form.address.trim(),
      deliveryType: effectiveType,
      stopdeskId: effectiveType === 'STOPDESK' ? stopdeskId : null,
      paymentMethod,
      promoCode: promoCode || undefined,
      items: cart.items.map((l) => ({ productId: l.product.id, shade: l.shade, quantity: l.quantity })),
    };

    setSubmitting(true);
    try {
      const order = await shopApi.createOrder(payload);
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
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8f8f8] px-4 text-center text-black">
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

  const deliveryOptions: { type: Delivery; title: string; hint: string; icon: typeof Home; price?: number; disabled: boolean; note?: string }[] = [
    {
      type: 'HOME',
      title: 'Livraison à domicile',
      hint: 'Livrée à votre adresse par Yalidine.',
      icon: Home,
      price: homePrice,
      disabled: !homeAvailable,
      note: !homeAvailable ? 'Non disponible dans cette commune' : undefined,
    },
    {
      type: 'STOPDESK',
      title: 'Retrait au bureau Yalidine',
      hint: 'Récupérez votre colis au bureau de votre choix.',
      icon: Building2,
      price: deskPrice,
      disabled: !!wilaya && !stopdeskAvailable,
      note: wilaya && !stopdeskAvailable ? 'Aucun bureau dans cette wilaya' : undefined,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8f8f8] text-black">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="inline-block transition-opacity hover:opacity-80">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/svg/Eclora Horizontal.svg" alt="ECLORA" className="h-8 w-auto sm:h-10" />
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
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-[#f05b2a] to-[#faae3c] font-bold text-white">2</span>
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
          {customerReady && (
            <p className="mt-2 text-sm text-gray-600">
              {customer ? (
                <>Connecté en tant que <span className="font-bold text-black">{customer.name}</span>. Vos coordonnées sont pré-remplies.</>
              ) : (
                <>
                  Commandez sans compte, ou{' '}
                  <Link href="/compte?retour=/commande" className="font-bold text-black underline">
                    connectez-vous
                  </Link>{' '}
                  pour retrouver vos commandes.
                </>
              )}
            </p>
          )}
        </div>

        {error && (
          <div role="alert" className="mb-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={submit} className="grid items-start gap-6 lg:grid-cols-12" noValidate>
          <div className="space-y-6 lg:col-span-7">
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
              <h2 className="mb-5 text-lg font-black">Vos coordonnées</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <Label icon={UserRound}>Nom et prénom *</Label>
                  <input required autoComplete="name" value={form.customerName} onChange={set('customerName')} className={FIELD} placeholder="Ex. Amine Benali" />
                </label>
                <label className="block">
                  <Label icon={Phone}>Téléphone *</Label>
                  <input required type="tel" inputMode="tel" autoComplete="tel" value={form.customerPhone} onChange={set('customerPhone')} className={FIELD} placeholder="0550 12 34 56" />
                  <span className="mt-1.5 block text-[11px] text-gray-500">Nous vous appelons pour confirmer la commande.</span>
                </label>
                <label className="block">
                  <Label icon={UserRound}>Email (optionnel)</Label>
                  <input type="email" autoComplete="email" value={form.customerEmail} onChange={set('customerEmail')} className={FIELD} placeholder="amine@exemple.dz" />
                </label>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
              <h2 className="mb-5 flex items-center gap-2 text-lg font-black">
                <Truck className="h-5 w-5" /> Livraison
              </h2>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <Label icon={MapPin}>Wilaya *</Label>
                  <span className="relative block">
                    <select
                      required
                      value={wilayaCode ?? ''}
                      onChange={(e) => {
                        setWilayaCode(e.target.value ? Number(e.target.value) : null);
                        setCommuneId(null);
                        setStopdeskId(null);
                      }}
                      className={`${FIELD} appearance-none pr-10`}
                    >
                      <option value="">{data ? 'Choisir une wilaya' : 'Chargement...'}</option>
                      {(data?.wilayas ?? []).map((w) => (
                        <option key={w.wilayaCode} value={w.wilayaCode}>
                          {String(w.wilayaCode).padStart(2, '0')} - {w.wilayaName}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-gray-500" />
                  </span>
                </label>

                <label className="block">
                  <Label icon={MapPin}>Commune {effectiveType === 'HOME' ? '*' : ''}</Label>
                  {hasCommuneList || !wilayaCode ? (
                    <span className="relative block">
                      <select
                        value={communeId ?? ''}
                        disabled={!wilayaCode || areaLoading}
                        onChange={(e) => {
                          setCommuneId(e.target.value ? Number(e.target.value) : null);
                          setStopdeskId(null);
                        }}
                        className={`${FIELD} appearance-none pr-10 disabled:bg-gray-50 disabled:text-gray-400`}
                      >
                        <option value="">{!wilayaCode ? 'Choisissez d’abord la wilaya' : areaLoading ? 'Chargement...' : 'Choisir une commune'}</option>
                        {(area?.communes ?? []).map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                            {!c.isDeliverable ? ' (retrait au bureau uniquement)' : ''}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-gray-500" />
                    </span>
                  ) : (
                    <input value={form.commune} onChange={set('commune')} className={FIELD} placeholder="Ex. El Eulma" />
                  )}
                </label>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {deliveryOptions.map(({ type, title, hint, icon: Icon, price, disabled, note }) => {
                  const active = effectiveType === type;
                  return (
                    <button
                      type="button"
                      key={type}
                      disabled={disabled}
                      onClick={() => setDeliveryType(type)}
                      className={`flex items-start gap-4 rounded-2xl border-2 p-4 text-left transition ${
                        disabled ? 'cursor-not-allowed border-gray-100 opacity-50' : active ? 'border-[#f05b2a] bg-[#fff5ef]' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      aria-pressed={active}
                    >
                      <span className={`rounded-xl p-2.5 ${active && !disabled ? 'bg-[#f05b2a] text-white' : 'bg-gray-100'}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block text-sm font-black">{title}</span>
                        <span className="mt-1 block text-xs leading-relaxed text-gray-600">{note ?? hint}</span>
                        <span className="mt-1.5 block text-xs font-bold text-[#f05b2a]">
                          {!wilaya
                            ? 'Choisissez une wilaya'
                            : price === undefined
                            ? '—'
                            : threshold > 0 && subtotal >= threshold
                            ? 'Offerte'
                            : `${type === 'STOPDESK' && !stopdeskId && centers.length > 1 ? 'dès ' : ''}${formatDA(price)}`}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {effectiveType === 'HOME' ? (
                <label className="mt-5 block">
                  <Label icon={Home}>Adresse complète *</Label>
                  <textarea
                    required
                    autoComplete="street-address"
                    rows={3}
                    value={form.address}
                    onChange={set('address')}
                    placeholder="Rue, numéro, bâtiment, étage et un repère utile"
                    className={`${FIELD} resize-none`}
                  />
                </label>
              ) : centers.length > 0 ? (
                <fieldset className="mt-5">
                  <legend className="mb-2 text-xs font-bold text-gray-700">Bureau Yalidine où retirer votre colis *</legend>
                  <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                    {sortedCenters.map((c) => (
                      <label
                        key={c.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3 transition ${
                          stopdeskId === c.id ? 'border-[#f05b2a] bg-[#fff5ef]' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="stopdesk"
                          checked={stopdeskId === c.id}
                          onChange={() => setStopdeskId(c.id)}
                          className="mt-1 h-4 w-4 accent-[#f05b2a]"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-bold">{c.name}</span>
                          <span className="block text-xs text-gray-600">
                            {c.address ? `${c.address}, ` : ''}
                            {c.communeName}
                          </span>
                        </span>
                        <span className="whitespace-nowrap text-xs font-bold text-[#f05b2a]">{formatDA(c.price)}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ) : wilayaCode ? (
                <p className="mt-5 rounded-xl border border-[#faae3c]/40 bg-[#fff8eb] p-4 text-sm text-gray-700">
                  Nous vous appellerons pour vous indiquer le bureau Yalidine le plus proche.
                </p>
              ) : null}

              {quoteError && <p className="mt-4 text-sm font-semibold text-red-700">{quoteError}</p>}
              {quote && <p className="mt-4 text-xs text-gray-500">Délai estimé : {quote.deliveryDays}</p>}
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
                      <input type="radio" name="payment" className="mt-1 h-4 w-4 accent-[#f05b2a]" checked={active} onChange={() => setPaymentMethod(method)} />
                      <span>
                        <span className="block text-sm font-black">{PAYMENT_LABEL[method].title}</span>
                        <span className="mt-1 block text-xs leading-relaxed text-gray-600">{PAYMENT_LABEL[method].hint}</span>
                      </span>
                    </label>
                  );
                })}
                {enabledPayments.length === 0 && <p className="text-xs text-gray-500">Chargement des moyens de paiement...</p>}
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
                    <img src={line.product.image} alt="" className="h-full w-full object-contain" />
                  </div>
                  <div className="min-w-0 flex-1 text-xs">
                    <p className="text-[10px] font-black uppercase text-gray-500">{line.product.brand}</p>
                    <p className="line-clamp-2 font-bold">{line.product.title}</p>
                    {line.product.volume && <p className="text-gray-500">{line.product.volume}</p>}
                    {line.shade && <p className="text-gray-500">Teinte : {line.shade}</p>}
                    <p className="text-gray-500">Quantité : {line.quantity}</p>
                  </div>
                  <span className="whitespace-nowrap text-xs font-black">{formatDA(priceToNumber(line.product.price) * line.quantity)}</span>
                </li>
              ))}
            </ul>

            {missingForFree > 0 && (
              <p className="rounded-xl bg-[#fff5ef] px-4 py-3 text-xs font-semibold text-[#c2410c]">
                Plus que {formatDA(missingForFree)} d’achats pour la livraison gratuite.
              </p>
            )}

            <dl className="space-y-1.5 border-t border-gray-100 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Produits</dt>
                <dd className="font-bold">{formatDA(subtotal)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#d80075]">
                  <dt>Code {promo?.code}</dt>
                  <dd className="font-bold">− {formatDA(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-600">
                  Livraison {effectiveType === 'HOME' ? 'à domicile' : 'au bureau'}
                </dt>
                <dd className="font-bold">
                  {shippingFee === null ? <span className="font-normal text-gray-400">choisissez la destination</span> : shippingFee === 0 ? 'Offerte' : formatDA(shippingFee)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-2 text-base">
                <dt className="font-black">Total à payer</dt>
                <dd className="font-black">{formatDA(total)}</dd>
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
              Nous vous appelons pour confirmer avant l’expédition.
            </div>
          </aside>
        </form>
      </main>
    </div>
  );
}
