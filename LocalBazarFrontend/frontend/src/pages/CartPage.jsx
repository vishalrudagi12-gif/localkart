import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import EmptyState from '../components/EmptyState.jsx';
import { removeItem, setQuantity, clearCart } from '../store/cartSlice.js';

export default function CartPage() {
  const items = useSelector((s) => s.cart.items);
  const dispatch = useDispatch();
  const total = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Your Shopping Cart</h1>
          <p className="mt-0.5 text-xs text-slate-500">
            {items.length} item{items.length === 1 ? '' : 's'} from local artisan workshops
          </p>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={() => dispatch(clearCart())}
            className="text-xs font-semibold text-red-600 hover:text-red-800 transition"
          >
            Clear Entire Cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState title="Your cart is empty">
          <p>Discover unique handcrafted soaps, pottery, home decor, and gifts from your city.</p>
          <div className="mt-5">
            <Link to="/" className="btn-primary">
              ✨ Browse Marketplace
            </Link>
          </div>
        </EmptyState>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px] items-start">
          <ul className="space-y-3">
            {items.map((i) => (
              <li
                key={i.productId}
                className="card-base p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-bazaar-50 border border-slate-200">
                    {i.imageUrl ? (
                      <img src={i.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-bold text-bazaar-700">
                        Item
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/products/${i.productId}`}
                      className="font-bold text-slate-900 hover:text-bazaar-700 hover:underline text-base line-clamp-1"
                    >
                      {i.name}
                    </Link>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Maker: <span className="font-semibold text-slate-700">{i.shopName}</span>
                    </p>
                    <p className="text-sm font-bold text-bazaar-800 mt-1">
                      ₹{Number(i.price).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-0 pt-3 sm:pt-0">
                  <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                    <button
                      type="button"
                      className="h-7 w-7 rounded-lg text-slate-600 hover:bg-white font-bold transition flex items-center justify-center"
                      onClick={() =>
                        dispatch(setQuantity({ productId: i.productId, quantity: Math.max(1, i.quantity - 1) }))
                      }
                    >
                      -
                    </button>
                    <span className="w-9 text-center text-xs font-bold text-slate-900">
                      {i.quantity}
                    </span>
                    <button
                      type="button"
                      className="h-7 w-7 rounded-lg text-slate-600 hover:bg-white font-bold transition flex items-center justify-center"
                      onClick={() =>
                        dispatch(setQuantity({ productId: i.productId, quantity: i.quantity + 1 }))
                      }
                    >
                      +
                    </button>
                  </div>

                  <p className="w-20 text-right font-black text-slate-900 text-base">
                    ₹{(Number(i.price) * i.quantity).toFixed(2)}
                  </p>

                  <button
                    className="text-xs font-semibold text-slate-400 hover:text-red-600 p-1 transition"
                    type="button"
                    onClick={() => dispatch(removeItem(i.productId))}
                    title="Remove item"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* Decorated Order Summary */}
          <div className="card-base p-6 space-y-4 bg-gradient-to-br from-white to-bazaar-50/30">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Order Summary
            </h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Items ({items.reduce((acc, i) => acc + i.quantity, 0)})</span>
                <span className="font-semibold text-slate-800">₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Local Delivery</span>
                <span className="font-semibold text-emerald-700">FREE</span>
              </div>
            </div>

            <div className="rounded-xl bg-emerald-50 border border-emerald-200/80 p-2.5 text-xs text-emerald-800 font-medium">
              🎉 Free local delivery applied!
            </div>

            <div className="border-t border-slate-200/80 pt-3 flex justify-between items-baseline">
              <span className="text-base font-bold text-slate-900">Total</span>
              <span className="text-2xl font-black text-bazaar-800">₹{total.toFixed(2)}</span>
            </div>

            <Link to="/checkout" className="btn-primary w-full py-3 text-center block text-sm shadow-xs">
              Proceed to Checkout →
            </Link>

            <Link to="/" className="text-xs text-center block text-slate-500 hover:text-bazaar-700 underline font-medium">
              ← Continue shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
