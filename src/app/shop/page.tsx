'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/product/ProductCard';
import QuickViewModal from '@/components/product/QuickViewModal';
import { Filter, X, ChevronDown, SlidersHorizontal } from 'lucide-react';

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);

  // Active filter state from URL
  const selectedCategory = searchParams.get('category') || '';
  const selectedCollection = searchParams.get('collection') || '';
  const selectedSize = searchParams.get('size') || '';
  const selectedColor = searchParams.get('color') || '';
  const selectedSort = searchParams.get('sort') || 'newest';
  const searchQuery = searchParams.get('search') || '';
  const isNewArrival = searchParams.get('newArrival') === 'true';
  const isBestSeller = searchParams.get('bestSeller') === 'true';

  // Fetch filter options (categories and collections)
  useEffect(() => {
    async function loadMeta() {
      try {
        const [catRes, colRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/collections'),
        ]);
        if (catRes.ok) {
          const d = await catRes.json();
          setCategories(d.categories || []);
        }
        if (colRes.ok) {
          const d = await colRes.json();
          setCollections(d.collections || []);
        }
      } catch (err) {
        console.error('Error loading filters meta:', err);
      }
    }
    loadMeta();
  }, []);

  // Fetch products whenever searchParams change
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const query = searchParams.toString();
        const res = await fetch(`/api/products?${query}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [searchParams]);

  // Helper to update query params
  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'ALL') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/shop?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push('/shop');
  };

  const hasActiveFilters = Boolean(
    selectedCategory ||
    selectedCollection ||
    selectedSize ||
    selectedColor ||
    searchQuery ||
    isNewArrival ||
    isBestSeller
  );

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'One Size'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Header */}
      <div className="pb-8 border-b border-[#ECE7DF] flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-[#957856] font-semibold">
            {selectedCategory ? `${selectedCategory.toUpperCase()} COLLECTION` : 'THE COMPLETE WARDROBE'}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-neutral-900 tracking-tight mt-1">
            {searchQuery
              ? `Results for "${searchQuery}"`
              : selectedCollection
              ? collections.find((c) => c.slug === selectedCollection)?.name || 'Collection'
              : selectedCategory
              ? categories.find((c) => c.slug === selectedCategory)?.name || 'Category'
              : 'All Ready-to-Wear'}
          </h1>
          <p className="text-xs text-neutral-500 font-light mt-1.5">
            Showing {products.length} refined garment{products.length === 1 ? '' : 's'}
          </p>
        </div>

        {/* Sort & Mobile Filter Trigger */}
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => setFilterDrawerOpen(true)}
            className="lg:hidden flex items-center space-x-2 px-4 py-2 border border-neutral-300 text-xs uppercase tracking-wider font-medium text-neutral-800"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters {hasActiveFilters && '•'}</span>
          </button>

          <div className="relative flex items-center">
            <span className="text-xs text-neutral-400 mr-2 uppercase tracking-wider hidden sm:inline">Sort:</span>
            <select
              value={selectedSort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="bg-transparent border border-neutral-300 text-xs py-2 pl-3 pr-8 uppercase tracking-wider text-neutral-900 focus:outline-none focus:border-black appearance-none cursor-pointer"
            >
              <option value="newest">Newest Additions</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 pointer-events-none text-neutral-500" />
          </div>
        </div>
      </div>

      {/* Active Filters Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 py-4">
          <span className="text-xs text-neutral-500">Active filters:</span>
          {selectedCategory && (
            <button
              onClick={() => updateFilter('category', null)}
              className="inline-flex items-center px-2.5 py-1 bg-[#F5F1EB] text-xs text-neutral-800 hover:bg-[#EAE1D5]"
            >
              Category: {selectedCategory}
              <X className="w-3 h-3 ml-1.5" />
            </button>
          )}
          {selectedCollection && (
            <button
              onClick={() => updateFilter('collection', null)}
              className="inline-flex items-center px-2.5 py-1 bg-[#F5F1EB] text-xs text-neutral-800 hover:bg-[#EAE1D5]"
            >
              Collection: {selectedCollection}
              <X className="w-3 h-3 ml-1.5" />
            </button>
          )}
          {selectedSize && (
            <button
              onClick={() => updateFilter('size', null)}
              className="inline-flex items-center px-2.5 py-1 bg-[#F5F1EB] text-xs text-neutral-800 hover:bg-[#EAE1D5]"
            >
              Size: {selectedSize}
              <X className="w-3 h-3 ml-1.5" />
            </button>
          )}
          {searchQuery && (
            <button
              onClick={() => updateFilter('search', null)}
              className="inline-flex items-center px-2.5 py-1 bg-[#F5F1EB] text-xs text-neutral-800 hover:bg-[#EAE1D5]"
            >
              Search: "{searchQuery}"
              <X className="w-3 h-3 ml-1.5" />
            </button>
          )}
          <button
            onClick={clearAllFilters}
            className="text-xs text-neutral-500 hover:text-black underline ml-2"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Layout Grid with Sidebar Filters for Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-6">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block space-y-8 pr-6 border-r border-[#ECE7DF]">
          {/* Categories */}
          <div>
            <h3 className="text-xs uppercase tracking-luxury text-neutral-900 font-semibold mb-3">
              Categories
            </h3>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => updateFilter('category', null)}
                className={`block text-xs tracking-wide text-left transition-colors ${
                  !selectedCategory ? 'text-black font-semibold' : 'text-neutral-500 hover:text-black'
                }`}
              >
                All Ready-to-Wear
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => updateFilter('category', cat.slug)}
                  className={`block text-xs tracking-wide text-left transition-colors ${
                    selectedCategory === cat.slug ? 'text-black font-semibold' : 'text-neutral-500 hover:text-black'
                  }`}
                >
                  {cat.name} ({cat._count?.products || 0})
                </button>
              ))}
            </div>
          </div>

          {/* Collections */}
          {collections.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-luxury text-neutral-900 font-semibold mb-3">
                Collections
              </h3>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => updateFilter('collection', null)}
                  className={`block text-xs tracking-wide text-left transition-colors ${
                    !selectedCollection ? 'text-black font-semibold' : 'text-neutral-500 hover:text-black'
                  }`}
                >
                  All Collections
                </button>
                {collections.map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => updateFilter('collection', col.slug)}
                    className={`block text-xs tracking-wide text-left transition-colors ${
                      selectedCollection === col.slug ? 'text-black font-semibold' : 'text-neutral-500 hover:text-black'
                    }`}
                  >
                    {col.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Filter */}
          <div>
            <h3 className="text-xs uppercase tracking-luxury text-neutral-900 font-semibold mb-3">
              Filter by Size
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {availableSizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => updateFilter('size', selectedSize === s ? null : s)}
                  className={`py-2 text-xs border text-center transition-colors ${
                    selectedSize === s
                      ? 'border-black bg-black text-white font-medium'
                      : 'border-[#DFD1BF] text-neutral-700 hover:border-black'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid Main Area */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 py-12">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse space-y-3">
                  <div className="aspect-[3/4] min-h-[280px] bg-[#EAE1D5]/60" />
                  <div className="h-4 bg-[#EAE1D5]/60 w-3/4" />
                  <div className="h-4 bg-[#EAE1D5]/60 w-1/3" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-24 text-center space-y-4">
              <p className="font-serif text-xl text-neutral-800">No pieces found matching criteria</p>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto font-light">
                Try loosening your filters or explore our complete catalog.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="mt-2 px-6 py-2.5 bg-black text-white text-xs uppercase tracking-luxury font-medium hover:bg-neutral-800"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs">Loading Atelier catalog...</div>}>
      <ShopContent />
    </Suspense>
  );
}
