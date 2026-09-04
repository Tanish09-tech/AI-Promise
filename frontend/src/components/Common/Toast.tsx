import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const styles = {
    success: 'bg-[#0f172a] border-emerald-500/40 text-white shadow-2xl shadow-emerald-950/40',
    warning: 'bg-[#0f172a] border-amber-500/40 text-white shadow-2xl shadow-amber-950/40',
    error: 'bg-[#0f172a] border-rose-500/40 text-white shadow-2xl shadow-rose-950/40',
    info: 'bg-[#0f172a] border-indigo-500/40 text-white shadow-2xl shadow-indigo-950/40'
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />,
    error: <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-400 shrink-0" />
  };

  return (
    <div
      className={`pointer-events-auto p-4 rounded-xl border backdrop-blur-md shadow-lg flex items-start justify-between gap-3 transition-all duration-300 animate-slide-up ${styles[toast.type]}`}
    >
      <div className="flex items-start gap-3">
        {icons[toast.type]}
        <div>
          <h4 className="text-xs font-bold font-mono text-white">{toast.title}</h4>
          <p className="text-xs mt-0.5 text-slate-300 leading-snug font-medium">{toast.message}</p>
        </div>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
