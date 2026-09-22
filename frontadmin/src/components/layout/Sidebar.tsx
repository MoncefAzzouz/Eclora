'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, ExternalLink, X } from 'lucide-react';
import { NAV_GROUPS, type AlertKey } from './nav';
import type { AdminRole } from '@/types';

const STORE_URL = process.env.NEXT_PUBLIC_STORE_URL ?? 'http://localhost:3000';

interface SidebarProps {
  role: AdminRole;
  alerts: Partial<Record<AlertKey, number>>;
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ role, alerts, open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />}
      <aside
        className={`w-64 bg-black text-white flex flex-col h-screen fixed lg:sticky top-0 left-0 border-r border-neutral-800 flex-shrink-0 z-40 transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-neutral-800 flex items-start justify-between">
          <Link href="/dashboard" onClick={onClose}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-pink-500 fill-pink-500" />
              <span className="text-xl font-extrabold tracking-[0.2em] uppercase">ECLORA</span>
            </div>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mt-1">
              Panneau d&apos;administration
            </span>
          </Link>
          <button className="lg:hidden text-neutral-400 hover:text-white" onClick={onClose} aria-label="Fermer le menu">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-5 overflow-y-auto no-scrollbar flex-1">
          {NAV_GROUPS.map((group) => {
            const items = group.items.filter((i) => !i.roles || i.roles.includes(role));
            if (!items.length) return null;
            return (
              <div key={group.title} className="space-y-1">
                <div className="px-3 pb-1 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">{group.title}</div>
                {items.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const count = item.badge ? alerts[item.badge] ?? 0 : 0;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        active ? 'bg-white text-black shadow-md' : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${active ? 'text-black' : 'text-neutral-400'}`} />
                        {item.label}
                      </span>
                      {count > 0 && (
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            active ? 'bg-black text-white' : 'bg-pink-600 text-white'
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-neutral-800">
          <a
            href={STORE_URL}
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-neutral-700 text-neutral-300 text-xs font-bold hover:bg-white hover:text-black transition-colors"
          >
            Voir la boutique
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </aside>
    </>
  );
}
