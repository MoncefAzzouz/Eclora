'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/admin/api';
import { useApi } from '@/lib/admin/useApi';
import { formatDA, formatDate, initials } from '@/lib/admin/format';
import { CLIENT_STATUS } from '@/lib/admin/constants';
import { wilayaName } from '@/lib/admin/wilayas';
import type { ClientStatus } from '@/types/admin';
import { Card, EmptyState, ErrorState, LoadingState, PageHeader, SearchInput, Select, StatusBadge, Table, Td, Th } from '@/components/admin/ui';

type Sort = 'recent' | 'spent' | 'orders';

export default function ClientsPage() {
  const router = useRouter();
  const { data: clients, loading, error, reload } = useApi(() => api.clients.list());
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'' | ClientStatus>('');
  const [sort, setSort] = useState<Sort>('spent');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/\s/g, '');
    return (clients ?? [])
      .filter(
        (c) =>
          (!status || c.status === status) &&
          (!q || c.name.toLowerCase().replace(/\s/g, '').includes(q) || c.email.toLowerCase().includes(q) || c.phone.replace(/\s/g, '').includes(q))
      )
      .sort((a, b) =>
        sort === 'spent' ? b.totalSpent - a.totalSpent : sort === 'orders' ? b.ordersCount - a.ordersCount : b.createdAt.localeCompare(a.createdAt)
      );
  }, [clients, query, status, sort]);

  if (loading) return <LoadingState />;
  if (error || !clients) return <ErrorState message={error ?? 'Erreur'} onRetry={reload} />;

  return (
    <div className="animate-fade-in">
      <PageHeader title="Clients" description={`${clients.length} clients inscrits. Consultez leur historique d’achat et bloquez les comptes abusifs.`} />

      <Card padded={false}>
        <div className="flex flex-col sm:flex-row gap-2 p-4">
          <SearchInput value={query} onChange={setQuery} placeholder="Nom, email, téléphone..." className="flex-1" />
          <Select value={status} onChange={(e) => setStatus(e.target.value as ClientStatus | '')} className="sm:w-44" aria-label="Statut">
            <option value="">Tous les statuts</option>
            <option value="ACTIVE">Actifs</option>
            <option value="BLOCKED">Bloqués</option>
          </Select>
          <Select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="sm:w-52" aria-label="Trier">
            <option value="spent">Trier : montant dépensé</option>
            <option value="orders">Trier : nb de commandes</option>
            <option value="recent">Trier : inscription récente</option>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="Aucun client" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Client</Th>
                <Th className="hidden md:table-cell">Wilaya</Th>
                <Th className="text-right">Commandes</Th>
                <Th className="text-right">Dépensé</Th>
                <Th className="hidden lg:table-cell">Inscrit le</Th>
                <Th>Statut</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => router.push(`/admin/clients/${c.id}`)}>
                  <Td>
                    <Link href={`/admin/clients/${c.id}`} className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                      <span className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                        {initials(c.name)}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-bold text-slate-900 hover:underline">{c.name}</span>
                        <span className="block text-[11px] text-slate-500">{c.phone}</span>
                      </span>
                    </Link>
                  </Td>
                  <Td className="hidden md:table-cell text-slate-600">{wilayaName(c.wilayaCode)}</Td>
                  <Td className="text-right font-bold tabular-nums">{c.ordersCount}</Td>
                  <Td className="text-right font-black tabular-nums whitespace-nowrap">{formatDA(c.totalSpent)}</Td>
                  <Td className="hidden lg:table-cell text-slate-600">{formatDate(c.createdAt)}</Td>
                  <Td><StatusBadge map={CLIENT_STATUS} value={c.status} /></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
