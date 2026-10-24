import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { api } from '../api/client.js';
import EmptyState from '../components/EmptyState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function AdminPage() {
  const user = useSelector((s) => s.auth.user);
  const [sellers, setSellers] = useState([]);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    setError('');
    try {
      const data = await api('/admin/sellers');
      setSellers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.role !== 'ADMIN') return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== 'ADMIN') {
    return <p className="text-slate-600">Admin portal is for administrators only.</p>;
  }

  async function act(id, shopName, action) {
    setError('');
    setActionSuccess('');
    try {
      await api(`/admin/sellers/${id}/${action}`, { method: 'POST' });
      setActionSuccess(`Shop "${shopName}" is now ${action === 'approve' ? 'APPROVED' : 'REJECTED'}.`);
      setTimeout(() => setActionSuccess(''), 4000);
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Portal</h1>
          <p className="mt-1 text-sm text-slate-500">
            Review and approve seller registrations (SellerStatus). Unapproved sellers cannot add products.
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
        >
          {loading ? 'Refreshing…' : '↻ Refresh list'}
        </button>
      </div>

      {actionSuccess && (
        <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800">
          ✓ {actionSuccess}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && sellers.length === 0 && (
        <p className="mt-8 text-slate-500">Loading sellers…</p>
      )}

      {!loading && sellers.length === 0 ? (
        <EmptyState title="No sellers registered yet">
          New seller registrations will show up here for administrative review.
        </EmptyState>
      ) : (
        <div className="mt-6 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Registered Sellers ({sellers.length})
          </p>
          <ul className="space-y-3">
            {sellers.map((s) => (
              <li
                key={s.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition"
              >
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-lg font-bold text-slate-900">{s.shopName}</h2>
                    <StatusBadge status={s.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    Owner: <span className="font-medium text-slate-700">{s.ownerName}</span> ({s.email})
                    {s.city ? ` · ${s.city}` : ''} · <span className="font-medium">{s.productCount}</span> product{s.productCount === 1 ? '' : 's'}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 border-t sm:border-0 pt-3 sm:pt-0">
                  {s.status !== 'APPROVED' && (
                    <button
                      className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 text-xs shadow-sm transition"
                      type="button"
                      onClick={() => act(s.id, s.shopName, 'approve')}
                    >
                      ✓ Approve
                    </button>
                  )}
                  {s.status !== 'REJECTED' && (
                    <button
                      className="rounded-lg border border-red-300 text-red-600 hover:bg-red-50 font-medium px-3.5 py-2 text-xs transition"
                      type="button"
                      onClick={() => act(s.id, s.shopName, 'reject')}
                    >
                      ✕ Reject
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
