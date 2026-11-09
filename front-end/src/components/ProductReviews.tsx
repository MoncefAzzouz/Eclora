'use client';

// Customer reviews on the product page. Reviews are published only after an
// admin approves them (admin → Avis); the form says so.
import React, { useState } from 'react';
import { Loader2, Star } from 'lucide-react';
import type { Product } from '@/data/products';
import { shopApi } from '@/lib/shop/api';
import { useCustomer } from '@/lib/shop/account';

function Stars({ value, size = 'h-4 w-4' }: { value: number; size?: string }) {
  return (
    <div className="flex">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} className={`${size} ${i < Math.round(value) ? 'fill-black text-black' : 'text-gray-300'}`} />
      ))}
    </div>
  );
}

const FIELD = 'w-full rounded-xl border border-gray-300 px-4 py-3 text-base outline-none focus:border-black sm:text-sm';

function ReviewForm({ productId, onDone }: { productId: string; onDone: (message: string) => void }) {
  const { customer } = useCustomer();
  const [form, setForm] = useState({ authorName: customer?.name.split(' ')[0] ?? '', rating: 0, title: '', text: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.rating) return setError('Choisissez une note de 1 à 5 étoiles.');
    setBusy(true);
    setError(null);
    try {
      const res = await shopApi.submitReview(productId, form);
      onDone(res.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Envoi impossible');
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-gray-200 p-5" noValidate>
      <div>
        <span className="mb-1.5 block text-xs font-bold">Votre note *</span>
        <div className="flex gap-1" role="radiogroup" aria-label="Note">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={form.rating === n}
              aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
              onClick={() => setForm({ ...form, rating: n })}
              className="p-0.5"
            >
              <Star className={`h-7 w-7 ${n <= form.rating ? 'fill-black text-black' : 'text-gray-300'}`} />
            </button>
          ))}
        </div>
      </div>
      <input className={FIELD} placeholder="Votre prénom *" value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} />
      <input className={FIELD} placeholder="Titre de votre avis *" maxLength={80} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <textarea
        className={`${FIELD} resize-none`}
        rows={4}
        placeholder="Votre avis (10 caractères minimum) *"
        value={form.text}
        onChange={(e) => setForm({ ...form, text: e.target.value })}
      />
      {error && <p className="text-sm font-semibold text-red-700">{error}</p>}
      <button type="submit" disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-black py-3 text-sm font-bold text-white disabled:opacity-60">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Publier mon avis
      </button>
      <p className="text-center text-[11px] text-gray-500">Votre avis sera publié après vérification par notre équipe.</p>
    </form>
  );
}

export default function ProductReviews({ product }: { product: Product }) {
  const reviews = product.reviews ?? [];
  const [formOpen, setFormOpen] = useState(false);
  const [thanks, setThanks] = useState<string | null>(null);

  const counts = [5, 4, 3, 2, 1].map((n) => ({ n, count: reviews.filter((r) => r.rating === n).length }));

  return (
    <section id="reviews" className="mt-20 border-t border-gray-200 pt-12">
      <h2 className="text-xl font-black sm:text-2xl">Avis sur le produit</h2>
      {product.reviewsCount > 0 && (
        <div className="mt-1 flex items-center gap-2">
          <Stars value={product.rating} />
          <span className="text-sm font-bold">{product.rating.toFixed(1)}/5</span>
          <span className="text-xs text-gray-500">({product.reviewsCount} avis)</span>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-5">
          {reviews.length > 0 && (
            <div className="space-y-2.5 rounded-2xl border border-gray-100 bg-gray-50/70 p-6 text-xs">
              {counts.map(({ n, count }) => (
                <div key={n} className="flex items-center gap-3">
                  <span className="w-14 font-bold">{n} étoile{n > 1 ? 's' : ''}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                    <div className="h-full bg-black" style={{ width: `${(count / reviews.length) * 100}%` }} />
                  </div>
                  <span className="w-8 text-right text-gray-500">{count}</span>
                </div>
              ))}
            </div>
          )}

          {thanks ? (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm font-semibold text-emerald-800">{thanks}</p>
          ) : formOpen ? (
            <ReviewForm
              productId={product.id}
              onDone={(m) => {
                setThanks(m);
                setFormOpen(false);
              }}
            />
          ) : (
            <button onClick={() => setFormOpen(true)} className="w-full rounded-full bg-black py-3 text-sm font-bold text-white transition-colors hover:bg-neutral-800">
              Donner mon avis
            </button>
          )}
        </div>

        <div className="space-y-4 lg:col-span-7">
          {reviews.length > 0 ? (
            reviews.map((rev) => (
              <article key={rev.id} className="space-y-2 rounded-2xl border border-gray-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <Stars value={rev.rating} />
                  <span className="text-xs text-gray-400">{rev.date}</span>
                </div>
                <p className="text-sm font-extrabold">{rev.author}</p>
                <h3 className="text-sm font-bold">{rev.title}</h3>
                <p className="text-sm leading-relaxed text-gray-700">{rev.text}</p>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-gray-200 p-8 text-center text-sm text-gray-500">
              Aucun avis pour le moment. Soyez le premier à donner votre avis !
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
