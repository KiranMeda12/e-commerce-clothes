'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { formatPrice, formatDate } from '@/lib/utils';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  RotateCcw,
  AlertCircle,
  ChevronRight,
  Printer,
  ShieldCheck,
} from 'lucide-react';

const ORDER_STEPS = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

export default function CustomerOrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Return Request Modal State
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState<any | null>(null);
  const [returnReason, setReturnReason] = useState('');
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/customer/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to fetch customer orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/account/login?redirect=/account/orders');
      return;
    }
    if (user) {
      fetchOrders();
    }
  }, [user, authLoading, router]);

  // Cancel order handler
  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you wish to cancel this order? Stock will be restored to our atelier.')) {
      return;
    }

    try {
      const res = await fetch(`/api/customer/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Customer requested cancellation from account portal' }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({ type: 'success', text: 'Order cancelled successfully.' });
        fetchOrders();
      } else {
        setActionMessage({ type: 'error', text: data.error || 'Failed to cancel order.' });
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Network error cancelling order.' });
    }
  };

  // Submit Return request handler
  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForReturn || !returnReason.trim()) return;

    setReturnSubmitting(true);
    try {
      const res = await fetch(`/api/customer/orders/${selectedOrderForReturn.id}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: returnReason.trim() }),
      });
      const data = await res.json();
      setReturnSubmitting(false);

      if (res.ok) {
        setReturnModalOpen(false);
        setReturnReason('');
        setActionMessage({ type: 'success', text: data.message });
        fetchOrders();
      } else {
        setActionMessage({ type: 'error', text: data.error || 'Failed to submit return request.' });
      }
    } catch {
      setReturnSubmitting(false);
      setActionMessage({ type: 'error', text: 'Network error submitting return request.' });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center text-xs text-neutral-500">
        Accessing your private order vault...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* Account Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-[#ECE7DF] gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-[#957856] font-semibold">
            Client Account
          </span>
          <h1 className="font-serif text-3xl text-neutral-900 tracking-tight mt-1">
            Order History & Tracking
          </h1>
          <p className="text-xs text-neutral-500 font-light mt-1">
            Track dispatches, review invoices, or manage complimentary exchanges.
          </p>
        </div>

        <div className="flex space-x-4 text-xs font-medium">
          <Link href="/account/orders" className="text-black border-b-2 border-black pb-1">
            Orders ({orders.length})
          </Link>
          <Link href="/account/profile" className="text-neutral-500 hover:text-black pb-1">
            Profile & Addresses
          </Link>
        </div>
      </div>

      {actionMessage && (
        <div
          className={`p-3 text-xs flex items-center justify-between border ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <span>{actionMessage.text}</span>
          <button
            type="button"
            onClick={() => setActionMessage(null)}
            className="text-xs underline ml-4 font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-[#FAF8F5] border border-[#ECE7DF] p-8">
          <Package className="w-12 h-12 text-neutral-300 mx-auto stroke-[1]" />
          <h2 className="font-serif text-xl text-neutral-800">No Orders Recorded Yet</h2>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto font-light">
            When you purchase handcrafted items, your real-time tracking and delivery updates will appear here.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-block px-6 py-2.5 bg-black text-white text-xs uppercase tracking-luxury font-semibold hover:bg-neutral-800"
            >
              Explore Ready-to-Wear
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => {
            const isCancelled = order.status === 'CANCELLED';
            const isDelivered = order.status === 'DELIVERED';
            const isReturnRequested = order.returnRequests?.length > 0;
            const canCancel = ['PENDING', 'CONFIRMED'].includes(order.status);
            const currentStepIndex = ORDER_STEPS.indexOf(order.status);

            const shippingAddr =
              typeof order.shippingAddress === 'string'
                ? JSON.parse(order.shippingAddress)
                : order.shippingAddress;

            return (
              <div
                key={order.id}
                className="bg-white border border-[#ECE7DF] shadow-xs overflow-hidden"
              >
                {/* Order Top Bar */}
                <div className="bg-[#FAF8F5] px-6 py-4 border-b border-[#ECE7DF] flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase tracking-wider text-neutral-400">Order Placed</span>
                    <p className="font-medium text-black">{formatDate(order.createdAt)}</p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase tracking-wider text-neutral-400">Order Reference</span>
                    <p className="font-mono font-semibold text-black">{order.orderNumber}</p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase tracking-wider text-neutral-400">Total Amount</span>
                    <p className="font-semibold text-black">{formatPrice(order.total)} ({order.paymentMethod})</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-xs ${
                        isCancelled
                          ? 'bg-red-100 text-red-800'
                          : isDelivered
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-black text-white'
                      }`}
                    >
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Tracking Progress Timeline (if not cancelled) */}
                {!isCancelled && (
                  <div className="px-6 py-6 border-b border-[#ECE7DF] bg-white">
                    <div className="relative">
                      {/* Timeline bar */}
                      <div className="hidden sm:block absolute top-1/2 left-0 w-full h-0.5 bg-neutral-200 -translate-y-1/2 z-0" />
                      <div
                        className="hidden sm:block absolute top-1/2 left-0 h-0.5 bg-black -translate-y-1/2 transition-all duration-500 z-0"
                        style={{
                          width: `${Math.max(
                            0,
                            (currentStepIndex / (ORDER_STEPS.length - 1)) * 100
                          )}%`,
                        }}
                      />

                      {/* Timeline steps */}
                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center relative z-10">
                        {ORDER_STEPS.map((step, idx) => {
                          const isDone = idx <= currentStepIndex;
                          const isCurrent = idx === currentStepIndex;

                          return (
                            <div key={step} className="flex flex-col items-center space-y-1.5 py-1">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-colors ${
                                  isDone
                                    ? 'bg-black text-white border-black'
                                    : 'bg-white text-neutral-400 border-neutral-300'
                                }`}
                              >
                                {isDone ? '✓' : idx + 1}
                              </div>
                              <span
                                className={`text-[10px] uppercase tracking-wider ${
                                  isCurrent
                                    ? 'font-bold text-black'
                                    : isDone
                                    ? 'text-neutral-700'
                                    : 'text-neutral-400'
                                }`}
                              >
                                {step.replace(/_/g, ' ')}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Tracking Number / Courier if present */}
                    {order.trackingNumber && (
                      <div className="mt-4 p-3 bg-[#FAF8F5] border border-[#EAE1D5] rounded-xs flex flex-col sm:flex-row justify-between text-xs text-neutral-700 gap-2">
                        <div className="flex items-center space-x-2">
                          <Truck className="w-4 h-4 text-[#957856]" />
                          <span>
                            Courier: <strong className="text-black">{order.courierName || 'Blue Dart Express'}</strong>
                          </span>
                        </div>
                        <div className="font-mono text-xs">
                          Tracking ID: <span className="font-bold text-black">{order.trackingNumber}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Items in order */}
                <div className="px-6 py-4 divide-y divide-[#ECE7DF]">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="py-3 flex items-center justify-between space-x-4">
                      <div className="flex items-center space-x-4">
                        <div className="relative w-14 h-18 bg-[#F5F1EB] shrink-0 overflow-hidden">
                          {item.productImage && (
                            <Image
                              src={item.productImage}
                              alt={item.productName}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="text-xs">
                          <p className="font-semibold text-neutral-900">{item.productName}</p>
                          <p className="text-neutral-500 mt-0.5">
                            Size: <strong className="text-black">{item.size}</strong> • Color: <strong className="text-black">{item.color}</strong> • Qty: {item.quantity}
                          </p>
                          <p className="text-neutral-500 font-mono text-[11px] mt-0.5">SKU: {item.sku}</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-neutral-900 shrink-0">
                        {formatPrice(item.totalPrice)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Order Actions & Delivery Address */}
                <div className="px-6 py-4 bg-[#FAF8F5] border-t border-[#ECE7DF] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                  <div className="text-neutral-600">
                    <p>
                      Delivering to: <strong className="text-black">{shippingAddr.fullName}</strong>, {shippingAddr.streetAddress}, {shippingAddr.city} ({shippingAddr.postalCode})
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Cancellation option */}
                    {canCancel && (
                      <button
                        type="button"
                        onClick={() => handleCancelOrder(order.id)}
                        className="px-3 py-1.5 border border-red-300 text-red-700 hover:bg-red-50 transition-colors uppercase tracking-wider text-[11px] font-semibold"
                      >
                        Cancel Order
                      </button>
                    )}

                    {/* Return / Exchange request */}
                    {isDelivered && !isReturnRequested && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOrderForReturn(order);
                          setReturnModalOpen(true);
                        }}
                        className="px-3 py-1.5 border border-neutral-400 text-neutral-800 hover:border-black transition-colors uppercase tracking-wider text-[11px] font-semibold flex items-center space-x-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Request Return / Exchange</span>
                      </button>
                    )}

                    {isReturnRequested && (
                      <span className="text-[11px] text-amber-800 font-semibold bg-amber-50 border border-amber-200 px-2.5 py-1">
                        Return Requested ({order.returnRequests[0]?.status})
                      </span>
                    )}

                    <Link
                      href={`/checkout/success?orderNumber=${order.orderNumber}`}
                      className="px-3 py-1.5 bg-black text-white hover:bg-neutral-800 transition-colors uppercase tracking-wider text-[11px] font-semibold flex items-center space-x-1"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Invoice</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Return Request Modal */}
      {returnModalOpen && selectedOrderForReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setReturnModalOpen(false)}
          />
          <div className="relative bg-white max-w-md w-full p-6 shadow-2xl z-10 space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="font-serif text-xl text-neutral-900 border-b pb-2">
              Request Return or Exchange
            </h3>
            <p className="text-xs text-neutral-500">
              Order: <span className="font-mono font-semibold text-black">{selectedOrderForReturn.orderNumber}</span>
            </p>

            <form onSubmit={handleSubmitReturn} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                  Reason for Return / Exchange *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Size too large; exchange requested for size S or unworn return."
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full border border-[#DFD1BF] p-3 text-xs focus:outline-none focus:border-black"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setReturnModalOpen(false)}
                  className="w-1/2 py-2.5 border border-neutral-300 text-xs uppercase tracking-wider font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={returnSubmitting}
                  className="w-1/2 py-2.5 bg-black text-white text-xs uppercase tracking-wider font-semibold hover:bg-neutral-800 disabled:opacity-50"
                >
                  {returnSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
