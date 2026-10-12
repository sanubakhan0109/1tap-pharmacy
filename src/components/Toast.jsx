import { createPortal } from 'react-dom';
import { useToast } from '../context/ToastContext';
import { CheckCircle, X, AlertCircle } from 'lucide-react';

export default function Toast() {
  const { toast, hideToast } = useToast();

  if (!toast) return null;
  if (typeof document === 'undefined') return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className="toast-container"
    >
      <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/95 text-white shadow-2xl backdrop-blur-md border border-slate-800 animate-in fade-in slide-in-from-top-4 duration-300 w-full">
        {isSuccess ? (
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
        ) : isError ? (
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
        ) : (
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
        )}
        <div className="flex-1 text-sm font-medium text-slate-100">
          {toast.message}
        </div>
        <button
          onClick={hideToast}
          aria-label="Close notification"
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>,
    document.body
  );
}
