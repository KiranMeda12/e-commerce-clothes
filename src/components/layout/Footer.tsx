'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // If in admin dashboard, we don't render customer footer
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    return null;
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#121212] text-[#FAF8F5] pt-16 pb-12 border-t border-[#222222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-16 border-b border-[#2A2A2A]">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="inline-block">
              <span className="font-serif text-2xl tracking-widest uppercase text-white">
                ATELIER ÉLITE
              </span>
              <p className="text-[10px] tracking-[0.3em] text-[#CBB499] uppercase mt-0.5">
                Modern Craftsmanship & Timeless Silhouettes
              </p>
            </Link>
            <p className="text-neutral-400 text-xs leading-relaxed max-w-sm font-light">
              Founded on the principles of architectural restraint, pure natural textiles, and unhurried craftsmanship. Every garment is cut to endure across seasons.
            </p>

            {/* Newsletter */}
            <div className="pt-2">
              <p className="text-xs uppercase tracking-widest text-neutral-300 mb-3 font-medium">
                The Atelier Gazette
              </p>
              {subscribed ? (
                <div className="flex items-center text-xs text-[#CBB499] space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#CBB499]" />
                  <span>Welcome to our private circle. Check your inbox shortly.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex max-w-sm">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email for private collection previews..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-[#1A1A1A] border border-[#333333] text-white px-3 py-2 text-xs focus:outline-none focus:border-[#CBB499] grow placeholder:text-neutral-600"
                  />
                  <button
                    type="submit"
                    className="bg-white text-black px-4 py-2 text-xs uppercase tracking-widest font-semibold hover:bg-[#EAE1D5] transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Collections */}
          <div>
            <h4 className="text-xs uppercase tracking-luxury text-[#CBB499] font-medium mb-4">
              Collections
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400 font-light">
              <li>
                <Link href="/shop?collection=atelier-minimalist-2026" className="hover:text-white transition-colors">
                  Minimalist Capsule 2026
                </Link>
              </li>
              <li>
                <Link href="/shop?collection=summer-linen-capsule" className="hover:text-white transition-colors">
                  Summer Linen Edit
                </Link>
              </li>
              <li>
                <Link href="/shop?collection=tailored-silhouettes" className="hover:text-white transition-colors">
                  Tailored Silhouettes
                </Link>
              </li>
              <li>
                <Link href="/shop?newArrival=true" className="hover:text-white transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/shop?bestSeller=true" className="hover:text-white transition-colors">
                  Iconic Best Sellers
                </Link>
              </li>
            </ul>
          </div>

          {/* Client Concierge */}
          <div>
            <h4 className="text-xs uppercase tracking-luxury text-[#CBB499] font-medium mb-4">
              Client Concierge
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400 font-light">
              <li>
                <Link href="/account/orders" className="hover:text-white transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/pages/size-guide" className="hover:text-white transition-colors">
                  Size & Fit Guide
                </Link>
              </li>
              <li>
                <Link href="/pages/shipping-returns" className="hover:text-white transition-colors">
                  Shipping & Complimentary Returns
                </Link>
              </li>
              <li>
                <Link href="/pages/garment-care" className="hover:text-white transition-colors">
                  Garment & Cashmere Care
                </Link>
              </li>
              <li>
                <Link href="/pages/contact" className="hover:text-white transition-colors">
                  Contact Private Concierge
                </Link>
              </li>
            </ul>
          </div>

          {/* Boutiques & Governance */}
          <div>
            <h4 className="text-xs uppercase tracking-luxury text-[#CBB499] font-medium mb-4">
              Maison & Trust
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400 font-light">
              <li>
                <Link href="/pages/about" className="hover:text-white transition-colors">
                  Artisanal Heritage
                </Link>
              </li>
              <li>
                <Link href="/pages/sustainability" className="hover:text-white transition-colors">
                  Sustainable Sourcing
                </Link>
              </li>
              <li>
                <Link href="/pages/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/pages/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li className="pt-2">
                <Link
                  href="/admin/login"
                  className="inline-flex items-center text-[11px] text-amber-500/80 hover:text-amber-400 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  Shop Owner Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Payment Trust Badges & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-neutral-500 space-y-4 md:space-y-0 font-light">
          <div>
            © {new Date().getFullYear()} ATELIER ÉLITE BOUTIQUE. All rights reserved.
          </div>

          <div className="flex items-center space-x-4 text-[11px] text-neutral-400">
            <span>Verified 256-bit SSL</span>
            <span>•</span>
            <span>Razorpay Secure</span>
            <span>•</span>
            <span>Cash on Delivery</span>
            <span>•</span>
            <span>Worldwide Insured Courier</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
