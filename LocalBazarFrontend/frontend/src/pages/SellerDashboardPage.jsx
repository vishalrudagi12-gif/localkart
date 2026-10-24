import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';
import { api } from '../api/client.js';
import EmptyState from '../components/EmptyState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  category: '',
  tags: '',
  city: '',
  quantity: 10,
  lowStockThreshold: 5,
};

const NEXT = {
  PENDING: [
    { status: 'ACCEPTED', label: '✓ Accept' },
    { status: 'REJECTED', label: '✕ Reject' },
  ],
  ACCEPTED: [{ status: 'SHIPPED', label: '✈ Ship order' }],
  SHIPPED: [{ status: 'DELIVERED', label: '✓ Mark delivered' }],
};

const ACTION_STYLES = {
  ACCEPTED: 'bg-emerald-600 text-white hover:bg-emerald-700 font-semibold',
  REJECTED: 'border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 font-semibold',
  SHIPPED: 'bg-indigo-600 text-white hover:bg-indigo-700 font-semibold',
  DELIVERED: 'bg-emerald-700 text-white hover:bg-emerald-800 font-semibold',
};

export default function SellerDashboardPage() {
  const user = useSelector((s) => s.auth.user);
  const [me, setMe] = useState(null);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  async function refresh() {
    const [seller, list, dashboard, sellerOrders] = await Promise.all([
      api('/seller/me'),
      api('/seller/products'),
      api('/dashboard/seller'),
      api('/orders/seller'),
    ]);
    setMe(seller);
    setProducts(list);
    setStats(dashboard);
    setOrders(sellerOrders);
  }

  useEffect(() => {
    if (user?.role !== 'SELLER') return;
    refresh().catch((err) => setError(err.message));
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== 'SELLER') {
    return <p className="text-slate-600">This page is for sellers only.</p>;
  }

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function handleFileSelect(e) {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setFilePreview(URL.createObjectURL(selected));
    }
  }

  function clearSelectedFile() {
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function startEdit(product) {
    setEditingId(product.id);
    clearSelectedFile();
    setForm({
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      category: product.category || '',
      tags: (product.tags || []).join(', '),
      city: product.city || '',
      quantity: product.quantity,
      lowStockThreshold: product.lowStockThreshold,
    });
    window.scrollTo({ top: document.getElementById('product-form')?.offsetTop - 80 || 0, behavior: 'smooth' });
  }

  function resetForm() {
    setEditingId(null);
    clearSelectedFile();
    setForm(emptyForm);
  }

  function payload() {
    return {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      category: form.category,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      city: form.city,
      quantity: Number(form.quantity),
      lowStockThreshold: Number(form.lowStockThreshold),
    };
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const body = payload();
      const saved = editingId
        ? await api(`/products/${editingId}`, { method: 'PUT', body })
        : await api('/products', { method: 'POST', body });

      if (file) {
        const data = new FormData();
        data.append('file', file);
        await api(`/products/${saved.id}/images`, { method: 'POST', formData: data });
      }

      setSuccess(editingId ? `Updated "${saved.name}" successfully!` : `Created "${saved.name}" with image!`);
      setTimeout(() => setSuccess(''), 4000);
      resetForm();
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function onDirectPhotoUpload(productId, fileObj) {
    if (!fileObj) return;
    setError('');
    setSuccess('');
    const data = new FormData();
    data.append('file', fileObj);
    try {
      await api(`/products/${productId}/images`, { method: 'POST', formData: data });
      setSuccess('Photo uploaded successfully!');
      setTimeout(() => setSuccess(''), 4000);
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function onDelete(id) {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api(`/products/${id}`, { method: 'DELETE' });
      if (editingId === id) resetForm();
      setSuccess('Product deleted successfully.');
      setTimeout(() => setSuccess(''), 3000);
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function setOrderStatus(id, status) {
    try {
      await api(`/orders/${id}/status`, { method: 'PATCH', body: { status } });
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  const pending = me && me.status !== 'APPROVED';

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* Seller Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-slate-900">{me ? me.shopName : 'Seller Dashboard'}</h1>
            {me && <StatusBadge status={me.status} />}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {me?.city ? `Artisan Workshop in ${me.city} · ` : ''}Manage products, inventory, orders, and review shop performance.
          </p>
        </div>

        <button
          type="button"
          onClick={refresh}
          className="btn-secondary self-start sm:self-auto text-xs py-2 px-3.5"
        >
          ↻ Refresh All Data
        </button>
      </div>

      {pending && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-[1.125rem] text-amber-900 shadow-2xs">
          <p className="font-bold flex items-center gap-2">
            <span>⚠️</span> Seller Account Pending Approval
          </p>
          <p className="mt-1 text-sm text-amber-800">
            Your shop is currently under administrative review. You will receive an email once an administrator approves your account, unlocking product creations and inventory edits.
          </p>
        </div>
      )}

      {success && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 font-semibold shadow-2xs">
          ✓ {success}
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-red-700 font-medium shadow-2xs">
          ✕ {error}
        </div>
      )}

      {/* Analytics KPI Cards */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card-base p-5 bg-gradient-to-br from-white to-bazaar-50/50">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Sales Today</span>
            <p className="mt-2 text-3xl font-black text-bazaar-900">₹{Number(stats.salesToday).toFixed(2)}</p>
            <p className="mt-1 text-xs text-slate-500 font-medium">{stats.ordersToday} order{stats.ordersToday === 1 ? '' : 's'} placed today</p>
          </div>

          <div className="card-base p-5 bg-gradient-to-br from-white to-sky-50/40">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">This Week</span>
            <p className="mt-2 text-3xl font-black text-slate-900">₹{Number(stats.salesWeek).toFixed(2)}</p>
            <p className="mt-1 text-xs text-slate-500 font-medium">{stats.ordersWeek} total order{stats.ordersWeek === 1 ? '' : 's'}</p>
          </div>

          <div className="card-base p-5 bg-gradient-to-br from-white to-indigo-50/40">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">This Month</span>
              {stats.pendingOrders > 0 && (
                <span className="rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5">
                  {stats.pendingOrders} pending
                </span>
              )}
            </div>
            <p className="mt-2 text-3xl font-black text-slate-900">₹{Number(stats.salesMonth).toFixed(2)}</p>
            <p className="mt-1 text-xs text-slate-500 font-medium">{stats.ordersMonth} orders this month</p>
          </div>
        </div>
      )}

      {/* Top Products & Low Stock Alerts */}
      <div className="grid gap-6 md:grid-cols-2">
        {stats?.topProducts?.length > 0 && (
          <div className="card-base p-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>🏆</span> Best Selling Products
            </h2>
            <ul className="mt-3 divide-y divide-slate-100">
              {stats.topProducts.map((p) => (
                <li key={p.productId} className="flex justify-between items-center py-2.5 text-sm">
                  <span className="font-semibold text-slate-800">{p.name}</span>
                  <div className="text-right">
                    <span className="font-bold text-bazaar-800">₹{Number(p.revenue).toFixed(2)}</span>
                    <span className="text-xs text-slate-400 block">{p.quantitySold} units sold</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {stats?.lowStock?.length > 0 && (
          <div className="card-base p-5 border-amber-200/80 bg-amber-50/20">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>⚠️</span> Low Stock Warnings
            </h2>
            <p className="mt-1 text-xs text-slate-500">Products currently at or below their reorder threshold:</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {stats.lowStock.map((p) => (
                <li key={p.id}>
                  <StatusBadge status="low">
                    {p.name}: only {p.quantity} left
                  </StatusBadge>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Incoming Orders Section */}
      <div className="card-base p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Incoming Customer Orders</h2>
            <p className="text-xs text-slate-500">Review, accept, ship, and complete order shipments.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {orders.length} order{orders.length === 1 ? '' : 's'}
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="No orders received yet">
              Customer orders placed for your shop will appear here with one-click fulfillment controls.
            </EmptyState>
          </div>
        ) : (
          <ul className="mt-4 space-y-3.5">
            {orders.map((o) => (
              <li key={o.id} className="rounded-2xl border border-slate-200/90 bg-white p-[1.125rem] shadow-2xs hover:border-slate-300 transition">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-base font-bold text-slate-900">
                      Order #{o.id}
                    </span>
                    <span className="ml-2 text-sm text-slate-500 font-medium">
                      from {o.customerName}
                    </span>
                    <span className="ml-3 font-bold text-bazaar-800">
                      ₹{Number(o.totalAmount).toFixed(2)}
                    </span>
                  </div>
                  <StatusBadge status={o.status} />
                </div>

                <div className="mt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
                  <p>📍 <span className="font-medium text-slate-700">Ship to:</span> {o.shippingAddress}</p>
                </div>

                <div className="mt-2.5 rounded-xl bg-slate-50/70 p-2.5 text-xs text-slate-700 font-medium space-y-1">
                  {o.items.map((item) => (
                    <div key={item.productId} className="flex justify-between">
                      <span>• {item.name} × <strong className="text-slate-900">{item.quantity}</strong></span>
                      <span>₹{(Number(item.unitPrice) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3.5 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                  {(NEXT[o.status] || []).map((action) => (
                    <button
                      key={action.status}
                      className={`rounded-xl px-4 py-2 text-xs shadow-xs transition duration-150 ${
                        ACTION_STYLES[action.status] || 'btn-secondary'
                      }`}
                      type="button"
                      onClick={() => setOrderStatus(o.id, action.status)}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Product Management Form & Product List */}
      <div id="product-form" className="grid gap-8 lg:grid-cols-[1.1fr_1fr] items-start">
        {/* Add/Edit Product Form with Image Upload & Live Preview */}
        <form className="card-base p-6 space-y-4" onSubmit={onSubmit}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h2>
              <p className="text-xs text-slate-500">
                {editingId ? 'Update pricing, inventory, or image.' : 'Add your handcrafted item to the catalog.'}
              </p>
            </div>
            {editingId && (
              <span className="rounded-full bg-bazaar-100 text-bazaar-800 px-2.5 py-0.5 text-xs font-semibold">
                Editing #{editingId}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Product Title *</label>
            <input
              className="input"
              placeholder="e.g. Handmade Olive Oil Soap"
              value={form.name}
              onChange={update('name')}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <textarea
              className="input min-h-[90px]"
              placeholder="Describe materials, process, size, and care instructions..."
              value={form.description}
              onChange={update('description')}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹) *</label>
              <input
                className="input"
                type="number"
                min="0"
                step="0.01"
                placeholder="149.00"
                value={form.price}
                onChange={update('price')}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <input
                className="input"
                placeholder="soap, pottery, home..."
                value={form.category}
                onChange={update('category')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tags</label>
              <input
                className="input"
                placeholder="soap, organic, herbal"
                value={form.tags}
                onChange={update('tags')}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City / Workshop Location</label>
              <input
                className="input"
                placeholder="Pune, Jaipur, Mumbai..."
                value={form.city}
                onChange={update('city')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Initial Stock Quantity *</label>
              <input
                className="input"
                type="number"
                min="0"
                value={form.quantity}
                onChange={update('quantity')}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Low-Stock Alert Threshold</label>
              <input
                className="input"
                type="number"
                min="0"
                value={form.lowStockThreshold}
                onChange={update('lowStockThreshold')}
              />
            </div>
          </div>

          {/* Decorated Image Upload Zone with Live Preview */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Product Image (JPG, PNG, WebP)
            </label>

            {filePreview ? (
              <div className="relative rounded-2xl border border-bazaar-300 bg-bazaar-50/50 p-3 flex items-center gap-3">
                <img
                  src={filePreview}
                  alt="Selected Preview"
                  className="h-20 w-20 rounded-xl object-cover border border-slate-200 shadow-xs"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 truncate">{file?.name}</p>
                  <p className="text-[11px] text-slate-500">{(file?.size / 1024).toFixed(1)} KB · Ready to upload</p>
                  <button
                    type="button"
                    onClick={clearSelectedFile}
                    className="mt-1.5 text-xs text-red-600 font-semibold hover:underline"
                  >
                    ✕ Remove image
                  </button>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/60 p-6 text-center hover:border-bazaar-500 hover:bg-bazaar-50/40 transition">
                <span className="text-3xl">📷</span>
                <span className="mt-2 text-xs font-bold text-slate-700">Click or browse to select an image</span>
                <span className="mt-0.5 text-[11px] text-slate-400">PNG, JPG, WEBP up to 8MB</span>
                <input
                  ref={fileInputRef}
                  className="hidden"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleFileSelect}
                />
              </label>
            )}
          </div>

          <div className="flex gap-2.5 pt-3 border-t border-slate-100">
            <button className="btn-primary flex-1" type="submit" disabled={saving}>
              {saving ? 'Saving product…' : editingId ? 'Update Product' : 'Add to Catalog'}
            </button>
            {editingId && (
              <button className="btn-secondary" type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Existing Products List with Instant Photo Upload Action */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Your Catalog ({products.length})</h2>
            <span className="text-xs text-slate-500">Sellers in City Crafts</span>
          </div>

          {products.length === 0 ? (
            <EmptyState title="No products in catalog">
              Use the form on the left to list your first handcrafted item.
            </EmptyState>
          ) : (
            <ul className="space-y-3">
              {products.map((p) => {
                const img = p.imageUrls?.[0];
                return (
                  <li
                    key={p.id}
                    className="card-base p-3.5 flex flex-col sm:flex-row gap-3.5 items-start sm:items-center justify-between hover:border-slate-300 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-200 relative group">
                        {img ? (
                          <img src={img} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center text-[10px] text-slate-400 font-semibold bg-bazaar-50">
                            No photo
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <Link
                          to={`/products/${p.id}`}
                          className="font-bold text-slate-900 hover:text-bazaar-700 hover:underline line-clamp-1 text-sm"
                        >
                          {p.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-bold text-bazaar-800">
                            ₹{Number(p.price).toFixed(2)}
                          </span>
                          <span className="text-xs text-slate-500">· Stock: {p.quantity}</span>
                          {p.lowStock && <StatusBadge status="low">Low</StatusBadge>}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 w-full sm:w-auto justify-end">
                      {/* One-click photo upload for any product */}
                      <label className="cursor-pointer inline-flex items-center gap-1 rounded-lg border border-bazaar-200 bg-bazaar-50/80 px-2.5 py-1 text-xs font-semibold text-bazaar-800 hover:bg-bazaar-100 shadow-2xs transition">
                        <span>📷</span>
                        <span>{img ? 'Change' : 'Add Photo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => onDirectPhotoUpload(p.id, e.target.files?.[0])}
                        />
                      </label>

                      <button
                        className="btn-secondary text-xs py-1 px-2.5"
                        type="button"
                        onClick={() => startEdit(p)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn-danger text-xs py-1 px-2.5"
                        type="button"
                        onClick={() => onDelete(p.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

