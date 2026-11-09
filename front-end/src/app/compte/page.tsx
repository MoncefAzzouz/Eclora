'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, Check, Loader2, LogOut, Package } from 'lucide-react';
import ShopShell from '@/components/ShopShell';
import { formatDA, shopApi, type Customer, type OrderConfirmation } from '@/lib/shop/api';
import { signIn, signOut, updateCustomer, useCustomer } from '@/lib/shop/account';
import { useAsyncData } from '@/lib/useAsyncData';

const FIELD =
  'w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-black outline-none transition focus:border-[#f05b2a] focus:ring-2 focus:ring-[#f05b2a]/15 sm:text-sm';
const BUTTON =
  'inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-6 py-3.5 text-sm font-bold text-white transition hover:bg-neutral-800 disabled:opacity-60';

const STATUS: Record<string, { label: string; tone: string }> = {
  PENDING: { label: 'En attente de confirmation', tone: 'bg-amber-100 text-amber-800' },
  CONFIRMED: { label: 'Confirmée', tone: 'bg-blue-100 text-blue-800' },
  SHIPPED: { label: 'Expédiée', tone: 'bg-indigo-100 text-indigo-800' },
  DELIVERED: { label: 'Livrée', tone: 'bg-emerald-100 text-emerald-800' },
  RETURNED: { label: 'Retournée', tone: 'bg-gray-200 text-gray-700' },
  CANCELLED: { label: 'Annulée', tone: 'bg-red-100 text-red-700' },
};

function ErrorBox({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
      <AlertCircle className="h-5 w-5 flex-shrink-0" /> {message}
    </p>
  );
}

