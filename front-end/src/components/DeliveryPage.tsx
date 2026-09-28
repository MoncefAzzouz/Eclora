'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  Home,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { WILAYAS } from '@/lib/admin/wilayas';

type DeliveryType = 'HOME' | 'STOPDESK';

const COMMUNES_BY_WILAYA: Record<number, string[]> = {
  6: ['Béjaïa', 'Akbou', 'El Kseur', 'Kherrata'],
  9: ['Blida', 'Boufarik', 'Beni Mered', 'Ouled Yaïch'],
  13: ['Tlemcen', 'Mansourah', 'Maghnia', 'Remchi'],
  15: ['Tizi Ouzou', 'Azazga', 'Draâ Ben Khedda', 'Aïn El Hammam'],
  16: ['Alger Centre', 'Bab Ezzouar', 'Chéraga', 'Draria', 'Hydra', 'Kouba', 'Rouiba'],
  19: ['Sétif', 'El Eulma', 'Aïn Arnat', 'Bougaa'],
  23: ['Annaba', 'El Bouni', 'El Hadjar', 'Sidi Amar'],
  25: ['Constantine', 'El Khroub', 'Hamma Bouziane', 'Aïn Smara'],
  31: ['Oran', 'Bir El Djir', 'Es Sénia', 'Arzew', 'Aïn El Turk'],
  35: ['Boumerdès', 'Boudouaou', 'Bordj Menaïel', 'Dellys'],
  42: ['Tipaza', 'Koléa', 'Cherchell', 'Bou Ismaïl'],
};

