'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, LogOut, Menu, ShoppingBag, Star, PackageX, AlertTriangle, ChevronDown } from 'lucide-react';
import type { AdminUser } from '@/types';
import { ADMIN_ROLE } from '@/lib/constants';
import { initials } from '@/lib/format';

interface Alerts {
  pendingOrders: number;
  pendingReviews: number;
  outOfStock: number;
  lowStock: number;
}

function useClickOutside(onOutside: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && onOutside();
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onOutside]);
  return ref;
}

export default function Topbar({
  title,
  user,
  alerts,
  onMenu,
  onLogout,
}: {
  title: string;
  user: AdminUser;
  alerts: Alerts | null;
  onMenu: () => void;
  onLogout: () => void;
}) {
  const [bellOpen, setBellOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const bellRef = useClickOutside(() => setBellOpen(false));
  const profileRef = useClickOutside(() => setProfileOpen(false));

  const notifications = alerts
    ? [
        { count: alerts.pendingOrders, label: 'commande(s) à confirmer', href: '/orders?status=PENDING', icon: ShoppingBag },
        { count: alerts.pendingReviews, label: 'avis en attente de modération', href: '/reviews', icon: Star },
        { count: alerts.outOfStock, label: 'produit(s) en rupture de stock', href: '/products?stock=out', icon: PackageX },
        { count: alerts.lowStock, label: 'produit(s) en stock faible', href: '/products?stock=low', icon: AlertTriangle },
      ].filter((n) => n.count > 0)
    : [];
  const total = notifications.reduce((s, n) => s + n.count, 0);

  return (
    <header className="bg-white/90 backdrop-blur border-b border-slate-200 sticky top-0 z-20 px-4 md:px-6 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onMenu} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100" aria-label="Ouvrir le menu">
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-base font-black text-slate-900 tracking-tight truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setBellOpen((v) => !v)}
            className="p-2 text-slate-600 hover:text-black rounded-xl hover:bg-slate-100 relative"
            aria-label={`Notifications (${total})`}
          >
            <Bell className="w-5 h-5" />
            {total > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-pink-600 text-white text-[9px] font-extrabold flex items-center justify-center">
                {total}
              </span>
            )}
          </button>
          {bellOpen && (
            <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-2xl shadow-xl p-2 animate-fade-in">
              <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">À traiter</div>
              {notifications.length === 0 ? (
                <p className="px-3 py-4 text-xs text-slate-500">Tout est à jour.</p>
              ) : (
                notifications.map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    onClick={() => setBellOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-xs"
                  >
                    <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      <n.icon className="w-4 h-4 text-slate-700" />
                    </span>
                    <span>
                      <b className="font-black">{n.count}</b> <span className="text-slate-600">{n.label}</span>
                    </span>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>

        <div className="relative pl-2 border-l border-slate-200" ref={profileRef}>
          <button onClick={() => setProfileOpen((v) => !v)} className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100">
            <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-[11px]">
              {initials(user.name)}
            </span>
            <span className="hidden sm:block text-left">
              <span className="block text-xs font-bold text-slate-900 leading-tight">{user.name}</span>
              <span className="block text-[10px] text-slate-500">{ADMIN_ROLE[user.role].label}</span>
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 animate-fade-in">
              <div className="px-3 py-2 text-xs">
                <div className="font-bold text-slate-900 truncate">{user.name}</div>
                <div className="text-slate-500 truncate">{user.email}</div>
              </div>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
