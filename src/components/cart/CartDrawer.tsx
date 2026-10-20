'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, Trash2, ArrowRight, Tag, Check, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

export default function CartDrawer() {
  const {
    isOpen,
    closeCart,
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

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  if (!isOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError('');

    const res = await applyCoupon(couponInput.trim());
    setCouponLoading(false);
    if (!res.success) {
      setCouponError(res.error || 'Failed to apply coupon');
    } else {
      setCouponInput('');
    }
  };

  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#ECE7DF] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-neutral-800" strokeWidth={1.5} />
            <h2 className="font-serif text-lg tracking-wider uppercase text-neutral-900">
              Shopping Bag ({itemCount})
            </h2>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="p-1.5 text-neutral-400 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-[#FAF8F5] px-6 py-3 border-b border-[#ECE7DF]">
          {amountNeededForFreeShipping === 0 ? (
            <div className="flex items-center text-xs text-emerald-800 font-medium">
              <Check className="w-4 h-4 mr-1.5 text-emerald-600" />
              You qualify for complimentary express delivery!
            </div>
          ) : (
            <div>
              <p className="text-xs text-neutral-600">
                Add <span className="font-semibold text-black">{formatPrice(amountNeededForFreeShipping)}</span> more for complimentary white-glove shipping.
              </p>
              <div className="w-full bg-[#EAE1D5] h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-[#121212] h-full transition-all duration-500 rounded-full"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="grow overflow-y-auto px-6 py-4 divide-y divide-[#F0ECE4]">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
              <ShoppingBag className="w-12 h-12 text-neutral-300 stroke-[1]" />
              <p className="font-serif text-lg text-neutral-800">Your bag is empty</p>
              <p className="text-xs text-neutral-500 max-w-xs">
                Explore our curated collections of cashmere, tailored wools, and fine silks.
              </p>
              <Link
                href="/shop"
                onClick={closeCart}
                className="mt-2 inline-block px-6 py-2.5 bg-black text-white text-xs uppercase tracking-luxury font-medium hover:bg-neutral-800 transition-colors"
              >
                Explore Collection
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.variantId} className="py-4 flex space-x-4">
                {/* Product Thumbnail */}
                <div className="relative w-20 h-24 bg-[#F5F1EB] shrink-0 overflow-hidden">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-200" />
                  )}
                </div>

                {/* Details */}
                <div className="grow flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={closeCart}
                        className="text-xs font-medium text-neutral-900 hover:text-[#957856] transition-colors line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeItem(item.variantId)}
                        className="text-neutral-400 hover:text-red-600 transition-colors ml-2"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center space-x-2 mt-1 text-[11px] text-neutral-500">
                      <span>Size: <strong className="text-neutral-800">{item.size}</strong></span>
                      <span>•</span>
                      <span>Color: <strong className="text-neutral-800">{item.color}</strong></span>
                    </div>

                    <p className="text-xs font-semibold text-neutral-900 mt-1">
                      {formatPrice(item.price)}
                    </p>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center justify-between mt-3 pt-2">
                    <div className="flex items-center border border-[#DFD1BF] rounded-xs">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="p-1 px-2 text-neutral-600 hover:text-black hover:bg-[#F5F1EB]"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-medium text-neutral-800">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        disabled={item.quantity >= item.maxStock}
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        className="p-1 px-2 text-neutral-600 hover:text-black hover:bg-[#F5F1EB] disabled:opacity-30"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-xs text-neutral-600 font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Coupon & Checkout */}
        {items.length > 0 && (
          <div className="border-t border-[#ECE7DF] px-6 py-5 bg-[#FAF8F5] space-y-4">
            {/* Coupon field */}
            {appliedCoupon ? (
              <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xs text-xs">
                <div className="flex items-center space-x-2">
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-semibold uppercase tracking-wider">{appliedCoupon.code}</span>
                  <span className="text-emerald-700">(-{formatPrice(discountAmount)})</span>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-emerald-700 hover:text-red-600 font-medium text-xs underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-1">
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Coupon code (e.g. WELCOME10)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="bg-white border border-[#DFD1BF] px-3 py-2 text-xs uppercase tracking-wider text-neutral-900 grow focus:outline-none focus:border-black"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading}
                    className="bg-black text-white px-4 py-2 text-xs uppercase tracking-widest font-semibold hover:bg-neutral-800 disabled:opacity-50"
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>
                {couponError && (
                  <p className="text-[11px] text-red-600">{couponError}</p>
                )}
              </form>
            )}

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-neutral-600 pt-2 border-t border-[#EAE1D5]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700">
                  <span>Promotional Discount</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span>{shippingFee === 0 ? <strong className="text-black font-medium">Free</strong> : formatPrice(shippingFee)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-neutral-900 pt-2 border-t border-[#EAE1D5]">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            {/* Checkout Action */}
            <Link
              href="/checkout"
              onClick={closeCart}
              className="w-full flex items-center justify-center space-x-2 py-3.5 bg-[#121212] text-white text-xs uppercase tracking-luxury font-semibold hover:bg-[#2A2A2A] transition-colors"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <p className="text-[10px] text-center text-neutral-400">
              Taxes calculated at checkout • Insured white-glove packaging
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