export default function DeliveryPage() {
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('HOME');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [wilayaCode, setWilayaCode] = useState('');
  const [commune, setCommune] = useState('');
  const [address, setAddress] = useState('');
  const [saved, setSaved] = useState(false);

  const communes = useMemo(() => {
    if (!wilayaCode) return [];
    const code = Number(wilayaCode);
    const wilaya = WILAYAS.find((item) => item.code === code);
    return COMMUNES_BY_WILAYA[code] ?? (wilaya ? [wilaya.name] : []);
  }, [wilayaCode]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(true);
  };

  const fieldClass =
    'w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-[#f05b2a] focus:ring-2 focus:ring-[#f05b2a]/15';

  return (
    <div className="min-h-screen bg-[#f8f8f8] text-black">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="text-2xl font-extrabold tracking-[0.24em] sm:text-3xl">
            ECLORA
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
              <span className="text-sm font-bold">Livraison</span>
            </div>
            <div className="hidden h-px w-5 bg-gray-300 sm:block" />
            <div className="flex items-center gap-2 text-gray-400">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-gray-600">3</span>
              <span className="hidden sm:inline">Paiement</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1000px] px-4 py-8 sm:px-6 sm:py-10">
        <Link href="/panier" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-black">
          <ArrowLeft className="h-4 w-4" />
          Retour au panier
        </Link>

        <div className="mb-7">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#f05b2a]">Étape 2 sur 3</p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Informations de livraison</h1>
          <p className="mt-2 text-sm text-gray-600">Choisissez votre mode de livraison puis indiquez vos coordonnées.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="mb-4 text-lg font-black">Mode de livraison</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setDeliveryType('HOME');
                  setSaved(false);
                }}
                className={`flex items-start gap-4 rounded-2xl border-2 p-4 text-left transition ${
                  deliveryType === 'HOME'
                    ? 'border-[#f05b2a] bg-[#fff5ef]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className={`rounded-xl p-2.5 ${deliveryType === 'HOME' ? 'bg-[#f05b2a] text-white' : 'bg-gray-100'}`}>
                  <Home className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-black">Livraison à domicile</span>
                  <span className="mt-1 block text-xs leading-relaxed text-gray-600">Votre commande est livrée à l&apos;adresse indiquée.</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDeliveryType('STOPDESK');
                  setSaved(false);
                }}
                className={`flex items-start gap-4 rounded-2xl border-2 p-4 text-left transition ${
                  deliveryType === 'STOPDESK'
                    ? 'border-[#f05b2a] bg-[#fff5ef]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className={`rounded-xl p-2.5 ${deliveryType === 'STOPDESK' ? 'bg-[#f05b2a] text-white' : 'bg-gray-100'}`}>
                  <Building2 className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-black">Livraison au bureau</span>
                  <span className="mt-1 block text-xs leading-relaxed text-gray-600">Retirez votre colis au stop desk de votre commune.</span>
                </span>
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="mb-5 text-lg font-black">Vos coordonnées</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-xs font-bold text-gray-700">
                  <UserRound className="h-4 w-4" /> Nom et prénom
                </span>
                <input
                  required
                  autoComplete="name"
                  value={fullName}
                  onChange={(event) => {
                    setFullName(event.target.value);
                    setSaved(false);
                  }}
                  placeholder="Ex. Amine Benali"
                  className={fieldClass}
                />
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-xs font-bold text-gray-700">
                  <Phone className="h-4 w-4" /> Numéro de téléphone
                </span>
                <input
                  required
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) => {
                    setPhone(event.target.value);
                    setSaved(false);
                  }}
                  placeholder="Ex. 0550 00 00 00"
                  className={fieldClass}
                />
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-xs font-bold text-gray-700">
                  <MapPin className="h-4 w-4" /> Wilaya
                </span>
                <span className="relative block">
                  <select
                    required
                    value={wilayaCode}
                    onChange={(event) => {
                      setWilayaCode(event.target.value);
                      setCommune('');
                      setSaved(false);
                    }}
                    className={`${fieldClass} appearance-none pr-10`}
                  >
                    <option value="">Choisir une wilaya</option>
                    {WILAYAS.map((wilaya) => (
                      <option key={wilaya.code} value={wilaya.code}>
                        {String(wilaya.code).padStart(2, '0')} - {wilaya.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-gray-500" />
                </span>
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-xs font-bold text-gray-700">
                  <MapPin className="h-4 w-4" /> Commune
                </span>
                <span className="relative block">
                  <select
                    required
                    disabled={!wilayaCode}
                    value={commune}
                    onChange={(event) => {
                      setCommune(event.target.value);
                      setSaved(false);
                    }}
                    className={`${fieldClass} appearance-none pr-10 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400`}
                  >
                    <option value="">Choisir une commune</option>
                    {communes.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-gray-500" />
                </span>
              </label>

              {deliveryType === 'HOME' ? (
                <label className="block sm:col-span-2">
                  <span className="mb-2 flex items-center gap-2 text-xs font-bold text-gray-700">
                    <Home className="h-4 w-4" /> Adresse complète
                  </span>
                  <textarea
                    required
                    autoComplete="street-address"
                    rows={3}
                    value={address}
                    onChange={(event) => {
                      setAddress(event.target.value);
                      setSaved(false);
                    }}
                    placeholder="Rue, numéro, bâtiment, étage et repère utile"
                    className={`${fieldClass} resize-none`}
                  />
                </label>
              ) : (
                <div className="sm:col-span-2 rounded-xl border border-[#faae3c]/40 bg-[#fff8eb] p-4 text-sm text-gray-700">
                  <span className="font-bold text-black">Retrait au bureau :</span>{' '}
                  le stop desk disponible sera confirmé selon la wilaya et la commune choisies.
                </div>
              )}
            </div>
          </section>

          {saved && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
              <Check className="h-5 w-5 flex-shrink-0" />
              Informations enregistrées. Vous pouvez passer à l&apos;étape de paiement.
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 sm:justify-start">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Vos informations sont utilisées uniquement pour la livraison.
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f05b2a] to-[#faae3c] px-7 py-4 text-sm font-black uppercase tracking-wide text-white shadow-md transition hover:brightness-105 active:scale-[0.99]"
            >
              Continuer vers le paiement
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
