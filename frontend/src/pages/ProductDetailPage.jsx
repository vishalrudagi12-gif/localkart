import { useParams } from 'react-router-dom';

export default function ProductDetailPage() {
  const { id } = useParams();
  return (
    <section>
      <h1 className="text-2xl font-semibold">Product {id}</h1>
      <p className="mt-2 text-slate-500">Detail, reviews, and similar products come next.</p>
    </section>
  );
}
