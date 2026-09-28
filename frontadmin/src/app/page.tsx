'use client';

import React, { useState } from 'react';
import AdminSidebar, { AdminTab } from '@/components/AdminSidebar';
import AdminHeader from '@/components/AdminHeader';
import DashboardOverview from '@/components/sections/DashboardOverview';
import CategoriesSection from '@/components/sections/CategoriesSection';
import BannersSection from '@/components/sections/BannersSection';
import MainPageControlSection from '@/components/sections/MainPageControlSection';
import OrdersSection from '@/components/sections/OrdersSection';
import ClientsSection from '@/components/sections/ClientsSection';
import ProductsSection from '@/components/sections/ProductsSection';
import { INITIAL_ORDERS } from '@/data/adminMockData';

export default function AdminHomePage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const TAB_NAMES: Record<AdminTab, string> = {
    dashboard: 'Tableau de bord',
    categories: 'Catégories & Sous-catégories',
    banners: 'Bannières & Promos',
    mainpage: 'Contrôle Page d\'accueil',
    orders: 'Commandes & Numéro Client',
    clients: 'Répertoire des Clients',
    products: 'Catalogue des Produits',
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-pink-100">
      {/* Dark Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        ordersCount={INITIAL_ORDERS.filter((o) => o.status === 'En cours').length}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <AdminHeader currentTabName={TAB_NAMES[activeTab]} />

        {/* Content View */}
        <main className="p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardOverview onNavigateTab={(tab) => setActiveTab(tab)} />
          )}
          {activeTab === 'categories' && <CategoriesSection />}
          {activeTab === 'banners' && <BannersSection />}
          {activeTab === 'mainpage' && <MainPageControlSection />}
          {activeTab === 'orders' && <OrdersSection />}
          {activeTab === 'clients' && <ClientsSection />}
          {activeTab === 'products' && <ProductsSection />}
        </main>
      </div>
    </div>
  );
}
