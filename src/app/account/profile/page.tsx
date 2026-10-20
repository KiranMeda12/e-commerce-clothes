'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { User, Lock, MapPin, Plus, Check, AlertCircle } from 'lucide-react';

export default function CustomerProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Addresses
  const [addresses, setAddresses] = useState<any[]>([]);
  const [newAddressModal, setNewAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    streetAddress: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
    isDefault: false,
  });
  const [addressLoading, setAddressLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/account/login?redirect=/account/profile');
      return;
    }
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
      loadAddresses();
    }
  }, [user, authLoading, router]);

  const loadAddresses = async () => {
    try {
      const res = await fetch('/api/customer/addresses');
      if (res.ok) {
        const d = await res.json();
        setAddresses(d.addresses || []);
      }
    } catch {}
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage(null);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();
      setProfileLoading(false);

      if (res.ok) {
        setProfileMessage({ type: 'success', text: 'Profile successfully updated.' });
        setCurrentPassword('');
        setNewPassword('');
        refreshUser();
      } else {
        setProfileMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch {
      setProfileLoading(false);
      setProfileMessage({ type: 'error', text: 'Network error updating profile' });
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressLoading(true);

    try {
      const res = await fetch('/api/customer/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressForm),
      });

      const data = await res.json();
      setAddressLoading(false);

      if (res.ok) {
        setNewAddressModal(false);
        setAddressForm({
          fullName: '',
          phone: '',
          streetAddress: '',
          apartment: '',
          city: '',
          state: '',
          postalCode: '',
          isDefault: false,
        });
        loadAddresses();
      } else {
        alert(data.error || 'Failed to save address');
      }
    } catch {
      setAddressLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-xs text-neutral-500">
        Loading client profile...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      {/* Account Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-[#ECE7DF] gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-[#957856] font-semibold">
            Client Account
          </span>
          <h1 className="font-serif text-3xl text-neutral-900 tracking-tight mt-1">
            Profile & Address Book
          </h1>
          <p className="text-xs text-neutral-500 font-light mt-1">
            Manage your personal contact details, security credentials, and preferred dispatch addresses.
          </p>
        </div>

        <div className="flex space-x-4 text-xs font-medium">
          <Link href="/account/orders" className="text-neutral-500 hover:text-black pb-1">
            Orders
          </Link>
          <Link href="/account/profile" className="text-black border-b-2 border-black pb-1">
            Profile & Addresses
          </Link>
        </div>
      </div>

      {profileMessage && (
        <div
          className={`p-3 text-xs flex items-center justify-between border ${
            profileMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <span>{profileMessage.text}</span>
          <button
            type="button"
            onClick={() => setProfileMessage(null)}
            className="text-xs underline ml-4 font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Personal Details & Password */}
        <div className="space-y-6">
          <h2 className="font-serif text-xl text-neutral-900 border-b pb-3">
            Personal Information
          </h2>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-[#DFD1BF] px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                Email Address (Permanent Identifier)
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full bg-[#FAF8F5] border border-[#DFD1BF] px-3.5 py-2.5 text-xs text-neutral-500"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                Mobile Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98000 00000"
                className="w-full bg-white border border-[#DFD1BF] px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-black"
              />
            </div>

            <div className="pt-4 border-t border-neutral-100 space-y-3">
              <span className="text-[11px] uppercase tracking-wider text-black font-semibold block">
                Update Password (Optional)
              </span>

              <div>
                <label className="block text-[11px] text-neutral-500 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-[#DFD1BF] px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutral-500 mb-1">
                  New Password (Min 6 Characters)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-[#DFD1BF] px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="w-full py-3 bg-black text-white text-xs uppercase tracking-luxury font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              {profileLoading ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Saved Addresses Book */}
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b pb-3">
            <h2 className="font-serif text-xl text-neutral-900">
              Saved Addresses
            </h2>
            <button
              type="button"
              onClick={() => setNewAddressModal(true)}
              className="inline-flex items-center space-x-1 text-xs text-[#957856] font-semibold hover:text-black"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Address</span>
            </button>
          </div>

          <div className="space-y-3">
            {addresses.length === 0 ? (
              <p className="text-xs text-neutral-500 italic py-6">
                No delivery addresses saved yet. Add an address for seamless 1-click checkout.
              </p>
            ) : (
              addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="p-4 bg-[#FAF8F5] border border-[#ECE7DF] relative text-xs text-neutral-700 space-y-1"
                >
                  {addr.isDefault && (
                    <span className="absolute top-3 right-3 text-[10px] bg-black text-white px-2 py-0.5 uppercase tracking-wider font-semibold">
                      Default
                    </span>
                  )}
                  <p className="font-semibold text-black">{addr.fullName}</p>
                  <p>{addr.streetAddress}</p>
                  {addr.apartment && <p>{addr.apartment}</p>}
                  <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                  <p className="text-neutral-500">Phone: {addr.phone}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* New Address Modal */}
      {newAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={() => setNewAddressModal(false)} />
          <div className="relative bg-white max-w-md w-full p-6 shadow-2xl z-10 space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="font-serif text-xl text-neutral-900 border-b pb-2">
              Add New Delivery Address
            </h3>

            <form onSubmit={handleSaveAddress} className="space-y-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                  Recipient Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.fullName}
                  onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                  className="w-full border border-[#DFD1BF] px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                  Contact Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  className="w-full border border-[#DFD1BF] px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.streetAddress}
                  onChange={(e) => setAddressForm({ ...addressForm, streetAddress: e.target.value })}
                  className="w-full border border-[#DFD1BF] px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                    Apartment / Suite
                  </label>
                  <input
                    type="text"
                    value={addressForm.apartment}
                    onChange={(e) => setAddressForm({ ...addressForm, apartment: e.target.value })}
                    className="w-full border border-[#DFD1BF] px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full border border-[#DFD1BF] px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full border border-[#DFD1BF] px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                    Postal PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                    className="w-full border border-[#DFD1BF] px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="def-check"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="accent-black"
                />
                <label htmlFor="def-check" className="text-xs text-neutral-700">
                  Set as primary default delivery address
                </label>
              </div>

              <div className="pt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setNewAddressModal(false)}
                  className="w-1/2 py-2.5 border border-neutral-300 text-xs uppercase tracking-wider font-medium text-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addressLoading}
                  className="w-1/2 py-2.5 bg-black text-white text-xs uppercase tracking-wider font-semibold hover:bg-neutral-800 disabled:opacity-50"
                >
                  {addressLoading ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
