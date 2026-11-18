import { CATEGORY_BAR } from '../utils/constants.js';
import { formatMoney } from '../utils/format.js';
import ProgressBar from './ProgressBar.jsx';

export default function CategoryBars({ items }) {
  return (
    <ul className="space-y-4">
      {items.map((it) => (
        <li key={it.categoria}>
          <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
            <span className="flex items-center gap-2 font-semibold text-slate-700">
              <span className={`h-2.5 w-2.5 rounded-full ${CATEGORY_BAR[it.categoria] || 'bg-slate-400'}`} aria-hidden="true" />
              {it.categoria}
            </span>
            <span className="text-slate-500">
              <span className="font-bold text-slate-800">{formatMoney(it.total)}</span> · {it.porcentaje}%
            </span>
          </div>
          <ProgressBar value={it.porcentaje} barClass={CATEGORY_BAR[it.categoria] || 'bg-slate-400'} label={`${it.categoria} ${it.porcentaje}%`} />
        </li>
      ))}
    </ul>
  );
}
