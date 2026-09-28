'use client';

import React, { useState } from 'react';
import { Package, Plus, Trash2, Edit2, Search, X } from 'lucide-react';
import { AdminProduct, INITIAL_PRODUCTS } from '@/data/adminMockData';

export default function ProductsSection() {
  const [products, setProducts] = useState<AdminProduct[]>(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [brand, setBrand] = useState('');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Maquillage');
  const [stock, setStock] = useState('50');
  const [image, setImage] = useState('');
  const [badge, setBadge] = useState('');

  const handleAddProduct = () => {
    if (!title.trim() || !price.trim()) return;

    const newProd: AdminProduct = {
      id: `prod-${Date.now()}`,
      brand: brand.trim() || 'ECLORA COLLECTION',
      title: title.trim(),
      price: price.trim().includes('DA') ? price.trim() : `${price.trim()} DA`,
      category,
      stock: parseInt(stock, 10) || 50,
      badge: badge.trim() || undefined,
      image: image.trim() || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80',
    };

    setProducts([newProd, ...products]);
    setBrand('');
    setTitle('');
    setPrice('');
    setImage('');
    setBadge('');
    setIsModalOpen(false);
  };

  const handleDelete = (prodId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== prodId));
  };

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900">Catalogue des Produits</h2>
          <p className="text-xs text-slate-500 mt-1">
            Gérez votre stock de produits, ajoutez de nouvelles références de beauté ou modifiez les tarifs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Chercher un produit, marque..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-black outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-black text-white px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-800 transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un produit</span>
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((prod) => (
          <div
            key={prod.id}
            className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between shadow-2xs hover:shadow-md transition-shadow group"
          >
            <div>
              <div className="relative h-40 bg-slate-50 rounded-xl overflow-hidden mb-3 border border-slate-100 flex items-center justify-center">
                {prod.badge && (
                  <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-md z-10">
                    {prod.badge}
                  </span>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={prod.image}
                  alt={prod.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>

              <div className="text-[10px] font-black uppercase text-slate-500">{prod.brand}</div>
              <h3 className="text-xs font-bold text-slate-900 line-clamp-2 mt-0.5">{prod.title}</h3>
              <div className="text-xs font-black text-black mt-2">{prod.price}</div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                Stock : {prod.stock}
              </span>
              <button
                onClick={() => handleDelete(prod.id)}
                className="text-slate-400 hover:text-red-600 transition-colors p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: New Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Nouveau Produit</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Marque</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="HUDA BEAUTY, DIOR..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-black font-semibold outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Catégorie</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-black font-semibold outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="Maquillage">Maquillage</option>
                    <option value="Parfum">Parfum</option>
                    <option value="Soin Visage">Soin Visage</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Titre du produit</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Easy Bake Loose Baking Powder..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-black font-bold outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Prix (DA)</label>
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="8 500 DA"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-black font-black outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stock Initial</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="50"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-black font-semibold outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">URL de l&apos;image</label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-black outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Badge Tag (Optionnel)</label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="Ex : Exclu, Best seller, Nouveauté"
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
                onClick={handleAddProduct}
                className="px-5 py-2.5 rounded-xl bg-black text-white font-bold hover:bg-slate-800 text-xs"
              >
                Ajouter au catalogue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
