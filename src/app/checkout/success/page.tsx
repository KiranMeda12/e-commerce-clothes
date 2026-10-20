'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, Printer, ArrowRight, Package, Truck, Clock } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderNumber) {
      fetch(`/api/orders/${orderNumber}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.order) {
            setOrder(data.order);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [orderNumber]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-xs text-neutral-500">
        Retrieving order confirmation details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="font-serif text-2xl text-neutral-900">Order Placed</h1>
        <p className="text-xs text-neutral-500">
          Thank you. Your order reference is <span className="font-mono font-semibold">{orderNumber}</span>.
        </p>
        <Link href="/" className="inline-block px-6 py-2.5 bg-black text-white text-xs uppercase tracking-luxury">
          Return Home
        </Link>
      </div>
    );
  }

  const shippingAddr = typeof order.shippingAddress === 'string'
    ? JSON.parse(order.shippingAddress)
    : order.shippingAddress;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
      {/* Top Banner */}
      <div className="text-center space-y-3">
        <CheckCircle2 className="w-12 h-12 text-[#957856] mx-auto stroke-[1.5]" />
        <span className="text-[10px] uppercase tracking-luxury text-[#957856] font-semibold">
          Order Confirmed
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-neutral-900 tracking-tight">
          Thank You For Your Patronage
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto font-light">
          We have received your order <span className="font-mono font-semibold text-black">{order.orderNumber}</span>. An itemized invoice and dispatch notification will be dispatched to <strong className="text-black">{order.customerEmail}</strong>.
        </p>

        <div className="pt-2 flex justify-center space-x-4">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-4 py-2 border border-neutral-300 text-xs text-neutral-700 hover:border-black transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>
          <Link
            href={`/account/orders?order=${order.orderNumber}`}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-black text-white text-xs uppercase tracking-widest font-semibold hover:bg-neutral-800 transition-colors"
          >
            <span>Track Order</span>
          </Link>
        </div>
      </div>

      {/* Order Summary Receipt Box */}
      <div className="bg-[#FAF8F5] border border-[#ECE7DF] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between pb-6 border-b border-[#ECE7DF] gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-luxury text-neutral-400">Order Number</p>
            <p className="font-mono font-semibold text-sm text-black">{order.orderNumber}</p>
            <p className="text-xs text-neutral-500 mt-1">{formatDate(order.createdAt)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-luxury text-neutral-400">Order Status</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 bg-black text-white text-[11px] font-semibold uppercase tracking-wider">
              {order.status}
            </span>
            <p className="text-xs text-neutral-500 mt-1">Payment: <strong className="text-black">{order.paymentMethod} ({order.paymentStatus})</strong></p>
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase tracking-luxury text-neutral-900 font-semibold">
            Purchased Items
          </h3>
          <div className="divide-y divide-[#EAE1D5]">
            {order.items?.map((item: any) => (
              <div key={item.id} className="py-3 flex items-center justify-between space-x-4">
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
                    <p className="font-medium text-black">{item.productName}</p>
                    <p className="text-neutral-500">{item.size} • {item.color} • Qty {item.quantity}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-black shrink-0">
                  {formatPrice(item.totalPrice)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Address snapshot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-[#ECE7DF] text-xs">
          <div>
            <h4 className="font-semibold text-neutral-900 uppercase tracking-wider text-[11px] mb-2">
              Delivery Address
            </h4>
            <p className="font-medium text-black">{shippingAddr.fullName}</p>
            <p className="text-neutral-600">{shippingAddr.streetAddress}</p>
            {shippingAddr.apartment && <p className="text-neutral-600">{shippingAddr.apartment}</p>}
            <p className="text-neutral-600">{shippingAddr.city}, {shippingAddr.state} {shippingAddr.postalCode}</p>
            <p className="text-neutral-600">Phone: {shippingAddr.phone}</p>
          </div>

          <div>
            <h4 className="font-semibold text-neutral-900 uppercase tracking-wider text-[11px] mb-2">
              Financial Summary
            </h4>
            <div className="space-y-1.5 text-neutral-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Promotional Discount:</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span>{order.shippingFee === 0 ? 'Complimentary' : formatPrice(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between font-semibold text-black text-sm pt-2 border-t border-[#EAE1D5]">
                <span>Total Paid / Due:</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link
          href="/shop"
          className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-widest text-neutral-700 hover:text-black font-semibold"
        >
          <span>Continue Exploring Collections</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs">Loading order confirmation...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
