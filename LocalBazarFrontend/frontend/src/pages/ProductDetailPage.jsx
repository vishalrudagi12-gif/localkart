import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import ProductCard from '../components/ProductCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { addItem } from '../store/cartSlice.js';

export default function ProductDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const role = useSelector((s) => s.auth.user?.role);
  const user = useSelector((s) => s.auth.user);
  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setAdded(false);
    setQty(1);
    setError('');
    setReviewError('');
    setReviewSuccess('');
    api(`/products/${id}`)
      .then(setProduct)
      .catch((err) => setError(err.message));
    api(`/products/${id}/similar`)
      .then(setSimilar)
      .catch(() => setSimilar([]));
    api(`/reviews?productId=${id}`)
      .then(setReviews)
      .catch(() => setReviews([]));
  }, [id]);

  if (error) {
    return (
      <div className="card-base p-8 text-center max-w-md mx-auto">
        <span className="text-4xl">🔍</span>
        <h2 className="mt-2 text-lg font-bold text-slate-900">{error}</h2>
        <Link className="mt-4 inline-block btn-primary text-xs" to="/">
          ← Back to Shop Catalog
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mt-12 text-center text-slate-400 font-medium">
        <span className="inline-block animate-spin mr-2">⏳</span> Loading handcrafted item details…
      </div>
    );
  }

  const img = product.imageUrls?.[0];

  function addToCart() {
    dispatch(
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: qty,
        imageUrl: img,
        shopName: product.shopName,
      })
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  }

  async function submitReview(e) {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');
    try {
      const created = await api('/reviews', {
        method: 'POST',
        body: { productId: product.id, rating: Number(rating), comment },
      });
      setReviews((list) => [created, ...list]);
      setComment('');
      setReviewSuccess('Thank you! Your review was published.');
      setTimeout(() => setReviewSuccess(''), 4000);
    } catch (err) {
      setReviewError(err.message);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-bazaar-700 transition">
          Shop
        </Link>
        <span>/</span>
        {product.category && (
          <>
            <span className="capitalize">{product.category}</span>
            <span>/</span>
          </>
        )}
        <span className="text-slate-900 font-semibold truncate max-w-[200px]">
          {product.name}
        </span>
      </nav>

      {/* Main Showcase Grid */}
      <div className="grid gap-10 lg:grid-cols-2 items-start">
        {/* Product Image Area */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-bazaar-50 to-slate-100 shadow-soft">
          {img ? (
            <img
              src={img}
              alt={product.name}
              className="h-96 sm:h-[450px] w-full object-cover transition duration-300"
            />
          ) : (
            <div className="flex h-96 sm:h-[450px] flex-col items-center justify-center p-6 text-center">
              <span className="text-5xl opacity-40">✨</span>
              <span className="mt-3 text-sm font-bold text-bazaar-800/60 uppercase tracking-wider">
                {product.category || 'Handcrafted Artisan Item'}
              </span>
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-bazaar-100 px-3 py-1 text-xs font-bold text-bazaar-900 capitalize">
                {product.category || 'Artisan Goods'}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                📍 {product.city || 'Local Workshop'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span>Crafted by</span>
              <span className="font-bold text-slate-900 underline decoration-bazaar-300 underline-offset-4">
                {product.shopName}
              </span>
            </div>

            <div className="pt-2">
              <span className="text-3xl sm:text-4xl font-black text-bazaar-800">
                ₹{Number(product.price).toFixed(2)}
              </span>
            </div>

            <p className="whitespace-pre-wrap text-sm sm:text-base text-slate-600 leading-relaxed pt-2">
              {product.description || 'Gentle, natural, and handcrafted by experienced local artisans using traditional techniques.'}
            </p>

            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    product.quantity > 0 ? 'bg-emerald-500' : 'bg-red-500'
                  }`}
                />
                <span className={product.quantity > 0 ? 'text-emerald-800' : 'text-red-600'}>
                  {product.quantity > 0 ? `${product.quantity} units available` : 'Currently out of stock'}
                </span>
              </span>
              {product.lowStock && product.quantity > 0 && <StatusBadge status="low">Low Stock Alert</StatusBadge>}
            </div>
          </div>

          {/* Add to Cart Controls */}
          {role !== 'SELLER' && role !== 'ADMIN' && (
            <div className="card-base p-5 bg-gradient-to-br from-white to-bazaar-50/40 border-bazaar-200/80 space-y-3">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center rounded-xl border border-slate-300 bg-white p-1 shadow-2xs">
                  <button
                    type="button"
                    className="h-8 w-8 rounded-lg text-slate-600 hover:bg-slate-100 font-bold transition flex items-center justify-center"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    disabled={qty <= 1 || product.quantity < 1}
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-slate-900">{qty}</span>
                  <button
                    type="button"
                    className="h-8 w-8 rounded-lg text-slate-600 hover:bg-slate-100 font-bold transition flex items-center justify-center"
                    onClick={() => setQty(Math.min(product.quantity, qty + 1))}
                    disabled={qty >= product.quantity}
                  >
                    +
                  </button>
                </div>

                <button
                  className="btn-primary flex-1 py-3 text-base shadow-xs"
                  type="button"
                  onClick={addToCart}
                  disabled={product.quantity < 1}
                >
                  {added ? '✓ Added to Cart!' : '🛒 Add to Cart'}
                </button>
              </div>

              {added && (
                <div className="flex items-center justify-between text-xs text-bazaar-900 pt-1 font-semibold">
                  <span>Item added to your order!</span>
                  <Link to="/cart" className="text-bazaar-700 underline hover:text-bazaar-900">
                    View Cart & Checkout →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Similar Products Recommendation */}
      {similar.length > 0 && (
        <section className="border-t border-slate-200/80 pt-10 space-y-5">
          <div className="flex items-baseline justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Similar Products You May Like</h2>
              <p className="text-xs text-slate-500">More handcrafted items in <strong className="capitalize">{product.category}</strong></p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Customer Reviews Section */}
      <section className="border-t border-slate-200/80 pt-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Verified Customer Reviews</h2>
            <p className="text-xs text-slate-500">Feedback from shoppers who purchased from {product.shopName}.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {reviews.length} review{reviews.length === 1 ? '' : 's'}
          </span>
        </div>

        {reviews.length === 0 ? (
          <div className="card-base p-6 text-center text-slate-500 text-sm">
            <span>⭐</span> No reviews yet for this product. Be the first customer to share your thoughts!
          </div>
        ) : (
          <ul className="grid gap-3.5 sm:grid-cols-2">
            {reviews.map((r) => (
              <li key={r.id} className="card-base p-[1.125rem] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-bazaar-100 text-bazaar-800 text-xs font-bold">
                      {r.customerName?.[0] || 'C'}
                    </span>
                    <span className="text-xs font-bold text-slate-800">{r.customerName}</span>
                  </div>
                  <span className="text-amber-500 text-sm font-bold">
                    {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                  </span>
                </div>
                {r.comment && (
                  <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50/70 p-2.5 rounded-xl">
                    &ldquo;{r.comment}&rdquo;
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Customer Write a Review Form */}
        {user?.role === 'CUSTOMER' && (
          <form className="card-base p-6 max-w-lg space-y-4" onSubmit={submitReview}>
            <div>
              <h3 className="text-base font-bold text-slate-900">Write a Product Review</h3>
              <p className="text-xs text-slate-500">Share your experience to help local artisans and other buyers.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Your Rating</label>
              <select className="input" value={rating} onChange={(e) => setRating(e.target.value)}>
                <option value={5}>★★★★★ (5 Stars - Outstanding)</option>
                <option value={4}>★★★★☆ (4 Stars - Very Good)</option>
                <option value={3}>★★★☆☆ (3 Stars - Average)</option>
                <option value={2}>★★☆☆☆ (2 Stars - Below Expectations)</option>
                <option value={1}>★☆☆☆☆ (1 Star - Poor)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Your Comments</label>
              <textarea
                className="input min-h-[80px]"
                placeholder="What did you love about this product? How did it feel, smell, or look?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            {reviewSuccess && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 font-semibold">
                ✓ {reviewSuccess}
              </div>
            )}

            {reviewError && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-semibold">
                ✕ {reviewError}
              </div>
            )}

            <button className="btn-primary" type="submit">
              Submit Review
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
