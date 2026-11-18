import { useCallback, useEffect, useState } from 'react';
import { ArrowLeftRight, Pencil, Plus, Trash2 } from 'lucide-react';
import api, { getErrorMessage } from '../services/api.js';
import { formatDate, formatMoney } from '../utils/format.js';
import { TODAS_LAS_CATEGORIAS } from '../utils/constants.js';
import Modal from '../components/Modal.jsx';
import TransactionForm from '../components/TransactionForm.jsx';
import Spinner from '../components/Spinner.jsx';
import ErrorAlert from '../components/ErrorAlert.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Transactions() {
  const [items, setItems] = useState([]);
  const [resumen, setResumen] = useState({ ingresos: 0, egresos: 0, balance: 0 });
  const [filters, setFilters] = useState({ tipo: '', categoria: '', mes: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null); // { editing: tx | null }

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.tipo) params.tipo = filters.tipo;
      if (filters.categoria) params.categoria = filters.categoria;
      if (filters.mes) [params.anio, params.mes] = filters.mes.split('-');
      const res = await api.get('/transactions', { params });
      setItems(res.data.transacciones);
      setResumen(res.data.resumen);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const setFilter = (k, v) => setFilters((f) => ({ ...f, [k]: v }));
  const hasFilters = filters.tipo || filters.categoria || filters.mes;

  const save = async (payload) => {
    if (modal.editing) await api.put(`/transactions/${modal.editing._id}`, payload);
    else await api.post('/transactions', payload);
    setModal(null);
    await load();
  };

  const remove = async (tx) => {
    if (!window.confirm(`¿Eliminar este movimiento de ${formatMoney(tx.monto)}?`)) return;
    try {
      await api.delete(`/transactions/${tx._id}`);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Movimientos</h1>
          <p className="text-sm text-slate-500">Tus ingresos y egresos, con filtros por tipo, categoría y mes.</p>
        </div>
        <button onClick={() => setModal({ editing: null })} className="btn-primary">
          <Plus className="h-4 w-4" aria-hidden="true" /> Nuevo movimiento
        </button>
      </div>

      <section className="card grid gap-3 sm:grid-cols-4" aria-label="Filtros">
        <div>
          <label htmlFor="f-tipo" className="label">Tipo</label>
          <select id="f-tipo" className="input" value={filters.tipo} onChange={(e) => setFilter('tipo', e.target.value)}>
            <option value="">Todos</option>
            <option value="ingreso">Ingresos</option>
            <option value="egreso">Egresos</option>
          </select>
        </div>
        <div>
          <label htmlFor="f-cat" className="label">Categoría</label>
          <select id="f-cat" className="input" value={filters.categoria} onChange={(e) => setFilter('categoria', e.target.value)}>
            <option value="">Todas</option>
            {TODAS_LAS_CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="f-mes" className="label">Mes</label>
          <input id="f-mes" type="month" className="input" value={filters.mes} onChange={(e) => setFilter('mes', e.target.value)} />
        </div>
        <div className="flex items-end">
          <button onClick={() => setFilters({ tipo: '', categoria: '', mes: '' })} disabled={!hasFilters} className="btn-ghost w-full">Limpiar filtros</button>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3 text-center sm:gap-4" aria-label="Totales del filtro">
        <div className="card !p-4"><p className="text-xs font-semibold text-slate-500">Ingresos</p><p className="mt-1 text-sm font-extrabold text-emerald-600 sm:text-lg">{formatMoney(resumen.ingresos)}</p></div>
        <div className="card !p-4"><p className="text-xs font-semibold text-slate-500">Egresos</p><p className="mt-1 text-sm font-extrabold text-rose-600 sm:text-lg">{formatMoney(resumen.egresos)}</p></div>
        <div className="card !p-4"><p className="text-xs font-semibold text-slate-500">Balance</p><p className="mt-1 text-sm font-extrabold text-indigo-700 sm:text-lg">{formatMoney(resumen.balance)}</p></div>
      </section>

      <ErrorAlert message={error} onRetry={load} />

      <section className="card !p-0 overflow-hidden">
        {loading ? (
          <Spinner label="Cargando movimientos…" />
        ) : items.length === 0 ? (
          <EmptyState
            icon={ArrowLeftRight}
            title={hasFilters ? 'Ningún movimiento coincide con los filtros' : 'Aún no registras movimientos'}
            text={hasFilters ? 'Prueba con otro tipo, categoría o mes.' : 'Agrega tu primer ingreso o egreso para empezar.'}
            action={!hasFilters && <button onClick={() => setModal({ editing: null })} className="btn-primary">Nuevo movimiento</button>}
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((t) => (
              <li key={t._id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                <span className={`h-9 w-1.5 shrink-0 rounded-full ${t.tipo === 'ingreso' ? 'bg-emerald-500' : 'bg-rose-500'}`} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-800">{t.descripcion || t.categoria}</p>
                  <p className="text-xs text-slate-500">{t.categoria} · {formatDate(t.fecha)}{t.meta ? ' · Ahorro' : ''}</p>
                </div>
                <span className={`shrink-0 text-sm font-extrabold ${t.tipo === 'ingreso' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {t.tipo === 'ingreso' ? '+' : '−'}{formatMoney(t.monto)}
                </span>
                <div className="flex shrink-0 gap-1">
                  <button onClick={() => setModal({ editing: t })} aria-label="Editar movimiento" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => remove(t)} aria-label="Eliminar movimiento" className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {modal && (
        <Modal title={modal.editing ? 'Editar movimiento' : 'Nuevo movimiento'} onClose={() => setModal(null)}>
          <TransactionForm initial={modal.editing} onSubmit={save} onCancel={() => setModal(null)} />
        </Modal>
      )}
    </div>
  );
}
