'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  FolderTree,
  Users,
  Tag,
  Settings,
  ExternalLink,
  LogOut,
  ShieldAlert,
  Menu,
  X,
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, loading, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // If on admin login page, bypass layout shell
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.push('/admin/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center text-xs text-[#CBB499] uppercase tracking-luxury">
        Verifying Executive Security Credentials...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center text-white px-4 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-500" />
        <h1 className="font-serif text-2xl">Access Denied</h1>
        <p className="text-xs text-neutral-400 max-w-sm">
          This area is restricted to authorized boutique administrators only. Customer privilege escalation attempts are strictly blocked and logged.
        </p>
        <Link
          href="/admin/login"
          className="px-6 py-2.5 bg-[#CBB499] text-black text-xs uppercase tracking-luxury font-bold"
        >
          Sign In as Owner
        </Link>
      </div>
    );
  }

  const navItems = [
    { label: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Orders Management', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Products & Variants', href: '/admin/products', icon: Layers },
    { label: 'Collections & Categories', href: '/admin/collections', icon: FolderTree },
    { label: 'Customer Directory', href: '/admin/customers', icon: Users },
    { label: 'Promotions & Coupons', href: '/admin/coupons', icon: Tag },
    { label: 'Store Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col lg:flex-row">
      {/* Mobile Header Bar */}
      <div className="lg:hidden bg-[#121212] text-white px-4 py-3.5 flex items-center justify-between border-b border-neutral-800">
        <div>
          <span className="font-serif text-base tracking-widest uppercase">ATELIER ÉLITE</span>
          <span className="text-[9px] text-[#CBB499] block tracking-widest uppercase -mt-1">Executive Console</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-1.5 text-neutral-300 hover:text-white"
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Admin Sidebar Navigation */}
      <aside
        className={`${
          mobileNavOpen ? 'block' : 'hidden'
        } lg:block lg:w-64 bg-[#121212] text-neutral-300 shrink-0 border-r border-neutral-800 flex flex-col justify-between h-auto lg:h-screen lg:sticky lg:top-0 z-30`}
      >
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-neutral-800/80">
            <Link href="/admin/dashboard" className="block">
              <span className="font-serif text-lg tracking-widest text-white uppercase font-normal block">
                ATELIER ÉLITE
              </span>
              <span className="text-[9px] tracking-[0.3em] text-[#CBB499] uppercase block mt-0.5">
                Executive Owner Portal
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xs text-xs font-medium tracking-wide transition-colors ${
                    isActive
                      ? 'bg-neutral-800 text-[#EAE1D5] border-l-2 border-[#CBB499]'
                      : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile & Storefront Link */}
        <div className="p-4 border-t border-neutral-800 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
          >
            <span>View Customer Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="px-3 py-2 border-t border-neutral-800/60 flex items-center justify-between">
            <div className="truncate max-w-[140px]">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-neutral-400 truncate">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="p-1.5 text-neutral-400 hover:text-red-400 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Body */}
      <main className="grow overflow-x-hidden p-6 sm:p-8 lg:p-10">
        {children}
      </main>
    </div>
  );
}
