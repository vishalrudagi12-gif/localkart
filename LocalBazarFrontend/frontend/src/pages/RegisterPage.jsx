import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { api, toAuthUser } from '../api/client.js';
import { setCredentials } from '../store/authSlice.js';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CUSTOMER',
    shopName: '',
    city: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const body = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      };
      if (form.role === 'SELLER') {
        body.shopName = form.shopName;
        body.city = form.city;
      }
      const data = await api('/auth/register', { method: 'POST', body });
      dispatch(setCredentials(toAuthUser(data)));
      navigate(data.role === 'SELLER' ? '/seller' : '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="card-base p-7 sm:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Create an Account</h1>
          <p className="mt-1 text-xs text-slate-500">
            Join LocalBazaar as a buyer or independent local seller.
          </p>
        </div>

        {/* Role Toggle Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, role: 'CUSTOMER' }))}
            className={`py-2 text-xs font-bold rounded-xl transition ${
              form.role === 'CUSTOMER'
                ? 'bg-white text-bazaar-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            🛍️ I am a Buyer
          </button>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, role: 'SELLER' }))}
            className={`py-2 text-xs font-bold rounded-xl transition ${
              form.role === 'SELLER'
                ? 'bg-white text-bazaar-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            🏪 I am a Seller
          </button>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
            <input
              className="input"
              placeholder="Your name"
              value={form.name}
              onChange={update('name')}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={update('email')}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
            <input
              className="input"
              type="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={update('password')}
              minLength={6}
              required
            />
          </div>

          {form.role === 'SELLER' && (
            <div className="rounded-2xl border border-bazaar-200 bg-bazaar-50/50 p-4 space-y-3">
              <p className="text-xs font-bold text-bazaar-900">🏪 Workshop & Shop Information</p>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Shop / Brand Name *</label>
                <input
                  className="input"
                  placeholder="e.g. Earth & Clay Pottery"
                  value={form.shopName}
                  onChange={update('shopName')}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City / Workshop Location *</label>
                <input
                  className="input"
                  placeholder="e.g. Pune, Jaipur, Mysore..."
                  value={form.city}
                  onChange={update('city')}
                  required
                />
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-semibold">
              ✕ {error}
            </div>
          )}

          <button className="btn-primary w-full py-3 text-sm shadow-xs" type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Register Account'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link className="text-bazaar-800 font-bold underline hover:text-bazaar-900" to="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
