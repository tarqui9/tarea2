import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownCircle, ArrowUpCircle, PiggyBank, Wallet, Receipt, Target } from 'lucide-react';
import api, { getErrorMessage } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { currentMonthInput, formatDate, formatMoney, monthLabel } from '../utils/format.js';
import { GOAL_COLORS, GOAL_ICONS } from '../utils/constants.js';
import KpiCard from '../components/KpiCard.jsx';
import CategoryBars from '../components/CategoryBars.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import Spinner from '../components/Spinner.jsx';
import ErrorAlert from '../components/ErrorAlert.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [month, setMonth] = useState(currentMonthInput());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [anio, mes] = month.split('-');
      const res = await api.get('/dashboard', { params: { anio, mes } });
      setData(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => { load(); }, [load]);

  const totalGastos = data?.kpis.gastosMes || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Hola, {user?.nombre?.split(' ')[0]}</h1>
          <p className="text-sm capitalize text-slate-500">Resumen de {monthLabel(month)}</p>
        </div>
        <div>
          <label htmlFor="mes" className="sr-only">Mes a consultar</label>
          <input id="mes" type="month" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} className="input !w-auto" />
        </div>
      </div>

      <ErrorAlert message={error} onRetry={load} />
      {loading && !data && <Spinner label="Calculando tu resumen…" />}

      {data && (
        <div className={loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Indicadores">
            <KpiCard highlight label="Balance total" value={formatMoney(data.kpis.balanceTotal)} icon={Wallet} hint="Ingresos menos egresos, de todo el historial" />
            <KpiCard label="Ingresos del mes" value={formatMoney(data.kpis.ingresosMes)} icon={ArrowUpCircle} tone="emerald" />
            <KpiCard label="Gastos del mes" value={formatMoney(data.kpis.gastosMes)} icon={ArrowDownCircle} tone="rose" />
            <KpiCard label="Total ahorrado" value={formatMoney(data.kpis.totalAhorrado)} icon={PiggyBank} tone="amber" hint={`En ${data.totalMetas} ${data.totalMetas === 1 ? 'meta' : 'metas'}`} />
          </section>

          <div className="mt-6 grid gap-6 lg:grid-cols-5">
            <section className="card lg:col-span-3">
              <h2 className="text-lg font-extrabold text-slate-900">Gastos por categoría</h2>
              <p className="mb-5 text-sm text-slate-500">Cómo se reparte tu gasto de {formatMoney(totalGastos)} este mes.</p>
              {data.gastosPorCategoria.length ? (
                <CategoryBars items={data.gastosPorCategoria} />
              ) : (
                <EmptyState icon={Receipt} title="Sin gastos en este mes" text="Registra un egreso para ver cómo se distribuye por categoría."
                  action={<Link to="/movimientos" className="btn-primary">Registrar movimiento</Link>} />
              )}
            </section>

            <section className="card lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-slate-900">Metas activas</h2>
                <Link to="/metas" className="text-sm font-bold text-indigo-600 hover:underline">Ver todas</Link>
              </div>
              {data.metasActivas.length ? (
                <ul className="space-y-5">
                  {data.metasActivas.map((g) => {
                    const Icon = GOAL_ICONS[g.icono] || Target;
                    const color = GOAL_COLORS[g.color] || GOAL_COLORS.emerald;
                    return (
                      <li key={g.id}>
                        <div className="mb-1.5 flex items-center gap-2.5">
                          <div className={`rounded-lg p-1.5 ${color.soft}`}><Icon className="h-4 w-4" aria-hidden="true" /></div>
                          <span className="flex-1 truncate text-sm font-bold text-slate-800">{g.titulo}</span>
                          <span className="text-sm font-extrabold text-slate-700">{g.progreso}%</span>
                        </div>
                        <ProgressBar value={g.progreso} barClass={color.bar} label={`Progreso de ${g.titulo}`} />
                        <p className="mt-1 text-xs text-slate-500">{formatMoney(g.montoActual)} de {formatMoney(g.montoObjetivo)}</p>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <EmptyState icon={Target} title="Aún no tienes metas activas" text="Crea una meta y ve cuánto te falta para alcanzarla."
                  action={<Link to="/metas" className="btn-success">Crear meta</Link>} />
              )}
            </section>
          </div>

          <section className="card mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900">Últimos movimientos</h2>
              <Link to="/movimientos" className="text-sm font-bold text-indigo-600 hover:underline">Ver todos</Link>
            </div>
            {data.recientes.length ? (
              <ul className="divide-y divide-slate-100">
                {data.recientes.map((t) => (
                  <li key={t._id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-800">{t.descripcion || t.categoria}</p>
                      <p className="text-xs text-slate-500">{t.categoria} · {formatDate(t.fecha)}</p>
                    </div>
                    <span className={`shrink-0 text-sm font-extrabold ${t.tipo === 'ingreso' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {t.tipo === 'ingreso' ? '+' : '−'}{formatMoney(t.monto)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-6 text-center text-sm text-slate-500">Todavía no hay movimientos registrados.</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
