'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Lock, CreditCard, Banknote, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, subtotal, shippingFee, discountAmount, total, appliedCoupon, clearCart } = useCart();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    streetAddress: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    deliveryNotes: '',
    saveAddress: true,
  });

  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'RAZORPAY'>('RAZORPAY');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);

  // Simulated Payment Modal State (for test/offline mode)
  const [simulatedModalOpen, setSimulatedModalOpen] = useState(false);
  const [simulatedPaymentData, setSimulatedPaymentData] = useState<any>(null);

  // Pre-fill user details if logged in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));

      // Fetch saved addresses
      fetch('/api/customer/addresses')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.addresses?.length > 0) {
            setSavedAddresses(data.addresses);
            const def = data.addresses.find((a: any) => a.isDefault) || data.addresses[0];
            setFormData((prev) => ({
              ...prev,
              streetAddress: def.streetAddress,
              apartment: def.apartment || '',
              city: def.city,
              state: def.state,
              postalCode: def.postalCode,
              phone: def.phone || prev.phone,
            }));
          }
        })
        .catch(() => {});
    }
  }, [user]);

  // If cart is empty, redirect
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items, router]);

  const handleSelectAddress = (addr: any) => {
    setFormData((prev) => ({
      ...prev,
      streetAddress: addr.streetAddress,
      apartment: addr.apartment || '',
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      phone: addr.phone || prev.phone,
      name: addr.fullName || prev.name,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit Order Workflow
  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      // 1. Verify Cart Stock with Server first
      const valRes = await fetch('/api/cart/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      const valData = await valRes.json();
      if (!valData.isValid) {
        setErrorMessage(
          'One or more items in your bag are out of stock or have changed. Please review your bag.'
        );
        setLoading(false);
        return;
      }

      // 2. Prepare Order Payload
      const orderPayload = {
        items,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress: {
          fullName: formData.name,
          phone: formData.phone,
          streetAddress: formData.streetAddress,
          apartment: formData.apartment,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        deliveryNotes: formData.deliveryNotes,
        paymentMethod,
        couponCode: appliedCoupon?.code,
      };

      const res = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize order');
      }

      // 3. Handle Cash On Delivery
      if (paymentMethod === 'COD' || !data.requiresPayment) {
        clearCart();
        router.push(`/checkout/success?orderNumber=${data.order.orderNumber}`);
        return;
      }

      // 4. Handle Razorpay Online Payment
      if (data.requiresPayment && data.razorpayOrder) {
        const razorpayOrder = data.razorpayOrder;

        // If simulated mode (e.g. key is placeholder or simulated flag set)
        if (razorpayOrder.isSimulated || !(window as any).Razorpay) {
          // Open simulated Razorpay secure modal for test verification
          setSimulatedPaymentData({
            orderId: data.order.id,
            orderNumber: data.order.orderNumber,
            gatewayOrderId: razorpayOrder.id,
            amount: data.order.total,
          });
          setSimulatedModalOpen(true);
          setLoading(false);
          return;
        }

        // Real Razorpay SDK Checkout Modal
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: 'ATELIER ÉLITE',
          description: `Order ${data.order.orderNumber}`,
          order_id: razorpayOrder.id,
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone,
          },
          theme: {
            color: '#121212',
          },
          handler: async function (response: any) {
            try {
              const verifyRes = await fetch('/api/checkout/razorpay/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: data.order.id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              });

              const verifyData = await verifyRes.json();
              if (verifyRes.ok && verifyData.success) {
                clearCart();
                router.push(`/checkout/success?orderNumber=${data.order.orderNumber}`);
              } else {
                setErrorMessage('Payment verification failed. Please contact concierge support.');
              }
            } catch (err) {
              setErrorMessage('Payment verification error.');
            }
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Order checkout error:', err);
      setErrorMessage(err.message || 'An error occurred while creating order.');
      setLoading(false);
    }
  };

  // Complete simulated payment
  const handleCompleteSimulatedPayment = async () => {
    if (!simulatedPaymentData) return;
    setLoading(true);

    try {
      const mockPaymentId = `pay_sim_${Date.now()}`;
      const mockSignature = `sig_sim_${mockPaymentId}`;

      const verifyRes = await fetch('/api/checkout/razorpay/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: simulatedPaymentData.orderId,
          razorpayOrderId: simulatedPaymentData.gatewayOrderId,
          razorpayPaymentId: mockPaymentId,
          razorpaySignature: mockSignature,
        }),
      });

      const verifyData = await verifyRes.json();
      if (verifyRes.ok && verifyData.success) {
        clearCart();
        router.push(`/checkout/success?orderNumber=${simulatedPaymentData.orderNumber}`);
      } else {
        setErrorMessage('Verification failed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification error');
    } finally {
      setLoading(false);
      setSimulatedModalOpen(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Script tag for Razorpay checkout */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />

      <div className="flex items-center space-x-3 text-xs text-neutral-500">
        <Link href="/cart" className="hover:text-black flex items-center">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Return to Bag
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Customer & Delivery Information Form */}
        <div className="lg:col-span-7 space-y-6">
          <form id="checkout-form" onSubmit={handleOrderSubmit} className="space-y-6">
            {/* Contact Details */}
            <div className="bg-[#FAF7F2] border border-[#DDD4C5] p-6 sm:p-8 space-y-4 shadow-xs">
              <h2 className="font-serif text-xl text-neutral-900 border-b border-[#DDD4C5] pb-3">
                1. Contact & Customer Details
              </h2>

              {!user && (
                <div className="p-3 bg-white border border-[#DDD4C5] text-xs text-neutral-700 flex justify-between items-center shadow-2xs">
                  <span>Already an Atelier account holder?</span>
                  <Link href="/account/login?redirect=/checkout" className="font-semibold text-black underline">
                    Sign In
                  </Link>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-[#DDD4C5] px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-black shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
                    Mobile Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    name="phone"
                    placeholder="+91 98000 00000"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-[#DDD4C5] px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-black shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
                  Email Address (For Invoicing & Dispatch Alerts) *
                </label>
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-[#DDD4C5] px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-black shadow-2xs"
                />
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-[#FAF7F2] border border-[#DDD4C5] p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex justify-between items-end border-b border-[#DDD4C5] pb-3">
                <h2 className="font-serif text-xl text-neutral-900">
                  2. Delivery Address
                </h2>
                {savedAddresses.length > 0 && (
                  <span className="text-xs text-neutral-500 font-medium">Pick from saved address</span>
                )}
              </div>

              {savedAddresses.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {savedAddresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => handleSelectAddress(addr)}
                      className={`p-3 text-left border text-xs transition-colors shadow-2xs ${
                        formData.streetAddress === addr.streetAddress
                          ? 'border-black bg-white ring-2 ring-black font-semibold'
                          : 'border-[#DDD4C5] bg-white hover:border-black'
                      }`}
                    >
                      <p className="font-semibold text-black">{addr.fullName}</p>
                      <p className="text-neutral-600 truncate">{addr.streetAddress}, {addr.apartment}</p>
                      <p className="text-neutral-600">{addr.city}, {addr.postalCode}</p>
                    </button>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
                  Street Address / House / Building *
                </label>
                <input
                  type="text"
                  required
                  name="streetAddress"
                  placeholder="e.g. 42 Palm Avenue"
                  value={formData.streetAddress}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-[#DDD4C5] px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-black shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
                    Apartment / Suite / Floor (Optional)
                  </label>
                  <input
                    type="text"
                    name="apartment"
                    placeholder="e.g. Penthouse 7B"
                    value={formData.apartment}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-[#DDD4C5] px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-black shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-[#DDD4C5] px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-black shadow-2xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-[#DDD4C5] px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-black shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
                    Postal PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-[#DDD4C5] px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-black shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
                    Country
                  </label>
                  <input
                    type="text"
                    disabled
                    value="India"
                    className="w-full bg-[#EAE2D5] border border-[#DDD4C5] px-3.5 py-2.5 text-xs text-neutral-700 font-medium cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
                  Optional Delivery / Concierge Instructions
                </label>
                <textarea
                  name="deliveryNotes"
                  rows={2}
                  placeholder="e.g. Leave with building security concierge or call on arrival"
                  value={formData.deliveryNotes}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-[#DDD4C5] px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-black shadow-2xs"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-[#FAF7F2] border border-[#DDD4C5] p-6 sm:p-8 space-y-4 shadow-xs">
              <h2 className="font-serif text-xl text-neutral-900 border-b border-[#DDD4C5] pb-3">
                3. Payment Method
              </h2>

              <div className="space-y-3">
                {/* Razorpay Option */}
                <label
                  className={`flex items-start p-4 border cursor-pointer transition-colors shadow-2xs ${
                    paymentMethod === 'RAZORPAY'
                      ? 'border-black bg-white ring-2 ring-black font-semibold'
                      : 'border-[#DDD4C5] bg-white hover:border-black'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'RAZORPAY'}
                    onChange={() => setPaymentMethod('RAZORPAY')}
                    className="mt-0.5 mr-3 accent-black"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4 text-black" />
                      <span className="font-semibold text-xs text-neutral-900">
                        Online Payment (Razorpay: UPI, Cards, Netbanking)
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-600 font-normal">
                      Instant verification with zero transaction charges. 256-bit bank-grade encryption.
                    </p>
                  </div>
                </label>

                {/* Cash on Delivery Option */}
                <label
                  className={`flex items-start p-4 border cursor-pointer transition-colors shadow-2xs ${
                    paymentMethod === 'COD'
                      ? 'border-black bg-white ring-2 ring-black font-semibold'
                      : 'border-[#DDD4C5] bg-white hover:border-black'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="mt-0.5 mr-3 accent-black"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Banknote className="w-4 h-4 text-black" />
                      <span className="font-semibold text-xs text-neutral-900">
                        Cash on Delivery (Pay at Doorstep)
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-600 font-normal">
                      Pay cash or UPI upon handover by our luxury delivery courier.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-black text-white text-xs uppercase tracking-luxury font-semibold hover:bg-neutral-800 transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{loading ? 'Processing Order...' : `Place Order • ${formatPrice(total)}`}</span>
            </button>
          </form>
        </div>

        {/* Right: Order Snapshot Sidebar */}
        <div className="lg:col-span-5 bg-[#EFE9DF] border border-[#DDD4C5] p-6 sm:p-8 space-y-6 shadow-sm">
          <h2 className="font-serif text-xl text-neutral-900 border-b border-[#DDD4C5] pb-3">
            Order Review ({items.length} items)
          </h2>

          <div className="divide-y divide-[#DDD4C5] max-h-80 overflow-y-auto pr-2">
            {items.map((item) => (
              <div key={item.variantId} className="py-3 flex space-x-3 items-center">
                <div className="relative w-14 h-18 bg-[#F5F1EB] shrink-0 overflow-hidden">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="grow text-xs">
                  <p className="font-medium text-neutral-900 line-clamp-1">{item.name}</p>
                  <p className="text-[11px] text-neutral-500">{item.size} • {item.color} • Qty {item.quantity}</p>
                </div>
                <span className="text-xs font-semibold text-neutral-900 shrink-0">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-xs text-neutral-700 pt-4 border-t border-[#DDD4C5]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-black">{formatPrice(subtotal)}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-emerald-700">
                <span>Promotional Discount ({appliedCoupon.code})</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>{shippingFee === 0 ? <strong className="text-black font-semibold">Complimentary</strong> : formatPrice(shippingFee)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold text-neutral-900 pt-3 border-t border-[#DDD4C5]">
              <span>Final Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <div className="p-3 bg-white border border-[#DDD4C5] shadow-2xs space-y-1">
            <div className="flex items-center space-x-1.5 text-xs text-neutral-900 font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#8C6D4A]" />
              <span>Atelier Guarantee</span>
            </div>
            <p className="text-[11px] text-neutral-600 font-normal leading-relaxed">
              Orders are packaged in moisture-sealed protective luxury boxes and insured in full until signed for.
            </p>
          </div>
        </div>
      </div>

      {/* Simulated Razorpay Modal (fallback if testing without live keys) */}
      {simulatedModalOpen && simulatedPaymentData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={() => setSimulatedModalOpen(false)} />
          <div className="relative bg-white max-w-md w-full p-6 shadow-2xl z-10 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-2 border-b pb-3">
              <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-serif text-sm font-bold">
                ATL
              </div>
              <div>
                <h3 className="font-semibold text-sm">Razorpay Secure Sandbox</h3>
                <p className="text-[11px] text-neutral-500">Order: {simulatedPaymentData.orderNumber}</p>
              </div>
            </div>

            <div className="space-y-3 bg-[#FAF8F5] p-4 rounded-xs text-xs text-neutral-700">
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-bold text-sm text-black">{formatPrice(simulatedPaymentData.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Mode:</span>
                <span>Razorpay Gateway (Simulated)</span>
              </div>
              <p className="text-[11px] text-neutral-500 pt-2 border-t border-neutral-200">
                This modal verifies your payment gateway integration end-to-end, testing signature generation, database transaction status updates, and order confirmation.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setSimulatedModalOpen(false)}
                className="w-1/2 py-2.5 border border-neutral-300 text-xs uppercase tracking-wider font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleCompleteSimulatedPayment}
                className="w-1/2 py-2.5 bg-black text-white text-xs uppercase tracking-wider font-semibold hover:bg-neutral-800 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Authorize Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
