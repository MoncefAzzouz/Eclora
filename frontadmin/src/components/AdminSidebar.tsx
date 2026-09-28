'use client';

import React from 'react';
import {
  LayoutDashboard,
  FolderTree,
  Image as ImageIcon,
  SlidersHorizontal,
  ShoppingBag,
  Users,
  Package,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export type AdminTab =
  | 'dashboard'
  | 'categories'
  | 'banners'
  | 'mainpage'
  | 'orders'
  | 'clients'
  | 'products';

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  ordersCount: number;
}

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  ordersCount,
}: AdminSidebarProps) {
  const NAV_ITEMS = [
    {
      id: 'dashboard' as AdminTab,
      label: 'Tableau de bord',
      icon: LayoutDashboard,
    },
    {
      id: 'categories' as AdminTab,
      label: 'Catégories & Sous-catégories',
      icon: FolderTree,
    },
    {
      id: 'banners' as AdminTab,
      label: 'Bannières & Promos',
      icon: ImageIcon,
    },
    {
      id: 'mainpage' as AdminTab,
      label: 'Contrôle Page d\'accueil',
      icon: SlidersHorizontal,
    },
    {
      id: 'orders' as AdminTab,
      label: 'Commandes',
      icon: ShoppingBag,
      badge: ordersCount,
    },
    {
      id: 'clients' as AdminTab,
      label: 'Clients',
      icon: Users,
    },
    {
      id: 'products' as AdminTab,
      label: 'Produits',
      icon: Package,
    },
  ];

  return (
    <aside className="w-64 bg-black text-white flex flex-col justify-between h-screen sticky top-0 border-r border-neutral-800 flex-shrink-0 z-30">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-pink-500 fill-pink-500" />
            <span className="text-xl font-extrabold tracking-[0.2em] uppercase text-white font-sans">
              ECLORA
            </span>
          </div>
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mt-1">
            PANNEAU D&apos;ADMINISTRATION
          </span>
        </div>

        {/* Navigation Section */}
        <nav className="p-4 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
            GESTION DU BOUTIQUE
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-white text-black shadow-md'
                    : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-neutral-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-black text-white' : 'bg-pink-600 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Store Link */}
      <div className="p-4 border-t border-neutral-800 space-y-3">
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noreferrer"
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-neutral-700 text-neutral-300 text-xs font-bold hover:bg-white hover:text-black transition-colors"
        >
          <span>Voir le site Eclora</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <div className="text-[10px] text-neutral-500 text-center font-medium">
          Eclora Admin v1.0 • Connecté
        </div>
      </div>
    </aside>
  );
}
