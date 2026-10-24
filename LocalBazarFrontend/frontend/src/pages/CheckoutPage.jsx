import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import EmptyState from '../components/EmptyState.jsx';
import { clearCart } from '../store/cartSlice.js';

export default function CheckoutPage() {
  const user = useSelector((s) => s.auth.user);
  const items = useSelector((s) => s.cart.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [address, setAddress] = useState('12 Demo Street, Pune 411001');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const total = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);

  if (!user) {
    return <Navigate to="/login" state={{ from: '/checkout' }} replace />;
  }
  if (user.role !== 'CUSTOMER') {
    return (
      <div className="card-base p-8 text-center max-w-lg mx-auto">
        <span className="text-4xl">⚠️</span>
        <h2 className="mt-2 text-lg font-bold text-slate-900">Checkout is for Customer Accounts</h2>
        <p className="mt-1 text-sm text-slate-500">
          You are currently logged in as {user.role}. Please log in as a customer (e.g. customer@test.com) to purchase products.
        </p>
        <div className="mt-4">
          <Link to="/login" className="btn-primary">
            Switch Account
          </Link>
        </div>
      </div>
    );
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api('/orders', {
        method: 'POST',
        body: {
          shippingAddress: address,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        },
      });
      dispatch(clearCart());
      navigate('/orders');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-slate-900">Checkout</h1>
        <EmptyState title="Nothing in your cart to checkout">
          <Link className="btn-primary mt-3 inline-block" to="/">
            Browse Products
          </Link>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-slate-200/80 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Order Checkout</h1>
        <p className="mt-1 text-xs text-slate-500">
          Stock is reserved directly from artisan inventory once your order is confirmed.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 items-start">
        {/* Left: Order Review */}
        <div className="space-y-4">
          <div className="card-base p-5 space-y-3">
            <h2 className="text-base font-bold text-slate-900">Items in Order ({items.length})</h2>
            <ul className="divide-y divide-slate-100">
              {items.map((i) => (
                <li key={i.productId} className="py-2.5 flex justify-between items-center text-sm">
                  <div>
                    <span className="font-semibold text-slate-800">{i.name}</span>
                    <span className="text-xs text-slate-400 block">
                      Qty: {i.quantity} × ₹{Number(i.price).toFixed(2)} ({i.shopName})
                    </span>
                  </div>
                  <span className="font-bold text-slate-900">
                    ₹{(Number(i.price) * i.quantity).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline">
              <span className="font-semibold text-slate-700">Total Due</span>
              <span className="text-2xl font-black text-bazaar-800">₹{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-bazaar-200 bg-bazaar-50/60 p-4 text-xs text-bazaar-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <span>🛡️</span> LocalBazaar Buyer Guarantee
            </p>
            <p className="text-bazaar-800 leading-relaxed">
              Every purchase directly supports independent city artisans. If multiple makers are selected, orders will be safely packaged and shipped individually.
            </p>
          </div>
        </div>

        {/* Right: Delivery & Payment Details Form */}
        <form className="card-base p-6 space-y-5" onSubmit={onSubmit}>
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            Shipping & Payment
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Delivery Address *
            </label>
            <textarea
              className="input min-h-[90px]"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full street address, apartment/house number, city, postal code..."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Payment Method
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 rounded-xl border border-bazaar-400 bg-bazaar-50/60 p-3 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="accent-bazaar-700"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Cash or UPI on Delivery</span>
                  <span className="text-[11px] text-slate-500">Pay conveniently after receiving and inspecting your items</span>
                </div>
              </label>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-medium">
              ✕ {error}
            </div>
          )}

          <button className="btn-primary w-full py-3.5 text-base shadow-xs" type="submit" disabled={saving}>
            {saving ? 'Placing your order…' : `Place Order (₹${total.toFixed(2)})`}
          </button>
        </form>
      </div>
    </div>
  );
}
