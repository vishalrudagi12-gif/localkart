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
    <section className="mx-auto max-w-md rounded-xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <p className="mt-1 text-sm text-slate-500">Customers and sellers register here.</p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <input className="input" placeholder="Full name" value={form.name} onChange={update('name')} required />
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={update('email')}
          required
        />
        <input
          className="input"
          type="password"
          placeholder="Password (min 6 characters)"
          value={form.password}
          onChange={update('password')}
          minLength={6}
          required
        />
        <select className="input" value={form.role} onChange={update('role')}>
          <option value="CUSTOMER">I am a customer</option>
          <option value="SELLER">I am a seller</option>
        </select>
        {form.role === 'SELLER' && (
          <>
            <input className="input" placeholder="Shop name" value={form.shopName} onChange={update('shopName')} />
            <input className="input" placeholder="City" value={form.city} onChange={update('city')} />
          </>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn-primary w-full" type="submit" disabled={loading}>
          {loading ? 'Creating…' : 'Register'}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-500">
        Already registered?{' '}
        <Link className="text-bazaar-700 underline" to="/login">
          Login
        </Link>
      </p>
    </section>
  );
}
