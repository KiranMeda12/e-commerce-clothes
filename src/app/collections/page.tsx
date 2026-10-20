import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import { ArrowRight } from 'lucide-react';

export const revalidate = 0;

export default async function CollectionsPage() {
  const collections = await prisma.collection.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' },
    include: {
      _count: {
        select: { products: { where: { status: 'PUBLISHED' } } },
      },
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-[10px] uppercase tracking-luxury text-[#957856] font-semibold">
          Editorial Editions
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-neutral-900 tracking-tight">
          The Collections
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 font-light leading-relaxed">
          Structured capsules designed around particular textural dialogues—from raw washed linen to structured virgin wool tailoring.
        </p>
      </div>

      <div className="space-y-16">
        {collections.map((col, idx) => (
          <div
            key={col.id}
            className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${
              idx % 2 === 1 ? 'lg:flex-row-reverse' : ''
            }`}
          >
            <div className={`lg:col-span-7 relative aspect-[16/10] min-h-[280px] sm:min-h-[380px] w-full bg-[#F5F1EB] overflow-hidden ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
              {col.bannerImage && (
                <Image
                  src={col.bannerImage}
                  alt={col.name}
                  fill
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover object-center transition-transform duration-700 hover:scale-103"
                />
              )}
            </div>

            <div className={`lg:col-span-5 space-y-4 px-2 sm:px-6 ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
              <span className="text-[10px] tracking-luxury uppercase text-[#957856] font-semibold">
                Edition 0{idx + 1} • {col._count.products} Garments
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-neutral-900 tracking-wide">
                {col.name}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-light leading-relaxed">
                {col.description}
              </p>
              <div className="pt-2">
                <Link
                  href={`/shop?collection=${col.slug}`}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-black text-white text-xs uppercase tracking-luxury font-semibold hover:bg-neutral-800 transition-colors"
                >
                  <span>Explore The Lookbook</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
