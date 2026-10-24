const STYLES = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  ACCEPTED: 'bg-sky-50 text-sky-700 border-sky-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
  SHIPPED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-slate-100 text-slate-600 border-slate-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  low: 'bg-amber-50 text-amber-700 border-amber-200',
  out: 'bg-red-50 text-red-700 border-red-200',
};

const DOTS = {
  PENDING: 'bg-amber-500',
  ACCEPTED: 'bg-sky-500',
  REJECTED: 'bg-red-500',
  SHIPPED: 'bg-indigo-500',
  DELIVERED: 'bg-emerald-500',
  CANCELLED: 'bg-slate-400',
  APPROVED: 'bg-emerald-500',
  low: 'bg-amber-500',
  out: 'bg-red-500',
};

export default function StatusBadge({ status, children }) {
  const key = status || '';
  const cls = STYLES[key] || 'bg-slate-50 text-slate-700 border-slate-200';
  const dot = DOTS[key] || 'bg-slate-400';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold shadow-2xs ${cls}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      <span className="capitalize">{children || String(key).toLowerCase().replaceAll('_', ' ')}</span>
    </span>
  );
}
