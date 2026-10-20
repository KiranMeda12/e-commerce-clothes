'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      <div className="text-center space-y-2 pb-6 border-b border-[#ECE7DF]">
        <span className="text-[10px] uppercase tracking-luxury text-[#957856] font-semibold">
          Private Concierge
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-neutral-900 tracking-tight">
          Client Services & Inquiries
        </h1>
        <p className="text-xs text-neutral-500 font-light">
          We invite private consultations, bespoke fitting appointments, and garment care requests.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-5 space-y-6 text-xs text-neutral-600 font-light">
          <div className="space-y-1">
            <h3 className="font-serif text-lg text-black font-normal">Flagship Atelier</h3>
            <p className="flex items-start">
              <MapPin className="w-4 h-4 mr-2 text-[#957856] shrink-0 mt-0.5" />
              <span>42 Palm Boulevard, Penthouse Suite 7B, Bandra West, Mumbai, Maharashtra 400050, India</span>
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="font-serif text-lg text-black font-normal">Direct Contact</h3>
            <p className="flex items-center">
              <Mail className="w-4 h-4 mr-2 text-[#957856] shrink-0" />
              <span>concierge@atelier-elite.com</span>
            </p>
            <p className="flex items-center">
              <Phone className="w-4 h-4 mr-2 text-[#957856] shrink-0" />
              <span>+91 (0) 22 4987 6500</span>
            </p>
          </div>

          <div className="p-4 bg-[#FAF8F5] border border-[#ECE7DF] space-y-1">
            <p className="font-semibold text-black uppercase tracking-wider text-[11px]">Private Consultation Hours</p>
            <p>Monday — Saturday: 10:00 AM – 7:00 PM IST</p>
            <p>Sunday: By appointment only</p>
          </div>
        </div>

        <div className="md:col-span-7 bg-[#FAF8F5] p-6 sm:p-8 border border-[#ECE7DF]">
          {submitted ? (
            <div className="text-center py-12 space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto" />
              <h3 className="font-serif text-xl text-black">Message Received</h3>
              <p className="text-xs text-neutral-600 font-light max-w-sm mx-auto">
                Thank you for contacting Atelier Élite. A client concierge will review your message and reply within 12 business hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-white border border-[#DFD1BF] p-2.5 text-xs focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-white border border-[#DFD1BF] p-2.5 text-xs focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="e.g. Inquiring regarding cashmere overcoat sizing"
                  className="w-full bg-white border border-[#DFD1BF] p-2.5 text-xs focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                  Message *
                </label>
                <textarea
                  rows={4}
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-white border border-[#DFD1BF] p-2.5 text-xs focus:outline-none focus:border-black"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-black text-white text-xs uppercase tracking-luxury font-semibold hover:bg-neutral-800 transition-colors"
              >
                Send Inquiry to Concierge
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
