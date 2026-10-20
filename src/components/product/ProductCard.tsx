'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, Plus } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    salePrice?: number | null;
    isFeatured?: boolean;
    isNewArrival?: boolean;
    isBestSeller?: boolean;
    images: { url: string; altText?: string | null; isPrimary?: boolean }[];
    variants?: { id: string; size: string; color: string; stock: number; sku: string }[];
    category?: { name: string; slug: string } | null;
  };
  onQuickView?: (product: any) => void;
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const { addItem } = useCart();

  const primaryImage = product.images.find((img) => img.isPrimary)?.url || product.images[0]?.url;
  const secondaryImage = product.images[1]?.url || primaryImage;

  const totalStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 10;
  const isOutOfStock = totalStock <= 0;

  const discountPercentage =
    product.salePrice && product.salePrice < product.price
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : null;

  // Quick add first available variant
  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onQuickView) {
      onQuickView(product);
      return;
    }

    if (!product.variants || product.variants.length === 0) return;
    const availableVariant = product.variants.find((v) => v.stock > 0);
    if (!availableVariant) return;

    addItem({
      variantId: availableVariant.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: primaryImage || '',
      price: product.salePrice ?? product.price,
      size: availableVariant.size,
      color: availableVariant.color,
      maxStock: availableVariant.stock,
    });
  };

  return (
    <div
      className="group relative flex flex-col p-3 bg-white border border-[#DCD2C3] hover:border-[#141312] transition-all duration-300 shadow-xs hover:shadow-lg rounded-xs"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image Container with secondary image crossfade */}
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-[3/4] min-h-[280px] sm:min-h-[360px] w-full bg-[#EAE2D5] overflow-hidden block border border-[#E0D7C9]"
      >
        {primaryImage ? (
          <>
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              unoptimized
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover object-center transition-all duration-700 ease-out ${
                hovered && secondaryImage !== primaryImage ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
              }`}
            />
            {secondaryImage && secondaryImage !== primaryImage && (
              <Image
                src={secondaryImage}
                alt={`${product.name} alternate view`}
                fill
                unoptimized
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={`object-cover object-center transition-all duration-700 ease-out absolute inset-0 ${
                  hovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
                }`}
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">
            No Image Available
          </div>
        )}

        {/* Status Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-1.5 z-10">
          {isOutOfStock ? (
            <span className="bg-[#141312] text-neutral-200 text-[10px] tracking-widest uppercase px-2.5 py-1 font-semibold shadow-xs">
              Out of Stock
            </span>
          ) : (
            <>
              {product.isNewArrival && (
                <span className="bg-[#141312] text-[#EFE7DC] text-[10px] tracking-luxury uppercase px-2.5 py-1 font-semibold border border-[#CBB499] shadow-xs">
                  New Arrival
                </span>
              )}
              {product.isBestSeller && !product.isNewArrival && (
                <span className="bg-[#7A4B27] text-white text-[10px] tracking-luxury uppercase px-2.5 py-1 font-semibold shadow-xs">
                  Best Seller
                </span>
              )}
              {discountPercentage && (
                <span className="bg-[#8A3324] text-white text-[10px] tracking-widest uppercase px-2.5 py-1 font-bold shadow-xs">
                  -{discountPercentage}%
                </span>
              )}
            </>
          )}
        </div>

        {/* Quick Action Floating Overlay */}
        <div className="absolute inset-x-3 bottom-3 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-10">
          {onQuickView && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
              className="grow bg-white/95 hover:bg-white text-black py-2.5 px-3 text-[11px] uppercase tracking-widest font-semibold shadow-md transition-colors flex items-center justify-center space-x-1.5 backdrop-blur-xs border border-neutral-200"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Quick View</span>
            </button>
          )}
          {!isOutOfStock && (
            <button
              type="button"
              onClick={handleQuickAdd}
              className="bg-black hover:bg-neutral-800 text-white p-2.5 text-xs shadow-md transition-colors shrink-0"
              title="Quick Add to Bag"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </Link>

      {/* Product Information */}
      <div className="pt-3.5 pb-1 flex flex-col space-y-1">
        {product.category && (
          <span className="text-[10px] uppercase tracking-luxury text-[#8C6D4A] font-bold">
            {product.category.name}
          </span>
        )}

        <Link
          href={`/products/${product.slug}`}
          className="text-xs sm:text-sm font-medium text-[#141312] hover:text-[#8C6D4A] transition-colors line-clamp-1"
        >
          {product.name}
        </Link>

        {/* Pricing */}
        <div className="flex items-center space-x-2 pt-0.5">
          {product.salePrice ? (
            <>
              <span className="text-xs sm:text-sm font-bold text-[#8A3324]">
                {formatPrice(product.salePrice)}
              </span>
              <span className="text-xs text-neutral-400 line-through">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="text-xs sm:text-sm font-semibold text-[#141312]">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
