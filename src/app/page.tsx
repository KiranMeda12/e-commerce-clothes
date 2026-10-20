import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import ProductGridClient from '@/components/home/ProductGridClient';
import { ArrowRight, Sparkles, Shield, Truck, RefreshCw } from 'lucide-react';

export const revalidate = 0; // Dynamic server rendering for fresh inventory

export default async function HomePage() {
  // Fetch featured products
  const featuredProducts = await prisma.product.findMany({
    where: { status: 'PUBLISHED', isFeatured: true },
    take: 8,
    include: {
      images: { orderBy: { displayOrder: 'asc' } },
      variants: true,
      category: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Fetch new arrivals
  const newArrivals = await prisma.product.findMany({
    where: { status: 'PUBLISHED', isNewArrival: true },
    take: 4,
    include: {
      images: { orderBy: { displayOrder: 'asc' } },
      variants: true,
      category: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Fetch collections
  const collections = await prisma.collection.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' },
    take: 3,
  });

  // Fetch categories
  const categories = await prisma.category.findMany({
    take: 4,
  });

  return (
    <div className="space-y-20 sm:space-y-28 pb-20">
      {/* 1. HERO BANNER */}
      <section className="relative h-[85vh] sm:h-[90vh] w-full bg-[#121212] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=85&w=2000&auto=format&fit=crop"
          alt="Atelier Haute Couture Campaign"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-65 scale-100 hover:scale-102 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 sm:pb-24 z-10 text-white">
          <div className="max-w-2xl space-y-4">
            <span className="inline-block text-xs uppercase tracking-[0.3em] text-[#CBB499] font-medium">
              Spring / Summer 2026 Collection
            </span>
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.08] font-normal">
              Form In Restraint.
            </h1>
            <p className="text-neutral-300 text-sm sm:text-base font-light tracking-wide max-w-xl leading-relaxed">
              Uncompromising craftsmanship defined by fluid Mongolian cashmere, washed Italian linens, and tailored virgin wools.
            </p>

            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="px-8 py-3.5 bg-white text-black text-xs uppercase tracking-luxury font-semibold hover:bg-[#EAE1D5] transition-all transform hover:-translate-y-0.5 shadow-lg"
              >
                Shop The Edit
              </Link>
              <Link
                href="/collections"
                className="px-8 py-3.5 border border-white/80 text-white text-xs uppercase tracking-luxury font-semibold hover:bg-white/10 transition-all backdrop-blur-xs"
              >
                Explore Collections
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 py-8 border-y border-[#ECE7DF] text-center">
          <div className="flex flex-col items-center space-y-2">
            <Sparkles className="w-5 h-5 text-[#957856] stroke-[1.5]" />
            <h3 className="text-xs uppercase tracking-luxury font-medium text-neutral-900">100% Pure Textiles</h3>
            <p className="text-[11px] text-neutral-500 font-light max-w-xs">Mongolian cashmere, mulberry silk, and European flaxes.</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Truck className="w-5 h-5 text-[#957856] stroke-[1.5]" />
            <h3 className="text-xs uppercase tracking-luxury font-medium text-neutral-900">Complimentary Courier</h3>
            <p className="text-[11px] text-neutral-500 font-light max-w-xs">White-glove express insured shipping on orders over ₹2,999.</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <RefreshCw className="w-5 h-5 text-[#957856] stroke-[1.5]" />
            <h3 className="text-xs uppercase tracking-luxury font-medium text-neutral-900">Concierge Returns</h3>
            <p className="text-[11px] text-neutral-500 font-light max-w-xs">Effortless 7-day pickup and exchange service.</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Shield className="w-5 h-5 text-[#957856] stroke-[1.5]" />
            <h3 className="text-xs uppercase tracking-luxury font-medium text-neutral-900">Verified Authenticity</h3>
            <p className="text-[11px] text-neutral-500 font-light max-w-xs">Individually inspected and numbered garment production.</p>
          </div>
        </div>
      </section>

      {/* 3. CATEGORIES ARCHITECTURE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-[10px] uppercase tracking-luxury text-[#957856] font-semibold">Curation</span>
            <h2 className="font-serif text-2xl sm:text-3xl text-neutral-900 tracking-wide mt-1">Shop By Category</h2>
          </div>
          <Link
            href="/shop"
            className="text-xs uppercase tracking-widest text-neutral-700 hover:text-black font-medium flex items-center group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="group relative aspect-4/5 w-full bg-[#F5F1EB] overflow-hidden"
            >
              {cat.imageUrl && (
                <Image
                  src={cat.imageUrl}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white space-y-1">
                <h3 className="font-serif text-xl tracking-wide uppercase font-medium">{cat.name}</h3>
                <span className="text-[11px] tracking-widest text-[#EAE1D5] uppercase font-light inline-flex items-center group-hover:underline">
                  Discover Pieces →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS (WITH INTERACTIVE QUICK VIEW) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-[10px] uppercase tracking-luxury text-[#957856] font-semibold">Signature Edit</span>
            <h2 className="font-serif text-2xl sm:text-3xl text-neutral-900 tracking-wide mt-1">Featured Garments</h2>
          </div>
          <Link
            href="/shop"
            className="text-xs uppercase tracking-widest text-neutral-700 hover:text-black font-medium flex items-center group"
          >
            <span>Shop Full Catalog</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <ProductGridClient products={featuredProducts} />
      </section>

      {/* 5. EDITORIAL CAMPAIGN BANNER */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative aspect-16/9 md:aspect-21/9 w-full bg-[#121212] overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1600&auto=format&fit=crop"
            alt="Monochrome Capsule Campaign"
            fill
            sizes="100vw"
            className="object-cover object-center opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-16 text-white max-w-xl space-y-4">
            <span className="text-xs uppercase tracking-widest text-[#CBB499] font-medium">Limited Capsule</span>
            <h2 className="font-serif text-3xl sm:text-5xl font-light leading-tight">
              Monochrome Atelier
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 font-light leading-relaxed">
              Precision cuts stripped of unnecessary embellishment. Every seam is intentional; every button is natural horn or polished shell.
            </p>
            <div className="pt-2">
              <Link
                href="/shop?collection=atelier-minimalist-2026"
                className="inline-block px-7 py-3 bg-white text-black text-xs uppercase tracking-luxury font-semibold hover:bg-[#EAE1D5] transition-colors"
              >
                Explore The Capsule
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-[10px] uppercase tracking-luxury text-[#957856] font-semibold">Fresh From The Atelier</span>
            <h2 className="font-serif text-2xl sm:text-3xl text-neutral-900 tracking-wide mt-1">New Arrivals</h2>
          </div>
          <Link
            href="/shop?newArrival=true"
            className="text-xs uppercase tracking-widest text-neutral-700 hover:text-black font-medium flex items-center group"
          >
            <span>View All New</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <ProductGridClient products={newArrivals} />
      </section>

      {/* 7. ATELIER TESTIMONIALS & PRESS */}
      <section className="bg-[#F5F1EB] py-20 border-y border-[#EAE1D5]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <span className="text-[10px] uppercase tracking-widest text-[#957856] font-semibold">
            Client Voices & Press
          </span>
          <blockquote className="font-serif text-xl sm:text-2xl text-neutral-900 italic font-light leading-relaxed">
            "The double-faced cashmere overcoat is the most immaculate piece of tailoring I have ever owned. The drape is liquid, and the weight is featherlight yet deeply insulating."
          </blockquote>
          <div className="text-xs tracking-wider uppercase text-neutral-600 font-medium">
            — Eleanor Vance, Architectural Designer & Loyal Patron
          </div>
        </div>
      </section>
    </div>
  );
}
