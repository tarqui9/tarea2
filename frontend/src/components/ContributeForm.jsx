import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { formatMoney } from '../utils/format.js';
import { getErrorMessage } from '../services/api.js';
import ErrorAlert from './ErrorAlert.jsx';

export default function ContributeForm({ goal, onSubmit, onCancel }) {
  const [monto, setMonto] = useState('');
  const [registrar, setRegistrar] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const restante = Math.max(0, goal.montoObjetivo - goal.montoActual);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const value = Number(monto);
    if (!(value > 0)) return setError('El monto del abono debe ser mayor a 0.');
    setSaving(true);
    try {
      await onSubmit({ monto: value, registrarMovimiento: registrar });
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm text-slate-600">
        <span className="font-bold text-slate-800">{goal.titulo}</span> lleva {formatMoney(goal.montoActual)} de {formatMoney(goal.montoObjetivo)}.
        {restante > 0 ? ` Faltan ${formatMoney(restante)}.` : ' Ya alcanzaste la meta.'}
      </p>
      <div>
        <label htmlFor="abono" className="label">Monto a abonar</label>
        <input id="abono" type="number" step="0.01" min="0.01" required autoFocus className="input" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="0.00" />
      </div>
      <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={registrar} onChange={(e) => setRegistrar(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
        <span>Registrar también como movimiento de ahorro (egreso de tu balance, sin contar como gasto del mes)</span>
      </label>
      <ErrorAlert message={error} />
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className="btn-ghost">Cancelar</button>
        <button type="submit" disabled={saving} className="btn-success">
          {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Abonar a la meta
        </button>
      </div>
    </form>
  );
}
