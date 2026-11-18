import { Loader2 } from 'lucide-react';

export default function Spinner({ label = 'Cargando…', className = '' }) {
  return (
    <div role="status" className={`flex items-center justify-center gap-2 py-12 text-slate-500 ${className}`}>
      <Loader2 className="h-5 w-5 animate-spin text-indigo-600" aria-hidden="true" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
