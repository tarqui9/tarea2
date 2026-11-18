import { Target, Plane, Home, Car, GraduationCap, Laptop, HeartPulse, Gift, Umbrella, PiggyBank } from 'lucide-react';

export const CATEGORIAS_EGRESO = ['Alimentación', 'Transporte', 'Vivienda', 'Salud', 'Educación', 'Ocio', 'Otros'];
export const CATEGORIAS_INGRESO = ['Salario', 'Inversiones', 'Otros'];
export const TODAS_LAS_CATEGORIAS = ['Alimentación', 'Transporte', 'Vivienda', 'Salud', 'Educación', 'Ocio', 'Salario', 'Inversiones', 'Otros'];

// Clases completas (no dinámicas) para que Tailwind las incluya en el build
export const CATEGORY_BAR = {
  Alimentación: 'bg-emerald-500',
  Transporte: 'bg-indigo-500',
  Vivienda: 'bg-sky-500',
  Salud: 'bg-rose-500',
  Educación: 'bg-violet-500',
  Ocio: 'bg-amber-500',
  Otros: 'bg-slate-400',
};

export const GOAL_ICONS = { Target, Plane, Home, Car, GraduationCap, Laptop, HeartPulse, Gift, Umbrella, PiggyBank };

export const GOAL_COLORS = {
  emerald: { bar: 'bg-emerald-500', soft: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  indigo: { bar: 'bg-indigo-500', soft: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-500' },
  sky: { bar: 'bg-sky-500', soft: 'bg-sky-100 text-sky-700', dot: 'bg-sky-500' },
  amber: { bar: 'bg-amber-500', soft: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  rose: { bar: 'bg-rose-500', soft: 'bg-rose-100 text-rose-700', dot: 'bg-rose-500' },
  violet: { bar: 'bg-violet-500', soft: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500' },
};
