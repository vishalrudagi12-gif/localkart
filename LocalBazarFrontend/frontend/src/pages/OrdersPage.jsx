import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';
import { api } from '../api/client.js';
import EmptyState from '../components/EmptyState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

const STEPS = ['PENDING', 'ACCEPTED', 'SHIPPED', 'DELIVERED'];

function StepTimeline({ status }) {
  if (status === 'REJECTED' || status === 'CANCELLED') {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700">
        Order {status.toLowerCase()} by seller
      </div>
    );
  }

  const currentIndex = STEPS.indexOf(status);

  return (
    <div className="flex items-center gap-2 text-xs">
      {STEPS.map((step, idx) => {
        const isCompleted = currentIndex >= idx;
        const isCurrent = currentIndex === idx;
        return (
          <div key={step} className="flex items-center gap-1.5">
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                isCompleted
                  ? 'bg-bazaar-700 text-white shadow-2xs'
                  : 'bg-slate-200 text-slate-500'
              } ${isCurrent ? 'ring-2 ring-bazaar-400' : ''}`}
            >
              {isCompleted ? '✓' : idx + 1}
            </span>
            <span
              className={`hidden sm:inline font-medium capitalize ${
                isCurrent ? 'text-bazaar-800 font-bold' : isCompleted ? 'text-slate-700' : 'text-slate-400'
              }`}
            >
              {step.toLowerCase()}
            </span>
            {idx < STEPS.length - 1 && (
              <span className={`h-0.5 w-4 sm:w-6 ${isCompleted && currentIndex > idx ? 'bg-bazaar-600' : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function OrdersPage() {
  const user = useSelector((s) => s.auth.user);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const data = await api('/orders/mine');
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Your Orders</h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Track status and order history across local makers.
          </p>
        </div>
        <button
          type="button"
          onClick={loadOrders}
          disabled={loading}
          className="btn-secondary text-xs py-1.5 px-3"
        >
          {loading ? 'Refreshing…' : '↻ Refresh Status'}
        </button>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && orders.length === 0 && (
        <div className="mt-12 text-center text-slate-400 font-medium">
          <span className="inline-block animate-spin mr-2">⏳</span> Loading your orders…
        </div>
      )}

      {!loading && orders.length === 0 && !error && (
        <EmptyState title="No orders placed yet">
          <p>Explore unique handmade goods from local workshops and place your first order.</p>
          <div className="mt-4">
            <Link className="btn-primary" to="/">
              Browse Handmade Soaps & Crafts
            </Link>
          </div>
        </EmptyState>
      )}

      <ul className="space-y-4">
        {orders.map((o) => (
          <li key={o.id} className="card-base p-5 space-y-4 hover:border-slate-300 transition">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-slate-900">Order #{o.id}</span>
                  <span className="text-xs text-slate-500 font-medium">· from {o.shopName}</span>
                </div>
                {o.createdAt && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    Placed on {new Date(o.createdAt).toLocaleString()}
                  </p>
                )}
              </div>
              <StatusBadge status={o.status} />
            </div>

            {/* Stepper Timeline */}
            <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
              <StepTimeline status={o.status} />
            </div>

            {/* Line items list */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Ordered Items</p>
              <ul className="divide-y divide-slate-100">
                {o.items.map((item) => (
                  <li key={item.productId} className="flex items-center justify-between py-2 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-bazaar-50 border border-slate-200">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-bazaar-700">
                            Item
                          </div>
                        )}
                      </div>
                      <div>
                        <Link
                          to={`/products/${item.productId}`}
                          className="font-semibold text-slate-800 hover:text-bazaar-700 hover:underline"
                        >
                          {item.name}
                        </Link>
                        <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900">
                      ₹{(Number(item.unitPrice) * item.quantity).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
              <p>📍 <span className="font-semibold text-slate-700">Ship to:</span> {o.shippingAddress}</p>
              <p className="text-base font-black text-slate-900 self-end sm:self-auto">
                Total: <span className="text-bazaar-800">₹{Number(o.totalAmount).toFixed(2)}</span>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
