'use client';

import React, { useMemo, useState } from 'react';
import { Plus, Edit2, Trash2, Star } from 'lucide-react';
import { api } from '@/lib/admin/api';
import { useApi } from '@/lib/admin/useApi';
import { initials } from '@/lib/admin/format';
import type { Brand } from '@/types/admin';
import { Badge, Button, Card, ConfirmDialog, EmptyState, ErrorState, Field, IconButton, Input, LoadingState, Modal, PageHeader, SearchInput, Toggle } from '@/components/admin/ui';
import { useToast } from '@/components/admin/ui/Toast';

type Draft = { id?: string; name: string; logoUrl: string; isFeatured: boolean };

export default function BrandsPage() {
  const toast = useToast();
  const { data, loading, error, reload } = useApi(async () => {
    const [brands, products] = await Promise.all([api.brands.list(), api.products.list()]);
    return { brands, products };
  });
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [toDelete, setToDelete] = useState<Brand | null>(null);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(
    () => (data?.brands ?? []).filter((b) => b.name.toLowerCase().includes(query.trim().toLowerCase())),
    [data, query]
  );

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error ?? 'Erreur'} onRetry={reload} />;

  const count = (id: string) => data.products.filter((p) => p.brandId === id).length;

  const save = async () => {
    if (!draft?.name.trim()) return toast.error('Le nom est obligatoire');
    setBusy(true);
    const ok = await toast.run(
      () => api.brands.save({ id: draft.id, name: draft.name.trim().toUpperCase(), logoUrl: draft.logoUrl.trim() || undefined, isFeatured: draft.isFeatured }),
      'Marque enregistrée'
    );
    setBusy(false);
    if (ok) {
      setDraft(null);
      reload();
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setBusy(true);
    const ok = await toast.run(() => api.brands.remove(toDelete.id), 'Marque supprimée');
    setBusy(false);
    setToDelete(null);
    if (ok) reload();
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Marques"
        description="Les marques alimentent le filtre « Marque » de la boutique. Les marques vedettes sont mises en avant."
        actions={<Button icon={Plus} onClick={() => setDraft({ name: '', logoUrl: '', isFeatured: false })}>Nouvelle marque</Button>}
      />

      <SearchInput value={query} onChange={setQuery} placeholder="Rechercher une marque..." className="mb-4 max-w-sm" />

      {filtered.length === 0 ? (
        <Card><EmptyState title="Aucune marque" /></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((b) => (
            <div key={b.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                {b.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.logoUrl} alt="" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-xs font-black text-slate-500">{initials(b.name)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-black truncate flex items-center gap-1.5">
                  {b.name}
                  {b.isFeatured && <Star className="w-3.5 h-3.5 text-pink-600 fill-pink-600 flex-shrink-0" aria-label="Vedette" />}
                </div>
                <div className="mt-1"><Badge>{count(b.id)} produits</Badge></div>
              </div>
              <IconButton label="Modifier" icon={Edit2} onClick={() => setDraft({ id: b.id, name: b.name, logoUrl: b.logoUrl ?? '', isFeatured: b.isFeatured })} />
              <IconButton label="Supprimer" icon={Trash2} tone="danger" onClick={() => setToDelete(b)} />
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!draft}
        onClose={() => setDraft(null)}
        title={draft?.id ? 'Modifier la marque' : 'Nouvelle marque'}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDraft(null)}>Annuler</Button>
            <Button loading={busy} onClick={save}>Enregistrer</Button>
          </>
        }
      >
        {draft && (
          <>
            <Field label="Nom *">
              <Input autoFocus value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="HUDA BEAUTY" />
            </Field>
            <Field label="URL du logo" hint="Optionnel">
              <Input value={draft.logoUrl} onChange={(e) => setDraft({ ...draft, logoUrl: e.target.value })} placeholder="https://..." />
            </Field>
            <Toggle checked={draft.isFeatured} onChange={(v) => setDraft({ ...draft, isFeatured: v })} label="Marque vedette" />
          </>
        )}
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={busy}
        title="Supprimer la marque ?"
        message={`« ${toDelete?.name} » sera supprimée. Impossible si des produits l’utilisent.`}
      />
    </div>
  );
}
