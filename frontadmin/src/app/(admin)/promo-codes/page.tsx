'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Copy } from 'lucide-react';
import { api } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { formatDA, formatDate } from '@/lib/format';
import { PROMO_TYPE } from '@/lib/constants';
import type { PromoCode, PromoType } from '@/types';
import { Badge, Button, Card, ConfirmDialog, EmptyState, ErrorState, Field, IconButton, Input, LoadingState, Modal, PageHeader, Select, Table, Td, Th, Toggle } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';

type Draft = Omit<PromoCode, 'id' | 'usedCount'> & { id?: string };

const EMPTY: Draft = { code: '', type: 'PERCENT', value: 10, minOrder: 0, isActive: true };

function state(p: PromoCode): { label: string; tone: 'emerald' | 'neutral' | 'red' | 'amber' | 'blue' } {
  const now = new Date().toISOString();
  if (!p.isActive) return { label: 'Désactivé', tone: 'neutral' };
  if (p.endsAt && p.endsAt < now) return { label: 'Expiré', tone: 'red' };
  if (p.maxUses && p.usedCount >= p.maxUses) return { label: 'Épuisé', tone: 'amber' };
  if (p.startsAt && p.startsAt > now) return { label: 'Programmé', tone: 'blue' };
  return { label: 'Actif', tone: 'emerald' };
}

function valueLabel(p: Pick<PromoCode, 'type' | 'value'>): string {
  if (p.type === 'PERCENT') return `-${p.value}%`;
  if (p.type === 'FIXED') return `-${formatDA(p.value)}`;
  return 'Livraison offerte';
}

