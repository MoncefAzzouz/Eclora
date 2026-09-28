'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Tag, FolderPlus, Layers, Check, X } from 'lucide-react';
import { Category, INITIAL_CATEGORIES } from '@/data/adminMockData';

export default function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [selectedCatId, setSelectedCatId] = useState<string>(categories[0].id);

  // Modal states for new Category & Subcategory
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatBadge, setNewCatBadge] = useState<'pink' | 'red' | 'default'>('default');

  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [newSubName, setNewSubName] = useState('');

  const selectedCat = categories.find((c) => c.id === selectedCatId) || categories[0];

  // Add category handler
  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      slug: newCatName.toLowerCase().replace(/\s+/g, '-'),
      badgeColor: newCatBadge !== 'default' ? newCatBadge : undefined,
      isHighlighted: newCatBadge !== 'default',
      subcategories: [],
    };
    setCategories([...categories, newCat]);
    setSelectedCatId(newCat.id);
    setNewCatName('');
    setIsCatModalOpen(false);
  };

  // Add subcategory handler
  const handleAddSubcategory = () => {
    if (!newSubName.trim()) return;
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id === selectedCatId) {
          return {
            ...c,
            subcategories: [
              ...c.subcategories,
              { id: `sub-${Date.now()}`, name: newSubName.trim(), itemCount: 0 },
            ],
          };
        }
        return c;
      })
    );
    setNewSubName('');
    setIsSubModalOpen(false);
  };

  // Delete category handler
  const handleDeleteCategory = (catId: string) => {
    if (categories.length <= 1) return;
    const updated = categories.filter((c) => c.id !== catId);
    setCategories(updated);
    if (selectedCatId === catId) setSelectedCatId(updated[0].id);
  };

  // Delete subcategory handler
  const handleDeleteSubcategory = (subId: string) => {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id === selectedCatId) {
          return {
            ...c,
            subcategories: c.subcategories.filter((s) => s.id !== subId),
          };
        }
        return c;
      })
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-black text-slate-900">Gestion des Catégories & Sous-catégories</h2>
          <p className="text-xs text-slate-500 mt-1">
            Créez et organisez les catégories principales et leurs sous-catégories associées.
          </p>
        </div>
        <button
          onClick={() => setIsCatModalOpen(true)}
          className="bg-black text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-800 transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <FolderPlus className="w-4 h-4" />
          <span>Ajouter une catégorie</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Categories List (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-600" />
              <span>Catégories Principales ({categories.length})</span>
            </h3>
          </div>

          <div className="space-y-2">
            {categories.map((cat) => {
              const isSelected = cat.id === selectedCatId;

              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCatId(cat.id)}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-black text-white border-black shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        cat.badgeColor === 'pink'
                          ? 'bg-pink-500'
                          : cat.badgeColor === 'red'
                          ? 'bg-red-500'
                          : 'bg-slate-400'
                      }`}
                    />
                    <div>
                      <div className="text-xs font-bold">{cat.name}</div>
                      <div
                        className={`text-[10px] ${
                          isSelected ? 'text-slate-300' : 'text-slate-400'
                        }`}
                      >
                        {cat.subcategories.length} sous-catégories
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {cat.badgeColor && (
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : cat.badgeColor === 'pink'
                            ? 'bg-pink-100 text-pink-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {cat.badgeColor === 'pink' ? 'Highlight Rose' : 'Badge Rouge'}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(cat.id);
                      }}
                      className={`p-1.5 rounded-lg hover:bg-red-500/20 transition-colors ${
                        isSelected ? 'text-white' : 'text-slate-400 hover:text-red-600'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subcategories Detail Panel (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Catégorie Sélectionnée
              </div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 mt-0.5">
                <span>{selectedCat.name}</span>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                  /{selectedCat.slug}
                </span>
              </h3>
            </div>

            <button
              onClick={() => setIsSubModalOpen(true)}
              className="bg-black text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter une sous-catégorie</span>
            </button>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Sous-catégories associées ({selectedCat.subcategories.length})
            </h4>

            {selectedCat.subcategories.length > 0 ? (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {selectedCat.subcategories.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-3.5 bg-white hover:bg-slate-50 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Tag className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-bold text-slate-900">{sub.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-slate-500 font-medium">
                        {sub.itemCount} produits
                      </span>
                      <button
                        onClick={() => handleDeleteSubcategory(sub.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                Aucune sous-catégorie pour {selectedCat.name}. Cliquez sur le bouton ci-dessus pour en ajouter une.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: New Category */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Nouvelle Catégorie</h3>
              <button onClick={() => setIsCatModalOpen(false)} className="text-slate-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nom de la catégorie</label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Ex : Soin Cheveux, K-Beauty..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-black outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Style de Highlight / Couleur</label>
                <select
                  value={newCatBadge}
                  onChange={(e) => setNewCatBadge(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-black outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="default">Normal (Standard)</option>
                  <option value="pink">Rose Highlight (Ex : Eclora Collection)</option>
                  <option value="red">Rouge Promo (Ex : Dernière chance -40%)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsCatModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Annuler
              </button>
              <button
                onClick={handleAddCategory}
                className="px-5 py-2.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-slate-800"
              >
                Créer la catégorie
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Subcategory */}
      {isSubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                Ajouter une sous-catégorie sous &quot;{selectedCat.name}&quot;
              </h3>
              <button onClick={() => setIsSubModalOpen(false)} className="text-slate-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Nom de la sous-catégorie</label>
              <input
                type="text"
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                placeholder="Ex : Anti-cernes, Sérums, Pinceaux..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-black outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsSubModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Annuler
              </button>
              <button
                onClick={handleAddSubcategory}
                className="px-5 py-2.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-slate-800"
              >
                Ajouter la sous-catégorie
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
