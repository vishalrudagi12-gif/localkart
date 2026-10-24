import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import EmptyState from '../components/EmptyState.jsx';
import ProductCard from '../components/ProductCard.jsx';

const POPULAR_CATEGORIES = [
  { id: 'All', label: 'All Products', icon: '✨' },
  { id: 'soap', label: 'Soap & Skincare', icon: '🧼' },
  { id: 'pottery', label: 'Pottery & Ceramics', icon: '🏺' },
  { id: 'home', label: 'Home & Living', icon: '🕯️' },
  { id: 'crafts', label: 'Bags & Crafts', icon: '👜' },
];

export default function HomePage() {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load(params = { q, category }) {
    setLoading(true);
    setError('');
    try {
      const query = new URLSearchParams();
      if (params.q && params.q.trim()) query.set('q', params.q.trim());
      if (params.category && params.category.trim()) query.set('category', params.category.trim());
      const data = await api(`/products?${query.toString()}`);
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load({ q: '', category: '' });
  }, []);

  function onSearch(e) {
    e.preventDefault();
    load({ q, category });
  }

  function onSelectCategory(catId) {
    const selected = catId === 'All' ? '' : catId;
    setCategory(selected);
    setQ('');
    load({ q: '', category: selected });
  }

  function onClear() {
    setQ('');
    setCategory('');
    load({ q: '', category: '' });
  }

  return (
    <div className="space-y-10">
      {/* Decorative Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-bazaar-900 via-bazaar-800 to-bazaar-700 p-8 sm:p-12 text-white shadow-lift">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 h-48 w-48 rounded-full bg-emerald-400/10 blur-xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold backdrop-blur-md border border-white/15 text-emerald-200">
            <span>✨ Support Independent Artisans</span>
          </div>

          <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Discover Authentic <span className="text-emerald-300">Handcrafted</span> Goods
          </h1>

          <p className="mt-3 text-sm sm:text-base text-bazaar-100/90 leading-relaxed">
            LocalBazaar connects small city enterprises directly to you. Shop artisanal soaps, stoneware ceramics, handwoven bags, and organic home goods.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-bazaar-100/80 font-medium">
            <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-lg backdrop-blur-sm">
              🌿 100% Locally Made
            </span>
            <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-lg backdrop-blur-sm">
              📍 Direct from Workshops
            </span>
            <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-lg backdrop-blur-sm">
              ⚡ Same-City Delivery
            </span>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Section */}
      <section className="space-y-4">
        <form className="flex flex-col gap-3 sm:flex-row items-stretch" onSubmit={onSearch}>
          <div className="relative flex-1">
            <input
              className="input pl-10"
              placeholder="Search products by title, description (e.g. soap, mug)..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              🔍
            </span>
          </div>

          <div className="sm:w-60">
            <input
              className="input"
              placeholder="Category (e.g. soap, pottery)"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <button className="btn-primary shrink-0" type="submit">
            Search
          </button>

          {(q || category) && (
            <button
              className="btn-secondary shrink-0"
              type="button"
              onClick={onClear}
            >
              Clear
            </button>
          )}
        </form>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
            Browse:
          </span>
          {POPULAR_CATEGORIES.map((cat) => {
            const isSelected =
              (cat.id === 'All' && !category) ||
              category.toLowerCase() === cat.id.toLowerCase();
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all shadow-2xs ${
                  isSelected
                    ? 'bg-bazaar-800 text-white ring-2 ring-bazaar-700 shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-bazaar-800 border border-slate-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Catalog Results */}
      <section>
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <h2 className="text-xl font-bold text-slate-900">
            {category ? (
              <span className="capitalize">{category} Collection</span>
            ) : q ? (
              <span>Search results for &ldquo;{q}&rdquo;</span>
            ) : (
              <span>Featured Products</span>
            )}
          </h2>
          <span className="text-xs font-medium text-slate-500">
            {products.length} product{products.length === 1 ? '' : 's'} available
          </span>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="mt-12 text-center text-slate-400 font-medium">
            <span className="inline-block animate-spin mr-2">⏳</span> Loading catalog…
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="mt-6">
            <EmptyState title="No matching products found">
              {q || category ? (
                <div>
                  <p>Try searching for a different keyword or category.</p>
                  <button
                    type="button"
                    onClick={onClear}
                    className="mt-3 text-sm font-semibold text-bazaar-700 hover:underline"
                  >
                    View all products →
                  </button>
                </div>
              ) : (
                'Sellers have not added any products yet.'
              )}
            </EmptyState>
          </div>
        )}

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
