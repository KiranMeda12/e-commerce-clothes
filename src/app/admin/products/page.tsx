'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  Check,
  X,
  Layers,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Archive,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

function ProductsAdminContent() {
  const searchParams = useSearchParams();
  const editQueryId = searchParams.get('edit');

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    description: '',
    details: '',
    careGuide: '',
    sizeGuide: '',
    price: '',
    salePrice: '',
    status: 'PUBLISHED',
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
    categoryId: '',
    collectionId: '',
    imageUrls: [''],
    variants: [
      { size: 'S', color: 'Black', colorHex: '#000000', stock: 10, sku: '', priceAdjustment: 0 },
      { size: 'M', color: 'Black', colorHex: '#000000', stock: 15, sku: '', priceAdjustment: 0 },
      { size: 'L', color: 'Black', colorHex: '#000000', stock: 8, sku: '', priceAdjustment: 0 },
    ],
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, colRes] = await Promise.all([
        fetch('/api/products?status=ALL&limit=100'),
        fetch('/api/categories'),
        fetch('/api/collections'),
      ]);

      if (prodRes.ok) {
        const d = await prodRes.json();
        setProducts(d.products || []);
      }
      if (catRes.ok) {
        const d = await catRes.json();
        setCategories(d.categories || []);
      }
      if (colRes.ok) {
        const d = await colRes.json();
        setCollections(d.collections || []);
      }
    } catch (err) {
      console.error('Failed to load products management data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle edit param from dashboard quick link
  useEffect(() => {
    if (editQueryId && products.length > 0) {
      const p = products.find((prod) => prod.id === editQueryId);
      if (p) {
        handleOpenEdit(p);
      }
    }
  }, [editQueryId, products]);

  const handleOpenCreate = () => {
    setEditingProductId(null);
    setFormError('');
    setFormSuccess('');
    setFormData({
      name: '',
      slug: '',
      sku: '',
      description: '',
      details: '',
      careGuide: '',
      sizeGuide: '',
      price: '',
      salePrice: '',
      status: 'PUBLISHED',
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: false,
      categoryId: categories[0]?.id || '',
      collectionId: collections[0]?.id || '',
      imageUrls: ['https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1000&auto=format&fit=crop'],
      variants: [
        { size: 'S', color: 'Black', colorHex: '#000000', stock: 10, sku: '', priceAdjustment: 0 },
        { size: 'M', color: 'Black', colorHex: '#000000', stock: 15, sku: '', priceAdjustment: 0 },
        { size: 'L', color: 'Black', colorHex: '#000000', stock: 8, sku: '', priceAdjustment: 0 },
      ],
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (p: any) => {
    setEditingProductId(p.id);
    setFormError('');
    setFormSuccess('');
    setFormData({
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      description: p.description,
      details: p.details || '',
      careGuide: p.careGuide || '',
      sizeGuide: p.sizeGuide || '',
      price: p.price.toString(),
      salePrice: p.salePrice ? p.salePrice.toString() : '',
      status: p.status,
      isFeatured: Boolean(p.isFeatured),
      isNewArrival: Boolean(p.isNewArrival),
      isBestSeller: Boolean(p.isBestSeller),
      categoryId: p.categoryId || '',
      collectionId: p.collectionId || '',
      imageUrls: p.images?.length > 0 ? p.images.map((img: any) => img.url) : [''],
      variants: p.variants?.length > 0
        ? p.variants.map((v: any) => ({
            id: v.id,
            size: v.size,
            color: v.color,
            colorHex: v.colorHex || '#000000',
            stock: v.stock,
            sku: v.sku,
            priceAdjustment: v.priceAdjustment || 0,
          }))
        : [{ size: 'One Size', color: 'Standard', colorHex: '#000000', stock: 10, sku: '', priceAdjustment: 0 }],
    });
    setModalOpen(true);
  };

  const handleAddImageUrl = () => {
    setFormData((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, ''] }));
  };

  const handleRemoveImageUrl = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== idx),
    }));
  };

  const handleAddVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        { size: 'M', color: 'New Color', colorHex: '#000000', stock: 5, sku: '', priceAdjustment: 0 },
      ],
    }));
  };

  const handleRemoveVariant = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== idx),
    }));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError('');
    setFormSuccess('');

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
        images: formData.imageUrls.filter((url) => url.trim().length > 0),
        variants: formData.variants,
      };

      const url = editingProductId
        ? `/api/admin/products/${editingProductId}`
        : '/api/admin/products';

      const method = editingProductId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setFormSubmitting(false);

      if (res.ok) {
        setFormSuccess('Product successfully saved and synchronized!');
        setTimeout(() => {
          setModalOpen(false);
          loadData();
        }, 800);
      } else {
        setFormError(data.error || 'Failed to save product');
      }
    } catch (err: any) {
      setFormSubmitting(false);
      setFormError(err.message || 'Network error saving product');
    }
  };

  const handleDeleteProduct = async (productId: string, name: string) => {
    if (!window.confirm(`Are you sure you wish to delete or archive "${name}"? If historical orders contain this garment, it will be safely archived to preserve customer records.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        loadData();
      } else {
        alert(data.error || 'Failed to delete product');
      }
    } catch {
      alert('Error connecting to server');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      searchTerm === '' ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#ECE7DF] gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-[#957856] font-semibold">
            Inventory & Catalog
          </span>
          <h1 className="font-serif text-3xl text-neutral-900 tracking-tight mt-1">
            Product Management
          </h1>
          <p className="text-xs text-neutral-500 font-light mt-0.5">
            Add new garments, manage size/color variant matrix, stock levels, and publication status.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-black text-white text-xs uppercase tracking-luxury font-semibold hover:bg-neutral-800 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 border border-[#ECE7DF] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by name, SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 focus:outline-none focus:border-black"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <span className="text-xs text-neutral-500 uppercase tracking-wider">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-neutral-300 text-xs py-2 px-3 focus:outline-none focus:border-black uppercase tracking-wider"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          <button
            type="button"
            onClick={loadData}
            className="p-2 border border-neutral-300 hover:border-black text-neutral-600"
            title="Refresh list"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-[#ECE7DF] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-500">Loading catalog...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500">No products found matching criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-neutral-500 uppercase tracking-wider text-[10px] border-b">
                <tr>
                  <th className="p-3.5">Piece</th>
                  <th className="p-3.5">SKU</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5">Total Stock</th>
                  <th className="p-3.5">Variants</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredProducts.map((p) => {
                  const totalStock = p.variants?.reduce((sum: number, v: any) => sum + v.stock, 0) || 0;
                  const thumb = p.images?.[0]?.url;

                  return (
                    <tr key={p.id} className="hover:bg-neutral-50/70">
                      <td className="p-3.5">
                        <div className="flex items-center space-x-3">
                          <div className="relative w-10 h-14 bg-[#F5F1EB] shrink-0 overflow-hidden">
                            {thumb && (
                              <Image
                                src={thumb}
                                alt={p.name}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-black">{p.name}</p>
                            <div className="flex items-center space-x-2 text-[10px] text-neutral-400 mt-0.5">
                              {p.isFeatured && <span className="text-amber-700 font-semibold">• Featured</span>}
                              {p.isNewArrival && <span className="text-emerald-700 font-semibold">• New</span>}
                              {p.isBestSeller && <span className="text-indigo-700 font-semibold">• Best Seller</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-neutral-600">{p.sku}</td>
                      <td className="p-3.5 text-neutral-700">{p.category?.name || 'Unassigned'}</td>
                      <td className="p-3.5">
                        {p.salePrice ? (
                          <div>
                            <span className="font-semibold text-black">{formatPrice(p.salePrice)}</span>
                            <span className="text-[10px] text-neutral-400 line-through block">{formatPrice(p.price)}</span>
                          </div>
                        ) : (
                          <span className="font-semibold text-black">{formatPrice(p.price)}</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-xs ${
                            totalStock <= 0
                              ? 'bg-red-100 text-red-800'
                              : totalStock <= 10
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {totalStock} in stock
                        </span>
                      </td>
                      <td className="p-3.5 text-neutral-500 font-mono text-[11px]">
                        {p.variants?.length || 0} variants
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-xs ${
                            p.status === 'PUBLISHED'
                              ? 'bg-neutral-900 text-white'
                              : p.status === 'DRAFT'
                              ? 'bg-neutral-200 text-neutral-700'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <Link
                          href={`/products/${p.slug}`}
                          target="_blank"
                          className="p-1.5 text-neutral-400 hover:text-black inline-block"
                          title="View on Storefront"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-neutral-500 hover:text-black"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-1.5 text-neutral-400 hover:text-red-600"
                          title="Delete / Archive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Creation / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl z-10 space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h2 className="font-serif text-2xl text-neutral-900">
                  {editingProductId ? 'Edit Product & Variant Matrix' : 'Create New Boutique Garment'}
                </h2>
                <p className="text-xs text-neutral-500 font-light">
                  Changes sync immediately to public customer storefront upon publishing.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-6">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                    Garment Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-[#DFD1BF] p-2.5 text-xs focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                    Master SKU *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g. ATL-COAT-009"
                    className="w-full border border-[#DFD1BF] p-2.5 text-xs font-mono uppercase focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Price and Sale Price */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                    Standard Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full border border-[#DFD1BF] p-2.5 text-xs focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                    Sale Price (₹ Optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.salePrice}
                    onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                    className="w-full border border-[#DFD1BF] p-2.5 text-xs focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full border border-[#DFD1BF] p-2.5 text-xs focus:outline-none focus:border-black"
                  >
                    <option value="">None / Unassigned</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                    Collection
                  </label>
                  <select
                    value={formData.collectionId}
                    onChange={(e) => setFormData({ ...formData, collectionId: e.target.value })}
                    className="w-full border border-[#DFD1BF] p-2.5 text-xs focus:outline-none focus:border-black"
                  >
                    <option value="">None / Unassigned</option>
                    {collections.map((col) => (
                      <option key={col.id} value={col.id}>{col.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status and Flags */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#FAF8F5] border border-[#ECE7DF]">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full border border-[#DFD1BF] p-2 text-xs font-semibold"
                  >
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="feat"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="accent-black"
                  />
                  <label htmlFor="feat" className="text-xs text-neutral-800">Featured Edit</label>
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="newarr"
                    checked={formData.isNewArrival}
                    onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                    className="accent-black"
                  />
                  <label htmlFor="newarr" className="text-xs text-neutral-800">New Arrival</label>
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="best"
                    checked={formData.isBestSeller}
                    onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                    className="accent-black"
                  />
                  <label htmlFor="best" className="text-xs text-neutral-800">Best Seller</label>
                </div>
              </div>

              {/* Description & Technical Guides */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                  Product Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detail the textile story, drape, provenance, and silhouette..."
                  className="w-full border border-[#DFD1BF] p-2.5 text-xs focus:outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                    Technical Specifications (Bullet points)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    placeholder="100% Mongolian Cashmere&#10;Hand-sewn lapels&#10;Horn buttons"
                    className="w-full border border-[#DFD1BF] p-2.5 text-xs focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                    Care Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={formData.careGuide}
                    onChange={(e) => setFormData({ ...formData, careGuide: e.target.value })}
                    placeholder="Professional dry clean only..."
                    className="w-full border border-[#DFD1BF] p-2.5 text-xs focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                    Size & Fit Advice
                  </label>
                  <textarea
                    rows={2}
                    value={formData.sizeGuide}
                    onChange={(e) => setFormData({ ...formData, sizeGuide: e.target.value })}
                    placeholder="Designed for relaxed drape..."
                    className="w-full border border-[#DFD1BF] p-2.5 text-xs focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Multiple Image URLs */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-600">
                    Product Image Photography URLs
                  </label>
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="text-xs text-[#957856] font-semibold underline"
                  >
                    + Add Another Image URL
                  </button>
                </div>
                {formData.imageUrls.map((url, i) => (
                  <div key={i} className="flex space-x-2">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={url}
                      onChange={(e) => {
                        const copy = [...formData.imageUrls];
                        copy[i] = e.target.value;
                        setFormData({ ...formData, imageUrls: copy });
                      }}
                      className="grow border border-[#DFD1BF] p-2 text-xs focus:outline-none focus:border-black"
                    />
                    {formData.imageUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveImageUrl(i)}
                        className="px-2.5 py-1 text-red-600 hover:bg-red-50 text-xs"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Variant Matrix (Size x Color x Stock x SKU) */}
              <div className="space-y-3 pt-4 border-t border-neutral-100">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xs uppercase tracking-luxury text-neutral-900 font-semibold">
                      Variant & Inventory Matrix
                    </h3>
                    <p className="text-[11px] text-neutral-500">
                      Manage stock levels separately for every size and color combination.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="px-3 py-1.5 border border-black text-black text-xs uppercase tracking-wider font-semibold hover:bg-black hover:text-white"
                  >
                    + Add Variant Combination
                  </button>
                </div>

                <div className="overflow-x-auto border border-neutral-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF8F5] text-neutral-600 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-2.5">Size</th>
                        <th className="p-2.5">Color Name</th>
                        <th className="p-2.5">Color Hex</th>
                        <th className="p-2.5">Stock Quantity</th>
                        <th className="p-2.5">Variant SKU</th>
                        <th className="p-2.5 text-right">Remove</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {formData.variants.map((v, vIdx) => (
                        <tr key={vIdx}>
                          <td className="p-2">
                            <input
                              type="text"
                              value={v.size}
                              onChange={(e) => {
                                const copy = [...formData.variants];
                                copy[vIdx].size = e.target.value;
                                setFormData({ ...formData, variants: copy });
                              }}
                              className="border p-1 w-20 text-xs"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={v.color}
                              onChange={(e) => {
                                const copy = [...formData.variants];
                                copy[vIdx].color = e.target.value;
                                setFormData({ ...formData, variants: copy });
                              }}
                              className="border p-1 w-28 text-xs"
                            />
                          </td>
                          <td className="p-2">
                            <div className="flex items-center space-x-1">
                              <input
                                type="color"
                                value={v.colorHex || '#000000'}
                                onChange={(e) => {
                                  const copy = [...formData.variants];
                                  copy[vIdx].colorHex = e.target.value;
                                  setFormData({ ...formData, variants: copy });
                                }}
                                className="w-6 h-6 border p-0 cursor-pointer"
                              />
                              <span className="font-mono text-[10px] text-neutral-500">{v.colorHex}</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              value={v.stock}
                              onChange={(e) => {
                                const copy = [...formData.variants];
                                copy[vIdx].stock = parseInt(e.target.value || '0', 10);
                                setFormData({ ...formData, variants: copy });
                              }}
                              className="border p-1 w-20 text-xs font-semibold"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              placeholder="Auto-generated if empty"
                              value={v.sku}
                              onChange={(e) => {
                                const copy = [...formData.variants];
                                copy[vIdx].sku = e.target.value;
                                setFormData({ ...formData, variants: copy });
                              }}
                              className="border p-1 w-40 text-xs font-mono"
                            />
                          </td>
                          <td className="p-2 text-right">
                            {formData.variants.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveVariant(vIdx)}
                                className="text-red-500 hover:text-red-700 text-xs"
                              >
                                ✕
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-6 border-t flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-2.5 border border-neutral-300 text-xs uppercase tracking-wider font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-8 py-2.5 bg-black text-white text-xs uppercase tracking-luxury font-semibold hover:bg-neutral-800 disabled:opacity-50"
                >
                  {formSubmitting ? 'Synchronizing Database...' : editingProductId ? 'Update Product' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-xs">Loading admin product catalog...</div>}>
      <ProductsAdminContent />
    </Suspense>
  );
}
