'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Image as ImageIcon, Check, X, Sparkles, Layers, SlidersHorizontal } from 'lucide-react';
import { Banner, INITIAL_BANNERS } from '@/data/adminMockData';

export default function BannersSection() {
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'hero' | 'promo-dual' | 'promo-middle'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [badge, setBadge] = useState('');
  const [buttonText, setButtonText] = useState('Découvrir');
  const [imageUrl, setImageUrl] = useState('');
  const [type, setType] = useState<'hero' | 'promo-dual' | 'promo-middle'>('hero');
  const [targetLink, setTargetLink] = useState('/shop/maquillage');

  const openNewBannerModal = () => {
    setEditingBanner(null);
    setTitle('');
    setSubtitle('');
    setDescription('');
    setBadge('');
    setButtonText('Découvrir');
    setImageUrl('https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1800&q=85');
    setType('hero');
    setTargetLink('/shop/maquillage');
    setIsModalOpen(true);
  };

  const openEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    setTitle(banner.title);
    setSubtitle(banner.subtitle || '');
    setDescription(banner.description || '');
    setBadge(banner.badge || '');
    setButtonText(banner.buttonText);
    setImageUrl(banner.imageUrl);
    setType(banner.type);
    setTargetLink(banner.targetLink);
    setIsModalOpen(true);
  };

  const handleSaveBanner = () => {
    if (!title.trim()) return;

    if (editingBanner) {
      setBanners((prev) =>
        prev.map((b) =>
          b.id === editingBanner.id
            ? {
                ...b,
                title,
                subtitle: subtitle.trim() || undefined,
                description: description.trim() || undefined,
                badge: badge.trim() || undefined,
                buttonText,
                imageUrl,
                type,
                targetLink,
              }
            : b
        )
      );
    } else {
      const newBanner: Banner = {
        id: `ban-${Date.now()}`,
        title,
        subtitle: subtitle.trim() || undefined,
        description: description.trim() || undefined,
        badge: badge.trim() || undefined,
        buttonText,
        imageUrl,
        type,
        targetLink,
        isActive: true,
        position: banners.length + 1,
      };
      setBanners([...banners, newBanner]);
    }

    setIsModalOpen(false);
  };

  const toggleActive = (bannerId: string) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === bannerId ? { ...b, isActive: !b.isActive } : b))
    );
  };

  const handleDelete = (bannerId: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== bannerId));
  };

  const filteredBanners = selectedFilter === 'all'
    ? banners
    : banners.filter((b) => b.type === selectedFilter);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-black text-slate-900">Gestion des Bannières & Promos</h2>
          <p className="text-xs text-slate-500 mt-1">
            Gérez toutes les bannières : Hero principal, doubles cartes promo et bannières du milieu de page.
          </p>
        </div>
        <button
          onClick={openNewBannerModal}
          className="bg-black text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-800 transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter une bannière</span>
        </button>
      </div>

      {/* Filter Tabs Row */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs font-bold whitespace-nowrap">
        {[
          { id: 'all', label: `Toutes les bannières (${banners.length})` },
          { id: 'hero', label: `Bannière Hero (${banners.filter((b) => b.type === 'hero').length})` },
          { id: 'promo-dual', label: `Double Promo Grille (${banners.filter((b) => b.type === 'promo-dual').length})` },
          { id: 'promo-middle', label: `Promo Milieu (${banners.filter((b) => b.type === 'promo-middle').length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedFilter(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl border transition-all ${
              selectedFilter === tab.id
                ? 'bg-black text-white border-black shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Banners Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredBanners.map((banner) => (
          <div
            key={banner.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col justify-between group hover:shadow-md transition-shadow"
          >
            {/* Image Preview Box */}
            <div className="relative h-48 bg-slate-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-full object-cover opacity-90"
              />

              {/* Type Tag */}
              <span className="absolute top-3 left-3 bg-black/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                {banner.type === 'hero'
                  ? 'Bannière Hero (Dior)'
                  : banner.type === 'promo-dual'
                  ? 'Double Promo Grille (-30%)'
                  : 'Promo Milieu (Parfum / Erborian)'}
              </span>

              {/* Active Toggle Button */}
              <button
                onClick={() => toggleActive(banner.id)}
                className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-sm transition-all ${
                  banner.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'
                }`}
              >
                {banner.isActive ? 'Active' : 'Masquée'}
              </button>
            </div>

            {/* Content Details */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900">{banner.title}</h3>
                  {banner.badge && (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                      {banner.badge}
                    </span>
                  )}
                </div>

                {banner.subtitle && (
                  <div className="text-xs font-bold text-pink-600 mt-0.5">{banner.subtitle}</div>
                )}
                {banner.description && (
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{banner.description}</p>
                )}
                <div className="text-[11px] text-slate-400 font-mono mt-2 truncate">
                  Lien cible : {banner.targetLink}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  onClick={() => openEditModal(banner)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs font-bold hover:bg-black hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Modifier</span>
                </button>

                <button
                  onClick={() => handleDelete(banner.id)}
                  className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create or Edit Banner */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                {editingBanner ? 'Modifier la Bannière' : 'Ajouter une Nouvelle Bannière'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Emplacement / Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-black font-semibold outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="hero">Bannière Principale Hero (Dior)</option>
                  <option value="promo-dual">Double Promo Grille Côté à Côté (-30%)</option>
                  <option value="promo-middle">Bannière Promo Milieu (Parfum & Erborian)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Titre principal</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex : Plus qu'un parfum, une émotion"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-black font-bold outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Badge Tag (Optionnel)</label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="Ex : ★ AVANT-PREMIÈRE, Exclusivité..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-black font-bold outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Sous-titre / Accroche (Optionnel)</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Ex : Jusqu'à -30%"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-black outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description / Texte</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Senteurs fruitées, florales ou chaleureuses..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-black outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">URL de l&apos;image</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-black outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Texte du bouton CTA</label>
                <input
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  placeholder="Découvrir"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-black font-bold outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-100 text-xs"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveBanner}
                className="px-5 py-2.5 rounded-xl bg-black text-white font-bold hover:bg-slate-800 text-xs"
              >
                Enregistrer la bannière
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
