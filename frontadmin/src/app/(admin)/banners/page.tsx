'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { formatDate } from '@/lib/format';
import { BANNER_PLACEMENT } from '@/lib/constants';
import type { Banner, BannerPlacement } from '@/types';
import { Badge, Button, Card, ConfirmDialog, EmptyState, ErrorState, Field, IconButton, Input, LoadingState, Modal, PageHeader, Select, Textarea, Toggle } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';

type Draft = Omit<Banner, 'id' | 'position'> & { id?: string };

const EMPTY: Draft = {
  placement: 'HERO',
  title: '',
  subtitle: '',
  description: '',
  badge: '',
  buttonText: 'Découvrir',
  imageUrl: '',
  link: '/',
  isActive: true,
};

function scheduleLabel(b: Banner): string | null {
  const now = new Date().toISOString();
  if (b.startsAt && b.startsAt > now) return `Programmée le ${formatDate(b.startsAt)}`;
  if (b.endsAt && b.endsAt < now) return `Expirée le ${formatDate(b.endsAt)}`;
  if (b.endsAt) return `Jusqu’au ${formatDate(b.endsAt)}`;
  return null;
}

export default function BannersPage() {
  const toast = useToast();
  const { data: banners, loading, error, reload } = useApi(() => api.banners.list());
  const [draft, setDraft] = useState<Draft | null>(null);
  const [toDelete, setToDelete] = useState<Banner | null>(null);
  const [busy, setBusy] = useState(false);

  if (loading) return <LoadingState />;
  if (error || !banners) return <ErrorState message={error ?? 'Erreur'} onRetry={reload} />;

  const save = async () => {
    if (!draft) return;
    if (!draft.title.trim() || !draft.imageUrl.trim()) return toast.error('Titre et image sont obligatoires');
    if (draft.startsAt && draft.endsAt && draft.endsAt < draft.startsAt) return toast.error('La date de fin doit suivre la date de début');
    setBusy(true);
    const ok = await toast.run(() => api.banners.save(draft), 'Bannière enregistrée');
    setBusy(false);
    if (ok) {
      setDraft(null);
      reload();
    }
  };

  const act = async (fn: () => Promise<unknown>) => {
    await toast.run(fn);
    reload();
  };

  const toDateInput = (iso?: string) => (iso ? iso.slice(0, 10) : '');
  const fromDateInput = (v: string) => (v ? new Date(`${v}T00:00:00`).toISOString() : undefined);

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Bannières"
        description="Gérez les visuels de la page d’accueil. Programmez une date de début et de fin pour vos campagnes."
        actions={<Button icon={Plus} onClick={() => setDraft({ ...EMPTY })}>Nouvelle bannière</Button>}
      />

      {(Object.keys(BANNER_PLACEMENT) as BannerPlacement[]).map((placement) => {
        const group = banners.filter((b) => b.placement === placement).sort((a, b) => a.position - b.position);
        return (
          <Card
            key={placement}
            title={BANNER_PLACEMENT[placement].label}
            description={BANNER_PLACEMENT[placement].hint}
            actions={<Button size="sm" variant="secondary" icon={Plus} onClick={() => setDraft({ ...EMPTY, placement })}>Ajouter</Button>}
          >
            {group.length === 0 ? (
              <EmptyState title="Aucune bannière" />
            ) : (
              <ul className="space-y-3">
                {group.map((b, i) => {
                  const schedule = scheduleLabel(b);
                  return (
                    <li key={b.id} className={`flex flex-col sm:flex-row gap-4 p-3 rounded-xl border ${b.isActive ? 'border-slate-200' : 'border-dashed border-slate-300 opacity-70'}`}>
                      <div className={`relative rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 ${placement === 'HERO' ? 'sm:w-64 aspect-[16/7]' : 'sm:w-40 aspect-[4/3]'}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={b.imageUrl} alt="" className="w-full h-full object-cover" />
                        {b.badge && <span className="absolute top-2 left-2 bg-white text-black text-[10px] font-black px-1.5 py-0.5 rounded">{b.badge}</span>}
                      </div>
                      <div className="flex-1 min-w-0 text-xs">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-black">{b.title}</span>
                          {!b.isActive && <Badge>Désactivée</Badge>}
                          {schedule && <Badge tone="blue">{schedule}</Badge>}
                        </div>
                        {b.subtitle && <div className="font-bold text-slate-700 mt-0.5">{b.subtitle}</div>}
                        {b.description && <p className="text-slate-500 mt-1 line-clamp-2">{b.description}</p>}
                        <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                          Bouton « {b.buttonText} » <ExternalLink className="w-3 h-3" /> {b.link}
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-center gap-1 justify-between">
                        <Toggle checked={b.isActive} onChange={() => act(() => api.banners.toggle(b.id))} label={undefined} />
                        <div className="flex sm:flex-col">
                          <IconButton label="Monter" icon={ArrowUp} disabled={i === 0} onClick={() => act(() => api.banners.move(b.id, -1))} />
                          <IconButton label="Descendre" icon={ArrowDown} disabled={i === group.length - 1} onClick={() => act(() => api.banners.move(b.id, 1))} />
                        </div>
                        <div className="flex sm:flex-col">
                          <IconButton label="Modifier" icon={Edit2} onClick={() => setDraft({ ...b })} />
                          <IconButton label="Supprimer" icon={Trash2} tone="danger" onClick={() => setToDelete(b)} />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        );
      })}

      <Modal
        open={!!draft}
        onClose={() => setDraft(null)}
        title={draft?.id ? 'Modifier la bannière' : 'Nouvelle bannière'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDraft(null)}>Annuler</Button>
            <Button loading={busy} onClick={save}>Enregistrer</Button>
          </>
        }
      >
        {draft && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <Field label="Emplacement">
                <Select value={draft.placement} onChange={(e) => setDraft({ ...draft, placement: e.target.value as BannerPlacement })}>
                  {(Object.keys(BANNER_PLACEMENT) as BannerPlacement[]).map((p) => <option key={p} value={p}>{BANNER_PLACEMENT[p].label}</option>)}
                </Select>
              </Field>
              <Field label="Titre *"><Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></Field>
              <Field label="Sous-titre"><Input value={draft.subtitle ?? ''} onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })} /></Field>
              <Field label="Description"><Textarea rows={3} value={draft.description ?? ''} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Texte du bouton"><Input value={draft.buttonText} onChange={(e) => setDraft({ ...draft, buttonText: e.target.value })} /></Field>
                <Field label="Badge"><Input value={draft.badge ?? ''} onChange={(e) => setDraft({ ...draft, badge: e.target.value })} placeholder="Nouveau" /></Field>
              </div>
            </div>
            <div className="space-y-4">
              <Field label="URL de l’image *" hint={draft.placement === 'HERO' ? 'Format large recommandé : 1800 × 800 px' : 'Format recommandé : 800 × 600 px'}>
                <Input value={draft.imageUrl} onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value })} placeholder="https://..." />
              </Field>
              <div className="rounded-xl overflow-hidden bg-slate-100 border border-slate-200 aspect-[16/9] flex items-center justify-center">
                {draft.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={draft.imageUrl} alt="Aperçu" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[11px] text-slate-400">Aperçu de l’image</span>
                )}
              </div>
              <Field label="Lien" hint="Ex : /shop/parfum ou /product/dior-sauvage">
                <Input value={draft.link} onChange={(e) => setDraft({ ...draft, link: e.target.value })} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Début (optionnel)"><Input type="date" value={toDateInput(draft.startsAt)} onChange={(e) => setDraft({ ...draft, startsAt: fromDateInput(e.target.value) })} /></Field>
                <Field label="Fin (optionnel)"><Input type="date" value={toDateInput(draft.endsAt)} onChange={(e) => setDraft({ ...draft, endsAt: fromDateInput(e.target.value) })} /></Field>
              </div>
              <Toggle checked={draft.isActive} onChange={(v) => setDraft({ ...draft, isActive: v })} label="Active" />
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          if (toDelete) await act(() => api.banners.remove(toDelete.id));
          setToDelete(null);
        }}
        title="Supprimer la bannière ?"
        message={`« ${toDelete?.title} » sera définitivement supprimée. Vous pouvez aussi simplement la désactiver.`}
      />
    </div>
  );
}
