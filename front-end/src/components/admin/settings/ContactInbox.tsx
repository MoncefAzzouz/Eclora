'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Mail, MailOpen, MessageSquare, Phone, RefreshCw, Trash2 } from 'lucide-react';
import { api } from '@/lib/admin/api';
import { useApi } from '@/lib/admin/useApi';
import type { ContactMessage } from '@/types/admin';
import { Badge, Button, Card, ConfirmDialog, ErrorState, LoadingState, Tabs } from '@/components/admin/ui';
import { useToast } from '@/components/admin/ui/Toast';

export default function ContactInbox() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const { data, loading, error, reload } = useApi(() => api.settings.messages(page, filter), [page, filter]);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [removing, setRemoving] = useState<ContactMessage | null>(null);
  const [busy, setBusy] = useState(false);
  const detail = useRef<HTMLElement>(null);
  const toast = useToast();
  const selectedId = selected?.id;
  useEffect(() => { if (selectedId && window.innerWidth < 1024) detail.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, [selectedId]);
  const mark = async (message: ContactMessage, isRead: boolean) => {
    setBusy(true);
    try {
      setSelected(await api.settings.markMessage(message.id, isRead));
      if (filter === 'unread' && isRead && data?.items.length === 1 && page > 1) setPage((p) => p - 1);
      else reload();
    }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Modification impossible'); }
    finally { setBusy(false); }
  };
  const open = (message: ContactMessage) => { setSelected(message); if (!message.isRead) void mark(message, true); };
  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error ?? 'Erreur'} onRetry={reload} />;
  return <div className="max-w-6xl space-y-4">
    <Card title="Messages de contact" description="Demandes envoyées depuis le formulaire de la boutique." actions={<Button size="sm" variant="secondary" icon={RefreshCw} onClick={reload}>Actualiser</Button>}>
      <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-slate-600">{data.total} message{data.total !== 1 ? 's' : ''} · {data.unread} non lu{data.unread !== 1 ? 's' : ''}</p><Badge tone={data.unread ? 'amber' : 'neutral'}>{data.unread ? 'À lire' : 'À jour'}</Badge></div>
    </Card>
    <Tabs tabs={[{ id: 'all', label: 'Tous les messages' }, { id: 'unread', label: 'Non lus', count: data.unread }]} value={filter} onChange={(value) => { setFilter(value); setPage(1); }} />
    <div className="grid items-start gap-4 lg:grid-cols-[1fr_1.35fr]">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white" aria-label="Liste des messages">
        {!data.items.length ? <div className="px-6 py-14 text-center"><MessageSquare className="mx-auto h-9 w-9 text-slate-300" /><p className="mt-4 text-sm font-bold">{filter === 'unread' ? 'Aucun message non lu' : 'Aucun message reçu pour le moment'}</p></div> : <ul className="divide-y divide-slate-100">{data.items.map((message) => <li key={message.id}><button type="button" onClick={() => open(message)} disabled={busy} className={`w-full p-4 text-left transition hover:bg-slate-50 ${selected?.id === message.id ? 'bg-orange-50' : ''}`}>
          <div className="flex items-center gap-2"><span className={`h-2 w-2 shrink-0 rounded-full ${message.isRead ? 'bg-slate-200' : 'bg-[#f05b2a]'}`} /><span className="min-w-0 flex-1 truncate text-xs font-bold">{message.name}</span><time className="text-[10px] text-slate-500">{new Date(message.createdAt).toLocaleDateString('fr-DZ')}</time></div>
          <p className="mt-1 truncate text-[11px] text-slate-500">{message.email}</p><p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">{message.message}</p>
        </button></li>)}</ul>}
        <div className="flex items-center justify-between border-t border-slate-100 p-3 text-xs text-slate-500"><Button size="sm" variant="secondary" icon={ChevronLeft} disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Précédent</Button><span>{page} / {data.pages}</span><Button size="sm" variant="secondary" icon={ChevronRight} disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>Suivant</Button></div>
      </section>
      <section ref={detail} className="min-w-0 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6" aria-label="Détail du message">
        {selected ? <>
          <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="break-words text-lg font-black">{selected.name}</h3><p className="mt-1 text-[11px] text-slate-500">{new Date(selected.createdAt).toLocaleString('fr-DZ')}</p></div><Badge tone={selected.isRead ? 'emerald' : 'amber'}>{selected.isRead ? 'Lu' : 'Non lu'}</Badge></div>
          <div className="mt-5 space-y-3 border-y border-slate-100 py-4 text-xs"><a href={`mailto:${selected.email}`} className="flex items-center gap-2 break-all font-semibold"><Mail className="h-4 w-4 shrink-0" />{selected.email}</a><a href={`tel:${selected.phone.replace(/[^+\d]/g, '')}`} className="flex items-center gap-2 font-semibold"><Phone className="h-4 w-4 shrink-0" />{selected.phone}</a></div>
          <p className="mt-5 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">{selected.message}</p>
          <div className="mt-7 flex flex-wrap gap-2"><a href={`mailto:${selected.email}?subject=${encodeURIComponent('Votre message à Eclora')}`} className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-xs font-bold text-white"><MailOpen className="h-4 w-4" />Répondre par email</a><Button size="sm" variant="secondary" icon={Check} loading={busy} onClick={() => void mark(selected, !selected.isRead)}>{selected.isRead ? 'Marquer non lu' : 'Marquer lu'}</Button><Button size="sm" variant="ghost" icon={Trash2} disabled={busy} onClick={() => setRemoving(selected)}>Supprimer</Button></div>
        </> : <div className="py-16 text-center"><MailOpen className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-4 text-sm font-bold">Sélectionnez un message</p><p className="mt-2 text-xs text-slate-500">Retrouvez ici le message et les coordonnées du client.</p></div>}
      </section>
    </div>
    <ConfirmDialog open={!!removing} onClose={() => setRemoving(null)} title="Supprimer ce message ?" message="Le message sera définitivement supprimé." onConfirm={async () => {
      if (!removing) return;
      if (await toast.run(() => api.settings.removeMessage(removing.id), 'Message supprimé')) {
        if (selected?.id === removing.id) setSelected(null);
        setRemoving(null);
        if (data.items.length === 1 && page > 1) setPage((p) => p - 1); else reload();
      }
    }} />
  </div>;
}
