'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { adminLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await adminLogin(email, password);
    setLoading(false);

    if (res.success) {
      router.push('/admin/dashboard');
    } else {
      setError(res.error || 'Administrator verification failed.');
    }
  };

  const handleFillDemoAdmin = () => {
    setEmail('admin@atelier.com');
    setPassword('admin123456');
  };

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-800 border border-neutral-700 mx-auto">
          <ShieldCheck className="w-6 h-6 text-[#CBB499]" />
        </div>
        <h1 className="font-serif text-3xl tracking-wider uppercase font-light text-white">
          ATELIER ÉLITE
        </h1>
        <p className="text-xs uppercase tracking-[0.25em] text-[#CBB499] font-medium">
          Shop Owner & Executive Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#1A1A1A] py-8 px-6 sm:px-10 border border-[#2E2E2E] shadow-2xl space-y-6">
          {/* Demo Admin Auto-fill Card */}
          <div className="p-3 bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 flex justify-between items-center">
            <div>
              <p className="font-semibold text-white">Default Store Owner Account:</p>
              <p className="text-[11px] text-neutral-400">admin@atelier.com / admin123456</p>
            </div>
            <button
              type="button"
              onClick={handleFillDemoAdmin}
              className="px-2.5 py-1 bg-[#CBB499] text-black font-semibold uppercase tracking-wider text-[10px] hover:bg-white transition-colors"
            >
              Fill Credentials
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-950/60 border border-red-800 text-xs text-red-200 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
                <input
                  type="email"
                  required
                  placeholder="admin@atelier.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#121212] border border-[#333333] pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#CBB499]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                Security Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#121212] border border-[#333333] pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#CBB499]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#CBB499] text-black text-xs uppercase tracking-luxury font-bold hover:bg-white transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? 'Authenticating Owner...' : 'Access Dashboard'}
            </button>
          </form>

          <div className="pt-4 border-t border-[#2A2A2A] text-center">
            <Link
              href="/"
              className="inline-flex items-center text-xs text-neutral-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Return to Customer Storefront
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
