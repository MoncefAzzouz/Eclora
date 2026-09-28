'use client';

import React from 'react';
import { ShoppingBag, Users, DollarSign, Image as ImageIcon, ArrowUpRight, TrendingUp, Sparkles } from 'lucide-react';
import { AdminTab } from '@/components/AdminSidebar';
import { INITIAL_ORDERS, INITIAL_CLIENTS, INITIAL_BANNERS } from '@/data/adminMockData';

interface DashboardOverviewProps {
  onNavigateTab: (tab: AdminTab) => void;
}

export default function DashboardOverview({ onNavigateTab }: DashboardOverviewProps) {
  const STATS = [
    {
      title: 'Chiffre d\'Affaires Total',
      value: '343 600 DA',
      change: '+14.2%',
      isPositive: true,
      icon: DollarSign,
      color: 'bg-emerald-500',
    },
    {
      title: 'Commandes Totales',
      value: `${INITIAL_ORDERS.length}`,
      change: '+8.4%',
      isPositive: true,
      icon: ShoppingBag,
      color: 'bg-blue-500',
    },
    {
      title: 'Clients Enregistrés',
      value: `${INITIAL_CLIENTS.length}`,
      change: '+12.5%',
      isPositive: true,
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      title: 'Bannières Actives',
      value: `${INITIAL_BANNERS.filter((b) => b.isActive).length}`,
      change: '100%',
      isPositive: true,
      icon: ImageIcon,
      color: 'bg-pink-500',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-black text-white p-8 rounded-3xl relative overflow-hidden shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold text-pink-400 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Panneau de Contrôle Eclora</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Bienvenue sur l&apos;Admin Eclora
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 mt-2 leading-relaxed">
            Gérez vos catégories, personnalisez vos bannières hero & promos, modifiez les carrousels de la page d&apos;accueil, et suivez le statut de livraison de vos clients en temps réel.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 relative z-10">
          <button
            onClick={() => onNavigateTab('orders')}
            className="bg-white text-black px-5 py-3 rounded-2xl font-bold text-xs hover:bg-neutral-200 transition-colors shadow-sm"
          >
            Voir les Commandes
          </button>
          <button
            onClick={() => onNavigateTab('banners')}
            className="bg-neutral-900 border border-neutral-800 text-white px-5 py-3 rounded-2xl font-bold text-xs hover:bg-neutral-800 transition-colors"
          >
            Gérer les Bannières
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {stat.title}
                </span>
                <div className={`p-2.5 rounded-xl text-white shadow-xs ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                <div className="flex items-center text-xs font-extrabold text-emerald-600">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                  <span>{stat.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders Overview Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-black text-slate-900">Dernières Commandes Clients</h3>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs font-bold text-black hover:underline flex items-center gap-1"
          >
            <span>Voir toutes les commandes</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {INITIAL_ORDERS.slice(0, 3).map((ord) => (
            <div key={ord.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md">
                  {ord.orderNumber}
                </span>
                <div>
                  <div className="font-bold text-slate-900">{ord.clientName}</div>
                  <div className="text-[10px] text-slate-500">
                    {ord.clientPhone} • {ord.city}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    ord.status === 'Livré'
                      ? 'bg-emerald-100 text-emerald-800'
                      : ord.status === 'Expédié'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {ord.status}
                </span>
                <span className="font-black text-slate-900 text-sm">{ord.totalPrice}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
