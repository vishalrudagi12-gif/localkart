import { Link, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function Layout() {
  const cartCount = useSelector((s) => s.cart.items.reduce((n, i) => n + i.quantity, 0));
  const user = useSelector((s) => s.auth.user);

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-semibold text-bazaar-700">
            LocalBazaar
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/" className="hover:text-bazaar-700">
              Shop
            </Link>
            <Link to="/cart" className="hover:text-bazaar-700">
              Cart ({cartCount})
            </Link>
            {user ? (
              <>
                <Link to="/orders" className="hover:text-bazaar-700">
                  Orders
                </Link>
                {user.role === 'SELLER' && (
                  <Link to="/seller" className="hover:text-bazaar-700">
                    Seller
                  </Link>
                )}
                {user.role === 'ADMIN' && (
                  <Link to="/admin" className="hover:text-bazaar-700">
                    Admin
                  </Link>
                )}
                <span className="text-slate-500">{user.name}</span>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-bazaar-700">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Join
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
