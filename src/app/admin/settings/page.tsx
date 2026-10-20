'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, Check, RefreshCw } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({
    store_name: 'ATELIER ÉLITE',
    store_tagline: 'High Craftsmanship & Minimalist Luxury',
    support_email: 'concierge@atelier-elite.com',
    support_phone: '+91 (0) 22 4987 6500',
    currency: 'INR',
    free_shipping_threshold: '2999',
    standard_shipping_rate: '199',
    announcement_bar: 'COMPLIMENTARY WHITE-GLOVE DELIVERY ON ALL ORDERS ABOVE ₹2,999 • USE CODE WELCOME10',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const d = await res.json();
        if (d.settings) {
          setSettings((prev) => ({ ...prev, ...d.settings }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      setSaving(false);
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2000);
      } else {
        alert('Failed to save settings');
      }
    } catch {
      setSaving(false);
      alert('Error updating settings');
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#ECE7DF] gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-[#957856] font-semibold">
            Storefront Configuration
          </span>
          <h1 className="font-serif text-3xl text-neutral-900 tracking-tight mt-1">
            Maison & Shipping Settings
          </h1>
          <p className="text-xs text-neutral-500 font-light mt-0.5">
            Configure store identity, free shipping qualification thresholds, and customer announcement bars.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 border border-emerald-200">
            <Check className="w-3.5 h-3.5 mr-1" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Boutique Identity */}
        <div className="bg-white p-6 border border-[#ECE7DF] space-y-4">
          <h2 className="font-serif text-lg text-neutral-900 border-b pb-3 font-medium">
            Boutique Identity & Contacts
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                Storefront Name
              </label>
              <input
                type="text"
                value={settings.store_name}
                onChange={(e) => handleChange('store_name', e.target.value)}
                className="w-full border border-[#DFD1BF] p-2.5 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                Store Motto / Subtitle
              </label>
              <input
                type="text"
                value={settings.store_tagline}
                onChange={(e) => handleChange('store_tagline', e.target.value)}
                className="w-full border border-[#DFD1BF] p-2.5 text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                Concierge Support Email
              </label>
              <input
                type="email"
                value={settings.support_email}
                onChange={(e) => handleChange('support_email', e.target.value)}
                className="w-full border border-[#DFD1BF] p-2.5 text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                Concierge Contact Phone
              </label>
              <input
                type="text"
                value={settings.support_phone}
                onChange={(e) => handleChange('support_phone', e.target.value)}
                className="w-full border border-[#DFD1BF] p-2.5 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Shipping Charges & Thresholds */}
        <div className="bg-white p-6 border border-[#ECE7DF] space-y-4">
          <h2 className="font-serif text-lg text-neutral-900 border-b pb-3 font-medium">
            White-Glove Shipping & Fulfillment Rates
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                Complimentary Shipping Threshold (₹)
              </label>
              <input
                type="number"
                value={settings.free_shipping_threshold}
                onChange={(e) => handleChange('free_shipping_threshold', e.target.value)}
                className="w-full border border-[#DFD1BF] p-2.5 text-xs font-semibold"
              />
              <p className="text-[10px] text-neutral-400 mt-1">Orders above this value receive free shipping</p>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                Standard Shipping Fee (₹)
              </label>
              <input
                type="number"
                value={settings.standard_shipping_rate}
                onChange={(e) => handleChange('standard_shipping_rate', e.target.value)}
                className="w-full border border-[#DFD1BF] p-2.5 text-xs font-semibold"
              />
              <p className="text-[10px] text-neutral-400 mt-1">Applied when cart total is below threshold</p>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                Base Currency Code
              </label>
              <input
                type="text"
                value={settings.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full border border-[#DFD1BF] p-2.5 text-xs uppercase font-mono"
              />
            </div>
          </div>
        </div>

        {/* Announcement Bar */}
        <div className="bg-white p-6 border border-[#ECE7DF] space-y-4">
          <h2 className="font-serif text-lg text-neutral-900 border-b pb-3 font-medium">
            Storefront Announcement Bar
          </h2>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
              Top Header Announcement Text
            </label>
            <input
              type="text"
              value={settings.announcement_bar}
              onChange={(e) => handleChange('announcement_bar', e.target.value)}
              className="w-full border border-[#DFD1BF] p-2.5 text-xs font-medium"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3.5 bg-black text-white text-xs uppercase tracking-luxury font-semibold hover:bg-neutral-800 transition-colors shadow-md disabled:opacity-50 flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Settings...' : 'Save Maison Settings'}</span>
        </button>
      </form>
    </div>
  );
}
