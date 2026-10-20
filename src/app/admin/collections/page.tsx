'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2, FolderTree, Layers, Check, AlertCircle } from 'lucide-react';

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Collection Form
  const [colModalOpen, setColModalOpen] = useState(false);
  const [colForm, setColForm] = useState({
    name: '',
    slug: '',
    description: '',
    bannerImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1600&auto=format&fit=crop',
    isFeatured: true,
  });

  // New Category Form
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [catForm, setCatForm] = useState({
    name: '',
    slug: '',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [colRes, catRes] = await Promise.all([
        fetch('/api/admin/collections'),
        fetch('/api/categories'),
      ]);
      if (colRes.ok) {
        const d = await colRes.json();
        setCollections(d.collections || []);
      }
      if (catRes.ok) {
        const d = await catRes.json();
        setCategories(d.categories || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(colForm),
      });
      if (res.ok) {
        setColModalOpen(false);
        setColForm({
          name: '',
          slug: '',
          description: '',
          bannerImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1600&auto=format&fit=crop',
          isFeatured: true,
        });
        loadData();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to create collection');
      }
    } catch {
      alert('Error connecting to server');
    }
  };

  const handleDeleteCollection = async (id: string, name: string) => {
    if (!window.confirm(`Delete collection "${name}"? Garments assigned to it will remain safe and intact.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/collections/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadData();
      }
    } catch {}
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(catForm),
      });
      if (res.ok) {
        setCatModalOpen(false);
        setCatForm({
          name: '',
          slug: '',
          description: '',
          imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop',
        });
        loadData();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to create category');
      }
    } catch {
      alert('Error creating category');
    }
  };

  return (
    <div className="space-y-12">
      {/* Title Bar */}
      <div className="pb-6 border-b border-[#ECE7DF]">
        <span className="text-[10px] uppercase tracking-luxury text-[#957856] font-semibold">
          Taxonomy & Lookbooks
        </span>
        <h1 className="font-serif text-3xl text-neutral-900 tracking-tight mt-1">
          Collections & Categories
        </h1>
        <p className="text-xs text-neutral-500 font-light mt-0.5">
          Curate high-fashion seasonal lookbooks and organize storefront navigation taxonomy.
        </p>
      </div>

      {/* Collections Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-serif text-xl text-neutral-900">
              Active Collections ({collections.length})
            </h2>
            <p className="text-xs text-neutral-500">Featured editorial capsules presented on home and lookbook pages.</p>
          </div>
          <button
            type="button"
            onClick={() => setColModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-black text-white text-xs uppercase tracking-luxury font-semibold hover:bg-neutral-800"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Collection</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((col) => (
            <div key={col.id} className="bg-white border border-[#ECE7DF] overflow-hidden flex flex-col justify-between">
              <div className="relative aspect-16/9 bg-[#F5F1EB]">
                {col.bannerImage && (
                  <Image
                    src={col.bannerImage}
                    alt={col.name}
                    fill
                    sizes="400px"
                    className="object-cover"
                  />
                )}
                {col.isFeatured && (
                  <span className="absolute top-2 left-2 bg-black text-white text-[10px] uppercase tracking-wider px-2 py-0.5 font-semibold">
                    Featured Edit
                  </span>
                )}
              </div>
              <div className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-serif text-lg text-black">{col.name}</h3>
                  <span className="text-[10px] text-neutral-400 font-mono">slug: {col.slug}</span>
                </div>
                <p className="text-xs text-neutral-600 line-clamp-2">{col.description}</p>
                <div className="flex justify-between items-center pt-3 border-t text-xs">
                  <span className="text-neutral-500">{col._count?.products || 0} garments assigned</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteCollection(col.id, col.name)}
                    className="text-neutral-400 hover:text-red-600 p-1"
                    title="Delete collection"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories Section */}
      <div className="space-y-6 pt-6 border-t border-[#ECE7DF]">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-serif text-xl text-neutral-900">
              Department Categories ({categories.length})
            </h2>
            <p className="text-xs text-neutral-500">Primary navigational departments (Men, Women, Outerwear, Accessories).</p>
          </div>
          <button
            type="button"
            onClick={() => setCatModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 border border-black text-black text-xs uppercase tracking-luxury font-semibold hover:bg-black hover:text-white"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Category</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white border border-[#ECE7DF] p-4 text-xs space-y-2">
              <div className="relative aspect-square bg-[#F5F1EB] overflow-hidden mb-2">
                {cat.imageUrl && (
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                )}
              </div>
              <h3 className="font-semibold text-black text-sm">{cat.name}</h3>
              <p className="text-neutral-500 text-[11px] line-clamp-2">{cat.description}</p>
              <p className="text-[#957856] font-semibold text-[11px]">{cat._count?.products || 0} items</p>
            </div>
          ))}
        </div>
      </div>

      {/* Collection Modal */}
      {colModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={() => setColModalOpen(false)} />
          <div className="relative bg-white max-w-md w-full p-6 shadow-2xl z-10 space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="font-serif text-xl text-black border-b pb-2">Create Collection</h3>
            <form onSubmit={handleCreateCollection} className="space-y-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                  Collection Title *
                </label>
                <input
                  type="text"
                  required
                  value={colForm.name}
                  onChange={(e) => setColForm({ ...colForm, name: e.target.value })}
                  placeholder="e.g. Winter Cashmere 2026"
                  className="w-full border p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={colForm.description}
                  onChange={(e) => setColForm({ ...colForm, description: e.target.value })}
                  className="w-full border p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                  Banner Image URL *
                </label>
                <input
                  type="url"
                  required
                  value={colForm.bannerImage}
                  onChange={(e) => setColForm({ ...colForm, bannerImage: e.target.value })}
                  className="w-full border p-2 text-xs"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="col-feat"
                  checked={colForm.isFeatured}
                  onChange={(e) => setColForm({ ...colForm, isFeatured: e.target.checked })}
                  className="accent-black"
                />
                <label htmlFor="col-feat" className="text-xs text-neutral-800">
                  Feature prominently on storefront homepage
                </label>
              </div>

              <div className="pt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setColModalOpen(false)}
                  className="w-1/2 py-2 border text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-black text-white text-xs uppercase font-semibold"
                >
                  Save Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={() => setCatModalOpen(false)} />
          <div className="relative bg-white max-w-md w-full p-6 shadow-2xl z-10 space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="font-serif text-xl text-black border-b pb-2">Create Category</h3>
            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  placeholder="e.g. Knitwear"
                  className="w-full border p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={catForm.description}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  className="w-full border p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1">
                  Display Image URL *
                </label>
                <input
                  type="url"
                  required
                  value={catForm.imageUrl}
                  onChange={(e) => setCatForm({ ...catForm, imageUrl: e.target.value })}
                  className="w-full border p-2 text-xs"
                />
              </div>

              <div className="pt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setCatModalOpen(false)}
                  className="w-1/2 py-2 border text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-black text-white text-xs uppercase font-semibold"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
