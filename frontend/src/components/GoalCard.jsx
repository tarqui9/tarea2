import { CalendarDays, CheckCircle2, Pencil, Plus, Trash2 } from 'lucide-react';
import { GOAL_COLORS, GOAL_ICONS } from '../utils/constants.js';
import { daysUntil, formatDate, formatMoney } from '../utils/format.js';
import ProgressBar from './ProgressBar.jsx';

export default function GoalCard({ goal, onContribute, onEdit, onDelete }) {
  const Icon = GOAL_ICONS[goal.icono] || GOAL_ICONS.Target;
  const color = GOAL_COLORS[goal.color] || GOAL_COLORS.emerald;
  const done = goal.estado === 'Completada';
  const days = daysUntil(goal.fechaLimite);
  const restante = Math.max(0, goal.montoObjetivo - goal.montoActual);

  let plazo = `${days} días restantes`;
  if (done) plazo = 'Meta alcanzada';
  else if (days < 0) plazo = `Venció hace ${Math.abs(days)} días`;
  else if (days === 0) plazo = 'Vence hoy';
  else if (days === 1) plazo = 'Queda 1 día';

  return (
    <article className="card flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`rounded-xl p-2.5 ${color.soft}`}><Icon className="h-5 w-5" aria-hidden="true" /></div>
          <div>
            <h3 className="font-extrabold leading-tight text-slate-900">{goal.titulo}</h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" /> {formatDate(goal.fechaLimite)}
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
            done ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-50 text-indigo-700'
          }`}
        >
          {done && <CheckCircle2 className="mr-1 inline h-3.5 w-3.5 -mt-0.5" aria-hidden="true" />}
          {goal.estado}
        </span>
      </div>

      <div className="mt-5">
        <div className="mb-1.5 flex items-baseline justify-between text-sm">
          <span className="font-extrabold text-slate-900">{formatMoney(goal.montoActual)}</span>
          <span className="text-slate-500">de {formatMoney(goal.montoObjetivo)}</span>
        </div>
        <ProgressBar value={goal.progreso} barClass={done ? 'bg-emerald-500' : color.bar} label={`Progreso de ${goal.titulo}`} />
        <div className="mt-1.5 flex justify-between text-xs text-slate-500">
          <span className="font-bold text-slate-700">{goal.progreso}%</span>
          <span>{done ? plazo : `Faltan ${formatMoney(restante)} · ${plazo}`}</span>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
        <button onClick={() => onContribute(goal)} className="btn-success flex-1">
          <Plus className="h-4 w-4" aria-hidden="true" /> Abonar
        </button>
        <button onClick={() => onEdit(goal)} aria-label={`Editar ${goal.titulo}`} className="btn-ghost !px-3">
          <Pencil className="h-4 w-4" />
        </button>
        <button onClick={() => onDelete(goal)} aria-label={`Eliminar ${goal.titulo}`} className="btn-ghost !px-3 hover:!text-rose-600">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}
