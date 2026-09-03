'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Sliders, Check, Eye, Trash2, Layers } from 'lucide-react';
import { MainPageSection, INITIAL_MAIN_PAGE_SECTIONS, INITIAL_PRODUCTS } from '@/data/adminMockData';

export default function MainPageControlSection() {
  const [sections, setSections] = useState<MainPageSection[]>(INITIAL_MAIN_PAGE_SECTIONS);
  const [editingSection, setEditingSection] = useState<MainPageSection | null>(null);

  const [title, setTitle] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const openEditModal = (sec: MainPageSection) => {
    setEditingSection(sec);
    setTitle(sec.title);
    setSelectedProductIds(sec.assignedProductIds);
  };

  const handleToggleProduct = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSaveSection = () => {
    if (!editingSection || !title.trim()) return;

    setSections((prev) =>
      prev.map((s) =>
        s.id === editingSection.id
          ? {
              ...s,
              title: title.trim(),
              assignedProductIds: selectedProductIds,
            }
          : s
      )
    );

    setEditingSection(null);
  };

  const toggleVisibility = (secId: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === secId ? { ...s, isVisible: !s.isVisible } : s))
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <h2 className="text-lg font-black text-slate-900">Contrôle de la Page d&apos;accueil</h2>
        <p className="text-xs text-slate-500 mt-1">
          Personnalisez les titres des sections de la page d&apos;accueil (ex: &quot;Meilleures ventes maquillage&quot;) et sélectionnez quels produits y afficher.
        </p>
      </div>

      {/* Sections List */}
      <div className="space-y-6">
        {sections.map((sec) => (
          <div
            key={sec.id}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center font-bold text-xs">
                  {sec.position}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">{sec.title}</h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {sec.assignedProductIds.length} produits affichés dans ce carrousel
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleVisibility(sec.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    sec.isVisible
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {sec.isVisible ? 'Visible' : 'Masqué'}
                </button>

                <button
                  onClick={() => openEditModal(sec)}
                  className="px-4 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Modifier la section</span>
                </button>
              </div>
            </div>

            {/* Products Thumbnails Preview */}
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
              {sec.assignedProductIds.map((prodId) => {
                const prod = INITIAL_PRODUCTS.find((p) => p.id === prodId) || {
                  brand: 'ECLORA',
                  title: prodId,
                  image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80',
                  price: '39,90 €',
                };

                return (
                  <div
                    key={prodId}
                    className="flex-none w-44 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={prod.image}
                      alt={prod.title}
                      className="w-full h-24 object-cover rounded-lg mb-2"
                    />
                    <div className="font-extrabold text-[10px] uppercase text-slate-500">
                      {prod.brand}
                    </div>
                    <div className="font-bold text-slate-900 truncate mt-0.5">{prod.title}</div>
                    <div className="font-extrabold text-black mt-1">{prod.price}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Edit Section Title & Product Checklist */}
      {editingSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                Modifier la Section &quot;{editingSection.title}&quot;
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Titre de la section sur la page d&apos;accueil
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex : Meilleures ventes maquillage"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-black font-extrabold text-sm outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-2">
                  Sélectionnez les produits à inclure dans ce carrousel ({selectedProductIds.length} sélectionnés)
                </label>

                <div className="max-h-64 overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50">
                  {INITIAL_PRODUCTS.map((prod) => {
                    const isSelected = selectedProductIds.includes(prod.id);

                    return (
                      <div
                        key={prod.id}
                        onClick={() => handleToggleProduct(prod.id)}
                        className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-slate-900 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={prod.image}
                            alt={prod.title}
                            className="w-10 h-10 object-cover rounded-md flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <div
                              className={`text-[10px] font-black uppercase ${
                                isSelected ? 'text-slate-300' : 'text-slate-500'
                              }`}
                            >
                              {prod.brand}
                            </div>
                            <div className="font-bold truncate">{prod.title}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs">{prod.price}</span>
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center ${
                              isSelected ? 'bg-white text-black' : 'border border-slate-300'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setEditingSection(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-100 text-xs"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveSection}
                className="px-5 py-2.5 rounded-xl bg-black text-white font-bold hover:bg-slate-800 text-xs"
              >
                Enregistrer les modifications
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
