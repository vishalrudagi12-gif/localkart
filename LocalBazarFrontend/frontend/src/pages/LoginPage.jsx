import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api, toAuthUser } from '../api/client.js';
import { setCredentials } from '../store/authSlice.js';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectPath = location.state?.from;

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api('/auth/login', { method: 'POST', body: { email, password } });
      dispatch(setCredentials(toAuthUser(data)));
      const destination =
        data.role === 'SELLER'
          ? '/seller'
          : data.role === 'ADMIN'
          ? '/admin'
          : (redirectPath || '/');
      navigate(destination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function setDemoCredentials(demoEmail, demoPass) {
    setEmail(demoEmail);
    setPassword(demoPass);
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="card-base p-7 sm:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Welcome Back</h1>
          <p className="mt-1 text-xs text-slate-500">
            Sign in to access your local orders, cart, or seller dashboard.
          </p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-semibold">
              ✕ {error}
            </div>
          )}

          <button className="btn-primary w-full py-3 text-sm shadow-xs" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in to LocalBazaar'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          New to LocalBazaar?{' '}
          <Link className="text-bazaar-800 font-bold underline hover:text-bazaar-900" to="/register">
            Create an account
          </Link>
        </p>

        {/* 1-Click Quick Demo Login Shortcuts */}
        <div className="border-t border-slate-100 pt-5 space-y-2.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
            ⚡ Quick Demo Logins (Click to Autofill)
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setDemoCredentials('customer@test.com', 'secret1')}
              className="rounded-xl border border-slate-200 bg-slate-50/80 p-2 text-left hover:bg-bazaar-50 hover:border-bazaar-300 transition"
            >
              <span className="font-bold text-slate-800 block truncate">Demo Customer</span>
              <span className="text-[10px] text-slate-400">customer@test.com</span>
            </button>

            <button
              type="button"
              onClick={() => setDemoCredentials('seller@test.com', 'secret1')}
              className="rounded-xl border border-slate-200 bg-slate-50/80 p-2 text-left hover:bg-bazaar-50 hover:border-bazaar-300 transition"
            >
              <span className="font-bold text-slate-800 block truncate">City Crafts (Seller)</span>
              <span className="text-[10px] text-slate-400">seller@test.com</span>
            </button>

            <button
              type="button"
              onClick={() => setDemoCredentials('pottery@test.com', 'secret1')}
              className="rounded-xl border border-slate-200 bg-slate-50/80 p-2 text-left hover:bg-bazaar-50 hover:border-bazaar-300 transition"
            >
              <span className="font-bold text-slate-800 block truncate">Clay & Fire (Seller)</span>
              <span className="text-[10px] text-slate-400">pottery@test.com</span>
            </button>

            <button
              type="button"
              onClick={() => setDemoCredentials('admin@localbazaar.local', 'admin123')}
              className="rounded-xl border border-slate-200 bg-slate-50/80 p-2 text-left hover:bg-bazaar-50 hover:border-bazaar-300 transition"
            >
              <span className="font-bold text-slate-800 block truncate">Admin</span>
              <span className="text-[10px] text-slate-400">admin@localbazaar.local</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
