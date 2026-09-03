'use client';

import React, { useState } from 'react';
import { ShoppingBag, MapPin, Phone, User, Calendar, ChevronRight, Eye, Search, X } from 'lucide-react';
import { Order, INITIAL_ORDERS } from '@/data/adminMockData';

export default function OrdersSection() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.clientPhone.includes(searchQuery) ||
      o.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner & Stats */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900">Gestion des Commandes & Clients</h2>
          <p className="text-xs text-slate-500 mt-1">
            Visualisez les numéros de commande, les coordonnées des clients, l&apos;adresse de destination et le montant total.
          </p>
        </div>

        {/* Quick Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="N° commande, client, téléphone..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-black outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">N° Commande</th>
                <th className="py-3.5 px-4">Client & Numéro</th>
                <th className="py-3.5 px-4">Destination (Adresse)</th>
                <th className="py-3.5 px-4">Statut</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Prix Total</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-900 font-medium">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Order Number */}
                  <td className="py-4 px-4 font-black text-slate-900">
                    <span className="bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                      {order.orderNumber}
                    </span>
                  </td>

                  {/* Client & Phone */}
                  <td className="py-4 px-4">
                    <div className="font-extrabold text-slate-900">{order.clientName}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-semibold">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{order.clientPhone}</span>
                    </div>
                  </td>

                  {/* Destination Address */}
                  <td className="py-4 px-4 max-w-xs">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-pink-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-slate-800">{order.shippingAddress}</div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {order.postalCode} {order.city}, {order.country}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-4 px-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as any)}
                      className={`text-xs font-extrabold rounded-lg px-2.5 py-1 border outline-none cursor-pointer ${
                        order.status === 'Livré'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : order.status === 'Expédié'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : order.status === 'En cours'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <option value="En cours">En cours</option>
                      <option value="Expédié">Expédié</option>
                      <option value="Livré">Livré</option>
                      <option value="En attente">En attente</option>
                      <option value="Annulé">Annulé</option>
                    </select>
                  </td>

                  {/* Date */}
                  <td className="py-4 px-4 text-slate-500 font-medium text-[11px]">
                    {order.createdAt}
                  </td>

                  {/* Total Price */}
                  <td className="py-4 px-4 text-right font-black text-slate-900 text-sm">
                    {order.totalPrice}
                  </td>

                  {/* View Details Action */}
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-black hover:bg-black hover:text-white transition-all text-xs font-bold inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Détails</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Order Details */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Détail de la commande
                </span>
                <h3 className="text-lg font-black text-slate-900">{selectedOrder.orderNumber}</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Client info & Address card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="font-extrabold text-slate-900">{selectedOrder.clientName}</span>
                <span className="font-bold text-slate-600">{selectedOrder.clientPhone}</span>
              </div>
              <div className="text-slate-600 font-medium">Email : {selectedOrder.clientEmail}</div>
              <div className="pt-2 border-t border-slate-200/60 font-semibold text-slate-800 flex items-start gap-1.5">
                <MapPin className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" />
                <span>
                  {selectedOrder.shippingAddress}, {selectedOrder.postalCode} {selectedOrder.city},{' '}
                  {selectedOrder.country}
                </span>
              </div>
            </div>

            {/* Ordered Items List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Articles Commandés ({selectedOrder.items.length})
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="p-3 flex items-center justify-between bg-white text-xs">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-10 h-10 object-cover rounded-md border border-slate-100"
                      />
                      <div>
                        <div className="font-black text-[10px] uppercase text-slate-500">
                          {item.brand}
                        </div>
                        <div className="font-bold text-slate-900">{item.title}</div>
                        {item.shade && (
                          <div className="text-[10px] text-slate-500">{item.shade}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">{item.price}</div>
                      <div className="text-[10px] text-slate-500">Qté : {item.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary & Price */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-sm font-black text-slate-900">
              <span>Montant Total</span>
              <span className="text-lg">{selectedOrder.totalPrice}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
