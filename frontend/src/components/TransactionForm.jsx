import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { CATEGORIAS_EGRESO, CATEGORIAS_INGRESO } from '../utils/constants.js';
import { todayInput, toInputDate } from '../utils/format.js';
import { getErrorMessage } from '../services/api.js';
import ErrorAlert from './ErrorAlert.jsx';

export default function TransactionForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    tipo: initial?.tipo || 'egreso',
    monto: initial?.monto ?? '',
    categoria: initial?.categoria || 'Alimentación',
    descripcion: initial?.descripcion || '',
    fecha: initial ? toInputDate(initial.fecha) : todayInput(),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const categorias = form.tipo === 'ingreso' ? CATEGORIAS_INGRESO : CATEGORIAS_EGRESO;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const setTipo = (tipo) => {
    const lista = tipo === 'ingreso' ? CATEGORIAS_INGRESO : CATEGORIAS_EGRESO;
    setForm((f) => ({ ...f, tipo, categoria: lista.includes(f.categoria) ? f.categoria : lista[0] }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const monto = Number(form.monto);
    if (!(monto > 0)) return setError('El monto debe ser mayor a 0.');
    if (!form.fecha) return setError('Selecciona una fecha.');
    setSaving(true);
    try {
      await onSubmit({ ...form, monto });
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1" role="group" aria-label="Tipo de movimiento">
        {['egreso', 'ingreso'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTipo(t)}
            aria-pressed={form.tipo === t}
            className={`rounded-lg py-2 text-sm font-bold transition-colors ${
              form.tipo === t ? (t === 'ingreso' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white') : 'text-slate-600 hover:bg-white'
            }`}
          >
            {t === 'ingreso' ? 'Ingreso' : 'Egreso'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="monto" className="label">Monto</label>
          <input id="monto" type="number" step="0.01" min="0.01" inputMode="decimal" required className="input" value={form.monto} onChange={(e) => set('monto', e.target.value)} placeholder="0.00" />
        </div>
        <div>
          <label htmlFor="fecha" className="label">Fecha</label>
          <input id="fecha" type="date" required className="input" value={form.fecha} onChange={(e) => set('fecha', e.target.value)} />
        </div>
      </div>

      <div>
        <label htmlFor="categoria" className="label">Categoría</label>
        <select id="categoria" className="input" value={form.categoria} onChange={(e) => set('categoria', e.target.value)}>
          {categorias.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="descripcion" className="label">Descripción <span className="font-normal text-slate-400">(opcional)</span></label>
        <input id="descripcion" maxLength={200} className="input" value={form.descripcion} onChange={(e) => set('descripcion', e.target.value)} placeholder="Ej.: Compras del supermercado" />
      </div>

      <ErrorAlert message={error} />

      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className="btn-ghost">Cancelar</button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {initial ? 'Guardar cambios' : 'Guardar movimiento'}
        </button>
      </div>
    </form>
  );
}
