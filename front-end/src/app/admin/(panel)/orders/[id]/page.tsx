'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Phone, Mail, MapPin, Printer, User, Truck, CreditCard, Check } from 'lucide-react';
import { api } from '@/lib/admin/api';
import { emitDataChanged, useApi } from '@/lib/admin/useApi';
import { useAuth } from '@/lib/admin/auth';
import { formatDA, formatDateTime } from '@/lib/admin/format';
import { DELIVERY_TYPE, ORDER_STATUS, ORDER_TRANSITIONS, PAYMENT_METHOD, PAYMENT_STATUS } from '@/lib/admin/constants';
import { wilayaName } from '@/lib/admin/wilayas';
import type { OrderStatus, PaymentStatus } from '@/types/admin';
import { Button, Card, ErrorState, Field, Input, LoadingState, Modal, Select, StatusBadge, Textarea, Thumb } from '@/components/admin/ui';
import { useToast } from '@/components/admin/ui/Toast';

const ACTION_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Remettre en attente',
  CONFIRMED: 'Confirmer la commande',
  SHIPPED: 'Marquer expédiée',
  DELIVERED: 'Marquer livrée',
  RETURNED: 'Marquer retournée',
  CANCELLED: 'Annuler la commande',
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const toast = useToast();
  const { data: order, loading, error, reload } = useApi(() => api.orders.get(id), [id]);
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const [statusNote, setStatusNote] = useState('');
  const [tracking, setTracking] = useState('');
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  if (loading) return <LoadingState />;
  if (error || !order) return <ErrorState message={error ?? 'Commande introuvable'} onRetry={reload} />;

  const adminNote = note ?? order.adminNote ?? '';

  const applyStatus = async () => {
    if (!pendingStatus) return;
    setSaving(true);
    const ok = await toast.run(async () => {
      if (pendingStatus === 'SHIPPED' && tracking.trim()) await api.orders.update(order.id, { trackingNumber: tracking.trim() });
      await api.orders.updateStatus(order.id, pendingStatus, statusNote, user?.name);
    }, `Commande ${ORDER_STATUS[pendingStatus].label.toLowerCase()}`);
    setSaving(false);
    if (ok) {
      setPendingStatus(null);
      setStatusNote('');
      emitDataChanged();
      reload();
    }
  };

  const saveNote = async () => {
    const ok = await toast.run(() => api.orders.update(order.id, { adminNote }), 'Note enregistrée');
    if (ok) {
      setNote(null);
      reload();
    }
  };

  const setPayment = async (paymentStatus: PaymentStatus) => {
    if (await toast.run(() => api.orders.update(order.id, { paymentStatus }), 'Paiement mis à jour')) reload();
  };

  const next = ORDER_TRANSITIONS[order.status];

  return (
    <div className="space-y-6 animate-fade-in print:space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/admin/orders" className="text-xs font-bold text-slate-500 hover:text-black inline-flex items-center gap-1 mb-2 print:hidden">
            <ArrowLeft className="w-3.5 h-3.5" /> Commandes
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-black">{order.number}</h2>
            <StatusBadge map={ORDER_STATUS} value={order.status} />
            <StatusBadge map={PAYMENT_STATUS} value={order.paymentStatus} />
          </div>
          <p className="text-xs text-slate-500 mt-1">Passée le {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <Button variant="secondary" icon={Printer} onClick={() => window.print()}>
            Imprimer
          </Button>
          {next.map((s) => (
            <Button
              key={s}
              variant={s === 'CANCELLED' || s === 'RETURNED' ? 'secondary' : 'primary'}
              className={s === 'CANCELLED' || s === 'RETURNED' ? '!text-red-600 hover:!bg-red-50' : ''}
              onClick={() => {
                setTracking(order.trackingNumber ?? '');
                setPendingStatus(s);
              }}
            >
              {ACTION_LABEL[s]}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card title={`Articles (${order.items.reduce((s, i) => s + i.quantity, 0)})`} padded={false}>
            <ul className="divide-y divide-slate-100">
              {order.items.map((it, idx) => (
                <li key={idx} className="flex items-center gap-3 px-5 py-3 text-xs">
                  <Thumb src={it.image} alt={it.name} size={48} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-black uppercase text-slate-500">{it.brand}</div>
                    <Link href={`/admin/products/${it.productId}`} className="font-bold text-slate-900 hover:underline line-clamp-1">
                      {it.name}
                    </Link>
                    {it.shade && <div className="text-[11px] text-slate-500">Teinte : {it.shade}</div>}
                  </div>
                  <div className="text-right tabular-nums">
                    <div className="text-slate-500">
                      {it.quantity} × {formatDA(it.unitPrice)}
                    </div>
                    <div className="font-black">{formatDA(it.quantity * it.unitPrice)}</div>
                  </div>
                </li>
              ))}
            </ul>
            <dl className="px-5 py-4 border-t border-slate-100 space-y-1.5 text-xs tabular-nums">
              <div className="flex justify-between">
                <dt className="text-slate-500">Sous-total</dt>
                <dd className="font-bold">{formatDA(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Livraison ({DELIVERY_TYPE[order.deliveryType]})</dt>
                <dd className="font-bold">{order.shippingFee ? formatDA(order.shippingFee) : 'Gratuite'}</dd>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-pink-700">
                  <dt>Remise {order.promoCode && `(${order.promoCode})`}</dt>
                  <dd className="font-bold">− {formatDA(order.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-slate-100 text-sm">
                <dt className="font-black">Total</dt>
                <dd className="font-black">{formatDA(order.total)}</dd>
              </div>
            </dl>
          </Card>

          <Card title="Historique">
            <ol className="relative border-l border-slate-200 ml-2 space-y-4">
              {[...order.history].reverse().map((h, i) => (
                <li key={i} className="ml-5">
                  <span className={`absolute -left-[7px] w-3.5 h-3.5 rounded-full border-2 border-white ${i === 0 ? 'bg-black' : 'bg-slate-300'}`} />
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge map={ORDER_STATUS} value={h.status} />
                    <span className="text-[11px] text-slate-500">
                      {formatDateTime(h.at)}
                      {h.by && ` · ${h.by}`}
                    </span>
                  </div>
                  {h.note && <p className="text-xs text-slate-700 mt-1">{h.note}</p>}
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Client">
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2 font-bold">
                <User className="w-4 h-4 text-slate-400" />
                {order.clientId ? (
                  <Link href={`/admin/clients/${order.clientId}`} className="hover:underline">
                    {order.customerName}
                  </Link>
                ) : (
                  order.customerName
                )}
              </div>
              <a href={`tel:${order.customerPhone.replace(/\s/g, '')}`} className="flex items-center gap-2 hover:underline">
                <Phone className="w-4 h-4 text-slate-400" />
                {order.customerPhone}
              </a>
              {order.customerEmail && (
                <a href={`mailto:${order.customerEmail}`} className="flex items-center gap-2 hover:underline break-all">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {order.customerEmail}
                </a>
              )}
            </div>
          </Card>

          <Card title="Livraison">
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>
                  {order.address}
                  <br />
                  {order.commune}, {wilayaName(order.wilayaCode)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-slate-400" />
                {DELIVERY_TYPE[order.deliveryType]}
                {order.trackingNumber && <span className="font-bold">· Suivi {order.trackingNumber}</span>}
              </div>
            </div>
          </Card>

          <Card title="Paiement">
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-slate-400" />
                {PAYMENT_METHOD[order.paymentMethod]}
              </div>
              <Select
                value={order.paymentStatus}
                onChange={(e) => setPayment(e.target.value as PaymentStatus)}
                aria-label="Statut du paiement"
                className="print:hidden"
              >
                {(Object.keys(PAYMENT_STATUS) as PaymentStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {PAYMENT_STATUS[s].label}
                  </option>
                ))}
              </Select>
            </div>
          </Card>

          <Card title="Note interne" description="Visible uniquement par l’équipe" className="print:hidden">
            <Textarea value={adminNote} onChange={(e) => setNote(e.target.value)} placeholder="Ex : client injoignable, rappeler demain à 10h" rows={3} />
            {note !== null && note !== (order.adminNote ?? '') && (
              <Button size="sm" icon={Check} className="mt-2" onClick={saveNote}>
                Enregistrer
              </Button>
            )}
          </Card>
        </div>
      </div>

      <Modal
        open={!!pendingStatus}
        onClose={() => setPendingStatus(null)}
        title={pendingStatus ? ACTION_LABEL[pendingStatus] : ''}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPendingStatus(null)}>
              Retour
            </Button>
            <Button variant={pendingStatus === 'CANCELLED' ? 'danger' : 'primary'} loading={saving} onClick={applyStatus}>
              Valider
            </Button>
          </>
        }
      >
        {pendingStatus === 'CONFIRMED' && (
          <p className="text-xs text-slate-600">Le stock des articles sera réservé. Confirmez après avoir joint le client par téléphone.</p>
        )}
        {pendingStatus === 'CANCELLED' && order.status === 'CONFIRMED' && (
          <p className="text-xs text-slate-600">Le stock réservé sera remis en vente.</p>
        )}
        {pendingStatus === 'RETURNED' && <p className="text-xs text-slate-600">Les articles seront remis en stock.</p>}
        {pendingStatus === 'SHIPPED' && (
          <Field label="Numéro de suivi (optionnel)" hint="Yalidine, ZR Express, EMS...">
            <Input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="YAL-123456" />
          </Field>
        )}
        <Field label="Commentaire (optionnel)">
          <Textarea value={statusNote} onChange={(e) => setStatusNote(e.target.value)} rows={2} placeholder="Ajouté à l’historique de la commande" />
        </Field>
      </Modal>
    </div>
  );
}
