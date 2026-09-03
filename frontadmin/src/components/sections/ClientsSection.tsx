'use client';

import React, { useState } from 'react';
import { Users, Search, Phone, Mail, MapPin, Award, ShoppingBag, Plus, X } from 'lucide-react';
import { Client, INITIAL_CLIENTS } from '@/data/adminMockData';

export default function ClientsSection() {
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Client form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');

  const handleAddClient = () => {
    if (!name.trim() || !email.trim()) return;

    const newClient: Client = {
      id: `cli-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || '+213 550 00 00 00',
      city: city.trim() || 'Alger',
      country: 'Algérie',
      totalOrders: 0,
      totalSpent: '0,00 €',
      loyaltyTier: 'Classic',
      joinedDate: 'Aujourd\'hui',
      status: 'Actif',
    };

    setClients([newClient, ...clients]);
    setName('');
    setEmail('');
    setPhone('');
    setCity('');
    setIsModalOpen(false);
  };

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900">Répertoire des Clients</h2>
          <p className="text-xs text-slate-500 mt-1">
            Consultez la liste de tous vos clients enregistrés, leur historique de commandes et leur statut de fidélité.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un client..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-black outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-black text-white px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-800 transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau client</span>
          </button>
        </div>
      </div>

      {/* Clients Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Ville</th>
                <th className="py-3.5 px-4">Statut Fidélité</th>
                <th className="py-3.5 px-4 text-center">Commandes</th>
                <th className="py-3.5 px-4 text-right">Total Dépensé</th>
                <th className="py-3.5 px-4">Inscrit le</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-900 font-medium">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Name & Avatar */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                        {client.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-900">{client.name}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{client.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="py-4 px-4 text-slate-700 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{client.phone}</span>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="py-4 px-4 text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{client.city}, {client.country}</span>
                    </div>
                  </td>

                  {/* Loyalty Tier */}
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full ${
                        client.loyaltyTier === 'VIP'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : client.loyaltyTier === 'Gold'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <Award className="w-3 h-3" />
                      <span>{client.loyaltyTier}</span>
                    </span>
                  </td>

                  {/* Orders Count */}
                  <td className="py-4 px-4 text-center font-extrabold text-slate-900">
                    {client.totalOrders}
                  </td>

                  {/* Total Spent */}
                  <td className="py-4 px-4 text-right font-black text-slate-900 text-sm">
                    {client.totalSpent}
                  </td>

                  {/* Joined Date */}
                  <td className="py-4 px-4 text-slate-500 text-[11px] font-medium">
                    {client.joinedDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New Client */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Nouveau Client</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nom complet</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex : Marie Martin"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-black font-semibold outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Adresse Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex : marie.martin@gmail.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-black outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Numéro de Téléphone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex : +213 550 12 34 56"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-black outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Wilaya / Ville</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex : Alger, Oran, Constantine..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-black outline-none focus:ring-2 focus:ring-black"
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
                onClick={handleAddClient}
                className="px-5 py-2.5 rounded-xl bg-black text-white font-bold hover:bg-slate-800 text-xs"
              >
                Ajouter le client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
