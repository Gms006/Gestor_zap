export default function KpiCard({ title, value, subtitle }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
      <div className="text-slate-300 text-sm">{title}</div>
      <div className="text-3xl font-semibold mt-1 text-slate-100">{value ?? '—'}</div>
      {subtitle ? <div className="text-slate-400 text-xs mt-1">{subtitle}</div> : null}
    </div>
  );
}
