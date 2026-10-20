'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Trash2, Plus, Minus, Tag, Check, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const {
    items,
    itemCount,
    subtotal,
    shippingFee,
    freeShippingThreshold,
    amountNeededForFreeShipping,
    discountAmount,
    total,
    appliedCoupon,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    const res = await applyCoupon(couponCode.trim());
    setCouponLoading(false);
    if (!res.success) {
      setCouponError(res.error || 'Failed to apply coupon');
    } else {
      setCouponCode('');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <ShoppingBag className="w-16 h-16 text-neutral-300 stroke-[1] mx-auto" />
        <h1 className="font-serif text-3xl text-neutral-900">Your Shopping Bag is Empty</h1>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto font-light">
          Your luxury bag awaits its first selection. Explore our cashmere overcoats, tailored trousers, and silk essentials.
        </p>
        <div className="pt-4">
          <Link
            href="/shop"
            className="inline-block px-8 py-3.5 bg-black text-white text-xs uppercase tracking-luxury font-semibold hover:bg-neutral-800 transition-colors"
          >
            Explore The Wardrobe
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-[#ECE7DF] pb-6">
        <span className="text-[10px] uppercase tracking-luxury text-[#957856] font-semibold">Shopping Bag</span>
        <h1 className="font-serif text-3xl text-neutral-900 mt-1">Review Your Order ({itemCount})</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Items Table */}
        <div className="lg:col-span-8 divide-y divide-[#ECE7DF]">
          {items.map((item) => (
            <div key={item.variantId} className="py-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 items-start">
              <div className="relative w-28 h-36 bg-[#F5F1EB] shrink-0 overflow-hidden">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                )}
              </div>

              <div className="grow space-y-2">
                <div className="flex justify-between items-start">
                  <Link href={`/products/${item.slug}`} className="text-sm font-medium text-neutral-900 hover:text-[#957856]">
                    {item.name}
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeItem(item.variantId)}
                    className="text-neutral-400 hover:text-red-600 transition-colors text-xs flex items-center"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                  </button>
                </div>

                <div className="flex items-center space-x-3 text-xs text-neutral-500">
                  <span>Size: <strong className="text-neutral-800">{item.size}</strong></span>
                  <span>•</span>
                  <span>Color: <strong className="text-neutral-800">{item.color}</strong></span>
                </div>

                <p className="text-sm font-semibold text-neutral-900">{formatPrice(item.price)}</p>

                <div className="flex items-center space-x-4 pt-3">
                  <div className="flex items-center border border-[#DFD1BF]">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      className="px-3 py-1 text-neutral-600 hover:bg-[#F5F1EB]"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-3 text-xs font-semibold">{item.quantity}</span>
                    <button
                      type="button"
                      disabled={item.quantity >= item.maxStock}
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      className="px-3 py-1 text-neutral-600 hover:bg-[#F5F1EB] disabled:opacity-30"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="text-xs text-neutral-500">
                    Subtotal: <strong className="text-black">{formatPrice(item.price * item.quantity)}</strong>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Order Summary Card */}
        <div className="lg:col-span-4 bg-[#FAF8F5] border border-[#ECE7DF] p-6 sm:p-8 space-y-6">
          <h2 className="font-serif text-xl text-neutral-900 tracking-wide">Summary</h2>

          {/* Coupon */}
          {appliedCoupon ? (
            <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
              <div>
                <span className="font-semibold uppercase">{appliedCoupon.code}</span>
                <span className="ml-1 text-emerald-700">(-{formatPrice(discountAmount)})</span>
              </div>
              <button
                type="button"
                onClick={removeCoupon}
                className="text-emerald-700 hover:text-red-600 underline font-medium"
              >
                Remove
              </button>
            </div>
          ) : (
            <form onSubmit={handleApply} className="space-y-1">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Promo code (e.g. WELCOME10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="bg-white border border-[#DFD1BF] px-3 py-2 text-xs uppercase tracking-wider grow focus:outline-none focus:border-black"
                />
                <button
                  type="submit"
                  disabled={couponLoading}
                  className="bg-black text-white px-4 py-2 text-xs uppercase tracking-widest font-semibold hover:bg-neutral-800 disabled:opacity-50"
                >
                  {couponLoading ? '...' : 'Apply'}
                </button>
              </div>
              {couponError && <p className="text-[11px] text-red-600">{couponError}</p>}
            </form>
          )}

          {/* Calculations */}
          <div className="space-y-2 text-xs text-neutral-600 pt-4 border-t border-[#EAE1D5]">
            <div className="flex justify-between">
              <span>Bag Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-emerald-700">
                <span>Promotional Savings</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>White-Glove Shipping</span>
              <span>{shippingFee === 0 ? <strong className="text-black">Complimentary</strong> : formatPrice(shippingFee)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold text-neutral-900 pt-3 border-t border-[#EAE1D5]">
              <span>Estimated Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="w-full flex items-center justify-center space-x-2 py-4 bg-black text-white text-xs uppercase tracking-luxury font-semibold hover:bg-neutral-800 transition-colors shadow-md"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <div className="flex items-center justify-center space-x-2 text-[11px] text-neutral-500 pt-2">
            <ShieldCheck className="w-4 h-4 text-[#957856]" />
            <span>Encrypted 256-bit checkout security</span>
          </div>
        </div>
      </div>
    </div>
  );
}
