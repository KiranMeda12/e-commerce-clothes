'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, User, Phone, AlertCircle } from 'lucide-react';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/account/orders';
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const res = await register(
      formData.name,
      formData.email,
      formData.password,
      formData.phone
    );
    setLoading(false);

    if (res.success) {
      router.push(redirectUrl);
    } else {
      setError(res.error || 'Failed to create account');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-20 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-[10px] uppercase tracking-luxury text-[#957856] font-semibold">
          Privileged Access
        </span>
        <h1 className="font-serif text-3xl text-neutral-900 tracking-tight">
          Create Account
        </h1>
        <p className="text-xs text-neutral-500 font-light">
          Register to enjoy private collection previews, order history, and tailored concierge support.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
            Full Name *
          </label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
            <input
              type="text"
              required
              name="name"
              placeholder="e.g. Eleanor Vance"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-white border border-[#DFD1BF] pl-10 pr-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-black"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
            <input
              type="email"
              required
              name="email"
              placeholder="e.g. eleanor@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-white border border-[#DFD1BF] pl-10 pr-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-black"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
            Phone Number (Optional)
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
            <input
              type="tel"
              name="phone"
              placeholder="+91 98000 00000"
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-white border border-[#DFD1BF] pl-10 pr-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-black"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
            Password (Min 6 Characters) *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
            <input
              type="password"
              required
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-white border border-[#DFD1BF] pl-10 pr-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-black"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
            Confirm Password *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
            <input
              type="password"
              required
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full bg-white border border-[#DFD1BF] pl-10 pr-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-black"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-black text-white text-xs uppercase tracking-luxury font-semibold hover:bg-neutral-800 transition-colors shadow-md disabled:opacity-50"
        >
          {loading ? 'Creating Client Profile...' : 'Complete Registration'}
        </button>
      </form>

      <div className="pt-4 border-t border-[#ECE7DF] text-center text-xs text-neutral-500">
        Already registered with Atelier?{' '}
        <Link
          href={`/account/login?redirect=${encodeURIComponent(redirectUrl)}`}
          className="font-semibold text-black underline hover:text-[#957856]"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs">Loading registration...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
