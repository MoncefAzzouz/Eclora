'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, X, Trash2, Star } from 'lucide-react';
import { api } from '@/lib/api';
import { emitDataChanged, useApi } from '@/lib/useApi';
import { timeAgo } from '@/lib/format';
import { REVIEW_STATUS } from '@/lib/constants';
import type { ReviewStatus } from '@/types';
import { Button, Card, EmptyState, ErrorState, IconButton, LoadingState, PageHeader, StatusBadge, Tabs, Thumb } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex" aria-label={`${rating} sur 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= rating ? 'fill-black text-black' : 'text-slate-300'}`} />
      ))}
    </span>
  );
}

export default function ReviewsPage() {
  const toast = useToast();
  const { data, loading, error, reload } = useApi(async () => {
    const [reviews, products] = await Promise.all([api.reviews.list(), api.products.list()]);
    return { reviews, products };
  });
  const [tab, setTab] = useState<ReviewStatus>('PENDING');

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error ?? 'Erreur'} onRetry={reload} />;

  const list = data.reviews.filter((r) => r.status === tab);
  const count = (s: ReviewStatus) => data.reviews.filter((r) => r.status === s).length;

  const act = async (fn: () => Promise<unknown>, msg: string) => {
    if (await toast.run(fn, msg)) {
      emitDataChanged();
      reload();
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Avis clients" description="Les nouveaux avis ne sont publiés sur la fiche produit qu’après votre validation." />

      <Tabs
        tabs={(Object.keys(REVIEW_STATUS) as ReviewStatus[]).map((s) => ({ id: s, label: REVIEW_STATUS[s].label, count: count(s) }))}
        value={tab}
        onChange={setTab}
      />

      {list.length === 0 ? (
        <Card><EmptyState title="Rien ici" description={tab === 'PENDING' ? 'Aucun avis en attente de modération.' : undefined} /></Card>
      ) : (
        <div className="space-y-3">
          {list.map((r) => {
            const product = data.products.find((p) => p.id === r.productId);
            return (
              <div key={r.id} className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Stars rating={r.rating} />
                      <span className="text-sm font-black">{r.title}</span>
                      <StatusBadge map={REVIEW_STATUS} value={r.status} />
                    </div>
                    <p className="text-xs text-slate-700 mt-2 leading-relaxed">{r.text}</p>
                    <p className="text-[11px] text-slate-500 mt-2">
                      {r.authorName} · {timeAgo(r.createdAt)}
                    </p>
                  </div>
                  <div className="md:w-60 flex md:flex-col gap-3 md:items-end justify-between">
                    {product && (
                      <Link href={`/products/${product.id}`} className="flex items-center gap-2 text-xs group min-w-0">
                        <Thumb src={product.images[0]} alt={product.name} size={32} />
                        <span className="font-bold line-clamp-2 group-hover:underline">{product.name}</span>
                      </Link>
                    )}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {r.status !== 'APPROVED' && (
                        <Button size="sm" icon={Check} onClick={() => act(() => api.reviews.setStatus(r.id, 'APPROVED'), 'Avis publié')}>
                          Publier
                        </Button>
                      )}
                      {r.status !== 'REJECTED' && (
                        <Button size="sm" variant="secondary" icon={X} onClick={() => act(() => api.reviews.setStatus(r.id, 'REJECTED'), 'Avis rejeté')}>
                          Rejeter
                        </Button>
                      )}
                      <IconButton label="Supprimer" icon={Trash2} tone="danger" onClick={() => act(() => api.reviews.remove(r.id), 'Avis supprimé')} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
