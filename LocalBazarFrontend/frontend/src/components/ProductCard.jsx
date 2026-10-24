import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge.jsx';

export default function ProductCard({ product }) {
  const img = product.imageUrls?.[0];

  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-bazaar-300 hover:shadow-lift"
    >
      <div className="relative h-52 w-full overflow-hidden bg-gradient-to-br from-bazaar-50 to-slate-100">
        {img ? (
          <img
            src={img}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
            <span className="text-3xl opacity-40">✨</span>
            <span className="mt-1 text-xs font-semibold text-bazaar-700/60 uppercase tracking-wider">
              {product.category || 'Handcrafted'}
            </span>
          </div>
        )}

        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
          {product.quantity < 1 ? (
            <StatusBadge status="out">Out of stock</StatusBadge>
          ) : product.lowStock ? (
            <StatusBadge status="low">Low stock</StatusBadge>
          ) : null}
        </div>

        {product.category && (
          <div className="absolute bottom-2.5 left-2.5">
            <span className="rounded-full bg-black/50 px-2.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm capitalize shadow-xs">
              {product.category}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between p-[1.125rem]">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-medium text-slate-700">{product.shopName}</span>
            {product.city && (
              <>
                <span>·</span>
                <span>{product.city}</span>
              </>
            )}
          </div>

          <h2 className="mt-1.5 text-base font-bold text-slate-900 group-hover:text-bazaar-700 transition-colors line-clamp-1">
            {product.name}
          </h2>

          <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {product.description || 'Handcrafted local product made with care.'}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <div>
            <span className="text-xs text-slate-400 font-medium block leading-none">Price</span>
            <span className="text-lg font-bold text-bazaar-800">
              ₹{Number(product.price).toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                product.quantity > 0 ? 'bg-emerald-500' : 'bg-red-500'
              }`}
            />
            <span
              className={`text-xs font-medium ${
                product.quantity > 0 ? 'text-slate-600' : 'text-red-600'
              }`}
            >
              {product.quantity > 0 ? `${product.quantity} in stock` : 'Sold out'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

