'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Tag, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '15',
    minOrderAmount: '2000',
    maxDiscount: '1000',
    maxUses: '100',
    isActive: true,
  });

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/coupons');
      if (res.ok) {
        const d = await res.json();
        setCoupons(d.coupons || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setModalOpen(false);
        setForm({
          code: '',
          description: '',
          discountType: 'PERCENTAGE',
          discountValue: '15',
          minOrderAmount: '2000',
          maxDiscount: '1000',
          maxUses: '100',
          isActive: true,
        });
        loadCoupons();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to create coupon');
      }
    } catch {
      alert('Error connecting to server');
    }
  };

  const handleDeleteCoupon = async (id: string, code: string) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadCoupons();
      }
    } catch {}
  };

  return (
    <div className="space-y-8">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#ECE7DF] gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-[#957856] font-semibold">
            Marketing & Incentives
          </span>
          <h1 className="font-serif text-3xl text-neutral-900 tracking-tight mt-1">
            Promotional Coupons
          </h1>
          <p className="text-xs text-neutral-500 font-light mt-0.5">
            Configure percentage discounts, fixed savings, minimum order limits, and usage quotas.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-black text-white text-xs uppercase tracking-luxury font-semibold hover:bg-neutral-800"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white border border-[#ECE7DF] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-500">Loading coupons...</div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500">No active coupons configured.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-neutral-500 uppercase tracking-wider text-[10px] border-b">
                <tr>
                  <th className="p-3.5">Coupon Code</th>
                  <th className="p-3.5">Benefit</th>
                  <th className="p-3.5">Min Spend</th>
                  <th className="p-3.5">Max Cap</th>
                  <th className="p-3.5">Redemptions</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50">
                    <td className="p-3.5 font-mono font-bold text-black text-sm">{c.code}</td>
                    <td className="p-3.5">
                      <span className="font-semibold text-emerald-800">
                        {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`}
                      </span>
                      <p className="text-[11px] text-neutral-500">{c.description}</p>
                    </td>
                    <td className="p-3.5 font-medium">{formatPrice(c.minOrderAmount)}</td>
                    <td className="p-3.5 text-neutral-600">
                      {c.maxDiscount ? formatPrice(c.maxDiscount) : 'No Cap'}
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-black">{c.currentUses}</span>
                      {c.maxUses && <span className="text-neutral-400"> / {c.maxUses} max</span>}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded-xs ${
                          c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-700'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteCoupon(c.id, c.code)}
                        className="text-neutral-400 hover:text-red-600 p-1"
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white max-w-md w-full p-6 shadow-2xl z-10 space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="font-serif text-xl text-black border-b pb-2">Create New Coupon</h3>
            <form onSubmit={handleCreateCoupon} className="space-y-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP25"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="w-full border p-2 text-xs font-mono font-bold uppercase"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Exclusive 25% off for private clientele"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                    className="w-full border p-2 text-xs"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                    className="w-full border p-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                    Minimum Order (₹)
                  </label>
                  <input
                    type="number"
                    value={form.minOrderAmount}
                    onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                    className="w-full border p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                    Max Discount (₹ Optional)
                  </label>
                  <input
                    type="number"
                    value={form.maxDiscount}
                    onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                    className="w-full border p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                  Maximum Total Uses (Optional)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={form.maxUses}
                  onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                  className="w-full border p-2 text-xs"
                />
              </div>

              <div className="pt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-1/2 py-2 border text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-black text-white text-xs uppercase font-semibold"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
