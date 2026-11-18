const TONES = {
  emerald: 'bg-emerald-100 text-emerald-700',
  rose: 'bg-rose-100 text-rose-700',
  indigo: 'bg-indigo-100 text-indigo-700',
  amber: 'bg-amber-100 text-amber-700',
};

export default function KpiCard({ label, value, icon: Icon, tone = 'indigo', highlight = false, hint }) {
  if (highlight) {
    return (
      <div className="rounded-2xl bg-indigo-600 p-5 text-white shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-indigo-100">{label}</p>
          <div className="rounded-lg bg-white/15 p-2"><Icon className="h-5 w-5" aria-hidden="true" /></div>
        </div>
        <p className="mt-3 text-2xl font-extrabold tracking-tight">{value}</p>
        {hint && <p className="mt-1 text-xs text-indigo-200">{hint}</p>}
      </div>
    );
  }
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <div className={`rounded-lg p-2 ${TONES[tone]}`}><Icon className="h-5 w-5" aria-hidden="true" /></div>
      </div>
      <p className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
