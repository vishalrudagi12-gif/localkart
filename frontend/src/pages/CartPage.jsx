import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function CartPage() {
  const items = useSelector((s) => s.cart.items);
  return (
    <section>
      <h1 className="text-2xl font-semibold">Cart</h1>
      {items.length === 0 ? (
        <p className="mt-4 text-slate-500">Your cart is empty.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {items.map((i) => (
            <li key={i.productId} className="rounded-lg bg-white p-3">
              {i.name} × {i.quantity}
            </li>
          ))}
        </ul>
      )}
      <Link to="/checkout" className="btn-primary mt-6 inline-block">
        Checkout
      </Link>
    </section>
  );
}