export default function PromoCodesPage() {
  const toast = useToast();
  const { data: promos, loading, error, reload } = useApi(() => api.promoCodes.list());
  const [draft, setDraft] = useState<Draft | null>(null);
  const [toDelete, setToDelete] = useState<PromoCode | null>(null);
  const [busy, setBusy] = useState(false);

  if (loading) return <LoadingState />;
  if (error || !promos) return <ErrorState message={error ?? 'Erreur'} onRetry={reload} />;

  const save = async () => {
    if (!draft) return;
    if (!/^[A-Z0-9_-]{3,20}$/i.test(draft.code.trim())) return toast.error('Code : 3 à 20 caractères (lettres, chiffres, - ou _)');
    if (draft.type === 'PERCENT' && (draft.value <= 0 || draft.value > 90)) return toast.error('Le pourcentage doit être entre 1 et 90');
    if (draft.type === 'FIXED' && draft.value <= 0) return toast.error('Le montant doit être supérieur à 0');
    setBusy(true);
    const ok = await toast.run(() => api.promoCodes.save(draft), 'Code promo enregistré');
    setBusy(false);
    if (ok) {
      setDraft(null);
      reload();
    }
  };

  const generate = () => draft && setDraft({ ...draft, code: `ECL${Math.random().toString(36).slice(2, 8).toUpperCase()}` });
  const toDateInput = (iso?: string) => (iso ? iso.slice(0, 10) : '');
  const fromDateInput = (v: string, end = false) => (v ? new Date(`${v}T${end ? '23:59:59' : '00:00:00'}`).toISOString() : undefined);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Codes promo"
        description="Créez des réductions en pourcentage, en montant fixe ou la livraison offerte, avec limite d’utilisation et dates."
        actions={<Button icon={Plus} onClick={() => setDraft({ ...EMPTY })}>Nouveau code</Button>}
      />

      <Card padded={false}>
        {promos.length === 0 ? (
          <EmptyState title="Aucun code promo" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Code</Th>
                <Th>Réduction</Th>
                <Th className="hidden md:table-cell">Minimum</Th>
                <Th>Utilisations</Th>
                <Th className="hidden lg:table-cell">Validité</Th>
                <Th>État</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {promos.map((p) => {
                const s = state(p);
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <Td>
                      <button
                        className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-md inline-flex items-center gap-1.5 hover:bg-slate-200"
                        onClick={() => navigator.clipboard?.writeText(p.code).then(() => toast.success('Code copié'))}
                        title="Copier"
                      >
                        {p.code} <Copy className="w-3 h-3 text-slate-400" />
                      </button>
                    </Td>
                    <Td className="font-bold whitespace-nowrap">{valueLabel(p)}</Td>
                    <Td className="hidden md:table-cell text-slate-600 whitespace-nowrap">{p.minOrder ? formatDA(p.minOrder) : '—'}</Td>
                    <Td className="tabular-nums">
                      <span className="font-bold">{p.usedCount}</span>
                      <span className="text-slate-400"> / {p.maxUses ?? '∞'}</span>
                    </Td>
                    <Td className="hidden lg:table-cell text-slate-600 whitespace-nowrap">
                      {p.startsAt || p.endsAt
                        ? `${p.startsAt ? formatDate(p.startsAt) : '…'} → ${p.endsAt ? formatDate(p.endsAt) : '…'}`
                        : 'Sans limite'}
                    </Td>
                    <Td><Badge tone={s.tone}>{s.label}</Badge></Td>
                    <Td className="text-right whitespace-nowrap">
                      <IconButton label="Modifier" icon={Edit2} onClick={() => setDraft({ ...p })} />
                      <IconButton label="Supprimer" icon={Trash2} tone="danger" onClick={() => setToDelete(p)} />
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal
        open={!!draft}
        onClose={() => setDraft(null)}
        title={draft?.id ? 'Modifier le code promo' : 'Nouveau code promo'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDraft(null)}>Annuler</Button>
            <Button loading={busy} onClick={save}>Enregistrer</Button>
          </>
        }
      >
        {draft && (
          <>
            <Field label="Code *" hint="Les clients le saisissent au panier">
              <div className="flex gap-2">
                <Input value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })} className="font-mono" placeholder="RAMADAN20" />
                <Button type="button" variant="secondary" onClick={generate}>Générer</Button>
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Type">
                <Select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as PromoType })}>
                  {(Object.keys(PROMO_TYPE) as PromoType[]).map((t) => <option key={t} value={t}>{PROMO_TYPE[t]}</option>)}
                </Select>
              </Field>
              {draft.type !== 'FREE_SHIPPING' && (
                <Field label={draft.type === 'PERCENT' ? 'Pourcentage (%)' : 'Montant (DA)'}>
                  <Input type="number" min={0} value={draft.value} onChange={(e) => setDraft({ ...draft, value: Number(e.target.value) })} />
                </Field>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Commande minimum (DA)">
                <Input type="number" min={0} step={500} value={draft.minOrder} onChange={(e) => setDraft({ ...draft, minOrder: Number(e.target.value) })} />
              </Field>
              <Field label="Utilisations max" hint="Vide = illimité">
                <Input type="number" min={1} value={draft.maxUses ?? ''} onChange={(e) => setDraft({ ...draft, maxUses: e.target.value ? Number(e.target.value) : undefined })} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Début"><Input type="date" value={toDateInput(draft.startsAt)} onChange={(e) => setDraft({ ...draft, startsAt: fromDateInput(e.target.value) })} /></Field>
              <Field label="Fin"><Input type="date" value={toDateInput(draft.endsAt)} onChange={(e) => setDraft({ ...draft, endsAt: fromDateInput(e.target.value, true) })} /></Field>
            </div>
            <Toggle checked={draft.isActive} onChange={(v) => setDraft({ ...draft, isActive: v })} label="Actif" />
            <p className="text-[11px] text-slate-500 bg-slate-50 rounded-lg p-2.5">
              Résumé : <b className="text-slate-800">{valueLabel(draft)}</b>
              {draft.minOrder > 0 && <> dès {formatDA(draft.minOrder)} d’achat</>}
              {draft.maxUses && <>, limité à {draft.maxUses} utilisations</>}.
            </p>
          </>
        )}
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          if (toDelete && (await toast.run(() => api.promoCodes.remove(toDelete.id), 'Code supprimé'))) reload();
          setToDelete(null);
        }}
        title="Supprimer ce code ?"
        message={`Le code ${toDelete?.code} ne pourra plus être utilisé.`}
      />
    </div>
  );
}
