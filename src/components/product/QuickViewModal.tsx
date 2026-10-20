'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Check, ShoppingBag, ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

export interface QuickViewModalProps {
  product: any | null;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  // Extract distinct sizes & colors
  const variants = product.variants || [];
  const sizes = Array.from(new Set(variants.map((v: any) => v.size))) as string[];
  const colors = Array.from(new Set(variants.map((v: any) => v.color))) as string[];

  const initialSize = selectedSize || sizes[0] || '';
  const initialColor = selectedColor || colors[0] || '';

  const currentVariant = variants.find(
    (v: any) => v.size === initialSize && v.color === initialColor
  ) || variants[0];

  const currentImage = selectedImage || product.images?.[0]?.url || '';
  const availableStock = currentVariant?.stock ?? 0;
  const isOutOfStock = availableStock <= 0;

  const handleAddToCart = () => {
    if (!currentVariant || isOutOfStock) return;

    addItem({
      variantId: currentVariant.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: currentImage,
      price: (product.salePrice ?? product.price) + (currentVariant.priceAdjustment || 0),
      size: currentVariant.size,
      color: currentVariant.color,
      maxStock: currentVariant.stock,
    }, quantity);

    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-black z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8">
          {/* Images Column */}
          <div className="flex flex-col space-y-4">
            <div className="relative aspect-[3/4] min-h-[340px] w-full bg-[#F5F1EB] overflow-hidden border border-[#ECE7DF]">
              {currentImage && (
                <Image
                  src={currentImage}
                  alt={product.name}
                  fill
                  unoptimized
                  sizes="500px"
                  className="object-cover"
                />
              )}
            </div>

            {/* Gallery Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-1">
                {product.images.map((img: any, i: number) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImage(img.url)}
                    className={`relative w-16 h-20 shrink-0 border transition-all ${
                      currentImage === img.url ? 'border-black ring-1 ring-black' : 'border-neutral-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt="Thumbnail"
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {product.category && (
                <p className="text-[10px] tracking-luxury uppercase text-[#957856] font-semibold">
                  {product.category.name}
                </p>
              )}

              <h2 className="font-serif text-2xl text-neutral-900 tracking-wide">
                {product.name}
              </h2>

              {/* Price */}
              <div className="flex items-center space-x-3">
                {product.salePrice ? (
                  <>
                    <span className="text-xl font-semibold text-neutral-900">
                      {formatPrice(product.salePrice)}
                    </span>
                    <span className="text-sm text-neutral-400 line-through">
                      {formatPrice(product.price)}
                    </span>
                  </>
                ) : (
                  <span className="text-xl font-semibold text-neutral-900">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>

              {/* Description Snippet */}
              <p className="text-xs text-neutral-600 leading-relaxed font-light line-clamp-3">
                {product.description}
              </p>

              {/* Color Selector */}
              {colors.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-neutral-100">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-500 uppercase tracking-wider text-[11px]">Color</span>
                    <span className="font-medium text-black">{initialColor}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((c) => {
                      const colorVariant = variants.find((v: any) => v.color === c);
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setSelectedColor(c)}
                          className={`px-3 py-1.5 text-xs border transition-colors flex items-center space-x-1.5 ${
                            initialColor === c
                              ? 'border-black bg-neutral-900 text-white font-medium'
                              : 'border-[#DFD1BF] text-neutral-800 hover:border-black'
                          }`}
                        >
                          {colorVariant?.colorHex && (
                            <span
                              className="w-2.5 h-2.5 rounded-full inline-block border border-white/50"
                              style={{ backgroundColor: colorVariant.colorHex }}
                            />
                          )}
                          <span>{c}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {sizes.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-500 uppercase tracking-wider text-[11px]">Select Size</span>
                    <Link
                      href={`/products/${product.slug}#size-guide`}
                      onClick={onClose}
                      className="text-[11px] text-[#957856] underline"
                    >
                      Size Guide
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((s) => {
                      const sizeVar = variants.find(
                        (v: any) => v.size === s && (!initialColor || v.color === initialColor)
                      );
                      const isSizeOOS = !sizeVar || sizeVar.stock <= 0;

                      return (
                        <button
                          key={s}
                          type="button"
                          disabled={isSizeOOS}
                          onClick={() => setSelectedSize(s)}
                          className={`min-w-10 py-2 px-3 text-xs border text-center transition-colors ${
                            isSizeOOS
                              ? 'opacity-30 line-through border-neutral-200 cursor-not-allowed bg-neutral-50'
                              : initialSize === s
                              ? 'border-black bg-black text-white font-medium'
                              : 'border-[#DFD1BF] text-neutral-800 hover:border-black'
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stock Status Notification */}
              <div className="text-xs pt-1">
                {isOutOfStock ? (
                  <span className="text-red-600 font-medium">Currently Sold Out</span>
                ) : availableStock <= 5 ? (
                  <span className="text-amber-700 font-medium">
                    Hurry! Only {availableStock} pieces available in this variant.
                  </span>
                ) : (
                  <span className="text-emerald-700 font-medium flex items-center">
                    <Check className="w-3.5 h-3.5 mr-1" /> In Stock & Ready to Ship
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4 border-t border-neutral-100">
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className={`w-full py-3.5 px-6 text-xs uppercase tracking-luxury font-semibold transition-all flex items-center justify-center space-x-2 ${
                  added
                    ? 'bg-emerald-700 text-white'
                    : isOutOfStock
                    ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-neutral-800'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>{isOutOfStock ? 'Sold Out' : 'Add to Bag'}</span>
                  </>
                )}
              </button>

              <Link
                href={`/products/${product.slug}`}
                onClick={onClose}
                className="w-full py-2.5 text-center text-xs text-neutral-600 hover:text-black transition-colors block uppercase tracking-widest font-medium"
              >
                View Full Product Specifications & Details →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
