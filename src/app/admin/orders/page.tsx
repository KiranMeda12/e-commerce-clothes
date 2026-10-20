'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  Filter,
  Eye,
  Truck,
  Printer,
  Download,
  CheckCircle,
  X,
  AlertCircle,
  Clock,
  FileText,
  RefreshCw,
  Send,
} from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';

function AdminOrdersContent() {
  const searchParams = useSearchParams();
  const viewParamId = searchParams.get('view');

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');

  // Selected Order for Detail Side Panel
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Status Update Form State inside Panel
  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [courierName, setCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (paymentFilter !== 'ALL') params.set('paymentStatus', paymentFilter);
      if (searchTerm) params.set('search', searchTerm);

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (res.ok) {
        const d = await res.json();
        setOrders(d.orders || []);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, paymentFilter]);

  const loadOrderDetail = async (orderId: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`);
      if (res.ok) {
        const d = await res.json();
        const ord = d.order;
        setSelectedOrder(ord);
        setNewStatus(ord.status);
        setNewPaymentStatus(ord.paymentStatus);
        setCourierName(ord.courierName || '');
        setTrackingNumber(ord.trackingNumber || '');
        setInternalNotes(ord.internalNotes || '');
        setStatusNote('');
        setUpdateMessage(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    if (viewParamId) {
      loadOrderDetail(viewParamId);
    }
  }, [viewParamId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleUpdateOrderStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setUpdatingStatus(true);
    setUpdateMessage(null);

    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          paymentStatus: newPaymentStatus,
          courierName,
          trackingNumber,
          internalNotes,
          statusNote,
        }),
      });

      const data = await res.json();
      setUpdatingStatus(false);

      if (res.ok) {
        setUpdateMessage('Order details & status synchronized successfully.');
        loadOrderDetail(selectedOrder.id);
        fetchOrders();
      } else {
        alert(data.error || 'Failed to update order status');
      }
    } catch {
      setUpdatingStatus(false);
      alert('Network error updating order');
    }
  };

  // Export orders to CSV
  const handleExportCSV = () => {
    if (orders.length === 0) return;
    const headers = [
      'Order Number',
      'Date',
      'Customer Name',
      'Email',
      'Phone',
      'Total (INR)',
      'Payment Method',
      'Payment Status',
      'Order Status',
      'Courier',
      'Tracking Number',
    ];

    const rows = orders.map((o) => [
      `"${o.orderNumber}"`,
      `"${new Date(o.createdAt).toISOString()}"`,
      `"${o.customerName}"`,
      `"${o.customerEmail}"`,
      `"${o.customerPhone}"`,
      o.total,
      `"${o.paymentMethod}"`,
      `"${o.paymentStatus}"`,
      `"${o.status}"`,
      `"${o.courierName || ''}"`,
      `"${o.trackingNumber || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `atelier_orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#ECE7DF] gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-[#957856] font-semibold">
            Fulfillment & Logistics
          </span>
          <h1 className="font-serif text-3xl text-neutral-900 tracking-tight mt-1">
            Order Management
          </h1>
          <p className="text-xs text-neutral-500 font-light mt-0.5">
            Process incoming orders, assign dispatch couriers, track verified payments, and review customer delivery notes.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1.5 px-4 py-2 border border-neutral-300 text-xs text-neutral-700 hover:border-black transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export to CSV</span>
          </button>
          <button
            type="button"
            onClick={fetchOrders}
            className="p-2 border border-neutral-300 hover:border-black text-neutral-600"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 border border-[#ECE7DF] flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search order #, customer, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 focus:outline-none focus:border-black"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-neutral-300 text-xs py-2 px-3 focus:outline-none focus:border-black uppercase tracking-wider"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">Payment:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="border border-neutral-300 text-xs py-2 px-3 focus:outline-none focus:border-black uppercase tracking-wider"
            >
              <option value="ALL">All Payments</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#ECE7DF] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-500">Retrieving boutique orders ledger...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500">No orders found matching filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-neutral-500 uppercase tracking-wider text-[10px] border-b">
                <tr>
                  <th className="p-3.5">Order Ref</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Garments</th>
                  <th className="p-3.5">Total</th>
                  <th className="p-3.5">Payment</th>
                  <th className="p-3.5">Order Status</th>
                  <th className="p-3.5">Courier & Tracking</th>
                  <th className="p-3.5 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {orders.map((ord) => (
                  <tr
                    key={ord.id}
                    onClick={() => loadOrderDetail(ord.id)}
                    className="hover:bg-neutral-50 cursor-pointer transition-colors"
                  >
                    <td className="p-3.5 font-mono font-semibold text-black">{ord.orderNumber}</td>
                    <td className="p-3.5 text-neutral-500">{formatDate(ord.createdAt)}</td>
                    <td className="p-3.5">
                      <p className="font-semibold text-black">{ord.customerName}</p>
                      <p className="text-[11px] text-neutral-400 truncate max-w-[150px]">{ord.customerEmail}</p>
                    </td>
                    <td className="p-3.5 text-neutral-600">
                      {ord.items?.length || 0} pieces ({ord.items?.[0]?.productName}...)
                    </td>
                    <td className="p-3.5 font-semibold text-black">{formatPrice(ord.total)}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-xs ${
                          ord.paymentStatus === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ord.paymentStatus} ({ord.paymentMethod})
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 text-[10px] uppercase font-semibold rounded-xs ${
                          ord.status === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-neutral-900 text-white'
                        }`}
                      >
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 text-neutral-600 text-[11px]">
                      {ord.trackingNumber ? (
                        <div className="font-mono">
                          <span className="font-medium text-black">{ord.courierName}: </span>
                          <span>{ord.trackingNumber}</span>
                        </div>
                      ) : (
                        <span className="text-neutral-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          loadOrderDetail(ord.id);
                        }}
                        className="p-1.5 text-neutral-500 hover:text-black"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Side Panel */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setSelectedOrder(null)}
          />

          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300 overflow-y-auto">
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#ECE7DF] flex items-center justify-between bg-[#FAF8F5]">
              <div>
                <span className="text-[10px] uppercase tracking-luxury text-[#957856] font-semibold">
                  Order Dossier
                </span>
                <h2 className="font-mono text-lg font-bold text-black mt-0.5">
                  {selectedOrder.orderNumber}
                </h2>
                <p className="text-xs text-neutral-500">{formatDate(selectedOrder.createdAt)}</p>
              </div>

              <div className="flex items-center space-x-2">
                <Link
                  href={`/checkout/success?orderNumber=${selectedOrder.orderNumber}`}
                  target="_blank"
                  className="p-2 border border-neutral-300 hover:border-black text-xs inline-flex items-center space-x-1"
                  title="Print Packing Slip / Invoice"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Invoice</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-neutral-400 hover:text-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {updateMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                  {updateMessage}
                </div>
              )}

              {/* Status Update Form */}
              <form onSubmit={handleUpdateOrderStatus} className="bg-[#FAF8F5] p-5 border border-[#ECE7DF] space-y-4">
                <h3 className="font-serif text-base text-neutral-900 border-b pb-2 font-semibold">
                  Workflow Status & Dispatch Controls
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                      Order Fulfillment Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full border border-[#DFD1BF] p-2 text-xs font-semibold uppercase tracking-wider bg-white"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED (Restores Stock)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                      Payment Gateway Status
                    </label>
                    <select
                      value={newPaymentStatus}
                      onChange={(e) => setNewPaymentStatus(e.target.value)}
                      className="w-full border border-[#DFD1BF] p-2 text-xs font-semibold uppercase tracking-wider bg-white"
                    >
                      <option value="PAID">PAID</option>
                      <option value="PENDING">PENDING</option>
                      <option value="FAILED">FAILED</option>
                      <option value="REFUNDED">REFUNDED</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                      Courier / Logistics Partner
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Blue Dart Express, Delhivery"
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                      className="w-full border border-[#DFD1BF] p-2 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                      Tracking Waybill Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. BDL-982019481"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="w-full border border-[#DFD1BF] p-2 text-xs font-mono bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                    Internal Executive Notes (Protected from customer view)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. VIP client; complimentary silk ribbon added to presentation box."
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    className="w-full border border-[#DFD1BF] p-2 text-xs bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="w-full py-2.5 bg-black text-white text-xs uppercase tracking-luxury font-semibold hover:bg-neutral-800 disabled:opacity-50"
                >
                  {updatingStatus ? 'Updating Order Record...' : 'Apply Status Update & Notify Client'}
                </button>
              </form>

              {/* Items in this order */}
              <div className="space-y-3">
                <h3 className="font-serif text-base text-neutral-900 border-b pb-2 font-semibold">
                  Garment Breakdown ({selectedOrder.items?.length || 0})
                </h3>
                <div className="divide-y divide-neutral-200">
                  {selectedOrder.items?.map((item: any) => (
                    <div key={item.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative w-12 h-16 bg-[#F5F1EB] shrink-0 overflow-hidden">
                          {item.productImage && (
                            <Image
                              src={item.productImage}
                              alt={item.productName}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="text-xs">
                          <p className="font-semibold text-black">{item.productName}</p>
                          <p className="text-neutral-500 font-mono text-[11px]">SKU: {item.sku}</p>
                          <p className="text-neutral-500">
                            Size: <strong className="text-black">{item.size}</strong> • Color: <strong className="text-black">{item.color}</strong> • Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-xs">
                        <p className="font-semibold text-black">{formatPrice(item.totalPrice)}</p>
                        <p className="text-[10px] text-neutral-400">@{formatPrice(item.unitPrice)}/ea</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer & Address Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-[#FAF8F5] border border-[#ECE7DF] space-y-1">
                  <h4 className="font-semibold uppercase tracking-wider text-[11px] text-black">Client Information</h4>
                  <p className="font-medium text-black">{selectedOrder.customerName}</p>
                  <p className="text-neutral-600">{selectedOrder.customerEmail}</p>
                  <p className="text-neutral-600">{selectedOrder.customerPhone}</p>
                  {selectedOrder.user ? (
                    <span className="inline-block mt-1 text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-xs font-semibold">
                      Registered Client
                    </span>
                  ) : (
                    <span className="inline-block mt-1 text-[10px] bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-xs">
                      Guest Checkout
                    </span>
                  )}
                </div>

                <div className="p-4 bg-[#FAF8F5] border border-[#ECE7DF] space-y-1">
                  <h4 className="font-semibold uppercase tracking-wider text-[11px] text-black">Delivery Address</h4>
                  {(() => {
                    const addr = typeof selectedOrder.shippingAddress === 'string'
                      ? JSON.parse(selectedOrder.shippingAddress)
                      : selectedOrder.shippingAddress;
                    return (
                      <>
                        <p>{addr.streetAddress}</p>
                        {addr.apartment && <p>{addr.apartment}</p>}
                        <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                        <p>{addr.country}</p>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Status Audit History Timeline */}
              <div className="space-y-3 pt-2">
                <h3 className="font-serif text-base text-neutral-900 border-b pb-2 font-semibold">
                  Status Change Audit Trail
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedOrder.statusHistory?.map((h: any) => (
                    <div key={h.id} className="p-2.5 bg-neutral-50 border border-neutral-200 text-xs flex justify-between items-start">
                      <div>
                        <span className="font-semibold text-black uppercase tracking-wider text-[10px] bg-neutral-200 px-1.5 py-0.5 mr-2">
                          {h.status}
                        </span>
                        <span className="text-neutral-700">{h.note || 'Status updated'}</span>
                      </div>
                      <div className="text-right text-[10px] text-neutral-400 shrink-0 ml-2">
                        <p>{formatDate(h.createdAt)}</p>
                        <p className="uppercase font-semibold">By: {h.changedBy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-xs">Loading admin orders ledger...</div>}>
      <AdminOrdersContent />
    </Suspense>
  );
}
