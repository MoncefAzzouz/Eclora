'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Download, Phone } from 'lucide-react';
import { api } from '@/lib/admin/api';
import { readQueryParam, useApi } from '@/lib/admin/useApi';
import { formatDA, formatDateTime } from '@/lib/admin/format';
import { DELIVERY_TYPE, ORDER_STATUS, PAYMENT_METHOD } from '@/lib/admin/constants';
import { WILAYAS, wilayaName } from '@/lib/admin/wilayas';
import type { Order, OrderStatus } from '@/types/admin';
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  SearchInput,
  Select,
  StatusBadge,
  Table,
  Tabs,
  Td,
  Th,
} from '@/components/admin/ui';

type Filter = 'ALL' | OrderStatus;

function exportCsv(orders: Order[]) {
  const header = ['Numéro', 'Date', 'Client', 'Téléphone', 'Wilaya', 'Commune', 'Adresse', 'Livraison', 'Paiement', 'Articles', 'Total (DA)', 'Statut'];
  const rows = orders.map((o) => [
    o.number,
    formatDateTime(o.createdAt),
    o.customerName,
    o.customerPhone,
    wilayaName(o.wilayaCode),
    o.commune,
    o.address,
    DELIVERY_TYPE[o.deliveryType],
    PAYMENT_METHOD[o.paymentMethod],
    o.items.map((i) => `${i.quantity}x ${i.name}`).join(' | '),
    o.total,
    ORDER_STATUS[o.status].label,
  ]);
  const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `commandes-eclora-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function OrdersPage() {
  const router = useRouter();
  const { data: orders, loading, error, reload } = useApi(() => api.orders.list());
  // Initial render is a loading state on server and client alike, so reading the URL here is hydration-safe.
  const [status, setStatus] = useState<Filter>(() => {
    const s = readQueryParam('status');
    return s && s in ORDER_STATUS ? (s as OrderStatus) : 'ALL';
  });
  const [query, setQuery] = useState('');
  const [wilaya, setWilaya] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/\s/g, '');
    return (orders ?? []).filter(
      (o) =>
        (status === 'ALL' || o.status === status) &&
        (!wilaya || o.wilayaCode === Number(wilaya)) &&
        (!q ||
          o.number.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().replace(/\s/g, '').includes(q) ||
          o.customerPhone.replace(/\s/g, '').includes(q))
    );
  }, [orders, status, query, wilaya]);

  if (loading) return <LoadingState />;
  if (error || !orders) return <ErrorState message={error ?? 'Erreur'} onRetry={reload} />;

  const count = (s: OrderStatus) => orders.filter((o) => o.status === s).length;
  const tabs: { id: Filter; label: string; count?: number }[] = [
    { id: 'ALL', label: 'Toutes', count: orders.length },
    ...(Object.keys(ORDER_STATUS) as OrderStatus[]).map((s) => ({ id: s, label: ORDER_STATUS[s].label, count: count(s) })),
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Commandes"
        description="Confirmez les nouvelles commandes par téléphone, suivez l’expédition et la livraison."
        actions={
          <Button variant="secondary" icon={Download} onClick={() => exportCsv(filtered)} disabled={!filtered.length}>
            Exporter CSV
          </Button>
        }
      />

      <Card padded={false}>
        <div className="px-4 pt-2">
          <Tabs tabs={tabs} value={status} onChange={setStatus} />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 px-4 pb-4">
          <SearchInput value={query} onChange={setQuery} placeholder="N° de commande, nom, téléphone..." className="flex-1" />
          <Select value={wilaya} onChange={(e) => setWilaya(e.target.value)} className="sm:w-56">
            <option value="">Toutes les wilayas</option>
            {WILAYAS.map((w) => (
              <option key={w.code} value={w.code}>
                {wilayaName(w.code)}
              </option>
            ))}
          </Select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="Aucune commande" description="Aucune commande ne correspond à ces filtres." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Commande</Th>
                <Th>Client</Th>
                <Th className="hidden md:table-cell">Wilaya</Th>
                <Th className="hidden lg:table-cell">Livraison</Th>
                <Th className="text-right">Total</Th>
                <Th>Statut</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} onClick={() => router.push(`/admin/orders/${o.id}`)} className="hover:bg-slate-50 cursor-pointer">
                  <Td>
                    <Link href={`/admin/orders/${o.id}`} className="font-black text-slate-900 hover:underline" onClick={(e) => e.stopPropagation()}>
                      {o.number}
                    </Link>
                    <div className="text-[11px] text-slate-500">{formatDateTime(o.createdAt)}</div>
                  </Td>
                  <Td>
                    <div className="font-bold text-slate-900">{o.customerName}</div>
                    <a
                      href={`tel:${o.customerPhone.replace(/\s/g, '')}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[11px] text-slate-500 hover:text-black inline-flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" /> {o.customerPhone}
                    </a>
                  </Td>
                  <Td className="hidden md:table-cell text-slate-700">{wilayaName(o.wilayaCode)}</Td>
                  <Td className="hidden lg:table-cell text-slate-600">{DELIVERY_TYPE[o.deliveryType]}</Td>
                  <Td className="text-right font-black tabular-nums whitespace-nowrap">{formatDA(o.total)}</Td>
                  <Td>
                    <StatusBadge map={ORDER_STATUS} value={o.status} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
