'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { canAccess, titleFor } from '@/components/layout/nav';
import { LoadingState } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';

type Alerts = Awaited<ReturnType<typeof api.dashboard.alerts>>;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [alerts, setAlerts] = useState<Alerts | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [loading, user, router, pathname]);

  const refreshAlerts = useCallback(() => {
    api.dashboard.alerts().then(setAlerts);
  }, []);

  useEffect(() => {
    if (!user) return;
    refreshAlerts();
    window.addEventListener('eclora:data-changed', refreshAlerts);
    return () => window.removeEventListener('eclora:data-changed', refreshAlerts);
  }, [user, refreshAlerts]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState label="Vérification de la session..." />
      </div>
    );
  }

  const allowed = canAccess(pathname, user.role);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role={user.role} alerts={alerts ?? {}} open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          title={titleFor(pathname)}
          user={user}
          alerts={alerts}
          onMenu={() => setMenuOpen(true)}
          onLogout={() => {
            logout();
            router.replace('/login');
          }}
        />
        <main className="p-4 md:p-8 flex-1 w-full max-w-7xl mx-auto">
          {allowed ? (
            children
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-24">
              <ShieldAlert className="w-8 h-8 text-slate-400 mb-3" />
              <p className="text-sm font-black">Accès refusé</p>
              <p className="text-xs text-slate-500 mt-1">Votre rôle ne permet pas d&apos;accéder à cette page.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
