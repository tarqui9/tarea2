import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { GOAL_COLORS, GOAL_ICONS } from '../utils/constants.js';
import { toInputDate } from '../utils/format.js';
import { getErrorMessage } from '../services/api.js';
import ErrorAlert from './ErrorAlert.jsx';

export default function GoalForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    titulo: initial?.titulo || '',
    montoObjetivo: initial?.montoObjetivo ?? '',
    fechaLimite: initial ? toInputDate(initial.fechaLimite) : '',
    icono: initial?.icono || 'PiggyBank',
    color: initial?.color || 'emerald',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const montoObjetivo = Number(form.montoObjetivo);
    if (!form.titulo.trim()) return setError('Escribe un título para la meta.');
    if (!(montoObjetivo > 0)) return setError('El monto objetivo debe ser mayor a 0.');
    if (!form.fechaLimite) return setError('Selecciona una fecha límite.');
    setSaving(true);
    try {
      await onSubmit({ ...form, montoObjetivo });
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="titulo" className="label">Título</label>
        <input id="titulo" required maxLength={80} className="input" value={form.titulo} onChange={(e) => set('titulo', e.target.value)} placeholder="Ej.: Viaje a Uyuni" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="objetivo" className="label">Monto objetivo</label>
          <input id="objetivo" type="number" step="0.01" min="0.01" required className="input" value={form.montoObjetivo} onChange={(e) => set('montoObjetivo', e.target.value)} placeholder="0.00" />
        </div>
        <div>
          <label htmlFor="limite" className="label">Fecha límite</label>
          <input id="limite" type="date" required className="input" value={form.fechaLimite} onChange={(e) => set('fechaLimite', e.target.value)} />
        </div>
      </div>

      <fieldset>
        <legend className="label">Icono</legend>
        <div className="flex flex-wrap gap-2">
          {Object.entries(GOAL_ICONS).map(([name, Icon]) => (
            <button
              key={name}
              type="button"
              onClick={() => set('icono', name)}
              aria-label={name}
              aria-pressed={form.icono === name}
              className={`rounded-lg border p-2.5 transition-colors ${
                form.icono === name ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-5 w-5" />
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="label">Color</legend>
        <div className="flex gap-3">
          {Object.entries(GOAL_COLORS).map(([name, c]) => (
            <button
              key={name}
              type="button"
              onClick={() => set('color', name)}
              aria-label={`Color ${name}`}
              aria-pressed={form.color === name}
              className={`h-8 w-8 rounded-full ${c.dot} ${form.color === name ? 'ring-2 ring-slate-800 ring-offset-2' : ''}`}
            />
          ))}
        </div>
      </fieldset>

      <ErrorAlert message={error} />

      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className="btn-ghost">Cancelar</button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {initial ? 'Guardar cambios' : 'Crear meta'}
        </button>
      </div>
    </form>
  );
}
