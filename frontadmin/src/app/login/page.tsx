'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui';

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Read ?next= without useSearchParams so the page can be prerendered.
  const nextPath = () => {
    const next = new URLSearchParams(window.location.search).get('next');
    return next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';
  };

  useEffect(() => {
    if (!loading && user) router.replace(nextPath());
  }, [loading, user, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError('Veuillez saisir votre email et votre mot de passe.');
      return;
    }
    setSubmitting(true);
    try {
      await login(email, password, remember);
      router.replace(nextPath());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion impossible');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Brand panel */}
      <div className="hidden lg:flex relative bg-black text-white p-12 flex-col justify-between overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-pink-600/30 blur-3xl" />
        <div className="absolute bottom-0 -left-24 w-80 h-80 rounded-full bg-pink-500/10 blur-3xl" />
        <div className="relative flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-pink-500 fill-pink-500" />
          <span className="text-2xl font-extrabold tracking-[0.25em]">ECLORA</span>
        </div>
        <div className="relative max-w-md">
          <h1 className="text-4xl font-black leading-tight">Pilotez votre boutique beauté.</h1>
          <p className="text-sm text-neutral-400 mt-4 leading-relaxed">
            Commandes, catalogue, bannières, livraison dans les 58 wilayas : tout se gère depuis un seul endroit.
          </p>
        </div>
        <p className="relative text-[11px] text-neutral-500">© {new Date().getFullYear()} Eclora · Espace réservé à l&apos;équipe</p>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <form onSubmit={onSubmit} className="w-full max-w-sm space-y-6" noValidate>
          <div className="lg:hidden flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-pink-500 fill-pink-500" />
            <span className="text-xl font-extrabold tracking-[0.2em]">ECLORA</span>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">Connexion</h2>
            <p className="text-xs text-slate-500 mt-1">Accédez au panneau d&apos;administration.</p>
          </div>

          {error && (
            <div role="alert" className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl px-3 py-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-px" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <label className="block text-xs">
              <span className="font-bold text-slate-700 block mb-1.5">Email</span>
              <span className="relative block">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@eclora.dz"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-black focus:bg-white"
                />
              </span>
            </label>

            <label className="block text-xs">
              <span className="font-bold text-slate-700 block mb-1.5">Mot de passe</span>
              <span className="relative block">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-10 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-black focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-black w-4 h-4" />
              Rester connecté
            </label>
          </div>

          <Button type="submit" loading={submitting} className="w-full py-3 text-sm">
            Se connecter
          </Button>

          {process.env.NODE_ENV !== 'production' && (
            <div className="text-[11px] text-slate-500 bg-slate-50 border border-dashed border-slate-300 rounded-xl p-3 leading-relaxed">
              <b className="text-slate-700">Démo :</b> admin@eclora.dz / admin123
              <br />
              Support : support@eclora.dz / support123
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
