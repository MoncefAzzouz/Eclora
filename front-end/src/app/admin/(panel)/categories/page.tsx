'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, EyeOff, ChevronDown, ChevronRight } from 'lucide-react';
import { api } from '@/lib/admin/api';
import { useApi } from '@/lib/admin/useApi';
import { slugify } from '@/lib/admin/format';
import type { Category, Subcategory } from '@/types/admin';
import { Badge, Button, Card, ConfirmDialog, ErrorState, Field, IconButton, Input, LoadingState, Modal, PageHeader, Select, Toggle } from '@/components/admin/ui';
import { useToast } from '@/components/admin/ui/Toast';

type CatDraft = { id?: string; name: string; slug: string; isVisible: boolean; isHighlighted: boolean; badgeColor?: 'PINK' | 'RED' };
type SubDraft = { categoryId: string; id?: string; name: string };
type DeleteTarget = { kind: 'category'; cat: Category } | { kind: 'sub'; cat: Category; sub: Subcategory };

export default function CategoriesPage() {
  const toast = useToast();
  const { data, loading, error, reload } = useApi(async () => {
    const [categories, products] = await Promise.all([api.categories.list(), api.products.list()]);
    return { categories, products };
  });
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [catDraft, setCatDraft] = useState<CatDraft | null>(null);
  const [subDraft, setSubDraft] = useState<SubDraft | null>(null);
  const [toDelete, setToDelete] = useState<DeleteTarget | null>(null);
  const [busy, setBusy] = useState(false);

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error ?? 'Erreur'} onRetry={reload} />;

  const countFor = (catId: string, subId?: string) =>
    data.products.filter((p) => p.categoryId === catId && (!subId || p.subcategoryId === subId)).length;

  const toggleOpen = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const saveCategory = async () => {
    if (!catDraft?.name.trim()) return toast.error('Le nom est obligatoire');
    setBusy(true);
    const ok = await toast.run(() => api.categories.save({ ...catDraft, name: catDraft.name.trim() }), 'Catégorie enregistrée');
    setBusy(false);
    if (ok) {
      setCatDraft(null);
      reload();
    }
  };

  const saveSub = async () => {
    if (!subDraft?.name.trim()) return toast.error('Le nom est obligatoire');
    setBusy(true);
    const ok = await toast.run(
      () => api.categories.saveSubcategory(subDraft.categoryId, { id: subDraft.id, name: subDraft.name.trim() }),
      'Sous-catégorie enregistrée'
    );
    setBusy(false);
    if (ok) {
      setOpen((prev) => new Set(prev).add(subDraft.categoryId));
      setSubDraft(null);
      reload();
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setBusy(true);
    const ok = await toast.run(
      () =>
        toDelete.kind === 'category'
          ? api.categories.remove(toDelete.cat.id)
          : api.categories.removeSubcategory(toDelete.cat.id, toDelete.sub.id),
      'Supprimé'
    );
    setBusy(false);
    setToDelete(null);
    if (ok) reload();
  };

  const move = async (id: string, dir: -1 | 1) => {
    await api.categories.move(id, dir);
    reload();
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Catégories"
        description="L’ordre ici correspond à l’ordre du menu de la boutique. Les catégories mises en avant apparaissent en couleur."
        actions={
          <Button icon={Plus} onClick={() => setCatDraft({ name: '', slug: '', isVisible: true, isHighlighted: false })}>
            Nouvelle catégorie
          </Button>
        }
      />

      <Card padded={false}>
        <ul className="divide-y divide-slate-100">
          {data.categories.map((cat, i) => {
            const expanded = open.has(cat.id);
            return (
              <li key={cat.id}>
                <div className="flex items-center gap-2 px-4 py-3">
                  <button onClick={() => toggleOpen(cat.id)} className="p-1 text-slate-400 hover:text-black" aria-label={expanded ? 'Replier' : 'Déplier'}>
                    {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-black ${cat.badgeColor === 'RED' ? 'text-red-600' : cat.badgeColor === 'PINK' ? 'text-pink-600' : 'text-slate-900'}`}>
                        {cat.name}
                      </span>
                      {!cat.isVisible && <Badge><EyeOff className="w-3 h-3" /> Masquée</Badge>}
                      {cat.isHighlighted && <Badge tone="pink">Mise en avant</Badge>}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      /shop/{cat.slug} · {cat.subcategories.length} sous-catégories · {countFor(cat.id)} produits
                    </div>
                  </div>
                  <div className="flex items-center">
                    <IconButton label="Monter" icon={ArrowUp} disabled={i === 0} onClick={() => move(cat.id, -1)} />
                    <IconButton label="Descendre" icon={ArrowDown} disabled={i === data.categories.length - 1} onClick={() => move(cat.id, 1)} />
                    <IconButton label="Ajouter une sous-catégorie" icon={Plus} onClick={() => setSubDraft({ categoryId: cat.id, name: '' })} />
                    <IconButton
                      label="Modifier"
                      icon={Edit2}
                      onClick={() => setCatDraft({ id: cat.id, name: cat.name, slug: cat.slug, isVisible: cat.isVisible, isHighlighted: cat.isHighlighted, badgeColor: cat.badgeColor })}
                    />
                    <IconButton label="Supprimer" icon={Trash2} tone="danger" onClick={() => setToDelete({ kind: 'category', cat })} />
                  </div>
                </div>
                {expanded && (
                  <ul className="bg-slate-50/70 border-t border-slate-100 py-1">
                    {cat.subcategories.length === 0 && <li className="pl-14 py-2 text-xs text-slate-500">Aucune sous-catégorie.</li>}
                    {cat.subcategories.map((sub) => (
                      <li key={sub.id} className="flex items-center gap-2 pl-14 pr-4 py-1.5">
                        <span className="flex-1 text-xs font-bold text-slate-700">
                          {sub.name} <span className="font-medium text-slate-400">· {countFor(cat.id, sub.id)} produits</span>
                        </span>
                        <IconButton label="Renommer" icon={Edit2} onClick={() => setSubDraft({ categoryId: cat.id, id: sub.id, name: sub.name })} />
                        <IconButton label="Supprimer" icon={Trash2} tone="danger" onClick={() => setToDelete({ kind: 'sub', cat, sub })} />
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </Card>

      <Modal
        open={!!catDraft}
        onClose={() => setCatDraft(null)}
        title={catDraft?.id ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCatDraft(null)}>Annuler</Button>
            <Button loading={busy} onClick={saveCategory}>Enregistrer</Button>
          </>
        }
      >
        {catDraft && (
          <>
            <Field label="Nom *">
              <Input autoFocus value={catDraft.name} onChange={(e) => setCatDraft({ ...catDraft, name: e.target.value })} />
            </Field>
            <Field label="Slug (URL)" hint={`/shop/${catDraft.slug || slugify(catDraft.name) || '...'}`}>
              <Input value={catDraft.slug} placeholder={slugify(catDraft.name)} onChange={(e) => setCatDraft({ ...catDraft, slug: slugify(e.target.value) })} />
            </Field>
            <Toggle checked={catDraft.isVisible} onChange={(v) => setCatDraft({ ...catDraft, isVisible: v })} label="Visible dans le menu" />
            <Toggle checked={catDraft.isHighlighted} onChange={(v) => setCatDraft({ ...catDraft, isHighlighted: v, badgeColor: v ? catDraft.badgeColor ?? 'PINK' : undefined })} label="Mettre en avant" description="Affichée en couleur dans le menu" />
            {catDraft.isHighlighted && (
              <Field label="Couleur">
                <Select value={catDraft.badgeColor} onChange={(e) => setCatDraft({ ...catDraft, badgeColor: e.target.value as 'PINK' | 'RED' })}>
                  <option value="PINK">Rose</option>
                  <option value="RED">Rouge (promotions)</option>
                </Select>
              </Field>
            )}
          </>
        )}
      </Modal>

      <Modal
        open={!!subDraft}
        onClose={() => setSubDraft(null)}
        title={subDraft?.id ? 'Renommer la sous-catégorie' : 'Nouvelle sous-catégorie'}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSubDraft(null)}>Annuler</Button>
            <Button loading={busy} onClick={saveSub}>Enregistrer</Button>
          </>
        }
      >
        {subDraft && (
          <Field label="Nom *" hint={`Dans : ${data.categories.find((c) => c.id === subDraft.categoryId)?.name}`}>
            <Input autoFocus value={subDraft.name} onChange={(e) => setSubDraft({ ...subDraft, name: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && saveSub()} />
          </Field>
        )}
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={busy}
        title="Confirmer la suppression"
        message={
          toDelete?.kind === 'category'
            ? `Supprimer la catégorie « ${toDelete.cat.name} » et ses sous-catégories ? Impossible si des produits l’utilisent.`
            : `Supprimer la sous-catégorie « ${toDelete?.kind === 'sub' ? toDelete.sub.name : ''} » ?`
        }
      />
    </div>
  );
}