function AuthForms() {
  const router = useRouter();
  const back = useSearchParams().get('retour');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ identifier: '', password: '', name: '', phone: '', email: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const done = (token: string, customer: Customer) => {
    signIn(token, customer);
    // Only same-site paths, never an absolute URL from the query string.
    if (back && back.startsWith('/') && !back.startsWith('//')) router.push(back);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res =
        mode === 'login'
          ? await shopApi.login(form.identifier.trim(), form.password)
          : await shopApi.register({ name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim() || undefined, password: form.password });
      done(res.token, res.customer);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:py-16">
      <h1 className="text-center text-3xl font-black tracking-tight">Mon compte</h1>
      <p className="mt-2 text-center text-sm text-gray-600">Suivez vos commandes et commandez plus vite.</p>

      <div className="mt-8 grid grid-cols-2 rounded-xl bg-gray-100 p-1 text-sm font-bold" role="tablist">
        {(['login', 'register'] as const).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            className={`rounded-lg py-2.5 transition ${mode === m ? 'bg-white shadow-sm' : 'text-gray-500'}`}
          >
            {m === 'login' ? 'Se connecter' : 'Créer un compte'}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        <ErrorBox message={error} />
        {mode === 'login' ? (
          <label className="block">
            <span className="mb-2 block text-xs font-bold text-gray-700">Téléphone ou email</span>
            <input autoComplete="username" value={form.identifier} onChange={set('identifier')} className={FIELD} placeholder="0550 12 34 56" />
          </label>
        ) : (
          <>
            <label className="block">
              <span className="mb-2 block text-xs font-bold text-gray-700">Nom et prénom *</span>
              <input autoComplete="name" value={form.name} onChange={set('name')} className={FIELD} placeholder="Amine Benali" />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-bold text-gray-700">Téléphone *</span>
              <input type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} className={FIELD} placeholder="0550 12 34 56" />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-bold text-gray-700">Email (optionnel)</span>
              <input type="email" autoComplete="email" value={form.email} onChange={set('email')} className={FIELD} placeholder="amine@exemple.dz" />
            </label>
          </>
        )}
        <label className="block">
          <span className="mb-2 block text-xs font-bold text-gray-700">Mot de passe {mode === 'register' && '(8 caractères minimum)'}</span>
          <input
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={form.password}
            onChange={set('password')}
            className={FIELD}
          />
        </label>
        <button type="submit" disabled={busy} className={BUTTON}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
        </button>
        {mode === 'login' && (
          <p className="text-center text-xs text-gray-500">Mot de passe oublié ? Contactez-nous, nous le réinitialisons pour vous.</p>
        )}
      </form>

      <div className="mt-8 rounded-xl border border-gray-200 p-4 text-center text-sm">
        Pas besoin de compte pour commander.{' '}
        <Link href="/suivi" className="font-bold underline">
          Suivre une commande
        </Link>
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: OrderConfirmation }) {
  const status = STATUS[order.status] ?? { label: order.status, tone: 'bg-gray-100 text-gray-700' };
  return (
    <li className="rounded-2xl border border-gray-200 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-black">{order.number}</p>
          <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${status.tone}`}>{status.label}</span>
      </div>
      <ul className="mt-3 space-y-1 text-sm text-gray-700">
        {order.items.map((i, idx) => (
          <li key={idx}>
            {i.quantity} × {i.brand} {i.name}
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3 text-sm">
        <span className="text-gray-600">
          {order.deliveryType === 'HOME' ? 'Livraison à domicile' : `Retrait : ${order.stopdeskName ?? 'bureau Yalidine'}`}
          {order.trackingNumber && (
            <>
              {' '}· Suivi Yalidine <span className="font-mono font-bold text-black">{order.trackingNumber}</span>
              {order.yalidineStatus && ` (${order.yalidineStatus})`}
            </>
          )}
        </span>
        <span className="font-black">{formatDA(order.total)}</span>
      </div>
    </li>
  );
}

function Dashboard({ customer }: { customer: Customer }) {
  const { data: orders, loading, error } = useAsyncData(() => shopApi.myOrders(), [customer.id]);
  const { data: wilayas } = useAsyncData(() => shopApi.deliveryWilayas());
  const [profile, setProfile] = useState({ name: customer.name, email: customer.email, wilayaCode: customer.wilayaCode, address: customer.address });
  const [saved, setSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [pw, setPw] = useState({ current: '', next: '' });
  const [pwMessage, setPwMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    try {
      updateCustomer(await shopApi.updateMe({ ...profile, email: profile.email || undefined }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await shopApi.changePassword(pw.current, pw.next);
      setPw({ current: '', next: '' });
      setPwMessage({ ok: true, text: 'Mot de passe modifié.' });
    } catch (err) {
      setPwMessage({ ok: false, text: err instanceof Error ? err.message : 'Erreur' });
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f05b2a]">Mon compte</p>
          <h1 className="text-3xl font-black tracking-tight">Bonjour, {customer.name.split(' ')[0]}</h1>
          <p className="mt-1 text-sm text-gray-600">{customer.phone}</p>
        </div>
        <button onClick={signOut} className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-bold hover:border-black">
          <LogOut className="h-4 w-4" /> Se déconnecter
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <section className="lg:col-span-7">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-black">
            <Package className="h-5 w-5" /> Mes commandes
          </h2>
          {loading && <p className="text-sm text-gray-500">Chargement...</p>}
          {error && <ErrorBox message={error} />}
          {orders && orders.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-600">
              Aucune commande pour le moment.
              <Link href="/" className="mt-3 block font-bold text-black underline">
                Découvrir la boutique
              </Link>
            </div>
          )}
          <ul className="space-y-3">{orders?.map((o) => <OrderCard key={o.id} order={o} />)}</ul>
          <p className="mt-4 text-xs text-gray-500">
            Une commande passée avant la création du compte ?{' '}
            <Link href="/suivi" className="underline">
              Suivez-la avec son numéro
            </Link>
            .
          </p>
        </section>

        <div className="space-y-6 lg:col-span-5">
          <form onSubmit={saveProfile} className="space-y-4 rounded-2xl border border-gray-200 p-5">
            <h2 className="text-lg font-black">Mes informations</h2>
            <ErrorBox message={profileError} />
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-gray-700">Nom et prénom</span>
              <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className={FIELD} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-gray-700">Email</span>
              <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className={FIELD} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-gray-700">Wilaya</span>
              <select value={profile.wilayaCode} onChange={(e) => setProfile({ ...profile, wilayaCode: Number(e.target.value) })} className={FIELD}>
                {(wilayas ?? []).map((w) => (
                  <option key={w.wilayaCode} value={w.wilayaCode}>
                    {String(w.wilayaCode).padStart(2, '0')} - {w.wilayaName}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-gray-700">Adresse de livraison</span>
              <textarea rows={2} value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} className={`${FIELD} resize-none`} />
            </label>
            <button type="submit" className={BUTTON}>
              {saved ? <><Check className="h-4 w-4" /> Enregistré</> : 'Enregistrer'}
            </button>
          </form>

          <form onSubmit={changePassword} className="space-y-4 rounded-2xl border border-gray-200 p-5">
            <h2 className="text-lg font-black">Mot de passe</h2>
            {pwMessage && <p className={`text-sm font-semibold ${pwMessage.ok ? 'text-emerald-700' : 'text-red-700'}`}>{pwMessage.text}</p>}
            <input type="password" autoComplete="current-password" placeholder="Mot de passe actuel" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} className={FIELD} />
            <input type="password" autoComplete="new-password" placeholder="Nouveau mot de passe (8 caractères min.)" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} className={FIELD} />
            <button type="submit" className={BUTTON}>Changer le mot de passe</button>
          </form>
        </div>
      </div>
    </div>
  );
}

function AccountContent() {
  const { customer, ready } = useCustomer();
  if (!ready) return <p className="px-4 py-24 text-center text-sm text-gray-500">Chargement...</p>;
  return customer ? <Dashboard key={customer.id} customer={customer} /> : <AuthForms />;
}

export default function AccountPage() {
  return (
    <ShopShell>
      <Suspense fallback={<p className="px-4 py-24 text-center text-sm text-gray-500">Chargement...</p>}>
        <AccountContent />
      </Suspense>
    </ShopShell>
  );
}
