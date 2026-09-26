'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, X, Image as ImageIcon, Check } from 'lucide-react';
import { api } from '@/lib/admin/api';
import { useApi } from '@/lib/admin/useApi';
import { formatDA } from '@/lib/admin/format';
import type { HomeSection } from '@/types/admin';
import { Badge, Button, Card, ConfirmDialog, ErrorState, Field, IconButton, Input, LoadingState, Modal, PageHeader, SearchInput, Thumb, Toggle } from '@/components/admin/ui';
import { useToast } from '@/components/admin/ui/Toast';

type Draft = Omit<HomeSection, 'id' | 'position'> & { id?: string };

export default function HomepagePage() {
  const toast = useToast();
  const { data, loading, error, reload } = useApi(async () => {
    const [sections, products, banners] = await Promise.all([api.homeSections.list(), api.products.list(), api.banners.list()]);
    return { sections, products, banners };
  });
  const [draft, setDraft] = useState<Draft | null>(null);
  const [pickerQuery, setPickerQuery] = useState('');
  const [toDelete, setToDelete] = useState<HomeSection | null>(null);
  const [busy, setBusy] = useState(false);

  const pickable = useMemo(() => {
    const q = pickerQuery.trim().toLowerCase();
    return (data?.products ?? []).filter((p) => p.status === 'ACTIVE' && (!q || p.name.toLowerCase().includes(q)));
  }, [data, pickerQuery]);

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error ?? 'Erreur'} onRetry={reload} />;

  const product = (id: string) => data.products.find((p) => p.id === id);
  const activeBanners = (placement: string) => data.banners.filter((b) => b.placement === placement && b.isActive).length;

  const act = async (fn: () => Promise<unknown>, msg?: string) => {
    await toast.run(fn, msg);
    reload();
  };

  const save = async () => {
    if (!draft?.title.trim()) return toast.error('Le titre est obligatoire');
    if (draft.productIds.length < 2) return toast.error('Sélectionnez au moins 2 produits');
    setBusy(true);
    const ok = await toast.run(() => api.homeSections.save({ ...draft, title: draft.title.trim() }), 'Section enregistrée');
    setBusy(false);
    if (ok) {
      setDraft(null);
      reload();
    }
  };

  const toggleProduct = (id: string) =>
    draft &&
    setDraft({
      ...draft,
      productIds: draft.productIds.includes(id) ? draft.productIds.filter((x) => x !== id) : [...draft.productIds, id],
    });

  const moveProduct = (i: number, dir: -1 | 1) => {
    if (!draft) return;
    const ids = [...draft.productIds];
    [ids[i], ids[i + dir]] = [ids[i + dir]!, ids[i]!];
    setDraft({ ...draft, productIds: ids });
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Page d’accueil"
        description="Composez la page d’accueil : l’ordre des carrousels produits et les produits affichés dans chacun."
        actions={<Button icon={Plus} onClick={() => setDraft({ title: '', productIds: [], isVisible: true })}>Nouveau carrousel</Button>}
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          {data.sections.map((s, i) => {
            const missing = s.productIds.filter((id) => product(id)?.status !== 'ACTIVE').length;
            return (
              <Card key={s.id} className={s.isVisible ? '' : 'opacity-70'}>
                <div className="flex items-start gap-3">
                  <div className="flex flex-col">
                    <IconButton label="Monter" icon={ArrowUp} disabled={i === 0} onClick={() => act(() => api.homeSections.move(s.id, -1))} />
                    <IconButton label="Descendre" icon={ArrowDown} disabled={i === data.sections.length - 1} onClick={() => act(() => api.homeSections.move(s.id, 1))} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black">{s.title}</span>
                      <Badge>{s.productIds.length} produits</Badge>
                      {!s.isVisible && <Badge>Masqué</Badge>}
                      {missing > 0 && <Badge tone="amber">{missing} non visible(s) en boutique</Badge>}
                    </div>
                    <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
                      {s.productIds.map((id) => {
                        const p = product(id);
                        return p ? (
                          <Link key={id} href={`/admin/products/${id}`} title={p.name} className={p.status === 'ACTIVE' ? '' : 'opacity-40'}>
                            <Thumb src={p.images[0]} alt={p.name} size={48} />
                          </Link>
                        ) : null;
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Toggle checked={s.isVisible} onChange={(v) => act(() => api.homeSections.save({ ...s, isVisible: v }))} />
                    <IconButton label="Modifier" icon={Edit2} onClick={() => setDraft({ ...s })} />
                    <IconButton label="Supprimer" icon={Trash2} tone="danger" onClick={() => setToDelete(s)} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Card title="Structure de la page" description="Aperçu de l’ordre d’affichage en boutique">
          <ol className="space-y-2 text-xs">
            {[
              { label: 'Bannière hero', count: activeBanners('HERO'), banner: true },
              { label: 'Promos doubles', count: activeBanners('PROMO_DUAL'), banner: true },
              ...data.sections.filter((s) => s.isVisible).slice(0, 1).map((s) => ({ label: s.title, count: s.productIds.length, banner: false })),
              { label: 'Promos milieu', count: activeBanners('PROMO_MIDDLE'), banner: true },
              ...data.sections.filter((s) => s.isVisible).slice(1).map((s) => ({ label: s.title, count: s.productIds.length, banner: false })),
            ].map((row, i) => (
              <li key={i} className={`flex items-center gap-2 p-2.5 rounded-lg border ${row.banner ? 'border-pink-200 bg-pink-50/50' : 'border-slate-200'}`}>
                {row.banner ? <ImageIcon className="w-3.5 h-3.5 text-pink-600" /> : <span className="w-3.5 text-center font-black text-slate-400">≡</span>}
                <span className="flex-1 font-bold truncate">{row.label}</span>
                <span className="text-slate-500">{row.count}</span>
              </li>
            ))}
          </ol>
          <Link href="/admin/banners" className="text-xs font-bold hover:underline mt-4 inline-block">Gérer les bannières →</Link>
        </Card>
      </div>

      <Modal
        open={!!draft}
        onClose={() => setDraft(null)}
        title={draft?.id ? 'Modifier le carrousel' : 'Nouveau carrousel'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDraft(null)}>Annuler</Button>
            <Button loading={busy} onClick={save}>Enregistrer</Button>
          </>
        }
      >
        {draft && (
          <>
            <Field label="Titre du carrousel *">
              <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Nouveautés maquillage" />
            </Field>

            <div>
              <div className="text-xs font-bold text-slate-700 mb-2">Produits sélectionnés ({draft.productIds.length}) — dans l’ordre d’affichage</div>
              {draft.productIds.length === 0 ? (
                <p className="text-xs text-slate-500">Choisissez des produits ci-dessous.</p>
              ) : (
                <ul className="space-y-1.5">
                  {draft.productIds.map((id, i) => {
                    const p = product(id);
                    if (!p) return null;
                    return (
                      <li key={id} className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-200 text-xs">
                        <span className="w-5 text-center font-black text-slate-400">{i + 1}</span>
                        <Thumb src={p.images[0]} alt="" size={28} />
                        <span className="flex-1 font-bold truncate">{p.name}</span>
                        <IconButton label="Monter" icon={ArrowUp} disabled={i === 0} onClick={() => moveProduct(i, -1)} />
                        <IconButton label="Descendre" icon={ArrowDown} disabled={i === draft.productIds.length - 1} onClick={() => moveProduct(i, 1)} />
                        <IconButton label="Retirer" icon={X} tone="danger" onClick={() => toggleProduct(id)} />
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div>
              <div className="text-xs font-bold text-slate-700 mb-2">Ajouter des produits</div>
              <SearchInput value={pickerQuery} onChange={setPickerQuery} placeholder="Rechercher un produit en ligne..." />
              <ul className="grid sm:grid-cols-2 gap-1.5 mt-2 max-h-64 overflow-y-auto">
                {pickable.map((p) => {
                  const on = draft.productIds.includes(p.id);
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => toggleProduct(p.id)}
                        className={`w-full flex items-center gap-2 p-1.5 rounded-lg border text-left text-xs ${on ? 'border-black bg-slate-50' : 'border-slate-200 hover:border-slate-400'}`}
                      >
                        <Thumb src={p.images[0]} alt="" size={28} />
                        <span className="flex-1 min-w-0">
                          <span className="block font-bold truncate">{p.name}</span>
                          <span className="block text-[10px] text-slate-500">{formatDA(p.price)}</span>
                        </span>
                        {on && <Check className="w-4 h-4" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <Toggle checked={draft.isVisible} onChange={(v) => setDraft({ ...draft, isVisible: v })} label="Visible en boutique" />
          </>
        )}
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          if (toDelete) await act(() => api.homeSections.remove(toDelete.id), 'Carrousel supprimé');
          setToDelete(null);
        }}
        title="Supprimer ce carrousel ?"
        message={`« ${toDelete?.title} » sera retiré de la page d’accueil. Les produits ne sont pas supprimés.`}
      />
    </div>
  );
}
