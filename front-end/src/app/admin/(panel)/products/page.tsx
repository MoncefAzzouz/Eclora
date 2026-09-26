'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { api } from '@/lib/admin/api';
import { emitDataChanged, readQueryParam, useApi } from '@/lib/admin/useApi';
import { formatDA } from '@/lib/admin/format';
import { PRODUCT_STATUS } from '@/lib/admin/constants';
import type { Product, ProductStatus } from '@/types/admin';
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  IconButton,
  LoadingState,
  PageHeader,
  SearchInput,
  Select,
  StatusBadge,
  Table,
  Td,
  Th,
  Thumb,
} from '@/components/admin/ui';
import { useToast } from '@/components/admin/ui/Toast';

type StockFilter = '' | 'low' | 'out';

function StockCell({ p }: { p: Product }) {
  if (p.stock === 0) return <Badge tone="red">Rupture</Badge>;
  if (p.stock <= p.lowStockThreshold) return <Badge tone="amber">{p.stock} · faible</Badge>;
  return <span className="font-bold tabular-nums">{p.stock}</span>;
}

export default function ProductsPage() {
  const toast = useToast();
  const { data, loading, error, reload } = useApi(async () => {
    const [products, categories, brands] = await Promise.all([api.products.list(), api.categories.list(), api.brands.list()]);
    return { products, categories, brands };
  });
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [status, setStatus] = useState<'' | ProductStatus>('');
  const [stock, setStock] = useState<StockFilter>(() => {
    const s = readQueryParam('stock');
    return s === 'low' || s === 'out' ? s : '';
  });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data.products.filter((p) => {
      const brandName = data.brands.find((b) => b.id === p.brandId)?.name.toLowerCase() ?? '';
      return (
        (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || brandName.includes(q)) &&
        (!category || p.categoryId === category) &&
        (!brand || p.brandId === brand) &&
        (!status || p.status === status) &&
        (!stock || (stock === 'out' ? p.stock === 0 : p.stock <= p.lowStockThreshold))
      );
    });
  }, [data, query, category, brand, status, stock]);

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error ?? 'Erreur'} onRetry={reload} />;

  const brandName = (id: string) => data.brands.find((b) => b.id === id)?.name ?? '—';
  const categoryName = (id: string) => data.categories.find((c) => c.id === id)?.name ?? '—';
  const allSelected = filtered.length > 0 && filtered.every((p) => selected.has(p.id));

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const bulk = async (s: ProductStatus) => {
    const ids = [...selected];
    if (await toast.run(() => api.products.bulkStatus(ids, s), `${ids.length} produit(s) : ${PRODUCT_STATUS[s].label}`)) {
      setSelected(new Set());
      emitDataChanged();
      reload();
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    const ok = await toast.run(() => api.products.remove(toDelete.id), 'Produit supprimé');
    setDeleting(false);
    setToDelete(null);
    if (ok) {
      emitDataChanged();
      reload();
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Produits"
        description={`${data.products.length} produits au catalogue. Gérez les prix, le stock, les teintes et la visibilité en boutique.`}
        actions={
          <ButtonLink href="/admin/products/new" icon={Plus}>Nouveau produit</ButtonLink>
        }
      />

      <Card padded={false}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 p-4">
          <SearchInput value={query} onChange={setQuery} placeholder="Nom, SKU, marque..." className="col-span-2 md:col-span-1" />
          <Select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Catégorie">
            <option value="">Toutes catégories</option>
            {data.categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
          <Select value={brand} onChange={(e) => setBrand(e.target.value)} aria-label="Marque">
            <option value="">Toutes marques</option>
            {data.brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </Select>
          <Select value={status} onChange={(e) => setStatus(e.target.value as ProductStatus | '')} aria-label="Statut">
            <option value="">Tous statuts</option>
            {(Object.keys(PRODUCT_STATUS) as ProductStatus[]).map((s) => (
              <option key={s} value={s}>{PRODUCT_STATUS[s].label}</option>
            ))}
          </Select>
          <Select value={stock} onChange={(e) => setStock(e.target.value as StockFilter)} aria-label="Stock">
            <option value="">Tout le stock</option>
            <option value="low">Stock faible</option>
            <option value="out">Rupture</option>
          </Select>
        </div>

        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-bold">
            <span className="mr-2">{selected.size} sélectionné(s)</span>
            <Button size="sm" variant="secondary" onClick={() => bulk('ACTIVE')}>Mettre en ligne</Button>
            <Button size="sm" variant="secondary" onClick={() => bulk('DRAFT')}>Brouillon</Button>
            <Button size="sm" variant="secondary" onClick={() => bulk('ARCHIVED')}>Archiver</Button>
            <button className="ml-auto text-slate-300 hover:text-white" onClick={() => setSelected(new Set())}>Désélectionner</button>
          </div>
        )}

        {filtered.length === 0 ? (
          <EmptyState title="Aucun produit" description="Modifiez les filtres ou ajoutez un nouveau produit." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th className="w-10">
                  <input
                    type="checkbox"
                    className="accent-black w-4 h-4"
                    checked={allSelected}
                    onChange={() => setSelected(allSelected ? new Set() : new Set(filtered.map((p) => p.id)))}
                    aria-label="Tout sélectionner"
                  />
                </Th>
                <Th>Produit</Th>
                <Th className="hidden md:table-cell">Catégorie</Th>
                <Th className="text-right">Prix</Th>
                <Th>Stock</Th>
                <Th className="hidden sm:table-cell">Statut</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <Td>
                    <input type="checkbox" className="accent-black w-4 h-4" checked={selected.has(p.id)} onChange={() => toggle(p.id)} aria-label={`Sélectionner ${p.name}`} />
                  </Td>
                  <Td>
                    <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 group min-w-[220px]">
                      <Thumb src={p.images[0]} alt={p.name} />
                      <span className="min-w-0">
                        <span className="block text-[10px] font-black uppercase text-slate-500">{brandName(p.brandId)}</span>
                        <span className="block font-bold text-slate-900 group-hover:underline line-clamp-1">{p.name}</span>
                        <span className="block text-[10px] text-slate-400">{p.sku}{p.shades.length > 0 && ` · ${p.shades.length} teintes`}</span>
                      </span>
                    </Link>
                  </Td>
                  <Td className="hidden md:table-cell text-slate-600">{categoryName(p.categoryId)}</Td>
                  <Td className="text-right whitespace-nowrap tabular-nums">
                    <div className="font-black">{formatDA(p.price)}</div>
                    {p.compareAtPrice && <div className="text-[10px] text-slate-400 line-through">{formatDA(p.compareAtPrice)}</div>}
                  </Td>
                  <Td><StockCell p={p} /></Td>
                  <Td className="hidden sm:table-cell"><StatusBadge map={PRODUCT_STATUS} value={p.status} /></Td>
                  <Td className="text-right whitespace-nowrap">
                    <Link href={`/admin/products/${p.id}`} aria-label="Modifier" title="Modifier" className="inline-flex p-2 rounded-lg text-slate-500 hover:text-black hover:bg-slate-100">
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    <IconButton label="Supprimer" icon={Trash2} tone="danger" onClick={() => setToDelete(p)} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Supprimer ce produit ?"
        message={`« ${toDelete?.name} » sera retiré du catalogue et des sections de la page d’accueil. Pour le masquer temporairement, archivez-le plutôt.`}
      />
    </div>
  );
}
