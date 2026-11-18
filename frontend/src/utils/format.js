// Cambia la moneda aquí (código ISO 4217) y la configuración regional
const LOCALE = 'es-BO';
const CURRENCY = 'BOB';

const money = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY, minimumFractionDigits: 2 });

export const formatMoney = (n) => money.format(Number(n) || 0);

// Las fechas se guardan en UTC (medianoche) para evitar desfases por zona horaria
export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(LOCALE, { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });

export const toInputDate = (iso) => (iso ? String(iso).slice(0, 10) : '');

export const todayInput = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const currentMonthInput = () => todayInput().slice(0, 7);

export const monthLabel = (ym) => {
  const [y, m] = ym.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString(LOCALE, { month: 'long', year: 'numeric', timeZone: 'UTC' });
};

export const daysUntil = (iso) => {
  const target = new Date(iso);
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.ceil((Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate()) - today) / 86400000);
};
