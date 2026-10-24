import { Link, NavLink, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice.js';

export default function Layout() {
  const cartCount = useSelector((s) => s.cart.items.reduce((n, i) => n + i.quantity, 0));
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();

  const navLinkClass = ({ isActive }) =>
    `transition text-sm font-medium ${
      isActive ? 'text-bazaar-700 font-semibold' : 'text-slate-600 hover:text-bazaar-700'
    }`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-bazaar-800">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-bazaar-700 text-white text-sm shadow-xs">
              LB
            </span>
            <span>Local<span className="text-bazaar-600">Bazaar</span></span>
          </Link>

          <nav className="flex items-center gap-5">
            <NavLink to="/" end className={navLinkClass}>
              Shop
            </NavLink>

            <NavLink to="/cart" className={({ isActive }) => `relative ${navLinkClass({ isActive })} flex items-center`}>
              Cart
              {cartCount > 0 && (
                <span className="ml-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-bazaar-700 px-1 text-[10px] font-bold text-white shadow-xs">
                  {cartCount}
                </span>
              )}
            </NavLink>

            {user ? (
              <>
                <NavLink to="/orders" className={navLinkClass}>
                  Orders
                </NavLink>

                {user.role === 'SELLER' && (
                  <NavLink to="/seller" className={navLinkClass}>
                    Seller
                  </NavLink>
                )}

                {user.role === 'ADMIN' && (
                  <NavLink to="/admin" className={navLinkClass}>
                    Admin
                  </NavLink>
                )}

                <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
                  <span className="text-xs text-slate-700 font-medium truncate max-w-[120px]">{user.name}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 uppercase tracking-wide">
                    {user.role}
                  </span>
                </div>

                <button
                  className="text-xs font-semibold text-slate-500 hover:text-red-600 transition pl-1"
                  type="button"
                  onClick={() => dispatch(logout())}
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <NavLink to="/login" className={navLinkClass}>
                  Login
                </NavLink>
                <Link to="/register" className="btn-primary py-1.5 px-3.5 text-xs shadow-xs">
                  Join
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p>LocalBazaar · Digital marketplace empowering small city enterprises & artisans.</p>
        <p className="mt-1 text-slate-400">Demo seed enabled at startup · Spring Boot 3 & React</p>
      </footer>
    </div>
  );
}
