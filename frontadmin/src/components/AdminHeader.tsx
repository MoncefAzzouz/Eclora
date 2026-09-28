'use client';

import React from 'react';
import { Search, Bell, User, Sparkles } from 'lucide-react';

interface AdminHeaderProps {
  currentTabName: string;
}

export default function AdminHeader({ currentTabName }: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-6 py-4 flex items-center justify-between shadow-2xs">
      <div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <span>{currentTabName}</span>
          <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
            En direct
          </span>
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher dans l'admin..."
            className="bg-slate-100 border border-slate-200 text-xs text-slate-900 placeholder-slate-500 rounded-xl pl-9 pr-4 py-2 outline-none focus:ring-2 focus:ring-black w-64 transition-all"
          />
        </div>

        {/* Notifications Bell */}
        <button className="p-2 text-slate-600 hover:text-black rounded-xl hover:bg-slate-100 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-pink-600" />
        </button>

        {/* Admin Profile */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs shadow-xs">
            EA
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-bold text-slate-900 leading-tight">Admin Eclora</div>
            <div className="text-[10px] text-slate-500 font-medium">Directeur Magasin</div>
          </div>
        </div>
      </div>
    </header>
  );
}
