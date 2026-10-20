'use client';

import React, { useState } from 'react';
import ProductCard from '@/components/product/ProductCard';
import QuickViewModal from '@/components/product/QuickViewModal';

export default function ProductGridClient({ products }: { products: any[] }) {
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);

  if (!products || products.length === 0) {
    return (
      <div className="py-12 text-center text-neutral-400 text-xs tracking-wider">
        No pieces currently available in this curation.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onQuickView={(p) => setQuickViewProduct(p)}
          />
        ))}
      </div>

      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </>
  );
}
