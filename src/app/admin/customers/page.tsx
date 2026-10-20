'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Users, Mail, Phone, ShoppingBag, Eye, RefreshCw } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const url = searchTerm ? `/api/admin/customers?search=${encodeURIComponent(searchTerm)}` : '/api/admin/customers';
      const res = await fetch(url);
      if (res.ok) {
        const d = await res.json();
        setCustomers(d.customers || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadCustomers();
  };

  return (
    <div className="space-y-8">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#ECE7DF] gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-[#957856] font-semibold">
            Client Relations
          </span>
          <h1 className="font-serif text-3xl text-neutral-900 tracking-tight mt-1">
            Registered Customers Directory
          </h1>
          <p className="text-xs text-neutral-500 font-light mt-0.5">
            Audit client lifetime spend, cumulative purchase records, and saved contact locations.
          </p>
        </div>

        <button
          type="button"
          onClick={loadCustomers}
          className="p-2 border border-neutral-300 hover:border-black text-neutral-600 self-start sm:self-auto"
          title="Refresh"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 border border-[#ECE7DF]">
        <form onSubmit={handleSearch} className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search customer by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 focus:outline-none focus:border-black"
          />
        </form>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-[#ECE7DF] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-500">Retrieving client accounts...</div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500">No registered customers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-neutral-500 uppercase tracking-wider text-[10px] border-b">
                <tr>
                  <th className="p-3.5">Client Name</th>
                  <th className="p-3.5">Contact Information</th>
                  <th className="p-3.5">Member Since</th>
                  <th className="p-3.5">Orders Count</th>
                  <th className="p-3.5">Lifetime Spend</th>
                  <th className="p-3.5">Primary Location</th>
                  <th className="p-3.5 text-right">View Orders</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50">
                    <td className="p-3.5 font-semibold text-black">{c.name}</td>
                    <td className="p-3.5 text-neutral-600 space-y-0.5">
                      <p className="flex items-center text-neutral-800">
                        <Mail className="w-3 h-3 mr-1 text-neutral-400" /> {c.email}
                      </p>
                      {c.phone && (
                        <p className="flex items-center text-neutral-500 text-[11px]">
                          <Phone className="w-3 h-3 mr-1 text-neutral-400" /> {c.phone}
                        </p>
                      )}
                    </td>
                    <td className="p-3.5 text-neutral-500">{formatDate(c.joinedDate)}</td>
                    <td className="p-3.5 font-semibold text-black">
                      {c.totalOrders} order{c.totalOrders === 1 ? '' : 's'}
                    </td>
                    <td className="p-3.5 font-bold text-emerald-800">
                      {formatPrice(c.totalSpend)}
                    </td>
                    <td className="p-3.5 text-neutral-600">{c.primaryCity}</td>
                    <td className="p-3.5 text-right">
                      <Link
                        href={`/admin/orders?search=${encodeURIComponent(c.email)}`}
                        className="px-2.5 py-1 border border-neutral-300 text-neutral-700 hover:border-black text-[11px] uppercase font-semibold"
                      >
                        Orders
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
