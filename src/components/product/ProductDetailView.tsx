'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, ShoppingBag, ArrowRight, ShieldCheck, Truck, RefreshCw, Ruler, Info } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import ProductCard from './ProductCard';

export default function ProductDetailView({
  product,
  relatedProducts,
}: {
  product: any;
  relatedProducts: any[];
}) {
  const router = useRouter();
  const { addItem } = useCart();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'care' | 'size'>('details');

  const images = product.images || [];
  const variants = product.variants || [];

  const sizes = Array.from(new Set(variants.map((v: any) => v.size))) as string[];
  const colors = Array.from(new Set(variants.map((v: any) => v.color))) as string[];

  const initialSize = selectedSize || sizes[0] || '';
  const initialColor = selectedColor || colors[0] || '';

  const activeVariant = variants.find(
    (v: any) => v.size === initialSize && v.color === initialColor
  ) || variants[0];

  const currentPrice = (product.salePrice ?? product.price) + (activeVariant?.priceAdjustment || 0);
  const availableStock = activeVariant?.stock ?? 0;
  const isOutOfStock = availableStock <= 0;

  const currentImage = images[selectedImageIndex]?.url || images[0]?.url || '';

  const handleAddToCart = () => {
    if (!activeVariant || isOutOfStock) return;

    addItem({
      variantId: activeVariant.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: currentImage,
      price: currentPrice,
      size: activeVariant.size,
      color: activeVariant.color,
      maxStock: activeVariant.stock,
    }, quantity);

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    if (!activeVariant || isOutOfStock) return;

    addItem({
      variantId: activeVariant.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: currentImage,
      price: currentPrice,
      size: activeVariant.size,
      color: activeVariant.color,
      maxStock: activeVariant.stock,
    }, quantity);

    router.push('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-20">
      {/* Breadcrumbs */}
      <nav className="text-xs text-neutral-400 flex items-center space-x-2">
        <Link href="/" className="hover:text-black">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-black">Shop</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link href={`/shop?category=${product.category.slug}`} className="hover:text-black">
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-neutral-900 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
        {/* Left: Gallery Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[3/4] min-h-[460px] sm:min-h-[580px] w-full bg-[#F5F1EB] overflow-hidden border border-[#ECE7DF]">
            {currentImage && (
              <Image
                src={currentImage}
                alt={product.name}
                fill
                priority
                unoptimized
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover object-center"
              />
            )}
          </div>

          {/* Thumbnails row */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {images.map((img: any, idx: number) => (
                <button
                  key={img.id || idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative aspect-[3/4] min-h-[80px] border transition-all ${
                    selectedImageIndex === idx
                      ? 'border-black ring-1 ring-black'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    fill
                    unoptimized
                    sizes="120px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Buy Actions Column */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
          <div className="space-y-3 pb-6 border-b border-[#ECE7DF]">
            {product.category && (
              <span className="text-[10px] uppercase tracking-luxury text-[#957856] font-semibold">
                {product.category.name}
              </span>
            )}
            <h1 className="font-serif text-3xl sm:text-4xl text-neutral-900 tracking-tight">
              {product.name}
            </h1>
            <p className="text-xs text-neutral-400 font-mono">SKU: {activeVariant?.sku || product.sku}</p>

            {/* Price block */}
            <div className="flex items-center space-x-3 pt-2">
              {product.salePrice ? (
                <>
                  <span className="text-2xl font-semibold text-neutral-900">
                    {formatPrice(currentPrice)}
                  </span>
                  <span className="text-sm text-neutral-400 line-through">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-xs bg-[#957856] text-white px-2 py-0.5 uppercase tracking-widest font-medium">
                    Special Offer
                  </span>
                </>
              ) : (
                <span className="text-2xl font-semibold text-neutral-900">
                  {formatPrice(currentPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Color Selection */}
          {colors.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-500 uppercase tracking-wider text-[11px]">Color</span>
                <span className="font-semibold text-black">{initialColor}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => {
                  const colorVar = variants.find((v: any) => v.color === c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`px-3 py-2 text-xs border transition-colors flex items-center space-x-2 ${
                        initialColor === c
                          ? 'border-black bg-neutral-900 text-white font-medium'
                          : 'border-[#DFD1BF] text-neutral-800 hover:border-black'
                      }`}
                    >
                      {colorVar?.colorHex && (
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block border border-white/50"
                          style={{ backgroundColor: colorVar.colorHex }}
                        />
                      )}
                      <span>{c}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {sizes.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-500 uppercase tracking-wider text-[11px]">Select Size</span>
                <button
                  type="button"
                  onClick={() => setActiveTab('size')}
                  className="text-[11px] text-[#957856] underline flex items-center"
                >
                  <Ruler className="w-3 h-3 mr-1" /> Size Guide
                </button>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
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
                      className={`py-2.5 text-xs border text-center transition-all ${
                        isSizeOOS
                          ? 'opacity-30 line-through border-neutral-200 cursor-not-allowed bg-neutral-50'
                          : initialSize === s
                          ? 'border-black bg-black text-white font-semibold'
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

          {/* Stock Notification */}
          <div className="text-xs pt-1">
            {isOutOfStock ? (
              <span className="text-red-600 font-medium">Currently Sold Out in this selection</span>
            ) : availableStock <= 5 ? (
              <span className="text-amber-800 font-medium">
                Limited Stock: Only {availableStock} garments remaining in our atelier.
              </span>
            ) : (
              <span className="text-emerald-700 font-medium flex items-center">
                <Check className="w-3.5 h-3.5 mr-1" /> In Stock & Ready for White-Glove Dispatch
              </span>
            )}
          </div>

          {/* Quantity Selector & Purchase Buttons */}
          <div className="space-y-3 pt-4">
            <div className="flex space-x-3">
              <div className="w-24 border border-neutral-300 flex items-center justify-between px-3">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="text-neutral-500 hover:text-black py-2"
                >
                  -
                </button>
                <span className="text-xs font-semibold">{quantity}</span>
                <button
                  type="button"
                  disabled={quantity >= availableStock}
                  onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
                  className="text-neutral-500 hover:text-black py-2 disabled:opacity-30"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className={`grow py-3.5 px-6 text-xs uppercase tracking-luxury font-semibold transition-all flex items-center justify-center space-x-2 ${
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
            </div>

            {!isOutOfStock && (
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full py-3.5 px-6 border border-black text-black text-xs uppercase tracking-luxury font-semibold hover:bg-black hover:text-white transition-colors"
              >
                Buy Now with Express Checkout
              </button>
            )}
          </div>

          {/* Trust Guarantees */}
          <div className="pt-6 border-t border-[#ECE7DF] space-y-3 text-xs text-neutral-600 font-light">
            <div className="flex items-center space-x-2.5">
              <Truck className="w-4 h-4 text-[#957856] shrink-0" />
              <span>Complimentary insured shipping on orders over ₹2,999.</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <RefreshCw className="w-4 h-4 text-[#957856] shrink-0" />
              <span>7-day complimentary home pickup exchange policy.</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-[#957856] shrink-0" />
              <span>100% certified authentic natural fibers and tailored finish.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description, Details, Garment Care, Size Guide */}
      <div className="pt-12 border-t border-[#ECE7DF]">
        <div className="flex space-x-8 border-b border-[#ECE7DF] text-xs uppercase tracking-luxury">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`pb-3 font-semibold transition-colors ${
              activeTab === 'details' ? 'border-b-2 border-black text-black' : 'text-neutral-400 hover:text-black'
            }`}
          >
            Design & Construction
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('care')}
            className={`pb-3 font-semibold transition-colors ${
              activeTab === 'care' ? 'border-b-2 border-black text-black' : 'text-neutral-400 hover:text-black'
            }`}
          >
            Care Instructions
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('size')}
            className={`pb-3 font-semibold transition-colors ${
              activeTab === 'size' ? 'border-b-2 border-black text-black' : 'text-neutral-400 hover:text-black'
            }`}
          >
            Size & Measurements
          </button>
        </div>

        <div className="py-8 max-w-3xl text-xs sm:text-sm text-neutral-700 leading-relaxed font-light">
          {activeTab === 'details' && (
            <div className="space-y-4">
              <p>{product.description}</p>
              {product.details && (
                <div className="pt-4 space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-black">Technical Details</h4>
                  <ul className="list-disc pl-5 space-y-1 text-neutral-600">
                    {product.details.split('\n').map((d: string, i: number) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'care' && (
            <div className="space-y-3">
              <p>{product.careGuide || 'Professional dry clean only. Store on contoured hanger in a cool, dry garment bag.'}</p>
              <div className="p-4 bg-[#FAF8F5] border border-[#EAE1D5] rounded-xs space-y-1">
                <span className="font-semibold text-black uppercase tracking-wider text-[11px]">Atelier Preservation Note:</span>
                <p className="text-[11px] text-neutral-600">
                  Allow natural fibers 24 hours of rest between wears to preserve tensile strength and organic garment structure.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'size' && (
            <div className="space-y-4">
              <p>{product.sizeGuide || 'Designed for an intentional, tailored drape. Model is 5\'10" wearing size S.'}</p>
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-xs border border-neutral-200">
                  <thead className="bg-[#FAF8F5] border-b border-neutral-200">
                    <tr>
                      <th className="p-2.5">Size</th>
                      <th className="p-2.5">Bust / Chest (in)</th>
                      <th className="p-2.5">Waist (in)</th>
                      <th className="p-2.5">Hips (in)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    <tr><td className="p-2.5 font-semibold">XS</td><td className="p-2.5">32-34</td><td className="p-2.5">25-27</td><td className="p-2.5">35-37</td></tr>
                    <tr><td className="p-2.5 font-semibold">S</td><td className="p-2.5">34-36</td><td className="p-2.5">27-29</td><td className="p-2.5">37-39</td></tr>
                    <tr><td className="p-2.5 font-semibold">M</td><td className="p-2.5">36-38</td><td className="p-2.5">29-31</td><td className="p-2.5">39-41</td></tr>
                    <tr><td className="p-2.5 font-semibold">L</td><td className="p-2.5">38-40</td><td className="p-2.5">31-33</td><td className="p-2.5">41-43</td></tr>
                    <tr><td className="p-2.5 font-semibold">XL</td><td className="p-2.5">40-42</td><td className="p-2.5">33-35</td><td className="p-2.5">43-45</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-[#ECE7DF]">
          <div className="flex justify-between items-end mb-8">
            <div>
              <span className="text-[10px] uppercase tracking-luxury text-[#957856] font-semibold">Complementary Pieces</span>
              <h3 className="font-serif text-2xl text-neutral-900 tracking-wide mt-1">Complete The Look</h3>
            </div>
            <Link
              href="/shop"
              className="text-xs uppercase tracking-widest text-neutral-700 hover:text-black font-medium flex items-center group"
            >
              <span>View Collection</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((relProd) => (
              <ProductCard key={relProd.id} product={relProd} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
