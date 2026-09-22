'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Banknote, ShoppingBag, Users, Receipt, AlertTriangle, Star, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { useAuth } from '@/lib/auth';
import { formatDA, timeAgo } from '@/lib/format';
import { ORDER_STATUS } from '@/lib/constants';
import { wilayaName } from '@/lib/wilayas';
import type { OrderStatus } from '@/types';
import { Card, ErrorState, LoadingState, StatusBadge, Thumb } from '@/components/ui';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useApi(() => api.dashboard.summary());

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error ?? 'Erreur'} onRetry={reload} />;

  const kpis = [
    { label: 'Chiffre d’affaires (14 j)', value: formatDA(data.revenue14d), icon: Banknote },
    { label: 'Commandes (14 j)', value: String(data.orders14d), sub: `${data.todayOrders} aujourd’hui`, icon: ShoppingBag },
    { label: 'Panier moyen', value: formatDA(data.averageOrder), icon: Receipt },
    { label: 'Clients', value: String(data.clientsCount), icon: Users },
  ];

  const todo = [
    { count: data.pendingOrders, label: 'Commandes à confirmer par téléphone', href: '/orders?status=PENDING', icon: Clock },
    { count: data.pendingReviews, label: 'Avis à modérer', href: '/reviews', icon: Star },
    { count: data.lowStock.length, label: 'Produits en stock faible ou rupture', href: '/products?stock=low', icon: AlertTriangle },
  ];

  const totalOrders = Object.values(data.statusCounts).reduce((s, n) => s + (n ?? 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-black text-slate-900">Bonjour {user?.name.split(' ')[0]} 👋</h2>
        <p className="text-xs text-slate-500 mt-1">Voici l’activité de votre boutique sur les 14 derniers jours.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider">{k.label}</span>
              <k.icon className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-lg md:text-2xl font-black text-slate-900 mt-2 tabular-nums">{k.value}</div>
            {k.sub && <div className="text-[11px] text-slate-500 font-semibold mt-0.5">{k.sub}</div>}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 items-start">
        <Card title="Chiffre d’affaires par jour" description="Hors commandes annulées et retournées" className="lg:col-span-2">
          <RevenueChart days={data.revenueByDay} />
        </Card>

        <Card title="À traiter">
          <div className="space-y-2">
            {todo.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                  t.count > 0 ? 'border-slate-200 hover:border-black' : 'border-slate-100 opacity-60'
                }`}
              >
                <span className={`w-9 h-9 rounded-lg flex items-center justify-center ${t.count > 0 ? 'bg-black text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <t.icon className="w-4 h-4" />
                </span>
                <span className="flex-1 text-xs font-bold text-slate-700">{t.label}</span>
                <span className="text-lg font-black tabular-nums">{t.count}</span>
              </Link>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-3">Répartition des commandes</div>
            <ul className="space-y-2">
              {(Object.keys(ORDER_STATUS) as OrderStatus[]).map((s) => {
                const n = data.statusCounts[s] ?? 0;
                return (
                  <li key={s} className="flex items-center gap-2 text-xs">
                    <span className="w-24"><StatusBadge map={ORDER_STATUS} value={s} /></span>
                    <span className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <span className="block h-full bg-slate-800 rounded-full" style={{ width: `${totalOrders ? (n / totalOrders) * 100 : 0}%` }} />
                    </span>
                    <span className="w-6 text-right font-bold tabular-nums">{n}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card
          title="Dernières commandes"
          className="lg:col-span-2"
          padded={false}
          actions={
            <Link href="/orders" className="text-xs font-bold hover:underline flex items-center gap-1">
              Tout voir <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          }
        >
          <ul className="divide-y divide-slate-100">
            {data.recentOrders.map((o) => (
              <li key={o.id}>
                <Link href={`/orders/${o.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50 text-xs">
                  <div className="min-w-0">
                    <div className="font-black text-slate-900">
                      {o.number} <span className="font-semibold text-slate-500">· {o.customerName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {wilayaName(o.wilayaCode)} · {timeAgo(o.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <StatusBadge map={ORDER_STATUS} value={o.status} />
                    <span className="font-black tabular-nums hidden sm:inline">{formatDA(o.total)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Meilleures ventes" description="Quantités vendues, toutes périodes">
          <ul className="space-y-3">
            {data.topProducts.map(({ product, quantity }, i) => (
              <li key={product.id}>
                <Link href={`/products/${product.id}`} className="flex items-center gap-3 group">
                  <span className="w-4 text-xs font-black text-slate-400">{i + 1}</span>
                  <Thumb src={product.images[0]} alt={product.name} size={36} />
                  <span className="flex-1 min-w-0 text-xs font-bold text-slate-800 truncate group-hover:underline">{product.name}</span>
                  <span className="text-xs font-black tabular-nums">{quantity}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function RevenueChart({ days }: { days: { date: string; revenue: number; orders: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...days.map((d) => d.revenue), 1);
  const ticks = [max, max / 2, 0];
  const label = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  const compact = (n: number) => (n >= 1000 ? `${Math.round(n / 1000)}k` : String(Math.round(n)));

  return (
    <div>
      <div className="flex gap-2">
        <div className="flex flex-col justify-between h-48 text-[10px] text-slate-400 font-semibold text-right w-8 tabular-nums">
          {ticks.map((t) => (
            <span key={t}>{compact(t)}</span>
          ))}
        </div>
        <div className="relative flex-1 h-48" onMouseLeave={() => setHover(null)}>
          {ticks.map((t, i) => (
            <div key={t} className="absolute left-0 right-0 border-t border-slate-100" style={{ top: `${(i / 2) * 100}%` }} />
          ))}
          <div className="absolute inset-0 flex items-end gap-[2px]">
            {days.map((d, i) => (
              <button
                key={d.date}
                type="button"
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                aria-label={`${label(d.date)} : ${formatDA(d.revenue)}, ${d.orders} commande(s)`}
                className="flex-1 h-full flex items-end outline-none"
              >
                <span
                  className={`w-full rounded-t-[4px] transition-colors ${hover === i ? 'bg-pink-600' : 'bg-slate-900'}`}
                  style={{ height: `${Math.max((d.revenue / max) * 100, d.revenue ? 2 : 0)}%` }}
                />
              </button>
            ))}
          </div>
          {hover !== null && (
            <div
              className="absolute top-0 pointer-events-none bg-black text-white rounded-lg px-2.5 py-1.5 text-[11px] shadow-lg whitespace-nowrap z-10"
              style={{ left: `${((hover + 0.5) / days.length) * 100}%`, transform: 'translate(-50%, -100%)' }}
            >
              <div className="font-bold">{label(days[hover]!.date)}</div>
              <div className="tabular-nums">{formatDA(days[hover]!.revenue)} · {days[hover]!.orders} cmd</div>
            </div>
          )}
        </div>
      </div>
      {/* Axis labels: first/middle/last on phones; every 3rd day counted back from today from sm up. */}
      <div className="relative h-4 ml-10 mt-2 text-[10px] text-slate-400 font-semibold">
        {days.map((d, i) => {
          const last = days.length - 1;
          const onMobile = i === 0 || i === last || i === Math.floor(days.length / 2);
          const onDesktop = (last - i) % 3 === 0;
          if (!onMobile && !onDesktop) return null;
          const visibility = onMobile && onDesktop ? '' : onMobile ? 'sm:hidden' : 'hidden sm:block';
          return (
            <span
              key={d.date}
              className={`absolute -translate-x-1/2 whitespace-nowrap ${visibility} ${i === 0 ? '!translate-x-0' : ''} ${i === last ? '!-translate-x-full' : ''}`}
              style={{ left: `${((i + 0.5) / days.length) * 100}%` }}
            >
              {label(d.date)}
            </span>
          );
        })}
      </div>
    </div>
  );
}
