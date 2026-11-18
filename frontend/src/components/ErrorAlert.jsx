import { AlertCircle } from 'lucide-react';

export default function ErrorAlert({ message, onRetry }) {
  if (!message) return null;
  return (
    <div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p className="flex-1">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="font-semibold underline underline-offset-2 hover:text-rose-950">
          Reintentar
        </button>
      )}
    </div>
  );
}
