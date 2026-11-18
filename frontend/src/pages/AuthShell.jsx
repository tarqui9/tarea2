import { BarChart3, PiggyBank, TrendingUp } from 'lucide-react';

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-indigo-600 p-12 text-white lg:flex">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-white/15 p-1.5 text-emerald-300"><BarChart3 className="h-6 w-6" aria-hidden="true" /></div>
          <span className="text-xl font-extrabold">FinanzaPro</span>
        </div>
        <div>
          <h2 className="max-w-md text-4xl font-extrabold leading-tight">Sabe a dónde va tu dinero y cuándo llegas a tu meta.</h2>
          <ul className="mt-8 space-y-4 text-indigo-100">
            <li className="flex items-center gap-3"><TrendingUp className="h-5 w-5 text-emerald-300" aria-hidden="true" /> Ingresos y gastos por categoría, mes a mes</li>
            <li className="flex items-center gap-3"><PiggyBank className="h-5 w-5 text-emerald-300" aria-hidden="true" /> Metas de ahorro con progreso y fecha límite</li>
          </ul>
        </div>
        <p className="text-sm text-indigo-200">Tus datos son privados: solo tú ves tus movimientos y metas.</p>
      </aside>

      <section className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="rounded-lg bg-indigo-600 p-1.5 text-emerald-300"><BarChart3 className="h-5 w-5" aria-hidden="true" /></div>
            <span className="text-lg font-extrabold">FinanzaPro</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          <div className="mt-6">{children}</div>
          <p className="mt-6 text-center text-sm text-slate-600">{footer}</p>
        </div>
      </section>
    </div>
  );
}
