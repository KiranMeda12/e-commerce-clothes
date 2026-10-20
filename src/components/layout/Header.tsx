'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, User, Search, Menu, X, ShieldCheck, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, logout } = useAuth();
  const { itemCount, openCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setAccountMenuOpen(false);
  }, [pathname]);

  // Scroll detection for sticky header shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  // If in admin dashboard, we don't render the customer header
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    return null;
  }

  const navLinks = [
    { label: 'New Arrivals', href: '/shop?newArrival=true' },
    { label: 'Collections', href: '/collections' },
    { label: 'Women', href: '/shop?category=women' },
    { label: 'Men', href: '/shop?category=men' },
    { label: 'Accessories', href: '/shop?category=accessories' },
    { label: 'All Pieces', href: '/shop' },
  ];

  return (
    <>
      {/* Top Luxury Announcement Bar */}
      <div className="bg-[#121212] text-[#EAE1D5] py-2 px-4 text-center text-xs tracking-widest uppercase font-light border-b border-[#2A2A2A]">
        COMPLIMENTARY WHITE-GLOVE DELIVERY ON ORDERS OVER ₹2,999 • USE CODE <span className="font-semibold text-white">WELCOME10</span>
      </div>

      {/* Main Sticky Navigation Bar */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-[#ECE7DF]' : 'bg-white border-b border-[#ECE7DF]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile Hamburger Button */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 -ml-2 text-neutral-800 hover:text-black focus:outline-none"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" strokeWidth={1.5} />
              </button>
            </div>

            {/* Desktop Navigation Links Left */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navLinks.slice(0, 3).map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-xs tracking-luxury uppercase transition-colors hover:text-black ${
                    pathname === link.href ? 'text-black font-semibold' : 'text-neutral-600'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Brand Logo Center */}
            <div className="flex justify-center text-center">
              <Link href="/" className="group flex flex-col items-center">
                <span className="font-serif text-2xl sm:text-3xl tracking-widest text-[#121212] uppercase font-normal">
                  ATELIER ÉLITE
                </span>
                <span className="text-[9px] tracking-[0.3em] text-[#957856] uppercase mt-0.5 font-medium">
                  Haute Couture & Essentials
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links Right + Action Icons */}
            <div className="flex items-center space-x-6">
              <nav className="hidden lg:flex items-center space-x-8 mr-4">
                {navLinks.slice(3).map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`text-xs tracking-luxury uppercase transition-colors hover:text-black ${
                      pathname === link.href ? 'text-black font-semibold' : 'text-neutral-600'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Search Toggle Icon */}
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-neutral-700 hover:text-black transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" strokeWidth={1.5} />
              </button>

              {/* Customer Account Dropdown */}
              <div className="relative">
                {user ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                      className="flex items-center space-x-1.5 p-2 text-neutral-800 hover:text-black transition-colors text-xs font-medium"
                    >
                      <User className="w-5 h-5" strokeWidth={1.5} />
                      <span className="hidden md:inline max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                    </button>

                    {accountMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white border border-[#ECE7DF] shadow-xl py-2 z-50 rounded-sm">
                        <div className="px-4 py-2 border-b border-neutral-100">
                          <p className="text-xs text-neutral-400 uppercase tracking-wider">Signed in as</p>
                          <p className="text-sm font-medium text-neutral-900 truncate">{user.name}</p>
                          <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                        </div>

                        {isAdmin && (
                          <Link
                            href="/admin/dashboard"
                            className="flex items-center px-4 py-2.5 text-xs text-amber-900 bg-amber-50/60 hover:bg-amber-100/80 font-medium tracking-wide"
                          >
                            <ShieldCheck className="w-4 h-4 mr-2 text-amber-700" />
                            Owner Dashboard
                          </Link>
                        )}

                        <Link
                          href="/account/orders"
                          className="block px-4 py-2 text-xs text-neutral-700 hover:bg-[#FAF8F5] tracking-wide"
                        >
                          My Orders & Tracking
                        </Link>
                        <Link
                          href="/account/profile"
                          className="block px-4 py-2 text-xs text-neutral-700 hover:bg-[#FAF8F5] tracking-wide"
                        >
                          Account Profile & Addresses
                        </Link>
                        <button
                          type="button"
                          onClick={logout}
                          className="w-full text-left flex items-center px-4 py-2 text-xs text-red-600 hover:bg-red-50 tracking-wide border-t border-neutral-100 mt-1"
                        >
                          <LogOut className="w-3.5 h-3.5 mr-2" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/account/login"
                    className="p-2 text-neutral-700 hover:text-black transition-colors"
                    aria-label="Account Login"
                  >
                    <User className="w-5 h-5" strokeWidth={1.5} />
                  </Link>
                )}
              </div>

              {/* Shopping Bag Button with Counter Badge */}
              <button
                type="button"
                onClick={openCart}
                className="relative p-2 text-neutral-800 hover:text-black transition-colors"
                aria-label="View Shopping Bag"
              >
                <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-black rounded-full ring-2 ring-white">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar Drawer (Slide Down) */}
        {searchOpen && (
          <div className="bg-[#FAF8F5] border-t border-b border-[#EAE1D5] px-4 py-4 transition-all">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search className="w-5 h-5 absolute left-3 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search cashmere coats, silk dresses, linen shirts, or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-white pl-11 pr-24 py-3 border border-[#DFD1BF] text-sm text-neutral-900 focus:outline-none focus:border-black tracking-wide placeholder:text-neutral-400"
                />
                <button
                  type="submit"
                  className="absolute right-2 px-4 py-1.5 bg-black text-white text-xs uppercase tracking-widest hover:bg-neutral-800"
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between py-6 px-6 z-10">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#ECE7DF]">
                <span className="font-serif text-lg tracking-widest uppercase">ATELIER ÉLITE</span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-neutral-500 hover:text-black"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="py-6 space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block text-sm tracking-luxury uppercase text-neutral-800 hover:text-black py-1 font-light"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-[#ECE7DF] space-y-3">
              {user ? (
                <>
                  <p className="text-xs text-neutral-500">Signed in as <span className="font-semibold text-black">{user.name}</span></p>
                  <Link
                    href="/account/orders"
                    className="block text-xs uppercase tracking-widest text-neutral-800 py-1"
                  >
                    My Orders
                  </Link>
                  <Link
                    href="/account/profile"
                    className="block text-xs uppercase tracking-widest text-neutral-800 py-1"
                  >
                    Profile & Addresses
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin/dashboard"
                      className="block text-xs uppercase tracking-widest text-amber-800 font-semibold py-1"
                    >
                      Owner Dashboard →
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={logout}
                    className="text-xs uppercase tracking-widest text-red-600 py-1 block w-full text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link
                    href="/account/login"
                    className="w-full text-center py-2.5 bg-black text-white text-xs uppercase tracking-widest font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/account/register"
                    className="w-full text-center py-2.5 border border-black text-black text-xs uppercase tracking-widest font-medium"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
