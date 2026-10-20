'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/account/orders';
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      router.push(redirectUrl);
    } else {
      setError(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleDemoCustomer = () => {
    setEmail('customer@example.com');
    setPassword('customer123456');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-[10px] uppercase tracking-luxury text-[#957856] font-semibold">
          Client Portal
        </span>
        <h1 className="font-serif text-3xl text-neutral-900 tracking-tight">
          Sign In
        </h1>
        <p className="text-xs text-neutral-500 font-light">
          Access your private client history, order tracking, and saved preferences.
        </p>
      </div>

      {/* Demo Credentials Helper Pill */}
      <div className="p-3 bg-[#FAF8F5] border border-[#EAE1D5] text-xs text-neutral-700 flex justify-between items-center">
        <div>
          <span className="font-medium text-black">Demo Account:</span>
          <p className="text-[11px] text-neutral-500">customer@example.com / customer123456</p>
        </div>
        <button
          type="button"
          onClick={handleDemoCustomer}
          className="text-xs font-semibold text-[#957856] underline hover:text-black"
        >
          Auto-Fill
        </button>
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
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
            <input
              type="email"
              required
              placeholder="e.g. eleanor@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-[#DFD1BF] pl-10 pr-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-black"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-[11px] uppercase tracking-wider text-neutral-600">
              Password
            </label>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-[#DFD1BF] pl-10 pr-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-black"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-black text-white text-xs uppercase tracking-luxury font-semibold hover:bg-neutral-800 transition-colors shadow-md disabled:opacity-50"
        >
          {loading ? 'Authenticating...' : 'Sign In To Atelier'}
        </button>
      </form>

      <div className="pt-4 border-t border-[#ECE7DF] text-center space-y-3">
        <p className="text-xs text-neutral-500">
          New to Atelier Élite?{' '}
          <Link
            href={`/account/register?redirect=${encodeURIComponent(redirectUrl)}`}
            className="font-semibold text-black underline hover:text-[#957856]"
          >
            Create an Account
          </Link>
        </p>

        <p className="text-[11px] text-neutral-400">
          Store administrator?{' '}
          <Link href="/admin/login" className="text-amber-800 underline font-medium">
            Owner Portal Login →
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs">Loading login...</div>}>
      <LoginContent />
    </Suspense>
  );
}
