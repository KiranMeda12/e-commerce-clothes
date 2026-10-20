'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Users,
  Layers,
  AlertTriangle,
  ArrowRight,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/dashboard/stats');
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-neutral-500 uppercase tracking-widest flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-5 h-5 animate-spin text-[#957856]" />
        <span>Aggregating verified ledger and sales analytics...</span>
      </div>
    );
  }

  if (!data || !data.metrics) {
    return (
      <div className="py-20 text-center text-xs text-neutral-500 uppercase tracking-widest space-y-4 max-w-md mx-auto">
        <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto" />
        <p className="text-neutral-700">Connecting to secure executive ledger...</p>
        <button
          type="button"
          onClick={fetchStats}
          className="px-5 py-2.5 bg-black text-white text-xs font-semibold tracking-wider uppercase hover:bg-neutral-800 shadow-sm"
        >
          Refresh Ledger
        </button>
      </div>
    );
  }

  const metrics = data.metrics || {
    totalSales: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalCustomers: 0,
    totalActiveProducts: 0,
    lowStockCount: 0,
  };
  const lowStockVariants = Array.isArray(data.lowStockVariants) ? data.lowStockVariants : [];
  const bestSellers = Array.isArray(data.bestSellers) ? data.bestSellers : [];
  const recentOrders = Array.isArray(data.recentOrders) ? data.recentOrders : [];
  const salesTrends = Array.isArray(data.salesTrends) ? data.salesTrends : [];

  const statCards = [
    {
      label: 'Verified Revenue',
      value: formatPrice(metrics.totalSales),
      subtext: 'Excludes cancelled/refunded orders',
      icon: TrendingUp,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
    },
    {
      label: 'Total Orders',
      value: metrics.totalOrders ?? 0,
      subtext: `${metrics.pendingOrders ?? 0} pending fulfillment`,
      icon: ShoppingBag,
      color: 'text-neutral-900',
      bgColor: 'bg-neutral-100',
    },
    {
      label: 'Active Garments',
      value: metrics.totalActiveProducts ?? 0,
      subtext: 'Published on storefront',
      icon: Layers,
      color: 'text-neutral-900',
      bgColor: 'bg-neutral-100',
    },
    {
      label: 'Client Directory',
      value: metrics.totalCustomers ?? 0,
      subtext: 'Registered patrons',
      icon: Users,
      color: 'text-neutral-900',
      bgColor: 'bg-neutral-100',
    },
    {
      label: 'Low Stock Alerts',
      value: metrics.lowStockCount ?? 0,
      subtext: 'Variants ≤ 5 items remaining',
      icon: AlertTriangle,
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Completed Deliveries',
      value: metrics.completedOrders ?? 0,
      subtext: 'Successfully signed for',
      icon: CheckCircle2,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
    },
  ];

  return (
    <div className="space-y-10">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#ECE7DF] gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-[#957856] font-semibold">
            Executive Ledger
          </span>
          <h1 className="font-serif text-3xl text-neutral-900 tracking-tight mt-1">
            Maison Performance Overview
          </h1>
          <p className="text-xs text-neutral-500 font-light mt-0.5">
            Real-time synchronization with boutique catalog, customer carts, and verified transactions.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchStats}
          className="inline-flex items-center space-x-2 px-3.5 py-2 bg-white border border-neutral-300 text-xs text-neutral-700 hover:border-black transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="bg-white p-5 border border-[#ECE7DF] shadow-2xs space-y-3 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
                  {card.label}
                </span>
                <div className={`p-1.5 rounded-xs ${card.bgColor}`}>
                  <Icon className={`w-4 h-4 ${card.color}`} strokeWidth={1.75} />
                </div>
              </div>
              <div>
                <p className={`text-xl sm:text-2xl font-semibold tracking-tight ${card.color}`}>
                  {card.value}
                </p>
                <p className="text-[10px] text-neutral-400 mt-0.5">{card.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sales Trend Chart & Top Sellers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 7-Day Sales Trend Bar Chart */}
        <div className="lg:col-span-7 bg-white p-6 border border-[#ECE7DF] space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h2 className="font-serif text-lg text-neutral-900 tracking-wide">
                Recent Revenue Trend
              </h2>
              <p className="text-xs text-neutral-500">Daily gross volume (Last 7 Days)</p>
            </div>
            <span className="text-xs font-semibold text-neutral-900 bg-[#FAF8F5] border border-[#EAE1D5] px-2.5 py-1">
              Verified Orders Only
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {salesTrends.map((st: any, idx: number) => {
              const maxVal = Math.max(...salesTrends.map((s: any) => s.sales), 1000);
              const pct = (st.sales / maxVal) * 100;

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-neutral-700">{st.date}</span>
                    <span className="font-semibold text-neutral-900">{formatPrice(st.sales)} ({st.orders} orders)</span>
                  </div>
                  <div className="w-full bg-[#FAF8F5] h-3 rounded-xs overflow-hidden border border-neutral-100">
                    <div
                      className="bg-[#121212] h-full transition-all duration-500"
                      style={{ width: `${Math.max(4, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top-Selling Garments */}
        <div className="lg:col-span-5 bg-white p-6 border border-[#ECE7DF] space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h2 className="font-serif text-lg text-neutral-900 tracking-wide">
                Best-Selling Pieces
              </h2>
              <p className="text-xs text-neutral-500">By units dispatched</p>
            </div>
            <Link href="/admin/products" className="text-xs text-[#957856] font-semibold hover:text-black">
              View All
            </Link>
          </div>

          <div className="divide-y divide-[#ECE7DF]">
            {bestSellers.length === 0 ? (
              <p className="text-xs text-neutral-500 py-6 text-center">No sales recorded yet.</p>
            ) : (
              bestSellers.map((item: any) => (
                <div key={item.id} className="py-3 flex items-center justify-between space-x-3">
                  <div className="flex items-center space-x-3">
                    <div className="relative w-10 h-14 bg-[#F5F1EB] shrink-0 overflow-hidden">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="text-xs truncate max-w-[160px] sm:max-w-[200px]">
                      <p className="font-medium text-black truncate">{item.name}</p>
                      <p className="text-neutral-400 font-mono text-[10px]">{item.sku}</p>
                      <p className="text-[#957856] font-semibold text-[11px] mt-0.5">{formatPrice(item.price)}</p>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <span className="font-bold text-black">{item.totalSold} sold</span>
                    <p className="text-[11px] text-neutral-500">{formatPrice(item.revenue)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Low-Stock Inventory Alerts */}
      {lowStockVariants.length > 0 && (
        <div className="bg-white p-6 border border-amber-200 shadow-2xs space-y-4">
          <div className="flex justify-between items-center border-b border-amber-100 pb-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <h2 className="font-serif text-lg text-neutral-900 tracking-wide">
                Urgent Inventory Alerts (Low Stock)
              </h2>
            </div>
            <Link
              href="/admin/products"
              className="text-xs text-amber-800 font-semibold underline"
            >
              Manage Catalog →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-amber-50/70 text-amber-900 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Garment</th>
                  <th className="p-3">Variant SKU</th>
                  <th className="p-3">Size</th>
                  <th className="p-3">Color</th>
                  <th className="p-3">Units Remaining</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {lowStockVariants.map((v: any) => (
                  <tr key={v.id} className="hover:bg-neutral-50">
                    <td className="p-3 font-medium text-black">{v.product?.name}</td>
                    <td className="p-3 font-mono text-neutral-500">{v.sku}</td>
                    <td className="p-3 font-semibold">{v.size}</td>
                    <td className="p-3">{v.color}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-red-100 text-red-800 font-bold rounded-xs">
                        {v.stock} left
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/admin/products?edit=${v.product?.id}`}
                        className="text-xs text-[#957856] font-semibold underline hover:text-black"
                      >
                        Restock Variant
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Orders Overview */}
      <div className="bg-white p-6 border border-[#ECE7DF] space-y-4">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h2 className="font-serif text-lg text-neutral-900 tracking-wide">
              Recent Customer Orders
            </h2>
            <p className="text-xs text-neutral-500">Live order flow and fulfillment queue</p>
          </div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center space-x-1 text-xs uppercase tracking-wider text-[#957856] font-semibold hover:text-black"
          >
            <span>All Orders ({metrics.totalOrders})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-neutral-500 uppercase tracking-wider text-[10px] border-b">
              <tr>
                <th className="p-3">Order #</th>
                <th className="p-3">Date</th>
                <th className="p-3">Client</th>
                <th className="p-3">Items</th>
                <th className="p-3">Total</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {recentOrders.map((ord: any) => (
                <tr key={ord.id} className="hover:bg-neutral-50/80">
                  <td className="p-3 font-mono font-semibold text-black">{ord.orderNumber}</td>
                  <td className="p-3 text-neutral-500">{formatDate(ord.createdAt)}</td>
                  <td className="p-3 font-medium text-neutral-900">{ord.customerName}</td>
                  <td className="p-3 text-neutral-600">
                    {(ord.items?.length || 0)} item{(ord.items?.length || 0) !== 1 ? 's' : ''} {ord.items?.[0] ? `(${ord.items[0].productName})` : ''}
                  </td>
                  <td className="p-3 font-semibold text-black">{formatPrice(ord.total)}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 text-[10px] uppercase font-semibold rounded-xs ${
                        ord.paymentStatus === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ord.paymentStatus} ({ord.paymentMethod})
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-neutral-900 text-white text-[10px] uppercase font-semibold rounded-xs">
                      {ord.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <Link
                      href={`/admin/orders?view=${ord.id}`}
                      className="p-1.5 text-neutral-500 hover:text-black inline-block"
                      title="Inspect Order"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
