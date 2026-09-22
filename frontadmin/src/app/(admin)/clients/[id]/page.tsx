'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Phone, Mail, MapPin, Ban, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { formatDA, formatDate, formatDateTime, initials } from '@/lib/format';
import { CLIENT_STATUS, ORDER_STATUS } from '@/lib/constants';
import { wilayaName } from '@/lib/wilayas';
import { Button, Card, ConfirmDialog, EmptyState, ErrorState, LoadingState, StatusBadge, Table, Td, Textarea, Th } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const { data, loading, error, reload } = useApi(() => api.clients.get(id), [id]);
  const [note, setNote] = useState<string | null>(null);
  const [confirmBlock, setConfirmBlock] = useState(false);

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error ?? 'Client introuvable'} onRetry={reload} />;

  const { client, orders } = data;
  const blocked = client.status === 'BLOCKED';
  const noteValue = note ?? client.adminNote ?? '';

  const toggleBlock = async () => {
    const ok = await toast.run(
      () => api.clients.update(client.id, { status: blocked ? 'ACTIVE' : 'BLOCKED' }),
      blocked ? 'Client débloqué' : 'Client bloqué'
    );
    setConfirmBlock(false);
    if (ok) reload();
  };

  const saveNote = async () => {
    if (await toast.run(() => api.clients.update(client.id, { adminNote: noteValue }), 'Note enregistrée')) {
      setNote(null);
      reload();
    }
  };

  const delivered = orders.filter((o) => o.status === 'DELIVERED').length;
  const refused = orders.filter((o) => o.status === 'RETURNED' || o.status === 'CANCELLED').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/clients" className="text-xs font-bold text-slate-500 hover:text-black inline-flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Clients
          </Link>
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-bold">{initials(client.name)}</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black">{client.name}</h2>
                <StatusBadge map={CLIENT_STATUS} value={client.status} />
              </div>
              <p className="text-xs text-slate-500">Client depuis le {formatDate(client.createdAt)}</p>
            </div>
          </div>
        </div>
        <Button variant={blocked ? 'secondary' : 'danger'} icon={blocked ? CheckCircle2 : Ban} onClick={() => setConfirmBlock(true)}>
          {blocked ? 'Débloquer' : 'Bloquer le client'}
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          ['Commandes', String(client.ordersCount)],
          ['Total dépensé', formatDA(client.totalSpent)],
          ['Livrées', String(delivered)],
          ['Annulées / retournées', String(refused)],
        ].map(([label, value]) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</div>
            <div className="text-lg font-black mt-1 tabular-nums">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card title="Commandes" className="lg:col-span-2" padded={false}>
          {orders.length === 0 ? (
            <EmptyState title="Aucune commande" />
          ) : (
            <Table>
              <thead>
                <tr><Th>Commande</Th><Th>Date</Th><Th className="text-right">Total</Th><Th>Statut</Th></tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <Td><Link href={`/orders/${o.id}`} className="font-black hover:underline">{o.number}</Link></Td>
                    <Td className="text-slate-600 whitespace-nowrap">{formatDateTime(o.createdAt)}</Td>
                    <Td className="text-right font-bold tabular-nums whitespace-nowrap">{formatDA(o.total)}</Td>
                    <Td><StatusBadge map={ORDER_STATUS} value={o.status} /></Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>

        <div className="space-y-4">
          <Card title="Coordonnées">
            <div className="space-y-2.5 text-xs">
              <a href={`tel:${client.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 hover:underline"><Phone className="w-4 h-4 text-slate-400" />{client.phone}</a>
              <a href={`mailto:${client.email}`} className="flex items-center gap-2 hover:underline break-all"><Mail className="w-4 h-4 text-slate-400" />{client.email}</a>
              <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />{client.address ? `${client.address}, ` : ''}{wilayaName(client.wilayaCode)}</div>
            </div>
          </Card>
          <Card title="Note interne" description="Visible uniquement par l’équipe">
            <Textarea rows={3} value={noteValue} onChange={(e) => setNote(e.target.value)} placeholder="Ex : préfère être appelé le soir" />
            {note !== null && note !== (client.adminNote ?? '') && <Button size="sm" className="mt-2" onClick={saveNote}>Enregistrer</Button>}
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmBlock}
        onClose={() => setConfirmBlock(false)}
        onConfirm={toggleBlock}
        title={blocked ? 'Débloquer ce client ?' : 'Bloquer ce client ?'}
        message={blocked ? 'Le client pourra de nouveau passer commande.' : 'Le client ne pourra plus passer de commande sur la boutique.'}
        confirmLabel={blocked ? 'Débloquer' : 'Bloquer'}
      />
    </div>
  );
}
